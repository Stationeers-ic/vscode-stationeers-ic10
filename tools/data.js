const request = require("sync-request")
const fs      = require("fs")
const path    = require("path")
const md5     = require("md5")

class cache {
	constructor() {
		if (!fs.existsSync(path.join(__dirname, "cache"))) {
			fs.mkdirSync(path.join(__dirname, "cache"))
		}
	}


	static getCache(str, source, target) {
		const key = md5(str + source + target)
		try {
			return fs.readFileSync(path.join(__dirname, "cache", key))
		} catch (err) {
			return null
		}
	}


	static setCache(str, source, target, value) {
		const key = md5(str + source + target)
		fs.writeFileSync(path.join(__dirname, "cache", key), value)
		return value
	}


	static call(str, source, target, callback) {
		let res = cache.getCache(str, source, target)
		if (!res) {
			return cache.setCache(str, source, target, callback(str, source, target))
		}
		return res
	}
}

new cache()

function getData() {
	const IC10Data = {
		translate: function (str, source = "ru", target = "en") {
			console.time("translate " + str)
			cache.call(str, source, target, (str, source, target) => {
				const url = encodeURI("http://traineratwot.aytour.ru/translate?string=" + str + "&source=" + source + "&target=" + target)
				const res = request("GET", url)
				return res.getBody("utf8")
			})
			console.timeEnd("translate " + str)
		},
		Languages: {},
		add:       function (lang = null, name = null, type = null, preview = null, text = null, op1 = null, op2 = null, op3 = null, op4 = null) {
			this.__add(lang, name, type, preview, text, op1, op2, op3, op4)
			return this
		},
		__add:     function (lang = null, name = null, type = null, preview = null, text = null, op1 = null, op2 = null, op3 = null, op4 = null) {
			if (lang) {
				lang = lang.trim() ?? null
			}
			if (name) {
				name = name.trim() ?? null
			}
			if (type) {
				type = type.trim() ?? null
			}
			if (preview) {
				preview = preview.trim() ?? null
			}
			if (text) {
				text = text.trim() ?? null
			}
			if (op1) {
				op1 = op1.trim() ?? null
			}
			if (op2) {
				op2 = op2.trim() ?? null
			}
			if (op3) {
				op3 = op3.trim() ?? null
			}
			if (op4) {
				op4 = op4.trim() ?? null
			}

			if (!(this.Languages[lang] instanceof Object)) {
				this.Languages[lang] = {}
			}
			if (name in this.Languages[lang]) {
				return this
			}
			if (!(this.Languages["en"] instanceof Object)) {
				this.Languages["en"] = {}
			}
			if (!(this.Languages["zh"] instanceof Object)) {
				this.Languages["zh"] = {}
			}
			this.Languages[lang][name] = {
				type:        type,
				op1:         op1 ? op1 : null,
				op2:         op2 ? op2 : null,
				op3:         op3 ? op3 : null,
				op4:         op4 ? op4 : null,
				description: {
					"preview": preview,
					"text":    text,
				},
			}
			this.Languages["en"][name] = {
				type:        type,
				op1:         op1 ? op1 : null,
				op2:         op2 ? op2 : null,
				op3:         op3 ? op3 : null,
				op4:         op4 ? op4 : null,
				description: {
					"preview": this.translate(preview),
					"text":    this.translate(text),
				},
			}
			this.Languages["zh"][name] = {
				type:        type,
				op1:         op1 ? op1 : null,
				op2:         op2 ? op2 : null,
				op3:         op3 ? op3 : null,
				op4:         op4 ? op4 : null,
				description: {
					"preview": this.translate(preview, "ru", "zh"),
					"text":    this.translate(text, "ru", "zh"),
				},
			}
			return this
		},
	}
	IC10Data
		.add("ru ", "abs ", "Function ", "op1 := |op2| ", "Абсолютная величина числа ", "R/N ", "R/N/C ", null)
		.add("ru ", "acos ", "Function ", "op1 := acos(op2) ", "Арккосинус* ", "R/N ", "R/N/C ", null)
		.add("ru ", "add ", "Function ", "op1 := op2 + op3 ", "Сумма ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "alias ", "Function ", "op2 => op1 ", "Задат псевдоним для регистра или канала данных ", "N ", "R/D ", null)
		.add("ru ", "and ", "Function ", "op1 := op2 op3 ", "Логическое И, единица, если и op2 и op3 истинны, ноль в противном случае ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "asin ", "Function ", "op1 := asin(op2) ", "Арксинус* ", "R/N ", "R/N/C ", null)
		.add("ru ", "atan ", "Function ", "op1 := atan(op2) ", "Арктангенс* ", "R/N ", "R/N/C ", null)
		.add("ru ", "atan2", "Function ", "op1 := atan2(op2,op3) ", "Арктангенс с 2 аргументами", "R/N ", "R/N/C", "R/N/C", null)
		.add("ru ", "bap ", "Function ", "Переход на op4, если op1 op2 с точностью op3 ", null, "R/N/C ", "R/N/C ", "R/N/C ", "R/N/A/T")
		.add("ru ", "bapal ", "Function ", "Переход на op4, если op1 op2 с точностью op3 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/C ", "R/N/A/T")
		.add("ru ", "bapz ", "Function ", "Переход на op3, если op1 0 с точностью op2 ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bapzal ", "Function ", "Переход на op3, если op1 0 с точностью op2 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bdns ", "Function ", "Переход на op2, если канал op1 не настроен ", null, "D/N ", "R/N/A/T ", null)
		.add("ru ", "bdnsal ", "Function ", "Переход на op2, если канал op1 не настроен с записью адреса следующей строки в ra ", null, "D/N ", "R/N/A/T ", null)
		.add("ru ", "bdse ", "Function ", "Переход на op2, если канал op1 настроен ", null, "D/N ", "R/N/A/T ", null)
		.add("ru ", "bdseal ", "Function ", "Переход на op2, если канал op1 настроен с записью адреса следующей строки в ra ", null, "D/N ", "R/N/A/T ", null)
		.add("ru ", "beq ", "Function ", "Переход на op3, если op1 = op2 ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "beqal ", "Function ", "Переход на op3, если op1 = op2 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "beqz ", "Function ", "Переход на op2, если op1 = 0 ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "beqzal ", "Function ", "Переход на op2, если op1 = 0 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bge ", "Function ", "Переход на op3, если op1 >= op2 ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bgeal ", "Function ", "Переход на op3, если op1 >= op2 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bgez ", "Function ", "Переход на op2, если op1 >= 0 ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bgezal ", "Function ", "Переход на op2, если op1 >= 0 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bgt ", "Function ", "Переход на op3, если op1 > op2 ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bgtal ", "Function ", "Переход на op3, если op1 > op2 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bgtz ", "Function ", "Переход на op2, если op1 > 0 ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bgtzal ", "Function ", "Переход на op2, если op1 > 0 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "ble ", "Function ", "Переход на op3, если op1 <= op2 ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bleal ", "Function ", "Переход на op3, если op1 <= op2 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "blez ", "Function ", "Переход на op2, если op1 <= 0 ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "blezal ", "Function ", "Переход на op2, если op1 <= 0 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "blt ", "Function ", "Переход на op3, если op1 < op2 ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bltal ", "Function ", "Переход на op3, если op1 < op2 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bltz ", "Function ", "Переход на op2, если op1 < 0 ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bltzal ", "Function ", "Переход на op2, если op1 < 0 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bna ", "Function ", "Переход на op4, если op1 ~= op2 с точностью op3 ", null, "R/N/C ", "R/N/C ", "R/N/C ", "R/N/A/T")
		.add("ru ", "bnaal ", "Function ", "Переход на op4, если op1 ~= op2 с точностью op3 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/C ", "R/N/A/T")
		.add("ru ", "bnaz ", "Function ", "Переход на op3, если op1 ~= 0 с точностью op2 ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bnazal ", "Function ", "Переход на op3, если op1 ~= 0 с точностью op2 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bne ", "Function ", "Переход на op3, если op1 != op2 ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bneal ", "Function ", "Переход на op3, если op1 != op2 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bnez ", "Function ", "Переход на op2, если op1 != 0 ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "bnezal ", "Function ", "Переход на op2, если op1 != 0 с записью адреса следующей строки в ra ", null, "R/N/C ", "R/N/A/T ", null)
		.add("ru ", "brap ", "Function ", "Относительный переход на +op4, если op1 op2 с точностью op3 ", null, "R/N/C ", "R/N/C ", "R/N/C ", "R/N/O")
		.add("ru ", "brapz ", "Function ", "Относительный переход на +op3, если op1 0 с точностью op2 ", null, "R/N/C ", "R/N/C ", "R/N/O ", null)
		.add("ru ", "brdns ", "Function ", "Относительный переход на +op2, если канал op1 не настроен ", null, "D/N ", "R/N/O ", null)
		.add("ru ", "brdse ", "Function ", "Относительный переход на +op2, если канал op1 настроен ", null, "D/N ", "R/N/O ", null)
		.add("ru ", "breq ", "Function ", "Относительный переход на +op3, если op1 = op2 ", null, "R/N/C ", "R/N/C ", "R/N/O ", null)
		.add("ru ", "breqz ", "Function ", "Относительный переход на +op2, если op1 = 0 ", null, "R/N/C ", "R/N/O ", null)
		.add("ru ", "brge ", "Function ", "Относительный переход на +op3, если op1 >= op2 ", null, "R/N/C ", "R/N/C ", "R/N/O ", null)
		.add("ru ", "brgez ", "Function ", "Относительный переход на +op2, если op1 >= 0 ", null, "R/N/C ", "R/N/O ", null)
		.add("ru ", "brgt ", "Function ", "Относительный переход на +op3, если op1 > op2 ", null, "R/N/C ", "R/N/C ", "R/N/O ", null)
		.add("ru ", "brgtz ", "Function ", "Относительный переход на +op2, если op1 > 0 ", null, "R/N/C ", "R/N/O ", null)
		.add("ru ", "brle ", "Function ", "Относительный переход на +op3, если op1 <= op2 ", null, "R/N/C ", "R/N/C ", "R/N/O ", null)
		.add("ru ", "brlez ", "Function ", "Относительный переход на +op2, если op1 <= 0 ", null, "R/N/C ", "R/N/O ", null)
		.add("ru ", "brlt ", "Function ", "Относительный переход на +op3, если op1 < op2 ", null, "R/N/C ", "R/N/C ", "R/N/O ", null)
		.add("ru ", "brltz ", "Function ", "Относительный переход на +op2, если op1 < 0 ", null, "R/N/C ", "R/N/O ", null)
		.add("ru ", "brna ", "Function ", "Относительный переход на +op4, если op1 op2 с точностью op3 ", null, "R/N/C ", "R/N/C ", "R/N/C ", "R/N/O")
		.add("ru ", "brnaz ", "Function ", "Относительный переход на +op3, если op1 0 с точностью op2 ", null, "R/N/C ", "R/N/C ", "R/N/O ", null)
		.add("ru ", "brne ", "Function ", "Относительный переход на +op3, если op1 != op2 ", null, "R/N/C ", "R/N/C ", null)
		.add("ru ", "brnez ", "Function ", "Относительный переход на +op2, если op1 != 0 ", null, "R/N/C ", "R/N/O ", null)
		.add("ru ", "ceil ", "Function ", "op1 := op2 ", "Округление до ближайшего целого вверх ", "R/N ", "R/N/C ", null)
		.add("ru ", "cos ", "Function ", "op1 := cos(op2) ", "Косинус* ", "R/N ", "R/N/C ", null)
		.add("ru ", "define ", "Function ", "op2 => op1 ", "Задать имя для константы ", "Cn ", "C ", null)
		.add("ru ", "div ", "Function ", "op1 :=op2 / op3 ", "Деление ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "exp ", "Function ", "op1 := eop2 ", "Экспонента ", "R/N ", "R/N/C ", null)
		.add("ru ", "floor ", "Function ", "op1 := op2 ", "Округление до ближайшего целого вниз ", "R/N ", "R/N/C ", null)
		.add("ru ", "hcf ", "Function ", "Остановить работу и сжечь микропроцессор ", null)
		.add("ru ", "j ", "Function ", "Переход на указанную строку ", null, "R/N/A/T")
		.add("ru ", "jal ", "Function ", "Переход на op1 с записью адреса следующей строки в ra ", null, "R/N/A/T")
		.add("ru ", "jr ", "Function ", "Относительный переход на +op1 ", null, "R/N/O")
		.add("ru ", "l ", "Function ", "op1 := op2.op3 ", "Чтение значения параметра op3 из порта op2 ", "R/N ", "D/N ", "P ", null)
		.add("ru ", "log ", "Function ", "op1 := ln(op2) ", "Натуральный логарифм ", "R/N ", "R/N/C ", null)
		.add("ru ", "lr ", "Function ", "op1 := op2.mode(op3).op4 ", "Чтение значения реагента op4 в режиме op3 из порта op2 ", "R/N ", "D/N ", "R/N/RM ", "RC")
		.add("ru ", "ls ", "Function ", "op1 := op2.slot(op3).op4 ", "Чтение значения op4 из слота op3 порта op2 ", "R/N ", "D/N ", "R/N/S ", "P")
		.add("ru ", "max ", "Function ", "op1 := max(op2, op3) ", "Максимальное из двух ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "min ", "Function ", "op1 := min(op2, op3) ", "Минимальное из двух ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ",
			 "mod ",
			 "Function ",
			 "op1 := op2 mod op3 ",
			 "Остаток от целочисленного деления op2 на op3 (результат не эквивалентен оператору %, и будет положителен при любых знаках op2 и op3) ",
			 "R/N ",
			 "R/N/C ",
			 "R/N/C ",
			 null)
		.add("ru ", "move ", "Function ", "op1 := op2 ", "Присвоение значения ", "R/N ", "R/N/C ", null)
		.add("ru ", "mul ", "Function ", "op1 := op2 * op3 ", "Произведение ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "nor ", "Function ", "op1 := ¬(op2 op3) ", "Инверсное ИЛИ, единица, если и op2 и op3 ложны, ноль в противном случае ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "or ", "Function ", "op1 := op2 op3 ", "Логическое ИЛИ, ноль, если и op2 и op3 ложны, единица в противном случае ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "peek ", "Function ", "op1 := stack[sp-1] ", "Записать в op1 верхнее значение со стека не двигая стек ", "R/N ", null)
		.add("ru ", "pop ", "Function ", "op1 := stack[--sp] ", "Снять значение со стека и записать в op1 ", "R/N ", null)
		.add("ru ", "push ", "Function ", "stack[sp++] := op1 ", "Положить op1 на стек ", "R/N/C ", null)
		.add("ru ", "rand ", "Function ", "op1 := rand(0,1) ", "Случайная величина от 0 до 1 включительно ", "R/N ", null)
		.add("ru ", "round ", "Function ", "op1 := [op2] ", "Округление к ближайшему целому ", "R/N ", "R/N/C ", null)
		.add("ru ", "s ", "Function ", "op1.op2 := op3 ", "Запись значения в параметр op2 порта op1 ", "D/N ", "P ", "R/N/C ", null)
		.add("ru ", "sap ", "Function ", "op1 := (op2 op3) ", "Если op2 op3 с точностью op4, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", "R/N/C")
		.add("ru ", "sapz ", "Function ", "op1 := (op2 0) ", "Если op2 0 с точностью op3, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "sdns ", "Function ", "op1 := ¬isset(op2) ? 1 : 0 ", "Если канал op2 не настроен на то единица, иначе ноль ", "R/N ", "D/N ", null)
		.add("ru ", "sdse ", "Function ", "op1 := isset(op2) ? 1 : 0 ", "Если канал op2 настроен на то единица, иначе ноль ", "R/N ", "D/N ", null)
		.add("ru ", "select ", "Function ", "op1 := (op2 ? op3 : op4) ", "Тернарный select. Если op2 истинно, то op1 := op3, иначе op1 := op4 ", "R/N ", "R/N/C ", "R/N/C ", "R/N/C")
		.add("ru ", "seq ", "Function ", "op1 := (op2 = op3) ", "Если op2 = op3, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "seqz ", "Function ", "op1 := (op2 = 0) ", "Если op2 = 0, то единица, иначе ноль ", "R/N ", "R/N/C ", null)
		.add("ru ", "sge ", "Function ", "op1 := (op2 op3) ", "Если op2 op3, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "sgez ", "Function ", "op1 := (op2 0) ", "Если op2 0, то единица, иначе ноль ", "R/N ", "R/N/C ", null)
		.add("ru ", "sgt ", "Function ", "op1 := (op2 > op3) ", "Если op2 > op3, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "sgtz ", "Function ", "op1 := (op2 > 0) ", "Если op2 > 0, то единица, иначе ноль ", "R/N ", "R/N/C ", null)
		.add("ru ", "sin ", "Function ", "op1 := sin(op2) ", "Синус* ", "R/N ", "R/N/C ", null)
		.add("ru ", "sle ", "Function ", "op1 := (op2 op3) ", "Если op2 op3, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "sleep ", "Function ", "Приостановка программы на op1 секунд ", "R/N/C ", "R/N/C")
		.add("ru ", "slez ", "Function ", "op1 := (op2 0) ", "Если op2 0, то единица, иначе ноль ", "R/N ", "R/N/C ", null)
		.add("ru ", "slt ", "Function ", "op1 := (op2 < op3) ", "Если op2 < op3, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "sltz ", "Function ", "op1 := (op2 < 0) ", "Если op2 < 0, то единица, иначе ноль ", "R/N ", "R/N/C ", null)
		.add("ru ", "sna ", "Function ", "op1 := (op2 op3) ", "Если op2 op3 с точностью op4, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", "R/N/C")
		.add("ru ", "snaz ", "Function ", "op1 := (op2 0) ", "Если op2 0 с точностью op3, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "sne ", "Function ", "op1 := (op2 op3) ", "Если op2 op3, то единица, иначе ноль ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "snez ", "Function ", "op1 := (op2 0) ", "Если op2 0, то единица, иначе ноль ", "R/N ", "R/N/C ", null)
		.add("ru ", "sqrt ", "Function ", "op1 := o̅p̅2̅ ", "Квадратный корень ", "R/N ", "R/N/C ", null)
		.add("ru ", "sub ", "Function ", "op1 := op2 - op3 ", "Разность ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "tan ", "Function ", "op1 := tan(op2) ", "Тангенс* ", "R/N ", "R/N/C ", null)
		.add("ru ", "trunc ", "Function ", "op1 := int(op2) ", "Целая часть числа ", "R/N ", "R/N/C ", null)
		.add("ru ", "xor ", "Function ", "op1 := op2 op3 ", "Исключающее ИЛИ, единица, если одно и только одно из op2 и op3 истинно, ноль в противном случае ", "R/N ", "R/N/C ", "R/N/C ", null)
		.add("ru ", "yield ", "Function ", "Приостановка программы до следующего тика ", null)
		.add("ru ", "lb ", "Function ", "op1 := op2.op3.mode(op4) ", "Пакетное чтение в op1 из всех устройств с хешем op2 параметра op3 в режиме op4 ", "R/N ", "R/N/C/H ", "P ", "BM")
		.add("ru ", "sb ", "Function ", "op1.op2 := op3 ", "Пакетная запись во все устройства с хешем op1 в параметр op2 значения op3 ", "R/N/C/H", "P ", "R/N/C ", null)
		.add("ru ", "ls ", "Function ", "op1 := op2.slot(op3).op4 ", "Чтение значения op4 из слота op3 порта op2 ", "R/N ", "D/N ", "R/N/S ", "P")
		.add("ru ", "stack ", "Function ", "stack 1 2 3 ... ", "Заполняет стак значиниями аргументов ", "R/N/C ", null, null, null)

		.add("ru ", "Activate ", "Device parameter ", "Trigger ", "-1 - остановить , 0 - не работает 1 - работает")
		.add("ru ", "Charge ", "Device parameter ", "Float ", "Заряд батареи или аккумулятора, Дж. Уровень генерации электричества солнечной панелью, Вт.")
		.add("ru ", "Class ", "Device parameter ", null, "класс объекта в слоте")
		.add("ru ", "ClearMemory ", "Device parameter ", "Trigger ", ">=1 - сбрасывает счётчики")
		.add("ru ",
			 "Color ",
			 "Device parameter ",
			 `0-синий , 1-серый , 2-зелёный , 3-оранжевый , 4-красный , 5-жёлтый, 6-белый, 7-чёрный, 8-коричневый, 9-хаки, 10-розовый, 11-фиолетовый`,
			 "Цвет LED-лампы, стационарного маяка и светодиодного дисплея")
		.add("ru ", "Combustion ", "Device parameter ", "Bool ", "1 - обнаружено воспламенение, 0 - во всех остальных случаях")
		.add("ru ", "CompletionRatio ", "Device parameter ", "Float[0-1] ", "этап производства в %")
		.add("ru ", "Damage ", "Device parameter ", "Float[0-1] ", "уровень повреждения объекта")
		.add("ru ",
			 "ElevatorLevel ",
			 "Device parameter ",
			 "Int ",
			 "На чтение - уровень, на котором находится кабинка лифта, или -1, если кабинки нет. На запись - отправляет лифт на указанный этаж.")
		.add("ru ",
			 "ElevatorSpeed ",
			 "Device parameter ",
			 "Float ",
			 "Скорость движения кабинки лифта, м/тик. Отрицательное значение соответствуют движению вниз, 0 - неподвижной кабинке, положительное - движению вверх.")
		.add("ru ", "Error ", "Device parameter ", "Bool ", "0 - нормальная работа, 1 - ошибка")
		.add("ru ", "ExportCount ", "Device parameter ", "Int ", "счётчик объектов, прошедших через слот экспорта")
		.add("ru ", "Filtration ", "Device parameter ", "Bool ", "Переключает фильтрацию отработанной смеси в прочном скафандре.")
		.add("ru ", "ForceWrite ", "Device parameter ", "Trigger ", "Принудительно заставляет чипы записи и множественной записи передать текущее значение в оборудование.")
		.add("ru ", "Harvest ", "Device parameter ", "Trigger ", "Активирует сбор урожая в автоматической гидропонной станции.")
		.add("ru ", "Horizontal ", "Device parameter ", "Float[0 - 360] ", "угол по отношению к Солнцу в градусах в горизонтальной проекции Солнца на плоскость датчика")
		.add("ru ", "Idle ", "Device parameter ", "Bool ", "Загрузка дуговой печи. 0 - руда не загружена, 1 - загружена.")
		.add("ru ", "ImportCount ", "Device parameter ", "Int ", "счётчик объектов, прошедших через слот импорта")
		.add("ru ", "Lock ", "Device parameter ", "Bool ", "0 - ручное управление разблокировано, 1 - заблокировано")
		.add("ru ",
			 "Maximum ",
			 "Device parameter ",
			 "Float ",
			 "Максимальное значение какого-либо параметра оборудования, например, заряда батареи или давления на входе в камеру сгорания реактивного двигателя. Очень часто присутствует, но не используется.")
		.add("ru ", "MaxQuantity ", "Device parameter ", "Float ", "максимальное количество предметов в слоте")
		.add("ru ", "Mode ", "Device parameter ", "Int ", " режим работы")
		.add("ru ", "On ", "Device parameter ", "Bool ", "0 - выключен 1 - включен")
		.add("ru ", "Open ", "Device parameter ", "Bool ", "0 - выброс закрыт, 1 - открыт")
		.add("ru ",
			 "Output ",
			 "Device parameter ",
			 "Int/Trigger ",
			 `Для сортировщика - r/w , Int - следующий выход, на который будет выдан объект.<br>Для стакера - w, Trigger - выгружает накопленную упаковку объектов в слот экспорта.	`)
		.add("ru ", "Plant ", "Device parameter ", "Trigger ", "Запускает процесс посадки растения из слота импорта в автоматической гидропонной станции.")
		.add("ru ", "PositionX ", "Device parameter ", "Float ", "координата X текущего положения")
		.add("ru ", "PositionY ", "Device parameter ", "Float ", "координата Y текущего положения")
		.add("ru ", "PositionZ ", "Device parameter ", "Float ", "координата Z текущего положения")
		.add("ru ", "Power ", "Device parameter ", "Bool ", "0 - питание отсутствует или выключен, 1 - питание подано")
		.add("ru ", "PowerActual ", "Device parameter ", "Float ", "Суммарное потребление электроэнергии всеми устройствами в сети, Вт.")
		.add("ru ", "PowerGeneration ", "Device parameter ", "Float ", "Текущее производство электроэнергии генератором, Вт.")
		.add("ru ", "PowerPotential ", "Device parameter ", "Float ", "Предельная доступная мощность сети, Вт.")
		.add("ru ", "PowerRequired ", "Device parameter ", "Float ", "Суммарная потребность в электроэнергии всех устройств в сети, Вт.")
		.add("ru ", "PressureExternal ", "Device parameter ", "Float ", "атмосферное давление во внешней среде, кПа")
		.add("ru ", "PressureInternal ", "Device parameter ", "Float ", "Давление в трубопроводе, при котором останавливается работа активной вентиляции, кПа. Устанавливается, но не используется.")
		.add("ru ", "Ratio ", "Device parameter ", "Float ", "Для батарей - соотношение Charge/Maximum.<br>Для остальных устройств - соотношение Setting/Maximum.")
		.add("ru ", "RatioCarbonDioxide ", "Device parameter ", "Float ", "доля углекислого газа")
		.add("ru ", "RatioNitrogen ", "Device parameter ", "Float ", "доля азота")
		.add("ru ", "RatioNitrousOxide ", "Device parameter ", "Float ", "доля закиси азота")
		.add("ru ", "RatioOxygen ", "Device parameter ", "Float ", "доля кислорода")
		.add("ru ", "RatioPollutant ", "Device parameter ", "Float ", "доля токсинов")
		.add("ru ", "RatioVolatiles ", "Device parameter ", "Float ", "доля летучих газов")
		.add("ru ", "RatioWater ", "Device parameter ", "Float ", "доля водяных паров")
		.add("ru ", "Reagents ", "Device parameter ", "Float ", "общая масса ингредиентов в граммах")
		.add("ru ", "RecipeHash ", "Device parameter ", "Int ", "хэш выбранного рецепта")
		.add("ru ", "RequiredPower ", "Device parameter ", "Float ", "Энергия, требуемая для рабботы устройства, Вт.")
		.add("ru ", "Setting ", "Device parameter ", "Any ", "Текущее значение какого-то параметра оборудования. Тип и возможные значения зависят от оборудования.")
		.add("ru ", "SolarAngle ", "Device parameter ", "Float ", "угол по отношению к Солнцу в градусах")
		.add("ru ", "TargetX ", "Device parameter ", "Int ", "координата X цели")
		.add("ru ", "TargetY ", "Device parameter ", "Int ", "координата Y цели")
		.add("ru ", "TargetZ ", "Device parameter ", "Int ", "координата Z цели")
		.add("ru ", "TemperatureExternal ", "Device parameter ", "Float ", "температура внешней атмосферы, К")
		.add("ru ", "TemperatureSetting ", "Device parameter ", "Float ", "Заданная температура внутри прочного скафандра, К.")
		.add("ru ", "TotalMoles ", "Device parameter ", "Float ", "Общее количество газа внутри трубопровода, моль.")
		.add("ru ", "VelocityMagnitude ", "Device parameter ", "Float ", "модуль скорости движения бота")
		.add("ru ", "VelocityRelativeX ", "Device parameter ", "Float ", "скорость движения по координате X")
		.add("ru ", "VelocityRelativeY ", "Device parameter ", "Float ", "скорость движения по координате Y")
		.add("ru ", "VelocityRelativeZ ", "Device parameter ", "Float ", "скорость движения по координате Z")
		.add("ru ", "Vertical ", "Device parameter ", "Float ", "угол по отношению к Солнцу в градусах")
		.add("ru ", "Volume ", "Device parameter ", "Float ", "Громкость")

		.add("ru ", "Charge ", "Slot parameter ", "Float ", "Заряд аккумулятора в слоте, Дж.")
		.add("ru ", "ChargeRatio ", "Slot parameter ", "Float[0-1] ", "Уровень заряда аккумулятора в слоте.")
		.add("ru ",
			 "Class ",
			 "Slot parameter ",
			 "Int ",
			 `0 - всё , что не относится к остальным классам;<br> 1 - шлемы;<br> 2 - скафандры и броня;<br> 3 - джетпаки и рюкзаки;<br> 4 - газовые фильтры;<br> 5 - газовые баллоны;<br> 6 - материнские платы;<br> 7 - печатные платы;<br> 8 - диск данных;<br> 9 - органы (мозг, лёгкие);<br> 10 - руды;<br> 11 - растения;<br> 12 - униформа;<br> 13 - существа (в том числе и персонажи);<br> 14 - аккумуляторы;<br> 14 - яйца;<br> 15 - пояса;<br> 16 - инструменты;<br> 17 - настольное оборудование (микроволновка, смеситель красок и т.п.);<br> 18 - слитки;<br> 19 - торпеды;<br> 20 - картриджи;<br> 21 - карты доступа, <br> 22 - магазины к оружию;<br> 23 - логические чипы;<br> 24 - бутылки (молоко, соевое масло);<br> 25 - микропроцессоры;<br> 26 - очки.`)
		.add("ru ", "Damage ", "Slot parameter ", "Float[0-1] ", "Уровень повреждения объекта в слоте. 0 - объект целый, 1 - полностью разрушен.")
		.add("ru ", "Efficiency ", "Slot parameter ", "Float[0-1] ", "Эффективность роста растения в автоматической гидропонной станции. -1, если растения нет.")
		.add("ru ", "Growth ", "Slot parameter ", "Float[0-1] ", "Стадия роста растения в автоматической гидропонной станции. -1, если растения нет.")
		.add("ru ", "Health ", "Slot parameter ", "Float[0-1] ", "Здоровье растения в автоматической гидропонной станции. 0 - умершаа растение, 1 - полностью здоровое, -1 - растения нет.")
		.add("ru ", "Mature ", "Slot parameter ", "Float[0-1] ", "Готовность растения в автоматической гидропонной станции к сбору урожая. -1 если растения нет.")
		.add("ru ", "OccupantHash ", "Slot parameter ", "Hash ", "хэш объекта в слоте")
		.add("ru ", "Occupied ", "Slot parameter ", "Bool ", "0 - слот свободен, 1 - занят")
		.add("ru ", "PressureAir ", "Slot parameter ", "Float ", "Давление в баллоне с дыхательной смесью скафандра, установленного в стойку, кПа.")
		.add("ru ", "PressureWaste ", "Slot parameter ", "Float ", "Давление в баллоне с отработанной смесью скафандра, установленного в стойку, кПа.")

		.add("ru ", "PrefabHash ", "Parameter ", "Hash ", "хэш Prefab объекта")
		.add("ru ", "Pressure ", "Parameter ", "Float ", "давление, кПа")
		.add("ru ", "Quantity ", "Parameter ", "Float/Int ", "масса / количество предметов")
		.add("ru ", "Temperature ", "Parameter ", "Float ", "температура, К")
		.add("ru ", "Bpm ", "Parameter ", "Float ", null)
		.add("ru ", "CollectableGoods ", "Parameter ", "Float ", null)
		.add("ru ", "Combustion ", "Parameter ", "Float ", null)
		.add("ru ", "CurrentResearchPodType ", "Parameter ", "Float ", null)
		.add("ru ", "Fuel ", "Parameter ", "Float ", "Топливо")
		.add("ru ", "ManualResearchRequiredPod ", "Parameter ", "Float ", null)
		.add("ru ", "MineablesInQueue ", "Parameter ", "Float ", null)
		.add("ru ", "MineablesInVicinity ", "Parameter ", "Float ", null)
		.add("ru ", "NextWeatherEventTime ", "Parameter ", "Float ", null)
		.add("ru ", "ReturnFuelCost ", "Parameter ", "Float ", null)
		.add("ru ", "SettingInput ", "Parameter ", "Float ", null)
		.add("ru ", "SettingOutput ", "Parameter ", "Float ", null)
		.add("ru ", "SignalID ", "Parameter ", "Float ", null)
		.add("ru ", "SignalStrength ", "Parameter ", "Float ", null)
		.add("ru ", "TemperatureSetting ", "Parameter ", "Float ", null)
		.add("ru ", "Time ", "Parameter ", "Float ", null)
		.add("ru ", "AirRelease ", "Parameter ", "Float ", null)
		.add("ru ", "HorizontalRatio ", "Parameter ", "Float ", null)
		.add("ru ", "PressureSetting ", "Parameter ", "Float ", null)
		.add("ru ", "RequestHash ", "Parameter ", "Float ", null)
		.add("ru ", "VerticalRatio ", "Parameter ", "Float ", null)
		.add("ru ", "Seeding ", "Parameter ", "int ", "-1 - нельзя собрать семена, 1 - можно")

		.add("ru ", "CombustionInput ", "Parameter ", "Float ", null)
		.add("ru ", "CombustionOutput ", "Parameter ", "Float ", null)
		.add("ru ", "CombustionOutput2", "Parameter ", "Float ", null)
		.add("ru ", "TemperatureInput", "Parameter ", "Float ", null)
		.add("ru ", "TemperatureOutput", "Parameter ", "Float ", null)
		.add("ru ", "TemperatureOutput2", "Parameter ", "Float ", null)
		.add("ru ", "PressureInput", "Parameter ", "Float ", null)
		.add("ru ", "PressureOutput", "Parameter ", "Float ", null)
		.add("ru ", "PressureOutput2", "Parameter ", "Float ", null)
		.add("ru ", "TotalMolesInput", "Parameter ", "Float ", null)
		.add("ru ", "TotalMolesOutput", "Parameter ", "Float ", null)
		.add("ru ", "TotalMolesOutput2", "Parameter ", "Float ", null)
		.add("ru ", "RatioCarbonDioxideInput", "Parameter ", "Float ", null)
		.add("ru ", "RatioCarbonDioxideOutput", "Parameter ", "Float ", null)
		.add("ru ", "RatioCarbonDioxideOutput2", "Parameter ", "Float ", null)
		.add("ru ", "RatioNitrogenInput", "Parameter ", "Float ", null)
		.add("ru ", "RatioNitrogenOutput", "Parameter ", "Float ", null)
		.add("ru ", "RatioNitrogenOutput2", "Parameter ", "Float ", null)
		.add("ru ", "RatioNitrousOxideInput", "Parameter ", "Float ", null)
		.add("ru ", "RatioNitrousOxideOutput", "Parameter ", "Float ", null)
		.add("ru ", "RatioNitrousOxideOutput2", "Parameter ", "Float ", null)
		.add("ru ", "RatioOxygenInput", "Parameter ", "Float ", null)
		.add("ru ", "RatioOxygenOutput", "Parameter ", "Float ", null)
		.add("ru ", "RatioOxygenOutput2", "Parameter ", "Float ", null)
		.add("ru ", "RatioPollutantInput", "Parameter ", "Float ", null)
		.add("ru ", "RatioPollutantOutpu", "Parameter ", "Float ", null)
		.add("ru ", "RatioPollutantOutput2", "Parameter ", "Float ", null)
		.add("ru ", "RatioVolatilesInput", "Parameter ", "Float ", null)
		.add("ru ", "RatioVolatilesOutput", "Parameter ", "Float ", null)
		.add("ru ", "RatioVolatilesOutput2", "Parameter ", "Float ", null)
		.add("ru ", "RatioWaterInput", "Parameter ", "Float ", null)
		.add("ru ", "RatioWaterOutput", "Parameter ", "Float ", null)
		.add("ru ", "RatioWaterOutput2", "Parameter ", "Float ", null)
		.add("ru ", "PressureEfficiency", "Parameter ", "Float ", null)
		.add("ru ", "OperationalTemperatureEfficiency", "Parameter ", "Float ", null)
		.add("ru ", "TemperatureDifferentialEfficiency", "Parameter ", "Float ", null)

		.add("ru ", "Average ", "Const ", "string ", null)
		.add("ru ", "Sum ", "Const ", "string ", null)
		.add("ru ", "Minimum ", "Const ", "string ", null)
		.add("ru ", "Maximum ", "Const ", "string ", null)

		.add("ru ", "Maximum ", "ERROR ", "string ", null)
	return IC10Data
}

module.exports = getData
