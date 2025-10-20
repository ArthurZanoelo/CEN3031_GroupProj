import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUserProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    const fetchMyPosts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/my-carpool-posts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMyPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    if (currentUser) {
      fetchProfile();
      fetchMyPosts();
    }
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/carpool-posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyPosts(p => p.filter(x => x.id !== id));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleEdit = (post) => {
    navigate('/create-post', { state: { editPost: post } });
  };

  const getTitle = () => {
    switch (location.pathname) {
      case '/offer-ride':
        return 'Offer a Ride';
      case '/find-ride':
        return 'Find a Ride';
      case '/my-rides':
        return 'Accepted Rides';
      case '/profile':
        return 'Account Settings';
      default:
        if (userProfile?.firstName) {
          return `Welcome, ${userProfile.firstName}!`;
        }
        return `Welcome, ${currentUser?.email || 'User'}!`;
    }
  };

  return (
    <Container className="mt-4">
      <h2>{getTitle()}</h2>
      <p className="pb-5"></p>

      {(location.pathname === '/' || location.pathname === '/dashboard') && (
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <Card.Title>Offer a Ride</Card.Title>
              <Button variant="primary" onClick={() => navigate('/create-post')}>Add/Edit Posts</Button>
            </Card.Body>
          </Card>

          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <Card.Title>Find a Ride</Card.Title>
              <Button variant="primary" onClick={() => navigate('/find-ride')}>Search Rides</Button>
            </Card.Body>
          </Card>

          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <Card.Title>Accepted Rides</Card.Title>
              <Button variant="primary" onClick={() => navigate('/my-rides')}>View Rides</Button>
            </Card.Body>
          </Card>
        </div>
      )}

      {(location.pathname === '/' || location.pathname === '/dashboard') && myPosts.length > 0 && (
        <div className="mt-5" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h3 className="text-xl font-semibold mt-5 text-center">Your Posts</h3>
          <div className="space-y-6">
            {myPosts.map(post => (
              <div key={post.id}
                className="p-4 rounded-lg border border-gray-300 shadow-sm mb-4"
                style={{ backgroundColor: '#e6f3ff' }}>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">{post.departure_location} → {post.arrival_location}, </span>
                  <span className="text-sm text-gray-500">{new Date(post.departure_date).toLocaleString()}</span>
                </div>
                <div className="text-sm mb-1">
                  Seats&nbsp;{post.seats_available} – Accepted&nbsp;{post.acceptedCount}
                </div>
                {post.contact_info && (
                  <div className="text-xs text-gray-400">{post.contact_info}</div>
                )}
                <div className="mt-2" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <button onClick={() => handleEdit(post)}
                    className="filter-element px-2 py-1 text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(post.id)}
                    className="filter-element px-2 py-1 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {location.pathname === '/offer-ride' && (
        <div className="text-center">
          <p>Create a new carpool post to offer a ride to others.</p>
          <Button 
            variant="primary" 
            size="lg" 
            className="mt-3" 
            onClick={() => navigate('/create-post')}
          >
            Create Carpool Post
          </Button>
        </div>
      )}
    </Container>
  );
}

export default Dashboard;


