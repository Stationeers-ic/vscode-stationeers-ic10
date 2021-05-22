import * as vscode from "vscode";
import { errorMsg, Ic10Diagnostics } from "./ic10.diagnostics";
export declare const IcXDiagnosticsName = "icX_diagnostic";
declare class IcXDiagnostics extends Ic10Diagnostics {
    constructor();
    run(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void;
    parseLine(doc: vscode.TextDocument, lineIndex: any): void;
    analyzeFunctionInputs(words: string[], text: string, lineIndex: number): errorMsg | true;
}
export declare var icXDiagnostics: IcXDiagnostics;
export {};
