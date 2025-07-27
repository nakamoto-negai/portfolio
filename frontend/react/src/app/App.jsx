import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lpsite from '../components/lp/lp.jsx';
import Login from '../components/Authentification/login.jsx';
import Register from '../components/Authentification/register.jsx';
import MessagesPage from '../components/Messages/MessagesPage.jsx';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import SlideEditor from '../components/SlideEditor/SlideEditor.jsx';
import ProfilePage from '../components/Profile/ProfilePage.jsx';
import ProfileEdit from '../components/Profile/ProfileEdit.jsx';
import PortfolioList from '../components/Portfolio/PortfolioList.jsx';
import PortfolioCreate from '../components/Portfolio/PortfolioCreate.jsx';
import PowerPointUpload from '../components/PowerPoint/PowerPointUpload.jsx';

const AppRoutes = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lpsite />} />
        <Route path="/gallery" element={<Lpsite />} />
        <Route path="/SlideEditor" element={<SlideEditor />} />
        <Route path="/contact" element={<Lpsite />} />
        <Route path="/login" element={
          <Login />} />
        <Route path="/register" element={
          <Register />
        } />
        <Route path="/users/:userId" element={<ProfilePage />} />
        <Route path="/users/:userId/edit" element={<ProfileEdit />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/portfolios" element={<PortfolioList />} />
        <Route path="/portfolios/new" element={<PortfolioCreate />} />
        <Route path="/portfolios/:portfolioId/powerpoints/upload" element={<PowerPointUpload />} />
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