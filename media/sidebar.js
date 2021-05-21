class ic10SideBar {
	constructor() {
		this.vscode = acquireVsCodeApi()
		this.run()
		window.addEventListener('message', event => {
			const message = event.data // The json data that the extension sent
			if(typeof this[message.fn] == 'function') {
				this[message.fn](message.data)
				this.run()
			}
		})
	}


	run() {
		this.p()
	}


	update(newContent) {
		try {
			this.content = document.querySelector('#content')
			this.content.innerHTML = newContent
		} catch(e) {

		}
	}


	p() {
		try {
			this.progress = document.querySelector('#leftLineCounter-progress')
			if(this.progress) {
				if(this.progress.value >= this.progress.max) {
					this.progress.classList.add('geMax')
				} else {
					this.progress.classList.remove('geMax')
				}
				if(this.progress.value <= (this.progress.min ?? 0)) {
					this.progress.classList.add('leMin')
				} else {
					this.progress.classList.remove('leMin')
				}
			}

		} catch(e) {

		}
	}
}

document.ic10SideBarController = new ic10SideBar()
