'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminPageHeader, StatusToasts, useUnsavedChangesWarning } from '@/components/admin/form-kit'
import { useConfirm } from '@/components/admin/use-confirm'
import { FormFieldsTab } from '@/components/admin/bookings/form-fields-tab'
import { LinksTab, type NewLink } from '@/components/admin/bookings/links-tab'
import { SubmissionsTab } from '@/components/admin/bookings/submissions-tab'
import {
  createAdminBookingFormLink,
  deactivateAdminBookingFormLink,
  deleteAdminBookingFormLink,
  deleteAdminBookingSubmission,
  downloadAdminBookingPdf,
  getAdminBookingFormLinks,
  getAdminBookingSubmissions,
  getBookingFormTemplate,
  getTreks,
  markAdminBookingRead,
  markAdminBookingUnread,
  resetBookingFormTemplate,
  saveBookingFormTemplate,
  type AdminBookingFormLink,
  type AdminBookingSubmission,
} from '@/lib/api'
import { defaultBookingFormConfig, normalizeBookingFormConfig, type BookingFormConfig } from '@/lib/booking-form-config'
import { linkState } from '@/lib/booking-submission-view'
import { getAdminToken } from '@/lib/admin-auth'

const standardConfig = () => normalizeBookingFormConfig(defaultBookingFormConfig)
const tabLabel = 'px-1 text-xs sm:px-3 sm:text-sm'
const messageFrom = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

