import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  handleLogout: () => void;
  userEmail: string;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ handleLogout, userEmail, userName }) => {
  const navigate = useNavigate();

  const onLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow">
        {/* Logo */}
        <div className="text-xl font-bold text-blue-600">
          🍽️ MyRestaurant
        </div>

        {/* User info + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700 text-right">
            <div className="font-semibold">{userName}</div>
            <div className="text-xs">{userEmail}</div>
          </div>
          <button
            onClick={onLogoutClick}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Choisissez un mode</h1>
        <div className="flex gap-8">
          <button
            onClick={() => navigate('/client')}
            className="px-6 py-4 bg-green-600 text-white text-xl rounded-lg hover:bg-green-700 transition"
          >
            Mode Client
          </button>
          <button
            onClick={() => navigate('/chef')}
            className="px-6 py-4 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 transition"
          >
            Mode Chef
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
