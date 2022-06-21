import * as vscode from "vscode";
export declare class icXFormatter {
    private readonly text;
    private labels;
    private readonly lines;
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
    private icX;
    constructor(document: vscode.TextDocument, icxOptions: any);
    init(): void;
    addSpace(text: any, count: any): string;
    recursiveSpace(content: any, level?: number): void;
    renderSpaces(): void;
    findLoos(): void;
}
