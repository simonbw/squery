/**
 * My replacement for jQuery. I call it sQuery.
 *
 * Current Features
 * ================
 * SELECTION
 *   - .children(filter)
 *   - .descendants(filter)
 *   - .parent()
 *   - .siblings(filter)
 * MANIPULATION - Attributes
 *   - .addClass(className [classNames])
 *   - .attr([value])
 *   - .css(classNames)
 *   - .disable()
 *   - .enable()
 *   - .hasClass(className)
 *   - .hide()
 *   - .show()
 *   - .val([value])
 * MANIPULATION - Insertion/Removal
 *   - .after([html|element|Selection])
 *   - .append([html|element|Selection])
 *   - .appendTo([html|element|Selection])
 *   - .before([html|element|Selection])
 *   - .html([html])
 *   - .prepend([html|element|Selection])
 * EVENTS
 *   - .click([handler])
 *   - .on(event, handler)
 *   - .trigger(event)
 * AJAX
 *   - $.ajax(method, url, data, callback)
 *   - $.get(url, data, callback)
 *   - $.post(url, data, callback)
 *   - .load(url, data)
 * MISC
 *   - .each()
 *   - .index()
 *   - .toArray()
 */
var $ = (function() {
	// the final module to be returned
	var _$;

	// an id highly probable to be unique
	function uniqueId() {
		// valid first characters
		var s1 = 'abcdefghijklmnopqrstuvwxyz';
		// valid other characters
		var s2 = s1 + '1234567890_';
		var chars = [s1[Math.floor(Math.random() * s1.length)]];
		for (var i = 0; i < 64; i++) {
			var c = s2[Math.floor(Math.random() * s2.length)];
			chars.push(c);
		}
		return chars.join('');
	}

	// the onready function
	var callOnLoad = [];
	window.onload = function() {
		for (var i = 0; i < callOnLoad.length; i++) {
			callOnLoad[i]();
		}
	};


	/**
	 * Represents a set of selected elements. Can pass a css selector, an
	 * element or an array of elements.
	 * @param {String|Selection|Element|Array} elements
	 * @return {Selection} a new selection
	 */
	function Selection(elements) {
		if (typeof elements === 'string') {
			var elements = document.querySelectorAll(elements);
		} else if (elements instanceof Array) {
			var elements = elements;
		} else if (elements.nodeType) {
			var elements = [elements];
		} else if (elements instanceof Selection) {
			return elements;
		} else {
			throw "Illegal argument for Selection: " + elements;
		}

		for (var i = 0; i < elements.length; i++) {
			this[i] = elements[i];
		}
		this.length = elements.length;
	}


	///////////////////
	// MISCELLANEOUS //
	///////////////////

	/**
	 * Return the position of the first element relative to its siblings.
	 */
	Selection.prototype.index = function() {
		if (this[0]) {
			var parent = this[0].parentNode;
			if (parent) {
				return parent.children.indexOf(this[0]);
			} else {
				return 0;
			}
		}
		return null;
	};

	/**
	 * Iterate through all the matched elements, executing a function on each.
	 * @param  {Function} f
	 *         Function to call on each element. Takes parameter of the element
	 *         and the index in the list of matched elements.
	 * @return {Selection}
	 */
	Selection.prototype.each = function(f) {
		for (var i = 0; i < this.length; i++) {
			f(this[i], i);
		}
		return this;
	};

	/**
	 * Retrieve all selected elements as an array.
	 * @return {Array}
	 */
	Selection.prototype.toArray = function() {
		var elements = [];
		for (var i = 0; i < this.length; i++) {
			elements.push(this[i]);
		}
		return elements;
	};

	/**
	 * Fill the content
	 * @param  {String} url
	 * @param  {Object} data
	 * @param  {Function} callback
	 * @return {Selection}	The current selection
	 */
	Selection.prototype.load = function(url, data, callback) {
		var elements = this.toArray();
		_$.get(url, data, (function(responseData) {
			for (var i = 0; i < elements.length; i++) {
				elements[i].innerHTML = responseData;
			}
			if (callback) {
				callback(responseData);
			}
		}));
		return this;
	};


	///////////////
	// SELECTION //
	///////////////

	/**
	 * Return a Selection with more elements.
	 */
	Selection.prototype.add = function(toAdd) {
		var elements = [];
		for (var i = 0; i < this.length; i++) {
			elements.push(this[i]);
		}
		if (!(toAdd instanceof Selection)) {
			toAdd = new Selection(toAdd);
		}
		for (var i = 0; i < toAdd.length; i++) {
			this[this.length] = toAdd[i];
			this.length++;
		}
		return this;
	};

	/**
	 * Return a selection containing the parent node of each element.
	 */
	Selection.prototype.parent = function() {
		var elements = [];
		for (var i = 0; i < this.length; i++) {
			elements.push(this[i].parentNode);
		}
		// TODO: Filter out duplicates without changing order
		elements.sort();
		for (var i = elements.length - 1; i > 0; i--) {
			if (elements[i] == elements[i - 1]) {
				elements.splice(i, 1);
			}
		}
		return new Selection(elements);
	};

	/**
	 * Return a selection containing all the siblings of all the elements in
	 * the current selection that match the selection filter.
	 * @param  {String} filter
	 *         Optional css selector query
	 * @return {Selection}	contains all matched children
	 */
	Selection.prototype.siblings = function(filter) {
		var selector = ">" + (filter ? filter : "*");
		var elements = [];
		for (var i = 0; i < this.length; i++) {
			var e = this[i].parentNode;
			if (e) {
				var hadId = true;
				if (!e.id) {
					hadId = false;
					e.id = uniqueId();
				}
				var siblings = e.querySelectorAll('#' + e.id + selector);
				if (!e.hadId) {
					e.id = '';
				}
				elements.push.apply(elements, siblings);
			}
		}
		// TODO: filter out duplicates
		return new Selection(elements);
	};

	/**
	 * Return a selection containing all the children of all the elements in
	 * the current selection that match the selection filter.
	 * @param  {String} filter
	 *         Optional css selector query
	 * @return {Selection}	contains all matched children
	 */
	Selection.prototype.children = function(filter) {
		var selector = ">" + (filter ? filter : "*");
		var elements = [];
		for (var i = 0; i < this.length; i++) {
			var e = this[i];
			var hadId = true;
			if (!e.id) {
				hadId = false;
				e.id = uniqueId();
			}
			var children = e.querySelectorAll('#' + e.id + selector);
			if (!e.hadId) {
				e.id = '';
			}
			elements.push.apply(elements, children);
		}
		return new Selection(elements);
	};

	/**
	 * Return a selection containing all the descendants of all the elements in
	 * the current selection that match the selection filter.
	 * @param  {String} filter
	 *         Optional css selector query
	 * @return {Selection}	contains all matched descendants
	 */
	Selection.prototype.descendants = function(filter) {
		var selector = (filter ? filter : "*");
		var elements = [];
		for (var i = 0; i < this.length; i++) {
			var descendants = this[i].querySelectorAll(selector);
			elements.push.apply(elements, descendants);
		}
		// TODO: Filter out duplicates better
		elements.sort();
		for (var i = elements.length - 1; i > 0; i--) {
			if (elements[i] == elements[i - 1]) {
				elements.splice(i, 1);
			}
		}

		return new Selection(elements);
	};


	////////////
	// EVENTS //
	////////////

	/**
	 * Add an event handler to the elements.
	 * @param {String} eventType
	 *        the type of event to register the handler on
	 * @param {function} f
	 *        the event handler
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.on = function(eventType, f) {
		for (var i = 0; i < this.length; i++) {
			this[i].addEventListener(eventType, f.bind(this));
		}
		return this;
	};

	/**
	 * Trigger an event on these elements.
	 * @param {String} eventType
	 *        the type of event to trigger
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.trigger = function(eventType) {
		var e = new Event(eventType);
		for (var i = 0; i < this.length; i++) {
			this[i].dispatchEvent(e);
		}
		return this;
	};

	/**
	 * Add an onclick handler to the elements, or simulate a click if no
	 * handler is given.
	 * @param {function} onClick
	 *        the event handler
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.click = function(f) {
		if (f) {
			return this.on('click', f);
		} else {
			return this.trigger('click');
		}
		return this;
	};


	//////////////////
	// MANIPULATION //
	//////////////////

	/**
	 * Add a class or classes
	 * @param {String} className
	 *        the class name to add. Can be an array of class names or a space
	 *        separated list of class names.
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.addClass = function(className) {
		var names = (className instanceof Array) ?
			className : className.split(/\s+/);
		for (var i = 0; i < this.length; i++) {
			for (var j = 0; j < names.length; j++) {
				this[i].classList.add(names[j]);
			}
		}
		return this;
	};

	/**
	 * Returns true if the first element has the class.
	 * @param {String} className
	 * @return {Boolean}
	 */
	Selection.prototype.hasClass = function(className) {
		if (this[0]) {
			return ((' ' + this[0].className + ' ').indexOf(
				' ' + className + ' ') >= 0);
		}
		return false;
	};

	/**
	 * Get the value of the first element or set the value of all the elements.
	 * @param {String} value
	 *        New value
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.val = function(value) {
		if (this[0]) {
			if (value !== undefined) {
				for (var i = 0; i < this.length; i++) {
					this[i].value = value;
					return this;
				}
			} else {
				return this[0].value;
			}
		} else {
			return null;
		}
	};

	/**
	 * Get the html of the first element or set the html of all the elements.
	 * @param {String} html
	 *        New html
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.html = function(html) {
		if (this[0]) {
			if (html !== undefined) {
				for (var i = 0; i < this.length; i++) {
					this[i].innerHTML = html;
					return this;
				}
			} else {
				return this[0].innerHTML;
			}
		} else {
			return null;
		}
	};

	/**
	 * Set or return the value of an attribute.
	 * @param {String} attribute
	 * @param {*} value
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.attr = function(attribute, value) {
		if (value) {
			for (var i = 0; i < this.length; i++) {
				this[i][attribute] = value;
			}
			return this;
		} else if (this.length) {
			return this[0][attribute];
		} else {
			return null;
		}
	};

	/**
	 * Disable these elements
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.disable = function() {
		for (var i = 0; i < this.length; i++) {
			this[i].disabled = true;
		}
		return this;
	};

	/**
	 * Enable these elements
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.enable = function() {
		for (var i = 0; i < this.length; i++) {
			this[i].disabled = false;
		}
		return this;
	};

	/**
	 * Set or return the value of a css property.
	 * @param {String} property
	 * @param {String} value
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.css = function(property, value) {
		if (value) {
			for (var i = 0; i < this.length; i++) {
				this[i].style.setProperty(property, value);
			}
			return this;
		} else if (this[0]) {
			return this[0].getComputedStyle().getPropertyValue(property);
		} else {
			return null;
		}
	};

	/**
	 * Hide the elements.
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.hide = function() {
		for (var i = 0; i < this.length; i++) {
			var e = this[i];
			if (e.style.display !== 'none') {
				e.oldDisplay = e.style.display;
				e.style.display = 'none';
			}
		}
		return this;
	};

	/**
	 * Show the elements.
	 * @return {Selection}	The current selection.
	 */
	Selection.prototype.show = function() {
		for (var i = 0; i < this.length; i++) {
			var e = this[i];
			if (e.style.display == 'none') {
				if (e.oldDisplay) {
					e.style.display = e.oldDisplay;
				} else {
					e.style.display = '';
				}
			}
		}
		return this;
	};



	///////////////////////
	// INSERTION/REMOVAL //
	///////////////////////

	/**
	 * Add content at the beginning of each element.
	 * @param  {String|Selection|Element} toAdd [description]
	 */
	Selection.prototype.prepend = function(toAdd) {
		if (toAdd instanceof Selection) {
			toAdd = toAdd[0];
		}
		if (toAdd) {
			for (var i = 0; i < this.length; i++) {
				var e = this[i];
				if (typeof toAdd == 'string') {
					e.innerHTML = toAdd + e.innerHTML;
				} else {
					e.insertBefore(toAdd.cloneNode(true), e.firstChild);
				}
			}
		}
		return this;
	};

	/**
	 * Prepend this content to another selection.
	 * @param  {String|Selection|Element} other
	 * @return {Selection} current selection
	 */
	Selection.prototype.prependTo = function(other) {
		other = other instanceof Selection ? other : new Selection(other);
		other.prepend(this);
		return this;
	};

	/**
	 * Add content at the end of each element.
	 * @param  {String|Selection|Element} toAdd [description]
	 */
	Selection.prototype.append = function(toAdd) {
		if (toAdd instanceof Selection) {
			toAdd = toAdd[0];
		}
		if (toAdd) {
			for (var i = 0; i < this.length; i++) {
				var e = this[i];
				if (typeof toAdd == 'string') {
					e.innerHTML += toAdd;
				} else {
					e.appendChild(toAdd.cloneNode(true));
				}
			}
		}
		return this;
	};

	/**
	 * Add this selection to another selection.
	 * @param  {String|Selection|Element} other
	 */
	Selection.prototype.appendTo = function(other) {
		other = other instanceof Selection ? other : new Selection(other);
		other.append(this);
		return this;
	};

	/**
	 * Add content before each element.
	 * @param  {String|Selection|Element} toAdd [description]
	 */
	Selection.prototype.before = function(toAdd) {
		var nodes = [];
		if (toAdd instanceof Selection) {
			for (var i = 0; i < toAdd.length; i++) {
				nodes.push(toAdd[i]);
			}
		} else if (typeof toAdd == 'string') {
			var temp = document.createElement('div');
			temp.innerHTML = toAdd;
			nodes = temp.children;
		} else if (toAdd.nodeType) {
			nodes.push(toAdd);
		} else if (toAdd instanceof Array) {
			nodes = toAdd;
		}
		for (var i = 0; i < this.length; i++) {
			var e = this[i].parentNode;
			if (e) {
				for (var j = 0; j < nodes.length; j++) {
					e.insertBefore(nodes[j].cloneNode(true), this[i]);
				}
			}
		}
		return this;
	};

	/**
	 * Add content after each element.
	 * @param  {String|Selection|Element} toAdd [description]
	 */
	Selection.prototype.after = function(toAdd) {
		var nodes = [];
		if (toAdd instanceof Selection) {
			for (var i = 0; i < toAdd.length; i++) {
				nodes.push(toAdd[i]);
			}
		} else if (typeof toAdd == 'string') {
			var temp = document.createElement('div');
			temp.innerHTML = toAdd;
			nodes = temp.children;
		} else if (toAdd.nodeType) {
			nodes.push(toAdd);
		} else if (toAdd instanceof Array) {
			nodes = toAdd;
		}
		for (var i = 0; i < this.length; i++) {
			var e = this[i].parentNode;
			if (e) {
				for (var j = nodes.length - 1; j >= 0; j--) {
					e.insertBefore(nodes[j].cloneNode(true),
						this[i].nextSibling);
				}
			}
		}
		return this;
	};

	/**
	 * Remove the elements.
	 */
	Selection.prototype.remove = function() {
		for (var i = 0; i < this.length; i++) {
			this[i].parentNode.removeChild(this[i]);
		}
		return this;
	};

	/**
	 * Remove each element's children.
	 */
	Selection.prototype.empty = function() {
		for (var i = 0; i < this.length; i++) {
			var e = this[i];
			while (e.firstChild) {
				e.removeChild(e.firstChild);
			}
		}
		return this;
	};

	////////////////
	// ANIMATION //
	////////////////

	Selection.prototype.fadeIn = function() {
		this.each(function(e) {
			var oldOpacity = e.style.opacity;
			var startTime = Date.now();
			var endTime = startTime = 1000;
			e.style.opacity = 0;

			var f = function() {
				var now = Date.now();
				e.style.opacity = Math.min((now - startTime) / (endTime - startTime), 1.0);
				if (now < endTime) {
					setTimeout(f, 10);
				}
			}

		});

		return this;
	}

	//////////////////////
	// HELPER FUNCTIONS //
	//////////////////////

	// The public function/object returned
	_$ = function(arg1) {
		if (typeof arg1 === 'function') {
			callOnLoad.push(arg1);
		} else if (typeof arg1 === 'string') {
			if (arg1.length > 0 && arg1[0] == '<') {
				var eType = arg1.substring(1, arg1.indexOf('>'));
				var e = document.createElement(eType);
				// set optional attributes
				if (arguments[1]) {
					for (var attribute in arguments[1]) {
						if (arguments[1].hasOwnProperty(attribute)) {
							var value = arguments[1][attribute];
							// custom pseudo attributes
							if (attribute == 'class') {
								e.className = value;
							} else if (attribute == 'html') {
								e.innerHTML = value;
							} else if (attribute == 'text') {
								e.innerText = value;
							} else if (attribute == 'height') {
								e.style.height = value + 'px';
							} else if (attribute == 'width') {
								e.style.width = value + 'px';
							}
							// real DOM attributes
							else {
								e[attribute] = value;
							}
						}
					}
					// TODO: set pseudo attributes

				}
				return new Selection(e);
			} else {
				return new Selection(arg1);
			}
		} else if (arg1 instanceof Selection) {
			return arg1;
		} else if (typeof arg1 === 'object') {
			if (arg1.nodeType) {
				return new Selection(arg1);
			}
		} else {
			throw "Illegal argument for $: " + arg1;
		}
	};

	/**
	 * Encode get parameters in a url.
	 * @param  {Object} parameters
	 * @param  {bool} post
	 * @return {String}
	 */
	_$.params = function(parameters, post) {
		var props = [];
		for (var prop in parameters) {
			if (parameters.hasOwnProperty(prop)) {
				props.push(encodeURIComponent(prop) + '=' +
					encodeURIComponent(parameters[prop]));
			}
		}
		if (props.length) {
			return (post ? '' : '?') + props.join('&');
		} else {
			return "";
		}
	};

	/**
	 * Make an AJAX get request.
	 * @param  {String}   url
	 * @param  {Object}   data
	 * @param  {Function} callback
	 */
	_$.get = function(url, data, callback, error) {
		return _$.ajax('GET', url, data, callback, error);
	};

	/**
	 * Make an AJAX post request.
	 * @param  {String}   url
	 * @param  {Object}   data
	 * @param  {Function} callback
	 */
	_$.post = function(url, data, callback, error) {
		return _$.ajax('POST', url, data, callback, error);
	};

	/**
	 * Make an AJAX request.
	 * @param  {String}   method
	 * @param  {String}   url
	 * @param  {Object}   data
	 * @param  {Function} callback
	 *         function called when complete
	 * @param  {Function} error
	 *         function called when errored
	 */
	_$.ajax = function(method, url, data, callback, error) {
		var request = new XMLHttpRequest();
		var dataString = '';
		if (method == 'GET') {
			url += _$.params(data);
		} else {
			dataString = _$.params(data, true);
		}
		if (callback || error) {
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) {
						if (callback) {
							var responseType = request.getResponseHeader('content-type');
							responseType = responseType ? responseType.toLowerCase() : '';
							var responseData;
							if (responseType.indexOf('text/plain') >= 0) {
								responseData = request.responseText;
							} else if (responseType.indexOf('text/html') >= 0) {
								responseData = request.responseText;
							} else if (responseType.indexOf('xml') >= 0) {
								responseData = request.responseXML;
							} else if (responseType.indexOf('application/json') >= 0) {
								responseData = JSON.parse(request.responseText);
							} else {
								responseData = request.responseText;
							}

							callback(responseData);
						}
					} else if (error) {
						error(request.statusText, request.status, request);
					}
				}
			};
		}
		request.open(method, url, true);
		request.send(dataString);
	};

	return _$;
})();