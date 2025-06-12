import React from 'react';
import { Link } from 'react-router-dom';

const Activities = () => {
  return (
    <div>
      <h1>Optional Activities</h1>

      <ul>
        <li><Link to="/activities/langtang-trek">Langtang Trek</Link></li>
        <li><Link to="/activities/peak-peak-trek">Peak Peak Trek</Link></li>
        <li><Link to="/activities/valley-rim-trek">Valley Rim Trek</Link></li>
      </ul>
    </div>
  );
};

export default Activities;
