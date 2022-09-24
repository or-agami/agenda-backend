
FROM node:16.17.0-alpine3.16

WORKDIR /public

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3000 NODE_ENV=production

EXPOSE 3000

CMD [ "npm", "start"]