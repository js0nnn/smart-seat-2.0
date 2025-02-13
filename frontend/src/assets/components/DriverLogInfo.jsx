import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Drivers_Log_info.css';

function DriverLogInfo() {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = () => {
    // Perform any necessary form submission logic here
    // For now, just log the data
    console.log('Submitted:', { startDate, startTime, endDate, endTime });

    // Navigate to the Drivers Log page
    navigate('/drivers-log');
  };

  const handleDelete = () => {
    // Handle delete logic here
    console.log('Delete requested');
  };

  return (
    <div>
      <main>
        <div className="container">
          <div>
            <div className="start-date-text">Starting Date</div>
            <div><input type="date" className="start-date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          </div>
          <div>
            <div className="from-text">Starting Time</div>
            <div><input type="time" className="From_time" id="From_time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
          </div>
          <div>
            <div className="end-date-text">Ending Date</div>
            <div><input type="date" className="end-date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          </div>
          <div>
            <div className="to-text">Ending Time</div>
            <div><input type="time" className="To_time" id="To_time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
          </div>

          <div><button className="button" id="button" onClick={handleSubmit}>Submit</button></div>
          <div><button className="button_del" onClick={handleDelete}>Delete Data in Database</button></div>
        </div>
      </main>
    </div>
  );
}

export default DriverLogInfo;
