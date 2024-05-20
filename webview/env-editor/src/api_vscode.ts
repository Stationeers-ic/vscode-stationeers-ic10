import type {WebviewApi} from "vscode-webview"

export type State = { text: string }
export type Api = WebviewApi<State>

export function getVscodeApi(): Api {
	if (window.api) {
		return window.api
	}
	if (typeof acquireVsCodeApi === "undefined") {
		console.debug("## acquireVsCodeApi is not available")
		// Эмитируем интерфейс чтобы на момент разработки не было ошибок
		return {
			postMessage: () => {
			},
			getState: () => {
				return {
					text: "",
				}
			},
			setState: () => {
				return {
					text: "",
				} as any
			},
		} satisfies Api
	}
	window.api = acquireVsCodeApi()
	return window.api
}

window.getVscodeApi = getVscodeApi
