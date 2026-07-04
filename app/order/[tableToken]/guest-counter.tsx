"use client";

import { useState } from "react";

export function GuestCounter({ maxCapacity = 4 }: { maxCapacity?: number }) {
  const [guests, setGuests] = useState(2);

  return (
    <div className="pt-6 border-t border-border-warm mt-6">
      <label className="text-sm font-bold text-text-secondary block mb-3">Number of Guests (Max: {maxCapacity})</label>
      <div className="flex items-center justify-center space-x-4">
        <button 
          onClick={() => setGuests(Math.max(1, guests - 1))}
          className="w-10 h-10 rounded-full border-2 border-border-warm flex items-center justify-center text-text-primary text-xl font-bold hover:bg-bg-secondary active:scale-95 transition-all"
        >
          -
        </button>
        <div className="w-12 text-center text-2xl font-black">{guests}</div>
        <button 
          onClick={() => setGuests(Math.min(maxCapacity, guests + 1))}
          className="w-10 h-10 rounded-full border-2 border-primary-green bg-primary-green flex items-center justify-center text-white text-xl font-bold hover:bg-primary-hover active:scale-95 transition-all"
          disabled={guests >= maxCapacity}
          style={{ opacity: guests >= maxCapacity ? 0.5 : 1 }}
        >
          +
        </button>
      </div>
    </div>
  );
}
