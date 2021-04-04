const fs = require("fs")

class Environ {
	public d0: Device;
	public d1: Device;
	public d2: Device;
	public d3: Device;
	public d4: Device;
	public d5: Device;
	public db: Chip;
	
	constructor() {
		this.d0 = new Device;
		this.d1 = new Device;
		this.d2 = new Device;
		this.d3 = new Device;
		this.d4 = new Device;
		this.d5 = new Device;
		this.db = new Chip;
	}
}

class MemoryCell {
	private value: any;
	
	constructor() {
		this.value = null
	}
	
	get() {
		return this.value
	}
	
	set(value: any) {
		this.value = value
	}
}

class Device {
	public On: Boolean;
	public Power: Boolean;
	public Error: Boolean;
	public Activate: Boolean;
	public Setting: any;
	public RequiredPower: Number;
	public Slots: Slot[];
	
	constructor() {
		this.On = false;
		this.Power = false;
		this.Error = false;
		this.Activate = false;
		this.Setting = null
		this.RequiredPower = 0
		this.Slots = [];
	}
}

class Chip extends Device {
	//-128473777
	constructor() {
		super();
		this.Slots = [];
		this.Slots.push(new Slot());
	}
}

class Slot {
	public Occupied: Boolean // - 0 - слот свободен, 1 - занят
	public OccupantHash: String // - хэш объекта в слоте
	public Quantity: Number // // - количество предметов в слоте
	public Damage: Number // - уровень повреждения объекта
	public Class: String // - класс объекта в слоте
	public MaxQuantity: Number // - максимальное количество предметов в слоте
	public PrefabHash: String // - хэш префаба объекта в слоте
	constructor() {
		this.Occupied = true;
		this.OccupantHash = ''
		this.Quantity = 0
		this.Damage = 0
		this.Class = ''
		this.MaxQuantity = 1
		this.PrefabHash = ''
	}
}

class InterpreterIc10 {
	private environ: Environ;
	private code: String;
	private commands: { args: string[]; command: string }[];
	private lines: string[];
	private memory: {};
	private position: number;
	private variables: Object;
	private interval: NodeJS.Timeout;
	private tickTime: number;
	private labels: {};
	
	constructor(code) {
		this.tickTime = 200
		this.environ = new Environ
		this.code = code
		this.variables = {}
		this.memory = {}
		this.labels = {}
		this.init();
	}
	
	init() {
		for (let i = 0; i < 14; i++) {
			this.memory['r' + i] = new MemoryCell()
		}
		this.lines = text.split("\r\n")
		this.commands = this.lines.map((line: string) => {
			const args = line.toLowerCase().trim().split(/ +/)
			args.reduce((accumulator, currentValue) => accumulator + " " + currentValue)
			const command = args.shift().toLowerCase()
			return {command, args}
		})
	}
	
	run() {
		this.position = 0;
		while (this.position < this.commands.length) {
			let {command, args} = this.commands[this.position]
			this.position++;
			if (command.match(/^\w+:$/)) {
				this.labels[command.replace(':', '')] = this.position;
			}
		}
		this.position = 0;
		console.log(this.labels)
		this.interval = setInterval(() => {
			if (!this.prepareLine()) {
				clearInterval(this.interval)
			}
		}, this.tickTime)
	}
	
	prepareLine() {
		let {command, args} = this.commands[this.position]
		try {
			command = command.replace('#', '_')
			if (command in this) {
				this[command](...args)
				this.debug(command, args)
			}
		} catch (e) {
			// @ts-ignore
			this.debug(e)
		}
		return ++this.position < this.commands.length
	}
	
	__issetVar(x: string) {
		return this.variables.hasOwnProperty(x)
	}
	
	__getVar(x: string) {
		if (this.__issetVar(x)) {
			return this.variables[x].get()
		} else {
			throw `undefined variable ${x}`
		}
	}
	
	__setVar(x: string, value: any) {
		// @ts-ignore
		if (this.__issetVar(x)) {
			this.variables[x].set(value)
		} else {
			throw `undefined variable ${x}`
		}
	}
	
	alias(op1, op2, op3, op4) {
		this.variables[op1] = this.memory[op2]
		this.variables[op2] = this.memory[op2]
	}
	
	move(op1, op2, op3, op4) {
		this.__setVar(op1, isNaN(op2) ? op2 : Number(op2))
	}
	
	add(op1, op2, op3, op4) {
		this.__setVar(op1, this.__getVar(op2) + this.__getVar(op3))
	}
	
	sub(op1, op2, op3, op4) {
		this.__setVar(op1, this.__getVar(op2) - this.__getVar(op3))
	}
	
	mul(op1, op2, op3, op4) {
		this.__setVar(op1, this.__getVar(op2) * this.__getVar(op3))
	}
	
	div(op1, op2, op3, op4) {
		this.__setVar(op1, this.__getVar(op2) / this.__getVar(op3))
	}
	
	mod(op1, op2, op3, op4) {
		this.__setVar(op1, Math.abs(this.__getVar(op2) % this.__getVar(op3)))
	}
	
	j(op1, op2, op3, op4) {
		this.position = this.labels[op1];
	}
	
	// @ts-ignore
	_log() {
		var out = []
		for (const argumentsKey in arguments) {
			if (this.__issetVar(arguments[argumentsKey])) {
				out.push(this.__getVar(arguments[argumentsKey]))
			} else {
				out.push(arguments[argumentsKey])
			}
		}
		console.log(...out)
	}
	
	debug(p: string, iArguments: string[]) {
		console.debug(...arguments)
	}
}

const text = fs.readFileSync(".ic10", "utf8")
var interpreterIc10 = new InterpreterIc10(text)
interpreterIc10.run()
