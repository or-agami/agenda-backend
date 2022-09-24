
FROM node:16.17.0-alpine3.16

WORKDIR /public

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3000 NODE_ENV=production CRYPTR_SECRET=agenda-secret-1234 DB_URL=mongodb+srv://agami:agamimongo@cluster0.ojpsmci.mongodb.net/?retryWrites=true&w=majority

EXPOSE 3000

CMD [ "npm", "start"]