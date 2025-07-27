import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lpsite from '../components/lp/lp.jsx';
import Login from '../components/Authentification/login.jsx';
import Register from '../components/Authentification/register.jsx';
import MessagesPage from '../components/Messages/MessagesPage.jsx';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import SlideEditor from '../components/SlideEditor/SlideEditor.jsx';
import ProfilePage from '../components/Profile/ProfilePage.jsx';
import ProfileEdit from '../components/Profile/ProfileEdit.jsx';
import PortfolioUpload from '../components/Portfolio/PortfolioUpload.jsx';
import PortfolioList from '../components/Portfolio/PortfolioList.jsx';
import PublicPortfolioList from '../components/Portfolio/PublicPortfolioList.jsx';
import MyPortfolioList from '../components/Portfolio/MyPortfolioList.jsx';
import PortfolioDetail from '../components/Portfolio/PortfolioDetail.jsx';
import SlideShow from '../components/Portfolio/SlideShow.jsx';

const AppRoutes = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lpsite />} />
        <Route path="/SlideEditor" element={<SlideEditor />} />
        <Route path="/login" element={
          <Login />} />
        <Route path="/register" element={
          <Register />
        } />
        <Route path="/users/:userId" element={<ProfilePage />} />
        <Route path="/users/:userId/edit" element={<ProfileEdit />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/contact" element={<PortfolioList />} />
        <Route path="/portfolios" element={<PublicPortfolioList />} />
        <Route path="/my-portfolios" element={<MyPortfolioList />} />
        <Route path="/gallery" element={<PortfolioUpload />} />
        <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        <Route path="/portfolio/:id/slideshow" element={<SlideShow />} />
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