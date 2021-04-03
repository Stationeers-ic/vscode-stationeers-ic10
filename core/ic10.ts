"use strict";
import vscode = require("vscode");

const LOCALE_KEY: string = vscode.env.language.trim()
try {
  var IC10Data: object = {};
  var langPath = require(`../languages/${LOCALE_KEY}.json`);
  console.log(langPath)
  if (langPath instanceof Object) {
    IC10Data = langPath
    console.info('Ok')
  } else {
    console.error('ERROR')
  }
} catch (e) {
  console.warn(e)
}

export class IC10 {
  public getHover(name = '', lang = '') {

    if (IC10Data.hasOwnProperty(name)) {
      var data = IC10Data[name]
      var type = data?.type
      var op1 = data?.op1
      var op2 = data?.op2
      var op3 = data?.op3
      var op4 = data?.op4
      var preview = data?.description?.preview
      if (preview) {
        preview = '*' + preview + '*'
      }
      var description = data.description.text
      var heading = `${type} **${name}** `
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
}
