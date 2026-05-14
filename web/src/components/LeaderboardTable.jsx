import { getRankBadge } from '../utils/helpers';

const LeaderboardTable = ({ data = [], currentUserId }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">🏆</p>
        <p>No players yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-3 text-gray-500 font-medium w-16">Rank</th>
            <th className="text-left py-3 px-3 text-gray-500 font-medium">Player</th>
            <th className="text-right py-3 px-3 text-gray-500 font-medium">Sessions Won</th>
            <th className="text-right py-3 px-3 text-gray-500 font-medium">Played</th>
            <th className="text-right py-3 px-3 text-gray-500 font-medium">Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => {
            const isMe = entry.user_id?._id === currentUserId || entry.user_id === currentUserId;
            return (
              <tr
                key={entry.user_id?._id || entry.user_id}
                className={`border-b border-gray-50 transition-colors ${
                  isMe ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="py-3 px-3 text-center text-base font-medium">
                  {getRankBadge(entry.rank)}
                </td>
                <td className="py-3 px-3">
                  <span className={`font-medium ${isMe ? 'text-blue-600' : 'text-gray-800'}`}>
                    {entry.username}
                    {isMe && <span className="ml-1 text-xs text-blue-400">(you)</span>}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                  {entry.total_sessions_won}
                </td>
                <td className="py-3 px-3 text-right text-gray-500">
                  {entry.total_sessions_played}
                </td>
                <td className="py-3 px-3 text-right text-gray-500">
                  {entry.win_rate}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
