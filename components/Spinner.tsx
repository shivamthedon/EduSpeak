
import React from 'react';

const Spinner: React.FC<{ size?: string }> = ({ size = 'h-8 w-8' }) => {
  return (
    <div className={`animate-spin rounded-full ${size} border-t-4 border-b-4 border-white`}></div>
  );
};

export default Spinner;
