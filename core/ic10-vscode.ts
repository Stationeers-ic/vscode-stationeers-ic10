"use strict"
import vscode = require("vscode");
import {Ic10Error} from "ic10/src/Ic10Error"

export class Ic10Vscode {
    public wiki = "https://icx.traineratwot.site/wiki/ic10"
    LOCALE_KEY: string
    private readonly langPath: {}

    constructor() {
        this.langPath = {}
        this.LOCALE_KEY = vscode.env.language.trim()
        try {
            if (this.LOCALE_KEY === "zh-cn") {
                this.LOCALE_KEY = "zh"
            }
            let langPath = require(`../languages/${this.LOCALE_KEY}.json`)
            if (langPath instanceof Object) {
                this.langPath = langPath
            } else {
                langPath = require(`../languages/en.json`)
                this.langPath = langPath
                // console.info(`undefined lang ${this.LOCALE_KEY}`)
            }
        } catch (e) {
            // console.warn(e)
        }
    }

    public getHover(name = "") {
        if (this.langPath.hasOwnProperty(name)) {
            let data = this.langPath[name]
            if (Array.isArray(data)) {
                data = data[0]
            }
            const type = data?.type
            const op1 = data?.op1 || null
            const op2 = data?.op2 || null
            const op3 = data?.op3 || null
            const op4 = data?.op4 || null
            const op5 = data?.op5 || null
            const op6 = data?.op6 || null
            let preview = data?.description?.preview
            if (preview) {
                preview = "*" + preview + "*"
            }
            let description = data.description.text
            if (this.LOCALE_KEY == "ru") {
                description += `
				
----

[wiki](${this.wiki}#${name})
        `
            }
            let heading = `**${name} [_${type}_]** `
            if (op1) {
                heading += `op1:[${op1}] `
            }
            if (op2) {
                heading += `op2:[${op2}] `
            }
            if (op3) {
                heading += `op3:[${op3}] `
            }
            if (op4) {
                heading += `op4:[${op4}] `
            }
            if (op5) {
                heading += `op5:[${op5}] `
            }
            if (op6) {
                heading += `op6:[${op6}] `
            }

            return `
${heading}

----
${preview}

${description}
	    	`
        } else {
            return null
        }
    }

    public baseName(str) {
        const base = String(str).split("/")
        return base.unshift()
    }

    public htmlLog(e = null) {
        const html = []
        if (e instanceof Ic10Error) {
            const string = `[${this.var2str(e.message, 1)}:${this.var2str(e.line, 1)}] (${this.var2str(e.lvl, 1)}) - ${this.var2str(e.message, 1)}:`
            html.push(string)
        } else {
            for (const argumentsKey in arguments) {
                if (arguments.hasOwnProperty(argumentsKey)) {
                    const value = arguments[argumentsKey]
                    html.push(this.var2str(value))
                }
            }
        }
        return html.join("\r\n")
    }

    public var2str(value: any, mode = 0) {
        switch (typeof value) {
            case "string":
            case "number":
                if (isNaN(<number>value)) {
                    if (!mode) {
                        value = `<span style="color:var(--vscode-symbolIcon-stringForeground)">${value}</span>`
                    } else {
                        value = `<span style="color:var(--vscode-debugTokenExpression-string)">${value}</span>`
                    }
                } else {
                    if (!mode) {
                        value = `<span style="color:var(--vscode-symbolIcon-numberForeground)">${value}</span>`
                    } else {
                        value = `<span style="color:var(--vscode-debugTokenExpression-number)">${value}</span>`
                    }
                }
                break
            case "boolean":
                if (!mode) {
                    value = `<span style="color:var(--vscode-symbolIcon-booleanForeground)">${Number(value)}</span>`
                } else {
                    value = `<span style="color:var(--vscode-debugTokenExpression-boolean)">${Number(value)}</span>`
                }
                break
            case "object":
                value = JSON.stringify(value)
                if (value instanceof Array) {
                    if (!mode) {
                        value = `<span style="color:var(--vscode-symbolIcon-arrayForeground)">${value}</span>`
                    } else {
                        value = `<span style="color:var(--vscode-debugTokenExpression-array)">${value}</span>`
                    }
                } else {
                    if (!mode) {
                        value = `<span style="color:var(--vscode-symbolIcon-objectForeground)">${value}</span>`
                    } else {
                        value = `<span style="color:var(--vscode-debugTokenExpression-object)">${value}</span>`
                    }
                }
                break
        }

        return value
    }
}
