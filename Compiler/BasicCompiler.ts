import {spawn} from 'child_process'
import fs from "fs/promises"
import {hashStr} from "ic10/src/Utils";
import vscode from "vscode";
import {checkFileExists} from "../core/helpers";
import path from "path";


export class BasicCompiler {
    public compiler: string
    public tmpInput: string
    public tmpOutput: string
    public tmpError: string
    public actual: boolean = false
    public vscodeFolder: string;

    constructor(public code: string, public hash: string) {
        if (process.platform !== 'win32') {
            throw new Error('Only Windows is supported')
        }
        this.compiler = __dirname + '/BASIC IC10 Compiler for Stationeers.exe'
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        this.vscodeFolder = path.join(workspaceFolder.uri.fsPath, '.vscode', 'tmp', String(hash));
        this.tmpInput = path.join(this.vscodeFolder, `input.txt`)
        this.tmpOutput = path.join(this.vscodeFolder, `output.txt`)
        this.tmpError = path.join(this.vscodeFolder, `error.txt`)
    }

    async checkActual() {
        if (await checkFileExists(this.tmpInput)) {
            await fs.readFile(this.tmpOutput, 'utf8') === this.code ? this.actual = true : this.actual = false
        }
        return this.actual;
    }

    public async compile(): Promise<{ output: string, errors: string[] }> {
        return new Promise(async (resolve, reject) => {
            if (!await checkFileExists(this.vscodeFolder)) {
                console.warn(this.vscodeFolder)
                try {
                    await fs.mkdir(this.vscodeFolder, {recursive: true})
                } catch (e) {
                    console.error(e)
                }
            }
            await fs.writeFile(this.tmpInput, this.code)
            await fs.writeFile(this.tmpError, "")
            // запустить компилятор ".\BASIC IC10 Compiler for Stationeers.exe" compile -input ".\input.bas" -output ".\output.ic" -error ".\error.txt" -batchmode
            const ls = spawn(this.compiler, ['compile', '-input', this.tmpInput, '-output', this.tmpOutput, '-error', this.tmpError, '-batchmode'])
            ls.on('close', async (code: number) => {
                const output = await fs.readFile(this.tmpOutput, 'utf8')
                const errors = await this.parseErrors()
                if (code === 0) {
                    this.actual = true;
                    resolve({
                        output,
                        errors,
                    })
                } else {
                    reject(code)
                }
            })
        })
    }

    async parseErrors() {
        return (await fs.readFile(this.tmpError, 'utf8')).split('\n');
    }

    async getErrors() {
        if (this.actual) {
            return this.parseErrors()
        } else {
            return (await this.compile()).errors
        }
    }
}