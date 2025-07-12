import React from 'react';
import { useNavigate } from 'react-router-dom';

const Chef: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Mode Chef</h1>
      <p className="text-gray-700 mb-8">Bienvenue dans l’espace chef. Gérez les commandes ici.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Retour au tableau de bord
      </button>
    </div>
  );
};

export default Chef;
