'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const child_process_1 = require("child_process");
child_process_1.exec('npm i');
const vscode = require("vscode");
const vscode_1 = require("vscode");
const ic10_vscode_1 = require("./ic10-vscode");
const ic10_1 = require("ic10");
const path_1 = __importDefault(require("path"));
const LOCALE_KEY = vscode.env.language;
const ic10 = new ic10_vscode_1.Ic10Vscode();
const LANG_KEY = 'ic10';
const interpreterIc10 = new ic10_1.InterpreterIc10(null);
var interpreterIc10State = 0;
function activate(ctx) {
    console.log('activate 1c10');
    ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY, {
        provideHover(document, position, token) {
            var word = document.getWordRangeAtPosition(position);
            var text = document.getText(word);
            return new vscode_1.Hover(ic10.getHover(text));
        }
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('ic10.run', () => {
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
    ctx.subscriptions.push(vscode.commands.registerCommand('ic10.stop', () => {
        if (interpreterIc10State) {
            vscode.window.showInformationMessage('Stop');
            interpreterIc10.stop();
        }
    }));
}
exports.activate = activate;
function deactivate() {
    console.log('deactivate 1c10');
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map