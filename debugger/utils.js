"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEnv = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const crc_1 = require("crc");
const Device_1 = require("../../ic10/src/devices/Device");
function parseEnv(ic10, file) {
    try {
        const env = path_1.default.join(path_1.default.dirname(file), '.env');
        const config = dotenv_1.default.config({ path: env }).parsed;
        Object.entries(config).forEach(([key, value]) => {
            if (key) {
                let hash;
                if (isNaN(parseInt(value))) {
                    hash = (0, crc_1.crc32)(value);
                }
                else {
                    hash = parseInt(value);
                }
                const d = new Device_1.DebugDevice(2, { PrefabHash: hash });
                ic10.memory.environ.set(key, d);
            }
        });
    }
    catch (e) {
    }
    return ic10;
}
exports.parseEnv = parseEnv;
//# sourceMappingURL=utils.js.map