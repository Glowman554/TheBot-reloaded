FROM glowman554/deno:latest

WORKDIR /srv

COPY . .

ENTRYPOINT [ "/root/.deno/bin/deno", "run", "-A", "server.ts", "/data/config.cfg" ]stop
