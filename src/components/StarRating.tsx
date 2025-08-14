import React from 'react';

interface StarRatingProps {
  value?: number | null;
}

function StarRating({ value = 0 }: StarRatingProps) {
  const v = Math.max(0, Math.min(Number(value ?? 0), 5));
  const pct = (v / 5) * 100;
  
  return (
    <div className="relative inline-block leading-none" aria-label={`Hodnotenie ${v} z 5`}>
      <div className="text-gray-300 select-none">★★★★★</div>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <div className="text-yellow-400 select-none">★★★★★</div>
      </div>
    </div>
  );
}

export default StarRating;