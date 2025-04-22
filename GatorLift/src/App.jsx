import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import CarpoolPostForm from './components/CarpoolPostForm';
import CarpoolPostList from './components/CarpoolPostList';
import RideHistory from './components/RideHistory';
import ProfileSettings from './components/ProfileSettings';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Navbar />
      <Container fluid className="mt-4">
        <Routes>
          <Route path="/login" element={
            currentUser ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/register" element={
            currentUser ? <Navigate to="/dashboard" /> : <Register />
          } />
          <Route path="/" element={
            currentUser ? <Navigate to="/dashboard" /> : (
              <h1>Welcome, sign in to get started</h1>
            )
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/create-post" element={
            <PrivateRoute>
              <CarpoolPostForm />
            </PrivateRoute>
          } />
          <Route path="/offer-ride" element={
            <PrivateRoute>
              <Dashboard activeTab="offer-ride" />
            </PrivateRoute>
          } />
          <Route path="/find-ride" element={
            <PrivateRoute>
              <CarpoolPostList />
            </PrivateRoute>
          } />
          <Route path="/my-rides" element={
            <PrivateRoute>
              <RideHistory />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfileSettings />
            </PrivateRoute>
          } />
        </Routes>
      </Container>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
