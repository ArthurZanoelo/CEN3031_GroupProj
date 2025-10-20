import { Container, Navbar as BootstrapNavbar, Nav, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('token');
      setCurrentUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="navbar-custom">
      <Container fluid>
        <BootstrapNavbar.Brand 
          onClick={() => navigate(currentUser ? '/dashboard' : '/')} 
          style={{ cursor: 'pointer' }}
          className="ms-4 navbar-brand"
        >
          GatorLift
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto me-4">
            {currentUser ? (
              <NavDropdown 
                title={
                  <>
                    <FaUserCircle size={24} className="me-2" />
                    {currentUser.email}
                  </>
                } 
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item onClick={() => navigate('/profile')}>
                  Account Settings
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link onClick={() => navigate('/login')}>
                <FaUserCircle size={24} className="me-2" />
                Sign In
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar; 