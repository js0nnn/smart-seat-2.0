import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import spaceImg from '../assets/space.png';
import './header.css';

function Header() {
    const location = useLocation();

    useEffect(() => {
        document.body.classList.add('loaded'); // Apply the 'loaded' class to the body on component mount
        return () => {
            document.body.classList.remove('loaded'); // Remove the 'loaded' class on component unmount
        };
    }, []);

    return (
        <header>
            <img src={spaceImg} className="logo" alt="Space" />
            <h1 className="header-title">Watch Operations</h1>
            <nav>
                <ul className="nav-list" id="nav-list-id">
                    <li>
                        <NavLink to="/" className={location.pathname === '/' ? 'loaded' : ''}>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/current-status" className={location.pathname === '/current-status' ? 'loaded' : ''}>
                            Current status
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/drivers-log" className={location.pathname === '/drivers-log' ? 'loaded' : ''}>
                            Drivers Log
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/alerts" className={location.pathname === '/alerts' ? 'loaded' : ''}>
                            Alerts
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
