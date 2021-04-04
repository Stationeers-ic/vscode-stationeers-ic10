const fs = require("fs");
class Environ {
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
    constructor() {
        this.value = null;
    }
    get() {
        return this.value;
    }
    set(value) {
        this.value = value;
    }
}
class Device {
    constructor() {
        this.On = false;
        this.Power = false;
        this.Error = false;
        this.Activate = false;
        this.Setting = null;
        this.RequiredPower = 0;
        this.Slots = [];
    }
}
class Chip extends Device {
    constructor() {
        super();
        this.Slots = [];
        this.Slots.push(new Slot());
    }
}
class Slot {
    constructor() {
        this.Occupied = true;
        this.OccupantHash = '';
        this.Quantity = 0;
        this.Damage = 0;
        this.Class = '';
        this.MaxQuantity = 1;
        this.PrefabHash = '';
    }
}
class InterpreterIc10 {
    constructor(code) {
        this.tickTime = 200;
        this.environ = new Environ;
        this.code = code;
        this.variables = {};
        this.memory = {};
        this.labels = {};
        this.init();
    }
    init() {
        for (let i = 0; i < 14; i++) {
            this.memory['r' + i] = new MemoryCell();
        }
        this.lines = text.split("\r\n");
        this.commands = this.lines.map((line) => {
            const args = line.toLowerCase().trim().split(/ +/);
            args.reduce((accumulator, currentValue) => accumulator + " " + currentValue);
            const command = args.shift().toLowerCase();
            return { command, args };
        });
    }
    run() {
        this.position = 0;
        while (this.position < this.commands.length) {
            let { command, args } = this.commands[this.position];
            if (command.match(/^\w+:$/)) {
                this.labels[command.replace(':', '')] = this.position;
            }
            this.position++;
        }
        this.position = 0;
        console.log(this.labels);
        this.interval = setInterval(() => {
            if (!this.prepareLine()) {
                clearInterval(this.interval);
            }
        }, this.tickTime);
    }
    prepareLine() {
        let { command, args } = this.commands[this.position];
        try {
            command = command.replace('#', '_');
            if (command in this) {
                this[command](...args);
                this.debug(command, args);
            }
        }
        catch (e) {
            this.debug(e);
        }
        return ++this.position < this.commands.length;
    }
    __issetVar(x) {
        return this.variables.hasOwnProperty(x);
    }
    __getVar(x) {
        if (this.__issetVar(x)) {
            return this.variables[x].get();
        }
        else {
            throw `undefined variable ${x}`;
        }
    }
    __setVar(x, value) {
        if (this.__issetVar(x)) {
            this.variables[x].set(value);
        }
        else {
            throw `undefined variable ${x}`;
        }
    }
    alias(op1, op2, op3, op4) {
        this.variables[op1] = this.memory[op2];
        this.variables[op2] = this.memory[op2];
    }
    move(op1, op2, op3, op4) {
        this.__setVar(op1, isNaN(op2) ? op2 : Number(op2));
    }
    add(op1, op2, op3, op4) {
        this.__setVar(op1, this.__getVar(op2) + this.__getVar(op3));
    }
    sub(op1, op2, op3, op4) {
        this.__setVar(op1, this.__getVar(op2) - this.__getVar(op3));
    }
    mul(op1, op2, op3, op4) {
        this.__setVar(op1, this.__getVar(op2) * this.__getVar(op3));
    }
    div(op1, op2, op3, op4) {
        this.__setVar(op1, this.__getVar(op2) / this.__getVar(op3));
    }
    mod(op1, op2, op3, op4) {
        this.__setVar(op1, Math.abs(this.__getVar(op2) % this.__getVar(op3)));
    }
    j(op1, op2, op3, op4) {
        this.position = this.labels[op1];
    }
    _log() {
        var out = [];
        for (const argumentsKey in arguments) {
            if (this.__issetVar(arguments[argumentsKey])) {
                out.push(this.__getVar(arguments[argumentsKey]));
            }
            else {
                out.push(arguments[argumentsKey]);
            }
        }
        console.log(...out);
    }
    debug(p, iArguments) {
        console.debug(...arguments);
    }
}
const text = fs.readFileSync(".ic10", "utf8");
var interpreterIc10 = new InterpreterIc10(text);
interpreterIc10.run();
//# sourceMappingURL=interpreter.js.map
