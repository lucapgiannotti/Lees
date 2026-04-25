# frontend/Dockerfile
FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass the API URL at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

EXPOSE 5173

# Using --host is correct for Docker networking
CMD ["npm", "run", "dev", "--", "--host"]