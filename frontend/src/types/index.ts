export interface LocationResult {
  type: 'EXIF' | 'ESTIMATE'
  lat: number
  lng: number
  accuracy?: number
  confidence?: number
  source: string
  exif?: Record<string, any>
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface ApiError {
  error: string
  details?: any
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  details?: any
}

export interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: number
}

export interface ConfidenceLevel {
  label: string
  color: string
  description: string
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}
