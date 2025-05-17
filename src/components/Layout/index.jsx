import { Link, Outlet } from "react-router";
import "./index.css";



function Layout() {
  return (
    <div >
    <h1>App Voyage</h1>
      <nav>
        <ul className="ul_nav">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/pokemon">Voyage</Link>
          </li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;