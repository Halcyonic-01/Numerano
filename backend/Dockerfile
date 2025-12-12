FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# Install nodemon globally in the container just in case
RUN npm install -g nodemon 
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]