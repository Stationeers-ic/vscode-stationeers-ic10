import * as vscode from 'vscode';

export class Ic10ViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'Ic10ViewProvider';
	
	private _view?: vscode.WebviewView;
	
	constructor(
		private readonly _extensionUri: vscode.Uri,
	) {
	}
	
	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
		
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			
			localResourceRoots: [
				this._extensionUri
			]
		};
		
		webviewView.webview.html = this._getHtmlForWebview();
		
		webviewView.webview.onDidReceiveMessage(data => {
		
		});
	}
	
	private _getHtmlForWebview() {
		
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			
				
				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<button class="add-color-button">Add Color</button>
			</body>
			</html>`;
	}
}



