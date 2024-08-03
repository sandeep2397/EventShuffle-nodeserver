FROM node:lts-alpine

WORKDIR /server

ENV NODE_ENV production

COPY . .

RUN npm ci

CMD ["npm", "run", "start"]