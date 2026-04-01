import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const verify = args.includes("--verify");

const env = { ...process.env };
for (const key of [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "ALL_PROXY",
  "GIT_HTTP_PROXY",
  "GIT_HTTPS_PROXY",
]) {
  delete env[key];
}

if (verify) {
  env.VERIFY = "true";
}

const command =
  "npx hardhat run --network sepolia scripts/deploy-sepolia.ts --build-profile production";

const child =
  process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", command], {
        stdio: "inherit",
        env,
        cwd: process.cwd(),
      })
    : spawn("sh", ["-lc", command], {
        stdio: "inherit",
        env,
        cwd: process.cwd(),
      });

child.on("exit", (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
