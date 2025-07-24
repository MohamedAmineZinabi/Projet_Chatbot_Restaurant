# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste
COPY . .

# Exposer le port Vite
EXPOSE 5173

CMD ["npm", "run", "dev"]
