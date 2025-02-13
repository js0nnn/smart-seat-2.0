import React, { useState, useEffect } from 'react';
import './Drivers_log.css';
import './Drivers_Log_info.css';

function DriversLog() {
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Driver Log Info inputs
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/data'); // Replace '/data' with your actual API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setLogData(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleSubmit = () => {
    console.log('Submitted:', { startDate, startTime, endDate, endTime });
    // Add any logic to filter or fetch data based on the provided date and time range
  };

  const handleDelete = () => {
    console.log('Delete requested');
    // Add logic to delete data from the database
  };

  if (loading) {
    return <div className="awaiting-data">Loading data...</div>;
  }

  if (error) {
    return <div className="awaiting-data">Error: {error}</div>;
  }

  return (
    <div>
      <main>
        {/* Driver Log Info Section */}
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

        {/* Driver Log Table Section */}
        <div className="scroll-container">
          <table className="table-content">
            <caption>Drivers log</caption>
            <thead>
              <tr>
                <th className="Date-Time">Date and time</th>
                <th>Seat Status</th>
                <th>Heart Rate</th>
                <th>Head Position</th>
                <th>Leg position</th>
                <th>Emergency</th>
              </tr>
            </thead>
            <tbody>
              {logData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.seat_status}</td>
                  <td>{entry.heartrate} BPM</td>
                  <td>{entry.head_position}</td>
                  <td>{entry.leg_position}</td>
                  <td>{entry.emergency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logData.length === 0 && (
          <div className="awaiting-data">Awaiting Data</div>
        )}
      </main>
    </div>
  );
}

export default DriversLog;