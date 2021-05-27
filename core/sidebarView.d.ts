import * as vscode from 'vscode';
export declare class Ic10SidebarViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    static readonly viewType = "Ic10ViewProvider";
    view?: vscode.WebviewView;
    private dom;
    private sectionsNamed;
    events: {
        [name: string]: (data: {
            id: string;
            value: any;
            type: string;
            name: string;
        }) => void;
    };
    private sections;
    private newContent;
    private update;
    private isEvent;
    constructor(_extensionUri: vscode.Uri);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    sendCommand(name: any, data: any): void;
    refresh(newContent?: string): void;
    start(): void;
    section(name: any, content: any, lang: any, priority?: number): void;
    clear(): void;
    private _getHtmlForWebview;
    getNonce(): string;
}
