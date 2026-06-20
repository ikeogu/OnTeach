import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { uploadsApi } from '../../api/uploads'
import type { Upload } from '../../api/types'

export default function UploadContent() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const navigate = useNavigate()

  const [contentUpload, setContentUpload] = useState<Upload | null>(null)
  const [knowledgeUpload, setKnowledgeUpload] = useState<Upload | null>(null)
  const [knowledgeUrls, setKnowledgeUrls] = useState<Upload[]>([])
  const [knowledgeMode, setKnowledgeMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState('')
  const [error, setError] = useState('')

  const contentInputRef = useRef<HTMLInputElement>(null)
  const knowledgeInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: 'content' | 'knowledge' }) =>
      uploadsApi.upload(sessionId, file, kind),
    onSuccess: (upload) => {
      if (upload.kind === 'content') setContentUpload(upload)
      else setKnowledgeUpload(upload)
      setError('')
    },
    onError: () => setError('Upload failed. Please try again.'),
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

  const handleFileSelect = (file: File, kind: 'content' | 'knowledge') => {
    uploadMutation.mutate({ file, kind })
  }

  const handleDrop = (e: React.DragEvent, kind: 'content' | 'knowledge') => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file, kind)
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

  const removeUrl = (id: number) => {
    setKnowledgeUrls((prev) => prev.filter((u) => u.id !== id))
  }

  const canGenerate = !!contentUpload

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

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload your content</h1>
          <p className="text-gray-500 text-sm mb-7">
            We'll use this to generate your session script. Don't worry, you can edit it before finalizing.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Content upload — file only */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-800">Content</label>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">REQUIRED</span>
            </div>
            <DropZone
              upload={contentUpload}
              isUploading={uploadMutation.isPending && !contentUpload}
              accept=".pdf,.pptx,.ppt,.docx,.doc,.txt"
              hint="PDF, PPTX or DOC · up to 50 MB"
              icon={<UploadCloudIcon />}
              inputRef={contentInputRef}
              onFileSelect={(f) => handleFileSelect(f, 'content')}
              onDrop={(e) => handleDrop(e, 'content')}
              onClick={() => contentInputRef.current?.click()}
            />
          </div>

          {/* Knowledge — file or URL */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800">Additional Knowledge</label>
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">OPTIONAL</span>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-3">
              <button
                onClick={() => setKnowledgeMode('file')}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-md transition-colors ${
                  knowledgeMode === 'file'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 1h6l4 4v10H4V1z" />
                  <path strokeLinecap="round" d="M9 1v4h4" />
                </svg>
                Upload File
              </button>
              <button
                onClick={() => setKnowledgeMode('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-md transition-colors ${
                  knowledgeMode === 'url'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a3 3 0 0 0 3 3h3a3 3 0 1 0 0-6H9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 8a3 3 0 0 0-3-3H4a3 3 0 1 0 0 6h3" />
                </svg>
                Paste URL
              </button>
            </div>

            {/* File mode */}
            {knowledgeMode === 'file' && (
              <DropZone
                upload={knowledgeUpload}
                isUploading={uploadMutation.isPending && !!contentUpload && !knowledgeUpload}
                accept=".pdf,.txt,.docx,.doc"
                hint="PDF, DOCX or TXT"
                icon={<DocumentPlusIcon />}
                inputRef={knowledgeInputRef}
                onFileSelect={(f) => handleFileSelect(f, 'knowledge')}
                onDrop={(e) => handleDrop(e, 'knowledge')}
                onClick={() => knowledgeInputRef.current?.click()}
              />
            )}

            {/* URL mode */}
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
                    {urlMutation.isPending ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" d="M8 3v10M3 8h10" />
                      </svg>
                    )}
                    Add
                  </button>
                </div>

                {urlError && (
                  <p className="text-red-500 text-xs mt-1.5">{urlError}</p>
                )}

                {/* Added URLs list */}
                {knowledgeUrls.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {knowledgeUrls.map((u) => (
                      <div key={u.id} className="flex items-center gap-2 px-3 py-2 bg-primary-light border border-primary/20 rounded-lg">
                        <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a3 3 0 0 0 3 3h3a3 3 0 1 0 0-6H9" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 8a3 3 0 0 0-3-3H4a3 3 0 1 0 0 6h3" />
                        </svg>
                        <span className="flex-1 text-xs text-primary font-medium truncate min-w-0">{u.original_name}</span>
                        <button
                          onClick={() => removeUrl(u.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" d="M4 4l8 8M12 4l-8 8" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {knowledgeUrls.length === 0 && (
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M10 3L6 8l4 5" />
              </svg>
              Back
            </button>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={!canGenerate || generateMutation.isPending}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
            >
              {generateMutation.isPending ? 'Starting…' : 'Generate Script'}
              {!generateMutation.isPending && <span className="text-base">✦</span>}
            </button>
          </div>
        </div>
      </div>
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
}

function DropZone({ upload, isUploading, accept, hint, icon, inputRef, onFileSelect, onDrop, onClick }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  if (upload) {
    return (
      <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4 4L15 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{upload.original_name}</p>
          <p className="text-xs text-gray-400">{upload.size > 0 ? `${(upload.size / 1024).toFixed(0)} KB` : 'Uploaded'}</p>
        </div>
        <button
          onClick={() => onFileSelect(null as any)}
          className="text-xs text-gray-400 hover:text-gray-600"
          title="Remove"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
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

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  )
}
