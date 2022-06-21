"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.icXFormatter = void 0;
const icx_compiler_1 = require("icx-compiler");
const classes_1 = require("icx-compiler/src/classes");
const regexes = {
    'rr1': new RegExp("[rd]+(r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a))$"),
    'r1': new RegExp("(^r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$)|(sp)"),
    'd1': new RegExp("^d([012345b])$"),
    'rr': new RegExp(`\\br(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|17|a)\\b`),
    'rm': new RegExp(`(#-reset-vars-)[\\s\\S]*?(#-reset-vars-)`),
    'oldSpace': new RegExp("^[\\t ]+", 'gmi'),
    'strStart': new RegExp("^\".+$"),
    'strEnd': new RegExp(".+\"$"),
};
class icXFormatter {
    text;
    labels;
    lines;
    commands;
    position;
    jumps;
    resultText;
    document;
    vars;
    functions;
    spaces;
    loops;
    icxOptions;
    icX;
    constructor(document, icxOptions) {
        this.document = document;
        this.icxOptions = icxOptions;
        this.text = document.getText();
        this.resultText = '';
        this.text = this.text.replace(regexes.oldSpace, '');
        this.lines = this.text.split(/\r?\n/);
        this.icX = new icx_compiler_1.icX(this.text, icxOptions);
        this.init();
    }
    init() {
        this.labels = {};
        this.functions = {};
        this.loops = {};
        this.spaces = [];
        this.vars = new Set;
        this.jumps = {
            j: {
                ra: []
            },
            jal: {},
        };
        const self = this;
        const commands = this.lines
            .map((line) => {
            let m = regexes.rr.exec(line);
            if (m) {
                self.vars.add(m[0]);
            }
            const args = line.trim().split(/ +/);
            const command = args.shift();
            return { command, args };
        });
        for (const commandsKey in this.lines) {
            if (commands.hasOwnProperty(commandsKey)) {
                let command = commands[commandsKey];
                const newArgs = {};
                let mode = 0;
                let argNumber = 0;
                for (let argsKey in command.args) {
                    if (command.args.hasOwnProperty(argsKey)) {
                        let arg = command.args[argsKey];
                        if (arg.startsWith("#")) {
                            break;
                        }
                        if (mode === 0) {
                            argNumber++;
                        }
                        if (regexes.strStart.test(arg)) {
                            mode = 1;
                        }
                        if (argNumber in newArgs) {
                            newArgs[argNumber] += ' ' + arg;
                        }
                        else {
                            newArgs[argNumber] = arg;
                        }
                        if (regexes.strEnd.test(arg)) {
                            mode = 0;
                        }
                    }
                }
                commands[commandsKey].args = Object.values(newArgs);
            }
            else {
                commands.push({ command: '', args: [] });
            }
        }
        this.commands = commands;
        this.position = 0;
        while (this.position < this.commands.length) {
            let { command, args } = this.commands[this.position];
            this.position++;
            if (command.match(/^\w+:$/)) {
                this.labels[command.replace(":", "")] = this.position;
            }
            if (command == 'j' && (args[0] == 'ra' || args[0] == 'r17')) {
                this.jumps.j.ra.push(this.position);
            }
            else {
                if (command == 'j' || command == 'jr' || command == 'jal') {
                    if (typeof this.jumps[command] == "undefined") {
                        this.jumps[command] = {};
                    }
                    if (typeof this.jumps[command][args[0]] == "undefined") {
                        this.jumps[command][args[0]] = [];
                    }
                    this.jumps[command][args[0]].push(this.position);
                }
            }
        }
        this.position = 0;
        this.findLoos();
        this.renderSpaces();
        this.recursiveSpace(this.icX.structure.content);
        this.resultText = this.lines.join('\n');
    }
    addSpace(text, count) {
        return '\t'.repeat(count) + text;
    }
    recursiveSpace(content, level = 0) {
        for (const contentKey in content) {
            if (content.hasOwnProperty(contentKey)) {
                const c = content[contentKey];
                if (c instanceof classes_1.icXBlock) {
                    for (let i = c.originalPosition + 1; i <= c.end; i++) {
                        this.lines[i] = this.addSpace(this.lines[i], level + 1);
                    }
                    this.recursiveSpace(c.content, level);
                }
                else if (c instanceof classes_1.icXElem) {
                    this.lines[c.originalPosition] = this.addSpace(this.lines[c.originalPosition], level);
                }
            }
        }
    }
    renderSpaces() {
        for (const loopsKey in this.loops) {
            const fn = this.loops[loopsKey];
            let start = fn.start;
            let end = fn.end - 2;
            for (let i = start; i <= end; i++) {
                this.lines[i] = this.addSpace(this.lines[i], 1);
            }
        }
    }
    findLoos() {
        for (const labelsKey in this.labels) {
            try {
                let position = this.labels[labelsKey];
                if (labelsKey in this.jumps.j) {
                    this.jumps.j[labelsKey].sort((a, b) => {
                        return b - a;
                    });
                    let j_pos = 0;
                    this.jumps.j[labelsKey].forEach((v) => {
                        if (v > position) {
                            j_pos = v;
                            return true;
                        }
                    });
                    this.loops[labelsKey] = {
                        start: position,
                        end: j_pos,
                        calls: this.jumps.j[labelsKey]
                    };
                }
            }
            catch (e) {
            }
        }
    }
}
exports.icXFormatter = icXFormatter;
//# sourceMappingURL=icX.formatter.js.map