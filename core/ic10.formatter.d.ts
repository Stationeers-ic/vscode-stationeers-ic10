import * as vscode from "vscode";
export declare class ic10Formatter {
    resultText: string;
    private readonly text;
    private labels;
    private lines;
    private commands;
    private position;
    private jumps;
    private document;
    private vars;
    private functions;
    private spaces;
    private loops;
    constructor(document: vscode.TextDocument);
    init(text: string): this;
    formatStart(): void;
    addResetVar(): void;
    renderSpaces(): void;
    findFunctions(): void;
    findLoos(): void;
}
