-- Script d'initialisation de la base de données ChatRestaurant

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS ChatRestaurant;
USE ChatRestaurant;

-- Table utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    disabled BOOLEAN DEFAULT FALSE
);

-- Table conversations
CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'en_cours'
);

-- Table messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT,
    text TEXT,
    is_user BOOLEAN,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Table commandes
CREATE TABLE IF NOT EXISTS commandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    type_viande VARCHAR(50),
    legumes TEXT,
    sauces TEXT,
    taille VARCHAR(20),
    table_numero INT,
    conversation_id INT,
    user_email VARCHAR(255) NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Ajout de la contrainte de clé étrangère pour user_email dans commandes
-- (Cette requête peut échouer si la colonne existe déjà, c'est normal)
ALTER TABLE commandes 
ADD CONSTRAINT fk_commandes_user_email 
FOREIGN KEY (user_email) REFERENCES users(email) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Création d'un utilisateur de test (optionnel)
-- INSERT INTO users (email, name, hashed_password) VALUES 
-- ('admin@restaurant.com', 'Admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.sUyWG');
-- (Le mot de passe hashé correspond à 'password123') 