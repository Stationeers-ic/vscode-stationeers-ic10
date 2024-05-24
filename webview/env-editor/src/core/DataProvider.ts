import {Api, getVscodeApi} from "../api_vscode.ts";
import {emit} from "./events.ts";
import {FlowExportObject} from "@vue-flow/core";

export class DataProvider {
	private static instance: DataProvider;

	#data?: FlowExportObject
	private vscode: Api;

	private constructor() {
		this.vscode = getVscodeApi()
		const state = this.vscode.getState();
		const text = state?.text
		if (!text) {
			this.receiveData(window.localStorage.getItem('data') ?? '')
		} else {
			this.#data = JSON.parse(text) as FlowExportObject
		}
		window.addEventListener("message", (event) => {
			console.log('receive message', event)
			const message = event.data // The json data that the extension sent
			switch (message.type) {
				case "update":
					this.receiveData(message.text)
					console.log('receive update')
					return
			}
		})
	}

	public get data(): FlowExportObject | null {
		return this.#data ?? null
	}

	//Загружает данные из Внутренних источников (vscode)
	public set data(data: FlowExportObject) {
		if (this.hasChangesData(this.#data, data)) {
			this.#data = this.copy(data)
			window.localStorage.setItem('data', this.serialize(this.data))
			this.sendUpdate()
		}
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new DataProvider();
		}
		return this.instance
	}

	public emitMessage(text: string) {
		this.receiveData(text)
	}

	public fromString(text: string): FlowExportObject {
		return this.deserialize(text)
	}

	public toString(data: FlowExportObject): string {
		return this.serialize(data)
	}

	public hasChangesData<T>(oldData: T, newData: T): boolean {
		// Compare data
		return this.serialize(oldData) !== this.serialize(newData)
	}

	// Для того чтобы потом заменить на TOML или еще на что-то
	public serialize(data: any): string {
		return JSON.stringify(data, null, 2)
	}

	// Очищает данные от служебных полей
	public deserialize(text: string): any {
		return JSON.parse(text)
	}

	public copy<T>(data: T): T {
		return this.deserialize(this.serialize(data))
	}

	//Загружает данные из внешних источников (vscode)
	private receiveData(text: string) {
		try {
			const code = this.fromString(text)
			if (this.hasChangesData(this.#data, code)) {
				this.#data = code
				window.localStorage.setItem('data', this.serialize(this.data))
				emit('DataProviderUpdate', this.#data)
			}
		} catch (e) {
			console.error(e)
		}
	}

	private sendUpdate() {
		const text = this.serialize(this.#data)
		console.log('send update')
		this.vscode.postMessage({
			type: 'update',
			text: text
		});
	}
}

export default DataProvider.getInstance()
