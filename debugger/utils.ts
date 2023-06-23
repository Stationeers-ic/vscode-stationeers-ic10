import path from "path";
import dotenv from "dotenv";
import * as fs from "fs";
import YAML from 'yaml'
import toml from "toml";
import InterpreterIc10 from "ic10";
import {TypeRM} from "ic10/src/icTypes";
import {Reagent} from "ic10/src/data/reagents";
import vscode from "vscode";

export function parseEnvironment(ic10: InterpreterIc10, file: string):string {
    let env
    const n = basename(file)
    const f = path.join(path.dirname(file), n)
    env = `${f}.toml`;
    if (fs.existsSync(env)) {
        parseToml(ic10, env);
        return env;
    }
    env = `${f}.yml`;
    if (fs.existsSync(env)) {
        parseYaml(ic10, env);
        return env;
    }
    env = `${f}.env`;
    if (fs.existsSync(env)) {
        parseEnv(ic10, env);
        return env;
    }

    env = path.join(path.dirname(f), '.toml');
    if (fs.existsSync(env)) {
        parseToml(ic10, env);
        return env;
    }
    env = path.join(path.dirname(f), '.yml');
    if (fs.existsSync(env)) {
        parseYaml(ic10, env);
        return env;
    }
    env = path.join(path.dirname(f), '.env');
    if (fs.existsSync(env)) {
        parseEnv(ic10, env);
        return env;
    }
    return "Не найден файл окружения"
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
        [key: `d${number}`]: { [key: string]: number } & { reagents: Partial<Record<TypeRM, Partial<Record<Reagent, number>>>> }
    }
    Object.entries(config).forEach(([key, value]) => {
        if (key) {
            const fields: { [key: string]: number } = {}
            let reagents: Partial<Record<TypeRM, Partial<Record<Reagent, number>>>> = {}
            for (const valueKey in value) {
                if (valueKey.toLowerCase() !== 'reagents') {
                    fields[valueKey] = value[valueKey];
                } else {
                    reagents = value[valueKey] as Partial<Record<TypeRM, Partial<Record<Reagent, number>>>>
                }
            }

            ic10.connectDevice(key, fields.PrefabHash, 2, fields, {reagents:reagents})
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
