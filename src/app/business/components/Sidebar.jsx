import React from 'react';

const Sidebar = ({ name }) => (
    <div className="p-4 border border-dashed border-gray-300 rounded-lg">
        <p className="text-sm text-gray-400 font-mono">{name} Component</p>
    </div>
);

export default Sidebar;

