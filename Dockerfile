FROM node:20
WORKDIR /app-Essaouira-Live--back
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:dev"]