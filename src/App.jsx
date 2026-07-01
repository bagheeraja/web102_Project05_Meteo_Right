import { useState } from 'react'
import { useEffect } from 'react'
import { fetchActualRainfall, 
          shapeRainfallData, 
          fetchPredictedRainfall, 
          aggregateHourlyToDaily,
          mergeRainfallData,
        } from "./api/openMeteo"
import './App.css'

/**
 * Classifies a day's forecast accuracy by comparing predicted to actual
 * rainfall.
 *
 * @param {number} predicted - Predicted rainfall in mm.
 * @param {number} actual - Actual rainfall in mm.
 * @return {string} One of "Accurate", "Overpredicted", or "Underpredicted".
 */
function classifyAccuracy(predicted, actual) {
  const diff = predicted - actual;
  if (Math.abs(diff) <= 2) return "Accurate";
  if (diff > 2) return "Overpredicted";
  return "Underpredicted";
}

/**
 * Rounds a number to one decimal place, for cleaner on-screen display.
 *
 * @param {number} value - The number to round.
 * @return {number} The value rounded to one decimal place.
 */
export function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function App() {

  const [rainfallData, setRainfallData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [accuracyFilter, setAccuracyFilter] = useState("All");

  useEffect(() => {
    async function loadData() {
      const daily = await fetchActualRainfall(29.5844, -81.2078, "2026-06-01", "2026-06-10");
      const actualRows = shapeRainfallData(daily)

      const hourly = await fetchPredictedRainfall(29.5844, -81.2078, 3);
      const predictedTotals = aggregateHourlyToDaily(hourly, 3);
      
      const merged = mergeRainfallData(actualRows, predictedTotals);

      const classified = merged.map((row) => {
        return {
          ...row,
          accuracy: classifyAccuracy(row.predicted, row.actual),
        }
      })

      setRainfallData(classified);
    }

    loadData();
  }, []);

  const totalActual = rainfallData.reduce((sum, day) => sum + day.actual, 0);
  const totalPredicted = rainfallData.reduce((sum, day) => sum + day.predicted, 0);
  const totalError = rainfallData.reduce((sum, day) => sum + Math.abs(day.predicted - day.actual), 0);
  const averageError = rainfallData.length > 0 ? totalError / rainfallData.length : 0;

  const filteredData = rainfallData.filter((day) => {
    const matchesSearch = day.date.includes(searchTerm);
    const matchesAccuracy = accuracyFilter === "All" || day.accuracy === accuracyFilter;
    return matchesSearch && matchesAccuracy;
})

return (
  <div className="app-container">
    <div className="header">
      <p className="eyebrow">Forecast vs Observed</p>
      <h1>Meteo-Right?</h1>
    </div>

    <div className="stats-grid">
      <div className="stat-card">
        <p className="stat-label">Total Actual</p>
        <p className="stat-value actual">{roundToOneDecimal(totalActual)}mm</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Total Predicted</p>
        <p className="stat-value predicted">{roundToOneDecimal(totalPredicted)}mm</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Avg. Error</p>
        <p className="stat-value">{roundToOneDecimal(averageError)}mm</p>
      </div>
    </div>

    <div className="filters">
      <input
        type="text"
        placeholder="Search by date..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select value={accuracyFilter} onChange={(e) => setAccuracyFilter(e.target.value)}>
        <option value="All">All</option>
        <option value="Accurate">Accurate</option>
        <option value="Overpredicted">Overpredicted</option>
        <option value="Underpredicted">Underpredicted</option>
      </select>
    </div>

    <ul className="list">
      {filteredData.map((day) => (
        <li key={day.date} className="list-row">
          <span className="list-date">{day.date}</span>
          <span className="predicted">P: {roundToOneDecimal(day.predicted)}mm</span>
          <span className="actual">A: {roundToOneDecimal(day.actual)}mm</span>
          <span className={`badge ${day.accuracy}`}>{day.accuracy}</span>
        </li>
      ))}
    </ul>
  </div>
);
}

export default App;
