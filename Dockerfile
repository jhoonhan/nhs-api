# Dockerfile
FROM mysql:8.0

# Environment variables
ENV MYSQL_ROOT_PASSWORD=test
ENV MYSQL_DATABASE=roster

# Initialize the database
COPY ./database_init.sql /docker-entrypoint-initdb.d/