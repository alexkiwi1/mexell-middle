FROM node:20-alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json ./

RUN yarn install && chown -R node:node /usr/src/node-app

COPY --chown=node:node . .

USER node

EXPOSE 5002

CMD ["node", "src/index.js"]
