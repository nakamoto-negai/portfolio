import React from 'react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lpsite from '../components/lp/lp.jsx';
import Login from '../components/Authentification/login.jsx';
import Register from '../components/Authentification/register.jsx';
import { checkLoginStatus } from '../api/auth.js';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkLoginStatus()
      .then(res => {
        if (res.data.logged_in) {
          setCurrentUser(res.data.user);
        } else {
          setCurrentUser(null);
        }
  }).catch(err => {
        console.error('ログイン状態の確認に失敗:', err);
      });
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lpsite  user={currentUser} />} />
          <Route path="/gallery" element={<Lpsite user={currentUser}/>} />
          <Route path="/works" element={<Lpsite user={currentUser}/>} />
          <Route path="/contact" element={<Lpsite user={currentUser}/>} />
          <Route path="/login" element={
            <Login onLogin={(user) => setCurrentUser(user)} />} />
          <Route path="/register" element={
            <Register onRegister={(user) => setCurrentUser(user)} />
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;