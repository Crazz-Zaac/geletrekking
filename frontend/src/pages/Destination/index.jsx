import React from 'react';
import { Link } from 'react-router-dom';

const Destination = () => {
  return (
    <div>
      <h1>Our Destinations</h1>

      <ul>
        <li><Link to="/destination/annapurna-base-camp">Annapurna Base Camp</Link></li>
        <li><Link to="/destination/annapurna-circuit">Annapurna Circuit</Link></li>
        <li><Link to="/destination/classic-adventure">Combined Classic Adventure</Link></li>
        <li><Link to="/destination/island-peak">Island Peak</Link></li>
        <li><Link to="/destination/manaslu-circuit">Manaslu Circuit</Link></li>
        <li><Link to="/destination/mustang-trek">Mustang Trek</Link></li>
        <li><Link to="/destination/everest-base-camp">Sagarmatha (Everest) Base Camp</Link></li>
        <li><Link to="/destination/tsum-valley-manaslu">Tsum Valley and Manaslu Trek</Link></li>
      </ul>
    </div>
  );
};

export default Destination;
