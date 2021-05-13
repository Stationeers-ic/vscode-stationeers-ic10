'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const ic10_vscode_1 = require("./ic10-vscode");
const ic10_1 = require("ic10");
const path_1 = __importDefault(require("path"));
const ic10_formatter_1 = require("./ic10.formatter");
const vscode = require("vscode");
const icx_SemanticProvider_1 = require("./icx.SemanticProvider");
const child_process_1 = require("child_process");
const LOCALE_KEY = vscode.env.language;
const ic10 = new ic10_vscode_1.Ic10Vscode();
const LANG_KEY = 'ic10';
const LANG_KEY2 = 'icX';
const interpreterIc10 = new ic10_1.InterpreterIc10(null);
var interpreterIc10State = 0;
child_process_1.exec('npm update');
function activate(ctx) {
    console.log('activate 1c10');
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
    ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + '.test', (variable) => {
        const ds = vscode.debug.activeDebugSession;
        console.log('ic10.test');
        console.log(ds);
        console.log(variable);
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
    ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: LANG_KEY, scheme: 'file' }, new icx_SemanticProvider_1.IcxSemanticTokensProvider, icx_SemanticProvider_1.legend));
    ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: LANG_KEY2, scheme: 'file' }, new icx_SemanticProvider_1.IcxSemanticTokensProvider, icx_SemanticProvider_1.legend));
}
exports.activate = activate;
function deactivate() {
    console.log('deactivate 1c10');
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map