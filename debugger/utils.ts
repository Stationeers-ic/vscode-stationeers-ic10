import path from "path";
import dotenv from "dotenv";
import {crc32} from "crc";
import {DebugDevice} from "../../ic10/src/devices/Device";
import InterpreterIc10 from "../../ic10";

export function parseEnv(ic10: InterpreterIc10, file: string) {
    try {
        const env = path.join(path.dirname(file), '.env');
        const config = dotenv.config({path: env}).parsed as { [key: string]: string }
        Object.entries(config).forEach(([key, value]) => {
            if (key) {
                let hash: number;
                if (isNaN(parseInt(value))) {
                    hash = crc32(value)
                } else {
                    hash = parseInt(value)
                }
                const d = new DebugDevice(2, {PrefabHash: hash})
                ic10.memory.environ.set(key, d)
            }
        })
    } catch (e) {
    }
    return ic10
}
