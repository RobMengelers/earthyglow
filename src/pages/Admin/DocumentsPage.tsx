import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  deleteAdminDocument,
  downloadAdminDocument,
  fetchAdminDocuments,
  formatDateTime,
  uploadAdminDocuments,
  type AdminCompanyDocument,
} from '../../admin/api'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
const MAX_BATCH_BYTES = 25 * 1024 * 1024

export function meta() {
  return siteMeta({ title: 'Documents · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  }
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`
}

function documentKind(document: AdminCompanyDocument): string {
  const extension = document.name.split('.').pop()
  if (extension && extension !== document.name && extension.length <= 6) {
    return extension.toUpperCase()
  }
  return (document.mime.split('/').pop() ?? 'file').toUpperCase()
}

export default function DocumentsPage() {
  const { token } = useAdmin()
  const fileInput = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<AdminCompanyDocument[] | null>(null)
  const [usedBytes, setUsedBytes] = useState(0)
  const [limitBytes, setLimitBytes] = useState(250 * 1024 * 1024)
  const [selected, setSelected] = useState<File[]>([])
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [flash, setFlash] = useState<{ tone: 'success' | 'error'; text: string } | undefined>(undefined)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchAdminDocuments(token)
      .then((data) => {
        if (cancelled) return
        setLoadError('')
        setDocuments(data.documents)
        setUsedBytes(data.usedBytes)
        setLimitBytes(data.limitBytes)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Could not load documents')
      })
    return () => { cancelled = true }
  }, [token, reloadKey])

  function addFiles(files: FileList | null) {
    const next = Array.from(files ?? [])
    setSelected((current) => [...current, ...next])
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault()
    if (!token || selected.length === 0) return
    setFlash(undefined)

    if (selected.some((file) => file.size === 0)) {
      setFlash({ tone: 'error', text: 'Empty files cannot be uploaded.' })
      return
    }
    if (selected.some((file) => file.size > MAX_DOCUMENT_BYTES)) {
      setFlash({ tone: 'error', text: 'Each document must be 10 MB or less.' })
      return
    }
    if (selected.reduce((sum, file) => sum + file.size, 0) > MAX_BATCH_BYTES) {
      setFlash({ tone: 'error', text: 'Upload up to 25 MB total at a time.' })
      return
    }

    setUploading(true)
    try {
      const data = await uploadAdminDocuments(token, selected)
      setDocuments(data.documents)
      setUsedBytes(data.usedBytes)
      setLimitBytes(data.limitBytes)
      setSelected([])
      if (fileInput.current) fileInput.current.value = ''
      setFlash({
        tone: 'success',
        text: `${selected.length} document${selected.length === 1 ? '' : 's'} uploaded.`,
      })
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not upload the documents',
      })
    } finally {
      setUploading(false)
    }
  }

  async function removeDocument(document: AdminCompanyDocument) {
    if (!token) return
    if (!window.confirm(`Delete "${document.name}"?`)) return
    try {
      await deleteAdminDocument(token, document.id)
      setDocuments((current) => (current ?? []).filter((item) => item.id !== document.id))
      setUsedBytes((current) => Math.max(0, current - document.storedBytes))
      setFlash({ tone: 'success', text: `"${document.name}" deleted.` })
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not delete the document',
      })
    }
  }

  async function download(document: AdminCompanyDocument) {
    if (!token) return
    try {
      await downloadAdminDocument(token, document)
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not download the document',
      })
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Documents</h1>
          <p className="admin-page-sub">
            Company paperwork in one place — registrations, insurance, contracts
            and anything else worth keeping close. Files are compressed before
            they are stored.
          </p>
        </div>
      </header>

      {loadError !== '' && (
        <p className="form-note is-error">
          {loadError}{' '}
          <button
            type="button"
            className="admin-link-button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </p>
      )}

      {flash && (
        <p className={`admin-flash is-${flash.tone}`} role="status">
          <span>{flash.text}</span>
          <button type="button" onClick={() => setFlash(undefined)} aria-label="Dismiss">
            ×
          </button>
        </p>
      )}

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>Add documents</h2>
          <span className="admin-muted">
            {formatBytes(usedBytes)} of {formatBytes(limitBytes)} stored
          </span>
        </header>
        <form className="admin-form" onSubmit={handleUpload}>
          <label>
            <span>Files</span>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.doc,.docx,.xls,.xlsx,.csv,.txt"
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ''
              }}
            />
            <small className="admin-form-hint">
              Up to 20 files, 10 MB each and 25 MB total. Compression is applied
              automatically when it saves space.
            </small>
          </label>

          {selected.length > 0 && (
            <ul className="admin-document-upload-list">
              {selected.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  <span>
                    {file.name} <small>{formatBytes(file.size)}</small>
                  </span>
                  <button
                    type="button"
                    className="admin-doc-link"
                    disabled={uploading}
                    onClick={() => setSelected((current) => current.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="admin-form-actions">
            <LoadingButton
              type="submit"
              className="btn btn-primary"
              loading={uploading}
              disabled={selected.length === 0}
            >
              Upload documents
            </LoadingButton>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>Company documents</h2>
          {documents !== null && (
            <span className="admin-muted">
              {documents.length} file{documents.length === 1 ? '' : 's'}
            </span>
          )}
        </header>

        <div className="admin-table-wrap">
          <table className="admin-table admin-documents-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {documents === null ? (
                <tr>
                  <td colSpan={5}>
                    <p className="admin-note">
                      {loadError === '' ? 'Loading documents…' : 'Could not load documents.'}
                    </p>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <p className="admin-empty-inline">
                      No company documents yet. Upload the first one above.
                    </p>
                  </td>
                </tr>
              ) : (
                documents.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <button
                        type="button"
                        className="admin-doc-link"
                        onClick={() => void download(document)}
                        title={document.name}
                      >
                        {document.name}
                      </button>
                    </td>
                    <td>{documentKind(document)}</td>
                    <td>
                      {formatBytes(document.sizeBytes)}
                      {document.compressed && (
                        <small className="admin-muted">
                          {' '}· {formatBytes(document.storedBytes)} stored
                        </small>
                      )}
                    </td>
                    <td>
                      <time dateTime={document.createdAt}>
                        {formatDateTime(document.createdAt)}
                      </time>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-row-action is-quiet"
                          onClick={() => void download(document)}
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          className="admin-row-action is-quiet"
                          onClick={() => void removeDocument(document)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
