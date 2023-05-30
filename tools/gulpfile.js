"use strict"
const gulp    = require("gulp")
const fs      = require("fs")
const getData = require(__dirname + "/ajax.js")
gulp.task("generate-langs", async function () {
	// console.log('generating')
	// console.log(IC10Data.Languages['ru'][0])
	const IC10Data = await getData()
	console.log(IC10Data)
	const keyword   = []
	const functions = []
	for (const languagesKey in IC10Data?.Languages) {
		fs.writeFileSync(`..\\languages\\${languagesKey}.json`, JSON.stringify(IC10Data.Languages[languagesKey], null, 2))
	}
	const snippets = JSON.parse(fs.readFileSync(`..\\snippets\\ic10.json`))
	for (const languageKey in IC10Data.Languages["en"]) {
		const data = IC10Data.Languages["en"][languageKey]
		if (data.type === "Function") {
			functions.push(languageKey)
		} else {
			keyword.push(languageKey)
		}
		snippets[languageKey] = {
			"prefix":      languageKey,
			"body":        [
				languageKey,
			],
			"description": data.description.text,
		}

	}

	fs.writeFileSync(`..\\snippets\\ic10.json`, JSON.stringify(snippets, null, 2))
	const tmLanguage10                                 = JSON.parse(fs.readFileSync(`..\\syntaxes\\ic10.tmLanguage.json`));
	tmLanguage10.repository.keywords.patterns[0].match = `\\b(${keyword.join("|")})\\b`
	tmLanguage10.repository.entity.patterns[0].match   = `\\b(${functions.join("|")})\\b`
	fs.writeFileSync(`..\\syntaxes\\ic10.tmLanguage.json`, JSON.stringify(tmLanguage10, null, 2))
	const tmLanguagex                                 = JSON.parse(fs.readFileSync(`..\\syntaxes\\icX.tmLanguage.json`));
	tmLanguagex.repository.keywords.patterns[0].match = `\\b(${keyword.join("|")})\\b`
	tmLanguagex.repository.entity.patterns[0].match   = `\\b(${functions.join("|")})\\b`
	fs.writeFileSync(`..\\syntaxes\\icX.tmLanguage.json`, JSON.stringify(tmLanguagex, null, 2))

	fs.writeFileSync(`..\\media\\ic10.keyword.json`, JSON.stringify(keyword, null, 2))
	fs.writeFileSync(`..\\media\\ic10.functions.json`, JSON.stringify(functions, null, 2))
	return gulp;
})

gulp.task("generate-aaa", function () {
	var result = null
	var a      = [
		"eq",
		"eqz",
		"ge",
		"gez",
		"gt",
		"gtz",
		"le",
		"lez",
		"lt",
		"ltz",
		"ne",
		"nez",
		"ap",
		"apz",
		"na",
		"naz",
		"dse",
		"dns",
	]
	// s
	for (const aKey in a) {
		var b = a[aKey]
		if (b.endsWith("z")) {

			result += `
		s${b}(op1,op2,op3,op4){
			this.memory.cell(op1, this.__${b.replace("z", null)}(this.memory.cell(op2),0))
		}
		`
		} else {
			result += `
		s${b}(op1,op2,op3,op4){
			this.memory.cell(op1, this.__${b}(this.memory.cell(op2),this.memory.cell(op3)))
		}
		`
		}
	}
	//b
	for (const aKey in a) {
		var b = a[aKey]
		if (b.endsWith("z")) {

			result += `
		b${b}(op1,op2,op3,op4){
			if( this.__${b.replace("z", null)}(this.memory.cell(op1),0)){
			 this.j(op3)
			 }
		}
		`
		} else {
			result += `
		b${b}(op1,op2,op3,op4){
			if( this.__${b}(this.memory.cell(op1),this.memory.cell(op2))){
			 this.j(op3)
			 }
		}
		`
		}
	}
	//br
	for (const aKey in a) {
		var b = a[aKey]
		if (b.endsWith("z")) {
			result += `
		br${b}(op1,op2,op3,op4){
			if( this.__${b.replace("z", null)}(this.memory.cell(op1),0)){
			 this.jr(op3)
			 }
		}
		`
		} else {
			result += `
		br${b}(op1,op2,op3,op4){
			if( this.__${b}(this.memory.cell(op1),this.memory.cell(op2))){
			 this.jr(op3)
			 }
		}
		`
		}
	}
	for (const aKey in a) {
		var b = a[aKey]
		if (b.endsWith("z")) {
			result += `
		b${b}al(op1,op2,op3,op4){
			if( this.__${b.replace("z", null)}(this.memory.cell(op1),0)){
			 this.jal(op3)
			 }
		}
		`
		} else {
			result += `
		b${b}al(op1,op2,op3,op4){
			if( this.__${b}(this.memory.cell(op1),this.memory.cell(op2))){
			 this.jal(op3)
			 }
		}
		`
		}
	}
	fs.writeFileSync(`fn.js`, result)

	// console.log(result)
})


