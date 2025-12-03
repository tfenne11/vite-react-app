const express = require('express')
const fetch = require('node-fetch')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 4000
const API_KEY = process.env.OPENWEATHERMAP_API_KEY

if (!API_KEY) {
  console.warn('Warning: OPENWEATHERMAP_API_KEY is not set. The proxy will return errors.')
}

app.use(cors())

app.get('/api/geocode', async (req, res) => {
  const q = req.query.q
  if (!q) return res.status(400).json({ error: 'Missing q parameter' })
  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${API_KEY}`
    const r = await fetch(url)
    const json = await r.json()
    res.json(json)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/onecall', async (req, res) => {
  const { lat, lon } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'Missing lat or lon' })
  try {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`
    const r = await fetch(url)
    const json = await r.json()
    res.json(json)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.listen(PORT, () => {
  console.log(`UV SPF proxy started on http://localhost:${PORT}`)
})
