# Stationeers ic10

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

[<img src="https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico" width="20"> discord](https://discord.gg/KSVjXufkA9)


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

- highlights syntax for ic10
- tooltips for function
- snippets
- Debugger

## News
- new snippets
- new description for variable
- Write value in debugger 
- translate to english
- **Debugger**
- **Formatter**
- **Semantic code analize**
- counter left lines

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


### code preview

- vars
    ```
    ---icX
       var a = 10
    ---ic10
       move r0 10
    ```
    ```
    ---icX
       use aliases
       var a = 10
    ---ic10
       alias a r0
       move a 10
    ```
- increment
    ```
    ---icX
       var a = 0
       a++
    ---ic10
       move r0 0
       add r0 r0 1
    ```
- math

  ```
  ---icX
     var x =  5 + 5 * 2 
  ---ic10
     move r0 15
  ```
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

  ```
  ---icX
     const x = 2 + 2
     const y = x + 2
     var z = y + 2
  ---ic10
     move r0 8
  ```

- if,else
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
       move r1 1
       j if0exit
       if0else:
       move r1 0
       if0exit:
    ```

- while
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
- Devices
    ```
    ---icX
       d0.Setting = 1
       var a = d0.Setting
       var b = d0.slot(a).PrefabHash
       a = d(5438547545).Setting(sum)
       d(5438547545).Setting = b
    ---ic10
       s d0 Setting 1
       l r0 d0 Setting
       ls r1 d0 r0 PrefabHash
       lb r0 5438547545 Setting Sum
    ```

- function
    ```
    ---icX
       var a = 10
       fuctionName()
       function fuctionName
           d0.Setting = a
       end
    ---ic10
       move r0 10
       jal fuctionName
       j _icXstart
       fuctionName:
           s d0 Setting r0
       j ra
       _icXstart:
    ```

