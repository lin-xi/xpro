/*--------------------------------------------------------*/ ;
var _uid = 0;
var _ = function (obj) {};
//isFunction
_.isFunction = function (obj) {
	return typeof obj === 'function';
};
//isObject
_.isObject = function (obj) {
	return obj === Object(obj);
};
//isArray
_.isArray = function (obj) {
	if (obj.length !== undefined) {
		return true;
	} else {
		return Object.prototype.toString.call(obj) == '[object Array]';
	}
};
_.isEmptyObject = function (obj) {
	if (obj == null) return true;
	for (var key in obj)
		if (_.has(obj, key)) return false;
	return true;
};
//trim
_.trim = function (str) {
	if (!str) return '';
	return str.replace(/^\s*|\s*$/g, '');
};
_.has = function (obj, key) {
	return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
};
_.keys = function (obj) {
	if (!_.isObject(obj)) return [];
	if (Object.keys) return Object.keys(obj);
	var keys = [];
	for (var key in obj)
		if (_.has(obj, key)) keys.push(key);
	return keys;
};
//each
_.each = function (obj, iterator, context) {
	if (obj == null) return obj;
	if (obj.length === +obj.length) {
		for (var i = 0, length = obj.length; i < length; i++) {
			if (iterator.call(context, i, obj[i], obj)) return;
		}
	} else {
		var keys = _.keys(obj);
		for (var i = 0, length = keys.length; i < length; i++) {
			if (iterator.call(context, keys[i], obj[keys[i]], obj)) return;
		}
	}
	return obj;
};
//extend
_.extend = function (obj) {
	if (!_.isObject(obj)) return obj;
	_.each(Array.prototype.slice.call(arguments, 1), function (i, source) {
		for (var prop in source) {
			obj[prop] = source[prop];
		}
	});
	return obj;
};
_.copy = function (obj) {
	if (!_.isObject(obj)) return obj;
	_.each(Array.prototype.slice.call(arguments, 1), function (i, source) {
		for (var prop in source) {
			obj.prototype[prop] = source[prop];
		}
	});
	return obj;
};
//clone
_.clone = function (obj) {
	if (!_.isObject(obj)) return obj;
	return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
};
_.param = function (obj) {
	var temp = [];
	_.each(obj, function (key, item) {
		temp.push(key + '=' + encodeURIComponent(item));
	});
	return temp.join('&');
};
_.md5 = function (n) {
	var nc = n || 3,
		i = 0;
	var v = (+new Date()).toString(32);
	for (; i < 5; i++) {
		v += Math.floor(Math.random() * 65535).toString(32);
	}
	return v;
};
_.uuid = function () {
	return ++_uid;
};
_.render = function (template, data, func) {
	return template.replace(/\{\{(.*?)\}\}/g, function (s0, s1) {
		if (_.isFunction(func)) {
			return func(s1, data);
		} else {
			var key, val, filter;
			if (s1.indexOf('|') > 0) {
				var parts = s1.split('|');
				key = _.trim(parts[0]),
					filter = _.trim(parts[1]);
			} else {
				key = _.trim(s1);
			}
			var ks;
			if (key.indexOf('.') != -1) {
				var ks = key.split('.');
				var val = data[ks[0]];
				_.each(ks, function (i, k) {
					i > 0 && val && (val = val[k]);
				});
			} else {
				val = data[key];
			}
			if (filter) {
				var mat = filter.match(/\s*in(\{.*?\})/);
				if (mat && mat.length > 1) {
					var json = (new Function("", "return " + mat[1]))();
					json && (val = json[val] ? json[val] : '');
				} else {
					if (func.filter && func.filter[filter]) {
						val = func.filter[filter](val);
					} else {
						console.error('filter[' + filter + '] not exist');
					}
				}
			}
			return val;
		}
	});
};
_.loadCss = function (path) {
	if (path) {
		var head = document.getElementsByTagName('head')[0];
		var link = document.createElement('link');
		link.href = path;
		link.rel = 'stylesheet';
		link.type = 'text/css';
		head.appendChild(link);
	}
};
_.loadJs = function (path, fn) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.onreadystatechange = function () {
		if (this.readyState == 'complete') {
			fn && fn();
		}
	}
	script.type = 'text/javascript';
	script.src = url;
	head.appendChild(script);
	return script;
};
_.ajax = (function () {
	function send(url, method, params, postData, cb, type) {
		var xhr = null;
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		if (xhr != null) {
			var fullUrl = url,
				urlParam = _.param(params);
			if (urlParam) {
				fullUrl = url + '?' + urlParam;
			}
			// '', arraybuffer, blob, document, json, text
			if (type) {
				xhr.responseType = type;
			}
			xhr.open(method, fullUrl, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						var data = xhr.responseText;
						cb && cb(data);
					}
				}
			}
		}
		var body;
		if (postData) {
			var bodies = [];
			for (var name in postData) {
				bodies.push(name + '=' + encodeURIComponent(postData[name]));
			}
			body = bodies.join('&');
			if (body.length) {
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}
		}
		xhr.send(body);
	}
	return {
		get: function (url, params, cb, type) {
			send(url, 'GET', params, null, cb, type);
		},
		post: function (url, params, postData, cb) {
			send(url, 'POST', params, postData, cb);
		}
	};
})();
/*--------------------------------------------------------*/
_.dom = {};
_.dom.create = function (htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString;
	return Array.prototype.slice.call(div.children);
};
_.dom.get = function (queryString) {
	if (typeof (queryString) == 'string') {
		return document.querySelectorAll(queryString);
	} else {
		return [queryString];
	}
};
_.dom.hasClass = function (dom, name) {
	var d = _.dom.get(dom);
	var reg = new RegExp(name + '\\b', 'g');
	return d[0].className.match(reg);
};
_.dom.addClass = function (dom, name) {
	if (!_.dom.hasClass(dom, name)) {
		dom.className += ' ' + name;
	}
	return dom;
};
_.dom.removeClass = function (dom, name) {
	var cname = dom.ClassName;
	if (_.dom.hasClass(dom, name)) {
		dom.className = dom.className.replace(name, '');
	}
	return dom;
};
_.dom.css = function (queryString, property, value) {
	var doms = _.dom.get(queryString);
	if (arguments.length < 3) {
		var computedStyle, element = doms[0]
		if (!element) return;
		computedStyle = getComputedStyle(element, '')
		if (typeof property == 'string')
			return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
		else if (_.isArray(property)) {
			var props = {}
			_.each(property, function (i, prop) {
				props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
			})
			return props
		}
	}
	var css = ''
	if (typeof (property) == 'string') {
		if (!value && value !== 0)
			_.each(doms, function (i, ele) {
				ele.style.removeProperty(dasherize(property));
			});
		else
			css = dasherize(property) + ":" + maybeAddPx(property, value)
	} else {
		for (key in property)
			if (!property[key] && property[key] !== 0)
				_.each(doms, function (i, ele) {
					ele.style.removeProperty(dasherize(key));
				});
			else
				css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
	}
	_.each(doms, function (i, ele) {
		ele.style.cssText += (';' + css);
	});

	function dasherize(str) {
		return str.replace(/::/g, '/')
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
			.replace(/([a-z\d])([A-Z])/g, '$1_$2')
			.replace(/_/g, '-')
			.toLowerCase()
	}

	function camelize(str) {
		return str.replace(/-+(.)?/g, function (match, chr) {
			return chr ? chr.toUpperCase() : ''
		});
	}

	function maybeAddPx(name, value) {
		var cssNumber = {
			'column-count': 1,
			'columns': 1,
			'font-weight': 1,
			'line-height': 1,
			'opacity': 1,
			'z-index': 1,
			'zoom': 1
		};
		return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
	}
};
_.dom.offset = function (queryString) {
	var doms = _.dom.get(queryString);
	if (!doms) return
	var obj = doms[0].getBoundingClientRect()
	return {
		left: obj.left + window.pageXOffset,
		top: obj.top + window.pageYOffset,
		width: Math.round(obj.width),
		height: Math.round(obj.height)
	}
};
_.dom.position = function (queryString) {
	var doms = _.dom.get(queryString);
	if (!doms) return

	var elem = doms[0],
		// Get *real* offsetParent
		offsetParent = _.dom.offsetParent(),
		// Get correct offsets
		offset = _.dom.offset(elem),
		parentOffset = _.dom.offset(offsetParent[0]);
	// Subtract element margins
	// note: when an element has margin: auto the offsetLeft and marginLeft
	// are the same in Safari causing offset.left to incorrectly be 0
	offset.top -= parseFloat(_.dom.css(elem, 'margin-top')) || 0
	offset.left -= parseFloat(_.dom.css(elem, 'margin-left')) || 0
		// Add offsetParent borders
	parentOffset.top += parseFloat(_.dom.css(offsetParent[0], 'border-top-width')) || 0
	parentOffset.left += parseFloat(_.dom.css(offsetParent[0], 'border-left-width')) || 0
		// Subtract the two offsets
	return {
		top: offset.top - parentOffset.top,
		left: offset.left - parentOffset.left
	}
};
_.dom.offsetParent = function (queryString) {
	var doms = _.dom.get(queryString);
	return doms.map(function () {
		var parent = this.offsetParent || document.body;
		while (parent && !/^(?:body|html)$/i.test(parent.nodeName) && _.dom.css(parent, "position") == "static")
			parent = parent.offsetParent
		return parent
	});
};
_.dom.on = function (target, eventType, fn) {
	var eles = _.dom.get(target);
	_.each(eles, function (index, item) {
		DomEvent.on(eventType, item, fn);
	});
	return eles;
};
_.dom.off = function (target, eventType, fn) {
	if (typeof (target) == 'string') {
		var eles = _.dom.get(target);
		eles && _.each(eles, function (index, item) {
			DomEvent.off(eventType, item, fn);
		});
		return eles;
	} else {
		DomEvent.off(eventType, target, fn);
		return target;
	}
};
_.dom.show = function (target) {
	_.each(_.dom.get(target), function (index, item) {
		item.style.display = "block";
	});
};
_.dom.hide = function (target) {
	_.each(_.dom.get(target), function (index, item) {
		item.style.display = "none";
	});
};
_.dom.toggle = function (target) {
	var dis = _.dom.css(target, 'display');
	dis == 'none' ? _.dom.show(target) : _.dom.hide(target);
};
/*--------------------------------------------------------*/
_.cookies = {
	getItem: function (sKey) {
		if (!sKey) {
			return null;
		}
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
			return false;
		}
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		return true;
	},
	removeItem: function (sKey, sPath, sDomain) {
		if (!this.hasItem(sKey)) {
			return false;
		}
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem: function (sKey) {
		if (!sKey) {
			return false;
		}
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: function () {
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
			aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
		}
		return aKeys;
	}
};
/*--------------------------------------------------------*/
var DomEvent = {
	on: function (evtName, element, listener, capture) {
		var evt = '',
			useCapture = (capture === undefined) ? true : capture,
			handler = null;
		if (window.addEventListener === undefined) {
			evt = 'on' + evtName;
			handler = function (evt, listener) {
				element.attachEvent(evt, listener);
				return listener;
			};
		} else {
			evt = evtName;
			handler = function (evt, listener, useCapture) {
				element.addEventListener(evt, listener, useCapture);
				return listener;
			};
		}
		return handler.apply(element, [evt, function (ev) {
			var e = ev || event,
				src = e.srcElement || e.target;
			listener(e, src);
		}, useCapture]);
	},
	off: function (evtName, element, listener, capture) {
		var evt = '',
			useCapture = (capture === undefined) ? true : capture;
		if (window.removeEventListener === undefined) {
			evt = 'on' + evtName;
			// element.detachEvent(evt, listener);
			element[evt] = null;
		} else {
			evt = evtName;
			element.removeEventListener(evt, listener, useCapture);
		}
	},
	stopPropagation: function (evt) {
		evt.cancelBubble = true;
		if (evt.stopPropagation) {
			evt.stopPropagation();
		}
	},
	preventDefault: function (evt) {
		if (evt.preventDefault) {
			evt.preventDefault();
		} else {
			evt.returnValue = false;
		}
	}
};
var Event = {
	on: function (eventType, func) {
		if (!this._events) {
			this._events = {};
		}
		this._events[eventType] = func;
	},
	off: function (eventType) {
		delete this._events[eventType];
	},
	dispatchEvent: function () {
		var args = Array.prototype.slice.call(arguments, 1);
		var eventType = arguments[0];
		if (eventType && this._events) {
			var handler = this._events[eventType];
			handler && handler.apply(this, _.isArray(args) ? args : [args]);
		}
	}
};
/*--------------------------------------------------------*/