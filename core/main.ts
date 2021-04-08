'use strict';
// @ts-ignore
import vscode = require('vscode');
// @ts-ignore
import {Hover} from 'vscode';
import {Ic10Vscode} from './ic10-vscode';
import {ic10Error, InterpreterIc10} from "ic10";

const LOCALE_KEY: string = vscode.env.language
const ic10 = new Ic10Vscode();
const LANG_KEY = 'ic10'
const settings = {
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
const interpreterIc10 = new InterpreterIc10(null, settings)
var interpreterIc10State = 0


export function activate(ctx) {
	
	console.log('activate 1c10')
	
	ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY,
		{
			provideHover(document, position, token) {
				var word = document.getWordRangeAtPosition(position)
				var text = document.getText(word)
				return new Hover(ic10.getHover(text, LOCALE_KEY))
			}
		}
	));
	
	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.run', () => {
		if (!interpreterIc10State) {
			vscode.window.showInformationMessage('Running');
			var code = vscode.window.activeTextEditor.document.getText()
			// @ts-ignore
			const panel = vscode.window.createWebviewPanel(
				'catCoding', // Identifies the type of the webview. Used internally
				'Cat Coding', // Title of the panel displayed to the user
				vscode.ViewColumn.One, // Editor column to show the new webview panel in.
				{} // Webview options. More on these later.
			);
			interpreterIc10.init(code)
			interpreterIc10State = 1
			interpreterIc10.run()
		}
	}));
	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.stop', () => {
		if (interpreterIc10State) {
			vscode.window.showInformationMessage('Stop');
			// @ts-ignore
			interpreterIc10.stop()
		}
	}));
}

export function deactivate() {
	console.log('deactivate 1c10')
}
