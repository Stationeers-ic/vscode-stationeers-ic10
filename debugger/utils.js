"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEnvironment = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs = __importStar(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const toml_1 = __importDefault(require("toml"));
function parseEnvironment(ic10, file) {
    let env;
    const n = basename(file);
    const f = path_1.default.join(path_1.default.dirname(file), n);
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
    env = path_1.default.join(path_1.default.dirname(f), '.toml');
    if (fs.existsSync(env)) {
        parseToml(ic10, env);
        return env;
    }
    env = path_1.default.join(path_1.default.dirname(f), '.yml');
    if (fs.existsSync(env)) {
        parseYaml(ic10, env);
        return env;
    }
    env = path_1.default.join(path_1.default.dirname(f), '.env');
    if (fs.existsSync(env)) {
        parseEnv(ic10, env);
        return env;
    }
    return "Не найден файл окружения";
}
exports.parseEnvironment = parseEnvironment;
function basename(file) {
    const bName = path_1.default.basename(file);
    const aName = bName.split(".").filter((ext) => {
        let e = ext.toLowerCase();
        return e !== 'ic10' && e !== 'icx';
    });
    return aName.join('.');
}
function parseToml(ic10, env) {
    const content = fs.readFileSync(env, { encoding: 'utf-8' });
    const config = toml_1.default.parse(content);
    Object.entries(config).forEach(([key, value]) => {
        if (key) {
            const fields = {};
            let reagents = {};
            for (const valueKey in value) {
                if (valueKey.toLowerCase() !== 'reagents') {
                    fields[valueKey] = value[valueKey];
                }
                else {
                    reagents = value[valueKey];
                }
            }
            ic10.connectDevice(key, fields.PrefabHash, 2, fields, { reagents: reagents });
        }
    });
    return ic10;
}
function parseYaml(ic10, env) {
    const content = fs.readFileSync(env, { encoding: 'utf-8' });
    const config = yaml_1.default.parse(content);
    Object.entries(config).forEach(([key, value]) => {
        if (key) {
            const fields = {};
            value.map((item) => {
                Object.entries(item).map(([k, v]) => {
                    fields[k] = v;
                });
            });
            ic10.connectDevice(key, fields.PrefabHash, 2, fields);
        }
    });
    return ic10;
}
function parseEnv(ic10, env) {
    const config = dotenv_1.default.config({ path: env }).parsed;
    Object.entries(config).forEach(([key, value]) => {
        if (key) {
            ic10.connectDevice(key, value, 2, {});
        }
    });
    return ic10;
}
//# sourceMappingURL=utils.js.map