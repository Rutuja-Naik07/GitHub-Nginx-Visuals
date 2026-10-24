FROM nginx:alpine

# Copy only the site files into NGINX's default web root
COPY index.html style.css script.js /usr/share/nginx/html/

EXPOSE 80

# nginx:alpine already starts NGINX in the foreground, so no CMD is needed
