import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChefHat, User, LogOut } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-snack-yellow/10 via-snack-orange/5 to-snack-red/10">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white/95 backdrop-blur-sm shadow-lg border-b">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-snack-red to-snack-orange p-3 rounded-full shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-snack-red via-snack-orange to-snack-yellow bg-clip-text text-transparent">
            SnackZinabi
          </div>
        </div>

        {/* User info + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700 text-right">
            <div className="font-semibold text-gray-800">{userName}</div>
            <div className="text-xs text-gray-600">{userEmail}</div>
          </div>
          <Button
            onClick={onLogoutClick}
            variant="outline"
            size="sm"
            className="border-snack-red text-snack-red hover:bg-snack-red hover:text-white transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Bienvenue, {userName.split(' ')[0]} !
          </h1>
          <p className="text-xl text-gray-600">Choisissez votre mode d'utilisation</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto w-full">
          {/* Mode Client */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-snack-yellow to-snack-orange p-6 rounded-full shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Mode Client</CardTitle>
              <p className="text-gray-600">Commandez vos plats favoris</p>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-gray-600 mb-6 space-y-2 text-left">
                <li>• Chat avec l'IA pour commander</li>
                <li>• Personnalisation des plats</li>
                <li>• Suivi de commande en temps réel</li>
              </ul>
              <Button
                onClick={() => navigate('/client')}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-snack-yellow to-snack-orange hover:from-snack-yellow/90 hover:to-snack-orange/90 text-white shadow-lg transition-all duration-300"
              >
                Accéder au mode client
              </Button>
            </CardContent>
          </Card>

          {/* Mode Chef */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-snack-red to-snack-orange p-6 rounded-full shadow-lg">
                  <ChefHat className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Mode Chef</CardTitle>
              <p className="text-gray-600">Gérez vos commandes</p>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-gray-600 mb-6 space-y-2 text-left">
                <li>• Tableau de bord des commandes</li>
                <li>• Gestion des statuts</li>
                <li>• Notifications en temps réel</li>
              </ul>
              <Button
                onClick={() => navigate('/chef')}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-snack-red to-snack-orange hover:from-snack-red/90 hover:to-snack-orange/90 text-white shadow-lg transition-all duration-300"
              >
                Accéder au mode chef
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Vous pouvez changer de mode à tout moment depuis votre profil
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;