import { useState } from 'react'
import { useEffect } from 'react'
import { fetchActualRainfall, 
          shapeRainfallData, 
          fetchPredictedRainfall, 
          aggregateHourlyToDaily,
          mergeRainfallData } from "./api/openMeteo"
import './App.css'


function App() {

  const [rainfallData, setRainfallData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const daily = await fetchActualRainfall(29.5844, -81.2078, "2026-06-01", "2026-06-10");
      const actualRows = shapeRainfallData(daily)

      const hourly = await fetchPredictedRainfall(29.5844, -81.2078, 3);
      const predictedTotals = aggregateHourlyToDaily(hourly, 3);
      
      const merged = mergeRainfallData(actualRows, predictedTotals);
      console.log(merged);
      setRainfallData(merged);
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
