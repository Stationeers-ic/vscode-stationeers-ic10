'use strict'
const gulp = require('gulp')
const fs = require('fs')
var request = require('sync-request')

function translate(str, source = 'ru', target = 'en') {
	console.time('translate')
	var url = encodeURI('http://traineratwot.aytour.ru/translate?string=' + str + '&source=' + source + '&target=' + target)
	var res = request('GET', url)
	console.timeEnd('translate')
	return res.getBody('utf8')
}

var IC10Data = {
	Languages: {},
	__add: function(lang = null, name = null, type = null, preview = null, text = null, op1 = null, op2 = null, op3 = null, op4 = null) {
		if(lang) {
			lang = lang.trim() ?? null
		}
		if(name) {
			name = name.trim() ?? null
		}
		if(type) {
			type = type.trim() ?? null
		}
		if(preview) {
			preview = preview.trim() ?? null
		}
		if(text) {
			text = text.trim() ?? null
		}
		if(op1) {
			op1 = op1.trim() ?? null
		}
		if(op2) {
			op2 = op2.trim() ?? null
		}
		if(op3) {
			op3 = op3.trim() ?? null
		}
		if(op4) {
			op4 = op4.trim() ?? null
		}

		if(!(IC10Data['Languages'][lang] instanceof Object)) {
			IC10Data['Languages'][lang] = {}
		}
		if(name in IC10Data['Languages'][lang]) {
			return this
		}
		if(!(IC10Data['Languages']['en'] instanceof Object)) {
			IC10Data['Languages']['en'] = {}
		}
		IC10Data['Languages'][lang][name] = {
			type: type,
			op1: op1 ? op1 : null,
			op2: op2 ? op2 : null,
			op3: op3 ? op3 : null,
			op4: op4 ? op4 : null,
			description: {
				'preview': preview,
				'text': text,
			}
		}
		IC10Data['Languages']['en'][name] = {
			type: type,
			op1: op1 ? op1 : null,
			op2: op2 ? op2 : null,
			op3: op3 ? op3 : null,
			op4: op4 ? op4 : null,
			description: {
				'preview': translate(preview),
				'text': translate(text),
			}
		}

		return this
	}
}

