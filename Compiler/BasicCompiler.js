"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicCompiler = void 0;
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("fs/promises"));
const vscode_1 = __importDefault(require("vscode"));
const helpers_1 = require("../core/helpers");
const path_1 = __importDefault(require("path"));
class BasicCompiler {
    code;
    hash;
    compiler;
    tmpInput;
    tmpOutput;
    tmpError;
    actual = false;
    vscodeFolder;
    constructor(code, hash) {
        this.code = code;
        this.hash = hash;
        if (process.platform !== 'win32') {
            throw new Error('Only Windows is supported');
        }
        this.compiler = __dirname + '/BASIC IC10 Compiler for Stationeers.exe';
        const workspaceFolder = vscode_1.default.workspace.workspaceFolders[0];
        this.vscodeFolder = path_1.default.join(workspaceFolder.uri.fsPath, '.vscode', 'tmp', String(hash));
        this.tmpInput = path_1.default.join(this.vscodeFolder, `input.txt`);
        this.tmpOutput = path_1.default.join(this.vscodeFolder, `output.txt`);
        this.tmpError = path_1.default.join(this.vscodeFolder, `error.txt`);
    }
    async checkActual() {
        if (await (0, helpers_1.checkFileExists)(this.tmpInput)) {
            await promises_1.default.readFile(this.tmpOutput, 'utf8') === this.code ? this.actual = true : this.actual = false;
        }
        return this.actual;
    }
    async compile() {
        return new Promise(async (resolve, reject) => {
            if (!await (0, helpers_1.checkFileExists)(this.vscodeFolder)) {
                console.warn(this.vscodeFolder);
                try {
                    await promises_1.default.mkdir(this.vscodeFolder, { recursive: true });
                }
                catch (e) {
                    console.error(e);
                }
            }
            await promises_1.default.writeFile(this.tmpInput, this.code);
            await promises_1.default.writeFile(this.tmpError, "");
            const ls = (0, child_process_1.spawn)(this.compiler, ['compile', '-input', this.tmpInput, '-output', this.tmpOutput, '-error', this.tmpError, '-batchmode']);
            ls.on('close', async (code) => {
                const output = await promises_1.default.readFile(this.tmpOutput, 'utf8');
                const errors = await this.parseErrors();
                if (code === 0) {
                    this.actual = true;
                    resolve({
                        output,
                        errors,
                    });
                }
                else {
                    reject(code);
                }
            });
        });
    }
    async parseErrors() {
        return (await promises_1.default.readFile(this.tmpError, 'utf8')).split('\n');
    }
    async getErrors() {
        if (this.actual) {
            return this.parseErrors();
        }
        else {
            return (await this.compile()).errors;
        }
    }
}
exports.BasicCompiler = BasicCompiler;
