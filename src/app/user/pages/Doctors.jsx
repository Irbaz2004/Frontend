import React from 'react';

const Doctors = ({ name }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{name} Page</h1>
    <p className="mt-4 text-gray-500">This is a Doctors for the {name} page.</p>
  </div>
);

export default Doctors;

