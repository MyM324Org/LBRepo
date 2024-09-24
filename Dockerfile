# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY . .

# Install the dependencies
RUN yarn install

RUN yarn lint --fix

RUN yarn test

RUN yarn build

# Copy the source code to the container
WORKDIR /app/build

EXPOSE 3000

# Start the server when the container starts
CMD ["yarn", "start"]
