# I use this simple Dockerfile to automatically build and run the project when I deploy new code to Railway.
# If you don't need to use Docker to deploy the app, this file can be safely ignored or removed.

FROM node:latest

WORKDIR /home/node/app

COPY . .

RUN npm install

EXPOSE 8000

CMD ["npm", "start"]

