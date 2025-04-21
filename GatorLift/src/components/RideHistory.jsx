import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [acceptedCounts, setAcceptedCounts] = useState({});
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, countsRes] = await Promise.all([
          axios.get('http://localhost:3000/api/ride-history', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:3000/api/accepted-counts', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        setRides(historyRes.data);
        setAcceptedCounts(countsRes.data);
      } catch (e) {
        setError('Failed to fetch ride history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = Date.now();

  const { upcoming, past } = useMemo(() => {
    const up   = [];
    const prev = [];
    rides.forEach(r => (
      new Date(r.departure_date).getTime() > now ? up : prev
    ).push(r));

    // sort ascending for upcoming, descending for past
    up.sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
    prev.sort((a, b) => new Date(b.departure_date) - new Date(a.departure_date));
    return { upcoming: up, past: prev };
  }, [rides, now]);

  const handleRemove = async (postId) => {
    try {
      await axios.delete(`http://localhost:3000/api/ride-history/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRides(prev => prev.filter(r => r.id !== postId));
    } catch {
      alert('Could not remove ride – please try again.');
    }
  };

  
  const RideCard = ({ ride, showRemove }) => {
    const userEmail   = ride.userEmail   || 'Unknown';
    const contactInfo = ride.contact_info || 'No contact info available';
    const seatsOffered= ride.seats_available;

    return (
      <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm mt-6 first:mt-0">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-lg">{ride.departure_location} → {ride.arrival_location}</span>
          <span className="text-sm text-gray-500"> {new Date(ride.departure_date).toLocaleString()}</span>
        </div>

        <div className="text-sm mb-1">Seats Offered: <b>{seatsOffered}</b></div>
        <div className="text-xs text-gray-400">Contact Info: {contactInfo}</div>
        <div className="text-xs text-gray-400">Posted by: {userEmail}</div>
        <div className="text-sm text-gray-500 mt-1">Accepted by: {acceptedCounts[ride.id] || 0}</div>

        {showRemove ? (
          <button
            onClick={() => handleRemove(ride.id)}
            className="mt-2 text-sm text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        ) : (
          <button
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {/* Make this button do stuff */}}
          >
            Leave a review
          </button>
        )}
      </div>
    );
  };

  if (loading) return <div>Loading…</div>;
  if (error)   return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">Your Rides</h2>

      <h3 className="text-lg font-semibold mt-4">Upcoming Rides</h3>
      {upcoming.length === 0
        ? <p className="text-sm text-gray-500">No upcoming rides.</p>
        : upcoming.map(r => <RideCard key={r.id} ride={r} showRemove />)
      }

      <h3 className="text-lg font-semibold mt-4">Past Rides</h3>
      {past.length === 0
        ? <p className="text-sm text-gray-500">No past rides yet.</p>
        : past.map(r => <RideCard key={r.id} ride={r} showRemove={false} />)
      }
    </div>
  );
};

export default RideHistory;
