import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { api } from '../api/client';

function ExchangePage() {
  const { id } = useParams();
  const location = useLocation();
  const [exchange, setExchange] = useState(location.state?.exchange || null);

  useEffect(() => {
    const fetchExchange = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/api/exchanges/${id}`);
        setExchange(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (!exchange) {
      fetchExchange();
    }
  }, [id, exchange]);

  if (!exchange) {
    return (
      <div className="card">
        <p>Загружаем обмен...</p>
      </div>
    );
  }

  const pairs =
    exchange.status === 'drawn'
      ? exchange.participants.map((giver) => {
          const receiver =
            exchange.participants[giver.receiverIndex ?? 0];
          return { giver, receiver };
        })
      : [];

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="card">
      <h1>{exchange.title}</h1>
      <p>
        Обмен создан! Ниже — пары Тайного Санты (эту страницу лучше держать
        только для организатора).
      </p>

      {exchange.status !== 'drawn' && (
        <p>Жеребьёвка ещё не проведена.</p>
      )}

      {pairs.length > 0 && (
        <ul>
          {pairs.map(({ giver, receiver }, idx) => (
            <li key={idx} className="small">
              <strong>{giver.name}</strong> дарит{' '}
              <strong>{receiver?.name || 'кому-то'}</strong>
            </li>
          ))}
        </ul>
      )}

      <p className="small" style={{ marginTop: 24 }}>
        Отправь участникам их персональные ссылки, чтобы они могли узнать, кому
        подарить (и написать Сантe):
      </p>
      <ul className="small">
        {exchange.participants.map((p, idx) => (
          <li key={p._id || idx}>
            {p.name}: <code>{`${baseUrl}/p/${exchange._id}/${idx}`}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExchangePage;
