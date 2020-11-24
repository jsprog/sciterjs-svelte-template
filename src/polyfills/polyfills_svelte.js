
// polyfill the deprecated Element.prototype.createEvent
if (!document.createEvent) {
	Element.prototype.createEvent = function (name) {
		return new Event(name)
	}
}

// polyfill the deprecated Event.prototype.initCustomEvent
//     note: Expect this code to change anytime
if (!Event.prototype.initCustomEvent) {
	Event.prototype.initCustomEvent = function (type, canBubble, cancelable, detail) {
		Object.defineProperty(this, 'type', { value: type })
		Object.defineProperty(this, 'bubbles', { value: canBubble } )
		Object.defineProperty(this, 'cancelable', { value: cancelable })
		Object.defineProperty(this, 'detail', { value: detail })
	}
}
