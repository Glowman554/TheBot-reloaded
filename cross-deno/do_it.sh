function compile_for {
	echo "building deno for $1"
	(
		cd deno
		cross build --target $1 --release
	)
}

if [ -d "deno" ]; then
	echo "Not re-downloading!"
else
	echo "Downloading..."
	git clone https://github.com/denoland/deno --depth 1 --recurse
fi

cargo install -f cross

sudo chown $USER:$USER /var/run/docker.sock

compile_for aarch64-unknown-linux-gnu

sudo chown root:root /var/run/docker.sock
