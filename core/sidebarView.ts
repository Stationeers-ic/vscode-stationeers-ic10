import * as vscode from 'vscode';
import {JSDOM} from "jsdom";

export class Ic10SidebarViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'Ic10ViewProvider';
	
	public view?: vscode.WebviewView;
	private dom: any;
	
	constructor(
		private readonly _extensionUri: vscode.Uri,
	) {
	}
	
	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this.view = webviewView;
		
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
	
	getDom() {
		const {window} = new JSDOM(this.view.webview.html);
		this.dom = require("jquery")(window);
		return this.dom
	}
	
	setDom() {
		this.view.webview.html = this.dom('body').html()
	}
	
	private _getHtmlForWebview(body: string = '') {
		
		// Do the same for the stylesheet.
		const styleMainUri = this.view.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css'));
		const scriptMainUri = this.view.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js'));
		const nonce = this.getNonce();
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
			<meta charset="UTF-8">
				<!--
				\tUse a content security policy to only allow loading images from https or from our extension directory,
				\tand only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.view.webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleMainUri}" rel="stylesheet">
			</head>
			<body>
				
				<section id="leftLineCounter">
				
				</section>
				<script src="${scriptMainUri}" type="text/javascript"></script>
			</body>
			</html>`;
	}
	
	getNonce() {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
}



