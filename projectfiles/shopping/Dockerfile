FROM  node:current-bullseye
WORKDIR /oauth
COPY . .
RUN npm install
EXPOSE 3002
CMD ["node", "server.js"]
