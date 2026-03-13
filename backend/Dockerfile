# Create container based on node version 20 and alpine
FROM node:20-alpine

# Create working directroy
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all the neccessary dependencies listed in the package files and 
# Install texlive-full to use LaTeX (Therefore the above mentioned alpine version of node is needed)
RUN npm install && \
    apk add texlive-full

# Copy all the other files into the working directory
COPY . .

# Set the port on which the container communicates to the host to 8000
EXPOSE 8000 27017

# Run the command to start the server in the console
CMD [ "npm", "start" ]