import * as vscode from "vscode"

const regexes = {
    "rr1": new RegExp("[rd]+(r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a))$"),
    "r1": new RegExp("(^r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$)|(sp)"),
    "d1": new RegExp("^d([012345b])$"),
    "rr": new RegExp(`\\br(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|17|a)\\b`),
    "rm": new RegExp(`(#-reset-vars-)[\\s\\S]*?(#-reset-vars-)`),
    "oldSpace": new RegExp("^[\\t ]+", "gmi"),
    "strStart": new RegExp("^\".+$"),
    "strEnd": new RegExp(".+\"$"),
}

export class ic10Formatter {
    public resultText: string
    private readonly text: string
    private labels: {}
    private lines: Array<string>
    private commands: any
    private position: number
    private jumps: {
        jal: Object;
        j: {
            ra: Array<number>
        }
    }
    private document: vscode.TextDocument
    private vars: Set<string>
    private functions: Object
    private spaces: Array<any>
    private loops: Object


    constructor(document: vscode.TextDocument) {
        this.document = document
        this.text = document.getText()
        this.resultText = this.text + ""
        this.labels = {}
        this.functions = {}
        this.loops = {}
        this.spaces = []
        this.vars = new Set
        this.jumps = {
            j: {
                ra: []
            },
            jal: {},
        }

        this.text = this.text.replace(regexes.oldSpace, "")
        this.text = this.text.replace(regexes.rm, "")
        this.init(this.text)
        this.formatStart()
    }

    init(text: string) {
        this.labels = {}
        this.functions = {}
        this.loops = {}
        this.spaces = []
        this.vars = new Set
        this.jumps = {
            j: {
                ra: []
            },
            jal: {},
        }

        const self = this

        this.lines = text.split(/\r?\n/)
        const commands = this.lines
            .map((line: string) => {
                let m = regexes.rr.exec(line)
                if (m) {
                    self.vars.add(m[0])
                }
                const args = line.trim().split(/ +/)
                const command = args.shift()
                return {command, args}
            })
        for (const commandsKey in this.lines) {
            if (commands.hasOwnProperty(commandsKey)) {
                let command = commands[commandsKey]
                const newArgs = {}
                let mode = 0
                let argNumber = 0
                for (let argsKey in command.args) {
                    if (command.args.hasOwnProperty(argsKey)) {
                        let arg = command.args[argsKey]
                        if (arg.startsWith("#")) {
                            break
                        }
                        if (mode === 0) {
                            argNumber++
                        }
                        if (regexes.strStart.test(arg)) {
                            mode = 1
                        }
                        if (argNumber in newArgs) {
                            newArgs[argNumber] += " " + arg
                        } else {
                            newArgs[argNumber] = arg
                        }
                        if (regexes.strEnd.test(arg)) {
                            mode = 0
                        }
                    }
                }
                commands[commandsKey].args = Object.values(newArgs)
            } else {
                commands.push({command: "", args: []})
            }
        }
        this.commands = commands
        this.position = 0
        while (this.position < this.commands.length) {
            let {command, args} = this.commands[this.position]
            this.position++
            if (command.match(/^\w+:$/)) {
                this.labels[command.replace(":", "")] = this.position
            }
            if (command == "j" && (args[0] == "ra" || args[0] == "r17")) {
                this.jumps.j.ra.push(this.position)
            } else {
                if (command == "j" || command == "jr" || command == "jal") {
                    if (typeof this.jumps[command] == "undefined") {
                        this.jumps[command] = {}
                    }
                    if (typeof this.jumps[command][args[0]] == "undefined") {
                        this.jumps[command][args[0]] = []
                    }
                    this.jumps[command][args[0]].push(this.position)
                }
            }
        }
        this.position = 0
        return this
    }

    formatStart() {
        this.addResetVar()
        this.init(this.text)
        let maxIterations = 1
        for (let o = 0; o < maxIterations; o++) {
            const lineCount = this.lines.length
            for (let i = 0; i < lineCount; i++) {
                let line = this.lines[i]
                if (i == 0) {
                    if ((/^\s*$/.test(line) || !line)) {
                        this.lines.splice(0, 1)
                        maxIterations++
                        break
                    }
                }
                if (i + 1 <= lineCount) {
                    let nextLine = this.lines[i + 1]
                    if ((/^\s*$/.test(nextLine) || !nextLine) && (/^\s*$/.test(line) || !line)) {
                        this.lines.splice(i, 1)
                        maxIterations++
                        break
                    }
                }
            }
        }
        const new_txt = this.lines.join("\n")
        this.init(new_txt)
        this.findFunctions()
        this.findLoos()

        this.renderSpaces()
        this.resultText = this.lines.join("\n")
    }

    addResetVar() {
        // var txt = '#-reset-vars-' + "\n"
        // this.vars.forEach((value) => {
        // 	txt += `move ${value} 0` + "\n"
        // })
        // txt += '#-reset-vars-' + "\n"
        // this.text = txt + this.text
    }

    renderSpaces() {
        let fn
        this.spaces = []
        this.lines.forEach(() => {
            this.spaces.push(0)
        })
        for (const functionsKey in this.functions) {
            fn = this.functions[functionsKey]
            let start = fn.start
            let end = fn.end - 2
            this.spaces.forEach(function (value, i, arr) {
                if (i >= start && i <= end) {
                    arr[i] = value + 1
                }
            })
        }
        for (const loopsKey in this.loops) {
            fn = this.loops[loopsKey]
            let start = fn.start
            let end = fn.end - 2
            this.spaces.forEach(function (value, i, arr) {
                if (i >= start && i <= end) {
                    arr[i] = value + 1
                }
            })
        }
        this.lines.forEach((val, i, arr) => {
            arr[i] = val.padStart(this.spaces[i] + val.trim().length, "\t")
        })
    }

    findFunctions() {
        for (const labelsKey in this.labels) {
            try {
                let position = this.labels[labelsKey]
                if (this.jumps.jal.hasOwnProperty(labelsKey)) {
                    this.jumps.j.ra.sort((a, b) => {
                        return b - a
                    })
                    let j_pos = 0
                    this.jumps.j.ra.forEach((v) => {
                        if (v > position) {
                            j_pos = v
                            return true
                        }
                    })
                    this.functions[labelsKey] = {
                        start: position,
                        end: j_pos,
                        calls: this.jumps.jal[labelsKey]
                    }
                }
            } catch (e) {
                // console.warn(e)
            }
        }
    }

    findLoos() {
        for (const labelsKey in this.labels) {
            try {
                let position = this.labels[labelsKey]
                if (labelsKey in this.jumps.j) {
                    this.jumps.j[labelsKey].sort((a, b) => {
                        return b - a
                    })
                    let j_pos = 0
                    this.jumps.j[labelsKey].forEach((v) => {
                        if (v > position) {
                            j_pos = v
                            return true
                        }
                    })
                    this.loops[labelsKey] = {
                        start: position,
                        end: j_pos,
                        calls: this.jumps.j[labelsKey]
                    }
                }
            } catch (e) {
                // console.warn(e)
            }
        }
    }
}
