FROM nginx:1.20
COPY ./dist/build/h5 /usr/share/nginx/html/h5/station
COPY ./nginx.conf /etc/nginx/conf.d