FROM node:16-bullseye-slim

WORKDIR /srv

COPY . .

RUN npm install

ENTRYPOINT [ "node", ".", "thebestbot" ]