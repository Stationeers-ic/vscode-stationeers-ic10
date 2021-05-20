import * as vscode from "vscode";
export declare const Ic10DiagnosticsName = "ic10_diagnostic";
declare class Ic10Diagnostics {
    private jumps;
    private aliases;
    private errors;
    constructor();
    clear(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void;
    run(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void;
    parseLine(doc: vscode.TextDocument, lineIndex: any): void;
    analyzeFunctionInputs(words: string[], text: string, lineIndex: number): errorMsg | true;
    parseOpRule(op: any, value: any, start: any, text: any, lineIndex: any): boolean;
    createDiagnostic(range: vscode.Range, message: string, lvl: number): vscode.Diagnostic;
    empty(a: any): boolean;
}
interface errorMsg {
    msg?: string;
    lvl?: number;
    length?: number;
}
export declare var ic10Diagnostics: Ic10Diagnostics;
export {};
