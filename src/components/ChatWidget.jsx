import { useEffect, useState } from 'react';
import { api } from '../api/client';

function ChatWidget({ exchangeId, participantIndex }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = async () => {
    if (!exchangeId && exchangeId !== 0) return;
    try {
      const res = await api.get('/api/chat', {
        params: {
          exchangeId,
          participantIndex: Number(participantIndex)
        }
      });
      setMessages(res.data);
      setError('');
    } catch (err) {
      console.error('GET /api/chat error:', err);
      setError('Не удалось загрузить сообщения');
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeId, participantIndex]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    setError('');

    try {
      console.log('sending', { exchangeId, participantIndex });
      await api.post('/api/chat', {
        exchangeId,
        participantIndex: Number(participantIndex),
        text: text.trim()
      });

      setText('');
      await loadMessages();
    } catch (err) {
      console.error('POST /api/chat error:', err);
      setError(
        err?.response?.data?.message ||
          'Не удалось отправить сообщение Санте'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="small">Чат с Сантой 🎅</div>
      <div className="chat-messages">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`chat-bubble ${
              m.from === 'participant' ? 'me' : 'santa'
            }`}
          >
            <strong>
              {m.from === 'participant' ? 'Вы' : 'Санта'}:{' '}
            </strong>
            {m.text}
          </div>
        ))}
        {messages.length === 0 && !error && (
          <div className="small">Пока нет сообщений. Напишите первыми!</div>
        )}
        {error && (
          <div className="small" style={{ color: '#ff8080' }}>
            {error}
          </div>
        )}
      </div>
      <form onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Написать Санте..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="button-primary"
          style={{ marginTop: 6 }}
          disabled={sending}
        >
          {sending ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  );
}

export default ChatWidget;
