import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function HomePage() {
  const { currentUser } = useAuth();  

  if (currentUser) {
    return <Dashboard />;  
  }

  return (
    <>
      <h1 className="welcome-header">Welcome to GatorLift</h1>
      <p className="welcome-text">Press the sign-in button to get started!</p>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Container fluid className="mt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/offer-ride" element={<Dashboard />} />
            <Route path="/find-ride" element={<Dashboard />} />
            <Route path="/my-rides" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
