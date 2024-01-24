import fs from 'fs/promises';
import {PathLike} from "node:fs";
export async function checkFileExists(filePath:PathLike) {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        return false;
    }
}