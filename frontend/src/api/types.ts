export interface Upload {
  id: number
  session_id: number
  kind: 'content' | 'knowledge'
  file_path: string
  original_name: string
  mime: string
  size: number
  ingested_at: string | null
  created_at: string
  updated_at: string
}
