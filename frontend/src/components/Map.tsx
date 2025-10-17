'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { LocationResult, calculateRadius } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapProps {
  result: LocationResult
  className?: string
}

export function Map({ result, className = '' }: MapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    setMapLoaded(true)
  }, [])

  // Create custom marker icon
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
  }

  const radius = calculateRadius(result)
  const markerColor = result.type === 'EXIF' ? '#10b981' : '#f59e0b'

  if (!mapLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[result.lat, result.lng]}
        zoom={15}
        className="w-full h-full rounded-xl"
        style={{ minHeight: '400px' }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker
          position={[result.lat, result.lng]}
          icon={createCustomIcon(markerColor)}
        >
          <Popup>
            <div className="p-2">
              <p className="font-semibold">
                {result.type === 'EXIF' ? 'Exact Location' : 'Estimated Location'}
              </p>
              <p className="text-sm text-gray-600">
                {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
              </p>
              {result.type === 'EXIF' && result.accuracy && (
                <p className="text-sm text-gray-600">
                  Accuracy: {result.accuracy}m
                </p>
              )}
              {result.type === 'ESTIMATE' && result.confidence && (
                <p className="text-sm text-gray-600">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        <Circle
          center={[result.lat, result.lng]}
          radius={radius}
          pathOptions={{
            fillColor: markerColor,
            color: markerColor,
            fillOpacity: 0.1,
            opacity: 0.3,
            weight: 2,
          }}
        />
      </MapContainer>
    </div>
  )
}
