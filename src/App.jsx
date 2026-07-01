import { useState } from 'react'
import { useEffect } from 'react'
import { fetchActualRainfall, shapeRainfallData } from "./api/openMeteo"
import './App.css'


function App() {
  useEffect(() => {
    async function loadData() {
      const daily = await fetchActualRainfall(29.5844, -81.2078, "2026-06-01", "2026-06-10");
      const rows = shapeRainfallData(daily)
      console.log(rows);
    }

    loadData();
  }, []); 

  return (
    <div>
      <h1>Meteo-Right?</h1>
    </div>
  )
}

export default App
