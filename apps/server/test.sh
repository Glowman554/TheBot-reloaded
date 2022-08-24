curl -X POST -d '{ "token": "thebestbot" }' http://localhost:8080/v1/commands
curl -X POST -d '{ "token": "thebestbot", "section": "websocket", "key": "port" }' http://localhost:8080/v1/config/get
curl -X POST -d '{ "token": "thebestbot" }' http://localhost:8080/v1/config/gen
curl -X POST -d '{ "token": "thebestbot", "file": "router" }' http://localhost:8080/v1/log/get
