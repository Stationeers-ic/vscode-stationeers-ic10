import * as vscode from "vscode"
import {Ic10DiagnosticError} from "ic10/src/Ic10Error";
import InterpreterIc10 from "ic10";
import {parseEnvironment} from "../debugger/utils";
import {isConst} from "ic10/src/icTypes";

export const Ic10DiagnosticsName = "ic10_diagnostic"
const manual: {
    "type": string,
    "op1": string | null,
    "op2": string | null,
    "op3": string | null,
    "op4": string | null,
    "op5": string | null,
    "op6": string | null,
    "description": {
        "preview": string | null,
        "text": string | null
    }
}[] = require("../languages/en.json")
const functions: string[] = require("../media/ic10.functions.json")
const keywords: string[] = require("../media/ic10.keyword.json")

export const regexes = {
    "rr1": new RegExp("[r]{1,}(r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a))$"),
    "dr1": new RegExp("[d]{1,}(r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a))$"),
    "r1": new RegExp("(^r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$)|(^sp$)"),
    "d1": new RegExp("^d(0|1|2|3|4|5|b)$"),
    "hash": new RegExp("HASH\\(.+\\)"),
    "chanel": new RegExp("d[0-5]:[0-7]"),
    "rr": new RegExp(`\\br(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|17|a)\\b`),
    "rm": new RegExp(`(#-reset-vars-)[\\s\\S]{0,}?(#-reset-vars-)`),
    "oldSpace": new RegExp("^[\\t ]+", "gmi"),
    "strStart": new RegExp("^\".+$"),
    "strEnd": new RegExp(".+\"$"),
}

export class DiagnosticsError {
    public range: vscode.Range
    public message: string
    public lvl: number
    public line: number
    public hash: string

    constructor(message: string, lvl, start: number, length: number, line) {
        this.line = line
        this.message = message
        this.lvl = lvl
        this.range = new vscode.Range(line, start, line, start + length)
        this.hash = this.message.replace(/\s+/, "") + line
    }
}

export class DiagnosticsErrors {
    public values: DiagnosticsError[] = []
    private index: string[] = []

    push(a: DiagnosticsError) {
        if (this.index.indexOf(a.hash) < 0) {
            this.index.push(a.hash)
            this.values.push(a)
        }
    }

    reset() {
        this.values = []
        this.index = []
    }
}

export class Ic10Diagnostics {
    public jumps: string[]
    public aliases: string[]
    public errors: DiagnosticsErrors

    constructor() {
        this.errors = new DiagnosticsErrors
    }

    clear(doc: vscode.TextDocument, container: vscode.DiagnosticCollection) {
        container.set(doc.uri, [])
    }

