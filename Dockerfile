FROM node:20-alpine

WORKDIR /app

# Copy package manifests first to leverage Docker cache for dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of the project source files
COPY . .

# Expose the Vite port
EXPOSE 5274

# Run assets build and start Vite bound to all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]