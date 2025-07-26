import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lpsite from '../components/lp/lp.jsx';
import Login from '../components/Authentification/login.jsx';
import Register from '../components/Authentification/register.jsx';
import MessagesPage from '../components/Messages/MessagesPage.jsx';
import { AuthProvider, useAuth } from '../hooks/useAuth';

const AppRoutes = () => {
  const { setUser } = useAuth();
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lpsite />} />
        <Route path="/gallery" element={<Lpsite />} />
        <Route path="/works" element={<Lpsite />} />
        <Route path="/contact" element={<Lpsite />} />
        <Route path="/login" element={
          <Login onLogin={(user) => setUser(user)} />} 
        />
        <Route path="/register" element={
          <Register onRegister={(user) => setUser(user)} />} 
        />
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
    </div>
  )
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}