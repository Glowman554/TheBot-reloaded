FROM node:16-bullseye-slim

RUN apt update && apt install -y python3 make gcc build-essential

WORKDIR /srv

COPY . .

RUN npm install

ENTRYPOINT [ "node", ".", "/data/connection.json" ]
