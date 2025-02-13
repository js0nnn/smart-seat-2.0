import React from 'react';

function Home() {
  return (
    <div>
      <div className="asset">
        <img src="/assets/Assets/status.png" alt="status" />
        <a href="/current-status">Current Status</a>
        <p>This page tells about the current status of the driver in real time&nbsp;
          by interacting with the raspberry pi following which the data is projected&nbsp;
          to the frontend with slight modifications.
        </p>
      </div>

      <div className="logging">
        <img src="/assets/Assets/logging .png" alt="logging" />
        <a href="/drivers-log">Drivers log</a>
        <p>This page logs information about the driver's activities once the raspberry pi is active&nbsp;
          and continues to do so till the pi is turned off, this feature was implemented so that the&nbsp;
          authorized personnel can monitor what is going on and refer to the data at a later time if required.
        </p>
      </div>

      <div className="alert">
        <img src="/assets/Assets/alert.png" alt="alert" />
        <a href="/alerts">Alerts</a>
        <p>Should the driver be drowsy or in any condition be asleep despite the features implemented&nbsp;
          to prevent it or in a worse case scenario encounter any accident, the pi sends out information&nbsp;
          regarding the incident which is displayed on this Webpage while also alerting the respective emergency personnel.
        </p>
      </div>
    </div>
  );
}

export default Home;
