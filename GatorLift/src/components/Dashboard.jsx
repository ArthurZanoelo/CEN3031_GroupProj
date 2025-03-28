import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        return 'Welcome, ' + (currentUser?.email || 'User') + '!';
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
              <Button variant="primary" onClick={() => navigate('/offer-ride')}>Get Started</Button>
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
    </Container>
  );
}

export default Dashboard;


