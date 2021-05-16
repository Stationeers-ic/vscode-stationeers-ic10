"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ic10Diagnostics = exports.Ic10DiagnosticsName = void 0;
const vscode = __importStar(require("vscode"));
exports.Ic10DiagnosticsName = 'ic10_diagnostic';
var functions = require('../media/ic10.functions.json');
class DiagnosticsError {
    constructor(message, lvl, start, length, line) {
        this.message = message;
        this.lvl = lvl;
        this.range = new vscode.Range(line, start, line, start + length);
    }
}
class Ic10Diagnostics {
    constructor() {
    }
    clear(doc, container) {
        container.set(doc.uri, []);
    }
    run(doc, container) {
        const diagnostics = [];
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            console.log(lineIndex);
            try {
                this.parseLine(doc, lineIndex);
            }
            catch (e) {
                if (e instanceof DiagnosticsError) {
                    diagnostics.push(this.createDiagnostic(e.range, e.message, e.lvl));
                }
            }
        }
        if (doc.lineCount > 128) {
            diagnostics.push(this.createDiagnostic(new vscode.Range(128, 0, 128, 1), 'Max line', vscode.DiagnosticSeverity.Error));
        }
        container.set(doc.uri, diagnostics);
    }
    parseLine(doc, lineIndex) {
        const lineOfText = doc.lineAt(lineIndex);
        if (lineOfText.text.trim().length > 0) {
            var text = lineOfText.text.trim();
            console.log(functions);
            var test = functions.some((substring) => {
                if (text.startsWith('#')) {
                    return true;
                }
                text = text.replace(/#.+$/, '');
                text = text.trim();
                if (text.endsWith(':')) {
                    return true;
                }
                if (text.startsWith(substring)) {
                    return true;
                }
                else {
                    return false;
                }
            });
            if (!test) {
                throw new DiagnosticsError(`Unknown function "${text}"`, vscode.DiagnosticSeverity.Error, 0, text.length, lineIndex);
            }
        }
    }
    createDiagnostic(range, message, lvl) {
        const diagnostic = new vscode.Diagnostic(range, message, lvl);
        diagnostic.code = exports.Ic10DiagnosticsName;
        return diagnostic;
    }
}
exports.ic10Diagnostics = new Ic10Diagnostics;
//# sourceMappingURL=ic10.diagnostics.js.map