const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const compiled = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../lib/trek-itinerary.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const mod = { exports: {} }
new Function('module', 'exports', compiled)(mod, mod.exports)
const { parseDistance, extractDayFacts, buildItineraryRows } = mod.exports

const day = (n, title, altitude, extra = {}) => ({ day: n, title, altitude, description: '', accommodation: title, ...extra })

test('distance labels drop emoji and the doubled "km"', () => {
  assert.deepEqual(parseDistance('🥾 Hike - 13.5 km'), { label: 'Hike 13.5 km', mode: 'hike' })
  assert.deepEqual(parseDistance('🥾 Hike - 6.4 km km'), { label: 'Hike 6.4 km', mode: 'hike' })
  assert.equal(parseDistance('✈️ Flight + 🥾 Hike - 143 km Flight &  6.4 km Hike km').label, 'Flight 143 km · Hike 6.4 km')
  assert.equal(parseDistance('🚗 Drive + 🥾 Hike - 20 km Drive  & 10.7 km Hike km').label, 'Drive 20 km · Hike 10.7 km')
  assert.equal(parseDistance('🥾 Hike + 🚗 Drive - 38 km').label, 'Hike + Drive 38 km')
  assert.equal(parseDistance('🥾 Hike + 🚗 Drive - 8+12 km').label, 'Hike + Drive 8+12 km')
  assert.deepEqual(parseDistance('12 km'), { label: '12 km' })
  assert.equal(parseDistance(''), null)
})

test('recognised bullets become facts and everything else stays in the text', () => {
  const { facts, walkingHours, body } = extractDayFacts(' A long day.\n•\tTrek for 6 to 7 hours\n•\tIncludes sharing a room, breakfast, lunch, and dinner\n•\tAscent of the day: 427 meters (1,400 feet)\n•\tBring a headtorch\n')
  assert.equal(walkingHours, '6–7 hrs')
  assert.deepEqual(facts.map((fact) => [fact.kind, fact.value]), [
    ['time', 'Trek for 6 to 7 hours'],
    ['included', 'Sharing a room, breakfast, lunch, and dinner'],
    ['ascent', '427 m (1,400 ft)'],
  ])
  assert.equal(body, 'A long day.\n• Bring a headtorch')
})

test('unusual bullet wording is kept rather than lost', () => {
  assert.equal(extractDayFacts('•\tTrek for 5 to 6 hours)').facts[0].value, 'Trek for 5 to 6 hours')
  assert.equal(extractDayFacts('•\tAscent of the day: Same Elevation').facts[0].value, 'Same elevation')
  assert.equal(extractDayFacts('•\tDescent:  610 metres (2,000 ft).').facts[0].value, '610 m (2,000 ft)')
  const mixed = extractDayFacts('•\tFlight for 25 to 30 minutes and trek for 3 to 4 hours')
  assert.equal(mixed.facts[0].value, 'Flight for 25 to 30 minutes and trek for 3 to 4 hours')
  assert.equal(mixed.walkingHours, undefined)
})

test('routes and acclimatisation days are derived from consecutive days', () => {
  const rows = buildItineraryRows([
    day(1, 'Kathmandu ', 1250), day(2, 'Namche', 3440), day(3, 'Namche', 3440),
    day(4, 'Lo-Manthang', 3840), day(5, 'Lo Manthang', 3840), day(6, 'Machermo', 4410), day(7, 'Machhermo', 4410),
    day(8, 'Kathmandu', 1250), day(9, 'Kathmandu', 1250),
  ])
  assert.equal(rows[0].route, 'Kathmandu')
  assert.equal(rows[1].route, 'Kathmandu → Namche')
  assert.equal(rows[2].route, 'Namche')
  assert.deepEqual(rows.filter((row) => row.isAcclimatisation).map((row) => row.day), [3, 5, 7])
  assert.equal(rows[8].route, 'Kathmandu')
})

test('a day with no altitude never counts as acclimatisation', () => {
  const rows = buildItineraryRows([day(1, 'Namche', undefined), day(2, 'Namche', undefined)])
  assert.equal(rows[1].isAcclimatisation, false)
})
