import { Link, Outlet } from "react-router-dom";
import "./Layout.css";

function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Meteo-Right?</h2>
        <p className="sidebar-tagline">Forecast vs. observed rainfall</p>

        <nav className="sidebar-nav">
          <Link to="/">Dashboard</Link>
        </nav>

        <div className="sidebar-legend">
          <p className="sidebar-legend-title">Accuracy legend</p>
          <div className="legend-item">
            <span className="legend-dot Accurate"></span> Accurate (±2mm)
          </div>
          <div className="legend-item">
            <span className="legend-dot Overpredicted"></span> Overpredicted
          </div>
          <div className="legend-item">
            <span className="legend-dot Underpredicted"></span> Underpredicted
          </div>
        </div>

        <p className="sidebar-credit">Data via Open-Meteo</p>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;