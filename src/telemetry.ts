import { telemetry } from "./devtools/log"

type Settings = {
	telemetryLevel?: "off" | "all" | "error" | string
	enableTelemetry?: boolean
	enableCrashReporter?: boolean
}
let telemetryEnabled: boolean | undefined
export async function sendTelemetry(eventName: string, url: string = "client", enableTelemetry?: boolean) {
	if (enableTelemetry === undefined) {
		if (!(await isTelemetryEnabled())) return
	} else {
		if (!enableTelemetry) return
	}
	const controller = new AbortController()
	const data = {
		domain: "ic10-vscode-ext.app",
		url: url,
		name: eventName,
	}
	fetch(`https://thor.traineratwot.site/api/event`, {
		signal: controller.signal,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			UserAgent: "vscode",
		},
		body: JSON.stringify(data),
	}).catch()
	setTimeout(() => controller.abort(), 300)
	telemetry(data)
}

export async function isTelemetryEnabled() {
	try {
		if (telemetryEnabled !== undefined) return telemetryEnabled
		//динамический импорт чтобы предотвратить возможный краш из-за отсутствия vscode
		const vscode = await import("vscode")
		const settings = vscode?.workspace?.getConfiguration("telemetry") as unknown as Settings
		const enabled = (settings.enableTelemetry && settings.telemetryLevel === "all") ?? false
		//																		   ^ all - так как это данные об использовании
		telemetryEnabled = enabled
		return telemetryEnabled
	} catch (e) {
		telemetryEnabled = false
		telemetry("error isTelemetryEnabled", e)
		return false
	}
}
