import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setAdminToken } from '../api/client';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/admin/login', { password });
      const { token } = res.data;
      setAdminToken(token);
      localStorage.setItem('adminToken', token);
      navigate('/admin/exchanges');
    } catch (err) {
      console.error(err);
      setError('Неверный пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Админ — вход</h1>
      <p className="small">
        Введите админ-пароль, чтобы управлять обменами и сообщениями.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="small" style={{ color: '#ff8080' }}>
            {error}
          </p>
        )}
        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
