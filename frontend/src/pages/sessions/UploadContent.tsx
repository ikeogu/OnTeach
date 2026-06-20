import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { uploadsApi } from '../../api/uploads'
import type { Upload } from '../../api/types'

export default function UploadContent() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const navigate = useNavigate()

  // Content section state
  const [contentMode, setContentMode] = useState<'file' | 'text'>('file')
  const [contentUpload, setContentUpload] = useState<Upload | null>(null)
  const [pastedText, setPastedText] = useState('')

  // Knowledge section state
  const [knowledgeMode, setKnowledgeMode] = useState<'file' | 'url'>('file')
  const [knowledgeUpload, setKnowledgeUpload] = useState<Upload | null>(null)
  const [knowledgeUrls, setKnowledgeUrls] = useState<Upload[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState('')

  const [error, setError] = useState('')

  const contentInputRef = useRef<HTMLInputElement>(null)
  const knowledgeInputRef = useRef<HTMLInputElement>(null)

  const uploadFileMutation = useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: 'content' | 'knowledge' }) =>
      uploadsApi.upload(sessionId, file, kind),
    onSuccess: (upload) => {
      if (upload.kind === 'content') setContentUpload(upload)
      else setKnowledgeUpload(upload)
      setError('')
    },
    onError: () => setError('File upload failed. Please try again.'),
  })

  const uploadTextMutation = useMutation({
    mutationFn: (text: string) => uploadsApi.uploadText(sessionId, text, 'content'),
    onSuccess: (upload) => {
      setContentUpload(upload)
      setError('')
    },
    onError: () => setError('Failed to save content. Please try again.'),
  })

  const urlMutation = useMutation({
    mutationFn: (url: string) => uploadsApi.uploadUrl(sessionId, url, 'knowledge'),
    onSuccess: (upload) => {
      setKnowledgeUrls((prev) => [...prev, upload])
      setUrlInput('')
      setUrlError('')
    },
    onError: () => setUrlError('Failed to add URL. Please check and try again.'),
  })

  const generateMutation = useMutation({
    mutationFn: () => uploadsApi.generate(sessionId),
    onSuccess: () => navigate(`/dashboard/sessions/${sessionId}/generating`),
    onError: () => setError('Failed to start script generation.'),
  })

  const handleDrop = (e: React.DragEvent, kind: 'content' | 'knowledge') => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) uploadFileMutation.mutate({ file, kind })
  }

  const handleAddUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (!/^https?:\/\/.+/.test(trimmed)) {
      setUrlError('Please enter a valid URL starting with http:// or https://')
      return
    }
    setUrlError('')
    urlMutation.mutate(trimmed)
  }

  const wordCount = pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0
  const canGenerate = !!contentUpload || (contentMode === 'text' && wordCount >= 10)
  const isContentPending = uploadFileMutation.isPending || uploadTextMutation.isPending

  const handleGenerateClick = () => {
    if (contentMode === 'text' && !contentUpload && pastedText.trim()) {
      uploadTextMutation.mutate(pastedText.trim(), {
        onSuccess: () => generateMutation.mutate(),
      })
    } else {
      generateMutation.mutate()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6">
        <span className="font-bold text-primary text-lg">Veologue</span>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Step 2 of 4</span>
            <span className="text-xs font-semibold text-primary">50% Complete</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-7 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '50%' }} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Add your content</h1>
          <p className="text-gray-500 text-sm mb-7">
            Upload a file or paste text directly — we'll use it to generate your session script.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* ── Content section ── */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800">Content</label>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">REQUIRED</span>
            </div>

            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-3">
              <TabButton
                active={contentMode === 'file'}
                onClick={() => { setContentMode('file'); setContentUpload(null) }}
                icon={<FileIcon />}
                label="Upload File"
              />
              <TabButton
                active={contentMode === 'text'}
                onClick={() => { setContentMode('text'); setContentUpload(null) }}
                icon={<TextIcon />}
                label="Paste Text"
              />
            </div>

            {contentMode === 'file' && (
              <DropZone
                upload={contentUpload}
                isUploading={uploadFileMutation.isPending}
                accept=".pdf,.pptx,.ppt,.docx,.doc,.txt"
                hint="PDF, PPTX, DOC or TXT · up to 50 MB"
                icon={<UploadCloudIcon />}
                inputRef={contentInputRef}
                onFileSelect={(f) => uploadFileMutation.mutate({ file: f, kind: 'content' })}
                onDrop={(e) => handleDrop(e, 'content')}
                onClick={() => contentInputRef.current?.click()}
                onRemove={() => setContentUpload(null)}
              />
            )}

            {contentMode === 'text' && (
              contentUpload ? (
                <SuccessBadge
                  label="Content saved"
                  sub={`${wordCount} words`}
                  onRemove={() => { setContentUpload(null); setPastedText('') }}
                />
              ) : (
                <div>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste or type your lesson content here — lecture notes, article text, course material…"
                    rows={8}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {wordCount > 0 ? `${wordCount} words` : 'Minimum 10 words'}
                    </span>
                    {uploadTextMutation.isPending && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        <SpinnerIcon size="sm" /> Saving…
                      </span>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* ── Knowledge section ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800">Additional Knowledge</label>
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">OPTIONAL</span>
            </div>

            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-3">
              <TabButton
                active={knowledgeMode === 'file'}
                onClick={() => setKnowledgeMode('file')}
                icon={<FileIcon />}
                label="Upload File"
              />
              <TabButton
                active={knowledgeMode === 'url'}
                onClick={() => setKnowledgeMode('url')}
                icon={<LinkIcon />}
                label="Paste URL"
              />
            </div>

            {knowledgeMode === 'file' && (
              <DropZone
                upload={knowledgeUpload}
                isUploading={uploadFileMutation.isPending && !!contentUpload && !knowledgeUpload}
                accept=".pdf,.txt,.docx,.doc"
                hint="PDF, DOCX or TXT"
                icon={<DocumentPlusIcon />}
                inputRef={knowledgeInputRef}
                onFileSelect={(f) => uploadFileMutation.mutate({ file: f, kind: 'knowledge' })}
                onDrop={(e) => handleDrop(e, 'knowledge')}
                onClick={() => knowledgeInputRef.current?.click()}
                onRemove={() => setKnowledgeUpload(null)}
              />
            )}

            {knowledgeMode === 'url' && (
              <div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => { setUrlInput(e.target.value); setUrlError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                    placeholder="https://example.com/reference"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder-gray-400 min-w-0"
                  />
                  <button
                    onClick={handleAddUrl}
                    disabled={urlMutation.isPending || !urlInput.trim()}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0"
                  >
                    {urlMutation.isPending ? <SpinnerIcon size="sm" /> : <PlusIcon />}
                    Add
                  </button>
                </div>

                {urlError && <p className="text-red-500 text-xs mt-1.5">{urlError}</p>}

                {knowledgeUrls.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {knowledgeUrls.map((u) => (
                      <div key={u.id} className="flex items-center gap-2 px-3 py-2 bg-primary-light border border-primary/20 rounded-lg">
                        <LinkIcon className="text-primary shrink-0" />
                        <span className="flex-1 text-xs text-primary font-medium truncate min-w-0">{u.original_name}</span>
                        <button
                          onClick={() => setKnowledgeUrls((prev) => prev.filter((x) => x.id !== u.id))}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <XIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">
                    Paste links to web pages, docs, or articles your AI tutor should know about.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/dashboard/sessions/new`)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              <ChevronLeftIcon /> Back
            </button>
            <button
              onClick={handleGenerateClick}
              disabled={!canGenerate || isContentPending || generateMutation.isPending}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
            >
              {(isContentPending || generateMutation.isPending) ? 'Starting…' : 'Generate Script'}
              {!isContentPending && !generateMutation.isPending && <span className="text-base">✦</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-md transition-colors ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function SuccessBadge({ label, sub, onRemove }: { label: string; sub: string; onRemove: () => void }) {
  return (
    <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4 4L15 7" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600">
        <XIcon />
      </button>
    </div>
  )
}

interface DropZoneProps {
  upload: Upload | null
  isUploading: boolean
  accept: string
  hint: string
  icon: React.ReactNode
  inputRef: React.RefObject<HTMLInputElement | null>
  onFileSelect: (f: File) => void
  onDrop: (e: React.DragEvent) => void
  onClick: () => void
  onRemove: () => void
}

function DropZone({ upload, isUploading, accept, hint, icon, inputRef, onFileSelect, onDrop, onClick, onRemove }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  if (upload) {
    return (
      <SuccessBadge
        label={upload.original_name}
        sub={upload.size > 0 ? `${(upload.size / 1024).toFixed(0)} KB` : 'Uploaded'}
        onRemove={onRemove}
      />
    )
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center cursor-pointer transition-colors ${
        isDragOver ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDrop(e) }}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
        {isUploading ? <SpinnerIcon /> : icon}
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">
        {isUploading ? 'Uploading…' : 'Click to upload or drag and drop'}
      </p>
      <p className="text-xs text-gray-400">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f) }}
      />
    </div>
  )
}

// ── Icons ───────────────────────────────────────────────────────────────────

function FileIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 1h6l4 4v10H4V1z" />
      <path strokeLinecap="round" d="M9 1v4h4" />
    </svg>
  )
}

function TextIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 4h12M2 8h8M2 12h10" />
    </svg>
  )
}

function LinkIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-3.5 h-3.5 ${className}`} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a3 3 0 0 0 3 3h3a3 3 0 1 0 0-6H9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 8a3 3 0 0 0-3-3H4a3 3 0 1 0 0 6h3" />
    </svg>
  )
}

function UploadCloudIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3M6.5 19A4.5 4.5 0 0 1 5 10.5a6 6 0 0 1 11.93-.5A4 4 0 0 1 19 18.5" />
    </svg>
  )
}

function DocumentPlusIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M8 3v10M3 8h10" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 4l8 8M12 4l-8 8" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M10 3L6 8l4 5" />
    </svg>
  )
}

function SpinnerIcon({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <svg className={`${cls} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  )
}
