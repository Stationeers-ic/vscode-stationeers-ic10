import * as vscode from 'vscode';
import { Ic10SidebarViewProvider } from "./sidebarView";
export declare const LANG_KEY = "ic10";
export declare const LANG_KEY2 = "icX";
export declare var icSidebar: Ic10SidebarViewProvider;
export declare const icxOptions: {
    comments: boolean;
    aliases: boolean;
    loop: boolean;
    constants: boolean;
};
export declare function activate(ctx: vscode.ExtensionContext): void;
export declare function deactivate(): void;
