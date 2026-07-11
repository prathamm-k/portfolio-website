# Use the official lightweight Nginx image based on Alpine Linux
FROM nginx:alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the static website files and folders to the Nginx HTML directory
COPY . /usr/share/nginx/html/

# Clean-URL routing: /projects -> projects.html (see nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
