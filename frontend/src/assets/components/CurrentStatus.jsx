import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './header.css';
import './Current_status.css';

function CurrentStatus() {
  const [currentDateTime, setCurrentDateTime] = useState('Awaiting Data');
  const [statusData, setStatusData] = useState({
    drowsiness: 'Awaiting Data',
    seatStatus: 'Awaiting Data',
    vitalStatus: 'Awaiting Data',
    heartRate: 'Awaiting Data',
    breathingRate: 'Awaiting Data',
    temperature: 'Awaiting Data',
    headStatus: 'Awaiting Data',
    headPosition1: 'Awaiting Data',
    headPosition2: 'Awaiting Data',
    legStatus: 'Awaiting Data',
    leftLeg1: 'Awaiting Data',
    leftLeg2: 'Awaiting Data',
    rightLeg1: 'Awaiting Data',
    rightLeg2: 'Awaiting Data',
    tiltStatus: 'Awaiting Data',
    tiltX: 'Awaiting Data',
    tiltY: 'Awaiting Data',
    tiltZ: 'Awaiting Data',
    alerts: 'Awaiting Data'
  });

  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDateTime(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    // Here you would add your data fetching logic
    // For example:
    // const fetchData = async () => {
    //   const response = await fetch('your-api-endpoint');
    //   const data = await response.json();
    //   setStatusData(data);
    // };
    // fetchData();

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="main-grid-center">
      <main>
        <div className="Date-time-box">
          <div className="Date-Time-Value">Date and Time</div>
          <div className="Date-Time">{currentDateTime}</div>
        </div>

        <div className="Overall-Grid">
          <div className="Drowsiness-Title">Drowsiness</div>
          <div className="Drowsiness">{statusData.drowsiness}</div>
          <div className="Seat-Status-Grid">  
            <div className="Seat-Status-title">Seat Status</div>
            <div className="Seat-Status">{statusData.seatStatus}</div>
          </div>
        </div>
        
        <div className="main-grid">
          <div className="Vital-Grid">
            <div className="Vital-Title">Vitals</div>
            <div className="Vital-Status">{statusData.vitalStatus}</div>
            <div className="Heart-rate-Title">Heart Rate</div>
            <div className="Heart-rate">{statusData.heartRate}</div>
            <div className="Breathing-rate-Title">Breathing Rate</div>
            <div className="Breathing-rate">{statusData.breathingRate}</div>
            <div className="Temperature-Title">Temperature</div>
            <div className="Temperature-rate">{statusData.temperature}</div>
          </div>

          <div className="Head-Grid">
            <div className="Head-Status-title">Head Status</div>
            <div className="Head-Status">{statusData.headStatus}</div>
            <div className="Head-1-title">Head position 1</div>
            <div className="Head-1">{statusData.headPosition1}</div>
            <div className="Head-2-title">Head position 2</div>  
            <div className="Head-2">{statusData.headPosition2}</div>
          </div>

          <div className="Leg-Grid">
            <div className="Leg-status-title">Leg Status</div>
            <div className="Leg-status">{statusData.legStatus}</div>
            <div className="leg-1-title">Left position 1</div>
            <div className="leg-1">{statusData.leftLeg1}</div>
            <div className="leg-2-title">Left position 2</div>
            <div className="leg-2">{statusData.leftLeg2}</div>
            <div className="leg-3-title">Right position 1</div>
            <div className="leg-3">{statusData.rightLeg1}</div>
            <div className="leg-4-title">Right position 2</div>
            <div className="leg-4">{statusData.rightLeg2}</div>
          </div>

          <div className="Tilt-Grid">
            <div className="Tilt-Title">Tilt Status</div>
            <div className="Tilt-Status">{statusData.tiltStatus}</div>
            <div className="Tilt-x-title">X-axis</div>
            <div className="Tilt-x-values">{statusData.tiltX}</div>
            <div className="Tilt-y-title">Y-axis</div>
            <div className="Tilt-y-values">{statusData.tiltY}</div>
            <div className="Tilt-z-title">Z-axis</div>
            <div className="Tilt-z-values">{statusData.tiltZ}</div>
          </div>

          <div className="Alert-Grid">
            <div className="Alerts-Title">Alerts</div>
            <div className="Alerts">{statusData.alerts}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CurrentStatus;
