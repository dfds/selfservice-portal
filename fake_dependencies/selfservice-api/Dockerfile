FROM node:19-alpine

WORKDIR /app
COPY . .
RUN npm install

ENTRYPOINT [ "npm", "run", "watch" ]