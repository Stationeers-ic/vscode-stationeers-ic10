# Stationeers ic10

WIKI [https://icx.traineratwot.site/wiki/icx](https://icx.traineratwot.site/wiki/icx)

VS code Sample
project [https://github.com/Traineratwot/Ic10-and-Icx-Sample](https://github.com/Traineratwot/Ic10-and-Icx-Sample)

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
![](https://stat.aytour.ru/stat/b4b55c18a3677f92ff2fe4c73d2e55d3.png)

[![](https://i.imgur.com/cl0Xbq1.png)  Sponsor this project](https://www.patreon.com/traineratwot)

[<img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0b52aa9e99b832574a53_full_logo_blurple_RGB.png" width="120"/>](https://discord.gg/KSVjXufkA9)

Debugger launch

```json
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

- highlights syntax for ic10
- tooltips for function
- snippets
- Debugger


# BIG Update
#### So the latest releases have fixed a lot of problems

- all new ic10 command now supported `lr`,`sra`, `sds`, `ss` and more
- new [debugger](#debugger) system - more convenient and understandable
- environment system - now you can configure the hardware environment of your scripts [more](#Environment)
- more information on [wiki](https://icx.traineratwot.site/wiki/ic10)
- [We need you help](#help)

# debugger
![](https://i.imgur.com/kFweq9N.jpeg)


![](https://i.imgur.com/pQ1faV0.gif)

# Environment
you can configure the hardware environment of your scripts. for this you need
1) create a file with name `.toml`
2) if you want this file to refer to only one script and not to the entire folder, name it also as a script eg: `solat.icx.ic10` => `solar.toml`
3) write in toml file with template : 
```toml
[d0]
PrefabHash="StructureAdvancedPackagingMachine"
Setting=18

[d0.slot.0]
Quantity=5

[d0.Reagents.Contents]
Iron=1
Copper=3
```

# help
![](https://hadtl54cswnmgshye9o3v63hrsaidvki.cdn-freehost.com.ua/wp-content/uploads/2014/10/We-Need-You.jpg)
Add missing functions constants and parameters to the [wiki](https://icx.traineratwot.site/wiki/ic10) in your language

If your language is not available, write Me `@Traineratwot` about it, in [discord server](https://discord.gg/KSVjXufkA9)

Add missing devices and parametrs in [google spreadsheets](https://docs.google.com/spreadsheets/d/11a_KlDoNv-ZDTKXhhw206uO0xge3_6s2BrCYBfZh86w/edit?usp=sharing)
This is necessary for the correct hints inside the extension


## icX - compiler

![](https://i.imgur.com/W4KRn28.png)

counter left lines

![counter](https://i.imgur.com/Y2MHtew.jpg)

new snippets

![snippets](https://i.imgur.com/Aokz1an.jpg)

[demo4](https://youtu.be/hYm49tz8V0A)

![img4](https://i.imgur.com/1H5azvo.gif)

[demo3](https://youtu.be/klg56OXbM3Q)

![img3](https://i.imgur.com/OYCpN7Z.gif)

[demo2](https://youtu.be/ims5SBcao64)

![img2](https://i.imgur.com/KQY21h6.gif)

[demo1](https://youtu.be/KAYrX01RgmA)

![img1](https://i.imgur.com/F1sGrVy.gif)

![img1](https://i.imgur.com/phOgb3n.jpeg)

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

[icX wiki](https://icx.traineratwot.site/wiki/icx)