export default function AdminBookingsPage() {
  const [tab, setTab] = useState('submissions')
  const [items, setItems] = useState<AdminBookingSubmission[]>([])
  const [links, setLinks] = useState<AdminBookingFormLink[]>([])
  const [trekNames, setTrekNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [formConfig, setFormConfig] = useState<BookingFormConfig>(standardConfig)
  const [savedConfig, setSavedConfig] = useState<BookingFormConfig>(standardConfig)
  const [hasSavedTemplate, setHasSavedTemplate] = useState(false)
  const [savingFields, setSavingFields] = useState(false)
  const [askConfirm, confirmDialog] = useConfirm()

  const token = getAdminToken()

  const refresh = async () => {
    if (!token) {
      setError('Your session has ended. Please log in again.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const [submissionData, linkData] = await Promise.all([getAdminBookingSubmissions(token), getAdminBookingFormLinks(token)])
      setItems(submissionData)
      setLinks(linkData)
    } catch (err) {
      setError(messageFrom(err, "Bookings couldn't be loaded."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    void getTreks().then((treks) => setTrekNames(treks.map((trek) => trek.title)))
    if (token) {
      void getBookingFormTemplate(token)
        .then((template) => {
          if (!template) return
          const config = normalizeBookingFormConfig(template)
          setFormConfig(config)
          setSavedConfig(config)
          setHasSavedTemplate(true)
        })
        .catch((err) => setError(messageFrom(err, "The saved form fields couldn't be loaded.")))
    }
    if (window.location.hash === '#links') setTab('links')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unreadCount = items.filter((item) => !item.isRead).length
  const activeLinkCount = links.filter((link) => linkState(link) === 'active').length

  const fieldsDirty = JSON.stringify(formConfig) !== JSON.stringify(savedConfig)
  useUnsavedChangesWarning(fieldsDirty)

  const saveFields = async () => {
    if (!token) return false
    setSavingFields(true)
    setError('')
    try {
      await saveBookingFormTemplate(token, formConfig)
      setSavedConfig(formConfig)
      setHasSavedTemplate(true)
      setNotice('Form saved.')
      return true
    } catch (err) {
      setError(messageFrom(err, "The form couldn't be saved."))
      return false
    } finally {
      setSavingFields(false)
    }
  }

  const resetFields = async () => {
    if (!token) return
    if (!(await askConfirm({ title: 'Go back to the standard form?', description: 'Your saved questions will be replaced for all admins. Links already sent are not affected.', confirmLabel: 'Use standard form' }))) return
    try {
      await resetBookingFormTemplate(token)
      setFormConfig(standardConfig())
      setSavedConfig(standardConfig())
      setHasSavedTemplate(false)
      setNotice('Back to the standard form.')
    } catch (err) {
      setError(messageFrom(err, "The form couldn't be reset."))
    }
  }

  const createLink = async (link: NewLink) => {
    if (!token) return null
    setError('')
    if (fieldsDirty && !(await saveFields())) return null
    try {
      const created = await createAdminBookingFormLink(token, { ...link, formConfig })
      setLinks((prev) => [created, ...prev])
      return `${window.location.origin}${created.path || `/private-booking/${created.token}`}`
    } catch (err) {
      setError(messageFrom(err, "The link couldn't be created."))
      return null
    }
  }

  const turnOffLink = async (link: AdminBookingFormLink) => {
    if (!token) return
    if (!(await askConfirm({ title: `Turn off the link for ${link.clientName || 'this client'}?`, description: "They won't be able to open the form any more. This can't be undone, but you can create a new link.", confirmLabel: 'Turn off' }))) return
    try {
      const updated = await deactivateAdminBookingFormLink(token, link._id)
      setLinks((prev) => prev.map((item) => (item._id === updated._id ? updated : item)))
      setNotice('Link turned off.')
    } catch (err) {
      setError(messageFrom(err, "The link couldn't be turned off."))
    }
  }

  const deleteLink = async (link: AdminBookingFormLink) => {
    if (!token) return
    if (!(await askConfirm({ title: `Delete the link for ${link.clientName || 'this client'}?`, description: 'The link stops working. Any booking form already submitted is kept.', confirmLabel: 'Delete' }))) return
    try {
      await deleteAdminBookingFormLink(token, link._id)
      setLinks((prev) => prev.filter((item) => item._id !== link._id))
      setNotice('Link deleted.')
    } catch (err) {
      setError(messageFrom(err, "The link couldn't be deleted."))
    }
  }

  const setRead = async (item: AdminBookingSubmission, isRead: boolean) => {
    if (!token) return
    setItems((prev) => prev.map((entry) => (entry._id === item._id ? { ...entry, isRead } : entry)))
    try {
      const updated = isRead ? await markAdminBookingRead(token, item._id) : await markAdminBookingUnread(token, item._id)
      setItems((prev) => prev.map((entry) => (entry._id === updated._id ? updated : entry)))
    } catch (err) {
      setItems((prev) => prev.map((entry) => (entry._id === item._id ? { ...entry, isRead: item.isRead } : entry)))
      setError(messageFrom(err, "The booking couldn't be updated."))
    }
  }

  const deleteSubmission = async (item: AdminBookingSubmission) => {
    if (!token) return
    if (!(await askConfirm({ title: `Delete the booking from ${item.firstName} ${item.lastName}?`, description: "The booking form and its PDF are removed permanently. This can't be undone.", confirmLabel: 'Delete' }))) return
    try {
      await deleteAdminBookingSubmission(token, item._id)
      setItems((prev) => prev.filter((entry) => entry._id !== item._id))
      setNotice('Booking deleted.')
    } catch (err) {
      setError(messageFrom(err, "The booking couldn't be deleted."))
    }
  }

  const downloadPdf = async (item: AdminBookingSubmission) => {
    if (!token) return
    setDownloadingId(item._id)
    setError('')
    try {
      const blob = await downloadAdminBookingPdf(token, item._id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = item.pdfFilename || `booking-form-${item._id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(messageFrom(err, "The PDF couldn't be downloaded."))
    } finally {
      setDownloadingId(null)
    }
  }

  const count = (value: number) =>
    value > 0 ? <span className="ml-1 rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">{value}</span> : null

  return (
    <>
      <StatusToasts error={error} message={notice} />
      {confirmDialog}
      <AdminPageHeader className="mb-6" title="Bookings" description="Read submitted booking forms and send clients their own private form." />
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="submissions" className={tabLabel}>Submissions{count(unreadCount)}</TabsTrigger>
          <TabsTrigger value="links" className={tabLabel}>Private links{count(activeLinkCount)}</TabsTrigger>
          <TabsTrigger value="fields" className={tabLabel}>Form fields</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <SubmissionsTab
            items={items}
            links={links}
            token={token}
            loading={loading}
            downloadingId={downloadingId}
            onRefresh={() => void refresh()}
            onDownload={(item) => void downloadPdf(item)}
            onSetRead={(item, isRead) => void setRead(item, isRead)}
            onDelete={(item) => void deleteSubmission(item)}
          />
        </TabsContent>

        <TabsContent value="links">
          <LinksTab
            links={links}
            trekNames={trekNames}
            customizedFields={hasSavedTemplate || fieldsDirty}
            onEditFields={() => setTab('fields')}
            onCreate={createLink}
            onTurnOff={(link) => void turnOffLink(link)}
            onDelete={(link) => void deleteLink(link)}
          />
        </TabsContent>

        <TabsContent value="fields">
          <FormFieldsTab
            config={formConfig}
            dirty={fieldsDirty}
            saving={savingFields}
            onChange={setFormConfig}
            onSave={() => void saveFields()}
            onDiscard={() => setFormConfig(savedConfig)}
            onReset={() => void resetFields()}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}
