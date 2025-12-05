import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';

function Step2Details() {
  const location = useLocation();
  const navigate = useNavigate();
  const { participants, organizerName } = location.state || {};

  const [title, setTitle] = useState(
    participants ? `Тайный Санта — ${organizerName || 'команда'}` : ''
  );
  const [date, setDate] = useState('');
  const [drawType, setDrawType] = useState('now');
  const [byMail, setByMail] = useState(false);
  const [budgetCurrency, setBudgetCurrency] = useState('USD');
  const [budgetAmount, setBudgetAmount] = useState(50);
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [message, setMessage] = useState(
    "Hey everyone! We're exchanging gifts the super fun way — secretly! Не забудьте сделать wishlist ✨"
  );
  const [loading, setLoading] = useState(false);

  if (!participants) {
    return (
      <div className="card">
        <p>Сначала добавьте участников.</p>
        <button onClick={() => navigate('/')} className="button-primary">
          Назад
        </button>
      </div>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(
        '/api/exchanges',
        {
          title,
          date,
          drawType,
          byMail,
          budgetCurrency,
          budgetAmount: Number(budgetAmount),
          organizerEmail,
          howHeard,
          message,
          participants
        },
        {
          headers: {
            'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN
          }
        }
      );

      const exchange = res.data;

      navigate(`/exchange/${exchange._id}`, {
        state: { exchange }
      });

    } catch (err) {
      console.error(err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        alert(
          'Создавать обмен может только администратор. Сначала зайдите на страницу /admin и введите пароль.'
        );
      } else {
        alert('Ошибка при создании обмена');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Подробности подарка</h1>
      <p>Заполни параметры обмена, чтобы Санта всё организовал.</p>

      <form onSubmit={handleCreate}>
        <div className="field">
          <label>Название обмена</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Например: "Тайный обмен подарками Эльфи"'
          />
        </div>

        <div className="field">
          <label>Дата подарков</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Когда проводить жеребьёвку?</label>
          <div>
            <label>
              <input
                type="radio"
                value="now"
                checked={drawType === 'now'}
                onChange={(e) => setDrawType(e.target.value)}
              />{' '}
              Нарисовать имена сейчас
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                value="scheduled"
                checked={drawType === 'scheduled'}
                onChange={(e) => setDrawType(e.target.value)}
              />{' '}
              Запланировать позже
            </label>
          </div>
        </div>

        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={byMail}
              onChange={(e) => setByMail(e.target.checked)}
            />{' '}
            Отправляем подарки по почте
          </label>
        </div>

        <div className="field">
          <label>Бюджет подарков</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={budgetCurrency}
              onChange={(e) => setBudgetCurrency(e.target.value)}
            >
              <option value="USD">доллары США</option>
              <option value="EUR">евро</option>
              <option value="MDL">лей</option>
            </select>
            <input
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>Ваш email</label>
          <input
            type="email"
            value={organizerEmail}
            onChange={(e) => setOrganizerEmail(e.target.value)}
            placeholder="Введите адрес электронной почты"
          />
        </div>

        <div className="field">
          <label>Как вы узнали о нас?</label>
          <select
            value={howHeard}
            onChange={(e) => setHowHeard(e.target.value)}
          >
            <option value="">Выберите один</option>
            <option value="friends">Друзья</option>
            <option value="social">Соцсети</option>
            <option value="work">Работа</option>
          </select>
        </div>

        <div className="field">
          <label>Сообщение для участников</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="button-primary"
          disabled={loading}
        >
          {loading ? 'Создаём...' : 'Готово, провести жеребьёвку'}
        </button>
      </form>
    </div>
  );
}

export default Step2Details;
