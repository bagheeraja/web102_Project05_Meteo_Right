import { useState } from 'react'
import { useEffect } from 'react'
import { fetchActualRainfall, shapeRainfallData, fetchPredictedRainfall } from "./api/openMeteo"
import './App.css'


function App() {

  const [rainfallData, setRainfallData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const daily = await fetchActualRainfall(29.5844, -81.2078, "2026-06-01", "2026-06-10");
      const rows = shapeRainfallData(daily)
      setRainfallData(rows);

      const hourly = await fetchPredictedRainfall(29.5844, -81.2078, 3);
      console.log(hourly);
    }

    loadData();
  }, []); 

  return (
    <div>
      <h1>Meteo-Right?</h1>
      <ul>
        {rainfallData.map((day) => (
          <li key={day.date}>
            {day.date}: {day.actual}mm
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
