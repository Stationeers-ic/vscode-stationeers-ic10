'use strict';
// @ts-ignore
import vscode = require('vscode');
// @ts-ignore
import {Hover} from 'vscode';
import {Ic10Vscode} from './ic10-vscode';
import {InterpreterIc10,ic10Error} from "ic10";

const LOCALE_KEY: string = vscode.env.language
var ic10 = new Ic10Vscode();
const LANG_KEY = 'ic10'
var settings = {
	debug: true,
	debugCallback: function () {
		console.log(...arguments)
	},
	logCallback: function () {
		console.log(...arguments)
	},
	executionCallback: function (e: ic10Error) {
	},
}
const interpreterIc10 = new InterpreterIc10(null,settings)
function activate(ctx) {
	
	console.log('activate 1c10')
	
	ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY,
		{
			provideHover(document, position, token) {
				var word = document.getWordRangeAtPosition(position)
				var text = document.getText(word)
				console.log(ic10.getHover(text, LOCALE_KEY))
				return new Hover(ic10.getHover(text, LOCALE_KEY))
			}
		}
	));
	const command = 'ic10.run';
	const commandHandler = () => {
		console.log(vscode.window)
		vscode.window.showInformationMessage('Running');
		var code = vscode.window.activeTextEditor.document.getText()
		// @ts-ignore
		interpreterIc10.init(code)
		interpreterIc10.run()
	};
	ctx.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
	
}

// @ts-ignore
exports.activate = activate;

function deactivate() {
	console.log('deactivate 1c10')
}

// @ts-ignore
exports.deactivate = deactivate;
