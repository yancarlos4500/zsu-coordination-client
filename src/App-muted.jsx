
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import FlightMap from './FlightMap';
import './index.css';

const socket = io('http://localhost:3001');
const COLUMNS = ['Callsign', 'Waypoint', 'Center Estimate', 'Pilot Estimate', 'Altitude', 'Mach', 'Status'];

function Table({ title, data, toggleColor, updateField }) {
  const sortedData = [...data].sort((a, b) => {
    const parseTime = (str) => {
      if (!str || typeof str !== 'string') return Infinity;
      const [hh, mm] = str.replace('Z', '').split(':');
      return parseInt(hh) * 60 + parseInt(mm);
    };
    return parseTime(a['Center Estimate']) - parseTime(b['Center Estimate']);
  });

  return (
    <div className="w-full mb-10">
      <h2 className="text-2xl font-semibold mb-2 text-center">{title}</h2>
      <div className="rounded-xl border border-gray-700 shadow-lg w-full overflow-auto">
        <div className="w-full grid grid-cols-7">
          {COLUMNS.map(col => (
            <div key={col} className="bg-gray-800 p-3 text-sm font-semibold text-center border-b border-r border-gray-700">{col}</div>
          ))}
          {sortedData.length === 0 ? (
            <div className="col-span-7 text-center text-gray-500 p-4">No data available</div>
          ) : null}
          {sortedData.map(row =>
            COLUMNS.map(col => {
              const isEditable = ['Pilot Estimate', 'Altitude', 'Mach'].includes(col);
              const isCoord = col === 'Status';
              const isCenterTime = col === 'Center Estimate';

              const pilotRaw = row['Pilot Estimate'] || '';
              const cleanPilot = pilotRaw.padStart(4, '0');
              const centerRaw = row['Center Estimate'] || '';
              const cleanCenter = centerRaw.replace(':', '').padStart(4, '0');
              const pilotTimeMins = parseInt(cleanPilot.slice(0, 2)) * 60 + parseInt(cleanPilot.slice(2, 4));
              const centerTimeMins = parseInt(cleanCenter.slice(0, 2)) * 60 + parseInt(cleanCenter.slice(2, 4));
              const timeDiff = Math.abs(pilotTimeMins - centerTimeMins);

              let bgColor = 'bg-gray-900';
              if (isCoord) {
                bgColor = row.Status === 'green' ? 'bg-green-600' : 'bg-red-600';
              } else if (isCenterTime && pilotRaw.length === 4 && !isNaN(pilotTimeMins)) {
  if (f.utc && Date.now() - f.utc > 15 * 60 * 1000) {
    bgColor = 'bg-gray-800';
  } else {

                bgColor = timeDiff <= 3 ? 'bg-green-600' : 'bg-red-600';
              }

              const displayValue = (() => {
                const val = row[col];
                if (col === 'Altitude' && val) return 'FL' + val;
                if (col === 'Mach' && val) return 'M' + val;
                return val || '';
              })();

              return (
                <div
                  key={`${row.id}-${col}`}
                  className={`${bgColor} p-2 text-white text-sm text-center border-b border-r border-gray-800 ${isCoord ? 'cursor-pointer' : ''}`}
                  onClick={isCoord ? () => toggleColor(row.id) : undefined}
                >
                  {isCoord ? '' : isEditable ? (
                    <input
                      type="text"
                      className="bg-transparent border-none text-white text-center w-full focus:outline-none"
                      value={displayValue}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9.]/g, '');
                        if (col === 'Altitude') {
                          val = val.slice(0, 3);
                        } else if (col === 'Mach') {
                          val = val.includes('.') ? val.split('.')[1].slice(0, 2) : val.slice(0, 2);
                        } else {
                          val = val.slice(0, 4);
                        }
                        updateField(row.id, col, val);
                      }}
                    />
                  ) : displayValue}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [inbound, setInbound] = useState([]);
  const [outbound, setOutbound] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [zuluTime, setZuluTime] = useState('');

  const toggleColor = (id) => {
    setInbound(prev => prev.map(f => f.id === id ? { ...f, Status: f.Status === 'green' ? 'red' : 'green' } : f));
    setOutbound(prev => prev.map(f => f.id === id ? { ...f, Status: f.Status === 'green' ? 'red' : 'green' } : f));
    const all = [...inbound, ...outbound];
    const match = all.find(f => f.id === id);
    if (match?.Status) {
      socket.emit('updateField', { id, field: 'Status', value: match.Status === 'green' ? 'red' : 'green' });
    }
  };

  const updateField = (id, field, value) => {
    socket.emit('updateField', { id, field, value });
    setInbound(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    setOutbound(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    setUserInputs(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const mm = String(now.getUTCMinutes()).padStart(2, '0');
      setZuluTime(`${hh}${mm}Z`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.on('updateInbound', (data) => {
      const updated = data.map(f => {
        const input = userInputs[f.id] || {};
        return {
          ...f,
          Altitude: input.Altitude || '',
          Mach: input.Mach || '',
          ...(input || {})
        };
      });
      setInbound(updated);
    });

    socket.on('updateOutbound', (data) => {
      const updated = data.map(f => {
        const input = userInputs[f.id] || {};
        return {
          ...f,
          Altitude: input.Altitude || '',
          Mach: input.Mach || '',
          ...(input || {})
        };
      });
      setOutbound(updated);
    });

    socket.on('userInputs', (inputs) => {
      setUserInputs(inputs);
      setInbound(prev => prev.map(f => ({ ...f, ...(inputs[f.id] || {}) })));
      setOutbound(prev => prev.map(f => ({ ...f, ...(inputs[f.id] || {}) })));
    });

    return () => {
      socket.off('updateInbound');
      socket.off('updateOutbound');
      socket.off('userInputs');
    };
  }, [userInputs]);

  return (
    <div className="bg-gray-950 text-white min-h-screen p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 px-2">
          <h1 className="text-4xl font-bold">ZSU FIR Monitor</h1>
          <span className="text-xl text-gray-400">Zulu: {zuluTime}</span>
        </div>
        <Table title="✈️ Entering ZSU FIR (Inbound)" data={inbound} toggleColor={toggleColor} updateField={updateField} />
        <Table title="🛫 Leaving ZSU FIR (Outbound)" data={outbound} toggleColor={toggleColor} updateField={updateField} />
        <FlightMap flights={[...inbound, ...outbound]} />
        <p className="mt-6 text-center text-gray-400 text-sm">
          Manual entry must be in HHMM format. Center time highlights green if within 3 minutes of pilot estimate.
        </p>
      </div>
    </div>
  );
}

export default App;
