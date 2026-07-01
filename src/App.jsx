import { useState } from 'react'
import { useEffect } from 'react'
import { fetchActualRainfall, 
          shapeRainfallData, 
          fetchPredictedRainfall, 
          aggregateHourlyToDaily,
          mergeRainfallData,
          roundToOneDecimal, } from "./api/openMeteo"
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

  const totalActual = rainfallData.reduce((sum, day) => sum + day.actual, 0);
  const totalPredicted = rainfallData.reduce((sum, day) => sum + day.predicted, 0);
  const totalError = rainfallData.reduce((sum, day) => sum + Math.abs(day.predicted - day.actual), 0);
  const averageError = rainfallData.length > 0 ? totalError / rainfallData.length : 0;

  return (
    <div>
      <h1>Meteo-Right?</h1>
      <div>
        <p>Total Actual Rainfall: {roundToOneDecimal(totalActual)}mm</p>
        <p>Total Predicted Rainfall: {roundToOneDecimal(totalPredicted)}mm</p>
        <p>Average Forecast Error: {roundToOneDecimal(averageError)}mm</p>
      </div>
      <ul>
        {rainfallData.map((day) => (
          <li key={day.date}>
            {day.date} - Predicted: {roundToOneDecimal(day.predicted)}mm, Actual: {roundToOneDecimal(day.actual)}mm
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
