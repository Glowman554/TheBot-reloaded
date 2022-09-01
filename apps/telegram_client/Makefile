prepare_docker_build:
	rm -r docker_build || exit 0
	mkdir -p /tmp/docker_build

	cp ./* /tmp/docker_build/. -r
	rm /tmp/docker_build/bot_server_client
	cp ../../libs/bot_server_client_cpp /tmp/docker_build/bot_server_client -r

	mv /tmp/docker_build .