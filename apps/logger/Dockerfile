FROM node:24.11.0-alpine

WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app

COPY bin ./bin
COPY packages ./packages
COPY apps/logger ./apps/logger


RUN ./bin/init apps/logger \
  && npm run build \
  && rm -rf node_modules \
  && npm cache verify \
  && npm cache clean --force \
  && npm install --omit=dev

EXPOSE 3000

USER node
ENTRYPOINT ["npm", "run", "start"]
