'use client'

import { useState } from 'react'
import { MapPin, Copy, ExternalLink, Info } from 'lucide-react'
import { LocationResult, getConfidenceLevel, formatCoordinates, calculateRadius, generateShareableUrl } from '@/lib/utils'
import { Map } from './Map'

interface ResultDisplayProps {
  result: LocationResult
  className?: string
}

export function ResultDisplay({ result, className = '' }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      const url = generateShareableUrl(result)
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const confidenceLevel = result.type === 'ESTIMATE' && result.confidence 
    ? getConfidenceLevel(result.confidence)
    : null

  const radius = calculateRadius(result)

  // Check if we have valid coordinates
  const hasValidCoordinates = result.lat !== 0 || result.lng !== 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Map */}
      {hasValidCoordinates ? (
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Map
          </h2>
          <Map result={result} className="h-96" />
        </div>
      ) : (
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Detection
          </h2>
          <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No Location Data Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This image doesn't contain GPS location data. To get accurate results:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Take photos with your phone's camera (not screenshots)</li>
                <li>• Ensure location services are enabled</li>
                <li>• Take photos outdoors where GPS signal is strong</li>
                <li>• Check your camera app's location permissions</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Location Details */}
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Location Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Type
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.type === 'EXIF' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {result.type === 'EXIF' ? 'Exact Location' : 'Estimated Location'}
                </span>
                {confidenceLevel && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${confidenceLevel.color} bg-opacity-20`}>
                    {confidenceLevel.label} Confidence
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Coordinates
              </label>
              <p className="text-lg font-mono text-gray-800 dark:text-gray-200">
                {formatCoordinates(result.lat, result.lng)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {result.type === 'EXIF' ? 'Accuracy' : 'Estimated Radius'}
              </label>
              <p className="text-lg text-gray-800 dark:text-gray-200">
                {radius < 1000 
                  ? `${Math.round(radius)} meters`
                  : `${(radius / 1000).toFixed(1)} km`
                }
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {result.type === 'ESTIMATE' && result.confidence && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Confidence Level
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        confidenceLevel?.color === 'text-green-500' ? 'bg-green-500' :
                        confidenceLevel?.color === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
                {confidenceLevel && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {confidenceLevel.description}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Source
              </label>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {result.source}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              
              <a
                href={`https://www.google.com/maps?q=${result.lat},${result.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* EXIF Data */}
      {result.type === 'EXIF' && result.exif && (
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            EXIF GPS Data
          </h2>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(result.exif, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
