set -ex
sudo docker build -t alice .

sudo docker kill alice || true
sudo docker rm alice || true
sudo docker run -d -p 5555:5555 --name alice --restart always alice