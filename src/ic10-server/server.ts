import { Connection, InitializeResult, TextDocuments, TextDocumentSyncKind } from "vscode-languageserver"
import { TextDocument } from "vscode-languageserver-textdocument"
import {
	createConnection,
	DidChangeConfigurationNotification,
	DocumentDiagnosticReportKind,
	InitializeParams,
	IPCMessageReader,
	IPCMessageWriter,
	SemanticTokensOptions,
	SemanticTokensRegistrationOptions,
} from "vscode-languageserver/node"
import { info, log } from "../devtools/log"
import { Document } from "./Document"
import { TokenModifiers, TokenTypes } from "./constants"

export interface LSOptions {
	/**
	 * If you have a connection already that the ls should use, pass it in.
	 * Else the connection will be created from `process`.
	 */
	connection?: Connection
	/**
	 * If you want only errors getting logged.
	 * Defaults to false.
	 */
	logErrorsOnly?: boolean
}

const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process))

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument)
let hasConfigurationCapability = false
let hasWorkspaceFolderCapability = false
let hasDiagnosticRelatedInformationCapability = false

export const semanticTokensProvider: SemanticTokensOptions = {
	legend: {
		tokenTypes: Object.values(TokenTypes),
		tokenModifiers: Object.values(TokenModifiers),
	},
	range: false,
	full: true,
}

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities

	// Does the client support the `workspace/configuration` request?/*  */
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration)
	hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders)
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	)

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
			// Tell the client that this server supports code completion.
			completionProvider: {
				triggerCharacters: ["."],
				resolveProvider: true,
			},
			declarationProvider: false,
			definitionProvider: true,
			documentHighlightProvider: false,
			diagnosticProvider: {
				interFileDependencies: false,
				workspaceDiagnostics: false,
			},
			documentFormattingProvider: true,
			semanticTokensProvider: semanticTokensProvider,
			hoverProvider: true,
			colorProvider: true,
			renameProvider: true,
		},
	}
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true,
			},
		}
	}
	log("Server initialized", result)
	return result
})

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined)
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders((_event) => {
			connection.console.log("Workspace folder change event received.")
		})
	}
	const registrationOptions: SemanticTokensRegistrationOptions = {
		documentSelector: ["ic10"],
		...semanticTokensProvider,
	}
	log("Server initialized")
})

connection.onRequest(async (method, params) => {
	info(`[${method}] requested`, params)
})
documents.onDidChangeContent((change) => {
	Document.init(change.document)?.diagnostics()
})
// hover
connection.onHover(async (params) => {
	// log("Hover requested", params)
	const document = documents.get(params.textDocument.uri)
	return Document.init(document)?.onHover(params)
})

// colors
connection.onDocumentColor(async (params) => {
	// log("Document color requested", params)
	const document = documents.get(params.textDocument.uri)
	return Document.init(document)?.onDocumentColor()
})
connection.onColorPresentation(async (params) => {
	// log("Document color requested", params)
	const document = documents.get(params.textDocument.uri)
	return Document.init(document)?.onColorPresentation(params)
})

// semantic tokens
connection.languages.semanticTokens.on(async (params) => {
	// log("Semantic tokens requested", params)
	const document = documents.get(params.textDocument.uri)
	return (await Document.init(document)?.semantic()) ?? { data: [] }
})
connection.onDefinition(async (params) => {
	log("Definition requested", params)
	const document = documents.get(params.textDocument.uri)
	return Document.init(document)?.onDefinition(params)
})

// Symbol
connection.onDocumentSymbol(async (params) => {
	// log("Document symbol requested", params)
	const document = documents.get(params.textDocument.uri)
	return Document.init(document)?.onDocumentSymbol()
})

// diagnostics
connection.languages.diagnostics.on(async (params) => {
	// log("Diagnostics requested", params)
	const document = documents.get(params.textDocument.uri)
	return (await Document.init(document)?.diagnostics()) ?? { kind: DocumentDiagnosticReportKind.Full, items: [] }
})

// completion
connection.onCompletion(async (params) => {
	// log("Completion requested", params)
	const document = documents.get(params.textDocument.uri)
	return Document.init(document)?.onCompletion(params)
})

// Formatting
connection.onDocumentFormatting(async (params) => {
	// log("Formatting requested", params)
	const document = documents.get(params.textDocument.uri)
	return Document.init(document)?.onDocumentFormatting(params)
})

// Rename
connection.onRenameRequest(async (params) => {
	log("Rename requested", params)
	const document = documents.get(params.textDocument.uri)
	return Document.init(document)?.onRenameRequest(params)
})

documents.listen(connection)
connection.listen()
