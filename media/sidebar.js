class ic10SideBar {
	constructor() {
		this.vscode = acquireVsCodeApi()
		// this.oldState = vscode.getState()
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
		this.form()
	}


	form() {
		try {
			var self = this
			self.events = {}
			window.addEventListener('input', function(event) {
				var fn = event.target.getAttribute('data-fn')
				if(fn && event.target.id) {

					var data = {
						id: event.target.id ?? null,
						value: event.target.value ?? null,
						type: event.target.type ?? null,
						name: event.target.name ?? null,
					}
					switch( event.target.tagName ) {
						case 'INPUT':
							switch( event.target.type ) {
								case 'checkbox':
									data.value = event.target.checked
									break
								default:
									break
							}
							break
						case 'SELECT':
							break
						case 'BUTTON':
							data.value = event.target.value ?? true
							break
					}
					self.events[event.target.id] = {
						event: 'input',
						data: data,
						fn: fn,
					}
				}
			})
		} catch(e) {
			// console.error(e)
		}
		setInterval(() => {
			for(const eventsKey in self.events) {
				if(self.events.hasOwnProperty(eventsKey)) {
					var data = self.events[eventsKey]
					self.events[eventsKey] = null
					delete  self.events[eventsKey]
					// console.log(data)
					self.vscode.postMessage(data)

				}
			}
			self.events = {}
		}, 100)
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
