'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const ic10_vscode_1 = require("./ic10-vscode");
const ic10_1 = require("ic10");
const LOCALE_KEY = vscode.env.language;
var ic10 = new ic10_vscode_1.Ic10Vscode();
const LANG_KEY = 'ic10';
function activate(ctx) {
    console.log('activate 1c10');
    ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY, {
        provideHover(document, position, token) {
            var word = document.getWordRangeAtPosition(position);
            var text = document.getText(word);
            console.log(ic10.getHover(text, LOCALE_KEY));
            return new vscode_1.Hover(ic10.getHover(text, LOCALE_KEY));
        }
    }));
    const command = 'ic10.run';
    const commandHandler = () => {
        console.log(vscode.window);
        vscode.window.showInformationMessage('Running');
        var text = vscode.window.activeTextEditor.document.getText();
        var interpreterIc10 = new ic10_1.InterpreterIc10(text);
        interpreterIc10.run();
    };
    ctx.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
exports.activate = activate;
function deactivate() {
    console.log('deactivate 1c10');
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map