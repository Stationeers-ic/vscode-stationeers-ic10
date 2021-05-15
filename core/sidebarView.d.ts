import * as vscode from 'vscode';
export declare class Ic10SidebarViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    static readonly viewType = "Ic10ViewProvider";
    view?: vscode.WebviewView;
    private dom;
    private sections;
    constructor(_extensionUri: vscode.Uri);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    refresh(): void;
    section(name: any, content: any): void;
    private _getHtmlForWebview;
    getNonce(): string;
}
