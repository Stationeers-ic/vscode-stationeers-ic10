'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const vscode_1 = require("vscode");
const ic10_vscode_1 = require("./ic10-vscode");
const ic10_1 = require("ic10");
const path_1 = __importDefault(require("path"));
const ic10_formatter_1 = require("./ic10.formatter");
const icx_SemanticProvider_1 = require("./icx.SemanticProvider");
const sidebarView_1 = require("./sidebarView");
const LOCALE_KEY = vscode.env.language;
const ic10 = new ic10_vscode_1.Ic10Vscode();
const LANG_KEY = 'ic10';
const LANG_KEY2 = 'icX';
const interpreterIc10 = new ic10_1.InterpreterIc10(null);
var interpreterIc10State = 0;
var leftCodeLength;
var onChangeCallbacks = [];
function activate(ctx) {
    console.log('activate 1c10');
    view(ctx);
    hover(ctx);
    formatter(ctx);
    command(ctx);
    semantic(ctx);
    statusBar(ctx);
    onChange(ctx);
}
exports.activate = activate;
function hover(ctx) {
    try {
        ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY, {
            provideHover(document, position, token) {
                var word = document.getWordRangeAtPosition(position);
                var text = document.getText(word);
                return new vscode_1.Hover(ic10.getHover(text));
            }
        }));
        ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY2, {
            provideHover(document, position, token) {
                var word = document.getWordRangeAtPosition(position);
                var text = document.getText(word);
                return new vscode_1.Hover(ic10.getHover(text));
            }
        }));
    }
    catch (e) {
        console.error(e);
    }
}
function formatter(ctx) {
    try {
        function replaceTextInDocument(newText, document) {
            const firstLine = document.lineAt(0);
            const lastLine = document.lineAt(document.lineCount - 1);
            const range = new vscode.Range(0, firstLine.range.start.character, document.lineCount - 1, lastLine.range.end.character);
            return vscode.TextEdit.replace(range, newText);
        }
        vscode.languages.registerDocumentFormattingEditProvider(LANG_KEY, {
            provideDocumentFormattingEdits(document) {
                try {
                    const formatter = new ic10_formatter_1.ic10Formatter(document);
                    return [replaceTextInDocument(formatter.resultText, document)];
                }
                catch (e) {
                }
            }
        });
    }
    catch (e) {
        console.error(e);
    }
}
function command(ctx) {
    try {
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + '.run', () => {
            if (!interpreterIc10State) {
                vscode.window.showInformationMessage('Running');
                var code = vscode.window.activeTextEditor.document.getText();
                var title = path_1.default.basename(vscode.window.activeTextEditor.document.fileName);
                interpreterIc10State = 1;
                const panel = vscode.window.createWebviewPanel('ic10.debug', `${title}-Debug`, vscode.ViewColumn.Two);
                const settings = {
                    debug: true,
                    tickTime: 500,
                    debugCallback: function () {
                        panel.webview.html += ic10.htmlLog(...arguments) + "<br>";
                    },
                    logCallback: function () {
                        panel.webview.html += ic10.htmlLog(...arguments) + "<br>";
                    },
                    executionCallback: function (e) {
                        panel.webview.html += ic10.htmlLog(...arguments) + "<br>";
                    },
                };
                interpreterIc10.setSettings(settings).init(code).run();
            }
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + '.stop', () => {
            if (interpreterIc10State) {
                vscode.window.showInformationMessage('Stop');
                interpreterIc10.stop();
            }
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + '.debug.variables.write', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.variables.write', { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + '.debug.device.write', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.device.write', { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + '.debug.device.slot.write', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.device.slot.write', { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + '.debug.stack.push', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.stack.push', { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + '.debug.remove.push', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.remove.push', { variable: variable, value: input.value });
                input.hide();
            });
        }));
    }
    catch (e) {
        console.error(e);
    }
}
function semantic(ctx) {
    try {
        ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: LANG_KEY, scheme: 'file' }, new icx_SemanticProvider_1.IcxSemanticTokensProvider, icx_SemanticProvider_1.legend));
        ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: LANG_KEY2, scheme: 'file' }, new icx_SemanticProvider_1.IcxSemanticTokensProvider, icx_SemanticProvider_1.legend));
    }
    catch (e) {
        console.error(e);
    }
}
function view(ctx) {
    try {
        var provider = new sidebarView_1.Ic10SidebarViewProvider(ctx.extensionUri);
        ctx.subscriptions.push(vscode.window.registerWebviewViewProvider(sidebarView_1.Ic10SidebarViewProvider.viewType, provider));
        onChangeCallbacks.push(() => {
            var a = getNumberLeftLines();
            if (a) {
                provider.section('leftLineCounter', `
					<p>Left lines ${a[1]}</p>
					<progress value="${a[1]}" max="128" min="0"></progress>`);
            }
            else {
                provider.section('leftLineCounter', ``);
            }
        });
    }
    catch (e) {
        console.error(e);
    }
}
function statusBar(ctx) {
    try {
        leftCodeLength = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        ctx.subscriptions.push(leftCodeLength);
        onChangeCallbacks.push(() => {
            updateStatusBarItem();
        });
        updateStatusBarItem();
        function updateStatusBarItem() {
            const n = getNumberLeftLines();
            if (n) {
                if (LOCALE_KEY == "ru2") {
                    leftCodeLength.text =
                        `осталось ${n[0]} ${n[1]} строк`;
                }
                else {
                    leftCodeLength.text =
                        `${n[0]}${n[1]} line(s) left`;
                }
                leftCodeLength.show();
            }
            else {
                leftCodeLength.hide();
            }
        }
    }
    catch (e) {
        console.error(e);
    }
}
function _onChange(ctx) {
    if (vscode.window.activeTextEditor.document.languageId == LANG_KEY || vscode.window.activeTextEditor.document.languageId == LANG_KEY2)
        onChangeCallbacks.forEach((e) => {
            e.call(ctx);
        });
}
function onChange(ctx) {
    ctx.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(_onChange));
    ctx.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(_onChange));
}
function getNumberLeftLines() {
    var text = vscode.window.activeTextEditor.document.getText();
    if (vscode.window.activeTextEditor.document.languageId == LANG_KEY) {
        var left = 128;
        var a = " ▁▃▅▉";
        if (text) {
            left = left - text.split('\n').length;
        }
        var x = a[Math.ceil(left / 32)] ?? '';
        return [x, left];
    }
    else {
        return false;
    }
}
function deactivate() {
    console.log('deactivate 1c10');
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map