FROM node:8.10

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn generate:db_types
RUN yarn build

EXPOSE 8080

CMD [ "node", "dist/server.js" ]
