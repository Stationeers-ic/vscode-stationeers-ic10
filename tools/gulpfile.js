'use strict'
const gulp = require('gulp')
const fs = require('fs')
var request = require('sync-request')

function translate(str, source = 'ru', target = 'en') {
	var url = encodeURI('http://traineratwot.aytour.ru/translate?string=' + str + '&source=' + source + '&target=' + target)
	var res = request('GET', url)
	return res.getBody('utf8')
}

var IC10Data = {
	Languages: {},
	__add: function(lang = null, name = null, type = null, preview = null, text = null, op1 = null, op2 = null, op3 = null, op4 = null) {
		if(!(IC10Data['Languages'][lang] instanceof Object)) {
			IC10Data['Languages'][lang] = {}
		}
		IC10Data['Languages'][lang][name] = {
			type: type,
			op1: op1,
			op2: op2,
			op3: op3,
			op4: op4,
			description: {
				'preview': preview,
				'text': text,
			}
		}
		try {
			if(!(IC10Data['Languages']['en'] instanceof Object)) {
				IC10Data['Languages']['en'] = {}
			}
			IC10Data['Languages']['en'][name] = {
				type: type,
				op1: op1,
				op2: op2,
				op3: op3,
				op4: op4,
				description: {
					'preview': preview,
					'text': translate(text),
				}
			}
		} catch(e) {

		}
		return this
	}
}
IC10Data.__add('ru', 'l', 'function', 'op1 := op2.op3', 'Чтение значения параметра op3 из порта op2', 'R/N', 'D/N', 'P', '')
	.__add('ru', 's', 'function', 'op1.op2 := op3', 'Запись значения в параметр op2 порта op1', 'D/N', 'P', 'R/N/C', '')
	.__add('ru', 'ls', 'function', 'op1 := op2.slot(op3).op4', 'Чтение значения op4 из слота op3 порта op2', 'R/N', 'D/N', 'R/N/S', 'P')
	.__add('ru', 'lr', 'function', 'op1 := op2.mode(op3).op4', 'Чтение значения реагента op4 в режиме op3 из порта op2', 'R/N', 'D/N', 'R/N/RM', 'RC')
	.__add('ru', 'alias', 'function', 'op2 => op1', 'Задат псевдоним для регистра или канала данных', 'N', 'R/D', '')
	.__add('ru', 'define', 'function', 'op2 => op1', 'Задат имя для константы', 'Cn', 'C', '')
	.__add('ru', 'move', 'function', 'op1 := op2', 'Присвоение значения', 'R/N', 'R/N/C', '')
	.__add('ru', 'add', 'function', 'op1 := op2 + op3', 'Сумма', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'sub', 'function', 'op1 := op2  op3', 'Разность', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'mul', 'function', 'op1 := op2  op3', 'Произведение', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'div', 'function', 'op1 :=op2 / op3', 'Деление', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'mod', 'function', 'op1 := op2 mod op3', 'Остаток от целочисленного деления op2 на op3 (результат не эквивалентен оператору %, и будет положителен при любых знаках op2 и op3)', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'sqrt', 'function', 'op1 := o̅p̅2̅', 'Квадратный корень', 'R/N', 'R/N/C', '')
	.__add('ru', 'round', 'function', 'op1 := [op2]', 'Округление к ближайшему целому', 'R/N', 'R/N/C', '')
	.__add('ru', 'trunc', 'function', 'op1 := int(op2)', 'Целая часть числа', 'R/N', 'R/N/C', '')
	.__add('ru', 'ceil', 'function', 'op1 := op2', 'Округление до ближайшего целого вверх', 'R/N', 'R/N/C', '')
	.__add('ru', 'floor', 'function', 'op1 := op2', 'Округление до ближайшего целого вниз', 'R/N', 'R/N/C', '')
	.__add('ru', 'max', 'function', 'op1 := max(op2, op3)', 'Максимальное из двух', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'min', 'function', 'op1 := min(op2, op3)', 'Минимальное из двух', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'abs', 'function', 'op1 := |op2|', 'Абсолютная величина числа', 'R/N', 'R/N/C', '')
	.__add('ru', 'log', 'function', 'op1 := ln(op2)', 'Натуральный логарифм', 'R/N', 'R/N/C', '')
	.__add('ru', 'exp', 'function', 'op1 := eop2', 'Экспонента', 'R/N', 'R/N/C', '')
	.__add('ru', 'rand', 'function', 'op1 := rand(0,1)', 'Случайная величина от 0 до 1 включительно', 'R/N', '')
	.__add('ru', 'sin', 'function', 'op1 := sin(op2)', 'Синус*', 'R/N', 'R/N/C', '')
	.__add('ru', 'cos', 'function', 'op1 := cos(op2)', 'Косинус*', 'R/N', 'R/N/C', '')
	.__add('ru', 'tan', 'function', 'op1 := tan(op2)', 'Тангенс*', 'R/N', 'R/N/C', '')
	.__add('ru', 'asin', 'function', 'op1 := asin(op2)', 'Арксинус*', 'R/N', 'R/N/C', '')
	.__add('ru', 'acos', 'function', 'op1 := acos(op2)', 'Арккосинус*', 'R/N', 'R/N/C', '')
	.__add('ru', 'atan', 'function', 'op1 := atan(op2)', 'Арктангенс*', 'R/N', 'R/N/C', '')
	.__add('ru', 'slt', 'function', 'op1 := (op2 < op3)', 'Если op2 < op3, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'sltz', 'function', 'op1 := (op2 < 0)', 'Если op2 < 0, то единица, иначе ноль', 'R/N', 'R/N/C', '')
	.__add('ru', 'sgt', 'function', 'op1 := (op2 > op3)', 'Если op2 > op3, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'sgtz', 'function', 'op1 := (op2 > 0)', 'Если op2 > 0, то единица, иначе ноль', 'R/N', 'R/N/C', '')
	.__add('ru', 'sle', 'function', 'op1 := (op2  op3)', 'Если op2  op3, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'slez', 'function', 'op1 := (op2  0)', 'Если op2  0, то единица, иначе ноль', 'R/N', 'R/N/C', '')
	.__add('ru', 'sge', 'function', 'op1 := (op2  op3)', 'Если op2  op3, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'sgez', 'function', 'op1 := (op2  0)', 'Если op2  0, то единица, иначе ноль', 'R/N', 'R/N/C', '')
	.__add('ru', 'seq', 'function', 'op1 := (op2 = op3)', 'Если op2 = op3, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'seqz', 'function', 'op1 := (op2 = 0)', 'Если op2 = 0, то единица, иначе ноль', 'R/N', 'R/N/C', '')
	.__add('ru', 'sne', 'function', 'op1 := (op2  op3)', 'Если op2  op3, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'snez', 'function', 'op1 := (op2  0)', 'Если op2  0, то единица, иначе ноль', 'R/N', 'R/N/C', '')
	.__add('ru', 'sap', 'function', 'op1 := (op2  op3)', 'Если op2  op3 с точностью op4, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', 'R/N/C')
	.__add('ru', 'sapz', 'function', 'op1 := (op2  0)', 'Если op2  0 с точностью op3, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'sna', 'function', 'op1 := (op2  op3)', 'Если op2  op3 с точностью op4, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', 'R/N/C')
	.__add('ru', 'snaz', 'function', 'op1 := (op2  0)', 'Если op2  0 с точностью op3, то единица, иначе ноль', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'sdse', 'function', 'op1 := isset(op2) ? 1 : 0', 'Если канал op2 настроен на то единица, иначе ноль', 'R/N', 'D/N', '')
	.__add('ru', 'sdns', 'function', 'op1 := ¬isset(op2) ? 1 : 0', 'Если канал op2 не настроен на то единица, иначе ноль', 'R/N', 'D/N', '')
	.__add('ru', 'and', 'function', 'op1 := op2  op3', 'Логическое И, единица, если и op2 и op3 истинны, ноль в противном случае', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'or', 'function', 'op1 := op2  op3', 'Логическое ИЛИ, ноль, если и op2 и op3 ложны, единица в противном случае', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'xor', 'function', 'op1 := op2  op3', 'Исключающее ИЛИ, единица, если одно и только одно из op2 и op3 истинно, ноль в противном случае', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'nor', 'function', 'op1 := ¬(op2  op3)', 'Инверсное ИЛИ, единица, если и op2 и op3 ложны, ноль в противном случае', 'R/N', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'j', 'function', 'Переход на указанную строку', 'R/N/A/T', '')
	.__add('ru', 'blt', 'function', 'Переход на op3, если op1 < op2', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bltz', 'function', 'Переход на op2, если op1 < 0', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'ble', 'function', 'Переход на op3, если op1  op2', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'blez', 'function', 'Переход на op2, если op1  0', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bge', 'function', 'Переход на op3, если op1  op2', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bgez', 'function', 'Переход на op2, если op1  0', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bgt', 'function', 'Переход на op3, если op1 > op2', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bgtz', 'function', 'Переход на op2, если op1 > 0', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'beq', 'function', 'Переход на op3, если op1 = op2', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'beqz', 'function', 'Переход на op2, если op1 = 0', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bne', 'function', 'Переход на op3, если op1  op2', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bnez', 'function', 'Переход на op2, если op1  0', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bap', 'function', 'Переход на op4, если op1  op2 с точностью op3', 'R/N/C', 'R/N/C', 'R/N/C', 'R/N/A/T')
	.__add('ru', 'bapz', 'function', 'Переход на op3, если op1  0 с точностью op2', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bna', 'function', 'Переход на op4, если op1  op2 с точностью op3', 'R/N/C', 'R/N/C', 'R/N/C', 'R/N/A/T')
	.__add('ru', 'bnaz', 'function', 'Переход на op3, если op1  0 с точностью op2', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bdse', 'function', 'Переход на op2, если канал op1 настроен', 'D/N', 'R/N/A/T', '')
	.__add('ru', 'bdns', 'function', 'Переход на op2, если канал op1 не настроен', 'D/N', 'R/N/A/T', '')
	.__add('ru', 'jal', 'function', 'Переход на op1 с записью адреса следующей строки в ra', 'R/N/A/T', '')
	.__add('ru', 'bltzal', 'function', 'Переход на op2, если op1 < 0 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bltal', 'function', 'Переход на op3, если op1 < op2 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bgeal', 'function', 'Переход на op3, если op1  op2 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bgezal', 'function', 'Переход на op2, если op1  0 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bleal', 'function', 'Переход на op3, если op1  op2 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'blezal', 'function', 'Переход на op2, если op1  0 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bgtal', 'function', 'Переход на op3, если op1 > op2 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bgtzal', 'function', 'Переход на op2, если op1 > 0 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'beqal', 'function', 'Переход на op3, если op1 = op2 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'beqzal', 'function', 'Переход на op2, если op1 = 0 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bneal', 'function', 'Переход на op3, если op1  op2 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bnezal', 'function', 'Переход на op2, если op1  0 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bapal', 'function', 'Переход на op4, если op1  op2 с точностью op3 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/C', 'R/N/A/T')
	.__add('ru', 'bapzal', 'function', 'Переход на op3, если op1  0 с точностью op2 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bnaal', 'function', 'Переход на op4, если op1  op2 с точностью op3 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/C', 'R/N/A/T')
	.__add('ru', 'bnazal', 'function', 'Переход на op3, если op1  0 с точностью op2 с записью адреса следующей строки в ra', 'R/N/C', 'R/N/C', 'R/N/A/T', '')
	.__add('ru', 'bdseal', 'function', 'Переход на op2, если канал op1 настроен с записью адреса следующей строки в ra', 'D/N', 'R/N/A/T', '')
	.__add('ru', 'bdnsal', 'function', 'Переход на op2, если канал op1 не настроен с записью адреса следующей строки в ra', 'D/N', 'R/N/A/T', '')
	.__add('ru', 'jr', 'function', 'Относительный переход на +op1', 'R/N/O', '')
	.__add('ru', 'brlt', 'function', 'Относительный переход на +op3, если op1 < op2', 'R/N/C', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brltz', 'function', 'Относительный переход на +op2, если op1 < 0', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brle', 'function', 'Относительный переход на +op3, если op1  op2', 'R/N/C', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brlez', 'function', 'Относительный переход на +op2, если op1  0', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brge', 'function', 'Относительный переход на +op3, если op1  op2', 'R/N/C', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brgez', 'function', 'Относительный переход на +op2, если op1  0', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brgt', 'function', 'Относительный переход на +op3, если op1 > op2', 'R/N/C', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brgtz', 'function', 'Относительный переход на +op2, если op1 > 0', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'breq', 'function', 'Относительный переход на +op3, если op1 = op2', 'R/N/C', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'breqz', 'function', 'Относительный переход на +op2, если op1 = 0', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brne', 'function', 'Относительный переход на +op3, если op1  op2', 'R/N/C', 'R/N/C', '')
	.__add('ru', 'brnez', 'function', 'Относительный переход на +op2, если op1  0', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brap', 'function', 'Относительный переход на +op4, если op1  op2 с точностью op3', 'R/N/C', 'R/N/C', 'R/N/C', 'R/N/O')
	.__add('ru', 'brapz', 'function', 'Относительный переход на +op3, если op1  0 с точностью op2', 'R/N/C', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brna', 'function', 'Относительный переход на +op4, если op1  op2 с точностью op3', 'R/N/C', 'R/N/C', 'R/N/C', 'R/N/O')
	.__add('ru', 'brnaz', 'function', 'Относительный переход на +op3, если op1  0 с точностью op2', 'R/N/C', 'R/N/C', 'R/N/O', '')
	.__add('ru', 'brdse', 'function', 'Относительный переход на +op2, если канал op1 настроен', 'D/N', 'R/N/O', '')
	.__add('ru', 'brdns', 'function', 'Относительный переход на +op2, если канал op1 не настроен', 'D/N', 'R/N/O', '')
	.__add('ru', 'yield', 'function', 'Приостановка программы до следующего тика', '')
	.__add('ru', 'sleep', 'function', 'Приостановка программы на op1 секунд', 'R/N/C', '')
	.__add('ru', 'peek', 'function', 'op1 := stack[sp-1]', 'Записать в op1 верхнее значение со стека не двигая стек', 'R/N', '')
	.__add('ru', 'push', 'function', 'stack[sp++] := op1', 'Положить op1 на стек', 'R/N/C', '')
	.__add('ru', 'pop', 'function', 'op1 := stack[--sp]', 'Снять значение со стека и записать в op1', 'R/N', '')
	.__add('ru', 'hcf', 'function', 'Остановить работу и сжечь микропроцессор', '')
	.__add('ru', 'select', 'function', 'op1 := (op2 ? op3 : op4)', 'Тернарный select. Если op2 истинно, то op1 := op3, иначе op1 := op4', 'R/N', 'R/N/C', 'R/N/C', 'R/N/C')
	.__add('ru', 'db', 'constant', 's db Setting 1', 'Специальны порт для доступа к сокету')
	.__add('ru', 'd0', 'constant', 's d0 Setting 1', 'порт для доступа к внешнему устройству №0')
	.__add('ru', 'd1', 'constant', 's d1 Setting 1', 'порт для доступа к внешнему устройству №1')
	.__add('ru', 'd2', 'constant', 's d2 Setting 1', 'порт для доступа к внешнему устройству №2')
	.__add('ru', 'd3', 'constant', 's d3 Setting 1', 'порт для доступа к внешнему устройству №3')
	.__add('ru', 'd4', 'constant', 's d4 Setting 1', 'порт для доступа к внешнему устройству №4')
	.__add('ru', 'd5', 'constant', 's d5 Setting 1', 'порт для доступа к внешнему устройству №5')

gulp.task('generate-langs', function() {
	console.log('generating')
	console.log(IC10Data.Languages['ru'][0])
	for(const languagesKey in IC10Data.Languages) {
		fs.writeFileSync(`..\\languages\\${languagesKey}.json`, JSON.stringify(IC10Data.Languages[languagesKey]))
	}
})
