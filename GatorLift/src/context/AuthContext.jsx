import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token with backend
          const response = await fetch('http://localhost:3000/api/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            setCurrentUser({ email: data.email });
          } else {
            // If token is invalid, clear it
            localStorage.removeItem('token');
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}


