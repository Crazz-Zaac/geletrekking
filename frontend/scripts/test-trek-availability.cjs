const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const modulePath = path.resolve(__dirname, '../lib/trek-availability.ts')
const compiled = ts.transpileModule(fs.readFileSync(modulePath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const availabilityModule = { exports: {} }
new Function('module', 'exports', compiled)(availabilityModule, availabilityModule.exports)
const { getCalendarRanges, getAvailabilityYears, getMonthDays, getRangesForDate, parseCalendarDate, getDepartureRanges, getMonthDepartures, getDepartureStatus } = availabilityModule.exports

// The 15 EBC trip ranges supplied by the site owner.
const ebcRanges = [
  ['2027-01-17', '2027-01-31'],
  ['2027-02-21', '2027-03-07'],
  ['2027-03-07', '2027-03-21'],
  ['2027-03-21', '2027-04-04'],
  ['2027-04-04', '2027-04-18'],
  ['2027-04-15', '2027-04-29'],
  ['2027-04-25', '2027-05-09'],
  ['2027-05-02', '2027-05-16'],
  ['2027-05-16', '2027-05-30'],
  ['2027-09-12', '2027-09-26'],
  ['2027-09-26', '2027-10-10'],
  ['2027-10-03', '2027-10-17'],
  ['2027-10-14', '2027-10-28'],
  ['2027-10-17', '2027-10-31'],
  ['2027-11-07', '2027-11-21'],
].map(([startDate, endDate]) => ({ startDate, endDate, status: 'available' }))

test('all 15 EBC ranges are included, with inclusive boundaries and no summer availability', () => {
  const ranges = getCalendarRanges(ebcRanges)
  assert.equal(ranges.length, 15)
  assert.deepEqual(getAvailabilityYears(ranges), [2027])
  for (const { startDate, endDate } of ranges) {
    assert.ok(getRangesForDate(startDate, ranges).length > 0)
    assert.ok(getRangesForDate(endDate, ranges).length > 0)
  }
  const monthlyCounts = Array.from({ length: 12 }, (_, month) =>
    getMonthDays(2027, month).filter((date) => date && getRangesForDate(date, ranges).length > 0).length
  )
  assert.deepEqual(monthlyCounts, [15, 8, 31, 30, 30, 0, 0, 0, 19, 31, 15, 0])
  assert.equal(monthlyCounts.reduce((sum, count) => sum + count, 0), 179)
  for (const date of ['2027-01-16', '2027-05-31', '2027-09-11', '2027-11-22']) {
    assert.deepEqual(getRangesForDate(date, ranges), [])
  }
  assert.equal(getRangesForDate('2027-04-15', ranges).length, 2)
})

test('cross-year ranges mark both years and all intervening years', () => {
  const ranges = getCalendarRanges([{ startDate: '2027-12-30', endDate: '2029-01-02' }])
  assert.deepEqual(getAvailabilityYears(ranges), [2027, 2028, 2029])
  assert.ok(getRangesForDate('2028-02-29', ranges).length)
  assert.deepEqual(getRangesForDate('2029-01-03', ranges), [])
})

test('month grids have correct weekday placement, leap days, and padding', () => {
  const january = getMonthDays(2027, 0)
  assert.equal(january.length, 42)
  assert.equal(january[5], '2027-01-01')
  assert.equal(january.filter(Boolean).length, 31)
  assert.equal(getMonthDays(2028, 1).filter(Boolean).length, 29)
  assert.equal(getMonthDays(2027, 1).filter(Boolean).length, 28)
})

test('booked, limited, invalid and reversed ranges cannot acquire available ticks', () => {
  const valid = { startDate: '2027-01-01', endDate: '2027-01-02' }
  assert.equal(getCalendarRanges([
    valid,
    { ...valid, status: 'booked' },
    { ...valid, status: 'limited' },
    { startDate: '2027-02-29', endDate: '2027-03-01' },
    { startDate: 'invalid', endDate: '2027-03-01' },
    { startDate: '2027-03-02', endDate: '2027-03-01' },
  ]).length, 1)
  assert.equal(parseCalendarDate('2027-02-29'), null)
  assert.equal(parseCalendarDate('2027-01-01T00:00:00Z'), null)
  assert.deepEqual(getCalendarRanges([]), [])
  assert.deepEqual(getAvailabilityYears([]), [])
})

function renderCalendar(ranges) {
  const componentPath = path.resolve(__dirname, '../components/trek-availability-calendar.tsx')
  const code = ts.transpileModule(fs.readFileSync(componentPath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText
  const componentModule = { exports: {} }
  new Function('module', 'exports', 'require', code)(componentModule, componentModule.exports,
    (name) => name === '@/lib/trek-availability' ? availabilityModule.exports : name.endsWith('.module.css') ? { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) } : require(name))
  return require('react-dom/server').renderToStaticMarkup(
    require('react').createElement(componentModule.exports.TrekAvailabilityCalendar, { ranges })
  )
}

test('sidebar EBC calendar has 12 months and ticks every available backend date without expandable month lists', () => {
  const html = renderCalendar(ebcRanges)
  assert.equal((html.match(/data-month=/g) || []).length, 12)
  assert.ok(html.includes('January 2027: Open'))
  assert.ok(html.includes('December 2027: No trips'))
  assert.equal((html.match(/data-available-date=/g) || []).length, 179)
  assert.ok(html.includes('data-available-date="2027-01-18"'))
  assert.ok(!html.includes('aria-expanded'))
  assert.equal((html.match(/<button/g) || []).length, 2)
  assert.ok(!html.includes('departureList'))
  assert.ok(html.includes('Jan 17, 2027 – Jan 31, 2027'))
  assert.ok(html.includes('Nov 7, 2027 – Nov 21, 2027'))
})

test('empty schedules still show 12 months and an honest contact prompt', () => {
  const html = renderCalendar([])
  assert.equal((html.match(/data-month=/g) || []).length, 12)
  assert.ok(html.includes('haven’t been published'))
  assert.ok(html.includes('Contact us to arrange your dates.'))
  assert.equal((html.match(/data-available-date=/g) || []).length, 0)
})

test('backend limited and booked departures retain their colours, labels, and notes', () => {
  const ranges = getDepartureRanges([
    { startDate: '2027-01-17', endDate: '2027-01-31', status: 'limited', note: 'Last spaces' },
    { startDate: '2027-02-21', endDate: '2027-03-07', status: 'booked' },
    { startDate: '2027-03-07', endDate: '2027-03-21', status: 'available' },
    { startDate: 'invalid', endDate: '2027-01-31', status: 'available' },
  ])
  assert.equal(ranges.length, 3)
  assert.equal(ranges[0].note, 'Last spaces')
  assert.equal(getDepartureStatus(getMonthDepartures(ranges, 2027, 0)), 'limited')
  assert.equal(getDepartureStatus(getMonthDepartures(ranges, 2027, 1)), 'booked')
  assert.equal(getDepartureStatus(getMonthDepartures(ranges, 2027, 2)), 'available')
  assert.equal(getDepartureStatus(getMonthDepartures(ranges, 2027, 3)), undefined)
  const html = renderCalendar(ranges)
  assert.ok(html.includes('January 2027: Few left'))
  assert.ok(html.includes('February 2027: Full'))
  assert.ok(html.includes('data-status="limited"'))
  assert.ok(html.includes('data-status="booked"'))
  assert.ok(!html.includes('data-available-date="2027-02-21"'))
  assert.ok(html.includes('Last spaces'))
  assert.equal(getMonthDays(2027, 0, 1)[4], '2027-01-01')
})

test('cross-year trips mark their start month and do not create a new departure in the return month', () => {
  const ranges = getDepartureRanges([{ startDate: '2027-12-30', endDate: '2028-01-04', status: 'available' }])
  assert.equal(getMonthDepartures(ranges, 2027, 11).length, 1)
  assert.equal(getMonthDepartures(ranges, 2028, 0).length, 0)
})
