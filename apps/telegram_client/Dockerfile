FROM debian:bullseye-slim

RUN apt update && apt install -y make cmake gcc build-essential libboost-all-dev libssl-dev libcurl3-openssl-dev

WORKDIR /srv

COPY docker_build/. .

RUN mkdir build; cd build; cmake ..; make; cp telegram_client ../ -v

ENTRYPOINT [ "./telegram_client", "/data/connection.json"]