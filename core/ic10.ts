"use strict";

var IC10Data = {
  __add: function (name, type = null, preview = null, ru = null, en = null, op1 = null, op2 = null, op3 = null, op4 = null) {
    IC10Data[name] = (<any>Object).assign({
      type: "function",
      op1: null,
      op2: null,
      op3: null,
      op4: null,
      description: {
        "preview": "",
        "ru": "",
        "en": "",
      }
    }, {
      type: type,
      op1: op1,
      op2: op2,
      op3: op3,
      op4: op4,
      description: {
        "preview": preview,
        "ru": ru,
        "en": en,
      }
    })
    return this;
  }
}
IC10Data.__add("l", "function", "op1 := op2.op3", "Чтение значения параметра op3 из порта op2",  "","R/N", "D/N", "P", "")
.__add("s", "function", "op1.op2 := op3", "Запись значения в параметр op2 порта op1",  "","D/N", "P", "R/N/C", "")
.__add("ls", "function", "op1 := op2.slot(op3).op4", "Чтение значения op4 из слота op3 порта op2",  "","R/N", "D/N", "R/N/S", "P")
.__add("lr", "function", "op1 := op2.mode(op3).op4", "Чтение значения реагента op4 в режиме op3 из порта op2",  "","R/N", "D/N", "R/N/RM", "RC")
.__add("alias", "function", "op2 => op1", "Задат псевдоним для регистра или канала данных",  "","N", "R/D", "", "")
.__add("define", "function", "op2 => op1", "Задат имя для константы",  "","Cn", "C", "", "")
.__add("move", "function", "op1 := op2", "Присвоение значения",  "","R/N", "R/N/C", "", "")
.__add("add", "function", "op1 := op2 + op3", "Сумма",  "","R/N", "R/N/C", "R/N/C", "")
.__add("sub", "function", "op1 := op2  op3", "Разность",  "","R/N", "R/N/C", "R/N/C", "")
.__add("mul", "function", "op1 := op2  op3", "Произведение",  "","R/N", "R/N/C", "R/N/C", "")
.__add("div", "function", "op1 :=op2 / op3", "Деление",  "","R/N", "R/N/C", "R/N/C", "")
.__add("mod", "function", "op1 := op2 mod op3", "Остаток от целочисленного деления op2 на op3 (результат не эквивалентен оператору %, и будет положителен при любых знаках op2 и op3)",  "","R/N", "R/N/C", "R/N/C", "")
.__add("sqrt", "function", "op1 := o̅p̅2̅", "Квадратный корень",  "","R/N", "R/N/C", "", "")
.__add("round", "function", "op1 := [op2]", "Округление к ближайшему целому",  "","R/N", "R/N/C", "", "")
.__add("trunc", "function", "op1 := int(op2)", "Целая часть числа",  "","R/N", "R/N/C", "", "")
.__add("ceil", "function", "op1 := op2", "Округление до ближайшего целого вверх",  "","R/N", "R/N/C", "", "")
.__add("floor", "function", "op1 := op2", "Округление до ближайшего целого вниз",  "","R/N", "R/N/C", "", "")
.__add("max", "function", "op1 := max(op2, op3)", "Максимальное из двух",  "","R/N", "R/N/C", "R/N/C", "")
.__add("min", "function", "op1 := min(op2, op3)", "Минимальное из двух",  "","R/N", "R/N/C", "R/N/C", "")
.__add("abs", "function", "op1 := |op2|", "Абсолютная величина числа",  "","R/N", "R/N/C", "", "")
.__add("log", "function", "op1 := ln(op2)", "Натуральный логарифм",  "","R/N", "R/N/C", "", "")
.__add("exp", "function", "op1 := eop2", "Экспонента",  "","R/N", "R/N/C", "", "")
.__add("rand", "function", "op1 := rand(0,1)", "Случайная величина от 0 до 1 включительно",  "","R/N", "", "", "")
.__add("sin", "function", "op1 := sin(op2)", "Синус*",  "","R/N", "R/N/C", "", "")
.__add("cos", "function", "op1 := cos(op2)", "Косинус*",  "","R/N", "R/N/C", "", "")
.__add("tan", "function", "op1 := tan(op2)", "Тангенс*",  "","R/N", "R/N/C", "", "")
.__add("asin", "function", "op1 := asin(op2)", "Арксинус*",  "","R/N", "R/N/C", "", "")
.__add("acos", "function", "op1 := acos(op2)", "Арккосинус*",  "","R/N", "R/N/C", "", "")
.__add("atan", "function", "op1 := atan(op2)", "Арктангенс*",  "","R/N", "R/N/C", "", "")
.__add("slt", "function", "op1 := (op2 < op3)", "Если op2 < op3, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "")
.__add("sltz", "function", "op1 := (op2 < 0)", "Если op2 < 0, то единица, иначе ноль",  "","R/N", "R/N/C", "", "")
.__add("sgt", "function", "op1 := (op2 > op3)", "Если op2 > op3, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "")
.__add("sgtz", "function", "op1 := (op2 > 0)", "Если op2 > 0, то единица, иначе ноль",  "","R/N", "R/N/C", "", "")
.__add("sle", "function", "op1 := (op2  op3)", "Если op2  op3, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "")
.__add("slez", "function", "op1 := (op2  0)", "Если op2  0, то единица, иначе ноль",  "","R/N", "R/N/C", "", "")
.__add("sge", "function", "op1 := (op2  op3)", "Если op2  op3, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "")
.__add("sgez", "function", "op1 := (op2  0)", "Если op2  0, то единица, иначе ноль",  "","R/N", "R/N/C", "", "")
.__add("seq", "function", "op1 := (op2 = op3)", "Если op2 = op3, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "")
.__add("seqz", "function", "op1 := (op2 = 0)", "Если op2 = 0, то единица, иначе ноль",  "","R/N", "R/N/C", "", "")
.__add("sne", "function", "op1 := (op2  op3)", "Если op2  op3, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "")
.__add("snez", "function", "op1 := (op2  0)", "Если op2  0, то единица, иначе ноль",  "","R/N", "R/N/C", "", "")
.__add("sap", "function", "op1 := (op2  op3)", "Если op2  op3 с точностью op4, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "R/N/C")
.__add("sapz", "function", "op1 := (op2  0)", "Если op2  0 с точностью op3, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "")
.__add("sna", "function", "op1 := (op2  op3)", "Если op2  op3 с точностью op4, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "R/N/C")
.__add("snaz", "function", "op1 := (op2  0)", "Если op2  0 с точностью op3, то единица, иначе ноль",  "","R/N", "R/N/C", "R/N/C", "")
.__add("sdse", "function", "op1 := isset(op2) ? 1 : 0", "Если канал op2 настроен на то единица, иначе ноль",  "","R/N", "D/N", "", "")
.__add("sdns", "function", "op1 := ¬isset(op2) ? 1 : 0", "Если канал op2 не настроен на то единица, иначе ноль",  "","R/N", "D/N", "", "")
.__add("and", "function", "op1 := op2  op3", "Логическое И, единица, если и op2 и op3 истинны, ноль в противном случае",  "","R/N", "R/N/C", "R/N/C", "")
.__add("or", "function", "op1 := op2  op3", "Логическое ИЛИ, ноль, если и op2 и op3 ложны, единица в противном случае",  "","R/N", "R/N/C", "R/N/C", "")
.__add("xor", "function", "op1 := op2  op3", "Исключающее ИЛИ, единица, если одно и только одно из op2 и op3 истинно, ноль в противном случае",  "","R/N", "R/N/C", "R/N/C", "")
.__add("nor", "function", "op1 := ¬(op2  op3)", "Инверсное ИЛИ, единица, если и op2 и op3 ложны, ноль в противном случае",  "","R/N", "R/N/C", "R/N/C", "")
.__add("j", "function", "", "Переход на указанную строку",  "","R/N/A/T", "", "", "")
.__add("blt", "function", "", "Переход на op3, если op1 < op2",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bltz", "function", "", "Переход на op2, если op1 < 0",  "","R/N/C", "R/N/A/T", "", "")
.__add("ble", "function", "", "Переход на op3, если op1  op2",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("blez", "function", "", "Переход на op2, если op1  0",  "","R/N/C", "R/N/A/T", "", "")
.__add("bge", "function", "", "Переход на op3, если op1  op2",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bgez", "function", "", "Переход на op2, если op1  0",  "","R/N/C", "R/N/A/T", "", "")
.__add("bgt", "function", "", "Переход на op3, если op1 > op2",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bgtz", "function", "", "Переход на op2, если op1 > 0",  "","R/N/C", "R/N/A/T", "", "")
.__add("beq", "function", "", "Переход на op3, если op1 = op2",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("beqz", "function", "", "Переход на op2, если op1 = 0",  "","R/N/C", "R/N/A/T", "", "")
.__add("bne", "function", "", "Переход на op3, если op1  op2",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bnez", "function", "", "Переход на op2, если op1  0",  "","R/N/C", "R/N/A/T", "", "")
.__add("bap", "function", "", "Переход на op4, если op1  op2 с точностью op3",  "","R/N/C", "R/N/C", "R/N/C", "R/N/A/T")
.__add("bapz", "function", "", "Переход на op3, если op1  0 с точностью op2",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bna", "function", "", "Переход на op4, если op1  op2 с точностью op3",  "","R/N/C", "R/N/C", "R/N/C", "R/N/A/T")
.__add("bnaz", "function", "", "Переход на op3, если op1  0 с точностью op2",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bdse", "function", "", "Переход на op2, если канал op1 настроен",  "","D/N", "R/N/A/T", "", "")
.__add("bdns", "function", "", "Переход на op2, если канал op1 не настроен",  "","D/N", "R/N/A/T", "", "")
.__add("jal", "function", "", "Переход на op1 с записью адреса следующей строки в ra",  "","R/N/A/T", "", "", "")
.__add("bltzal", "function", "", "Переход на op2, если op1 < 0 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/A/T", "", "")
.__add("bltal", "function", "", "Переход на op3, если op1 < op2 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bgeal", "function", "", "Переход на op3, если op1  op2 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bgezal", "function", "", "Переход на op2, если op1  0 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/A/T", "", "")
.__add("bleal", "function", "", "Переход на op3, если op1  op2 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("blezal", "function", "", "Переход на op2, если op1  0 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/A/T", "", "")
.__add("bgtal", "function", "", "Переход на op3, если op1 > op2 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bgtzal", "function", "", "Переход на op2, если op1 > 0 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/A/T", "", "")
.__add("beqal", "function", "", "Переход на op3, если op1 = op2 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("beqzal", "function", "", "Переход на op2, если op1 = 0 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/A/T", "", "")
.__add("bneal", "function", "", "Переход на op3, если op1  op2 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bnezal", "function", "", "Переход на op2, если op1  0 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/A/T", "", "")
.__add("bapal", "function", "", "Переход на op4, если op1  op2 с точностью op3 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/C", "R/N/A/T")
.__add("bapzal", "function", "", "Переход на op3, если op1  0 с точностью op2 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bnaal", "function", "", "Переход на op4, если op1  op2 с точностью op3 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/C", "R/N/A/T")
.__add("bnazal", "function", "", "Переход на op3, если op1  0 с точностью op2 с записью адреса следующей строки в ra",  "","R/N/C", "R/N/C", "R/N/A/T", "")
.__add("bdseal", "function", "", "Переход на op2, если канал op1 настроен с записью адреса следующей строки в ra",  "","D/N", "R/N/A/T", "", "")
.__add("bdnsal", "function", "", "Переход на op2, если канал op1 не настроен с записью адреса следующей строки в ra",  "","D/N", "R/N/A/T", "", "")
.__add("jr", "function", "", "Относительный переход на +op1",  "","R/N/O", "", "", "")
.__add("brlt", "function", "", "Относительный переход на +op3, если op1 < op2",  "","R/N/C", "R/N/C", "R/N/O", "")
.__add("brltz", "function", "", "Относительный переход на +op2, если op1 < 0",  "","R/N/C", "R/N/O", "", "")
.__add("brle", "function", "", "Относительный переход на +op3, если op1  op2",  "","R/N/C", "R/N/C", "R/N/O", "")
.__add("brlez", "function", "", "Относительный переход на +op2, если op1  0",  "","R/N/C", "R/N/O", "", "")
.__add("brge", "function", "", "Относительный переход на +op3, если op1  op2",  "","R/N/C", "R/N/C", "R/N/O", "")
.__add("brgez", "function", "", "Относительный переход на +op2, если op1  0",  "","R/N/C", "R/N/O", "", "")
.__add("brgt", "function", "", "Относительный переход на +op3, если op1 > op2",  "","R/N/C", "R/N/C", "R/N/O", "")
.__add("brgtz", "function", "", "Относительный переход на +op2, если op1 > 0",  "","R/N/C", "R/N/O", "", "")
.__add("breq", "function", "", "Относительный переход на +op3, если op1 = op2",  "","R/N/C", "R/N/C", "R/N/O", "")
.__add("breqz", "function", "", "Относительный переход на +op2, если op1 = 0",  "","R/N/C", "R/N/O", "", "")
.__add("brne", "function", "", "Относительный переход на +op3, если op1  op2",  "","R/N/C", "R/N/C", "", "")
.__add("brnez", "function", "", "Относительный переход на +op2, если op1  0",  "","R/N/C", "R/N/O", "", "")
.__add("brap", "function", "", "Относительный переход на +op4, если op1  op2 с точностью op3",  "","R/N/C", "R/N/C", "R/N/C", "R/N/O")
.__add("brapz", "function", "", "Относительный переход на +op3, если op1  0 с точностью op2",  "","R/N/C", "R/N/C", "R/N/O", "")
.__add("brna", "function", "", "Относительный переход на +op4, если op1  op2 с точностью op3",  "","R/N/C", "R/N/C", "R/N/C", "R/N/O")
.__add("brnaz", "function", "", "Относительный переход на +op3, если op1  0 с точностью op2",  "","R/N/C", "R/N/C", "R/N/O", "")
.__add("brdse", "function", "", "Относительный переход на +op2, если канал op1 настроен",  "","D/N", "R/N/O", "", "")
.__add("brdns", "function", "", "Относительный переход на +op2, если канал op1 не настроен",  "","D/N", "R/N/O", "", "")
.__add("yield", "function", "", "Приостановка программы до следующего тика",  "","", "", "", "")
.__add("sleep", "function", "", "Приостановка программы на op1 секунд",  "","R/N/C", "", "", "")
.__add("peek", "function", "op1 := stack[sp-1]", "Записать в op1 верхнее значение со стека не двигая стек",  "","R/N", "", "", "")
.__add("push", "function", "stack[sp++] := op1", "Положить op1 на стек",  "","R/N/C", "", "", "")
.__add("pop", "function", "op1 := stack[--sp]", "Снять значение со стека и записать в op1",  "","R/N", "", "", "")
.__add("hcf", "function", "", "Остановить работу и сжечь микропроцессор",  "","", "", "", "")
.__add("select", "function", "op1 := (op2 ? op3 : op4)", "Тернарный select. Если op2 истинно, то op1 := op3, иначе op1 := op4",  "","R/N", "R/N/C", "R/N/C", "R/N/C")

.__add("db", "constant", "s db Setting 1", "Специальны порт для доступа к сокету")
.__add("d0", "constant", "s d0 Setting 1", "порт для доступа к внешнему устройству №0")
.__add("d1", "constant", "s d1 Setting 1", "порт для доступа к внешнему устройству №1")
.__add("d2", "constant", "s d2 Setting 1", "порт для доступа к внешнему устройству №2")
.__add("d3", "constant", "s d3 Setting 1", "порт для доступа к внешнему устройству №3")
.__add("d4", "constant", "s d4 Setting 1", "порт для доступа к внешнему устройству №4")
.__add("d5", "constant", "s d5 Setting 1", "порт для доступа к внешнему устройству №5")


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
      var description = null
      if (data?.description.hasOwnProperty(lang)) {
        description = data.description[lang]
      } else {
        description = data.description['en']
      }
      var heading = `${type} **${name}** `
      if (op1) { heading += `op1:[${op1}] ` }
      if (op2) { heading += `op2:[${op2}] ` }
      if (op3) { heading += `op3:[${op3}] ` }
      if (op4) { heading += `op4:[${op4}] ` }

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
