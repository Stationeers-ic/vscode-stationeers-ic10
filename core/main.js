'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const ic10_vscode_1 = require("./ic10-vscode");
const ic10_1 = require("ic10");
const LOCALE_KEY = vscode.env.language;
const ic10 = new ic10_vscode_1.Ic10Vscode();
const LANG_KEY = 'ic10';
const settings = {
    debug: true,
    debugCallback: function () {
        console.log(...arguments);
    },
    logCallback: function () {
        console.log(...arguments);
    },
    executionCallback: function (e) {
    },
};
const interpreterIc10 = new ic10_1.InterpreterIc10(null, settings);
var interpreterIc10State = 0;
function activate(ctx) {
    console.log('activate 1c10');
    ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY, {
        provideHover(document, position, token) {
            var word = document.getWordRangeAtPosition(position);
            var text = document.getText(word);
            return new vscode_1.Hover(ic10.getHover(text, LOCALE_KEY));
        }
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('ic10.run', () => {
        if (!interpreterIc10State) {
            vscode.window.showInformationMessage('Running');
            var code = vscode.window.activeTextEditor.document.getText();
            const panel = vscode.window.createWebviewPanel('catCoding', 'Cat Coding', vscode.ViewColumn.One, {});
            interpreterIc10.init(code);
            interpreterIc10State = 1;
            interpreterIc10.run();
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