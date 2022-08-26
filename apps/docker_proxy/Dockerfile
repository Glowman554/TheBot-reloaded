FROM glowman554/deno:latest

WORKDIR /srv

COPY . .

ENTRYPOINT [ "deno", "run", "-A", "--unstable", "server.ts" ]
