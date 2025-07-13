import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader } from "../components/ui/card";

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2PasswordRequestForm attend "username"
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // CORRECT
        },
        body: formData.toString(), // CORRECT
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token); // CORRECT
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setError('Identifiants incorrects');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-snack-red/10 via-snack-yellow/5 to-snack-orange/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo SnackZinabi */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-snack-red to-snack-orange p-4 rounded-full shadow-lg">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-snack-red via-snack-orange to-snack-yellow bg-clip-text text-transparent">
            SnackZinabi
          </h1>
          <p className="text-gray-600 mt-2">Plateforme pour Chefs Cuisiniers</p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Connexion</h2>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-snack-orange focus:ring-snack-orange/20"
                  placeholder="Entrez votre email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-snack-orange focus:ring-snack-orange/20"
                  placeholder="Entrez votre mot de passe"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mt-6"
                style={{ backgroundColor: '#e63946' }}
              >
                Se connecter
              </Button>
            </form>

            {/* Lien créer un compte */}
            <div className="text-center mt-6">
              <Link
                to="/signup"
                className="text-sm font-medium hover:underline transition-colors duration-200"
                style={{ color: '#f1c40f' }}
              >
                Créer un compte
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Retour à l'accueil */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-snack-orange transition-colors duration-200 text-sm"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;