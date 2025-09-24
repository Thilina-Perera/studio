# Use an official Node.js runtime as a parent image
FROM node:20.10.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Firebase tools globally for the emulator
RUN npm install -g firebase-tools

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Expose the ports for the app and the emulator
EXPOSE 9002 8080
