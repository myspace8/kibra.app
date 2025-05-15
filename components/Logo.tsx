import React from 'react';

export default function Logo() {
  // This is a simple logo component that renders a black circle with a white arc and the text "kibra_" in the center.
  return (
    <svg width="45" height="45" viewBox="10 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Black Circle */}
      <circle cx="50" cy="50" r="40" fill="black" />
      {/* White Arc for the smiling effect */}
      {/* <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="gray" strokeWidth="3" /> */}
      
      {/* Capital K */}
      <text x="50%" y="50%" textAnchor="middle" fill="white" fontSize="25" fontWeight="normal" dy=".3em">kibra_</text>
    </svg>
  );
};