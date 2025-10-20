import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const DEFAULT_FILTERS = { from: '', to: '', day: '', minSeats: '' };

const CarpoolPostList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptedCounts, setAcceptedCounts] = useState({});
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Clone filters and sanitize before sending
      const params = { ...filters };
  
      // Convert minSeats to a number (if set)
      if (params.minSeats) params.minSeats = Number(params.minSeats);
  
      // Convert datetime fields to proper ISO format
      // so backend date comparisons don’t fail
      if (params.from) params.from = new Date(params.from).toISOString();
      if (params.to) params.to = new Date(params.to).toISOString();
      if (params.day) params.day = new Date(params.day).toISOString();
      console.log("Sending filters:", params);

      const [postsResponse, countsResponse] = await Promise.all([
        
        axios.get('http://localhost:3000/api/carpool-posts', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params,
        }),
        axios.get('http://localhost:3000/api/accepted-counts', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);
  
      setPosts(postsResponse.data);
      setAcceptedCounts(countsResponse.data);
    } catch (err) {
      console.error('Error fetching carpool posts:', err);
      setError('Failed to fetch carpool posts');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!loading) fetchPosts();
  }, [filters]);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPendingFilters(DEFAULT_FILTERS);
  };

  const handleAcceptPost = async (postId) => {
    if (!window.confirm('Are you sure you want to accept this ride?')) return;
    try {
      const response = await axios.post(
        `http://localhost:3000/api/carpool-posts/${postId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const { acceptedCount } = response.data;
      setAcceptedCounts((prev) => ({ ...prev, [postId]: acceptedCount }));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 409)
      ) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        return;
      }
      console.error('Error accepting post:', error);
      setError('Unexpected network error — please try again.');
    }
  };

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
          zIndex: 1000,
        }}
      >
        <FaArrowLeft className="me-2" />
        Back to Dashboard
      </button>

      <div className="mx-auto mt-8" style={{ maxWidth: '500px' }}>
        <h2 className="text-2xl font-bold text-center mb-5">
          Available Carpool Rides
        </h2>

        {/* Filter Bar */}
        <div
          className="filter-bar mb-6"
          style={{
            marginBottom: '1.5rem', // space between filters and posts
          }}
        >
          <div className="d-flex flex-wrap justify-content-center">
            <div className="d-flex flex-column me-3" style={{ width: '13rem' }}>
              <label className="mb-1">
                <b>Start Date</b>
              </label>
              <input
                type="datetime-local"
                value={pendingFilters.from}
                onChange={(e) =>
                  setPendingFilters((s) => ({
                    ...s,
                    from: e.target.value,
                    day: '',
                  }))
                }
                className="filter-element p-1 text-sm"
                style={{
                  backgroundColor: '#d3d3d3',
                  border: '1px solid #bbb',
                  color: '#000',
                  borderRadius: '5px',
                }}
              />
            </div>

            <div className="d-flex flex-column me-3" style={{ width: '13rem' }}>
              <label className="mb-1">
                <b>End Date</b>
              </label>
              <input
                type="datetime-local"
                value={pendingFilters.to}
                onChange={(e) =>
                  setPendingFilters((s) => ({
                    ...s,
                    to: e.target.value,
                    day: '',
                  }))
                }
                className="filter-element p-1 text-sm"
                style={{
                  backgroundColor: '#d3d3d3',
                  border: '1px solid #bbb',
                  color: '#000',
                  borderRadius: '5px',
                }}
              />
            </div>

            <div className="d-flex flex-column me-3" style={{ width: '10rem' }}>
              <label className="mb-1">
                <b>On Date</b>
              </label>
              <input
                type="date"
                value={pendingFilters.day}
                onChange={(e) =>
                  setPendingFilters((s) => ({
                    ...s,
                    day: e.target.value,
                    from: '',
                    to: '',
                  }))
                }
                className="filter-element p-1 text-sm"
                style={{
                  backgroundColor: '#d3d3d3',
                  border: '1px solid #bbb',
                  color: '#000',
                  borderRadius: '5px',
                }}
              />
            </div>

            <div className="d-flex flex-column me-3" style={{ width: '6rem' }}>
              <label className="mb-1">
                <b>Min Seats</b>
              </label>
              <input
                type="number"
                min="1"
                placeholder="Seats≥"
                value={pendingFilters.minSeats}
                onChange={(e) =>
                  setPendingFilters((s) => ({
                    ...s,
                    minSeats: e.target.value,
                  }))
                }
                className="filter-element p-1 text-sm"
                style={{
                  backgroundColor: '#d3d3d3',
                  border: '1px solid #bbb',
                  color: '#000',
                  borderRadius: '5px',
                }}
              />
            </div>

            <div className="d-flex flex-column me-3" style={{ width: '6rem' }}>
              <label className="mb-1 invisible">Apply</label>
              <button
                onClick={() => setFilters(pendingFilters)}
                className="filter-element px-3 py-1 text-sm btn btn-primary"
                
              >
                Apply
              </button>
            </div>

            <div className="d-flex flex-column" style={{ width: '6rem' }}>
              <label className="mb-1 invisible">Clear</label>
              <button
                onClick={clearFilters}
                className="filter-element px-3 py-1 text-sm btn btn-primary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        {loading && <div>Loading carpool posts...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          posts.length === 0 ? (
            <div>No carpool posts available.</div>
          ) : (
            <div className="divide-y divide-gray-300">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-lg border border-gray-300 shadow-sm transition-colors hover:border-blue-400 mb-4"
                  style={{ backgroundColor: '#e6f3ff' }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg whitespace-nowrap">
                      {post.departure_location} → {post.arrival_location}
                    </span>
                    <span className="text-sm text-gray-500 flex-shrink-0">
                      &nbsp;
                      {new Date(post.departure_date).toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-1">
                    Seats Offered: <b>{post.seats_available}</b>
                  </div>
                  {post.contact_info && (
                    <div className="mb-1">Contact: {post.contact_info}</div>
                  )}
                  <div className="text-xs text-gray-400">
                    Posted by: {post.userEmail}
                  </div>
                  <button
                    onClick={() => handleAcceptPost(post.id)}
                    className="filter-element px-2 py-1 text-sm mt-2 btn btn-outline-primary"
                  >
                    Accept
                  </button>
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted by: {acceptedCounts[post.id] || 0}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CarpoolPostList;
