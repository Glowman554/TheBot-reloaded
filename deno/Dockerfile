FROM debian:bullseye-slim

RUN apt update && apt install -y unzip curl

COPY install.sh /opt/install-deno.sh
RUN bash /opt/install-deno.sh

ENTRYPOINT [ "deno" ]