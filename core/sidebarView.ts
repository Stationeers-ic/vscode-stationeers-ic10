import * as vscode from 'vscode';

export class Ic10SidebarViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'Ic10ViewProvider';
	
	public view?: vscode.WebviewView;
	private dom: any;
	private sectionsNamed: {} = {};
	private sections: {
		name: string,
		content: string,
		lang: string,
		priority: number
	}[] = [];
	
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
	
	refresh() {
		this.view.webview.html = this._getHtmlForWebview()
	}
	
	section(name, content, lang, priority: number = 0) {
		if (!this.sectionsNamed.hasOwnProperty(name)) {
			this.sections.length
			this.sectionsNamed[name] = this.sections.length
			this.sections.push({name, content, lang, priority})
		}else{
			this.sections[this.sectionsNamed[name]] = {name, content, lang, priority}
		}
		this.refresh()
	}
	
	clear() {
		this.sectionsNamed = new Set
		this.sections = []
		this.refresh()
	}
	
	private _getHtmlForWebview() {
		var languageId = vscode.window.activeTextEditor.document.languageId
		// Do the same for the stylesheet.
		const styleMainUri = this.
		view.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css'));
		const scriptMainUri = this.view.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js'));
		const nonce = this.getNonce();
		
		var content = ""
		this.sections.sort((a, b) => {
			if (a.priority < b.priority) {
				return -1;
			}
			if (a.priority > b.priority) {
				return 1;
			}
			return 0;
		})
		for (const sectionsKey in this.sections) {
			var obj = this.sections[sectionsKey]
			if (obj.lang == 'both' || obj.lang == languageId) {
				content += `
				<section id="${obj.name}">
					${obj.content}
				</section>
			`
			}
		}
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
				${content}
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



