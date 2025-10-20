import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const DEFAULT_FILTERS = { from: '', to: '', day: '', minSeats: '' };
const RideHistory = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [acceptedCounts, setAcceptedCounts] = useState({});
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // make sure minSeats is sent as a number, not a string
      const params = { ...filters };
      if (params.minSeats) params.minSeats = Number(params.minSeats);
  
      const [histRes, countsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/ride-history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params
        }),
        axios.get('http://localhost:3000/api/accepted-counts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
  
      setRides(histRes.data);
      setAcceptedCounts(countsRes.data);
    } catch {
      setError('Failed to fetch ride history');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { if (!loading) fetchHistory(); }, [filters]);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPendingFilters(DEFAULT_FILTERS);
  };

  const handleRemove = async (postId) => {
    if (!window.confirm('Remove this ride?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/ride-history/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRides(prev => prev.filter(r => r.id !== postId));
    } catch {
      alert('Could not remove ride – please try again.');
    }
  };

  const now = Date.now();
  const { upcoming, past } = useMemo(() => {
    const up = [], prev = [];
    rides.forEach(r => {
      const time = new Date(r.departure_date).getTime();
      if (time > now) up.push(r);
      else prev.push(r);
    });
    up.sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
    prev.sort((a, b) => new Date(b.departure_date) - new Date(a.departure_date));
    return { upcoming: up, past: prev };
  }, [rides, now]);

  if (loading) return <div>Loading…</div>;
  if (error)   return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <button 
        onClick={() => navigate('/dashboard')} 
        className="btn btn-link p-0"
        style={{ 
          color: '#0d6efd', 
          textDecoration: 'none',
          position: 'absolute',
          top: '80px',
          left: '20px',
          zIndex: 1000
        }}
      >
        <FaArrowLeft className="me-2" />
        Back to Dashboard
      </button>
      <div className="mx-auto mt-8" style={{ maxWidth: '500px' }}>
        <h1 className="text-2xl font-bold text-center mb-5">Your Rides</h1>
      <div className="filter-bar mb-6">
      <div className="d-flex flex-wrap justify-content-center">
    <div className="d-flex flex-column me-3" style={{ width: '13rem' }}>
      <label className="mb-1"><b>Start Date</b></label>
      <input
        type="datetime-local"
        value={pendingFilters.from}
        onChange={e =>
          setPendingFilters(s => ({ ...s, from: e.target.value, day: '' }))
        }
        className="filter-element p-1 text-sm"
      />
    </div>

    <div className="d-flex flex-column me-3" style={{ width: '13rem' }}>
      <label className="mb-1"><b>End Date</b></label>
      <input
        type="datetime-local"
        value={pendingFilters.to}
        onChange={e =>
          setPendingFilters(s => ({ ...s, to: e.target.value, day: '' }))
        }
        className="filter-element p-1 text-sm"
      />
    </div>

    <div className="d-flex flex-column me-3" style={{ width: '10rem' }}>
      <label className="mb-1"><b>On Date</b></label>
      <input
        type="date"
        value={pendingFilters.day}
        onChange={e =>
          setPendingFilters(s => ({ ...s, day: e.target.value, from: '', to: '' }))
        }
        className="filter-element p-1 text-sm"
      />
    </div>

    <div className="d-flex flex-column me-3" style={{ width: '6rem' }}>
      <label className="mb-1"><b>Min Seats</b></label>
      <input
        type="number"
        min="1"
        placeholder="Seats≥"
        value={pendingFilters.minSeats}
        onChange={e =>
          setPendingFilters(s => ({ ...s, minSeats: e.target.value }))
        }
        className="filter-element p-1 text-sm"
      />
    </div>

    <div className="d-flex flex-column me-3" style={{ width: '6rem' }}>
      <label className="mb-1 invisible">Apply</label>
      <button onClick={() => setFilters(pendingFilters)}  className="filter-element px-3 py-1 text-sm">Apply</button>
      </div>

      <div className="d-flex flex-column" style={{ width: '6rem' }}>
        <label className="mb-1 invisible">Clear</label>
      <button onClick={clearFilters}   className="filter-element px-3 py-1 text-sm">Clear</button>
  </div>
</div>
</div>

      <h4 className="text-lg font-semibold mt-4">Upcoming Rides</h4>
      {upcoming.length === 0 ? (
        <p className="text-sm text-gray-500">No upcoming rides.</p>
      ) : (
        upcoming.map(r => (
          <div
            key={r.id}
            className="p-4 rounded-lg border border-gray-300 shadow-sm mb-4"
            style={{ backgroundColor: '#e6f3ff' }}
          >
            <div className="flex justify-between mb-2">
              <span className="font-semibold">{r.departure_location} → {r.arrival_location}</span>
              <span className="text-sm text-gray-500"> {new Date(r.departure_date).toLocaleString()}</span>
            </div>
            <div className="text-sm mb-1">Seats Offered: <b>{r.seats_available}</b></div>
            {r.contact_info && <div className="text-xs text-gray-400">Contact: {r.contact_info}</div>}
            <div className="text-xs text-gray-400">Posted by: {r.userEmail}</div>
            <div className="text-sm text-gray-500">Accepted by: {acceptedCounts[r.id] || 0}</div>
            <button onClick={() => handleRemove(r.id)}className="filter-element px-2 py-1 text-sm mt-2">Remove</button>
          </div>
        ))
      )}

      <h4 className="text-lg font-semibold mt-4">Past Rides</h4>
      {past.length === 0 ? (
        <p className="text-sm text-gray-500">No past rides.</p>
      ) : (
        past.map(r => (
          <div
            key={r.id}
            className="p-4 rounded-lg border border-gray-300 shadow-sm mb-4"
            style={{ backgroundColor: '#e6f3ff' }}
          >
            <div className="flex justify-between mb-2">
              <span className="font-semibold">{r.departure_location} → {r.arrival_location}</span>
              <span className="text-sm text-gray-500"> {new Date(r.departure_date).toLocaleString()}</span>
            </div>
            <div className="text-sm mb-1">Seats Offered: <b>{r.seats_available}</b></div>
            {r.contact_info && <div className="text-xs text-gray-400">Contact: {r.contact_info}</div>}
            <div className="text-xs text-gray-400">Posted by: {r.userEmail}</div>
            <div className="text-sm text-gray-500">Accepted by: {acceptedCounts[r.id] || 0}</div>
            <button onClick={() => handleRemove(r.id)}className="filter-element px-2 py-1 text-sm mt-2">Remove</button>
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default RideHistory;
