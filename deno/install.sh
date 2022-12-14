#!/bin/sh
# Copyright 2019 the Deno authors. All rights reserved. MIT license.
# TODO(everyone): Keep this script simple and easily auditable.

set -e

if ! command -v unzip >/dev/null; then
	echo "Error: unzip is required to install Deno (see: https://github.com/denoland/deno_install#unzip-is-required)." 1>&2
	exit 1
fi

version="v1.29.1"

if [ "$OS" = "Windows_NT" ]; then
	target="x86_64-pc-windows-msvc"
else
	case $(uname -sm) in
	"Darwin x86_64") deno_uri="https://github.com/denoland/deno/releases/download/${version}/deno-x86_64-apple-darwin.zip" ;;
	"Darwin arm64") deno_uri="https://github.com/denoland/deno/releases/download/${version}/deno-aarch64-apple-darwin.zip" ;;
	"Linux aarch64") deno_uri="https://github.com/LukeChannings/deno-arm64/releases/download/${version}/deno-linux-arm64.zip" ;;
	*) deno_uri="https://github.com/denoland/deno/releases/download/${version}/deno-x86_64-unknown-linux-gnu.zip" ;;
	esac
fi

echo "Downloading from ${deno_uri}"

deno_install="${DENO_INSTALL:-/usr}"
bin_dir="$deno_install/bin"
exe="$bin_dir/deno"

if [ ! -d "$bin_dir" ]; then
	mkdir -p "$bin_dir"
fi

curl --fail --location --progress-bar --output "$exe.zip" "$deno_uri"
unzip -d "$bin_dir" -o "$exe.zip"
chmod +x "$exe"
rm "$exe.zip"

echo "Deno was installed successfully to $exe"
if command -v deno >/dev/null; then
	echo "Run 'deno --help' to get started"
else
	case $SHELL in
	/bin/zsh) shell_profile=".zshrc" ;;
	*) shell_profile=".bashrc" ;;
	esac
	echo "Manually add the directory to your \$HOME/$shell_profile (or similar)"
	echo "  export DENO_INSTALL=\"$deno_install\""
	echo "  export PATH=\"\$DENO_INSTALL/bin:\$PATH\""
	echo "Run '$exe --help' to get started"
fi
