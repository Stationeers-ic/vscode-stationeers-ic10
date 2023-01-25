import * as vscode from "vscode";
import { errorMsg, Ic10Diagnostics } from "./ic10.diagnostics";
export declare const IcXDiagnosticsName = "icX_diagnostic";
declare class IcXDiagnostics extends Ic10Diagnostics {
    private InFunction;
    private blockCount;
    private endCount;
    constructor();
    prepare(doc: vscode.TextDocument): void;
    run(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void;
    view(test: any, linesCount: any): void;
    parseLine(doc: vscode.TextDocument, lineIndex: any): void;
    analyzeFunctionInputs(words: string[], text: string, lineIndex: number): errorMsg | true;
    analyzeIF(words: string[], text: string, lineIndex: number): errorMsg | true;
    createDiagnostic(range: vscode.Range, message: string, lvl: number): vscode.Diagnostic;
}
export declare var icXDiagnostics: IcXDiagnostics;
export {};
