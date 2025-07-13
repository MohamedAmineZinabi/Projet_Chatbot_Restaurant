import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { ChefHat, Utensils, Cookie, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const data = await response.json();
        setError(data.detail || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError('Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-snack-yellow/5 via-snack-orange/5 to-snack-red/5 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Éléments décoratifs de nourriture */}
      <div className="absolute top-10 left-10 text-snack-orange/20 animate-bounce" style={{ animationDelay: '0s' }}>
        <Utensils className="w-16 h-16" />
      </div>
      <div className="absolute top-32 right-16 text-snack-yellow/20 animate-bounce" style={{ animationDelay: '1s' }}>
        <Cookie className="w-12 h-12" />
      </div>
      <div className="absolute bottom-20 left-20 text-snack-red/20 animate-bounce" style={{ animationDelay: '2s' }}>
        <ChefHat className="w-14 h-14" />
      </div>
      <div className="absolute bottom-40 right-12 text-snack-orange/15 animate-bounce" style={{ animationDelay: '1.5s' }}>
        <Utensils className="w-10 h-10" />
      </div>

      <div className="w-full max-w-md relative z-10">
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
          <p className="text-gray-600 mt-2">Rejoindre la communauté des chefs</p>
        </div>

        {/* Formulaire d'inscription */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Créer un compte</h2>
            <p className="text-gray-600 text-sm">Commencez votre aventure culinaire</p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">
                  Inscription réussie! Redirection vers la page de connexion...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Nom complet
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 pl-10 border-gray-200 focus:border-snack-orange focus:ring-snack-orange/20"
                    placeholder="Entrez votre nom complet"
                  />
                </div>
              </div>

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
                  placeholder="Entrez votre adresse email"
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
                  placeholder="Créez un mot de passe sécurisé"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mt-6 bg-gradient-to-r from-snack-orange to-snack-yellow hover:from-snack-orange/90 hover:to-snack-yellow/90"
              >
                Créer mon compte
              </Button>
            </form>

            {/* Lien connexion */}
            <div className="text-center mt-6">
              <span className="text-gray-600 text-sm">Déjà un compte ? </span>
              <Link
                to="/login"
                className="text-snack-yellow hover:text-snack-orange text-sm font-medium hover:underline transition-colors duration-200"
              >
                Se connecter
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

export default Signup;
