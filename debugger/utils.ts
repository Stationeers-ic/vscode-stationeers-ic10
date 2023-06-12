import path from "path";
import dotenv from "dotenv";
import {DebugDevice} from "../../ic10/src/devices/Device";
import InterpreterIc10 from "../../ic10";
import * as fs from "fs";
import {hashStr} from "../../ic10/src/Utils";
import YAML from 'yaml'

export function parseEnv(ic10: InterpreterIc10, file: string) {
    let env
    env = path.join(path.dirname(file), 'env.yml');
    if (fs.existsSync(env)) {
        const content = fs.readFileSync(env, {encoding: 'utf-8'})
        const config = YAML.parse(content) as {
            [key: `d${number}`]: { [key: string]: number }[]
        }
        fs.writeFileSync("C:\\projects\\vscode-stationeers-ic10\\test.d2.json", JSON.stringify(config, null, 2))
        Object.entries(config).forEach(([key, value]) => {
            if (key) {
                const fields: { [key: string]: number  } = {}
                value.map((item) => {
                    Object.entries(item).map(([k, v]) => {
                        fields[k] = v
                    })
                })
                let hash: number;
                if (fields.PrefabHash !== undefined) {
                    if (typeof fields.PrefabHash === 'string') {
                        hash = hashStr(fields.PrefabHash)
                    } else {
                        hash = fields.PrefabHash
                    }
                    fields.PrefabHash = hash
                }
                const d = new DebugDevice(2, fields)
                ic10.memory.environ.set(key, d)
            }
        })
        return ic10
    }

    env = path.join(path.dirname(file), '.env');
    if (fs.existsSync(env)) {
        const config = dotenv.config({path: env}).parsed as { [key: string]: string }
        Object.entries(config).forEach(([key, value]) => {
            if (key) {
                let hash: number;
                if (isNaN(parseInt(value))) {
                    hash = hashStr(value)
                } else {
                    hash = parseInt(value)
                }
                const d = new DebugDevice(2, {Setting: 0, PrefabHash: hash})
                ic10.memory.environ.set(key, d)
            }
        })
        return ic10
    }

}
