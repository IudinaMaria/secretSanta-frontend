import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ChatWidget from '../components/ChatWidget.jsx';

function ParticipantPage() {
  const { id, index } = useParams();
  const participantIndex = Number(index);
  const [exchange, setExchange] = useState(null);
  const [me, setMe] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [spinName, setSpinName] = useState('');
  const [spinPhoto, setSpinPhoto] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const fetchExchange = async () => {
      try {
        const res = await api.get(`/api/exchanges/${id}`);
        const ex = res.data;
        setExchange(ex);

        const meP = ex.participants[participantIndex];
        if (!meP) return;
        const rec = ex.participants[meP.receiverIndex ?? 0];

        setMe(meP);
        setReceiver(rec);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExchange();
  }, [id, participantIndex]);

  const handleSpin = () => {
    if (!exchange || !receiver) return;

    setIsSpinning(true);
    setRevealed(false);

    const items = exchange.participants.map((p) => ({
      name: p.name,
      photoUrl: p.photoUrl || null
    }));

    let i = 0;

    const interval = setInterval(() => {
      const item = items[i % items.length];
      setSpinName(item.name);
      setSpinPhoto(item.photoUrl);
      i++;
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setSpinName(receiver.name);
      setSpinPhoto(receiver.photoUrl || null);
      setIsSpinning(false);
      setRevealed(true);
    }, 2500);
  };

  if (!exchange || !me || !receiver) {
    return (
      <div className="card">
        <p>Загружаем ваш обмен...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Привет, {me.name}! 🎄</h1>
      <p>
        Готов узнать, кому ты даришь подарок в обмене «{exchange.title}»?
        Нажми кнопку, чтобы крутануть колесо.
      </p>

      <div
        style={{
          margin: '20px auto',
          width: 240,
          height: 240,
          borderRadius: '50%',
          border: '4px solid #00b3b3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(0,0,0,0.4)',
          position: 'relative',
          background: '#001516'
        }}
      >
        {/* стрелочка сверху */}
        <div
          style={{
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: '14px solid #ffeb3b'
          }}
        />
        {spinPhoto ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8
            }}
          >
            <img
              src={spinPhoto}
              alt={spinName}
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #00b3b3'
              }}
            />
            <span style={{ fontSize: 18, textAlign: 'center' }}>
              {spinName}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 20, textAlign: 'center' }}>
            {spinName || 'Крути колесо 🎰'}
          </span>
        )}
      </div>

      <button
        className="button-primary"
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning ? 'Крутится...' : 'Узнать, кому даришь'}
      </button>

      {revealed && (
        <p style={{ marginTop: 16 }}>
          Ура! 🎁 Ты даришь подарок:{' '}
          <strong>{receiver.name}</strong>. Не рассказывай никому 😉
        </p>
      )}

      <ChatWidget
        exchangeId={exchange._id}
        participantIndex={participantIndex}
      />
    </div>
  );
}

export default ParticipantPage;
