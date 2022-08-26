FROM glowman554/deno:latest

WORKDIR /srv

COPY . .

ENTRYPOINT [ "/root/.deno/bin/deno", "run", "-A", "--unstable", "server.ts" ]
