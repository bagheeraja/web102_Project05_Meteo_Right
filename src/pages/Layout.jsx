import { Outlet } from "react-router-dom";
import "./Layout.css"

function Layout() {
    return (
        <div className="app-shell">
            <aside className="sidebar">
                <h2>Meteo-Right?</h2>
                <p>Sidebar Placeholder</p>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;