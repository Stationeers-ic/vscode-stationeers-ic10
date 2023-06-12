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
exports.parseEnv = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const Device_1 = require("../../ic10/src/devices/Device");
const fs = __importStar(require("fs"));
const Utils_1 = require("../../ic10/src/Utils");
const yaml_1 = __importDefault(require("yaml"));
function parseEnv(ic10, file) {
    let env;
    env = path_1.default.join(path_1.default.dirname(file), 'env.yml');
    if (fs.existsSync(env)) {
        const content = fs.readFileSync(env, { encoding: 'utf-8' });
        const config = yaml_1.default.parse(content);
        fs.writeFileSync("C:\\projects\\vscode-stationeers-ic10\\test.d2.json", JSON.stringify(config, null, 2));
        Object.entries(config).forEach(([key, value]) => {
            if (key) {
                const fields = {};
                value.map((item) => {
                    Object.entries(item).map(([k, v]) => {
                        fields[k] = v;
                    });
                });
                let hash;
                if (fields.PrefabHash !== undefined) {
                    if (typeof fields.PrefabHash === 'string') {
                        hash = (0, Utils_1.hashStr)(fields.PrefabHash);
                    }
                    else {
                        hash = fields.PrefabHash;
                    }
                    fields.PrefabHash = hash;
                }
                const d = new Device_1.DebugDevice(2, fields);
                ic10.memory.environ.set(key, d);
            }
        });
        return ic10;
    }
    env = path_1.default.join(path_1.default.dirname(file), '.env');
    if (fs.existsSync(env)) {
        const config = dotenv_1.default.config({ path: env }).parsed;
        Object.entries(config).forEach(([key, value]) => {
            if (key) {
                let hash;
                if (isNaN(parseInt(value))) {
                    hash = (0, Utils_1.hashStr)(value);
                }
                else {
                    hash = parseInt(value);
                }
                const d = new Device_1.DebugDevice(2, { Setting: 0, PrefabHash: hash });
                ic10.memory.environ.set(key, d);
            }
        });
        return ic10;
    }
}
exports.parseEnv = parseEnv;
//# sourceMappingURL=utils.js.map