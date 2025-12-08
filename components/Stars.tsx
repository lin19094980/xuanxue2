import React from 'react';

interface StarsProps {
  score: number; // 1-5
}

export const Stars: React.FC<StarsProps> = ({ score }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i <= score ? "#ffd700" : "none"}
          stroke={i <= score ? "#ffd700" : "#6b7280"}
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.76.742.34 1.108l-4.186 3.645a.562.562 0 00-.182.557l1.285 5.385a.559.559 0 01-.796.564L12 18.142l-4.625 2.515a.563.563 0 01-.796-.564l1.285-5.385a.562.562 0 00-.182-.557l-4.186-3.645a.559.559 0 01.34-1.108l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );
};