    prepare(doc: vscode.TextDocument) {
        this.jumps = []
        this.aliases = []
        this.errors.reset()
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            try {
                this.parseLine(doc, lineIndex)
            } catch (e) {
                console.warn(e)
            }
        }
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            try {
                this.parseLine2(doc, lineIndex)
            } catch (e) {
                console.warn(e)
            }
        }
        const interpreterIc10 = new InterpreterIc10(doc.getText());
        parseEnvironment(interpreterIc10, doc.uri.fsPath)
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            try {
                interpreterIc10.settings.executionCallback = (e) => {
                    if (e instanceof Ic10DiagnosticError) {
                        const lineOfText = doc.lineAt(lineIndex)

                        let start = 0
                        let len = lineOfText.text.length
                        if (typeof e.obj === 'string') {
                            start = lineOfText.text.indexOf(e.obj)
                            if (start !== -1) {
                                len = e.obj.length
                            } else {
                                start = 0
                            }
                        }
                        this.errors.push(new DiagnosticsError(e.message, e.lvl, start, len, lineIndex))
                    }
                }
                interpreterIc10.prepareLine(lineIndex, true)
            } catch (e) {
            }
        }

    }

    run(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void {
        const diagnostics: vscode.Diagnostic[] = []
        this.prepare(doc)

        for (const de of this.errors.values) {
            diagnostics.push(this.createDiagnostic(de.range, de.message, de.lvl))
        }
        if (doc.lineCount > 128) {
            diagnostics.push(this.createDiagnostic(new vscode.Range(128, 0, 128, 1), "Max line", vscode.DiagnosticSeverity.Error))
        }
        container.set(doc.uri, diagnostics)
    }

    parseLine2(doc: vscode.TextDocument, lineIndex) {
        const lineOfText = doc.lineAt(lineIndex)
        if (lineOfText.text.trim().length > 0) {
            let text = lineOfText.text.trim()
            functions.some((substring) => {
                if (text.startsWith("#")) {
                    if (text.startsWith("#log")) {
                        this.errors.push(new DiagnosticsError(`Debug function: "${text}"`, 2, 0, text.length, lineIndex))
                        return true
                    }
                    return true
                }
                text = text.replace(/#.+$/, "")
                text = text.trim()
                if (text.endsWith(":")) {
                    return true
                }
                if (text.startsWith(substring)) {
                    // console.log(this.aliases)
                    const words = (new InterpreterIc10).splitString(text)
                    this.analyzeFunctionInputs(words, text, lineIndex)
                    return true
                } else {
                    return false
                }

            }, this)
        }
    }

    parseLine(doc: vscode.TextDocument, lineIndex) {
        const lineOfText = doc.lineAt(lineIndex)
        if (lineOfText.text.trim().length > 0) {
            var text = lineOfText.text.trim()
            var test = functions.some((substring) => {
                if (text.startsWith("#")) {
                    if (text.startsWith("#log")) {
                        this.errors.push(new DiagnosticsError(`Debug function: "${text}"`, 2, 0, text.length, lineIndex))
                        return true
                    }
                    return true
                }
                text = text.replace(/#.+$/, "")
                text = text.trim()
                if (text.endsWith(":")) {
                    this.jumps.push(text)
                    this.aliases.push(text.replace(":", ""))
                    return true
                }
                if (text.startsWith(substring)) {
                    var words = text.split(/ +/)
                    if (text.startsWith("alias")) {
                        this.aliases.push(words[1])
                    }
                    if (text.startsWith("define")) {
                        this.aliases.push(words[1])
                    }
                    return true
                }
                return false
            }, this)
            this.aliases = [...new Set(this.aliases)]
            if (test === false) {
                this.errors.push(new DiagnosticsError(`Unknown function: "${text}"`, 0, 0, text.length, lineIndex))
            }
        }
    }

    analyzeFunctionInputs(words: string[], text: string, lineIndex: number): errorMsg | true {
        const fn = words[0] ?? null
        const op1 = words[1] ?? null;
        const op2 = words[2] ?? null
        const op3 = words[3] ?? null
        const op4 = words[4] ?? null
        const op5 = words[5] ?? null
        const op6 = words[6] ?? null

        if (!manual.hasOwnProperty(fn)) {
            this.errors.push(new DiagnosticsError(`Unknown function: "${text}"`, 0, 0, text.length, lineIndex))

            //return {length: fn.length, msg: `Unknown function "${fn}"`, lvl: 0};
        } else {
            var rule = manual[fn]
            if (rule.type == "Function") {
                if (op1 !== null && this.empty(rule.op1)) {
                    this.errors.push(new DiagnosticsError(`this function have\`t any Arguments: "${text}"`, 0, 0, text.length, lineIndex))
                    return true
                }
                if (!this.empty(op1) && !this.empty(rule.op1)) {
                    this.parseOpRule(rule.op1, op1, text.indexOf(op1, fn.length), text, lineIndex)
                } else if (this.empty(op1) && !this.empty(rule.op1)) {
                    this.errors.push(new DiagnosticsError(`missing first "Argument": "${text}"`, 0, 0, text.length, lineIndex))
                }
                if (!this.empty(op2) && !this.empty(rule.op2)) {
                    this.parseOpRule(rule.op2, op2, text.indexOf(op2, fn.length + op1.length), text, lineIndex)
                } else if (this.empty(op2) && !this.empty(rule.op2)) {
                    this.errors.push(new DiagnosticsError(`missing second "Argument": "${text}"`, 0, 0, text.length, lineIndex))
                }
                if (!this.empty(op3) && !this.empty(rule.op3)) {
                    this.parseOpRule(rule.op3, op3, text.indexOf(op3, fn.length + op1.length + op2.length), text, lineIndex)
                } else if (this.empty(op3) && !this.empty(rule.op3)) {
                    this.errors.push(new DiagnosticsError(`missing third "Argument": "${text}"`, 0, 0, text.length, lineIndex))
                }
                if (!this.empty(op4) && !this.empty(rule.op4)) {
                    this.parseOpRule(rule.op4, op4, text.indexOf(op4, fn.length + op1.length + op2.length + op3.length), text, lineIndex)
                } else if (this.empty(op4) && !this.empty(rule.op4)) {
                    this.errors.push(new DiagnosticsError(`missing fourth "Argument": "${text}"`, 0, 0, text.length, lineIndex))
                }
            } else {
                this.errors.push(new DiagnosticsError(`Unknown function: "${text}"`, 0, 0, text.length, lineIndex))
            }
        }
        return true
    }

    parseOpRule(op, value, start, text, lineIndex) {

        `
		R - один из регистров r0-r17, в прямой или косвенной адресации
		N - псевдоним, понятное имя, которое можно задать регистру или каналу данных
		D - один из входных портов db, d0-d5 в прямой или косвенной адресации
		S - номер слота порта db, d0-d5
		P - логический параметр порта db, d0-d5
		C - константа типа double, заданная непосредственно или по имени
		A - номер строки, неотрицательное целое число (нумерация начинается с 0)
		T - тэг
		O - смещение, целое число, указывающее смещение в строках кода относительно текущей
		RM - режим чтения реагентов, одно из Contents, Required или Recipe (можно 0, 1 или 2, соответственно)
		RC - код реагента
		H - хеш устройств, с которыми выполняется операция пакетного чтения lb или записи sb
		BM - режим пакетного чтения, одно из Average, Sum, Minimum или Maximum (можно 0, 1, 2 или 3, соотвественно)
		Y - текст
		`
        const ops = op.replace(/ */, "").split("/")
        let errors = 0
        const maxErrors = ops.length
        for (const o of ops) {
            switch (o.toUpperCase()) {
                case "T":
                case "RC":
                    break
                case "Y":
                    if (!isNaN(parseFloat(value))) {
                        errors++
                    }
                    if (regexes.rr1.test(value) || regexes.r1.test(value) || regexes.dr1.test(value) || regexes.d1.test(value)) {
                        errors++
                    }
                    break
                case "H":
                    if (isNaN(parseFloat(value)) && this.aliases.indexOf(value) < 0 && !regexes.hash.test(value)) {
                        errors++
                    }
                    break
                case "C":
                case "A":
                case "O":
                    if (!isConst(value) && isNaN(parseFloat(value)) && this.aliases.indexOf(value) < 0) {
                        errors++
                    }
                    break
                case "R":
                    if (!regexes.rr1.test(value) && !regexes.r1.test(value)) {
                        errors++
                    }
                    break
                case "N":
                    if (this.aliases.indexOf(value) < 0) {
                        errors++
                    }
                    break
                case "D":
                    if (!regexes.dr1.test(value) && !regexes.d1.test(value) && !regexes.chanel.test(value)) {
                        errors++
                    }
                    break
                case "S":
                    if (isNaN(parseFloat(value))) {
                        errors++
                    }
                    break
                case "P":
                    if (keywords.indexOf(value) < 0) {
                        errors++
                    }
                    break
                case "RM":
                    if (["Contents", "Required", "Recipe", 0, 1, 2, "0", "1", "2"].indexOf(value) < 0) {
                        errors++
                    }
                    break
                case "BM":
                    if (["Average", "Sum", "Minimum", "Maximum", 0, 1, 2, 3, "0", "1", "2", "3"].indexOf(value) < 0) {
                        errors++
                    }
                    break
                default :
                    break
            }
        }
        if (errors >= ops.length) {
            this.errors.push(new DiagnosticsError(`invalid parameter: ${value}, must be "${op}"`, 0, start, value.length, lineIndex))
        }
        return true
    }

    createDiagnostic(range: vscode.Range, message: string, lvl: number): vscode.Diagnostic {

        // create range that represents, where in the document the word is
        const diagnostic = new vscode.Diagnostic(range, message,
            lvl)
        diagnostic.code = Ic10DiagnosticsName
        return diagnostic
    }

    empty(a): boolean {
        if (a == null) {
            return true
        }
        switch (typeof a) {
            case "string":
                if (!a || a.trim() == "") {
                    return true
                } else {
                    return false
                }
            case "number":
                return Boolean(a)

        }
        return false
    }
}

export interface errorMsg {
    msg?: string,
    lvl?: number,
    length?: number
}

export var ic10Diagnostics = new Ic10Diagnostics
