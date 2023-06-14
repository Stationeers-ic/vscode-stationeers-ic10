import path from "path";
import dotenv from "dotenv";
import InterpreterIc10 from "../../ic10";
import * as fs from "fs";
import YAML from 'yaml'
import toml from "toml";

export function parseEnvironment(ic10: InterpreterIc10, file: string) {
    let env
    const n = basename(file)
    const f = path.join(path.dirname(file), n)
    env = `${f}.toml`;
    if (fs.existsSync(env)) {
        parseToml(ic10, env);
    }
    env = `${f}.yml`;
    if (fs.existsSync(env)) {
        parseYaml(ic10, env);
    }
    env = `${f}.env`;
    if (fs.existsSync(env)) {
        parseEnv(ic10, env);
    }

    env = path.join(path.dirname(f), '.toml');
    if (fs.existsSync(env)) {
        parseToml(ic10, env);
    }
    env = path.join(path.dirname(f), '.yml');
    if (fs.existsSync(env)) {
        parseYaml(ic10, env);
    }
    env = path.join(path.dirname(f), '.env');
    if (fs.existsSync(env)) {
        parseEnv(ic10, env);
    }
}

function basename(file: string): string {
    const bName = path.basename(file)
    const aName = bName.split(".").filter((ext) => {
        let e = ext.toLowerCase()
        return e !== 'ic10' && e !== 'icx'
    })
    return aName.join('.')
}

function parseToml(ic10: InterpreterIc10, env: string) {
    const content = fs.readFileSync(env, {encoding: 'utf-8'})
    const config = toml.parse(content) as {
        [key: `d${number}`]: { [key: string]: number }
    }

    Object.entries(config).forEach(([key, value]) => {
        if (key) {
            const fields: { [key: string]: number } = {}
            for (const valueKey in value) {
                fields[valueKey] = value[valueKey];
            }
            ic10.connectDevice(key, fields.PrefabHash, 2, fields)
        }
    })
    return ic10
}

function parseYaml(ic10: InterpreterIc10, env: string) {
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

function parseEnv(ic10: InterpreterIc10, env: string) {
    const config = dotenv.config({path: env}).parsed as { [key: string]: string }
    Object.entries(config).forEach(([key, value]) => {
        if (key) {
            ic10.connectDevice(key, value, 2, {})
        }
    })
    return ic10
}
