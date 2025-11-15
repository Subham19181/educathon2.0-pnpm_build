# 1. Start from a clean Node.js "shipping container"
FROM node:20-alpine

# 2. Set the internal working folder
WORKDIR /app

# 3. Copy the package lists
COPY package.json ./
COPY package-lock.json ./

# 4. Install all your Node.js libraries
RUN npm install

# 5. Copy the rest of your frontend code
COPY . .

# 6. Tell Docker the container will use port 3000
EXPOSE 3000

# 7. The command to run when the container starts
CMD ["npm", "run", "dev"]