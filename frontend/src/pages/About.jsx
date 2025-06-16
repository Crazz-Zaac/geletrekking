import React, { useEffect, useState } from 'react';
import axios from 'axios';

function About() {
  const [abouts, setAbouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/aboutus')
      .then(response => {
        setAbouts(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load About Us content.');
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading About Us...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {abouts.map((about) => (
        <section key={about._id} className="mb-12 bg-white shadow-md rounded-lg overflow-hidden">
          <img 
            src={about.imageUrl} 
            alt={about.heading} 
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{about.heading}</h1>
            <p className="text-gray-700 mb-6">{about.description}</p>
            <ul className="flex flex-wrap gap-6 text-gray-600 font-medium">
              <li><span className="font-bold text-gray-900">Price:</span> ${about.price}</li>
              <li><span className="font-bold text-gray-900">Days:</span> {about.days}</li>
              <li><span className="font-bold text-gray-900">Group Size:</span> {about.groupSize}</li>
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}

export default About;
