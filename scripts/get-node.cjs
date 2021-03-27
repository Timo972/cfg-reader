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

  //if(!fs.existsSync(binarieOutPath))
  //  fs.mkdirSync(binarieOutPath)

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

  const outReleasePath = `${binarieOutPath}/out/Release`;

  if (!fs.existsSync(outReleasePath))
    fs.mkdirSync(outReleasePath, { recursive: true });

  const entries = await zip.entries();
  for (const entry of Object.values(entries)) {
    const desc = entry.isDirectory ? "directory" : `${entry.size} bytes`;
    console.log(`Entry ${entry.name}: ${desc}`);
    zip.extract(entry, outReleasePath);
  }

  //await zip.close();

  fs.rmSync(zipFile);
}

main();

/*
const buildPath = path.join(__dirname, '..', 'deps', 'alt-node', 'alt-build');
const outPath = path.join(__dirname, '..', 'deps', 'alt-node', 'Release');
const donePath = path.join(__dirname, '..', 'deps', 'alt-node-build', 'Release');

if(!fs.existsSync(buildPath))
    throw new Error(`alt-node submodule not found`);

if(process.platform !== 'win32' && process.platform !== 'darwin')
    throw new Error(`This platform (${process.platform}) is not supported!`);

const nodeBuild = process.platform === 'win32' ? spawn('alt-release.bat', {
    cwd: buildPath
}) : spawn('./alt-release.sh', {
    cwd: buildPath
});

nodeBuild.stdout.pipe(process.stdout);
nodeBuild.stderr.pipe(process.stderr);

nodeBuild.on('close', (code, signal) => {
    if(!fs.existsSync(outPath))
        throw new Error(`Compiling alt-node failed!`);

    fse.copySync(outPath, donePath);
});*/
