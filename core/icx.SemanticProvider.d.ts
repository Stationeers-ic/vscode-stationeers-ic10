import vscode, { CancellationToken, ProviderResult, SemanticTokens, TextDocument } from "vscode";
interface IParsedToken {
    line: number;
    startCharacter: number;
    length: number;
    tokenType: number;
}
export declare const tokenTypes: Map<string, number>;
export declare const tokenModifiers: Map<string, number>;
export declare const legend: vscode.SemanticTokensLegend;
export declare class IcxSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(document: TextDocument, token: CancellationToken): ProviderResult<SemanticTokens>;
    _parseText(text: string): IParsedToken[];
    pushToken(search: any, line: any, index: any, tokenType: any, out: any): any;
}
export {};
