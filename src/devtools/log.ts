import fs from "fs"
import * as path from "path"

export const log = (...message: any[]) => {
	write("log:", ...message)
}

export const error = (...message: any[]) => {
	write("Error:", ...message)
}

export const warn = (...message: any[]) => {
	write("Warning:", ...message)
}

export const info = (...message: any[]) => {
	write("Info:", ...message)
}

export const debug = (...message: any[]) => {
	write("Debug:", ...message)
}
export const telemetry = (...message: any[]) => {
	write("Telemetry:", ...message)
}

const write = (level: String, ...message: any[]) => {
	fs.writeFileSync(
		path.join(__dirname, "../..", "/src/devtools", "log.txt"),
		`${level} [${getCurrentTime()}]: ` + message.map((e) => (typeof e !== "string" ? JSON.stringify(e) : e)).join(" ") + "\n",
		{
			flag: "a",
		},
	)
}

function getCurrentTime(): string {
	const now: Date = new Date()
	const hours: number = now.getHours()
	const minutes: number = now.getMinutes()
	const seconds: number = now.getSeconds()
	return `${hours}:${minutes}:${seconds}`
}
