FROM debian:bullseye-slim

RUN apt update && apt install -y curl unzip
RUN curl -fsSL https://raw.githubusercontent.com/Glowman554/TheBot-reloaded/main/deno/install.sh | sh

WORKDIR /srv

COPY . .

ENTRYPOINT [ "/root/.deno/bin/deno", "run", "-A", "--unstable", "server.ts" ]