function getData(){
	IC10Data
		.__add('ru ', 'abs ', 'Function ', 'op1 := |op2| ', 'Абсолютная величина числа ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'acos ', 'Function ', 'op1 := acos(op2) ', 'Арккосинус* ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'add ', 'Function ', 'op1 := op2 + op3 ', 'Сумма ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'alias ', 'Function ', 'op2 => op1 ', 'Задат псевдоним для регистра или канала данных ', 'N ', 'R/D ', null)
		.__add('ru ', 'and ', 'Function ', 'op1 := op2 op3 ', 'Логическое И, единица, если и op2 и op3 истинны, ноль в противном случае ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'asin ', 'Function ', 'op1 := asin(op2) ', 'Арксинус* ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'atan ', 'Function ', 'op1 := atan(op2) ', 'Арктангенс* ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'atan2', 'Function ', 'op1 := atan2(op2,op3) ', 'Арктангенс с 2 аргументами', 'R/N ', 'R/N/C','R/N/C',null)
		.__add('ru ', 'bap ', 'Function ', 'Переход на op4, если op1 op2 с точностью op3 ', null, 'R/N/C ', 'R/N/C ', 'R/N/C ', 'R/N/A/T')
		.__add('ru ', 'bapal ', 'Function ', 'Переход на op4, если op1 op2 с точностью op3 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/C ', 'R/N/A/T')
		.__add('ru ', 'bapz ', 'Function ', 'Переход на op3, если op1 0 с точностью op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bapzal ', 'Function ', 'Переход на op3, если op1 0 с точностью op2 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bdns ', 'Function ', 'Переход на op2, если канал op1 не настроен ', null, 'D/N ', 'R/N/A/T ', null)
		.__add('ru ', 'bdnsal ', 'Function ', 'Переход на op2, если канал op1 не настроен с записью адреса следующей строки в ra ', null, 'D/N ', 'R/N/A/T ', null)
		.__add('ru ', 'bdse ', 'Function ', 'Переход на op2, если канал op1 настроен ', null, 'D/N ', 'R/N/A/T ', null)
		.__add('ru ', 'bdseal ', 'Function ', 'Переход на op2, если канал op1 настроен с записью адреса следующей строки в ra ', null, 'D/N ', 'R/N/A/T ', null)
		.__add('ru ', 'beq ', 'Function ', 'Переход на op3, если op1 = op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'beqal ', 'Function ', 'Переход на op3, если op1 = op2 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'beqz ', 'Function ', 'Переход на op2, если op1 = 0 ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'beqzal ', 'Function ', 'Переход на op2, если op1 = 0 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bge ', 'Function ', 'Переход на op3, если op1 >= op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bgeal ', 'Function ', 'Переход на op3, если op1 >= op2 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bgez ', 'Function ', 'Переход на op2, если op1 >= 0 ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bgezal ', 'Function ', 'Переход на op2, если op1 >= 0 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bgt ', 'Function ', 'Переход на op3, если op1 > op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bgtal ', 'Function ', 'Переход на op3, если op1 > op2 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bgtz ', 'Function ', 'Переход на op2, если op1 > 0 ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bgtzal ', 'Function ', 'Переход на op2, если op1 > 0 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'ble ', 'Function ', 'Переход на op3, если op1 <= op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bleal ', 'Function ', 'Переход на op3, если op1 <= op2 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'blez ', 'Function ', 'Переход на op2, если op1 <= 0 ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'blezal ', 'Function ', 'Переход на op2, если op1 <= 0 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'blt ', 'Function ', 'Переход на op3, если op1 < op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bltal ', 'Function ', 'Переход на op3, если op1 < op2 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bltz ', 'Function ', 'Переход на op2, если op1 < 0 ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bltzal ', 'Function ', 'Переход на op2, если op1 < 0 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bna ', 'Function ', 'Переход на op4, если op1 ~= op2 с точностью op3 ', null, 'R/N/C ', 'R/N/C ', 'R/N/C ', 'R/N/A/T')
		.__add('ru ', 'bnaal ', 'Function ', 'Переход на op4, если op1 ~= op2 с точностью op3 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/C ', 'R/N/A/T')
		.__add('ru ', 'bnaz ', 'Function ', 'Переход на op3, если op1 ~= 0 с точностью op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bnazal ', 'Function ', 'Переход на op3, если op1 ~= 0 с точностью op2 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bne ', 'Function ', 'Переход на op3, если op1 != op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bneal ', 'Function ', 'Переход на op3, если op1 != op2 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bnez ', 'Function ', 'Переход на op2, если op1 != 0 ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'bnezal ', 'Function ', 'Переход на op2, если op1 != 0 с записью адреса следующей строки в ra ', null, 'R/N/C ', 'R/N/A/T ', null)
		.__add('ru ', 'brap ', 'Function ', 'Относительный переход на +op4, если op1 op2 с точностью op3 ', null, 'R/N/C ', 'R/N/C ', 'R/N/C ', 'R/N/O')
		.__add('ru ', 'brapz ', 'Function ', 'Относительный переход на +op3, если op1 0 с точностью op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brdns ', 'Function ', 'Относительный переход на +op2, если канал op1 не настроен ', null, 'D/N ', 'R/N/O ', null)
		.__add('ru ', 'brdse ', 'Function ', 'Относительный переход на +op2, если канал op1 настроен ', null, 'D/N ', 'R/N/O ', null)
		.__add('ru ', 'breq ', 'Function ', 'Относительный переход на +op3, если op1 = op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'breqz ', 'Function ', 'Относительный переход на +op2, если op1 = 0 ', null, 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brge ', 'Function ', 'Относительный переход на +op3, если op1 >= op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brgez ', 'Function ', 'Относительный переход на +op2, если op1 >= 0 ', null, 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brgt ', 'Function ', 'Относительный переход на +op3, если op1 > op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brgtz ', 'Function ', 'Относительный переход на +op2, если op1 > 0 ', null, 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brle ', 'Function ', 'Относительный переход на +op3, если op1 <= op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brlez ', 'Function ', 'Относительный переход на +op2, если op1 <= 0 ', null, 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brlt ', 'Function ', 'Относительный переход на +op3, если op1 < op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brltz ', 'Function ', 'Относительный переход на +op2, если op1 < 0 ', null, 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brna ', 'Function ', 'Относительный переход на +op4, если op1 op2 с точностью op3 ', null, 'R/N/C ', 'R/N/C ', 'R/N/C ', 'R/N/O')
		.__add('ru ', 'brnaz ', 'Function ', 'Относительный переход на +op3, если op1 0 с точностью op2 ', null, 'R/N/C ', 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'brne ', 'Function ', 'Относительный переход на +op3, если op1 != op2 ', null, 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'brnez ', 'Function ', 'Относительный переход на +op2, если op1 != 0 ', null, 'R/N/C ', 'R/N/O ', null)
		.__add('ru ', 'ceil ', 'Function ', 'op1 := op2 ', 'Округление до ближайшего целого вверх ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'cos ', 'Function ', 'op1 := cos(op2) ', 'Косинус* ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'define ', 'Function ', 'op2 => op1 ', 'Задать имя для константы ', 'Cn ', 'C ', null)
		.__add('ru ', 'div ', 'Function ', 'op1 :=op2 / op3 ', 'Деление ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'exp ', 'Function ', 'op1 := eop2 ', 'Экспонента ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'floor ', 'Function ', 'op1 := op2 ', 'Округление до ближайшего целого вниз ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'hcf ', 'Function ', 'Остановить работу и сжечь микропроцессор ', null)
		.__add('ru ', 'j ', 'Function ', 'Переход на указанную строку ', null, 'R/N/A/T')
		.__add('ru ', 'jal ', 'Function ', 'Переход на op1 с записью адреса следующей строки в ra ', null, 'R/N/A/T')
		.__add('ru ', 'jr ', 'Function ', 'Относительный переход на +op1 ', null, 'R/N/O')
		.__add('ru ', 'l ', 'Function ', 'op1 := op2.op3 ', 'Чтение значения параметра op3 из порта op2 ', 'R/N ', 'D/N ', 'P ', null)
		.__add('ru ', 'log ', 'Function ', 'op1 := ln(op2) ', 'Натуральный логарифм ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'lr ', 'Function ', 'op1 := op2.mode(op3).op4 ', 'Чтение значения реагента op4 в режиме op3 из порта op2 ', 'R/N ', 'D/N ', 'R/N/RM ', 'RC')
		.__add('ru ', 'ls ', 'Function ', 'op1 := op2.slot(op3).op4 ', 'Чтение значения op4 из слота op3 порта op2 ', 'R/N ', 'D/N ', 'R/N/S ', 'P')
		.__add('ru ', 'max ', 'Function ', 'op1 := max(op2, op3) ', 'Максимальное из двух ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'min ', 'Function ', 'op1 := min(op2, op3) ', 'Минимальное из двух ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'mod ', 'Function ', 'op1 := op2 mod op3 ', 'Остаток от целочисленного деления op2 на op3 (результат не эквивалентен оператору %, и будет положителен при любых знаках op2 и op3) ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'move ', 'Function ', 'op1 := op2 ', 'Присвоение значения ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'mul ', 'Function ', 'op1 := op2 * op3 ', 'Произведение ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'nor ', 'Function ', 'op1 := ¬(op2 op3) ', 'Инверсное ИЛИ, единица, если и op2 и op3 ложны, ноль в противном случае ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'or ', 'Function ', 'op1 := op2 op3 ', 'Логическое ИЛИ, ноль, если и op2 и op3 ложны, единица в противном случае ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'peek ', 'Function ', 'op1 := stack[sp-1] ', 'Записать в op1 верхнее значение со стека не двигая стек ', 'R/N ', null)
		.__add('ru ', 'pop ', 'Function ', 'op1 := stack[--sp] ', 'Снять значение со стека и записать в op1 ', 'R/N ', null)
		.__add('ru ', 'push ', 'Function ', 'stack[sp++] := op1 ', 'Положить op1 на стек ', 'R/N/C ', null)
		.__add('ru ', 'rand ', 'Function ', 'op1 := rand(0,1) ', 'Случайная величина от 0 до 1 включительно ', 'R/N ', null)
		.__add('ru ', 'round ', 'Function ', 'op1 := [op2] ', 'Округление к ближайшему целому ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 's ', 'Function ', 'op1.op2 := op3 ', 'Запись значения в параметр op2 порта op1 ', 'D/N ', 'P ', 'R/N/C ', null)
		.__add('ru ', 'sap ', 'Function ', 'op1 := (op2 op3) ', 'Если op2 op3 с точностью op4, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', 'R/N/C')
		.__add('ru ', 'sapz ', 'Function ', 'op1 := (op2 0) ', 'Если op2 0 с точностью op3, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'sdns ', 'Function ', 'op1 := ¬isset(op2) ? 1 : 0 ', 'Если канал op2 не настроен на то единица, иначе ноль ', 'R/N ', 'D/N ', null)
		.__add('ru ', 'sdse ', 'Function ', 'op1 := isset(op2) ? 1 : 0 ', 'Если канал op2 настроен на то единица, иначе ноль ', 'R/N ', 'D/N ', null)
		.__add('ru ', 'select ', 'Function ', 'op1 := (op2 ? op3 : op4) ', 'Тернарный select. Если op2 истинно, то op1 := op3, иначе op1 := op4 ', 'R/N ', 'R/N/C ', 'R/N/C ', 'R/N/C')
		.__add('ru ', 'seq ', 'Function ', 'op1 := (op2 = op3) ', 'Если op2 = op3, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'seqz ', 'Function ', 'op1 := (op2 = 0) ', 'Если op2 = 0, то единица, иначе ноль ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'sge ', 'Function ', 'op1 := (op2 op3) ', 'Если op2 op3, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'sgez ', 'Function ', 'op1 := (op2 0) ', 'Если op2 0, то единица, иначе ноль ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'sgt ', 'Function ', 'op1 := (op2 > op3) ', 'Если op2 > op3, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'sgtz ', 'Function ', 'op1 := (op2 > 0) ', 'Если op2 > 0, то единица, иначе ноль ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'sin ', 'Function ', 'op1 := sin(op2) ', 'Синус* ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'sle ', 'Function ', 'op1 := (op2 op3) ', 'Если op2 op3, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'sleep ', 'Function ', 'Приостановка программы на op1 секунд ', 'R/N/C ', 'R/N/C')
		.__add('ru ', 'slez ', 'Function ', 'op1 := (op2 0) ', 'Если op2 0, то единица, иначе ноль ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'slt ', 'Function ', 'op1 := (op2 < op3) ', 'Если op2 < op3, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'sltz ', 'Function ', 'op1 := (op2 < 0) ', 'Если op2 < 0, то единица, иначе ноль ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'sna ', 'Function ', 'op1 := (op2 op3) ', 'Если op2 op3 с точностью op4, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', 'R/N/C')
		.__add('ru ', 'snaz ', 'Function ', 'op1 := (op2 0) ', 'Если op2 0 с точностью op3, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'sne ', 'Function ', 'op1 := (op2 op3) ', 'Если op2 op3, то единица, иначе ноль ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'snez ', 'Function ', 'op1 := (op2 0) ', 'Если op2 0, то единица, иначе ноль ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'sqrt ', 'Function ', 'op1 := o̅p̅2̅ ', 'Квадратный корень ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'sub ', 'Function ', 'op1 := op2 - op3 ', 'Разность ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'tan ', 'Function ', 'op1 := tan(op2) ', 'Тангенс* ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'trunc ', 'Function ', 'op1 := int(op2) ', 'Целая часть числа ', 'R/N ', 'R/N/C ', null)
		.__add('ru ', 'xor ', 'Function ', 'op1 := op2 op3 ', 'Исключающее ИЛИ, единица, если одно и только одно из op2 и op3 истинно, ноль в противном случае ', 'R/N ', 'R/N/C ', 'R/N/C ', null)
		.__add('ru ', 'yield ', 'Function ', 'Приостановка программы до следующего тика ', null)
		.__add('ru ', 'lb ', 'Function ', 'op1 := op2.op3.mode(op4) ', 'Пакетное чтение в op1 из всех устройств с хешем op2 параметра op3 в режиме op4 ', 'R/N ', 'H ', 'P ', 'BM')
		.__add('ru ', 'sb ', 'Function ', 'op1.op2 := op3 ', 'Пакетная запись во все устройства с хешем op1 в параметр op2 значения op3 ', 'H ', 'P ', 'R/N/C ', null)
		.__add('ru ', 'ls ', 'Function ', 'op1 := op2.slot(op3).op4 ', 'Чтение значения op4 из слота op3 порта op2 ', 'R/N ', 'D/N ', 'R/N/S ', 'P')
		.__add('ru ', 'stack ', 'Function ', 'stack 1 2 3 ... ', 'Заполняет стак значиниями аргументов ', 'R/N/C ', null, null, null)

		.__add('ru ', 'Activate ', 'Device parameter ', 'Trigger ', '-1 - остановить , 0 - не работает 1 - работает')
		.__add('ru ', 'Charge ', 'Device parameter ', 'Float ', 'Заряд батареи или аккумулятора, Дж. Уровень генерации электричества солнечной панелью, Вт.')
		.__add('ru ', 'Class ', 'Device parameter ', null, 'класс объекта в слоте')
		.__add('ru ', 'ClearMemory ', 'Device parameter ', 'Trigger ', '>=1 - сбрасывает счётчики')
		.__add('ru ', 'Color ', 'Device parameter ', `0-синий , 1-серый , 2-зелёный , 3-оранжевый , 4-красный , 5-жёлтый, 6-белый, 7-чёрный, 8-коричневый, 9-хаки, 10-розовый, 11-фиолетовый`, 'Цвет LED-лампы, стационарного маяка и светодиодного дисплея')
		.__add('ru ', 'Combustion ', 'Device parameter ', 'Bool ', '1 - обнаружено воспламенение, 0 - во всех остальных случаях')
		.__add('ru ', 'CompletionRatio ', 'Device parameter ', 'Float[0-1] ', 'этап производства в %')
		.__add('ru ', 'Damage ', 'Device parameter ', 'Float[0-1] ', 'уровень повреждения объекта')
		.__add('ru ', 'ElevatorLevel ', 'Device parameter ', 'Int ', 'На чтение - уровень, на котором находится кабинка лифта, или -1, если кабинки нет. На запись - отправляет лифт на указанный этаж.')
		.__add('ru ', 'ElevatorSpeed ', 'Device parameter ', 'Float ', 'Скорость движения кабинки лифта, м/тик. Отрицательное значение соответствуют движению вниз, 0 - неподвижной кабинке, положительное - движению вверх.')
		.__add('ru ', 'Error ', 'Device parameter ', 'Bool ', '0 - нормальная работа, 1 - ошибка')
		.__add('ru ', 'ExportCount ', 'Device parameter ', 'Int ', 'счётчик объектов, прошедших через слот экспорта')
		.__add('ru ', 'Filtration ', 'Device parameter ', 'Bool ', 'Переключает фильтрацию отработанной смеси в прочном скафандре.')
		.__add('ru ', 'ForceWrite ', 'Device parameter ', 'Trigger ', 'Принудительно заставляет чипы записи и множественной записи передать текущее значение в оборудование.')
		.__add('ru ', 'Harvest ', 'Device parameter ', 'Trigger ', 'Активирует сбор урожая в автоматической гидропонной станции.')
		.__add('ru ', 'Horizontal ', 'Device parameter ', 'Float[0 - 360] ', 'угол по отношению к Солнцу в градусах в горизонтальной проекции Солнца на плоскость датчика')
		.__add('ru ', 'Idle ', 'Device parameter ', 'Bool ', 'Загрузка дуговой печи. 0 - руда не загружена, 1 - загружена.')
		.__add('ru ', 'ImportCount ', 'Device parameter ', 'Int ', 'счётчик объектов, прошедших через слот импорта')
		.__add('ru ', 'Lock ', 'Device parameter ', 'Bool ', '0 - ручное управление разблокировано, 1 - заблокировано')
		.__add('ru ', 'Maximum ', 'Device parameter ', 'Float ', 'Максимальное значение какого-либо параметра оборудования, например, заряда батареи или давления на входе в камеру сгорания реактивного двигателя. Очень часто присутствует, но не используется.')
		.__add('ru ', 'MaxQuantity ', 'Device parameter ', 'Float ', 'максимальное количество предметов в слоте')
		.__add('ru ', 'Mode ', 'Device parameter ', 'Int ', ' режим работы')
		.__add('ru ', 'On ', 'Device parameter ', 'Bool ', '0 - выключен 1 - включен')
		.__add('ru ', 'Open ', 'Device parameter ', 'Bool ', '0 - выброс закрыт, 1 - открыт')
		.__add('ru ', 'Output ', 'Device parameter ', 'Int/Trigger ', `Для сортировщика - r/w , Int - следующий выход, на который будет выдан объект.<br>Для стакера - w, Trigger - выгружает накопленную упаковку объектов в слот экспорта.	`)
		.__add('ru ', 'Plant ', 'Device parameter ', 'Trigger ', 'Запускает процесс посадки растения из слота импорта в автоматической гидропонной станции.')
		.__add('ru ', 'PositionX ', 'Device parameter ', 'Float ', 'координата X текущего положения')
		.__add('ru ', 'PositionY ', 'Device parameter ', 'Float ', 'координата Y текущего положения')
		.__add('ru ', 'PositionZ ', 'Device parameter ', 'Float ', 'координата Z текущего положения')
		.__add('ru ', 'Power ', 'Device parameter ', 'Bool ', '0 - питание отсутствует или выключен, 1 - питание подано')
		.__add('ru ', 'PowerActual ', 'Device parameter ', 'Float ', 'Суммарное потребление электроэнергии всеми устройствами в сети, Вт.')
		.__add('ru ', 'PowerGeneration ', 'Device parameter ', 'Float ', 'Текущее производство электроэнергии генератором, Вт.')
		.__add('ru ', 'PowerPotential ', 'Device parameter ', 'Float ', 'Предельная доступная мощность сети, Вт.')
		.__add('ru ', 'PowerRequired ', 'Device parameter ', 'Float ', 'Суммарная потребность в электроэнергии всех устройств в сети, Вт.')
		.__add('ru ', 'PressureExternal ', 'Device parameter ', 'Float ', 'атмосферное давление во внешней среде, кПа')
		.__add('ru ', 'PressureInternal ', 'Device parameter ', 'Float ', 'Давление в трубопроводе, при котором останавливается работа активной вентиляции, кПа. Устанавливается, но не используется.')
		.__add('ru ', 'Ratio ', 'Device parameter ', 'Float ', 'Для батарей - соотношение Charge/Maximum.<br>Для остальных устройств - соотношение Setting/Maximum.')
		.__add('ru ', 'RatioCarbonDioxide ', 'Device parameter ', 'Float ', 'доля углекислого газа')
		.__add('ru ', 'RatioNitrogen ', 'Device parameter ', 'Float ', 'доля азота')
		.__add('ru ', 'RatioNitrousOxide ', 'Device parameter ', 'Float ', 'доля закиси азота')
		.__add('ru ', 'RatioOxygen ', 'Device parameter ', 'Float ', 'доля кислорода')
		.__add('ru ', 'RatioPollutant ', 'Device parameter ', 'Float ', 'доля токсинов')
		.__add('ru ', 'RatioVolatiles ', 'Device parameter ', 'Float ', 'доля летучих газов')
		.__add('ru ', 'RatioWater ', 'Device parameter ', 'Float ', 'доля водяных паров')
		.__add('ru ', 'Reagents ', 'Device parameter ', 'Float ', 'общая масса ингредиентов в граммах')
		.__add('ru ', 'RecipeHash ', 'Device parameter ', 'Int ', 'хэш выбранного рецепта')
		.__add('ru ', 'RequiredPower ', 'Device parameter ', 'Float ', 'Энергия, требуемая для рабботы устройства, Вт.')
		.__add('ru ', 'Setting ', 'Device parameter ', 'Any ', 'Текущее значение какого-то параметра оборудования. Тип и возможные значения зависят от оборудования.')
		.__add('ru ', 'SolarAngle ', 'Device parameter ', 'Float ', 'угол по отношению к Солнцу в градусах')
		.__add('ru ', 'TargetX ', 'Device parameter ', 'Int ', 'координата X цели')
		.__add('ru ', 'TargetY ', 'Device parameter ', 'Int ', 'координата Y цели')
		.__add('ru ', 'TargetZ ', 'Device parameter ', 'Int ', 'координата Z цели')
		.__add('ru ', 'TemperatureExternal ', 'Device parameter ', 'Float ', 'температура внешней атмосферы, К')
		.__add('ru ', 'TemperatureSetting ', 'Device parameter ', 'Float ', 'Заданная температура внутри прочного скафандра, К.')
		.__add('ru ', 'TotalMoles ', 'Device parameter ', 'Float ', 'Общее количество газа внутри трубопровода, моль.')
		.__add('ru ', 'VelocityMagnitude ', 'Device parameter ', 'Float ', 'модуль скорости движения бота')
		.__add('ru ', 'VelocityRelativeX ', 'Device parameter ', 'Float ', 'скорость движения по координате X')
		.__add('ru ', 'VelocityRelativeY ', 'Device parameter ', 'Float ', 'скорость движения по координате Y')
		.__add('ru ', 'VelocityRelativeZ ', 'Device parameter ', 'Float ', 'скорость движения по координате Z')
		.__add('ru ', 'Vertical ', 'Device parameter ', 'Float ', 'угол по отношению к Солнцу в градусах')
		.__add('ru ', 'Volume ', 'Device parameter ', 'Float ', 'Громкость')

		.__add('ru ', 'Charge ', 'Slot parameter ', 'Float ', 'Заряд аккумулятора в слоте, Дж.')
		.__add('ru ', 'ChargeRatio ', 'Slot parameter ', 'Float[0-1] ', 'Уровень заряда аккумулятора в слоте.')
		.__add('ru ', 'Class ', 'Slot parameter ', 'Int ', `0 - всё , что не относится к остальным классам;<br> 1 - шлемы;<br> 2 - скафандры и броня;<br> 3 - джетпаки и рюкзаки;<br> 4 - газовые фильтры;<br> 5 - газовые баллоны;<br> 6 - материнские платы;<br> 7 - печатные платы;<br> 8 - диск данных;<br> 9 - органы (мозг, лёгкие);<br> 10 - руды;<br> 11 - растения;<br> 12 - униформа;<br> 13 - существа (в том числе и персонажи);<br> 14 - аккумуляторы;<br> 14 - яйца;<br> 15 - пояса;<br> 16 - инструменты;<br> 17 - настольное оборудование (микроволновка, смеситель красок и т.п.);<br> 18 - слитки;<br> 19 - торпеды;<br> 20 - картриджи;<br> 21 - карты доступа, <br> 22 - магазины к оружию;<br> 23 - логические чипы;<br> 24 - бутылки (молоко, соевое масло);<br> 25 - микропроцессоры;<br> 26 - очки.`)
		.__add('ru ', 'Damage ', 'Slot parameter ', 'Float[0-1] ', 'Уровень повреждения объекта в слоте. 0 - объект целый, 1 - полностью разрушен.')
		.__add('ru ', 'Efficiency ', 'Slot parameter ', 'Float[0-1] ', 'Эффективность роста растения в автоматической гидропонной станции. -1, если растения нет.')
		.__add('ru ', 'Growth ', 'Slot parameter ', 'Float[0-1] ', 'Стадия роста растения в автоматической гидропонной станции. -1, если растения нет.')
		.__add('ru ', 'Health ', 'Slot parameter ', 'Float[0-1] ', 'Здоровье растения в автоматической гидропонной станции. 0 - умершаа растение, 1 - полностью здоровое, -1 - растения нет.')
		.__add('ru ', 'Mature ', 'Slot parameter ', 'Float[0-1] ', 'Готовность растения в автоматической гидропонной станции к сбору урожая. -1 если растения нет.')
		.__add('ru ', 'OccupantHash ', 'Slot parameter ', 'Hash ', 'хэш объекта в слоте')
		.__add('ru ', 'Occupied ', 'Slot parameter ', 'Bool ', '0 - слот свободен, 1 - занят')
		.__add('ru ', 'PressureAir ', 'Slot parameter ', 'Float ', 'Давление в баллоне с дыхательной смесью скафандра, установленного в стойку, кПа.')
		.__add('ru ', 'PressureWaste ', 'Slot parameter ', 'Float ', 'Давление в баллоне с отработанной смесью скафандра, установленного в стойку, кПа.')

		.__add('ru ', 'PrefabHash ', 'Parameter ', 'Hash ', 'хэш Prefab объекта')
		.__add('ru ', 'Pressure ', 'Parameter ', 'Float ', 'давление, кПа')
		.__add('ru ', 'Quantity ', 'Parameter ', 'Float/Int ', 'масса / количество предметов')
		.__add('ru ', 'Temperature ', 'Parameter ', 'Float ', 'температура, К')
		.__add('ru ', 'Bpm ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'CollectableGoods ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'Combustion ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'CurrentResearchPodType ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'Fuel ', 'Parameter ', 'Float ', 'Топливо')
		.__add('ru ', 'ManualResearchRequiredPod ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'MineablesInQueue ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'MineablesInVicinity ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'NextWeatherEventTime ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'ReturnFuelCost ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'SettingInput ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'SettingOutput ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'SignalID ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'SignalStrength ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'TemperatureSetting ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'Time ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'AirRelease ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'HorizontalRatio ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'PressureSetting ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'RequestHash ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'VerticalRatio ', 'Parameter ', 'Float ', null)
		.__add('ru ', 'Seeding ', 'Parameter ', 'int ', '-1 - нельзя собрать семена, 1 - можно')

		.__add('ru ', 'Average ', 'Const ', 'string ', null)
		.__add('ru ', 'Sum ', 'Const ', 'string ', null)
		.__add('ru ', 'Minimum ', 'Const ', 'string ', null)
		.__add('ru ', 'Maximum ', 'Const ', 'string ', null)

}

gulp.task('generate-langs', async function() {
	// console.log('generating')
	// console.log(IC10Data.Languages['ru'][0])
	getData()
	var keyword = []
	var functions = []
	for(const languagesKey in IC10Data.Languages) {
		fs.writeFileSync(`..\\languages\\${languagesKey}.json`, JSON.stringify(IC10Data.Languages[languagesKey]))
	}
	var snippets = JSON.parse(fs.readFileSync(`..\\snippets\\ic10.json`))
	for(const languageKey in IC10Data.Languages['en']) {
		var data = IC10Data.Languages['en'][languageKey]
		if(data.type === 'Function') {
			functions.push(languageKey)
		} else {
			keyword.push(languageKey)
		}
		snippets[languageKey] = {
			'prefix': languageKey,
			'body': [
				languageKey
			],
			'description': data.description.text,
		}

	}

	fs.writeFileSync(`..\\snippets\\ic10.json`, JSON.stringify(snippets))
	var tmLanguage10 = JSON.parse(fs.readFileSync(`..\\syntaxes\\ic10.tmLanguage.json`))
	tmLanguage10.repository.keywords.patterns[0].match = `\\b(${keyword.join('|')})\\b`
	tmLanguage10.repository.entity.patterns[0].match = `\\b(${functions.join('|')})\\b`
	fs.writeFileSync(`..\\syntaxes\\ic10.tmLanguage.json`, JSON.stringify(tmLanguage10))
	var tmLanguagex = JSON.parse(fs.readFileSync(`..\\syntaxes\\icX.tmLanguage.json`))
	tmLanguagex.repository.keywords.patterns[0].match = `\\b(${keyword.join('|')})\\b`
	tmLanguagex.repository.entity.patterns[0].match = `\\b(${functions.join('|')})\\b`
	fs.writeFileSync(`..\\syntaxes\\icX.tmLanguage.json`, JSON.stringify(tmLanguagex))

	fs.writeFileSync(`..\\media\\ic10.keyword.json`, JSON.stringify(keyword))
	fs.writeFileSync(`..\\media\\ic10.functions.json`, JSON.stringify(functions))
	return gulp;
})

gulp.task('generate-aaa', function() {
	var result = null
	var a = [
		'eq',
		'eqz',
		'ge',
		'gez',
		'gt',
		'gtz',
		'le',
		'lez',
		'lt',
		'ltz',
		'ne',
		'nez',
		'ap',
		'apz',
		'na',
		'naz',
		'dse',
		'dns',
	]
	// s
	for(const aKey in a) {
		var b = a[aKey]
		if(b.endsWith('z')) {

			result += `
		s${b}(op1,op2,op3,op4){
			this.memory.cell(op1, this.__${b.replace('z', null)}(this.memory.cell(op2),0))
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
	for(const aKey in a) {
		var b = a[aKey]
		if(b.endsWith('z')) {

			result += `
		b${b}(op1,op2,op3,op4){
			if( this.__${b.replace('z', null)}(this.memory.cell(op1),0)){
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
	for(const aKey in a) {
		var b = a[aKey]
		if(b.endsWith('z')) {
			result += `
		br${b}(op1,op2,op3,op4){
			if( this.__${b.replace('z', null)}(this.memory.cell(op1),0)){
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
	for(const aKey in a) {
		var b = a[aKey]
		if(b.endsWith('z')) {
			result += `
		b${b}al(op1,op2,op3,op4){
			if( this.__${b.replace('z', null)}(this.memory.cell(op1),0)){
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


