import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Step1Participants from './pages/Step1Participants.jsx';
import Step2Details from './pages/Step2Details.jsx';
import ExchangePage from './pages/ExchangePage.jsx';
import ParticipantPage from './pages/ParticipantPage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminExchange from './pages/AdminExchange.jsx';
import { setAdminToken } from './api/client';

function App() {
  // при загрузке подтягиваем токен админа из localStorage
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setAdminToken(token);
  }, []);

  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Step1Participants />} />
        <Route path="/details" element={<Step2Details />} />
        <Route path="/exchange/:id" element={<ExchangePage />} />
        <Route path="/p/:id/:index" element={<ParticipantPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/exchanges" element={<AdminExchange />} />
      </Routes>
    </div>
  );
}

export default App;
