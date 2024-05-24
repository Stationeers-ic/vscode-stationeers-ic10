import type {Node} from "@vue-flow/core";

export type Devices = {
	readonly data: Datum[];
	readonly images: Images;
}

export type Datum = {
	readonly id: number;
	readonly Title: string;
	readonly Key: string;
	readonly PrefabName: string;
	readonly PrefabHash: number;
	readonly hasChip: boolean;
	readonly deviceConnectCount: number;
	readonly image: string;
	readonly mods: string[];
	readonly connections: Connection[];
	readonly slots: Slot[];
	readonly tags: Tag[];
	readonly logics: LogicClass[];
}

export type Connection =
	"Data Input"
	| "Power Input"
	| "Connection"
	| "Pipe Input"
	| "Pipe Output"
	| "Landing Pad Input"
	| "Pipe Liquid Input"
	| "Pipe Liquid Output"
	| "Chute Output"
	| "Chute Input"
	| "Pipe Liquid Output2"
	| "Pipe Waste"
	| "Power And Data Input"
	| "Power Output"
	| "Chute Output2"
	| "Pipe Input2"
	| "Pipe Liquid Input2"
	| "Data Output"
	| "Pipe Output2"
	| "Power And Data Output"
	| `port d${number}`
	;

export type LogicClass = {
	readonly name: string;
	readonly permissions: Permission[];
}

export type Permission = "Read" | "Write";

export type Slot = {
	readonly SlotName: string;
	readonly SlotType: SlotType;
	readonly SlotIndex: number;
	readonly logic: LogicEnum[];
}

export type SlotType =
	"Battery"
	| "ProgrammableChip"
	| "SoundCartridge"
	| "Ore"
	| "Entity"
	| "GasFilter"
	| "GasCanister"
	| "None"
	| "DataDisk"
	| "Ingot"
	| "Appliance"
	| "Motherboard"
	| "Circuitboard"
	| "Plant"
	| "LiquidCanister"
	| "DrillHead"
	| "ScanningHead"
	| "Helmet"
	| "Suit"
	| "Back"
	| "LiquidBottle";

export type LogicEnum =
	"Occupied"
	| "OccupantHash"
	| "Quantity"
	| "Damage"
	| "Charge"
	| "ChargeRatio"
	| "Class"
	| "MaxQuantity"
	| "ReferenceId"
	| "PrefabHash"
	| "SortingClass"
	| "FilterType"
	| "Pressure"
	| "Temperature"
	| "On"
	| "LineNumber"
	| "Volume"
	| "Open"
	| "Efficiency"
	| "Health"
	| "Growth"
	| "Mature"
	| "Seeding"
	| "Lock"
	| "PressureWaste"
	| "PressureAir";

export type Tag =
	"hasLogic"
	| "hasMode"
	| "paintable"
	| "hasPrefab"
	| "hasImage"
	| "buildable"
	| "hasSlot"
	| "hasChip"
	| "structure"
	| "hasReciepe"
	| "hasLogicInstructions"
	| "cable";

export type Images = {
	readonly "SlotType.Battery": string;
	readonly "SlotType.ProgrammableChip": string;
	readonly "SlotType.Ore": string;
	readonly "SlotType.DataDisk": string;
	readonly "SlotType.Entity": string;
	readonly "SlotType.Motherboard": string;
	readonly "SlotType.Circuitboard": string;
	readonly "SlotType.GasFilter": string;
	readonly "SlotType.GasCanister": string;
	readonly "SlotType.Plant": string;
	readonly "SlotType.Helmet": string;
	readonly "SlotType.Suit": string;
	readonly "SlotType.Back": string;
}


export type DeviceNodeData = {
	PrefabName: string;
	PrefabHash: number;
	ic10: any;
}
export type DeviceNode = Node<DeviceNodeData>
