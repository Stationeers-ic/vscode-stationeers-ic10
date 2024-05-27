import JSON5 from "json5"
import { dirname, join } from "path"
import * as vscode from "vscode"
import { log } from "../../devtools/log"
import { getNonce } from "../../helpers"

export class EnvEditor implements vscode.CustomTextEditorProvider {
	private static readonly viewType = "ic10.envEditor"

	constructor(private readonly context: vscode.ExtensionContext) {}

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new EnvEditor(context)
		const providerRegistration = vscode.window.registerCustomEditorProvider(EnvEditor.viewType, provider)

		return providerRegistration
	}

	public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
		log("resolveCustomTextEditor", document.uri.toString())
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		}
		webviewPanel.webview.html = await this.getHtmlForWebview(webviewPanel.webview)

		function updateWebview() {
			log("updateWebview", document.uri.toString())
			webviewPanel.webview.postMessage({
				type: "update",
				text: document.getText(),
			})
		}

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
			log("onDidChangeTextDocument", e.document.uri.toString())
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview()
			}
		})

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose()
		})
		webviewPanel.webview.onDidReceiveMessage((e) => {
			switch (e.type) {
				case "update":
					if (e.text === document.getText()) return
					this.updateTextDocument(document, e.text)
					break
			}
		})

		updateWebview()
	}

	private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
		// Local path to script and css for the webview
		const assets = (await import(join(dirname(dirname(__dirname)), "webview", "env-editor", "include.json"))) as {
			scripts: string[]
			styles: string[]
		}
		const nonce = getNonce()

		const isDev = assets.scripts.find((script) => script.includes("@vite")) !== undefined
		if (isDev) {
			return "<H1> Требуется сбилдить  </H1>"
		}
		const footer = assets.scripts.map((script) => {
			if (script.includes("DoNotUseThis")) return ""
			const path = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview", "env-editor", ...script.split("/")))
			return /* html */ `<script nonce="${nonce}" type="module" src="${path}"></script>`
		})
		const header = assets.styles.map((style) => {
			if (style.includes("DoNotUseThis")) return ""
			const path = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview", "env-editor", ...style.split("/")))
			return /* html */ `<link nonce="${nonce}" rel="stylesheet" href="${path}" />`
		})
		const font = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview", "env-editor", "assets", "icomoon-D5Wt02Km.ttf"))
		//подключаем иконки
		const doc = /* html */ `
		<!DOCTYPE html>
		<html lang="en" class="dark">
		<head>
			<meta charset="UTF-8">

			<!--
			Use a content security policy to only allow loading images from https or from our extension directory,
			and only allow scripts that have a specific nonce.
			-->
			<meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval';">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			${header.join("\n")}
			<style>
			@font-face {
				font-family: 'icomoon';
				src: url('${font}') format('truetype');
				font-weight: normal;
				font-style: normal;
				font-display: block;
			}

			</style>
			<title>ic10 Env</title>
		</head>
		<body class="ic10-editor">
			<div id="app"></div>
			${footer.join("\n")}

		</body>
		</html>`
		return doc
	}

	private updateTextDocument(document: vscode.TextDocument, text: string) {
		const edit = new vscode.WorkspaceEdit()
		const data = {
			$schema: "https://raw.githubusercontent.com/Stationeers-ic/vscode-stationeers-ic10/v4/resources/icEnv.shema.json",
			...JSON5.parse(text),
		}
		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(data, null, 2))

		return vscode.workspace.applyEdit(edit)
	}
}
