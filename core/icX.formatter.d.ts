import * as vscode from "vscode";
export declare class icXFormatter {
    private text;
    private labels;
    private lines;
    private commands;
    private position;
    private jumps;
    resultText: string;
    private document;
    private vars;
    private functions;
    private spaces;
    private loops;
    private icxOptions;
    constructor(document: vscode.TextDocument, icxOptions: any);
    init(text: string): this;
    formatStart(): void;
    renderSpaces(): void;
    findFunctions(): void;
    findLoos(): void;
}
