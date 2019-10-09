FROM harbor.showcode.info/library/nginx:alpine
ADD ./build /usr/share/nginx/html
EXPOSE 80
