import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import NotificationCenter from '../components/NotificationCenter';
import useAuth from '../hooks/useAuth';
import { gameAPI, leaderboardAPI } from '../services/api';
import { formatDate, getRankBadge } from '../utils/helpers';

const StatBox = ({ label, value, color = 'text-gray-900' }) => (
  <div className="text-center p-4 bg-gray-50 rounded-xl">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

const ProfilePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [rankEntry, setRankEntry] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      if (!user?._id) return;
      setIsLoading(true);
      try {
        const [statsRes, rankRes, sessionsRes] = await Promise.all([
          gameAPI.getUserStats(user._id),
          leaderboardAPI.getUserRank(user._id),
          gameAPI.getUserSessions(user._id),
        ]);
        setStats(statsRes.data);
        setRankEntry(rankRes.data.entry);
        setSessions(sessionsRes.data.sessions || []);
      } catch {
        // silent fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [user?._id]);

  const copyUserId = () => {
    navigator.clipboard.writeText(user?._id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Profile header */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{user?.username}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-400 truncate max-w-[180px]">ID: {user?._id}</p>
              <button
                onClick={copyUserId}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Copy user ID"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          {rankEntry && (
            <div className="text-center shrink-0">
              <div className="text-2xl">{getRankBadge(rankEntry.rank)}</div>
              <p className="text-xs text-gray-400 mt-0.5">Global Rank</p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      {stats && (
        <Card title="Statistics">
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Sessions Played" value={stats.total_sessions} />
            <StatBox label="Sessions Won" value={stats.sessions_won} color="text-emerald-600" />
            <StatBox label="Win Rate" value={`${stats.win_rate}%`} color="text-blue-600" />
          </div>
        </Card>
      )}

      {/* Session history */}
      <Card title="Session History">
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No sessions yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => {
              const isP1 = s.player1_id?._id === user?._id || s.player1_id === user?._id;
              const opponent = isP1 ? s.player2_id : s.player1_id;
              const myWins = isP1 ? s.player1_games_won : s.player2_games_won;
              const oppWins = isP1 ? s.player2_games_won : s.player1_games_won;
              const iWon = s.session_winner_id?._id === user?._id || s.session_winner_id === user?._id;

              return (
                <div key={s._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      vs {opponent?.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(s.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-600">
                      {myWins} – {oppWins}
                    </p>
                    {s.status === 'finished' ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        iWon ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {iWon ? 'Won' : 'Lost'}
                      </span>
                    ) : (
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

      {/* Notifications */}
      <Card title="Notifications">
        <NotificationCenter />
      </Card>
    </div>
  );
};

export default ProfilePage;
