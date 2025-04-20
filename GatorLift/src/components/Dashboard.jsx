import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);

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

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const getTitle = () => {
    switch (location.pathname) {
      case '/offer-ride':
        return 'Offer a Ride';
      case '/find-ride':
        return 'Find a Ride';
      case '/my-rides':
        return 'Ride History';
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
              <Button variant="primary" onClick={() => navigate('/create-post')}>Get Started</Button>
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
              <Card.Title>Ride History</Card.Title>
              <Button variant="primary" onClick={() => navigate('/my-rides')}>View Rides</Button>
            </Card.Body>
          </Card>

          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <Card.Title>Account Settings</Card.Title>
              <Button variant="primary" onClick={() => navigate('/profile')}>Edit Profile</Button>
            </Card.Body>
          </Card>
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


