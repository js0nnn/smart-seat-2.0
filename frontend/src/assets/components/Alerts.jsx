import React from 'react';
import spaceImg from '/assets/Assets/space.png';

const Alerts = () => {
  return (
    <div>
      <header>
        <img src={spaceImg} className="logo" alt="Space" />
        <h1 className="header-title">Watch Operations</h1>
        <nav>
          <ul className="nav-list" id="nav-list-id">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/current-status">Current status</a>
            </li>
            <li>
              <a href="/drivers-log">Drivers Log</a>
            </li>
            <li>
              <a href="/alerts">Alerts</a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <div className="for-now">There are no Alerts for now</div>
      </main>

      <footer></footer>
    </div>
  );
};

export default Alerts;
