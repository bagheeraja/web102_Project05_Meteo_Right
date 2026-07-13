import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  fetchActualRainfall,
  shapeRainfallData,
  fetchPredictedRainfall,
  aggregateHourlyToDaily,
} from "../api/openMeteo";
import { classifyAccuracy, roundToOneDecimal } from "../utils.js";
import "../Dashboard.css";

function DayDetail() {
  const { date } = useParams();
  const [searchParams] = useSearchParams();

  const latitude = parseFloat(searchParams.get("lat"));
  const longitude = parseFloat(searchParams.get("lon"));
  const locationName = searchParams.get("name");

  const [detail, setDetail] = useState(null);
  const [hourlyBreakdown, setHourlyBreakdown] = useState([]);

  useEffect(() => {
    async function loadDetail() {
      const daily = await fetchActualRainfall(latitude, longitude, date, date);
      const actualRows = shapeRainfallData(daily);
      const actual = actualRows[0]?.actual;

      const today = new Date();
      const targetDate = new Date(date);
      const msPerDay = 1000 * 60 * 60 * 24;
      const pastDaysNeeded = Math.ceil((today - targetDate) / msPerDay) + 1;

      const hourly = await fetchPredictedRainfall(latitude, longitude, 3, date, date);
      const predictedTotals = aggregateHourlyToDaily(hourly, 3);
      const predicted = predictedTotals[date];

      if (actual === undefined || predicted === undefined) return;

      setDetail({
        date,
        actual,
        predicted,
        accuracy: classifyAccuracy(predicted, actual),
      });

      const variable = `precipitation_previous_day3`;
      const hoursForDay = hourly.time
        .map((timestamp, i) => ({ timestamp, value: hourly[variable][i] }))
        .filter((h) => h.timestamp.startsWith(date));
      setHourlyBreakdown(hoursForDay);
    }

    loadDetail();
  }, [date, latitude, longitude]);

  if (!detail) {
    return <p>Loading...</p>;
  }

  return (
    <div className="app-container">
      <Link to="/" className="back-link">← Back to dashboard</Link>

      <div className="header">
        <p className="eyebrow">{locationName}</p>
        <h1>{date}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Predicted</p>
          <p className="stat-value predicted">{roundToOneDecimal(detail.predicted)}mm</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Actual</p>
          <p className="stat-value actual">{roundToOneDecimal(detail.actual)}mm</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Status</p>
          <span className={`badge ${detail.accuracy}`}>{detail.accuracy}</span>
        </div>
      </div>

      <h2>Hourly predicted breakdown</h2>
      <ul className="list">
        {hourlyBreakdown.map((h) => (
          <li key={h.timestamp} className="list-row">
            <span className="list-link">
              <span className="list-date">{h.timestamp.slice(11)}</span>
              <span className="predicted">{h.value}mm</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DayDetail;