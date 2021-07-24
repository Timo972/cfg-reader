const { Octokit } = require("@octokit/rest");
const StreamZip = require("node-stream-zip");
const download = require("download");
const fs = require("fs");

const octokit = new Octokit();

if (process.platform !== "win32" && process.platform !== "linux")
  throw new Error(
    `This platform (${process.platform}) does not support alt-node!`
  );

const isWin = process.platform === "win32";

async function main() {
  const releases = await octokit.repos
    .getLatestRelease({
      owner: "altmp",
      repo: "alt-node",
    })
    .catch((e) => {
      throw new Error(`Could not fetch alt-node releases: ${e}`);
    });

  const fileName = isWin
    ? "node-windows-release.zip"
    : "node-linux-release.zip";
  const binarieOutPath = `deps/alt-node`;
  const binariesAsset = releases.data.assets.find((x) => x.name === fileName);

  if (!binariesAsset)
    throw new Error(`Could not find binaries in latest release`);

  console.log(
    `Downloading node binary: ${binariesAsset.name} (${binariesAsset.browser_download_url})`
  );

  await download(binariesAsset.browser_download_url, binarieOutPath).catch(
    (e) => {
      throw new Error(
        `Could not download alt-node asset ${binariesAsset.name}`
      );
    }
  );

  const zipFile = `${binarieOutPath}/${fileName}`;

  const zip = new StreamZip.async({
    file: zipFile,
  });

  console.log(`Unzipped binaries`);

  const outReleasePath = `${binarieOutPath}/Release`;

  if (!fs.existsSync(outReleasePath))
    fs.mkdirSync(outReleasePath, { recursive: true });

  const entries = await zip.entries();
  for (const entry of Object.values(entries)) {
    const desc = entry.isDirectory ? "directory" : `${entry.size} bytes`;
    console.log(`Entry ${entry.name}: ${desc}`);
    await zip.extract(entry, outReleasePath);
    if (entry.name.includes("libnode.lib"))
      fs.renameSync(
        `${outReleasePath}/${entry.name}`,
        `${outReleasePath}/${entry.name.replace(/lib/, "")}`
      );
  }

  fs.unlinkSync(zipFile);
}

main();
