FROM node:24 as build

ARG REACT_APP_AUTH_REDIRECT_URL
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_PUBLIC_URL
ARG PUBLIC_URL
ARG API_BASE_URL
ARG REACT_APP_COMMIT_HASH
ENV REACT_APP_COMMIT_HASH=$REACT_APP_COMMIT_HASH

COPY src/package.json src/package-lock.json /app/src/
COPY .git /app/src/.git
RUN cd /app/src/ && npm install

COPY src/ /app/src/
RUN cd /app/src/ && npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/src/build/ /usr/share/nginx/html
