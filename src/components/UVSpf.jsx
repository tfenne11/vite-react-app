import React, { useState } from 'react'

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY

function getSpfRecommendation(uvi) {
  const value = Number(uvi)
  if (Number.isNaN(value)) return { category: 'Unknown', spf: '—', note: 'UV unavailable' }

  if (value <= 2) return { category: 'Low', spf: 15, note: 'Low risk — basic protection recommended.' }
  if (value <= 5) return { category: 'Moderate', spf: 30, note: 'Moderate risk — use SPF 30 and seek shade during midday.' }
  if (value <= 7) return { category: 'High', spf: 30, note: 'High risk — SPF 30–50 and reapply regularly.' }
  if (value <= 10) return { category: 'Very High', spf: 50, note: 'Very high risk — SPF 50+ and additional protection (hat, shade).' }
  return { category: 'Extreme', spf: 50, note: 'Extreme risk — avoid sun exposure where possible and use SPF 50+.' }
}

export default function UVSpf() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  async function handleCheck(e) {
    e && e.preventDefault()
    setError(null)
    setResult(null)

    if (!API_KEY) {
      setError('No API key found. Add `VITE_OPENWEATHERMAP_API_KEY` to your environment.')
      return
    }

    const q = query.trim()
    if (!q) {
      setError('Please enter a city (for example: "San Francisco,US").')
      return
    }

    try {
      setLoading(true)

      // 1) Try proxy geocode first, fall back to public API if proxy unavailable
      const geoJson = await fetchGeo(q)
      if (!geoJson || geoJson.length === 0) throw new Error('Location not found')
      const { lat, lon, name, country } = geoJson[0]

      // 2) Try proxy onecall first, fall back to public API if proxy unavailable
      const oneJson = await fetchOnecall(lat, lon)
      const uvi = oneJson?.current?.uvi
      if (uvi === undefined) throw new Error('UV index not available for this location')

      const rec = getSpfRecommendation(uvi)
      setResult({ uvi, rec, name, country })
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  // Try the local proxy first (/api/geocode), then fall back to OpenWeatherMap direct call
  async function fetchGeo(q) {
    const proxyUrl = `/api/geocode?q=${encodeURIComponent(q)}`
    try {
      const r = await fetch(proxyUrl)
      if (r.ok) return await r.json()
    } catch (e) {
      // proxy failed, will try public API
    }

    // Fallback to public OpenWeatherMap geocoding
    const publicUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${API_KEY}`
    const r2 = await fetch(publicUrl)
    if (!r2.ok) {
      const errorText = await r2.text()
      throw new Error(`Geocoding failed: ${r2.status} - ${errorText}`)
    }
    return await r2.json()
  }

  async function fetchOnecall(lat, lon) {
    const proxyUrl = `/api/onecall?lat=${lat}&lon=${lon}`
    try {
      const r = await fetch(proxyUrl)
      if (r.ok) return await r.json()
    } catch (e) {
      // proxy failed, will try public API
    }

    // Fallback to public OpenWeatherMap onecall
    const publicUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`
    const r2 = await fetch(publicUrl)
    if (!r2.ok) {
      const errorText = await r2.text()
      throw new Error(`Weather API failed: ${r2.status} - ${errorText}`)
    }
    return await r2.json()
  }

  async function fetchUvForCoords(lat, lon, label) {
    setError(null)
    setResult(null)
    try {
      setLoading(true)
      const oneRes = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`
      )
      if (!oneRes.ok) throw new Error('Weather request failed')
      const oneJson = await oneRes.json()
      const uvi = oneJson?.current?.uvi
      if (uvi === undefined) throw new Error('UV index not available for this location')

      const rec = getSpfRecommendation(uvi)
      setResult({ uvi, rec, name: label || 'Current location', country: '' })
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  function handleUseMyLocation() {
    setError(null)
    setResult(null)
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        fetchUvForCoords(latitude, longitude, 'Your location')
      },
      (err) => {
        setLoading(false)
        if (err.code === 1) setError('Location permission denied.')
        else setError(err.message || 'Failed to get location')
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  return (
    <div>
      <form onSubmit={handleCheck} style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>
          City (e.g. "Los Angeles,US")
        </label>
        <div className="uv-controls" style={{ display: 'flex', gap: 8 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City,Country(optional)"
            className="uv-input"
          />
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Checking…' : 'Get SPF'}
          </button>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={loading}
            className="btn btn-geo"
            title="Use my current location"
          >
            📍
          </button>
        </div>
      </form>

      {error && (
        <div className="uv-error" style={{ marginBottom: 12 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="uv-result">
          <div>
            <strong>Location:</strong> {result.name}{result.country ? `, ${result.country}` : ''}
          </div>
          <div>
            <strong>UV Index:</strong> {result.uvi}
          </div>
          <div>
            <strong>Risk:</strong> {result.rec.category}
          </div>
          <div>
            <strong>Suggested SPF:</strong> {result.rec.spf}
          </div>
          <div style={{ color: '#333' }}>{result.rec.note}</div>
        </div>
      )}
    </div>
  )
}
