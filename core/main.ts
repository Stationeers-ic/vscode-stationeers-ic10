'use strict';
import vscode = require('vscode');
import { Hover } from 'vscode';
import { IC10 } from './ic10';
var ic10 = new IC10();
const LANG_KEY = 'ic10'
const LOCALE_KEY = vscode.env.language
function activate(ctx) {
	console.log('activate 1c10')
	console.log(LOCALE_KEY)
	ctx.subscriptions.push(
		vscode.commands.registerCommand('ic10.run', () => {
			console.log('Test');
		})
	);
	console.log(ic10)

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
}

exports.activate = activate;

function deactivate() {
	console.log('deactivate 1c10')
}

exports.deactivate = deactivate;