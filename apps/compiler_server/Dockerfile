FROM glowman554/deno:latest

RUN apt install gcc g++ rustc python3 golang default-jdk make git pkg-config flex bison protobuf-compiler libnl-route-3-dev -y

RUN git clone https://github.com/google/nsjail.git
WORKDIR /nsjail
RUN make
RUN cp ./nsjail /bin/.

WORKDIR /srv
COPY . .

ENTRYPOINT [ "deno", "run", "-A", "server.ts" ]
