FROM node:22.16.0-alpine

WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app

COPY bin ./bin
COPY packages ./packages
COPY apps/socket-server ./apps/socket-server

RUN ./bin/init apps/socket-server
RUN npm run build
RUN rm -rf node_modules
RUN npm install --omit=dev

USER node
ENTRYPOINT ["npm", "run", "start"]
