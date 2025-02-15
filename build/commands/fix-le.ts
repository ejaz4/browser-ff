import { readdirSync } from "fs-extra";
import { resolve } from "path";
import { dispatch } from "../dispatch"

export const fixLineEndings = async () => {
    const patches = readdirSync(resolve(process.cwd(), "patches"));

    await Promise.all(patches.map(async (patch) => {
        await dispatch("dos2unix", [patch], resolve(process.cwd(), "patches"));
    }));
}