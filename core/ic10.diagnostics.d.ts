import * as vscode from "vscode";
export declare const Ic10DiagnosticsName = "ic10_diagnostic";
export declare const regexes: {
    rr1: RegExp;
    dr1: RegExp;
    r1: RegExp;
    d1: RegExp;
    rr: RegExp;
    rm: RegExp;
    oldSpace: RegExp;
    strStart: RegExp;
    strEnd: RegExp;
};
export declare class DiagnosticsError {
    range: vscode.Range;
    message: string;
    lvl: number;
    hash: string;
    constructor(message: string, lvl: any, start: number, length: number, line: any);
}
export declare class DiagnosticsErrors {
    values: DiagnosticsError[];
    private index;
    push(a: DiagnosticsError): void;
    reset(): void;
}
export declare class Ic10Diagnostics {
    jumps: string[];
    aliases: string[];
    errors: DiagnosticsErrors;
    constructor();
    clear(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void;
    prepare(doc: vscode.TextDocument): void;
    run(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void;
    parseLine2(doc: vscode.TextDocument, lineIndex: any): void;
    parseLine(doc: vscode.TextDocument, lineIndex: any): void;
    analyzeFunctionInputs(words: string[], text: string, lineIndex: number): errorMsg | true;
    parseOpRule(op: any, value: any, start: any, text: any, lineIndex: any): boolean;
    createDiagnostic(range: vscode.Range, message: string, lvl: number): vscode.Diagnostic;
    empty(a: any): boolean;
}
export interface errorMsg {
    msg?: string;
    lvl?: number;
    length?: number;
}
export declare var ic10Diagnostics: Ic10Diagnostics;
