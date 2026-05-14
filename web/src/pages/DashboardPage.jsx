import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Swords, Bell, Trophy } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Loading from '../components/Loading';
import NotificationCenter from '../components/NotificationCenter';
import useAuth from '../hooks/useAuth';
import useGame from '../hooks/useGame';
import useNotifications from '../hooks/useNotifications';
import { gameAPI } from '../services/api';
import { formatDate } from '../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startSession } = useGame(null);
  const { unreadCount, sendInvite } = useNotifications();

  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNotifsModal, setShowNotifsModal] = useState(false);
  const [opponentId, setOpponentId] = useState('');
  const [inviteTargetId, setInviteTargetId] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      setIsLoadingSessions(true);
      try {
        const [activeRes, historyRes] = await Promise.all([
          gameAPI.getActiveSession(),
          gameAPI.getUserSessions(user._id),
        ]);
        setActiveSession(activeRes.data.session);
        setSessions(historyRes.data.sessions || []);
      } catch {
        // silent fail
      } finally {
        setIsLoadingSessions(false);
      }
    };
    fetchData();
  }, [user?._id]);

  const handleStartGame = async () => {
    if (!opponentId.trim()) { setStartError('Please enter opponent ID'); return; }
    setIsStarting(true);
    setStartError('');
    try {
      await startSession(opponentId.trim());
      setShowStartModal(false);
    } catch (err) {
      setStartError(err.message || 'Failed to start game');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendInvite = () => {
    if (!inviteTargetId.trim()) return;
    sendInvite(inviteTargetId.trim());
    setInviteTargetId('');
    setShowInviteModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, <span className="text-blue-600">{user?.username}</span> 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Ready to play Nine Holes?</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Button onClick={() => setShowStartModal(true)} fullWidth>
          <Swords size={16} /> Start Game
        </Button>
        <Button variant="secondary" onClick={() => setShowInviteModal(true)} fullWidth>
          <Users size={16} /> Invite Player
        </Button>
        <Button variant="ghost" onClick={() => setShowNotifsModal(true)} fullWidth className="relative">
          <Bell size={16} />
          Notifications
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/leaderboard')} fullWidth>
          <Trophy size={16} /> Leaderboard
        </Button>
      </div>

      {/* Active Session */}
      {activeSession && (
        <Card title="Active Session" className="mb-6 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <span className="font-medium text-blue-700">
                {activeSession.player1_id?.username}
              </span>
              {' vs '}
              <span className="font-medium text-red-600">
                {activeSession.player2_id?.username}
              </span>
            </div>
            <Button size="sm" onClick={() => navigate(`/game/${activeSession._id}`)}>
              Resume
            </Button>
          </div>
        </Card>
      )}

      {/* Session History */}
      <Card title="Recent Sessions">
        {isLoadingSessions ? (
          <Loading text="Loading sessions..." />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No sessions yet. Start your first game!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.slice(0, 5).map((s) => {
              const iWon = s.session_winner_id?._id === user?._id || s.session_winner_id === user?._id;
              const isP1 = s.player1_id?._id === user?._id || s.player1_id === user?._id;
              const opponent = isP1 ? s.player2_id : s.player1_id;
              return (
                <div key={s._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="text-sm text-gray-600">
                    vs <span className="font-medium text-gray-800">{opponent?.username || 'Unknown'}</span>
                    <span className="text-gray-400 ml-2 text-xs">{formatDate(s.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {isP1 ? s.player1_games_won : s.player2_games_won}/5 rounds
                    </span>
                    {s.status === 'finished' && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        iWon ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {iWon ? 'Won' : 'Lost'}
                      </span>
                    )}
                    {s.status === 'active' && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Start Game Modal */}
      <Modal isOpen={showStartModal} onClose={() => { setShowStartModal(false); setStartError(''); }} title="Start New Game">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">Enter the user ID of the opponent you want to play against.</p>
          <Input
            label="Opponent User ID"
            placeholder="Paste opponent's user ID"
            value={opponentId}
            onChange={(e) => setOpponentId(e.target.value)}
            error={startError}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowStartModal(false)}>Cancel</Button>
            <Button onClick={handleStartGame} isLoading={isStarting}>Start Game</Button>
          </div>
        </div>
      </Modal>

      {/* Send Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite a Player">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">Send a game invite notification to another player.</p>
          <Input
            label="Player User ID"
            placeholder="Paste player's user ID"
            value={inviteTargetId}
            onChange={(e) => setInviteTargetId(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button onClick={handleSendInvite}>Send Invite</Button>
          </div>
        </div>
      </Modal>

      {/* Notifications Modal */}
      <Modal isOpen={showNotifsModal} onClose={() => setShowNotifsModal(false)} title="Notifications">
        <NotificationCenter />
      </Modal>
    </div>
  );
};

export default DashboardPage;
