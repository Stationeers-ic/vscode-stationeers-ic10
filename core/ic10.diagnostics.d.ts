import * as vscode from "vscode";
export declare const Ic10DiagnosticsName = "ic10_diagnostic";
declare class Ic10Diagnostics {
    constructor();
    clear(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void;
    run(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void;
    parseLine(doc: vscode.TextDocument, lineIndex: any): void;
    createDiagnostic(range: vscode.Range, message: string, lvl: number): vscode.Diagnostic;
}
export declare var ic10Diagnostics: Ic10Diagnostics;
export {};
