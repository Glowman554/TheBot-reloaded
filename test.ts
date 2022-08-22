import denocker from "https://deno.land/x/denocker@v0.2.0/index.ts";

const app = new denocker("/var/run/docker.sock");
console.log(await app.containers.list());
