FROM node:24.11.0-alpine
WORKDIR /usr/src/app

COPY bin ./bin
COPY packages ./packages
COPY apps/cart ./apps/cart

RUN ./bin/init apps/cart \
  && npm run build \
  && rm -rf node_modules \
  && npm cache verify \
  && npm cache clean --force \
  && npm install --omit=dev

EXPOSE 3000
ENTRYPOINT ["npm", "run", "start"]
