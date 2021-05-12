import vscode, { CancellationToken, ProviderResult, SemanticTokens, TextDocument } from "vscode";
export declare const tokenTypes: Map<string, number>;
export declare const tokenModifiers: Map<string, number>;
export declare const legend: vscode.SemanticTokensLegend;
export declare class IcxSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(document: TextDocument, token: CancellationToken): ProviderResult<SemanticTokens>;
    private static _parseText;
}
