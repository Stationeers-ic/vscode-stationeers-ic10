export function emit(name: string, value?: any) {
	window.dispatchEvent(new Event(name, value))
}

export function on(name: string, callback: (Event: any) => void) {
	window.addEventListener(name, callback)
}

export function off(name: string, callback: (Event: any) => void) {
	window.removeEventListener(name, callback)
}
