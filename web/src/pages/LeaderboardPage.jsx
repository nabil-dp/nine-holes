import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import LeaderboardTable from '../components/LeaderboardTable';
import Loading from '../components/Loading';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';
import { leaderboardAPI } from '../services/api';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await leaderboardAPI.getAll();
      setData(res.data.leaderboard || []);
      setLastUpdated(new Date());
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'All players ranked by session wins'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchLeaderboard} isLoading={isLoading}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <Loading text="Loading leaderboard..." />
        ) : (
          <LeaderboardTable data={data} currentUserId={user?._id} />
        )}
      </Card>
    </div>
  );
};

export default LeaderboardPage;
