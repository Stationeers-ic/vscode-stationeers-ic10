import * as path from "path"
import vscode, { ExtensionContext, window } from "vscode"
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient/node"
import { log } from "../devtools/log"
import { format } from "../helpers"
import { isTelemetryEnabled, sendTelemetry } from "../telemetry"
import { EnvEditor } from "./envEditor/envEditor"

let client: LanguageClient
const selector = { scheme: "file", language: "ic10" } // register for all Java documents from the local file system
const tokenTypes = ["class", "interface", "enum", "function", "variable"]
const tokenModifiers = ["declaration", "documentation"]
const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers)
const LinesStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 999)
const ByteStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 998)
const maxLines = 128
const maxBytes = 4096

export function activate(context: ExtensionContext) {
	log("Ic10 extension activated")
	commands(context)
	statusBar(context)
	languageServer(context)
	telemetry(context)
	envEditor(context)
	log("Ic10 start")
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined
	}
	window.showInformationMessage("Ic10 server close")
	return client.stop()
}
//--------------------------------------------------

function languageServer(context: ExtensionContext) {
	try {
		const serverModule = context.asAbsolutePath(path.join("dist", "ic10-server", "server.js"))
		// If the extension is launched in debug mode then the debug server options are used
		// Otherwise the run options are used
		const serverOptions: ServerOptions = {
			run: { module: serverModule, transport: TransportKind.ipc },
			debug: {
				module: serverModule,
				transport: TransportKind.ipc,
			},
		}

		const clientOptions: LanguageClientOptions = {
			// Register the server for plain text documents
			documentSelector: [selector],
		}

		client = new LanguageClient("languageServerIc10", "Language Server ic10", serverOptions, clientOptions)
		log("Ic10 server started")
		// Start the client. This will also launch the server
		client.start()
		window.showInformationMessage("Ic10 server started successfully")
	} catch (e) {
		window.showInformationMessage("Ic10 extensions failed to start")
	}
}

function commands(ctx: vscode.ExtensionContext) {
	ctx.subscriptions.push(vscode.commands.registerCommand("ic10.minify", ic10Minify))
}

function telemetry(ctx: vscode.ExtensionContext) {
	vscode.debug.onDidStartDebugSession((session) => {
		sendTelemetry("activate", "debugger")
		session.customRequest("setTelemetry", { enableTelemetry: isTelemetryEnabled })
	})
	sendTelemetry("activate")
}

function ic10Minify() {
	const text = vscode?.window?.activeTextEditor?.document.getText()
	const file = vscode?.window?.activeTextEditor?.document.uri
	if (!text || !file) return
	let formatted = format(text)
	formatted = formatted
		.replaceAll(/(\r?\n)+/g, "\n")
		.trim()
		.split("\n")
		.map((t) => t.trim())
		.join("\n")
	vscode.workspace.fs.writeFile(file, Buffer.from(formatted))
	sendTelemetry("ic10.minify")
}

function statusBar(ctx: vscode.ExtensionContext) {
	console.time("statusBar")
	try {
		ctx.subscriptions.push(LinesStatusBarItem)

		updateStatusBarItem()
		ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(updateStatusBarItem))

		function getNumberLeftLines(text: string): number {
			return text.split("\n").length
		}

		function getBytes(text: string): number {
			if (vscode?.window?.activeTextEditor?.document?.languageId === "ic10" && text) {
				return text.replaceAll("\r\n", "\n").replaceAll("\n", "  ").length // в игре почему-то всегда на 2 больше возможно BOM
			} else {
				return 0
			}
		}

		function setError(StatusBarItem: vscode.StatusBarItem) {
			StatusBarItem.color = new vscode.ThemeColor("statusBarItem.errorForeground")
			StatusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground")
		}
		function setWarning(StatusBarItem: vscode.StatusBarItem) {
			StatusBarItem.color = new vscode.ThemeColor("statusBarItem.warningForeground")
			StatusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground")
		}
		function setInfo(StatusBarItem: vscode.StatusBarItem) {
			StatusBarItem.color = new vscode.ThemeColor("statusBarItem.foreground")
			StatusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.background")
		}
		function updateStatusBarItem(): void {
			const text = vscode?.window?.activeTextEditor?.document.getText()
			if (!text) {
				LinesStatusBarItem.hide()
				ByteStatusBarItem.hide()
				return
			}
			const lines = getNumberLeftLines(text)
			const bytes = getBytes(text)

			LinesStatusBarItem.text = `Lines ${lines} / ${maxLines}`
			ByteStatusBarItem.text = ` Size ${bytes} / ${maxBytes}`
			{
				const ratio = lines / maxLines
				if (ratio > 1) {
					setError(LinesStatusBarItem)
				} else if (ratio > 0.8) {
					setWarning(LinesStatusBarItem)
				} else {
					setInfo(LinesStatusBarItem)
				}
			}
			{
				const ratio = bytes / maxBytes
				if (ratio > 1) {
					setError(ByteStatusBarItem)
				} else if (ratio > 0.8) {
					setWarning(ByteStatusBarItem)
				} else {
					setInfo(ByteStatusBarItem)
				}
			}
			ByteStatusBarItem.show()
			LinesStatusBarItem.show()
		}
	} catch (e) {}
	console.timeEnd("statusBar")
}

function envEditor(context: vscode.ExtensionContext) {
	context.subscriptions.push(EnvEditor.register(context))
}
//--------------------------------------------------
