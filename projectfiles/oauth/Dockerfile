FROM  node:current-bullseye
WORKDIR /oauth
COPY . .
RUN npm install
EXPOSE 3001
CMD ["node", "server.js"]
