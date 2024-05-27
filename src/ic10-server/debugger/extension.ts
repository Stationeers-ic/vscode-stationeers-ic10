// Файл: ./out/myDebugAdapter.js

import { Breakpoint, DebugSession, Handles, InitializedEvent, OutputEvent, Scope, Source, StackFrame, StoppedEvent, Thread } from "@vscode/debugadapter"
import { DebugProtocol } from "@vscode/debugprotocol"
import fs from "fs/promises"
import { DevEnv, Err, findErrorsInCode, InterpreterIc10 } from "ic10"
import { basename } from "path"
import { z } from "zod"
import { error, log } from "../../devtools/log"

export interface Ic10Breakpoint {
	id: number
	line: number
	verified: boolean
}

const LaunchRequestArgumentsSchema = z
	.object({
		program: z.string(),
	})
	.passthrough()
class Ic10DebugSession extends DebugSession {
	private enableTelemetry: boolean = false
	private static THREAD_ID = 1
	public fileContent: string = ""
	public env: DevEnv<{}>
	public ic10: InterpreterIc10
	public filePath: string = ""
	public _variableHandles = new Handles<string>()

	public constructor() {
		super()
		this.env = new DevEnv()
		this.ic10 = new InterpreterIc10(this.env, this.fileContent)
		// Это сообщает VS Code, что адаптер отладки готов принимать определенные события
		this.setDebuggerLinesStartAt1(false)
		this.setDebuggerColumnsStartAt1(false)
		log("NEW INSTANCE")
	}
	protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
		log("initializeRequest", response)
		// Инициализируем некоторые возможности отладчика

		const capabilities: DebugProtocol.Capabilities = {
			supportsEvaluateForHovers: true,
			supportsSetVariable: true,
		}
		response.body = capabilities

