import { createContext, useContext, useEffect, useState } from 'react';


const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
    // checks if the user is logged in, if so takes them to the dashboard
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(err => console.error('Auth check failed:', err));
    }
  }, []);


  const value = { currentUser, setCurrentUser };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


