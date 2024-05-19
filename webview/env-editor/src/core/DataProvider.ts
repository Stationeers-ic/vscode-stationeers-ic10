import {BuilderResult, validateBuilderResult} from "../types/BuilderResult.ts";
import {Api, getVscodeApi} from "../api_vscode.ts";
import {emit} from "./events.ts";

export class DataProvider {
	private static instance: DataProvider;

	#data: BuilderResult = []
	private vscode: Api;

	static getInstance() {
		if (!this.instance) {
			this.instance = new DataProvider();
		}
		return this.instance
	}

	private constructor() {
		this.vscode = getVscodeApi()
		const state = this.vscode.getState();
		console.info('state', state)
		const text = state?.text
		if (text === undefined) {
			this.receiveData(window.localStorage.getItem('data') ?? '')
		} else if (validateBuilderResult(text)) {
			this.#data = text
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

	public emitMessage(text: string) {
		this.receiveData(text)
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

	public fromString(text: string): BuilderResult {
		const data = this.deserialize(text)
		if (validateBuilderResult(data)) {
			return data
		}
		BuilderResult.parse(data)
		throw new Error("Data is not valid")
	}

	public toString(data: BuilderResult): string {
		return this.serialize(data)
	}

	public get data() {
		return this.#data
	}

	//Загружает данные из Внутренних источников (vscode)
	public set data(data: any | BuilderResult) {
		if (!validateBuilderResult(data)) {
			throw new Error("Data is not valid")
		}
		if (this.hasChangesData(this.#data, data)) {
			this.#data = this.copy(data)
			window.localStorage.setItem('data', this.serialize(this.data))
			this.sendUpdate()
		}
	}

	private sendUpdate() {
		const text = this.serialize(this.#data)
		console.log('send update', text)
		this.vscode.postMessage({
			type: 'update',
			text: text
		});
	}

	public hasChangesData<T>(oldData: T, newData: T): boolean {
		// Compare data
		return this.serialize(oldData) !== this.serialize(newData)
	}

	// Для того чтобы потом заменить на TOML или еще на что-то
	public serialize(data: any): string {
		return JSON.stringify(this.clearData(data), null, 2)
	}

	// Очищает данные от служебных полей
	public clearData(data: any): any {
		if (validateBuilderResult(data)) {
			//Тупое копирование чтобы не менять оригинальные данные
			const copy = JSON.parse(JSON.stringify(data))
			return copy.map((item: any) => {
				delete item?.events
				delete item?.data
				delete item?.selected
				delete item?.dragging
				delete item?.resizing
				delete item?.initialized
				delete item?.handleBounds
				delete item?.dimensions
				delete item?.computedPosition
				delete item?.sourceNode
				delete item?.targetNode
				if(item?.label?.trim() === '') {
					delete item?.label
				}
				return item
			})
		}
		return data
	}

	public deserialize(text: string): any {
		return JSON.parse(text)
	}

	public copy<T>(data: T): T {
		return this.deserialize(this.serialize(data))
	}
}

export default DataProvider.getInstance()
