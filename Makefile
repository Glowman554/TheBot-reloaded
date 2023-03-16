fmt:
	deno fmt --options-use-tabs --options-line-width 1000 --ignore=libs/bot_server_client_cpp,apps/telegram_client/bot_server_client,apps/telegram_client/tgbot-cpp,apps/telegram_client/docker_build

fmt-commit:
	deno fmt --options-use-tabs --options-line-width 1000 --ignore=libs/bot_server_client_cpp,apps/telegram_client/bot_server_client,apps/telegram_client/tgbot-cpp,apps/telegram_client/docker_build
	git add .
	git commit -m "reformat code"

# build_prepare:
# 	make -C apps/telegram_client

build:
	make -C deno
	sudo docker-compose build

up: build
	sudo docker-compose up

up-detach: build
	sudo docker-compose up -d

down:
	sudo docker-compose down

update:
	git pull
	make up-detach

run-server:
	(cd apps/server; deno run -A server.ts)

test-server:
	(cd apps/server; deno test -A)

run-whatsapp-client:
	(cd apps/whatsapp_client; node . ../../connection.json)

run-discord-client:
	(cd apps/discord_client; node . ../../connection.json)

run-docker-proxy:
	(cd apps/docker_proxy; deno run --unstable -A server.ts)

run-compiler-server:
	(cd apps/compiler_server; deno run -A server.ts)
