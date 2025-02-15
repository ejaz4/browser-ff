import axios from 'axios';
import { log } from '..';
import fs from 'fs';
import { posix, resolve, sep } from 'path';
import execa from 'execa';
import { homedir } from 'os';

export const downloadArtifacts = async () => {
  if(process.platform !== "win32") log.error("This is not a Windows machine, will not download artifacts.")

  const filename = "mozbuild.tar.bz2"
  const url = `https://github.com/dothq/windows-artifacts/releases/latest/download/mozbuild.tar.bz2`;
  let home = homedir().split(sep).join(posix.sep)

  if(process.platform == "win32") {
    home = "/" + home.replace(/\:/, "").replace(/\\/g, "/").toLowerCase();
  }

  log.info(`Downloading Windows artifacts...`)

  const { data, headers } = await axios.get(url, { 
      responseType: "stream"
  })
  
  const length = headers['content-length']

  const writer = fs.createWriteStream(resolve(process.cwd(), filename))
  
  let receivedBytes = 0;

  data.on("data", (chunk: any) => {
      receivedBytes += chunk.length;
  
      let rand = Math.floor(Math.random() * 1000 + 1);

      if(rand > 999.5) {
          let percentCompleted = parseInt(Math.round(((receivedBytes * 100) / length)).toFixed(0));
          if((percentCompleted % 2 == 0) || percentCompleted >= 100) return;
          log.info(`\t${filename}\t${percentCompleted}%...`)
      }
  })

  data.pipe(writer)

  data.on("end", async () => {
      log.info("Unpacking mozbuild...")

      await execa("tar", ["-xvf", filename, "-C", home])

      log.info("Done extracting mozbuild artifacts.")
  })
}