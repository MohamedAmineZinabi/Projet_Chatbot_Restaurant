import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Users, ChefHat, Utensils, Star, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";

interface HomeProps {
  isAuthenticated: boolean;
}

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.7 } },
});

const Home: React.FC<HomeProps> = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-snack-red/10 via-snack-yellow/5 to-snack-orange/10 relative overflow-hidden font-sans">

      {/* Décorations flottantes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 bg-snack-orange rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-snack-red rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-snack-yellow rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-12 w-12 h-12 bg-snack-orange rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">

        {/* Logo et titre */}
        <motion.div {...fadeIn(0)} className="mb-12">
          <div className="flex justify-center mb-6">
            <div className="inline-block bg-gradient-to-r from-snack-red to-snack-orange p-6 rounded-full shadow-2xl animate-bounce">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-snack-red via-snack-orange to-snack-yellow drop-shadow-lg">
            Bienvenue chez SnackZinabi
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mt-6 max-w-3xl mx-auto leading-relaxed">
            La plateforme moderne dédiée aux <span className="font-semibold text-snack-red">chefs cuisiniers professionnels</span>.
            Gérez vos commandes, optimisez votre service et offrez une expérience culinaire exceptionnelle à vos clients.
          </p>
        </motion.div>

        {/* Fonctionnalités principales */}
        <motion.div {...fadeIn(0.2)} className="grid md:grid-cols-3 gap-8 mb-12 max-w-5xl w-full">
          {[
            {
              icon: <Users className="w-8 h-8 text-white" />,
              title: "Gestion Client",
              desc: "Interface intuitive pour prendre et gérer les commandes",
              gradient: "from-snack-red to-snack-orange",
            },
            {
              icon: <ChefHat className="w-8 h-8 text-white" />,
              title: "Tableau de Bord",
              desc: "Suivi en temps réel de toutes vos préparations",
              gradient: "from-snack-orange to-snack-yellow",
            },
            {
              icon: <Utensils className="w-8 h-8 text-white" />,
              title: "Service Optimisé",
              desc: "Notifications intelligentes et workflow simplifié",
              gradient: "from-snack-yellow to-snack-red",
            },
          ].map((item, i) => (
            <Card
              key={i}
              className="bg-white/80 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-transform hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-full mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Boutons d'action */}
        <motion.div {...fadeIn(0.4)} className="flex flex-col sm:flex-row gap-6 mb-10">
          <Link to="/signup">
            <Button
              size="lg"
              className="group relative px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden bg-gradient-to-r from-snack-orange to-snack-yellow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center gap-2">
                Créer un compte
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>

          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="group relative px-8 py-4 text-lg font-semibold border-2 border-snack-red text-snack-red rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:bg-snack-red hover:text-white"
            >
              <span className="relative flex items-center gap-2">
                Se connecter
                <Star className="w-5 h-5 transition-transform group-hover:rotate-12" />
              </span>
            </Button>
          </Link>
        </motion.div>

        {/* Message final */}
        <motion.div {...fadeIn(0.6)} className="text-center max-w-3xl mx-auto">
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            Rejoignez-nous pour une aventure culinaire inoubliable où chaque plat raconte une histoire
          </p>
          <div className="flex justify-center items-center space-x-2">
            <Sparkles className="w-5 h-5 text-snack-red animate-pulse" />
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-snack-red rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-snack-orange rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-snack-yellow rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <Sparkles className="w-5 h-5 text-snack-yellow animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
