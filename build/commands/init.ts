import execa from "execa"
import { existsSync, readFileSync } from "fs"
import { posix, resolve, sep } from "path"
import { log, bin_name } from ".."
import { dispatch } from "../dispatch"

export const init = async (directory: string) => {
    if(process.platform == "win32") {
        // Because Windows cannot handle paths correctly, we're just calling a script as the workaround.
        log.info("Successfully downloaded browser source. Please run |./windows-init.sh| to finish up.")
        process.exit(-1);
    } 

    log.info(`Initialising through Git...`)

    const cwd = process.cwd();
    
    const dir = resolve(cwd, directory);

    if(!existsSync(dir)) {
        log.error(`Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`)
    }

    const version = readFileSync(resolve(cwd, directory, "browser", "config", "version_display.txt"), "utf-8");

    if(!version) log.error(`Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`);

    await dispatch("git", ["init"], dir);
    await dispatch("git", ["checkout", "--orphan", version], dir);
    await dispatch("git", ["add", "-f", "."], dir);
    await dispatch("git", ["commit", "-am", `"Firefox ${version}"`], dir);
    await dispatch("git", ["checkout", "-b", "dot"], dir);
} 