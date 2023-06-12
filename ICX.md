# Stationeers icX

NEW WIKI [http://traineratwot.aytour.ru/wiki/icx](http://traineratwot.aytour.ru/wiki/icx)

[![issues](https://badgen.net/github/issues/Traineratwot/vscode-stationeers-ic10/)](https://github.com/Traineratwot/vscode-stationeers-ic10/issues?q=is%3Aissue)
[![open-issues](https://badgen.net/github/open-issues/Traineratwot/vscode-stationeers-ic10/)](https://github.com/Traineratwot/vscode-stationeers-ic10/issues)
![watchers](https://badgen.net/github/watchers/Traineratwot/vscode-stationeers-ic10/)
![stars](https://badgen.net/github/stars/Traineratwot/vscode-stationeers-ic10/)
![release](https://badgen.net/github/release/Traineratwot/vscode-stationeers-ic10/)
![last-commit](https://badgen.net/github/last-commit/Traineratwot/vscode-stationeers-ic10/)
![open-prs](https://badgen.net/github/open-prs/Traineratwot/vscode-stationeers-ic10/)

[![npm-ic10](https://badgen.net/npm/v/ic10?label=npm-ic10)](https://www.npmjs.com/package/ic10)
[![npm](https://badgen.net/vs-marketplace/v/Traineratwot.stationeers-ic10)](https://marketplace.visualstudio.com/items?itemName=Traineratwot.stationeers-ic10)

![npm](https://badgen.net/vs-marketplace/d/Traineratwot.stationeers-ic10)
![npm](https://badgen.net/vs-marketplace/i/Traineratwot.stationeers-ic10)
![npm](https://badgen.net/vs-marketplace/rating/Traineratwot.stationeers-ic10)

[![](https://i.imgur.com/cl0Xbq1.png)  Sponsor this project](https://www.patreon.com/traineratwot)

[<img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/99b0e6ee-dd62-4a57-8c7a-ddc38d46ace2/daup1ii-13f44bac-68c7-4bc9-88c6-8a01a440a8cf.png/v1/fill/w_50,h_50,strp/discord_icon_by_fzone96_daup1ii-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NTAiLCJwYXRoIjoiXC9mXC85OWIwZTZlZS1kZDYyLTRhNTctOGM3YS1kZGMzOGQ0NmFjZTJcL2RhdXAxaWktMTNmNDRiYWMtNjhjNy00YmM5LTg4YzYtOGEwMWE0NDBhOGNmLnBuZyIsIndpZHRoIjoiPD01MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.WO5yROv2CoM3PH1GyatQY6rsYPhQa1YfMsdrMn1Q21U" width="20"> discord](https://discord.gg/KSVjXufkA9)

Debugger launch

```json5
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "ic10",
      "request": "launch",
      "name": "Debug ic10",
      "program": "${file}",
      "stopOnEntry": true,
      "trace": false
    }
  ]
}

```

# icX

icX is a programming language translated to ic10 used to simplify the programming of ic10 microprocessors in
the Stationeers game.

# Quick start

1. Install [plugin for VSC](https://marketplace.visualstudio.com/items?itemName=Traineratwot.stationeers-ic10)
2. Create a file with **.icX** type
3. Write a program. For example:
    ```
    use loop
    var on = d1.Open
    d0.On = on
    ```
4. Save the file (Ctrl+S)
5. Copy a code from a new generated file with the same name and type **.ic10**
6. Paste code into microprocessor Ic10 in the game

# Instructions

### Comments

  ```
  # Text after a # will be ignored to the end of the line
  ```

### Vars

icX will automatically replace variable names with register names

```
---icX
   var a = 10
---ic10
   move r0 10
```

Using _alias_

```
---icX
   use aliases
   var a = 10
---ic10
   alias a r0
   move a 10
```

Using _define_

```
---icX
   use constants
   const PI = 3.14
---ic10
   define PI 3.14
```

### Math

#### Unary operations (++, --)

inc

```
---icX
   var a = 0
   a++
---ic10
   move r0 0
   add r0 r0 1
```

dec

```
---icX
   var a = 0
   a--
---ic10
   move r0 0
   sub r0 r0 1
```

#### Binary operations (+, -, *, /, %)

Constants will be calculated automatically

```
---icX
   var x =  5 + 5 * 2 
---ic10
   move r0 15
```

```
---icX
   const x = 2 + 2
   const y = x + 2
   var z = y + 2
---ic10
   move r0 8
```

Binary operations with variables

```
---icX
   var k = 2
   var y = 5
   var x =  y + y * k
---ic10
   move r0 2
   move r1 5
   mul r15 r1 r0
   add r2 r1 r15
   add r2 r2 5
```

### IF - ELSE

Binary logical operations used (<, >, ==, !=, <=, >=, &, |, ~=)

```
---icX
   var a = 0
   var b = 0
   if a >= 0
     b = 1
   else
     b = 0
   end
---ic10
   move r0 0
   move r1 0
   sgez r15 r0
   beqz r15 if0else
   beq r15 1 if0
   if0:
      move r1 1
      j if0exit
   if0else:
      move r1 0
   if0exit:
```

### While

```
---icX
 var a = 0
 while a >= 10
    a++
 end
---ic10
 move r0 0
 while0:
    sge r15 r0 10
    beqz r15 while0exit
    add r0 r0 1
    j while0
 while0exit:
```

### Devices

```
---icX
 d0.Setting = 1                  # Set device param
 var a = d0.Setting              # Load device param into a register 
 var b = d0.slot(a).PrefabHash   # Using a slot of the device
 a = d(5438547545).Setting(Sum)  # Batch load, where 5438547545 is hash of the device
 d(5438547545).Setting = b       # Batch configuration 
---ic10
 s d0 Setting 1
 l r0 d0 Setting
 ls r1 d0 r0 PrefabHash
 lb r0 5438547545 Setting Sum
 sb 5438547545 Setting r1
```

### Function

To write a function, use the _function_ keyword

```
{function name}()

function {function name}
   {code}
end
```

```
---icX
 use loop
 var a = 0 
 example()
 var on = d1.Open
 d0.On = on
 
 function example
     move a 1
 end
---ic10
 move r0 0
 jal example
 l r1 d1 Open
 s d0 On r1
 j 0
 example:
 move r0 1
 j ra
```

### Stack

To easily write in stack, use the _stack_ keyword

```
---icX
   stack 342423 432423 54534 6567
---ic10
   push 342423
   push 432423
   push 54534
   push 6567
```

For each stack

```
---icX
   var YourVariabele = 0
   foreach YourVariabele
    if a == 6567
       var b = 5
    end
   end
---ic10
   move sp 0 # reset counter
   while0:
      peek r0 # get value to YourVariabele
      #------- block code ---------
      seq r15 r0 6567
      beqz r15 if0exit
      move r1 5
      if0exit:
      #------- block code ---------
      breqz r0 2 # end of cycle
      add sp sp 1 # increment counter
   j while0
```

### Use

In addition to _use aliases_ and _use constant_, the following constructs are supported:

To loop the application, use _use loop_

```
---icX
 move r0 0
 jal example
 l r1 d1 Open
 s d0 On r1
 j 0
 example:
 move r0 1
 j ra
---ic10
 move r0 0
 jal example
 l r1 d1 Open
 s d0 On r1
 j 0
 example:
 move r0 1
 j ra
```

Use _use comments_ to transfer your comments to ic10 code

```
---icX
 use comments
 # Example
 var a = 0
 var on = d1.Open
 # Example
 d0.On = on
 test()
 function test
  var c = 1
 end
---ic10
 # ---icX User code start---
 # Example
 move r0 0
 l r1 d1 Open
 # Example
 s d0 On r1
 jal test
 # ---icX User code end---
 jr 4
 test:
 move r2 1
 j ra
```

### Additional examples of icX code

```
alias SolarSensor d0
alias SolarPanel d1
alias LedVertical d2
alias LedHorizontal d3
var SOLAR_HASH = d1.PrefabHash

var verical = 180
var horizontal = 180

main:
    updateLED()
    setSolarPanels()
    yield
j main

function setSolarPanels
    d(SOLAR_HASH).Vertical = verical
    d(SOLAR_HASH).Horizontal = horizontal
end

function updateLED
    d2.Setting = verical
    d3.Setting = horizontal
end
```

### debug

![debug](https://i.imgur.com/ZdWJkvf.jpeg)
