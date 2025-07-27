import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lpsite from '../components/lp/lp.jsx';
import Login from '../components/Authentification/login.jsx';
import Register from '../components/Authentification/register.jsx';
import MessagesPage from '../components/Messages/MessagesPage.jsx';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import SlideEditor from '../components/SlideEditor/SlideEditor.jsx';
import ProfilePage from '../components/Profile/ProfilePage.jsx';
import ProfileEdit from '../components/Profile/ProfileEdit.jsx';
import PortfolioGallery from '../components/Portfolio/PortfolioGallery.jsx';
import ConnectPage from '../components/Portfolio/ConnectPage.jsx';

const AppRoutes = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lpsite />} />
        <Route path="/gallery" element={<PortfolioGallery />} />
        <Route path="/SlideEditor" element={<SlideEditor />} />
        <Route path="/contact" element={<ConnectPage />} />
        <Route path="/login" element={
          <Login />} />
        <Route path="/register" element={
          <Register />
        } />
        <Route path="/users/:userId" element={<ProfilePage />} />
        <Route path="/users/:userId/edit" element={<ProfileEdit />} />
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