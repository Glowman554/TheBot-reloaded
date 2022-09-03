FROM debian:bullseye-slim

RUN apt update && apt install -y curl make cmake gcc build-essential libboost-all-dev libssl-dev libcurl3-openssl-dev

WORKDIR /srv

COPY docker_build/. .

WORKDIR /srv/build

RUN cmake ..
RUN make
RUN cp telegram_client ../ -v

WORKDIR /srv
RUN strip telegram_client

ENTRYPOINT [ "./telegram_client", "/data/connection.json"]