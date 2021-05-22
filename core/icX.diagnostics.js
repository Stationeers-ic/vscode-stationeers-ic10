"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.icXDiagnostics = exports.IcXDiagnosticsName = void 0;
const ic10_diagnostics_1 = require("./ic10.diagnostics");
var manual = require('../languages/en.json');
var functions = require('../media/ic10.functions.json');
var keywords = require('../media/ic10.keyword.json');
exports.IcXDiagnosticsName = 'icX_diagnostic';
class IcXDiagnostics extends ic10_diagnostics_1.Ic10Diagnostics {
    constructor() {
        super();
    }
    run(doc, container) {
        const diagnostics = [];
        this.prepare(doc);
        for (const de of this.errors.values) {
            diagnostics.push(this.createDiagnostic(de.range, de.message, de.lvl));
        }
        container.set(doc.uri, diagnostics);
    }
    parseLine(doc, lineIndex) {
        const lineOfText = doc.lineAt(lineIndex);
        if (lineOfText.text.trim().length > 0) {
            var text = lineOfText.text.trim();
            var test = functions.some((substring) => {
                if (text.startsWith('#')) {
                    if (text.startsWith('#log') || text.startsWith('debug')) {
                        this.errors.push(new ic10_diagnostics_1.DiagnosticsError(`Debug function: "${text}"`, 2, 0, text.length, lineIndex));
                        return true;
                    }
                    return true;
                }
                text = text.replace(/#.+$/, '');
                text = text.trim();
                if (text.endsWith(':')) {
                    this.jumps.push(text);
                    return true;
                }
                if (text.startsWith(substring)) {
                    var words = text.split(/ +/);
                    if (text.startsWith('alias')) {
                        this.aliases.push(words[1]);
                    }
                    if (text.startsWith('define')) {
                        this.aliases.push(words[1]);
                    }
                    this.analyzeFunctionInputs(words, text, lineIndex);
                }
                return false;
            }, this);
        }
    }
    analyzeFunctionInputs(words, text, lineIndex) {
        var fn = words[0] ?? null;
        var op1 = words[1] ?? null;
        var op2 = words[2] ?? null;
        var op3 = words[3] ?? null;
        var op4 = words[4] ?? null;
        if (!manual.hasOwnProperty(fn)) {
            return true;
        }
        else {
            var rule = manual[fn];
            if (rule.type == 'Function') {
                if (op1 !== null && this.empty(rule.op1)) {
                    this.errors.push(new ic10_diagnostics_1.DiagnosticsError(`this function have\`t any Arguments: "${text}"`, 0, 0, text.length, lineIndex));
                    return true;
                }
                if (!this.empty(op1) && !this.empty(rule.op1)) {
                    this.parseOpRule(rule.op1, op1, text.indexOf(op1, fn.length), text, lineIndex);
                }
                else if (this.empty(op1) && !this.empty(rule.op1)) {
                    this.errors.push(new ic10_diagnostics_1.DiagnosticsError(`missing first "Argument": "${text}"`, 0, 0, text.length, lineIndex));
                }
                if (!this.empty(op2) && !this.empty(rule.op2)) {
                    this.parseOpRule(rule.op2, op2, text.indexOf(op2, fn.length + op1.length), text, lineIndex);
                }
                else if (this.empty(op2) && !this.empty(rule.op2)) {
                    this.errors.push(new ic10_diagnostics_1.DiagnosticsError(`missing second "Argument": "${text}"`, 0, 0, text.length, lineIndex));
                }
                if (!this.empty(op3) && !this.empty(rule.op3)) {
                    this.parseOpRule(rule.op3, op3, text.indexOf(op3, fn.length + op1.length + op2.length), text, lineIndex);
                }
                else if (this.empty(op3) && !this.empty(rule.op3)) {
                    this.errors.push(new ic10_diagnostics_1.DiagnosticsError(`missing third "Argument": "${text}"`, 0, 0, text.length, lineIndex));
                }
                if (!this.empty(op4) && !this.empty(rule.op4)) {
                    this.parseOpRule(rule.op4, op4, text.indexOf(op4, fn.length + op1.length + op2.length + op3.length), text, lineIndex);
                }
                else if (this.empty(op4) && !this.empty(rule.op4)) {
                    this.errors.push(new ic10_diagnostics_1.DiagnosticsError(`missing fourth "Argument": "${text}"`, 0, 0, text.length, lineIndex));
                }
            }
            else {
                return true;
            }
        }
        return true;
    }
}
exports.icXDiagnostics = new IcXDiagnostics;
//# sourceMappingURL=icX.diagnostics.js.map