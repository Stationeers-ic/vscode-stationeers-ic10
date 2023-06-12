import path from "path";
import dotenv from "dotenv";
import InterpreterIc10 from "../../ic10";
import * as fs from "fs";
import YAML from 'yaml'
import toml from "toml";

export function parseEnv(ic10: InterpreterIc10, file: string) {
    let env
    env = path.join(path.dirname(file), 'env.toml');
    if (fs.existsSync(env)) {
        const content = fs.readFileSync(env, {encoding: 'utf-8'})
        const config = toml.parse(content)
        Object.entries(config).forEach(([key, value]) => {
            if (key) {
                // const fields: { [key: string]: number } = {}
                // value.map((item) => {
                //     Object.entries(item).map(([k, v]) => {
                //         fields[k] = v
                //     })
                // })
                // ic10.connectDevice(key, fields.PrefabHash, 2, fields)
            }
        })
        return ic10
    }

    env = path.join(path.dirname(file), 'env.yml');
    if (fs.existsSync(env)) {
        const content = fs.readFileSync(env, {encoding: 'utf-8'})
        const config = YAML.parse(content) as {
            [key: `d${number}`]: { [key: string]: number }[]
        }
        Object.entries(config).forEach(([key, value]) => {
            if (key) {
                const fields: { [key: string]: number } = {}
                value.map((item) => {
                    Object.entries(item).map(([k, v]) => {
                        fields[k] = v
                    })
                })
                ic10.connectDevice(key, fields.PrefabHash, 2, fields)
            }
        })
        return ic10
    }

    env = path.join(path.dirname(file), '.env');
    if (fs.existsSync(env)) {
        const config = dotenv.config({path: env}).parsed as { [key: string]: string }
        Object.entries(config).forEach(([key, value]) => {
            if (key) {
                ic10.connectDevice(key, value, 2, {})
            }
        })
        return ic10
    }

}
