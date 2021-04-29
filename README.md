# Stationeers ic10

![issues](https://badgen.net/github/issues/Traineratwot/vscode-stationeers-ic10/)
![open-issues](https://badgen.net/github/open-issues/Traineratwot/vscode-stationeers-ic10/)
![watchers](https://badgen.net/github/watchers/Traineratwot/vscode-stationeers-ic10/)
![stars](https://badgen.net/github/stars/Traineratwot/vscode-stationeers-ic10/)
![release](https://badgen.net/github/release/Traineratwot/vscode-stationeers-ic10/)
![last-commit](https://badgen.net/github/last-commit/Traineratwot/vscode-stationeers-ic10/)
![open-prs](https://badgen.net/github/open-prs/Traineratwot/vscode-stationeers-ic10/)

![npm](https://badgen.net/badge/icon/npm?label=ic10)
![npm-ic10](https://badgen.net/npm/v/ic10)
![npm](https://badgen.net/vs-marketplace/v/Traineratwot.stationeers-ic10)

![npm](https://badgen.net/vs-marketplace/d/Traineratwot.stationeers-ic10)
![npm](https://badgen.net/vs-marketplace/i/Traineratwot.stationeers-ic10)
![npm](https://badgen.net/vs-marketplace/rating/Traineratwot.stationeers-ic10)

- hightlight syntax for ic10
- tooltips for function
- snippets
- Debugger

## News
- new snippets
- new description for variable
- Write value in debugger 
- translate to english
- **Debugger**

new snippets
![snippets](https://i.imgur.com/Aokz1an.jpg)


[demo2](https://youtu.be/ims5SBcao64)

![img1](https://i.imgur.com/KQY21h6.gif)

[demo1](https://youtu.be/KAYrX01RgmA)

![img1](https://i.imgur.com/F1sGrVy.gif)



![img1](https://i.imgur.com/phOgb3n.jpeg)

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
