import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setAdminToken } from '../api/client';

function AdminExchange() {
  const [exchanges, setExchanges] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [exchange, setExchange] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [replyText, setReplyText] = useState('');
  const navigate = useNavigate();

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  const getParticipantLink = (idx) => {
    if (!exchange?._id) return '';
    return `${baseUrl}/p/${exchange._id}/${idx}`;
  };

  const handleCopyLink = (idx) => {
    const link = getParticipantLink(idx);
    if (!link) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).catch(() => {});
    } else {
      alert(link);
    }
  };

  // 1. Проверяем токен админа
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    } else {
      setAdminToken(token);
    }
  }, [navigate]);

  // 2. Загружаем список обменов
  useEffect(() => {
    async function loadExchanges() {
      try {
        const res = await api.get('/api/admin/exchanges');
        const list = res.data || [];
        setExchanges(list);

        // если ещё нет выбранного — выбираем первый
        if (list.length > 0 && !selectedId) {
          setSelectedId(list[0]._id);
        }

        // если выбранный удалён — корректируем
        if (
          selectedId &&
          list.length &&
          !list.find((ex) => ex._id === selectedId)
        ) {
          setSelectedId(list[0]?._id || null);
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('adminToken');
          navigate('/admin');
        }
      }
    }

    loadExchanges();
  }, [navigate, selectedId]);

  // вспомогательная: загрузить детали выбранного обмена
  async function loadDetails(idToLoad) {
    if (!idToLoad) {
      setExchange(null);
      setMessages([]);
      return;
    }
    try {
      const res = await api.get(`/api/admin/exchanges/${idToLoad}`);
      setExchange(res.data.exchange || null);
      setMessages(res.data.messages || []);
      setActiveIndex(0);
    } catch (err) {
      console.error(err);
    }
  }

  // 3. Детали выбранного обмена + авто-обновление каждые 4 сек
  useEffect(() => {
    if (!selectedId) {
      setExchange(null);
      setMessages([]);
      return;
    }

    loadDetails(selectedId);

    const interval = setInterval(() => {
      loadDetails(selectedId);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedId]);

  // 4. Подсчёт количества сообщений у каждого участника
  const messagesCountByIndex = useMemo(() => {
    const map = {};
    messages.forEach((m) => {
      map[m.participantIndex] = (map[m.participantIndex] || 0) + 1;
    });
    return map;
  }, [messages]);

  const hasExchange =
    !!exchange && Array.isArray(exchange.participants);

  const filteredMessages =
    hasExchange && messages.length
      ? messages.filter((m) => m.participantIndex === activeIndex)
      : [];

  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !hasExchange) return;

    try {
      await api.post('/api/chat/reply', {
        exchangeId: exchange._id,
        participantIndex: activeIndex,
        text: replyText
      });
      setReplyText('');
      await loadDetails(exchange._id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteExchange() {
    if (!selectedId) return;
    if (!window.confirm('Удалить этот обмен и все сообщения?')) return;
    try {
      await api.delete(`/api/admin/exchanges/${selectedId}`);
      const res = await api.get('/api/admin/exchanges');
      const list = res.data || [];
      setExchanges(list);
      if (list.length) {
        setSelectedId(list[0]._id);
      } else {
        setSelectedId(null);
        setExchange(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUploadPhoto(idx, file) {
    if (!hasExchange || !file) return;
    const formData = new FormData();
    formData.append('photo', file);

    try {
      await api.post(
        `/api/admin/exchanges/${exchange._id}/participants/${idx}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      await loadDetails(exchange._id);
    } catch (err) {
      console.error(err);
      alert('Не удалось загрузить фото');
    }
  }

  if (!exchanges.length) {
    return (
      <div className="card">
        <h1>Админ — обмены</h1>
        <p>Пока нет созданных обменов.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 900 }}>
      <h1>Админ — обмены и сообщения</h1>

      <div style={{ marginBottom: 10 }}>
        <button
          className="button-secondary"
          onClick={() => navigate('/')}
          style={{ marginRight: 8 }}
        >
          + Создать новый обмен (через мастер)
        </button>
        <button
          className="button-secondary"
          onClick={handleDeleteExchange}
          disabled={!selectedId}
        >
          🗑 Удалить выбранный обмен
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* ЛЕВАЯ КОЛОНКА: список обменов */}
        <div style={{ width: 260 }}>
          <p className="small">Список обменов</p>
          <ul className="small">
            {exchanges.map((ex) => (
              <li key={ex._id}>
                <button
                  onClick={() => setSelectedId(ex._id)}
                  style={{
                    background:
                      ex._id === selectedId ? '#003336' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 8px',
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: 8,
                    cursor: 'pointer',
                    marginBottom: 4
                  }}
                >
                  {ex.title || 'Без названия'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: участники + чат */}
        {hasExchange && (
          <div style={{ flex: 1 }}>
            <p className="small">Чаты участников</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* список участников слева */}
              <div style={{ width: 260 }}>
                <ul className="small">
                  {exchange.participants.map((p, idx) => {
                    const link = getParticipantLink(idx);

                    return (
                      <li key={p._id || idx} style={{ marginBottom: 8 }}>
                        <button
                          onClick={() => setActiveIndex(idx)}
                          style={{
                            background:
                              idx === activeIndex ? '#004d4f' : 'transparent',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 8px',
                            width: '100%',
                            textAlign: 'left',
                            borderRadius: 8,
                            cursor: 'pointer',
                            marginBottom: 4,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            {p.photoUrl ? (
                              <img
                                src={p.photoUrl}
                                alt={p.name}
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  background: '#003336',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11
                                }}
                              >
                                {p.name?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                            <span>{p.name}</span>
                          </span>

                          {messagesCountByIndex[idx] ? (
                            <span
                              style={{
                                background: '#ff5722',
                                borderRadius: '999px',
                                padding: '0 6px',
                                fontSize: 11
                              }}
                            >
                              {messagesCountByIndex[idx]}
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: 10,
                                opacity: 0.5
                              }}
                            >
                              нет сообщений
                            </span>
                          )}
                        </button>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadPhoto(idx, file);
                              e.target.value = '';
                            }
                          }}
                          style={{ fontSize: 11 }}
                        />

                        {link && (
                          <div className="small" style={{ marginTop: 2 }}>
                            <span>Ссылка: </span>
                            <code style={{ fontSize: 10 }}>{link}</code>{' '}
                            <button
                              type="button"
                              onClick={() => handleCopyLink(idx)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#00e6e6',
                                fontSize: 10,
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              копировать
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* чат справа */}
              <div
                style={{
                  flex: 1,
                  background: '#001516',
                  borderRadius: 16,
                  padding: 12,
                  maxHeight: 320,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  className="chat-messages"
                  style={{ flex: 1, marginBottom: 8 }}
                >
                  {filteredMessages.length === 0 && (
                    <div className="small">
                      Сообщений пока нет. Ждём вопросов от участника.
                    </div>
                  )}
                  {filteredMessages.map((m) => (
                    <div
                      key={m._id}
                      className={`chat-bubble ${
                        m.from === 'participant' ? 'me' : 'santa'
                      }`}
                    >
                      <strong>
                        {m.from === 'participant' ? 'Участник' : 'Санта'}:{' '}
                      </strong>
                      {m.text}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendReply}>
                  <input
                    type="text"
                    placeholder="Ответить участнику..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="button-primary"
                    style={{ marginTop: 6 }}
                  >
                    Отправить
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* НИЖЕ — ПАРЫ ЭТОГО ОБМЕНА */}
      {hasExchange && (
        <div style={{ marginTop: 20 }}>
          <p className="small">Пары этого обмена:</p>
          <ul className="small">
            {exchange.participants.map((giver, idx) => {
              const receiver =
                exchange.participants[giver.receiverIndex ?? 0];
              return (
                <li key={giver._id || idx}>
                  <strong>{giver.name}</strong> →{' '}
                  <strong>{receiver?.name || 'кому-то'}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AdminExchange;
