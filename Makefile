fmt:
	deno fmt --options-use-tabs --options-line-width 1000

fmt-commit:
	deno fmt --options-use-tabs --options-line-width 1000
	git add .
	git commit -m "reformat code"

build:
	sudo docker-compose build

up: build
	sudo docker-compose up

up-detach: build
	sudo docker-compose up -d

down:
	sudo docker-compose down

run-server:
	(cd apps/server; deno run -A server.ts)

run-whatsapp-client:
	(cd apps/whatsapp_client; node . ../../connection.json)

run-discord-client:
	(cd apps/discord_client; node . ../../connection.json)

run-docker-proxy:
	(cd apps/docker_proxy; deno run --unstable -A server.ts)