		this.sendResponse(response)
	}
	protected async launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments) {
		log("launchRequest", args)
		const data = LaunchRequestArgumentsSchema.parse(args)
		this.filePath = data.program
		this.fileContent = (await fs.readFile(data.program)).toString()
		// TODO reset env
		this.ic10.setCode(this.fileContent)
		// Запуск программы для отладки
		// Здесь должна быть логика запуска вашей программы и установки точек останова
		this.sendResponse(response)
		// Сообщаем VS Code, что адаптер готов
		this.sendEvent(new InitializedEvent())
		// Сообщаем VS Code, что программа запущена и остановлена (например, на точке останова)
		if (findErrorsInCode(this.fileContent).length > 0) {
			this.output("Invalid code; Syntax error", 0)
			process.exit(1)
		}
		this.sendEvent(new StoppedEvent("entry", Ic10DebugSession.THREAD_ID))
	}
	protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments, request?: DebugProtocol.Request | undefined): void {
		log("stepInRequest", arguments)
		this.sendStop("breakpoint")
		this.sendResponse(response)
	}
	protected stepBackRequest(response: DebugProtocol.StepBackResponse, args: DebugProtocol.StepBackArguments, request?: DebugProtocol.Request | undefined): void {
		log("stepBackRequest", arguments)
		this.sendStop("breakpoint")
		this.sendResponse(response)
	}
	protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments, request?: DebugProtocol.Request | undefined): void {
		log("stepOutRequest", arguments)
		this.sendStop("breakpoint")
		this.sendResponse(response)
	}
	protected stepInTargetsRequest(response: DebugProtocol.StepInTargetsResponse, args: DebugProtocol.StepInTargetsArguments, request?: DebugProtocol.Request | undefined): void {
		log("stepInTargetsRequest", arguments)
		this.sendStop("breakpoint")
		this.sendResponse(response)
	}
	protected async nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments, request?: DebugProtocol.Request | undefined) {
		log("nextRequest", arguments)
		try {
			const r = await this.ic10.step()
			if (r === "EOF") {
				this.ic10.getEnv().addPosition(1)
			}
			log("nextRequest step", r)
		} catch (e: any) {
			error("nextRequest", e)
			if (e instanceof Err) {
				this.output(e.format(1), 0)
			} else {
				this.output(e, 0)
			}
		}

		this.sendStop("step")
		// this.send("breakpoint")
		this.sendResponse(response)
	}
	protected async continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments, request?: DebugProtocol.Request | undefined) {
		log("continueRequest", arguments)

		try {
			const r = await this.ic10.step()
			log("continueRequest step", r)
		} catch (e: any) {
			error("continueRequest", e)
			if (e instanceof Err) {
				this.output(e.format(1), 0)
			} else {
				this.output(e, 0)
			}
		}
		this.sendStop("breakpoint")
		this.sendResponse(response)
	}
	protected async setBreakPointsRequest(
		response: DebugProtocol.SetBreakpointsResponse,
		args: DebugProtocol.SetBreakpointsArguments,
		request?: DebugProtocol.Request | undefined,
	) {
		const path = args.source.path as string
		this.filePath = path
		this.fileContent = (await fs.readFile(path)).toString()
		const clientLines = args.lines || []
		const lines = this.fileContent.split("\n")
		// set and verify breakpoint locations
		try {
			const actualBreakpoints0 = clientLines.map(async (l) => {
				const bp = new Breakpoint(true, l) as DebugProtocol.Breakpoint
				bp.message = lines[l - 1]
				bp.verified = lines[l - 1].trim().length > 0
				bp.source = this.createSource(path)
				return bp
			})
			const actualBreakpoints = await Promise.all<DebugProtocol.Breakpoint>(actualBreakpoints0)
			response.body = {
				breakpoints: actualBreakpoints,
			}
		} catch (e) {
			error("setBreakPointsRequest", e)
		}
		// send back the actual breakpoint positions

		log("setBreakPointsRequest", response)
		this.sendResponse(response)
	}
	protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
		// Возвращаем информацию о потоках. В этом примере предполагается один поток.
		response.body = {
			threads: [new Thread(Ic10DebugSession.THREAD_ID, "thread 1")],
		}
		this.sendResponse(response)
	}
	protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments, request?: DebugProtocol.Request | undefined): void {
		log("scopesRequest", arguments)
		response.body = {
			scopes: [
				new Scope("Registers", this._variableHandles.create("Registers"), false),
				new Scope("Constants", this._variableHandles.create("Constants"), false),
				new Scope("Stack", this._variableHandles.create("Stack"), false),
			],
		}
		this.sendResponse(response)
	}
	protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request | undefined): void {
		const id = this._variableHandles.get(args.variablesReference)
		log("variablesRequest", id)
		if (id) {
			response.body = {
				variables: [
					{
						name: "variable-1",
						type: "string",
						value: "value-1",
						variablesReference: 0,
					},
				],
			}
		} else {
			response.body = {
				variables: [],
			}
		}
		this.sendResponse(response)
	}
	protected writeMemoryRequest(response: DebugProtocol.WriteMemoryResponse, args: DebugProtocol.WriteMemoryArguments, request?: DebugProtocol.Request | undefined): void {
		log("writeMemoryRequest", arguments)
		this.sendResponse(response)
	}
	protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments, request?: DebugProtocol.Request | undefined): void {
		log("evaluateRequest", arguments)
		this.sendResponse(response)
	}
	protected cancelRequest(response: DebugProtocol.CancelResponse, args: DebugProtocol.CancelArguments, request?: DebugProtocol.Request | undefined): void {
		log("cancelRequest", arguments)
		this.sendResponse(response)
	}
	protected customRequest(command: string, response: DebugProtocol.Response, args: any): void {
		if (command === "setTelemetry") {
			this.enableTelemetry = args.enableTelemetry
			log(`Telemetry enabled: ${this.enableTelemetry}`)
			this.sendResponse(response)
		} else {
			super.customRequest(command, response, args)
		}
	}
	sendStop(event: "step" | "breakpoint" | "exception" | "pause" | "entry" | "goto" | "function breakpoint" | "data breakpoint" | "instruction breakpoint") {
		this.sendEvent(new StoppedEvent(event, Ic10DebugSession.THREAD_ID))
	}
	output(text: string, line: number, column: number = 0) {
		const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`)
		if (text === "start" || text === "startCollapsed" || text === "end") {
			e.body.group = text
			e.body.output = `group-${text}\n`
		}

		e.body.source = this.createSource(this.filePath)
		e.body.line = this.convertDebuggerLineToClient(line)
		e.body.column = this.convertDebuggerColumnToClient(column)
		this.sendEvent(e)
	}
	private createSource(filePath: string): Source {
		log("createSource", this.convertDebuggerPathToClient(filePath))
		return new Source(basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, "ic10-adapter-data")
	}
	sendEvent(event: DebugProtocol.Event): void {
		// warn("sendEvent", event)
		super.sendEvent(event)
	}
	protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void {
		log("stackTraceRequest", arguments)
		const startFrame = typeof args.startFrame === "number" ? args.startFrame : 0
		const maxLevels = typeof args.levels === "number" ? args.levels : 1000
		const endFrame = startFrame + maxLevels
		try {
			const frame = new StackFrame(0, basename(this.filePath), this.createSource(this.filePath), this.convertDebuggerLineToClient(this.ic10.getEnv().getPosition()))
			response.body = {
				stackFrames: [frame],
			}
		} catch (e) {
			error("stackTraceRequest", e)
		}

		log("stackTraceResponse", response)
		this.sendResponse(response)
	}
}
log("Debugger start")
DebugSession.run(Ic10DebugSession)
