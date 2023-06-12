import * as vscode from "vscode"
import {CancellationToken, WebviewView, WebviewViewResolveContext} from "vscode"

export class Ic10SidebarViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "Ic10ViewProvider"

    public view?: vscode.WebviewView
    public events: {
        [name: string]: (data: {
            id: string
            value: any
            type: string
            name: string
        }) => void
    } = {}
    private sectionsNamed: {} = {}
    private sections: {
        name: string,
        content: string,
        lang: string,
        priority: number
    }[] = []
    private newContent: string
    private update: boolean
    private isEvent: boolean = false

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {

    }

    sendCommand(name, data) {
        this.view.webview.postMessage({fn: name, data: data})
    }

    refresh(newContent = "") {
        this.sendCommand("update", newContent)
    }

    start() {
        setInterval(() => {
            if (this.update) {
                this.update = false
                this.refresh(this.newContent)
            }
            if (!this.isEvent) {
                try {
                    this.view.webview.onDidReceiveMessage(
                        message => {
                            // console.log(message)
                            if (typeof this.events[message.fn] == "function") {
                                this.events[message.fn](message.data)
                            }
                        },
                        this,
                    )
                    this.isEvent = true
                } catch (e) {

                }
            }
        }, 100)

    }

    section(name, content, lang, priority: number = 0) {
        if (!this.sectionsNamed.hasOwnProperty(name)) {
            this.sections.length
            this.sectionsNamed[name] = this.sections.length
            this.sections.push({name, content, lang, priority})
        } else {
            this.sections[this.sectionsNamed[name]] = {name, content, lang, priority}
        }
        let newContent = ""
        const languageId = vscode.window.activeTextEditor.document.languageId
        this.sections.sort((a, b) => {
            if (a.priority < b.priority) {
                return -1
            }
            if (a.priority > b.priority) {
                return 1
            }
            return 0
        })
        for (const sectionsKey in this.sections) {
            const obj = this.sections[sectionsKey]
            if (obj.lang == "both" || obj.lang == languageId) {
                newContent += `
				<section id="${obj.name}">
					${obj.content}
				</section>
			`
            }
        }
        this.newContent = newContent
        this.update = true
    }

    clear() {
        this.sectionsNamed = new Set
        this.sections = []
    }

    getNonce() {
        let text = ""
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return text
    }

    resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext, token: CancellationToken): Thenable<void> | void {
        this.view = webviewView

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [
                this._extensionUri
            ]
        }

        webviewView.webview.html = this._getHtmlForWebview()

        webviewView.webview.onDidReceiveMessage(data => {
            console.log(data)
        })
    }

    private _getHtmlForWebview(content = "") {
        // Do the same for the stylesheet.
        const styleMainUri = this.view.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "sidebar.css"))
        const scriptMainUri = this.view.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "sidebar.js"))
        const nonce = this.getNonce()

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
			<title></title>
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
				<div id="content">
					${content}
				</div>
				<script src="${scriptMainUri}" nonce="${nonce}"></script>
			</body>
			</html>`
    }

}



