import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';

// Import your components with the correct paths
import Home from './assets/components/Home';
import CurrentStatus from './assets/components/CurrentStatus';
import DriversLog from './assets/components/DriversLog';
import Alerts from './assets/components/Alerts';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* Header */}
        <header>
          <img src="/assets/Assets/space.png" className="logo" alt="logo" />
          <h1 className="header-title">Watch Operations</h1>
          <nav>
            <ul className="nav-list" id="nav-list-id">
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/current-status">Current Status</NavLink></li>
              <li><NavLink to="/drivers-log">Drivers Log</NavLink></li>
              <li><NavLink to="/alerts">Alerts</NavLink></li>
            </ul>
          </nav>
        </header>

        {/* Routes */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/current-status" element={<CurrentStatus />} />
            <Route path="/drivers-log" element={<DriversLog />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer></footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
