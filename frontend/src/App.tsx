import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Client from './pages/Client';
import Chef from './pages/Chef';

const App: React.FC = () => {
  // Initialiser l'état d'authentification en vérifiant la présence d'un token.
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Centraliser la logique de déconnexion.
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client" element={<Client />} />
        <Route path="/chef" element={<Chef />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard handleLogout={handleLogout} userEmail={''} userName={''} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;