import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Container fluid className="mt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <>
                <h1 className="welcome-header">Welcome to GatorLift</h1>
                <p className="welcome-text">Press the sign in button to get started!</p>
              </>
            } />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
