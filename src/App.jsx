import React from 'react'
import UVSpf from './components/UVSpf'

export default function App() {
  return (
    <div className="app">
      <h1>UV → SPF Recommendation</h1>
      <p>Enter a city (optional: add a comma and country code) to get a UV-based SPF recommendation.</p>
      <UVSpf />
    </div>
  )
}
