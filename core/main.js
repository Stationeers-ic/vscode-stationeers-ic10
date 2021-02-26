const vscode = require('vscode');
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
	ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY,
		{
			provideHover(document, position, token) {
				var word = document.getWordRangeAtPosition(position)
				var text = document.getText(word)
				console.log(text)
				return {
					contents: ['Hover Content']
				};
			}
		}
	));
}

exports.activate = activate;

function deactivate() {
	console.log('deactivate 1c10')
}

exports.deactivate = deactivate;
