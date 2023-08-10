FROM node:18 as build

COPY src/ /app/src/
RUN cd /app/src/ && npm install && npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/src/build/ /usr/share/nginx/html