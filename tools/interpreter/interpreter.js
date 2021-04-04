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
class ConstantCell {
    constructor(value) {
        this.value = value;
    }
    get() {
        return this.value;
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
    get(variable) {
        if (variable in this) {
            return this[variable];
        }
        else {
            throw `4 Unknown variable ${variable}`;
        }
    }
    set(variable, value) {
        if (variable in this) {
            this[variable] = value;
        }
        else {
            throw `1 Unknown variable ${variable}`;
        }
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
        this.constants = {};
        this.labels = {};
        this.init();
    }
    init() {
        for (let i = 0; i < 15; i++) {
            this.memory['r' + i] = new MemoryCell();
            this.variables['r' + i] = this.memory['r' + i];
        }
        this.lines = text.split("\r\n");
        this.commands = this.lines.map((line) => {
            const args = line.trim().split(/ +/);
            args.reduce((accumulator, currentValue) => accumulator + " " + currentValue);
            const command = args.shift();
            return { command, args };
        });
    }
    run() {
        this.position = 0;
        while (this.position < this.commands.length) {
            let { command, args } = this.commands[this.position];
            this.position++;
            if (command.match(/^\w+:$/)) {
                this.labels[command.replace(':', '')] = this.position;
            }
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
        for (const argsKey in args) {
            let a = parseFloat(args[argsKey]);
            if (!isNaN(a)) {
                args[argsKey] = a;
            }
        }
        try {
            command = command.replace('#', '_');
            if (command in this) {
                this[command](...args);
                this.__debug(command, args);
            }
        }
        catch (e) {
            this.__debug(e);
        }
        return ++this.position < this.commands.length;
    }
    __issetConst(x) {
        return x in this.constants;
    }
    __issetVar(x) {
        return x in this.variables;
    }
    __issetLabel(x) {
        return x in this.labels;
    }
    __issetEntity(x) {
        return this.__issetVar(x) || this.__issetConst(x);
    }
    __issetPort(x) {
        return x in this.environ;
    }
    __getPort(x) {
        if (this.__issetPort(x)) {
            return this.environ[x];
        }
        else if (this.__issetVar(x) && this.variables[x] instanceof Device) {
            return this.variables[x];
        }
        else {
            throw `2 Unknown port ${x}`;
        }
    }
    __getVar(x) {
        if (this.__issetVar(x)) {
            return this.variables[x].get();
        }
        else if (this.__issetConst(x)) {
            return this.constants[x].get();
        }
        else {
            throw `undefined Variable ${x}`;
        }
    }
    __setVar(x, value) {
        if (this.__issetVar(x)) {
            this.variables[x].set(value);
        }
        else {
            throw `undefined Variable ${x}`;
        }
    }
    __jump(x) {
        if (this.__issetLabel(x)) {
            this.position = this.labels[x] - 1;
        }
        else {
            throw `undefined Label ${x}`;
        }
    }
    __ajump(x) {
        this.position += x - 1;
    }
    define(op1, op2, op3, op4) {
        this.constants[op1] = new ConstantCell(op2);
    }
    alias(op1, op2, op3, op4) {
        if (op2.match(/^r\d{1,2}$/) && op2 in this.memory) {
            this.variables[op1] = this.memory[op2];
            this.variables[op2] = this.memory[op2];
        }
        else if (op2.match(/^d\d{1}$/) && op2 in this.environ) {
            this.variables[op1] = this.environ[op2];
            this.variables[op2] = this.environ[op2];
        }
        else {
            throw `3 Unknown Register ${op2}`;
        }
    }
    l(op1, op2, op3, op4) {
        this.__setVar(op1, this.__getPort(op2).get(op3));
    }
    s(op1, op2, op3, op4) {
        this.__getPort(op1).set(op2, op3);
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
    sqrt(op1, op2, op3, op4) {
        this.__setVar(op1, Math.sqrt(this.__getVar(op2)));
    }
    round(op1, op2, op3, op4) {
        this.__setVar(op1, Math.round(this.__getVar(op2)));
    }
    trunc(op1, op2, op3, op4) {
        this.__setVar(op1, Math.trunc(this.__getVar(op2)));
    }
    ceil(op1, op2, op3, op4) {
        this.__setVar(op1, Math.ceil(this.__getVar(op2)));
    }
    floor(op1, op2, op3, op4) {
        this.__setVar(op1, Math.floor(this.__getVar(op2)));
    }
    max(op1, op2, op3, op4) {
        if (op3 > op2) {
            this.__setVar(op1, this.__getVar(op3));
        }
        else {
            this.__setVar(op1, this.__getVar(op2));
        }
    }
    min(op1, op2, op3, op4) {
        if (op2 > op3) {
            this.__setVar(op1, this.__getVar(op3));
        }
        else {
            this.__setVar(op1, this.__getVar(op2));
        }
    }
    abs(op1, op2, op3, op4) {
        this.__setVar(op1, Math.abs(this.__getVar(op2)));
    }
    log(op1, op2, op3, op4) {
        this.__setVar(op1, Math.log(this.__getVar(op2)));
    }
    exp(op1, op2, op3, op4) {
        this.__setVar(op1, Math.exp(this.__getVar(op2)));
    }
    rand(op1, op2, op3, op4) {
        this.__setVar(op1, Math.random());
    }
    sin(op1, op2, op3, op4) {
        this.__setVar(op1, Math.sin(op2));
    }
    cos(op1, op2, op3, op4) {
        this.__setVar(op1, Math.cos(op2));
    }
    tan(op1, op2, op3, op4) {
        this.__setVar(op1, Math.tan(op2));
    }
    asin(op1, op2, op3, op4) {
        this.__setVar(op1, Math.asin(op2));
    }
    acos(op1, op2, op3, op4) {
        this.__setVar(op1, Math.acos(op2));
    }
    atan(op1, op2, op3, op4) {
        this.__setVar(op1, Math.atan(op2));
    }
    slt(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 < op3));
    }
    sltz(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 < 0));
    }
    sgt(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 > op3));
    }
    sgtz(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 > 0));
    }
    sle(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 <= op3));
    }
    slez(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 <= 0));
    }
    sge(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 >= op3));
    }
    sgez(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 >= 0));
    }
    seq(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 == op3));
    }
    seqz(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 == 0));
    }
    sne(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 != op3));
    }
    snez(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 != 0));
    }
    sap(op1, op2, op3, op4 = 1) {
        this.__setVar(op1, Number(this.__ap(op2, op3, op4)));
    }
    sapz(op1, op2, op3, op4 = 1) {
        this.__setVar(op1, Number(this.__ap(op2, 0, op4)));
    }
    sna(op1, op2, op3, op4 = 1) {
        this.__setVar(op1, Number(this.__na(op2, op3, op4)));
    }
    snaz(op1, op2, op3, op4 = 1) {
        this.__setVar(op1, Number(this.__na(op2, 0, op4)));
    }
    sdse(op1, op2, op3, op4 = 1) {
        this.__setVar(op1, this.__dse(op2));
    }
    sdns(op1, op2, op3, op4 = 1) {
        this.__setVar(op1, this.__dns(op2));
    }
    __dse(x) {
        return 1;
    }
    __dns(x) {
        return 1;
    }
    __ap(x, y, d = 1) {
        return Math.abs(1 - (x / y)) <= d;
    }
    __na(x, y, d = 1) {
        return Math.abs(1 - (x / y)) > d;
    }
    and(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 & op3));
    }
    or(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 | op3));
    }
    xor(op1, op2, op3, op4) {
        this.__setVar(op1, Number(op2 ^ op3));
    }
    nor(op1, op2, op3, op4) {
        this.__setVar(op1, Number(!(op2 ^ op3)));
    }
    blt(op1, op2, op3, op4) {
        if (op1 < op2) {
            this.__jump(op3);
        }
    }
    bltz(op1, op2, op3, op4) {
        if (op1 < 0) {
            this.__jump(op3);
        }
    }
    ble(op1, op2, op3, op4) {
        if (op1 <= op2) {
            this.__jump(op3);
        }
    }
    blez(op1, op2, op3, op4) {
        if (op1 <= 0) {
            this.__jump(op3);
        }
    }
    bge(op1, op2, op3, op4) {
        if (op1 >= op2) {
            this.__jump(op3);
        }
    }
    bgez(op1, op2, op3, op4) {
        if (op1 >= 0) {
            this.__jump(op3);
        }
    }
    bgt(op1, op2, op3, op4) {
        if (op1 > op2) {
            this.__jump(op3);
        }
    }
    bgtz(op1, op2, op3, op4) {
        if (op1 > 0) {
            this.__jump(op3);
        }
    }
    beq(op1, op2, op3, op4) {
        if (op1 == op2) {
            this.__jump(op3);
        }
    }
    beqz(op1, op2, op3, op4) {
        if (op1 == 0) {
            this.__jump(op3);
        }
    }
    bne(op1, op2, op3, op4) {
        if (op1 != op2) {
            this.__jump(op3);
        }
    }
    bnez(op1, op2, op3, op4) {
        if (op1 != 0) {
            this.__jump(op3);
        }
    }
    bap(op1, op2, op3, op4) {
        if (this.__ap(op1, op2, op3)) {
            this.__jump(op4);
        }
    }
    bapz(op1, op2, op3, op4) {
        if (this.__ap(op1, op2, op3)) {
            this.__jump(op4);
        }
    }
    bna(op1, op2, op3, op4) {
        if (this.__na(op1, op2, op3)) {
            this.__jump(op4);
        }
    }
    bnaz(op1, op2, op3, op4) {
        if (this.__na(op1, op2, op3)) {
            this.__jump(op4);
        }
    }
    bdse(op1, op2, op3, op4) {
        if (this.__dse(op1)) {
            this.__jump(op2);
        }
    }
    bdns(op1, op2, op3, op4) {
        if (this.__dns(op1)) {
            this.__jump(op2);
        }
    }
    yield(op1, op2, op3, op4) {
    }
    sleep(op1, op2, op3, op4) {
    }
    j(op1, op2, op3, op4) {
        this.__jump(op1);
    }
    _log() {
        var out = [];
        for (const argumentsKey in arguments) {
            if (this.__issetEntity(arguments[argumentsKey])) {
                out.push(this.__getVar(arguments[argumentsKey]));
            }
            else {
                out.push(arguments[argumentsKey]);
            }
        }
        console.log(...out);
    }
    __debug(p, iArguments) {
        console.debug(...arguments);
    }
}
const text = fs.readFileSync(".ic10", "utf8");
var interpreterIc10 = new InterpreterIc10(text);
interpreterIc10.run();
//# sourceMappingURL=interpreter.js.map