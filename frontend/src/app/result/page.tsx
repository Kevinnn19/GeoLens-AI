'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ResultDisplay } from '@/components/ResultDisplay'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { parseShareableUrl } from '@/lib/utils'
import { LocationResult } from '@/types'
import { initializeTheme } from '@/lib/theme'

export default function ResultPage() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<LocationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeTheme()
    
    try {
      const parsedResult = parseShareableUrl(searchParams)
      if (parsedResult) {
        setResult(parsedResult as LocationResult)
      } else {
        setError('Invalid or missing location data in URL')
      }
    } catch (err) {
      setError('Failed to parse location data')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Upload
        </Link>
        
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {error ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Error Loading Location
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <Link
                href="/"
                className="btn-primary inline-flex items-center gap-2"
              >
                Upload a New Photo
              </Link>
            </div>
          ) : result ? (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Location Found
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {result.type === 'EXIF' ? 'Exact location from GPS data' : 'AI-estimated location'}
                </p>
              </div>
              
              <ResultDisplay result={result} />
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading location data...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
