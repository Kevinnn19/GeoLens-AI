'use client'

import { useState, useEffect } from 'react'
import { Upload, Settings, MapPin, Sparkles } from 'lucide-react'
import { UploadZone } from '@/components/UploadZone'
import { ProgressBar } from '@/components/ProgressBar'
import { ResultDisplay } from '@/components/ResultDisplay'
import { ApiTokenModal } from '@/components/ApiTokenModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { apiClient, getStoredToken, setStoredToken } from '@/lib/api'
import { LocationResult, UploadProgress } from '@/types'
import { initializeTheme } from '@/lib/theme'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [result, setResult] = useState<LocationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    // Initialize theme
    initializeTheme()
    
    // Check for stored token
    const token = getStoredToken()
    if (token) {
      apiClient.setToken(token)
      setHasToken(true)
    }
  }, [])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setResult(null)
    setError(null)
  }

  const handleUpload = async () => {
    if (!selectedFile || !hasToken) {
      if (!hasToken) {
        setShowTokenModal(true)
      }
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(null)

    try {
      const result = await apiClient.uploadImage(selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      setResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  const handleTokenSet = (token: string) => {
    if (token) {
      apiClient.setToken(token)
      setHasToken(true)
    } else {
      apiClient.setToken('')
      setHasToken(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    setError(null)
    setUploadProgress(null)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500 rounded-xl">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">
            GeoLens AI
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {!hasToken && (
            <button
              onClick={() => setShowTokenModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              Set API Token
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          {!result && (
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Location Detection
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Find Location from
                <span className="block text-gradient">Any Photo</span>
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Upload a photo and discover its location using EXIF GPS data or our advanced AI estimation technology.
              </p>
            </div>
          )}

          {/* Upload Section */}
          {!result && (
            <div className="glass-card rounded-2xl p-8 mb-8">
              <div className="mb-6">
                <UploadZone
                  onFileSelect={handleFileSelect}
                  disabled={isUploading}
                />
              </div>

              {selectedFile && (
                <div className="space-y-6">
                  {isUploading && uploadProgress && (
                    <div className="glass-card rounded-xl p-6">
                      <ProgressBar progress={uploadProgress} />
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {!isUploading && (
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={handleUpload}
                        className="btn-primary flex items-center gap-2"
                        disabled={!selectedFile || !hasToken}
                      >
                        <Upload className="w-5 h-5" />
                        {!hasToken ? 'Set API Token First' : 'Analyze Location'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-8">
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="btn-secondary"
                >
                  Upload Another Photo
                </button>
              </div>
              
              <ResultDisplay result={result} />
            </div>
          )}

          {/* Features Section */}
          {!result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  EXIF GPS Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Extract precise location data from photos with embedded GPS coordinates.
                </p>
              </div>

              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  AI Estimation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  When GPS data isn't available, our AI provides intelligent location estimates.
                </p>
              </div>

              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Easy Upload
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Simply drag and drop or select your photo to get started instantly.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* API Token Modal */}
      <ApiTokenModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onTokenSet={handleTokenSet}
      />
    </div>
  )
}
