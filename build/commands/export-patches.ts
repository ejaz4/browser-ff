import { resolve } from "path";
import execa from "execa";
import { createWriteStream, existsSync, mkdirSync, rmdirSync, writeFileSync } from "fs";
import { log } from "..";
import manualPatches from "../manual-patches";
import { copySync, ensureDirSync } from "fs-extra";

const flags: {
    [key: string]: string
} = {
    D: "delete",
    M: "modify",
    A: "add"
}

const getFiles = async (flags: string, cwd: string) => {
    const { stdout: files } = await execa("git", ["diff", `--diff-filter=${flags}`, "--name-only", "--ignore-space-at-eol"], { cwd })
    const fileNames: any = files.split("\n").map(f => {
        if(f.length !== 0) return f.replace(/\//g, "-").replace(/\./g, "-") + ".patch"
        else return
    })

    return { files, fileNames };
}

const exportModified = async (patchesDir: string, cwd: string) => {
    const { files, fileNames } = await getFiles("M", cwd);

    await Promise.all(files.split("\n").map(async (file, i) => {
        if(file) {
            const proc = execa("git", ["diff", "--src-prefix=a/", "--dst-prefix=b/", "--full-index", file], { cwd, stripFinalNewline: false });
            const name = fileNames[i];
    
            proc.stdout?.pipe(createWriteStream(resolve(patchesDir, name)))
            log.info(`Wrote "${name}" to patches directory.`)
        }
    }))
}

const exportFlag = async (flag: string, cwd: string, actions: any[]) => {
    const { files } = await getFiles(flag, cwd);

    actions.push({
        action: flags[flag],
        target: files.split("\n")
    })

    return actions;
}

const exportManual = async (cwd: string) => {
    return new Promise(async (resol) => {
        manualPatches.forEach(patch => {
            if(patch.action == "copy") {
                if(typeof(patch.src) == "string") {
                    const inSrc = resolve(cwd, patch.src);
                    const outsideSrc = resolve(process.cwd(), "common", patch.src);

                    if(!existsSync(inSrc)) return log.error(`Cannot find "${patch.src}" from manual patches.`);
                    if(!existsSync(outsideSrc)) ensureDirSync(outsideSrc); // make sure target dir exists before copying

                    copySync(
                        inSrc,
                        outsideSrc
                    );

                    log.info(`Updated manual patch "${patch.src}".`)
                } else if(Array.isArray(patch.src)) {
                    patch.src.forEach(p => {
                        const inSrc = resolve(cwd, p);
                        const outsideSrc = resolve(process.cwd(), "common", p);

                        if(!existsSync(inSrc)) return log.error(`Cannot find "${p}" from manual patches.`);
                        if(!existsSync(outsideSrc)) ensureDirSync(outsideSrc); // make sure target dir exists before copying

                        copySync(
                            inSrc,
                            outsideSrc
                        );

                        log.info(`Updated manual patch "${p}".`)
                    })
                }
            }
        })
    })
}

export const exportPatches = async () => {
    const patchesDir = resolve(process.cwd(), "patches");
    const cwd = resolve(process.cwd(), "src");

    let actions: any[] = []

    log.info(`Wiping patches directory...`);
    console.log();
    rmdirSync(patchesDir, { recursive: true });
    mkdirSync(patchesDir);

    log.info("Exporting modified files...");
    await exportModified(patchesDir, cwd);
    console.log();

    log.info("Exporting deleted files...");
    await exportFlag("D", cwd, actions);
    console.log();

    log.info("Exporting manual patches...");
    await exportManual(cwd);
    console.log();

    // log.info("Exporting added files...");
    // await exportFlag("A", cwd, actions);
    // console.log();
}