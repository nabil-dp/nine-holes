import { Link } from 'react-router-dom';
import { Trophy, Zap, Users } from 'lucide-react';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';

const Feature = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center gap-2 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="text-3xl mb-1">{icon}</div>
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      {/* Hero */}
      <div className="mb-12">
        <div className="text-6xl mb-4">⚫⚪</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Nine Holes</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
          A classic strategy game. Place 3 balls, line them up in a row or column. Outsmart your opponent.
        </p>
        <div className="flex gap-3 justify-center">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg">Play Now</Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost">Login</Button>
              </Link>
            </>
          )}
          <Link to="/leaderboard">
            <Button size="lg" variant="secondary">Leaderboard</Button>
          </Link>
        </div>
      </div>

      {/* How to play */}
      <div className="mb-12 text-left bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 text-lg mb-4 text-center">How to Play</h2>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>Each player takes turns placing their 3 balls on the 3×3 board.</li>
          <li>Once all 6 balls are placed, take turns moving any of your balls to an empty cell.</li>
          <li>Win a round by lining up all 3 of your balls in a row or column (not diagonal!).</li>
          <li>A session consists of 5 rounds. Win 3 or more rounds to win the session.</li>
          <li>Session wins are tracked on the public leaderboard.</li>
        </ol>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Feature icon="⚡" title="Real-time" desc="Play against others in real-time with instant updates." />
        <Feature icon="🏆" title="Leaderboard" desc="Compete and climb the global rankings." />
        <Feature icon="📱" title="Installable" desc="Install as a PWA and play from any device." />
      </div>
    </div>
  );
};

export default HomePage;
