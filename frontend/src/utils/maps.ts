export const buildGoogleMapsUrl = (latitude: number, longitude: number, label?: string) => {
  const base = `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`
  if (!label) {
    return base
  }

  return `${base}(${encodeURIComponent(label)})`
}

export const buildGoogleMapsSearchUrl = (query: string) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export const buildOpenStreetMapUrl = (latitude: number, longitude: number) => {
  return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(latitude))}&mlon=${encodeURIComponent(String(longitude))}#map=16/${encodeURIComponent(String(latitude))}/${encodeURIComponent(String(longitude))}`
}

export const hasCoordinates = (latitude?: number | null, longitude?: number | null) => {
  if (latitude == null || longitude == null) return false
  if (Number.isNaN(Number(latitude)) || Number.isNaN(Number(longitude))) return false
  return true
}
