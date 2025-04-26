import React, { useState } from 'react';
import Home from '../src/Home';

function App() {
  const [dark, setDark] = useState(false);

  return (
    <div className={`${dark ? 'bg-black text-white' : 'bg-gray-100 text-black'} min-h-screen`}>
      <header className="shadow p-1 flex justify-between items-center bg-blue-600 sticky top-0 z-50">
        <h1
          className="text-xl font-bold cursor-pointer text-black text-center w-full"
        >
          The News Ledger
        </h1>
        <button
          onClick={() => setDark(!dark)}
          className="px-2 py-0.5 inline-block rounded bg-slate-800 text-white text-sm whitespace-nowrap"
        >
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>

      </header>
      <Home />
    </div>
  );
}

export default App;
