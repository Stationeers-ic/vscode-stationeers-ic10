'use strict';
import {exec} from "child_process";
import {Hover} from 'vscode';
import {Ic10Vscode} from './ic10-vscode';
import {ic10Error, InterpreterIc10} from "ic10";
import path from "path";

exec('npm i');

import vscode = require('vscode');

const LOCALE_KEY: string = vscode.env.language
const ic10 = new Ic10Vscode();
const LANG_KEY = 'ic10'
const interpreterIc10 = new InterpreterIc10(null)
var interpreterIc10State = 0


export function activate(ctx) {
	
	console.log('activate 1c10')
	
	ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY,{
			provideHover(document, position, token) {
				var word = document.getWordRangeAtPosition(position)
				var text = document.getText(word)
				return new Hover(ic10.getHover(text))
			}
		}));
	
	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.run', () => {
		if (!interpreterIc10State) {
			vscode.window.showInformationMessage('Running');
			var code = vscode.window.activeTextEditor.document.getText()
			var title = path.basename(vscode.window.activeTextEditor.document.fileName)
			interpreterIc10State = 1
			const panel = vscode.window.createWebviewPanel(
				'ic10.debug', // Identifies the type of the webview. Used internally
				`${title}-Debug`, // Title of the panel displayed to the user
				vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
			);
			const settings = {
				debug: true,
				tickTime: 500,
				debugCallback: function () {
					panel.webview.html += ic10.htmlLog(...arguments) + "<br>"
				},
				logCallback: function () {
					panel.webview.html += ic10.htmlLog(...arguments) + "<br>"
				},
				executionCallback: function (e: ic10Error) {
					panel.webview.html += ic10.htmlLog(...arguments) + "<br>"
				},
			}
			interpreterIc10.setSettings(settings).init(code).run()
		}
	}));
	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.stop', () => {
		if (interpreterIc10State) {
			vscode.window.showInformationMessage('Stop');
			interpreterIc10.stop()
		}
	}));
	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.test', (variable) => {
		const ds = vscode.debug.activeDebugSession;
		console.log('ic10.test')
		console.log(ds)
		console.log(variable)
	}));

	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.debug.variables.write', (variable) => {
		const ds = vscode.debug.activeDebugSession;
		console.log(ds)
		var input = vscode.window.createInputBox()
		input.title = 'set ' + variable.variable.name
		input.show()
		input.onDidAccept(function () {
			ds.customRequest('ic10.debug.variables.write', {variable: variable, value: input.value})
			input.hide();
		});
	}));
	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.debug.device.write', (variable) => {
		const ds = vscode.debug.activeDebugSession;
		console.log(ds)
		var input = vscode.window.createInputBox()
		input.title = 'set ' + variable.variable.name
		input.show()
		input.onDidAccept(function () {
			ds.customRequest('ic10.debug.device.write', {variable: variable, value: input.value})
			input.hide();
		});
	}));
	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.debug.device.slot.write', (variable) => {
		const ds = vscode.debug.activeDebugSession;
		console.log(ds)
		var input = vscode.window.createInputBox()
		input.title = 'set ' + variable.variable.name
		input.show()
		input.onDidAccept(function () {
			ds.customRequest('ic10.debug.device.slot.write', {variable: variable, value: input.value})
			input.hide();
		});
	}));
	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.debug.stack.push', (variable) => {
		const ds = vscode.debug.activeDebugSession;
		console.log(ds)
		var input = vscode.window.createInputBox()
		input.title = 'set ' + variable.variable.name
		input.show()
		input.onDidAccept(function () {
			ds.customRequest('ic10.debug.stack.push', {variable: variable, value: input.value})
			input.hide();
		});
	}));
	ctx.subscriptions.push(vscode.commands.registerCommand('ic10.debug.remove.push', (variable) => {
		const ds = vscode.debug.activeDebugSession;
		console.log(ds)
		var input = vscode.window.createInputBox()
		input.title = 'set ' + variable.variable.name
		input.show()
		input.onDidAccept(function () {
			ds.customRequest('ic10.debug.remove.push', {variable: variable, value: input.value})
			input.hide();
		});
	}));
	
}

export function deactivate() {
	console.log('deactivate 1c10')
}
