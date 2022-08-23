FROM debian:bullseye-slim

RUN apt update && apt install -y curl unzip
RUN curl -fsSL https://deno.land/install.sh | sh

RUN apt install gcc g++ rustc python3 golang default-jdk make git pkg-config flex bison protobuf-compiler libnl-route-3-dev -y

RUN git clone https://github.com/google/nsjail.git
WORKDIR /nsjail
RUN make
RUN cp ./nsjail /bin/.

WORKDIR /srv
COPY . .

ENTRYPOINT [ "/root/.deno/bin/deno", "run", "-A", "server.ts" ]