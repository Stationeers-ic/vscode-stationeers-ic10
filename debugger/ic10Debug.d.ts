import { Handles, LoggingDebugSession } from "@vscode/debugadapter";
import { DebugProtocol } from "@vscode/debugprotocol";
import { FileAccessor } from "./ic10Runtime";
import { InterpreterIc10 } from "ic10";
import { MemoryStack } from "ic10/src/MemoryStack";
import { Slot } from "ic10/src/Slot";
import { DeviceOutput } from "ic10/src/DeviceOutput";
import { Device } from "ic10/src/devices/Device";
import { IcHousing } from "ic10/src/devices/IcHousing";
interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    program: string;
    stopOnEntry?: boolean;
    trace?: boolean;
    noDebug?: boolean;
}
export declare class ic10DebugSession extends LoggingDebugSession {
    private static threadID;
    _variableHandles: Handles<string>;
    variableMap: VariableMap;
    private _runtime;
    private _cancelActionTokens;
    private _reportProgress;
    private _progressId;
    private _cancelledProgressId;
    private _isProgressCancellable;
    private _useInvalidatedEvent;
    private readonly ic10;
    constructor(fileAccessor: FileAccessor);
    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void;
    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void;
    protected launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments): Promise<void>;
    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): Promise<void>;
    protected breakpointLocationsRequest(response: DebugProtocol.BreakpointLocationsResponse, args: DebugProtocol.BreakpointLocationsArguments, request?: DebugProtocol.Request): void;
    protected setExceptionBreakPointsRequest(response: DebugProtocol.SetExceptionBreakpointsResponse, args: DebugProtocol.SetExceptionBreakpointsArguments): Promise<void>;
    protected exceptionInfoRequest(response: DebugProtocol.ExceptionInfoResponse, args: DebugProtocol.ExceptionInfoArguments): void;
    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void;
    protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void;
    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void;
    protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request): Promise<void>;
    protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void;
    protected reverseContinueRequest(response: DebugProtocol.ReverseContinueResponse, args: DebugProtocol.ReverseContinueArguments): void;
    protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void;
    protected stepBackRequest(response: DebugProtocol.StepBackResponse, args: DebugProtocol.StepBackArguments): void;
    protected stepInTargetsRequest(response: DebugProtocol.StepInTargetsResponse, args: DebugProtocol.StepInTargetsArguments): void;
    protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments): void;
    protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments): void;
    protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): Promise<void>;
    protected dataBreakpointInfoRequest(response: DebugProtocol.DataBreakpointInfoResponse, args: DebugProtocol.DataBreakpointInfoArguments): void;
    protected setDataBreakpointsRequest(response: DebugProtocol.SetDataBreakpointsResponse, args: DebugProtocol.SetDataBreakpointsArguments): void;
    protected completionsRequest(response: DebugProtocol.CompletionsResponse, args: DebugProtocol.CompletionsArguments): void;
    protected cancelRequest(response: DebugProtocol.CancelResponse, args: DebugProtocol.CancelArguments): void;
    protected customRequest(command: string, response: DebugProtocol.Response, args: any): void;
    private progressSequence;
    private createSource;
    private getHover;
}
export declare class VariableMap {
    scope: ic10DebugSession;
    private map;
    private ic10;
    constructor(scope: ic10DebugSession, ic10: InterpreterIc10);
    init(id: string): void;
    get(id: any): any;
    var2variable(name: string, value: string | number | Device | IcHousing | number[] | DeviceOutput | MemoryStack | Slot[] | Slot, id: string, mc?: string): string;
}
export {};
