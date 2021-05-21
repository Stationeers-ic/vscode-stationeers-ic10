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
			this.progreses = document.querySelectorAll('.progress')
			for(const progress of this.progreses) {
				if(progress) {
					if(progress.getAttribute('percent')) {
						if(progress.getAttribute('percent') <= 100) {
							progress.children[0].style.setProperty('width', progress.getAttribute('percent') + '%')
						}
					}
					if(parseFloat(progress.getAttribute('value')) >= parseFloat(progress.getAttribute('max') ?? 0)) {
						progress.classList.add('geMax')
					} else {
						progress.classList.remove('geMax')
					}
					if(parseFloat(progress.getAttribute('value')) <= parseFloat(progress.getAttribute('min') ?? 0)) {
						progress.classList.add('leMin')
					} else {
						progress.classList.remove('leMin')
					}
				}
			}

		} catch(e) {

		}
	}
}

document.ic10SideBarController = new ic10SideBar()
