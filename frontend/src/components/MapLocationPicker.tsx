import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { LatLngExpression, Icon } from 'leaflet'
import { MapPin, Navigation, Crosshair, Loader2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import toast from 'react-hot-toast'

// Fix Leaflet default marker icon issue with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

Icon.Default.prototype.options.iconUrl = markerIcon
Icon.Default.prototype.options.iconRetinaUrl = markerIcon2x
Icon.Default.prototype.options.shadowUrl = markerShadow

interface MapLocationPickerProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lon: number) => void
  height?: string
  showControls?: boolean
  zoom?: number
}

// Component to handle map clicks
const LocationMarker: React.FC<{
  position: LatLngExpression
  onPositionChange: (lat: number, lon: number) => void
}> = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng)
      toast.success('Location updated! Click to adjust or save.')
    },
  })

  return <Marker position={position} icon={defaultIcon} />
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  height = '400px',
  showControls = true,
  zoom = 15,
}) => {
  const [position, setPosition] = useState<LatLngExpression>([latitude, longitude])
  const [isDetecting, setIsDetecting] = useState(false)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    setPosition([latitude, longitude])
  }, [latitude, longitude])

  const handlePositionChange = (lat: number, lon: number) => {
    setPosition([lat, lon])
    onLocationChange(lat, lon)
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setIsDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        setPosition([lat, lon])
        onLocationChange(lat, lon)
        
        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.setView([lat, lon], 16)
        }
        
        toast.success('Current location detected!')
        setIsDetecting(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('Unable to get your location. Please check permissions.')
        setIsDetecting(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleRecenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setView(position, 16)
      toast.success('Map centered on selected location')
    }
  }

  return (
    <div className="space-y-3">
      {showControls && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isDetecting}
            className="btn btn-primary btn-sm"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Use Current Location
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleRecenterMap}
            className="btn btn-outline btn-sm"
          >
            <Crosshair className="h-4 w-4 mr-2" />
            Re-center Map
          </button>
        </div>
      )}

      <div 
        className="relative rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={position}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={handlePositionChange} />
        </MapContainer>

        <div className="absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2 border border-slate-200">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary-600" />
            <div>
              <p className="font-medium text-slate-900">Selected Location</p>
              <p className="text-xs text-slate-600">
                {typeof position === 'object' && Array.isArray(position) 
                  ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`
                  : 'Click map to select'}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-primary-600 text-white rounded-lg shadow-lg px-4 py-2 text-center">
          <p className="text-sm font-medium">
            <MapPin className="inline h-4 w-4 mr-1" />
            Click anywhere on the map to set your precise location
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-600 space-y-1">
        <p className="flex items-start gap-2">
          <span className="font-semibold text-slate-900">Tip:</span>
          You can click anywhere on the map to select your exact location, or use the "Use Current Location" button for GPS accuracy.
        </p>
        <p className="flex items-start gap-2">
          <span className="font-semibold text-slate-900">Coordinates:</span>
          Latitude: {typeof position === 'object' && Array.isArray(position) ? position[0].toFixed(6) : 'N/A'}, 
          Longitude: {typeof position === 'object' && Array.isArray(position) ? position[1].toFixed(6) : 'N/A'}
        </p>
      </div>
    </div>
  )
}

export default MapLocationPicker
