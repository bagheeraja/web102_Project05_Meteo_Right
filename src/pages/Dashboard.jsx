import { Link } from "react-router-dom";
import { useState } from 'react'
import { useEffect } from 'react'
import { fetchActualRainfall, 
          shapeRainfallData, 
          fetchPredictedRainfall, 
          aggregateHourlyToDaily,
          mergeRainfallData,
          fetchLocationOptions,
        } from "../api/openMeteo"
import '../Dashboard.css'
import { classifyAccuracy, roundToOneDecimal } from "../utils.js"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Dashboard() {

  const [rainfallData, setRainfallData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [accuracyFilter, setAccuracyFilter] = useState("All");
  const [location, setLocation] = useState({
    latitude: 1.3521,
    longitude: 103.8198,
    name: "Singapore"
  });
  const [locationInput, setLocationInput] = useState("Singapore");

  useEffect(() => {
    async function loadData() {
      const today = new Date();

      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() - 5);
      const endDateStr = endDate.toISOString().slice(0, 10);
      
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().slice(0, 10);

      const msPerDay = 1000 * 60 * 60 * 24;
      const pastDaysNeeded = Math.ceil((today - startDate) / msPerDay);
      
      const daily = await fetchActualRainfall(location.latitude, location.longitude, startDateStr, endDateStr);
      const actualRows = shapeRainfallData(daily)

      const hourly = await fetchPredictedRainfall(location.latitude, location.longitude, 3, startDateStr, endDateStr);
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
  }, [location]);

  const totalActual = rainfallData.reduce((sum, day) => sum + day.actual, 0);
  const totalPredicted = rainfallData.reduce((sum, day) => sum + day.predicted, 0);
  const totalError = rainfallData.reduce((sum, day) => sum + Math.abs(day.predicted - day.actual), 0);
  const averageError = rainfallData.length > 0 ? totalError / rainfallData.length : 0;
  const accuracyCounts = ["Accurate", "Overpredicted", "Underpredicted"].map((category) => {
    return {
        name: category,
        value: rainfallData.filter((day) => day.accuracy === category).length,
        };
    });

  const filteredData = rainfallData.filter((day) => {
    const matchesSearch = day.date.includes(searchTerm);
    const matchesAccuracy = accuracyFilter === "All" || day.accuracy === accuracyFilter;
    return matchesSearch && matchesAccuracy;
})

async function handleLocationSearch(e) {
  e.preventDefault();
  const results = await fetchLocationOptions(locationInput);
  if (results.length > 0) {
    const first = results[0];
    setLocation({
      latitude: first.latitude,
      longitude: first.longitude,
      name: first.name,
    });
  }
}

return (
  <div className="app-container">
    <div className="header">
      <p className="eyebrow">Rainfall: Forecast vs Observed</p>
      <h1>Meteo-Right?</h1>
    </div>

    <form onSubmit={handleLocationSearch} className="location-form">
      <input
        type="text"
        placeholder="Search a city, city name only..."
        value={locationInput}
        onChange={(e) => setLocationInput(e.target.value)}
      />
      <button type="submit">Go</button>
    </form>
<p className="location-label">Showing: {location.name}</p>

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

    <div className="chart-card">
    <h2>Predicted vs. Actual Rainfall</h2>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rainfallData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }}
                    formatter={(value) => roundToOneDecimal(value)}
                />
                <Legend />
                <Bar dataKey="predicted" fill="#fbbf24" name="Predicted (mm)" />
                <Bar dataKey="actual" fill="#22d3ee" name="Actual (mm)" />
            </BarChart>
        </ResponsiveContainer>
    </div>

    <div className="chart-card">
    <h2>Forecast Accuracy Breakdown</h2>
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={accuracyCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                >
                    <Cell fill="#34d399" />
                    <Cell fill="#fbbf24" />
                    <Cell fill="#fb7185" />
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
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
            <Link 
                to={`/day/${day.date}?lat=${location.latitude}&lon=${location.longitude}&name=${encodeURIComponent(location.name)}`} className="list-link">
                <span className="list-date">{day.date}</span>
                <span className="predicted">P: {roundToOneDecimal(day.predicted)}mm</span>
                <span className="actual">A: {roundToOneDecimal(day.actual)}mm</span>
                <span className={`badge ${day.accuracy}`}>{day.accuracy}</span>            
            </Link>
        </li>
      ))}
    </ul>
  </div>
);
}

export default Dashboard;