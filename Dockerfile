FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY ./.output/app /usr/share/nginx/html