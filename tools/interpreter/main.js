fs = require("fs")
const text = fs.readFileSync(".ic10", "utf8")

const lines = text.split("\r\n")
const commands = lines.map((line) => {
	const args = line.toLowerCase().trim().split(/ +/)
	const command = args.shift().toLowerCase()
	return { command, args}
})
var position = 0
// console.log(commands)
class MemoryCell {
	Constructor() {
		this.value = null
	}
	get() {
		return this.value
	}
	set(value) {
		this.value = value
	}
}
const memory = {
	r0: new MemoryCell(),
	r1: new MemoryCell(),
	r2: new MemoryCell(),
	r3: new MemoryCell(),
	r4: new MemoryCell(),
	r5: new MemoryCell(),
}
const variables = {}

function getVar(x) {
	return variables[x].get()
}
function setVar(x, value) {
	variables[x].set(value)
}

while (position < commands.length) {
	const { command, args, text } = commands[position]
	switch (command) {
		case "alias":
			variables[args[0]] = memory[args[1]]
			break
		case "move":
			setVar(args[0], isNaN(args[1]) ? args[1] : Number(args[1]))
			break
		case "add":
			setVar(args[0], getVar(args[1]) + getVar(args[2]))
			break
		case "sub":
			setVar(args[0], getVar(args[1]) - getVar(args[2]))
			break
		case "mul":
			setVar(args[0], getVar(args[1]) * getVar(args[2]))
			break
		case "div":
			setVar(args[0], getVar(args[1]) / getVar(args[2]))
			break
		case "mod":
			setVar(args[0], Math.abs(getVar(args[1]) % getVar(args[2])))
			break
		case "#log":
			if (args[0].startsWith('"') || args[0].startsWith("'")){
				console.log(args.reduce((accumulator, currentValue) => accumulator + " " +currentValue))
			} else
			console.log(getVar(args[0]))
	}
	position++
}
// console.log(memory, variables)
