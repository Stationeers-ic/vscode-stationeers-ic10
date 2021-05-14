import * as vscode from 'vscode';
export declare class Ic10ViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    static readonly viewType = "Ic10ViewProvider";
    private _view?;
    constructor(_extensionUri: vscode.Uri);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    private _getHtmlForWebview;
}
