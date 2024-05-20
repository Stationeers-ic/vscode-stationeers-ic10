/// <reference types="vite/client" />
import {DataProvider} from "./core/DataProvider.ts";
import {Api, emitMessage, getVscodeApi} from "./api_vscode.ts";
import {Devices} from "./types/devices";

declare module "*.vue" {
	import type {DefineComponent} from "vue"
	const component: DefineComponent<{}, {}, any>
	export default component
}
declare global {
	const __logics__: any // todo types
	const __functions__: any // todo types
	const __devices__: Devices // todo types
	const __constant__: any // todo types
	interface Window {
		DataProvider: DataProvider
		api?: Api
		getVscodeApi: getVscodeApi
		emitMessage: emitMessage
	}
}


