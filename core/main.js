'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var vscode_1 = require("vscode");
var ic10_1 = require("./ic10");
var ic10 = new ic10_1.IC10();
var LANG_KEY = 'ic10';
var LOCALE_KEY = vscode.env.language;
function activate(ctx) {
    console.log('activate 1c10');
    console.log(LOCALE_KEY);
    ctx.subscriptions.push(vscode.commands.registerCommand('ic10.run', function () {
        console.log('Test');
    }));
    console.log(ic10);
    ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY, {
        provideHover: function (document, position, token) {
            var word = document.getWordRangeAtPosition(position);
            var text = document.getText(word);
            console.log(ic10.getHover(text, LOCALE_KEY));
            return new vscode_1.Hover(ic10.getHover(text, LOCALE_KEY));
        }
    }));
}
exports.activate = activate;
function deactivate() {
    console.log('deactivate 1c10');
}
exports.deactivate = deactivate;
