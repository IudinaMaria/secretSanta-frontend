import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Step1Participants() {
  const navigate = useNavigate();
  const [organizerName, setOrganizerName] = useState('');
  const [participants, setParticipants] = useState([
    { name: '', email: '' },
    { name: '', email: '' }
  ]);

  const addRow = () => {
    setParticipants((prev) => [...prev, { name: '', email: '' }]);
  };

  const updateParticipant = (index, field, value) => {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleContinue = (e) => {
    e.preventDefault();

    const cleaned = participants.filter((p) => p.name.trim() !== '');

    if (!organizerName.trim() || cleaned.length < 2) {
      alert('Нужен организатор и минимум 2 участника.');
      return;
    }

    const finalParticipants = [
      { name: organizerName.trim(), email: '' },
      ...cleaned
    ];

    navigate('/details', {
      state: { participants: finalParticipants, organizerName }
    });
  };

  return (
    <div className="card">
      <h1>Тайный Санта 🎁</h1>
      <p>Добавь себя и друзей, чтобы начать обмен подарками.</p>

      <form onSubmit={handleContinue}>
        <div className="field">
          <label>Ваше имя</label>
          <input
            type="text"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            placeholder="Например, Элфи"
          />
        </div>

        <p className="small">Участники</p>

        {participants.map((p, index) => (
          <div className="participant-row" key={index}>
            <input
              type="text"
              placeholder={`Имя ${index + 1}`}
              value={p.name}
              onChange={(e) =>
                updateParticipant(index, 'name', e.target.value)
              }
            />
          </div>
        ))}

        <button
          type="button"
          className="button-secondary"
          onClick={addRow}
          style={{ width: '100%', marginBottom: 8 }}
        >
          + Добавить участника
        </button>

        <button type="submit" className="button-primary">
          Далее
        </button>
      </form>
    </div>
  );
}

export default Step1Participants;
