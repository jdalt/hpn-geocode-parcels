(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var L = require('leaflet');
var request = require('superagent');
var map = L.map('map').setView([44.9833, -93.266730], 7);

if ( !String.prototype.contains ) {
  String.prototype.contains = function() {
    return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}

console.log('ohai');

L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
  key: 'BC9A493B41014CAABB98F0471D759707',
  styleId: 22677
}).addTo(map);

L.Icon.Default.imagePath = 'images';

var marketIcon = L.icon({
    iconUrl: 'images/market.png'
});

request.get('minnesota_grown.geojson').end(function(res) {
  if(res.text) {
    L.geoJson(JSON.parse(res.text), {
              onEachFeature: makePopups,
              pointToLayer: makeMarkers
    }).addTo(map);
  }
});

function makePopups(feature, layer) {
  console.log(feature);
  var props = feature.properties;
  if (props) {
    layer.bindPopup("<h3>" + props.name + "</h3><div class='italic'>" + props.products + "</div><div>" + props.description + "</div>");
  }
}

function makeMarkers(feature, latlng) {
  var props = feature.properties;
  var myIcon = null;
  var myColor = "#000";
  if (props) {
    var prod = props.products;
    if(prod.contains("Farmers Market")) {
      myColor = "#00f";
    }
    if(prod.contains("Cow") || prod.contains("Dairy")) {
      myColor = "#fff";
    }
    if(prod.contains("Pumpkin")) {
      myColor = "#ffa500";
    }
    if(prod.contains("CSA")) {
      myColor = "#0f0";
    }
    if(prod.contains("Wine")) {
      myColor = "#f00";
    }
    if(prod.contains("Beef")) {
      myColor = "#dedbef";
    }
  }
  return new L.circleMarker(latlng, {fillColor: myColor, fillOpacity: .8, stroke: false});
}


},{"leaflet":2,"superagent":3}],2:[function(require,module,exports){
/*
 Leaflet, a JavaScript library for mobile-friendly interactive maps. http://leafletjs.com
 (c) 2010-2013, Vladimir Agafonkin
 (c) 2010-2011, CloudMade
*/
(function (window, document, undefined) {
var oldL = window.L,
    L = {};

L.version = '0.7.2';

// define Leaflet for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
	module.exports = L;

// define Leaflet as an AMD module
} else if (typeof define === 'function' && define.amd) {
	define(L);
}

// define Leaflet as a global L variable, saving the original L to restore later if needed

L.noConflict = function () {
	window.L = oldL;
	return this;
};

window.L = L;


/*
 * L.Util contains various utility functions used throughout Leaflet code.
 */

L.Util = {
	extend: function (dest) { // (Object[, Object, ...]) ->
		var sources = Array.prototype.slice.call(arguments, 1),
		    i, j, len, src;

		for (j = 0, len = sources.length; j < len; j++) {
			src = sources[j] || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}
		return dest;
	},

	bind: function (fn, obj) { // (Function, Object) -> Function
		var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
		return function () {
			return fn.apply(obj, args || arguments);
		};
	},

	stamp: (function () {
		var lastId = 0,
		    key = '_leaflet_id';
		return function (obj) {
			obj[key] = obj[key] || ++lastId;
			return obj[key];
		};
	}()),

	invokeEach: function (obj, method, context) {
		var i, args;

		if (typeof obj === 'object') {
			args = Array.prototype.slice.call(arguments, 3);

			for (i in obj) {
				method.apply(context, [i, obj[i]].concat(args));
			}
			return true;
		}

		return false;
	},

	limitExecByInterval: function (fn, time, context) {
		var lock, execOnUnlock;

		return function wrapperFn() {
			var args = arguments;

			if (lock) {
				execOnUnlock = true;
				return;
			}

			lock = true;

			setTimeout(function () {
				lock = false;

				if (execOnUnlock) {
					wrapperFn.apply(context, args);
					execOnUnlock = false;
				}
			}, time);

			fn.apply(context, args);
		};
	},

	falseFn: function () {
		return false;
	},

	formatNum: function (num, digits) {
		var pow = Math.pow(10, digits || 5);
		return Math.round(num * pow) / pow;
	},

	trim: function (str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	},

	splitWords: function (str) {
		return L.Util.trim(str).split(/\s+/);
	},

	setOptions: function (obj, options) {
		obj.options = L.extend({}, obj.options, options);
		return obj.options;
	},

	getParamString: function (obj, existingUrl, uppercase) {
		var params = [];
		for (var i in obj) {
			params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
		}
		return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
	},
	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	},

	isArray: Array.isArray || function (obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	},

	emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

(function () {

	// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

	function getPrefixed(name) {
		var i, fn,
		    prefixes = ['webkit', 'moz', 'o', 'ms'];

		for (i = 0; i < prefixes.length && !fn; i++) {
			fn = window[prefixes[i] + name];
		}

		return fn;
	}

	var lastTime = 0;

	function timeoutDefer(fn) {
		var time = +new Date(),
		    timeToCall = Math.max(0, 16 - (time - lastTime));

		lastTime = time + timeToCall;
		return window.setTimeout(fn, timeToCall);
	}

	var requestFn = window.requestAnimationFrame ||
	        getPrefixed('RequestAnimationFrame') || timeoutDefer;

	var cancelFn = window.cancelAnimationFrame ||
	        getPrefixed('CancelAnimationFrame') ||
	        getPrefixed('CancelRequestAnimationFrame') ||
	        function (id) { window.clearTimeout(id); };


	L.Util.requestAnimFrame = function (fn, context, immediate, element) {
		fn = L.bind(fn, context);

		if (immediate && requestFn === timeoutDefer) {
			fn();
		} else {
			return requestFn.call(window, fn, element);
		}
	};

	L.Util.cancelAnimFrame = function (id) {
		if (id) {
			cancelFn.call(window, id);
		}
	};

}());

// shortcuts for most used utility functions
L.extend = L.Util.extend;
L.bind = L.Util.bind;
L.stamp = L.Util.stamp;
L.setOptions = L.Util.setOptions;


/*
 * L.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

L.Class = function () {};

L.Class.extend = function (props) {

	// extended class with the new prototype
	var NewClass = function () {

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}

		// call all constructor hooks
		if (this._initHooks) {
			this.callInitHooks();
		}
	};

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		L.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		L.Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = L.extend({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	L.extend(proto, props);

	proto._initHooks = [];

	var parent = this;
	// jshint camelcase: false
	NewClass.__super__ = parent.prototype;

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parent.prototype.callInitHooks) {
			parent.prototype.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


// method for adding properties to prototype
L.Class.include = function (props) {
	L.extend(this.prototype, props);
};

// merge new default options to the Class
L.Class.mergeOptions = function (options) {
	L.extend(this.prototype.options, options);
};

// add a constructor hook
L.Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
};


/*
 * L.Mixin.Events is used to add custom events functionality to Leaflet classes.
 */

var eventsKey = '_leaflet_events';

L.Mixin = {};

L.Mixin.Events = {

	addEventListener: function (types, fn, context) { // (String, Function[, Object]) or (Object[, Object])

		// types can be a map of types/handlers
		if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey] = this[eventsKey] || {},
		    contextId = context && context !== this && L.stamp(context),
		    i, len, event, type, indexKey, indexLenKey, typeIndex;

		// types can be a string of space-separated words
		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			event = {
				action: fn,
				context: context || this
			};
			type = types[i];

			if (contextId) {
				// store listeners of a particular context in a separate hash (if it has an id)
				// gives a major performance boost when removing thousands of map layers

				indexKey = type + '_idx';
				indexLenKey = indexKey + '_len';

				typeIndex = events[indexKey] = events[indexKey] || {};

				if (!typeIndex[contextId]) {
					typeIndex[contextId] = [];

					// keep track of the number of keys in the index to quickly check if it's empty
					events[indexLenKey] = (events[indexLenKey] || 0) + 1;
				}

				typeIndex[contextId].push(event);


			} else {
				events[type] = events[type] || [];
				events[type].push(event);
			}
		}

		return this;
	},

	hasEventListeners: function (type) { // (String) -> Boolean
		var events = this[eventsKey];
		return !!events && ((type in events && events[type].length > 0) ||
		                    (type + '_idx' in events && events[type + '_idx_len'] > 0));
	},

	removeEventListener: function (types, fn, context) { // ([String, Function, Object]) or (Object[, Object])

		if (!this[eventsKey]) {
			return this;
		}

		if (!types) {
			return this.clearAllEventListeners();
		}

		if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey],
		    contextId = context && context !== this && L.stamp(context),
		    i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			type = types[i];
			indexKey = type + '_idx';
			indexLenKey = indexKey + '_len';

			typeIndex = events[indexKey];

			if (!fn) {
				// clear all listeners for a type if function isn't specified
				delete events[type];
				delete events[indexKey];
				delete events[indexLenKey];

			} else {
				listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];

				if (listeners) {
					for (j = listeners.length - 1; j >= 0; j--) {
						if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
							removed = listeners.splice(j, 1);
							// set the old action to a no-op, because it is possible
							// that the listener is being iterated over as part of a dispatch
							removed[0].action = L.Util.falseFn;
						}
					}

					if (context && typeIndex && (listeners.length === 0)) {
						delete typeIndex[contextId];
						events[indexLenKey]--;
					}
				}
			}
		}

		return this;
	},

	clearAllEventListeners: function () {
		delete this[eventsKey];
		return this;
	},

	fireEvent: function (type, data) { // (String[, Object])
		if (!this.hasEventListeners(type)) {
			return this;
		}

		var event = L.Util.extend({}, data, { type: type, target: this });

		var events = this[eventsKey],
		    listeners, i, len, typeIndex, contextId;

		if (events[type]) {
			// make sure adding/removing listeners inside other listeners won't cause infinite loop
			listeners = events[type].slice();

			for (i = 0, len = listeners.length; i < len; i++) {
				listeners[i].action.call(listeners[i].context, event);
			}
		}

		// fire event for the context-indexed listeners as well
		typeIndex = events[type + '_idx'];

		for (contextId in typeIndex) {
			listeners = typeIndex[contextId].slice();

			if (listeners) {
				for (i = 0, len = listeners.length; i < len; i++) {
					listeners[i].action.call(listeners[i].context, event);
				}
			}
		}

		return this;
	},

	addOneTimeEventListener: function (types, fn, context) {

		if (L.Util.invokeEach(types, this.addOneTimeEventListener, this, fn, context)) { return this; }

		var handler = L.bind(function () {
			this
			    .removeEventListener(types, fn, context)
			    .removeEventListener(types, handler, context);
		}, this);

		return this
		    .addEventListener(types, fn, context)
		    .addEventListener(types, handler, context);
	}
};

L.Mixin.Events.on = L.Mixin.Events.addEventListener;
L.Mixin.Events.off = L.Mixin.Events.removeEventListener;
L.Mixin.Events.once = L.Mixin.Events.addOneTimeEventListener;
L.Mixin.Events.fire = L.Mixin.Events.fireEvent;


/*
 * L.Browser handles different browser and feature detections for internal Leaflet use.
 */

(function () {

	var ie = 'ActiveXObject' in window,
		ielt9 = ie && !document.addEventListener,

	    // terrible browser detection to work around Safari / iOS / Android browser bugs
	    ua = navigator.userAgent.toLowerCase(),
	    webkit = ua.indexOf('webkit') !== -1,
	    chrome = ua.indexOf('chrome') !== -1,
	    phantomjs = ua.indexOf('phantom') !== -1,
	    android = ua.indexOf('android') !== -1,
	    android23 = ua.search('android [23]') !== -1,
		gecko = ua.indexOf('gecko') !== -1,

	    mobile = typeof orientation !== undefined + '',
	    msPointer = window.navigator && window.navigator.msPointerEnabled &&
	              window.navigator.msMaxTouchPoints && !window.PointerEvent,
		pointer = (window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints) ||
				  msPointer,
	    retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1) ||
	             ('matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') &&
	              window.matchMedia('(min-resolution:144dpi)').matches),

	    doc = document.documentElement,
	    ie3d = ie && ('transition' in doc.style),
	    webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
	    gecko3d = 'MozPerspective' in doc.style,
	    opera3d = 'OTransition' in doc.style,
	    any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs;


	// PhantomJS has 'ontouchstart' in document.documentElement, but doesn't actually support touch.
	// https://github.com/Leaflet/Leaflet/pull/1434#issuecomment-13843151

	var touch = !window.L_NO_TOUCH && !phantomjs && (function () {

		var startName = 'ontouchstart';

		// IE10+ (We simulate these into touch* events in L.DomEvent and L.DomEvent.Pointer) or WebKit, etc.
		if (pointer || (startName in doc)) {
			return true;
		}

		// Firefox/Gecko
		var div = document.createElement('div'),
		    supported = false;

		if (!div.setAttribute) {
			return false;
		}
		div.setAttribute(startName, 'return;');

		if (typeof div[startName] === 'function') {
			supported = true;
		}

		div.removeAttribute(startName);
		div = null;

		return supported;
	}());


	L.Browser = {
		ie: ie,
		ielt9: ielt9,
		webkit: webkit,
		gecko: gecko && !webkit && !window.opera && !ie,

		android: android,
		android23: android23,

		chrome: chrome,

		ie3d: ie3d,
		webkit3d: webkit3d,
		gecko3d: gecko3d,
		opera3d: opera3d,
		any3d: any3d,

		mobile: mobile,
		mobileWebkit: mobile && webkit,
		mobileWebkit3d: mobile && webkit3d,
		mobileOpera: mobile && window.opera,

		touch: touch,
		msPointer: msPointer,
		pointer: pointer,

		retina: retina
	};

}());


/*
 * L.Point represents a point with x and y coordinates.
 */

L.Point = function (/*Number*/ x, /*Number*/ y, /*Boolean*/ round) {
	this.x = (round ? Math.round(x) : x);
	this.y = (round ? Math.round(y) : y);
};

L.Point.prototype = {

	clone: function () {
		return new L.Point(this.x, this.y);
	},

	// non-destructive, returns a new point
	add: function (point) {
		return this.clone()._add(L.point(point));
	},

	// destructive, used directly for performance in situations where it's safe to modify existing point
	_add: function (point) {
		this.x += point.x;
		this.y += point.y;
		return this;
	},

	subtract: function (point) {
		return this.clone()._subtract(L.point(point));
	},

	_subtract: function (point) {
		this.x -= point.x;
		this.y -= point.y;
		return this;
	},

	divideBy: function (num) {
		return this.clone()._divideBy(num);
	},

	_divideBy: function (num) {
		this.x /= num;
		this.y /= num;
		return this;
	},

	multiplyBy: function (num) {
		return this.clone()._multiplyBy(num);
	},

	_multiplyBy: function (num) {
		this.x *= num;
		this.y *= num;
		return this;
	},

	round: function () {
		return this.clone()._round();
	},

	_round: function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	},

	floor: function () {
		return this.clone()._floor();
	},

	_floor: function () {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	},

	distanceTo: function (point) {
		point = L.point(point);

		var x = point.x - this.x,
		    y = point.y - this.y;

		return Math.sqrt(x * x + y * y);
	},

	equals: function (point) {
		point = L.point(point);

		return point.x === this.x &&
		       point.y === this.y;
	},

	contains: function (point) {
		point = L.point(point);

		return Math.abs(point.x) <= Math.abs(this.x) &&
		       Math.abs(point.y) <= Math.abs(this.y);
	},

	toString: function () {
		return 'Point(' +
		        L.Util.formatNum(this.x) + ', ' +
		        L.Util.formatNum(this.y) + ')';
	}
};

L.point = function (x, y, round) {
	if (x instanceof L.Point) {
		return x;
	}
	if (L.Util.isArray(x)) {
		return new L.Point(x[0], x[1]);
	}
	if (x === undefined || x === null) {
		return x;
	}
	return new L.Point(x, y, round);
};


/*
 * L.Bounds represents a rectangular area on the screen in pixel coordinates.
 */

L.Bounds = function (a, b) { //(Point, Point) or Point[]
	if (!a) { return; }

	var points = b ? [a, b] : a;

	for (var i = 0, len = points.length; i < len; i++) {
		this.extend(points[i]);
	}
};

L.Bounds.prototype = {
	// extend the bounds to contain the given point
	extend: function (point) { // (Point)
		point = L.point(point);

		if (!this.min && !this.max) {
			this.min = point.clone();
			this.max = point.clone();
		} else {
			this.min.x = Math.min(point.x, this.min.x);
			this.max.x = Math.max(point.x, this.max.x);
			this.min.y = Math.min(point.y, this.min.y);
			this.max.y = Math.max(point.y, this.max.y);
		}
		return this;
	},

	getCenter: function (round) { // (Boolean) -> Point
		return new L.Point(
		        (this.min.x + this.max.x) / 2,
		        (this.min.y + this.max.y) / 2, round);
	},

	getBottomLeft: function () { // -> Point
		return new L.Point(this.min.x, this.max.y);
	},

	getTopRight: function () { // -> Point
		return new L.Point(this.max.x, this.min.y);
	},

	getSize: function () {
		return this.max.subtract(this.min);
	},

	contains: function (obj) { // (Bounds) or (Point) -> Boolean
		var min, max;

		if (typeof obj[0] === 'number' || obj instanceof L.Point) {
			obj = L.point(obj);
		} else {
			obj = L.bounds(obj);
		}

		if (obj instanceof L.Bounds) {
			min = obj.min;
			max = obj.max;
		} else {
			min = max = obj;
		}

		return (min.x >= this.min.x) &&
		       (max.x <= this.max.x) &&
		       (min.y >= this.min.y) &&
		       (max.y <= this.max.y);
	},

	intersects: function (bounds) { // (Bounds) -> Boolean
		bounds = L.bounds(bounds);

		var min = this.min,
		    max = this.max,
		    min2 = bounds.min,
		    max2 = bounds.max,
		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

		return xIntersects && yIntersects;
	},

	isValid: function () {
		return !!(this.min && this.max);
	}
};

L.bounds = function (a, b) { // (Bounds) or (Point, Point) or (Point[])
	if (!a || a instanceof L.Bounds) {
		return a;
	}
	return new L.Bounds(a, b);
};


/*
 * L.Transformation is an utility class to perform simple point transformations through a 2d-matrix.
 */

L.Transformation = function (a, b, c, d) {
	this._a = a;
	this._b = b;
	this._c = c;
	this._d = d;
};

L.Transformation.prototype = {
	transform: function (point, scale) { // (Point, Number) -> Point
		return this._transform(point.clone(), scale);
	},

	// destructive transform (faster)
	_transform: function (point, scale) {
		scale = scale || 1;
		point.x = scale * (this._a * point.x + this._b);
		point.y = scale * (this._c * point.y + this._d);
		return point;
	},

	untransform: function (point, scale) {
		scale = scale || 1;
		return new L.Point(
		        (point.x / scale - this._b) / this._a,
		        (point.y / scale - this._d) / this._c);
	}
};


/*
 * L.DomUtil contains various utility functions for working with DOM.
 */

L.DomUtil = {
	get: function (id) {
		return (typeof id === 'string' ? document.getElementById(id) : id);
	},

	getStyle: function (el, style) {

		var value = el.style[style];

		if (!value && el.currentStyle) {
			value = el.currentStyle[style];
		}

		if ((!value || value === 'auto') && document.defaultView) {
			var css = document.defaultView.getComputedStyle(el, null);
			value = css ? css[style] : null;
		}

		return value === 'auto' ? null : value;
	},

	getViewportOffset: function (element) {

		var top = 0,
		    left = 0,
		    el = element,
		    docBody = document.body,
		    docEl = document.documentElement,
		    pos;

		do {
			top  += el.offsetTop  || 0;
			left += el.offsetLeft || 0;

			//add borders
			top += parseInt(L.DomUtil.getStyle(el, 'borderTopWidth'), 10) || 0;
			left += parseInt(L.DomUtil.getStyle(el, 'borderLeftWidth'), 10) || 0;

			pos = L.DomUtil.getStyle(el, 'position');

			if (el.offsetParent === docBody && pos === 'absolute') { break; }

			if (pos === 'fixed') {
				top  += docBody.scrollTop  || docEl.scrollTop  || 0;
				left += docBody.scrollLeft || docEl.scrollLeft || 0;
				break;
			}

			if (pos === 'relative' && !el.offsetLeft) {
				var width = L.DomUtil.getStyle(el, 'width'),
				    maxWidth = L.DomUtil.getStyle(el, 'max-width'),
				    r = el.getBoundingClientRect();

				if (width !== 'none' || maxWidth !== 'none') {
					left += r.left + el.clientLeft;
				}

				//calculate full y offset since we're breaking out of the loop
				top += r.top + (docBody.scrollTop  || docEl.scrollTop  || 0);

				break;
			}

			el = el.offsetParent;

		} while (el);

		el = element;

		do {
			if (el === docBody) { break; }

			top  -= el.scrollTop  || 0;
			left -= el.scrollLeft || 0;

			el = el.parentNode;
		} while (el);

		return new L.Point(left, top);
	},

	documentIsLtr: function () {
		if (!L.DomUtil._docIsLtrCached) {
			L.DomUtil._docIsLtrCached = true;
			L.DomUtil._docIsLtr = L.DomUtil.getStyle(document.body, 'direction') === 'ltr';
		}
		return L.DomUtil._docIsLtr;
	},

	create: function (tagName, className, container) {

		var el = document.createElement(tagName);
		el.className = className;

		if (container) {
			container.appendChild(el);
		}

		return el;
	},

	hasClass: function (el, name) {
		if (el.classList !== undefined) {
			return el.classList.contains(name);
		}
		var className = L.DomUtil._getClass(el);
		return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
	},

	addClass: function (el, name) {
		if (el.classList !== undefined) {
			var classes = L.Util.splitWords(name);
			for (var i = 0, len = classes.length; i < len; i++) {
				el.classList.add(classes[i]);
			}
		} else if (!L.DomUtil.hasClass(el, name)) {
			var className = L.DomUtil._getClass(el);
			L.DomUtil._setClass(el, (className ? className + ' ' : '') + name);
		}
	},

	removeClass: function (el, name) {
		if (el.classList !== undefined) {
			el.classList.remove(name);
		} else {
			L.DomUtil._setClass(el, L.Util.trim((' ' + L.DomUtil._getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
		}
	},

	_setClass: function (el, name) {
		if (el.className.baseVal === undefined) {
			el.className = name;
		} else {
			// in case of SVG element
			el.className.baseVal = name;
		}
	},

	_getClass: function (el) {
		return el.className.baseVal === undefined ? el.className : el.className.baseVal;
	},

	setOpacity: function (el, value) {

		if ('opacity' in el.style) {
			el.style.opacity = value;

		} else if ('filter' in el.style) {

			var filter = false,
			    filterName = 'DXImageTransform.Microsoft.Alpha';

			// filters collection throws an error if we try to retrieve a filter that doesn't exist
			try {
				filter = el.filters.item(filterName);
			} catch (e) {
				// don't set opacity to 1 if we haven't already set an opacity,
				// it isn't needed and breaks transparent pngs.
				if (value === 1) { return; }
			}

			value = Math.round(value * 100);

			if (filter) {
				filter.Enabled = (value !== 100);
				filter.Opacity = value;
			} else {
				el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
			}
		}
	},

	testProp: function (props) {

		var style = document.documentElement.style;

		for (var i = 0; i < props.length; i++) {
			if (props[i] in style) {
				return props[i];
			}
		}
		return false;
	},

	getTranslateString: function (point) {
		// on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
		// makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
		// (same speed either way), Opera 12 doesn't support translate3d

		var is3d = L.Browser.webkit3d,
		    open = 'translate' + (is3d ? '3d' : '') + '(',
		    close = (is3d ? ',0' : '') + ')';

		return open + point.x + 'px,' + point.y + 'px' + close;
	},

	getScaleString: function (scale, origin) {

		var preTranslateStr = L.DomUtil.getTranslateString(origin.add(origin.multiplyBy(-1 * scale))),
		    scaleStr = ' scale(' + scale + ') ';

		return preTranslateStr + scaleStr;
	},

	setPosition: function (el, point, disable3D) { // (HTMLElement, Point[, Boolean])

		// jshint camelcase: false
		el._leaflet_pos = point;

		if (!disable3D && L.Browser.any3d) {
			el.style[L.DomUtil.TRANSFORM] =  L.DomUtil.getTranslateString(point);
		} else {
			el.style.left = point.x + 'px';
			el.style.top = point.y + 'px';
		}
	},

	getPosition: function (el) {
		// this method is only used for elements previously positioned using setPosition,
		// so it's safe to cache the position for performance

		// jshint camelcase: false
		return el._leaflet_pos;
	}
};


// prefix style property names

L.DomUtil.TRANSFORM = L.DomUtil.testProp(
        ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

// webkitTransition comes first because some browser versions that drop vendor prefix don't do
// the same for the transitionend event, in particular the Android 4.1 stock browser

L.DomUtil.TRANSITION = L.DomUtil.testProp(
        ['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

L.DomUtil.TRANSITION_END =
        L.DomUtil.TRANSITION === 'webkitTransition' || L.DomUtil.TRANSITION === 'OTransition' ?
        L.DomUtil.TRANSITION + 'End' : 'transitionend';

(function () {
    if ('onselectstart' in document) {
        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                L.DomEvent.on(window, 'selectstart', L.DomEvent.preventDefault);
            },

            enableTextSelection: function () {
                L.DomEvent.off(window, 'selectstart', L.DomEvent.preventDefault);
            }
        });
    } else {
        var userSelectProperty = L.DomUtil.testProp(
            ['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                if (userSelectProperty) {
                    var style = document.documentElement.style;
                    this._userSelect = style[userSelectProperty];
                    style[userSelectProperty] = 'none';
                }
            },

            enableTextSelection: function () {
                if (userSelectProperty) {
                    document.documentElement.style[userSelectProperty] = this._userSelect;
                    delete this._userSelect;
                }
            }
        });
    }

	L.extend(L.DomUtil, {
		disableImageDrag: function () {
			L.DomEvent.on(window, 'dragstart', L.DomEvent.preventDefault);
		},

		enableImageDrag: function () {
			L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);
		}
	});
})();


/*
 * L.LatLng represents a geographical point with latitude and longitude coordinates.
 */

L.LatLng = function (lat, lng, alt) { // (Number, Number, Number)
	lat = parseFloat(lat);
	lng = parseFloat(lng);

	if (isNaN(lat) || isNaN(lng)) {
		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	}

	this.lat = lat;
	this.lng = lng;

	if (alt !== undefined) {
		this.alt = parseFloat(alt);
	}
};

L.extend(L.LatLng, {
	DEG_TO_RAD: Math.PI / 180,
	RAD_TO_DEG: 180 / Math.PI,
	MAX_MARGIN: 1.0E-9 // max margin of error for the "equals" check
});

L.LatLng.prototype = {
	equals: function (obj) { // (LatLng) -> Boolean
		if (!obj) { return false; }

		obj = L.latLng(obj);

		var margin = Math.max(
		        Math.abs(this.lat - obj.lat),
		        Math.abs(this.lng - obj.lng));

		return margin <= L.LatLng.MAX_MARGIN;
	},

	toString: function (precision) { // (Number) -> String
		return 'LatLng(' +
		        L.Util.formatNum(this.lat, precision) + ', ' +
		        L.Util.formatNum(this.lng, precision) + ')';
	},

	// Haversine distance formula, see http://en.wikipedia.org/wiki/Haversine_formula
	// TODO move to projection code, LatLng shouldn't know about Earth
	distanceTo: function (other) { // (LatLng) -> Number
		other = L.latLng(other);

		var R = 6378137, // earth radius in meters
		    d2r = L.LatLng.DEG_TO_RAD,
		    dLat = (other.lat - this.lat) * d2r,
		    dLon = (other.lng - this.lng) * d2r,
		    lat1 = this.lat * d2r,
		    lat2 = other.lat * d2r,
		    sin1 = Math.sin(dLat / 2),
		    sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	},

	wrap: function (a, b) { // (Number, Number) -> LatLng
		var lng = this.lng;

		a = a || -180;
		b = b ||  180;

		lng = (lng + b) % (b - a) + (lng < a || lng === b ? b : a);

		return new L.LatLng(this.lat, lng);
	}
};

L.latLng = function (a, b) { // (LatLng) or ([Number, Number]) or (Number, Number)
	if (a instanceof L.LatLng) {
		return a;
	}
	if (L.Util.isArray(a)) {
		if (typeof a[0] === 'number' || typeof a[0] === 'string') {
			return new L.LatLng(a[0], a[1], a[2]);
		} else {
			return null;
		}
	}
	if (a === undefined || a === null) {
		return a;
	}
	if (typeof a === 'object' && 'lat' in a) {
		return new L.LatLng(a.lat, 'lng' in a ? a.lng : a.lon);
	}
	if (b === undefined) {
		return null;
	}
	return new L.LatLng(a, b);
};



/*
 * L.LatLngBounds represents a rectangular area on the map in geographical coordinates.
 */

L.LatLngBounds = function (southWest, northEast) { // (LatLng, LatLng) or (LatLng[])
	if (!southWest) { return; }

	var latlngs = northEast ? [southWest, northEast] : southWest;

	for (var i = 0, len = latlngs.length; i < len; i++) {
		this.extend(latlngs[i]);
	}
};

L.LatLngBounds.prototype = {
	// extend the bounds to contain the given point or bounds
	extend: function (obj) { // (LatLng) or (LatLngBounds)
		if (!obj) { return this; }

		var latLng = L.latLng(obj);
		if (latLng !== null) {
			obj = latLng;
		} else {
			obj = L.latLngBounds(obj);
		}

		if (obj instanceof L.LatLng) {
			if (!this._southWest && !this._northEast) {
				this._southWest = new L.LatLng(obj.lat, obj.lng);
				this._northEast = new L.LatLng(obj.lat, obj.lng);
			} else {
				this._southWest.lat = Math.min(obj.lat, this._southWest.lat);
				this._southWest.lng = Math.min(obj.lng, this._southWest.lng);

				this._northEast.lat = Math.max(obj.lat, this._northEast.lat);
				this._northEast.lng = Math.max(obj.lng, this._northEast.lng);
			}
		} else if (obj instanceof L.LatLngBounds) {
			this.extend(obj._southWest);
			this.extend(obj._northEast);
		}
		return this;
	},

	// extend the bounds by a percentage
	pad: function (bufferRatio) { // (Number) -> LatLngBounds
		var sw = this._southWest,
		    ne = this._northEast,
		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

		return new L.LatLngBounds(
		        new L.LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
		        new L.LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
	},

	getCenter: function () { // -> LatLng
		return new L.LatLng(
		        (this._southWest.lat + this._northEast.lat) / 2,
		        (this._southWest.lng + this._northEast.lng) / 2);
	},

	getSouthWest: function () {
		return this._southWest;
	},

	getNorthEast: function () {
		return this._northEast;
	},

	getNorthWest: function () {
		return new L.LatLng(this.getNorth(), this.getWest());
	},

	getSouthEast: function () {
		return new L.LatLng(this.getSouth(), this.getEast());
	},

	getWest: function () {
		return this._southWest.lng;
	},

	getSouth: function () {
		return this._southWest.lat;
	},

	getEast: function () {
		return this._northEast.lng;
	},

	getNorth: function () {
		return this._northEast.lat;
	},

	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
		if (typeof obj[0] === 'number' || obj instanceof L.LatLng) {
			obj = L.latLng(obj);
		} else {
			obj = L.latLngBounds(obj);
		}

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof L.LatLngBounds) {
			sw2 = obj.getSouthWest();
			ne2 = obj.getNorthEast();
		} else {
			sw2 = ne2 = obj;
		}

		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
	},

	intersects: function (bounds) { // (LatLngBounds)
		bounds = L.latLngBounds(bounds);

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.getSouthWest(),
		    ne2 = bounds.getNorthEast(),

		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

		return latIntersects && lngIntersects;
	},

	toBBoxString: function () {
		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
	},

	equals: function (bounds) { // (LatLngBounds)
		if (!bounds) { return false; }

		bounds = L.latLngBounds(bounds);

		return this._southWest.equals(bounds.getSouthWest()) &&
		       this._northEast.equals(bounds.getNorthEast());
	},

	isValid: function () {
		return !!(this._southWest && this._northEast);
	}
};

//TODO International date line?

L.latLngBounds = function (a, b) { // (LatLngBounds) or (LatLng, LatLng)
	if (!a || a instanceof L.LatLngBounds) {
		return a;
	}
	return new L.LatLngBounds(a, b);
};


/*
 * L.Projection contains various geographical projections used by CRS classes.
 */

L.Projection = {};


/*
 * Spherical Mercator is the most popular map projection, used by EPSG:3857 CRS used by default.
 */

L.Projection.SphericalMercator = {
	MAX_LATITUDE: 85.0511287798,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    x = latlng.lng * d,
		    y = lat * d;

		y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    lng = point.x * d,
		    lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;

		return new L.LatLng(lat, lng);
	}
};


/*
 * Simple equirectangular (Plate Carree) projection, used by CRS like EPSG:4326 and Simple.
 */

L.Projection.LonLat = {
	project: function (latlng) {
		return new L.Point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return new L.LatLng(point.y, point.x);
	}
};


/*
 * L.CRS is a base object for all defined CRS (Coordinate Reference Systems) in Leaflet.
 */

L.CRS = {
	latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
		var projectedPoint = this.projection.project(latlng),
		    scale = this.scale(zoom);

		return this.transformation._transform(projectedPoint, scale);
	},

	pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
		var scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);

		return this.projection.unproject(untransformedPoint);
	},

	project: function (latlng) {
		return this.projection.project(latlng);
	},

	scale: function (zoom) {
		return 256 * Math.pow(2, zoom);
	},

	getSize: function (zoom) {
		var s = this.scale(zoom);
		return L.point(s, s);
	}
};


/*
 * A simple CRS that can be used for flat non-Earth maps like panoramas or game maps.
 */

L.CRS.Simple = L.extend({}, L.CRS, {
	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1, 0, -1, 0),

	scale: function (zoom) {
		return Math.pow(2, zoom);
	}
});


/*
 * L.CRS.EPSG3857 (Spherical Mercator) is the most common CRS for web mapping
 * and is used by Leaflet by default.
 */

L.CRS.EPSG3857 = L.extend({}, L.CRS, {
	code: 'EPSG:3857',

	projection: L.Projection.SphericalMercator,
	transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),

	project: function (latlng) { // (LatLng) -> Point
		var projectedPoint = this.projection.project(latlng),
		    earthRadius = 6378137;
		return projectedPoint.multiplyBy(earthRadius);
	}
});

L.CRS.EPSG900913 = L.extend({}, L.CRS.EPSG3857, {
	code: 'EPSG:900913'
});


/*
 * L.CRS.EPSG4326 is a CRS popular among advanced GIS specialists.
 */

L.CRS.EPSG4326 = L.extend({}, L.CRS, {
	code: 'EPSG:4326',

	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1 / 360, 0.5, -1 / 360, 0.5)
});


/*
 * L.Map is the central class of the API - it is used to create a map.
 */

L.Map = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		crs: L.CRS.EPSG3857,

		/*
		center: LatLng,
		zoom: Number,
		layers: Array,
		*/

		fadeAnimation: L.DomUtil.TRANSITION && !L.Browser.android23,
		trackResize: true,
		markerZoomAnimation: L.DomUtil.TRANSITION && L.Browser.any3d
	},

	initialize: function (id, options) { // (HTMLElement or String, Object)
		options = L.setOptions(this, options);


		this._initContainer(id);
		this._initLayout();

		// hack for https://github.com/Leaflet/Leaflet/issues/1980
		this._onResize = L.bind(this._onResize, this);

		this._initEvents();

		if (options.maxBounds) {
			this.setMaxBounds(options.maxBounds);
		}

		if (options.center && options.zoom !== undefined) {
			this.setView(L.latLng(options.center), options.zoom, {reset: true});
		}

		this._handlers = [];

		this._layers = {};
		this._zoomBoundLayers = {};
		this._tileLayersNum = 0;

		this.callInitHooks();

		this._addLayers(options.layers);
	},


	// public methods that modify map state

	// replaced by animation-powered implementation in Map.PanAnimation.js
	setView: function (center, zoom) {
		zoom = zoom === undefined ? this.getZoom() : zoom;
		this._resetView(L.latLng(center), this._limitZoom(zoom));
		return this;
	},

	setZoom: function (zoom, options) {
		if (!this._loaded) {
			this._zoom = this._limitZoom(zoom);
			return this;
		}
		return this.setView(this.getCenter(), zoom, {zoom: options});
	},

	zoomIn: function (delta, options) {
		return this.setZoom(this._zoom + (delta || 1), options);
	},

	zoomOut: function (delta, options) {
		return this.setZoom(this._zoom - (delta || 1), options);
	},

	setZoomAround: function (latlng, zoom, options) {
		var scale = this.getZoomScale(zoom),
		    viewHalf = this.getSize().divideBy(2),
		    containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng),

		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

		return this.setView(newCenter, zoom, {zoom: options});
	},

	fitBounds: function (bounds, options) {

		options = options || {};
		bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);

		var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),

		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR)),
		    paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

		    swPoint = this.project(bounds.getSouthWest(), zoom),
		    nePoint = this.project(bounds.getNorthEast(), zoom),
		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

		zoom = options && options.maxZoom ? Math.min(options.maxZoom, zoom) : zoom;

		return this.setView(center, zoom, options);
	},

	fitWorld: function (options) {
		return this.fitBounds([[-90, -180], [90, 180]], options);
	},

	panTo: function (center, options) { // (LatLng)
		return this.setView(center, this._zoom, {pan: options});
	},

	panBy: function (offset) { // (Point)
		// replaced with animated panBy in Map.PanAnimation.js
		this.fire('movestart');

		this._rawPanBy(L.point(offset));

		this.fire('move');
		return this.fire('moveend');
	},

	setMaxBounds: function (bounds) {
		bounds = L.latLngBounds(bounds);

		this.options.maxBounds = bounds;

		if (!bounds) {
			return this.off('moveend', this._panInsideMaxBounds, this);
		}

		if (this._loaded) {
			this._panInsideMaxBounds();
		}

		return this.on('moveend', this._panInsideMaxBounds, this);
	},

	panInsideBounds: function (bounds, options) {
		var center = this.getCenter(),
			newCenter = this._limitCenter(center, this._zoom, bounds);

		if (center.equals(newCenter)) { return this; }

		return this.panTo(newCenter, options);
	},

	addLayer: function (layer) {
		// TODO method is too big, refactor

		var id = L.stamp(layer);

		if (this._layers[id]) { return this; }

		this._layers[id] = layer;

		// TODO getMaxZoom, getMinZoom in ILayer (instead of options)
		if (layer.options && (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom))) {
			this._zoomBoundLayers[id] = layer;
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor!!!
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum++;
			this._tileLayersToLoad++;
			layer.on('load', this._onTileLayerLoad, this);
		}

		if (this._loaded) {
			this._layerAdd(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);

		if (!this._layers[id]) { return this; }

		if (this._loaded) {
			layer.onRemove(this);
		}

		delete this._layers[id];

		if (this._loaded) {
			this.fire('layerremove', {layer: layer});
		}

		if (this._zoomBoundLayers[id]) {
			delete this._zoomBoundLayers[id];
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum--;
			this._tileLayersToLoad--;
			layer.off('load', this._onTileLayerLoad, this);
		}

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (L.stamp(layer) in this._layers);
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	invalidateSize: function (options) {
		if (!this._loaded) { return this; }

		options = L.extend({
			animate: false,
			pan: true
		}, options === true ? {animate: true} : options);

		var oldSize = this.getSize();
		this._sizeChanged = true;
		this._initialCenter = null;

		var newSize = this.getSize(),
		    oldCenter = oldSize.divideBy(2).round(),
		    newCenter = newSize.divideBy(2).round(),
		    offset = oldCenter.subtract(newCenter);

		if (!offset.x && !offset.y) { return this; }

		if (options.animate && options.pan) {
			this.panBy(offset);

		} else {
			if (options.pan) {
				this._rawPanBy(offset);
			}

			this.fire('move');

			if (options.debounceMoveend) {
				clearTimeout(this._sizeTimer);
				this._sizeTimer = setTimeout(L.bind(this.fire, this, 'moveend'), 200);
			} else {
				this.fire('moveend');
			}
		}

		return this.fire('resize', {
			oldSize: oldSize,
			newSize: newSize
		});
	},

	// TODO handler.addTo
	addHandler: function (name, HandlerClass) {
		if (!HandlerClass) { return this; }

		var handler = this[name] = new HandlerClass(this);

		this._handlers.push(handler);

		if (this.options[name]) {
			handler.enable();
		}

		return this;
	},

	remove: function () {
		if (this._loaded) {
			this.fire('unload');
		}

		this._initEvents('off');

		try {
			// throws error in IE6-8
			delete this._container._leaflet;
		} catch (e) {
			this._container._leaflet = undefined;
		}

		this._clearPanes();
		if (this._clearControlPos) {
			this._clearControlPos();
		}

		this._clearHandlers();

		return this;
	},


	// public methods for getting map state

	getCenter: function () { // (Boolean) -> LatLng
		this._checkIfLoaded();

		if (this._initialCenter && !this._moved()) {
			return this._initialCenter;
		}
		return this.layerPointToLatLng(this._getCenterLayerPoint());
	},

	getZoom: function () {
		return this._zoom;
	},

	getBounds: function () {
		var bounds = this.getPixelBounds(),
		    sw = this.unproject(bounds.getBottomLeft()),
		    ne = this.unproject(bounds.getTopRight());

		return new L.LatLngBounds(sw, ne);
	},

	getMinZoom: function () {
		return this.options.minZoom === undefined ?
			(this._layersMinZoom === undefined ? 0 : this._layersMinZoom) :
			this.options.minZoom;
	},

	getMaxZoom: function () {
		return this.options.maxZoom === undefined ?
			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
			this.options.maxZoom;
	},

	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
		bounds = L.latLngBounds(bounds);

		var zoom = this.getMinZoom() - (inside ? 1 : 0),
		    maxZoom = this.getMaxZoom(),
		    size = this.getSize(),

		    nw = bounds.getNorthWest(),
		    se = bounds.getSouthEast(),

		    zoomNotFound = true,
		    boundsSize;

		padding = L.point(padding || [0, 0]);

		do {
			zoom++;
			boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)).add(padding);
			zoomNotFound = !inside ? size.contains(boundsSize) : boundsSize.x < size.x || boundsSize.y < size.y;

		} while (zoomNotFound && zoom <= maxZoom);

		if (zoomNotFound && inside) {
			return null;
		}

		return inside ? zoom : zoom - 1;
	},

	getSize: function () {
		if (!this._size || this._sizeChanged) {
			this._size = new L.Point(
				this._container.clientWidth,
				this._container.clientHeight);

			this._sizeChanged = false;
		}
		return this._size.clone();
	},

	getPixelBounds: function () {
		var topLeftPoint = this._getTopLeftPoint();
		return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
	},

	getPixelOrigin: function () {
		this._checkIfLoaded();
		return this._initialTopLeftPoint;
	},

	getPanes: function () {
		return this._panes;
	},

	getContainer: function () {
		return this._container;
	},


	// TODO replace with universal implementation after refactoring projections

	getZoomScale: function (toZoom) {
		var crs = this.options.crs;
		return crs.scale(toZoom) / crs.scale(this._zoom);
	},

	getScaleZoom: function (scale) {
		return this._zoom + (Math.log(scale) / Math.LN2);
	},


	// conversion methods

	project: function (latlng, zoom) { // (LatLng[, Number]) -> Point
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.latLngToPoint(L.latLng(latlng), zoom);
	},

	unproject: function (point, zoom) { // (Point[, Number]) -> LatLng
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.pointToLatLng(L.point(point), zoom);
	},

	layerPointToLatLng: function (point) { // (Point)
		var projectedPoint = L.point(point).add(this.getPixelOrigin());
		return this.unproject(projectedPoint);
	},

	latLngToLayerPoint: function (latlng) { // (LatLng)
		var projectedPoint = this.project(L.latLng(latlng))._round();
		return projectedPoint._subtract(this.getPixelOrigin());
	},

	containerPointToLayerPoint: function (point) { // (Point)
		return L.point(point).subtract(this._getMapPanePos());
	},

	layerPointToContainerPoint: function (point) { // (Point)
		return L.point(point).add(this._getMapPanePos());
	},

	containerPointToLatLng: function (point) {
		var layerPoint = this.containerPointToLayerPoint(L.point(point));
		return this.layerPointToLatLng(layerPoint);
	},

	latLngToContainerPoint: function (latlng) {
		return this.layerPointToContainerPoint(this.latLngToLayerPoint(L.latLng(latlng)));
	},

	mouseEventToContainerPoint: function (e) { // (MouseEvent)
		return L.DomEvent.getMousePosition(e, this._container);
	},

	mouseEventToLayerPoint: function (e) { // (MouseEvent)
		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
	},

	mouseEventToLatLng: function (e) { // (MouseEvent)
		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
	},


	// map initialization methods

	_initContainer: function (id) {
		var container = this._container = L.DomUtil.get(id);

		if (!container) {
			throw new Error('Map container not found.');
		} else if (container._leaflet) {
			throw new Error('Map container is already initialized.');
		}

		container._leaflet = true;
	},

	_initLayout: function () {
		var container = this._container;

		L.DomUtil.addClass(container, 'leaflet-container' +
			(L.Browser.touch ? ' leaflet-touch' : '') +
			(L.Browser.retina ? ' leaflet-retina' : '') +
			(L.Browser.ielt9 ? ' leaflet-oldie' : '') +
			(this.options.fadeAnimation ? ' leaflet-fade-anim' : ''));

		var position = L.DomUtil.getStyle(container, 'position');

		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
			container.style.position = 'relative';
		}

		this._initPanes();

		if (this._initControlPos) {
			this._initControlPos();
		}
	},

	_initPanes: function () {
		var panes = this._panes = {};

		this._mapPane = panes.mapPane = this._createPane('leaflet-map-pane', this._container);

		this._tilePane = panes.tilePane = this._createPane('leaflet-tile-pane', this._mapPane);
		panes.objectsPane = this._createPane('leaflet-objects-pane', this._mapPane);
		panes.shadowPane = this._createPane('leaflet-shadow-pane');
		panes.overlayPane = this._createPane('leaflet-overlay-pane');
		panes.markerPane = this._createPane('leaflet-marker-pane');
		panes.popupPane = this._createPane('leaflet-popup-pane');

		var zoomHide = ' leaflet-zoom-hide';

		if (!this.options.markerZoomAnimation) {
			L.DomUtil.addClass(panes.markerPane, zoomHide);
			L.DomUtil.addClass(panes.shadowPane, zoomHide);
			L.DomUtil.addClass(panes.popupPane, zoomHide);
		}
	},

	_createPane: function (className, container) {
		return L.DomUtil.create('div', className, container || this._panes.objectsPane);
	},

	_clearPanes: function () {
		this._container.removeChild(this._mapPane);
	},

	_addLayers: function (layers) {
		layers = layers ? (L.Util.isArray(layers) ? layers : [layers]) : [];

		for (var i = 0, len = layers.length; i < len; i++) {
			this.addLayer(layers[i]);
		}
	},


	// private methods that modify map state

	_resetView: function (center, zoom, preserveMapOffset, afterZoomAnim) {

		var zoomChanged = (this._zoom !== zoom);

		if (!afterZoomAnim) {
			this.fire('movestart');

			if (zoomChanged) {
				this.fire('zoomstart');
			}
		}

		this._zoom = zoom;
		this._initialCenter = center;

		this._initialTopLeftPoint = this._getNewTopLeftPoint(center);

		if (!preserveMapOffset) {
			L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
		} else {
			this._initialTopLeftPoint._add(this._getMapPanePos());
		}

		this._tileLayersToLoad = this._tileLayersNum;

		var loading = !this._loaded;
		this._loaded = true;

		if (loading) {
			this.fire('load');
			this.eachLayer(this._layerAdd, this);
		}

		this.fire('viewreset', {hard: !preserveMapOffset});

		this.fire('move');

		if (zoomChanged || afterZoomAnim) {
			this.fire('zoomend');
		}

		this.fire('moveend', {hard: !preserveMapOffset});
	},

	_rawPanBy: function (offset) {
		L.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
	},

	_getZoomSpan: function () {
		return this.getMaxZoom() - this.getMinZoom();
	},

	_updateZoomLevels: function () {
		var i,
			minZoom = Infinity,
			maxZoom = -Infinity,
			oldZoomSpan = this._getZoomSpan();

		for (i in this._zoomBoundLayers) {
			var layer = this._zoomBoundLayers[i];
			if (!isNaN(layer.options.minZoom)) {
				minZoom = Math.min(minZoom, layer.options.minZoom);
			}
			if (!isNaN(layer.options.maxZoom)) {
				maxZoom = Math.max(maxZoom, layer.options.maxZoom);
			}
		}

		if (i === undefined) { // we have no tilelayers
			this._layersMaxZoom = this._layersMinZoom = undefined;
		} else {
			this._layersMaxZoom = maxZoom;
			this._layersMinZoom = minZoom;
		}

		if (oldZoomSpan !== this._getZoomSpan()) {
			this.fire('zoomlevelschange');
		}
	},

	_panInsideMaxBounds: function () {
		this.panInsideBounds(this.options.maxBounds);
	},

	_checkIfLoaded: function () {
		if (!this._loaded) {
			throw new Error('Set map center and zoom first.');
		}
	},

	// map events

	_initEvents: function (onOff) {
		if (!L.DomEvent) { return; }

		onOff = onOff || 'on';

		L.DomEvent[onOff](this._container, 'click', this._onMouseClick, this);

		var events = ['dblclick', 'mousedown', 'mouseup', 'mouseenter',
		              'mouseleave', 'mousemove', 'contextmenu'],
		    i, len;

		for (i = 0, len = events.length; i < len; i++) {
			L.DomEvent[onOff](this._container, events[i], this._fireMouseEvent, this);
		}

		if (this.options.trackResize) {
			L.DomEvent[onOff](window, 'resize', this._onResize, this);
		}
	},

	_onResize: function () {
		L.Util.cancelAnimFrame(this._resizeRequest);
		this._resizeRequest = L.Util.requestAnimFrame(
		        function () { this.invalidateSize({debounceMoveend: true}); }, this, false, this._container);
	},

	_onMouseClick: function (e) {
		if (!this._loaded || (!e._simulated &&
		        ((this.dragging && this.dragging.moved()) ||
		         (this.boxZoom  && this.boxZoom.moved()))) ||
		            L.DomEvent._skipped(e)) { return; }

		this.fire('preclick');
		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this._loaded || L.DomEvent._skipped(e)) { return; }

		var type = e.type;

		type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

		if (!this.hasEventListeners(type)) { return; }

		if (type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}

		var containerPoint = this.mouseEventToContainerPoint(e),
		    layerPoint = this.containerPointToLayerPoint(containerPoint),
		    latlng = this.layerPointToLatLng(layerPoint);

		this.fire(type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});
	},

	_onTileLayerLoad: function () {
		this._tileLayersToLoad--;
		if (this._tileLayersNum && !this._tileLayersToLoad) {
			this.fire('tilelayersload');
		}
	},

	_clearHandlers: function () {
		for (var i = 0, len = this._handlers.length; i < len; i++) {
			this._handlers[i].disable();
		}
	},

	whenReady: function (callback, context) {
		if (this._loaded) {
			callback.call(context || this, this);
		} else {
			this.on('load', callback, context);
		}
		return this;
	},

	_layerAdd: function (layer) {
		layer.onAdd(this);
		this.fire('layeradd', {layer: layer});
	},


	// private methods for getting map state

	_getMapPanePos: function () {
		return L.DomUtil.getPosition(this._mapPane);
	},

	_moved: function () {
		var pos = this._getMapPanePos();
		return pos && !pos.equals([0, 0]);
	},

	_getTopLeftPoint: function () {
		return this.getPixelOrigin().subtract(this._getMapPanePos());
	},

	_getNewTopLeftPoint: function (center, zoom) {
		var viewHalf = this.getSize()._divideBy(2);
		// TODO round on display, not calculation to increase precision?
		return this.project(center, zoom)._subtract(viewHalf)._round();
	},

	_latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
		var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
		return this.project(latlng, newZoom)._subtract(topLeft);
	},

	// layer point of the current center
	_getCenterLayerPoint: function () {
		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
	},

	// offset of the specified place to the current center in pixels
	_getCenterOffset: function (latlng) {
		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
	},

	// adjust center for view to get inside bounds
	_limitCenter: function (center, zoom, bounds) {

		if (!bounds) { return center; }

		var centerPoint = this.project(center, zoom),
		    viewHalf = this.getSize().divideBy(2),
		    viewBounds = new L.Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

		return this.unproject(centerPoint.add(offset), zoom);
	},

	// adjust offset for view to get inside bounds
	_limitOffset: function (offset, bounds) {
		if (!bounds) { return offset; }

		var viewBounds = this.getPixelBounds(),
		    newBounds = new L.Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

		return offset.add(this._getBoundsOffset(newBounds, bounds));
	},

	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
		var nwOffset = this.project(maxBounds.getNorthWest(), zoom).subtract(pxBounds.min),
		    seOffset = this.project(maxBounds.getSouthEast(), zoom).subtract(pxBounds.max),

		    dx = this._rebound(nwOffset.x, -seOffset.x),
		    dy = this._rebound(nwOffset.y, -seOffset.y);

		return new L.Point(dx, dy);
	},

	_rebound: function (left, right) {
		return left + right > 0 ?
			Math.round(left - right) / 2 :
			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
	},

	_limitZoom: function (zoom) {
		var min = this.getMinZoom(),
		    max = this.getMaxZoom();

		return Math.max(min, Math.min(max, zoom));
	}
});

L.map = function (id, options) {
	return new L.Map(id, options);
};


/*
 * Mercator projection that takes into account that the Earth is not a perfect sphere.
 * Less popular than spherical mercator; used by projections like EPSG:3395.
 */

L.Projection.Mercator = {
	MAX_LATITUDE: 85.0840591556,

	R_MINOR: 6356752.314245179,
	R_MAJOR: 6378137,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    x = latlng.lng * d * r,
		    y = lat * d,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1.0 - tmp * tmp),
		    con = eccent * Math.sin(y);

		con = Math.pow((1 - con) / (1 + con), eccent * 0.5);

		var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
		y = -r * Math.log(ts);

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    lng = point.x * d / r,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1 - (tmp * tmp)),
		    ts = Math.exp(- point.y / r),
		    phi = (Math.PI / 2) - 2 * Math.atan(ts),
		    numIter = 15,
		    tol = 1e-7,
		    i = numIter,
		    dphi = 0.1,
		    con;

		while ((Math.abs(dphi) > tol) && (--i > 0)) {
			con = eccent * Math.sin(phi);
			dphi = (Math.PI / 2) - 2 * Math.atan(ts *
			            Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
			phi += dphi;
		}

		return new L.LatLng(phi * d, lng);
	}
};



L.CRS.EPSG3395 = L.extend({}, L.CRS, {
	code: 'EPSG:3395',

	projection: L.Projection.Mercator,

	transformation: (function () {
		var m = L.Projection.Mercator,
		    r = m.R_MAJOR,
		    scale = 0.5 / (Math.PI * r);

		return new L.Transformation(scale, 0.5, -scale, 0.5);
	}())
});


/*
 * L.TileLayer is used for standard xyz-numbered tile layers.
 */

L.TileLayer = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		zoomOffset: 0,
		opacity: 1,
		/*
		maxNativeZoom: null,
		zIndex: null,
		tms: false,
		continuousWorld: false,
		noWrap: false,
		zoomReverse: false,
		detectRetina: false,
		reuseTiles: false,
		bounds: false,
		*/
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: L.Browser.mobile
	},

	initialize: function (url, options) {
		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			if (options.minZoom > 0) {
				options.minZoom--;
			}
			this.options.maxZoom--;
		}

		if (options.bounds) {
			options.bounds = L.latLngBounds(options.bounds);
		}

		this._url = url;

		var subdomains = this.options.subdomains;

		if (typeof subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
	},

	onAdd: function (map) {
		this._map = map;
		this._animated = map._zoomAnimated;

		// create a container div for tiles
		this._initContainer();

		// set up events
		map.on({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.on({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
			map.on('move', this._limitedUpdate, this);
		}

		this._reset();
		this._update();
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		this._container.parentNode.removeChild(this._container);

		map.off({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.off({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			map.off('move', this._limitedUpdate, this);
		}

		this._container = null;
		this._map = null;
	},

	bringToFront: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.appendChild(this._container);
			this._setAutoZIndex(pane, Math.max);
		}

		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.insertBefore(this._container, pane.firstChild);
			this._setAutoZIndex(pane, Math.min);
		}

		return this;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	getContainer: function () {
		return this._container;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	setZIndex: function (zIndex) {
		this.options.zIndex = zIndex;
		this._updateZIndex();

		return this;
	},

	setUrl: function (url, noRedraw) {
		this._url = url;

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}
		return this;
	},

	_updateZIndex: function () {
		if (this._container && this.options.zIndex !== undefined) {
			this._container.style.zIndex = this.options.zIndex;
		}
	},

	_setAutoZIndex: function (pane, compare) {

		var layers = pane.children,
		    edgeZIndex = -compare(Infinity, -Infinity), // -Infinity for max, Infinity for min
		    zIndex, i, len;

		for (i = 0, len = layers.length; i < len; i++) {

			if (layers[i] !== this._container) {
				zIndex = parseInt(layers[i].style.zIndex, 10);

				if (!isNaN(zIndex)) {
					edgeZIndex = compare(edgeZIndex, zIndex);
				}
			}
		}

		this.options.zIndex = this._container.style.zIndex =
		        (isFinite(edgeZIndex) ? edgeZIndex : 0) + compare(1, -1);
	},

	_updateOpacity: function () {
		var i,
		    tiles = this._tiles;

		if (L.Browser.ielt9) {
			for (i in tiles) {
				L.DomUtil.setOpacity(tiles[i], this.options.opacity);
			}
		} else {
			L.DomUtil.setOpacity(this._container, this.options.opacity);
		}
	},

	_initContainer: function () {
		var tilePane = this._map._panes.tilePane;

		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-layer');

			this._updateZIndex();

			if (this._animated) {
				var className = 'leaflet-tile-container';

				this._bgBuffer = L.DomUtil.create('div', className, this._container);
				this._tileContainer = L.DomUtil.create('div', className, this._container);

			} else {
				this._tileContainer = this._container;
			}

			tilePane.appendChild(this._container);

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}
	},

	_reset: function (e) {
		for (var key in this._tiles) {
			this.fire('tileunload', {tile: this._tiles[key]});
		}

		this._tiles = {};
		this._tilesToLoad = 0;

		if (this.options.reuseTiles) {
			this._unusedTiles = [];
		}

		this._tileContainer.innerHTML = '';

		if (this._animated && e && e.hard) {
			this._clearBgBuffer();
		}

		this._initContainer();
	},

	_getTileSize: function () {
		var map = this._map,
		    zoom = map.getZoom() + this.options.zoomOffset,
		    zoomN = this.options.maxNativeZoom,
		    tileSize = this.options.tileSize;

		if (zoomN && zoom > zoomN) {
			tileSize = Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN) * tileSize);
		}

		return tileSize;
	},

	_update: function () {

		if (!this._map) { return; }

		var map = this._map,
		    bounds = map.getPixelBounds(),
		    zoom = map.getZoom(),
		    tileSize = this._getTileSize();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var tileBounds = L.bounds(
		        bounds.min.divideBy(tileSize)._floor(),
		        bounds.max.divideBy(tileSize)._floor());

		this._addTilesFromCenterOut(tileBounds);

		if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
			this._removeOtherTiles(tileBounds);
		}
	},

	_addTilesFromCenterOut: function (bounds) {
		var queue = [],
		    center = bounds.getCenter();

		var j, i, point;

		for (j = bounds.min.y; j <= bounds.max.y; j++) {
			for (i = bounds.min.x; i <= bounds.max.x; i++) {
				point = new L.Point(i, j);

				if (this._tileShouldBeLoaded(point)) {
					queue.push(point);
				}
			}
		}

		var tilesToLoad = queue.length;

		if (tilesToLoad === 0) { return; }

		// load tiles in order of their distance to center
		queue.sort(function (a, b) {
			return a.distanceTo(center) - b.distanceTo(center);
		});

		var fragment = document.createDocumentFragment();

		// if its the first batch of tiles to load
		if (!this._tilesToLoad) {
			this.fire('loading');
		}

		this._tilesToLoad += tilesToLoad;

		for (i = 0; i < tilesToLoad; i++) {
			this._addTile(queue[i], fragment);
		}

		this._tileContainer.appendChild(fragment);
	},

	_tileShouldBeLoaded: function (tilePoint) {
		if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
			return false; // already loaded
		}

		var options = this.options;

		if (!options.continuousWorld) {
			var limit = this._getWrapTileNum();

			// don't load if exceeds world bounds
			if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) ||
				tilePoint.y < 0 || tilePoint.y >= limit.y) { return false; }
		}

		if (options.bounds) {
			var tileSize = options.tileSize,
			    nwPoint = tilePoint.multiplyBy(tileSize),
			    sePoint = nwPoint.add([tileSize, tileSize]),
			    nw = this._map.unproject(nwPoint),
			    se = this._map.unproject(sePoint);

			// TODO temporary hack, will be removed after refactoring projections
			// https://github.com/Leaflet/Leaflet/issues/1618
			if (!options.continuousWorld && !options.noWrap) {
				nw = nw.wrap();
				se = se.wrap();
			}

			if (!options.bounds.intersects([nw, se])) { return false; }
		}

		return true;
	},

	_removeOtherTiles: function (bounds) {
		var kArr, x, y, key;

		for (key in this._tiles) {
			kArr = key.split(':');
			x = parseInt(kArr[0], 10);
			y = parseInt(kArr[1], 10);

			// remove tile if it's out of bounds
			if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
				this._removeTile(key);
			}
		}
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];

		this.fire('tileunload', {tile: tile, url: tile.src});

		if (this.options.reuseTiles) {
			L.DomUtil.removeClass(tile, 'leaflet-tile-loaded');
			this._unusedTiles.push(tile);

		} else if (tile.parentNode === this._tileContainer) {
			this._tileContainer.removeChild(tile);
		}

		// for https://github.com/CloudMade/Leaflet/issues/137
		if (!L.Browser.android) {
			tile.onload = null;
			tile.src = L.Util.emptyImageUrl;
		}

		delete this._tiles[key];
	},

	_addTile: function (tilePoint, container) {
		var tilePos = this._getTilePos(tilePoint);

		// get unused tile - or create a new tile
		var tile = this._getTile();

		/*
		Chrome 20 layouts much faster with top/left (verify with timeline, frames)
		Android 4 browser has display issues with top/left and requires transform instead
		(other browsers don't currently care) - see debug/hacks/jitter.html for an example
		*/
		L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome);

		this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

		this._loadTile(tile, tilePoint);

		if (tile.parentNode !== this._tileContainer) {
			container.appendChild(tile);
		}
	},

	_getZoomForUrl: function () {

		var options = this.options,
		    zoom = this._map.getZoom();

		if (options.zoomReverse) {
			zoom = options.maxZoom - zoom;
		}

		zoom += options.zoomOffset;

		return options.maxNativeZoom ? Math.min(zoom, options.maxNativeZoom) : zoom;
	},

	_getTilePos: function (tilePoint) {
		var origin = this._map.getPixelOrigin(),
		    tileSize = this._getTileSize();

		return tilePoint.multiplyBy(tileSize).subtract(origin);
	},

	// image-specific code (override to implement e.g. Canvas or SVG tile layer)

	getTileUrl: function (tilePoint) {
		return L.Util.template(this._url, L.extend({
			s: this._getSubdomain(tilePoint),
			z: tilePoint.z,
			x: tilePoint.x,
			y: tilePoint.y
		}, this.options));
	},

	_getWrapTileNum: function () {
		var crs = this._map.options.crs,
		    size = crs.getSize(this._map.getZoom());
		return size.divideBy(this._getTileSize())._floor();
	},

	_adjustTilePoint: function (tilePoint) {

		var limit = this._getWrapTileNum();

		// wrap tile coordinates
		if (!this.options.continuousWorld && !this.options.noWrap) {
			tilePoint.x = ((tilePoint.x % limit.x) + limit.x) % limit.x;
		}

		if (this.options.tms) {
			tilePoint.y = limit.y - tilePoint.y - 1;
		}

		tilePoint.z = this._getZoomForUrl();
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	_getTile: function () {
		if (this.options.reuseTiles && this._unusedTiles.length > 0) {
			var tile = this._unusedTiles.pop();
			this._resetTile(tile);
			return tile;
		}
		return this._createTile();
	},

	// Override if data stored on a tile needs to be cleaned up before reuse
	_resetTile: function (/*tile*/) {},

	_createTile: function () {
		var tile = L.DomUtil.create('img', 'leaflet-tile');
		tile.style.width = tile.style.height = this._getTileSize() + 'px';
		tile.galleryimg = 'no';

		tile.onselectstart = tile.onmousemove = L.Util.falseFn;

		if (L.Browser.ielt9 && this.options.opacity !== undefined) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}
		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.mobileWebkit3d) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer  = this;
		tile.onload  = this._tileOnLoad;
		tile.onerror = this._tileOnError;

		this._adjustTilePoint(tilePoint);
		tile.src     = this.getTileUrl(tilePoint);

		this.fire('tileloadstart', {
			tile: tile,
			url: tile.src
		});
	},

	_tileLoaded: function () {
		this._tilesToLoad--;

		if (this._animated) {
			L.DomUtil.addClass(this._tileContainer, 'leaflet-zoom-animated');
		}

		if (!this._tilesToLoad) {
			this.fire('load');

			if (this._animated) {
				// clear scaled tiles after all new tiles are loaded (for performance)
				clearTimeout(this._clearBgBufferTimer);
				this._clearBgBufferTimer = setTimeout(L.bind(this._clearBgBuffer, this), 500);
			}
		}
	},

	_tileOnLoad: function () {
		var layer = this._layer;

		//Only if we are loading an actual image
		if (this.src !== L.Util.emptyImageUrl) {
			L.DomUtil.addClass(this, 'leaflet-tile-loaded');

			layer.fire('tileload', {
				tile: this,
				url: this.src
			});
		}

		layer._tileLoaded();
	},

	_tileOnError: function () {
		var layer = this._layer;

		layer.fire('tileerror', {
			tile: this,
			url: this.src
		});

		var newUrl = layer.options.errorTileUrl;
		if (newUrl) {
			this.src = newUrl;
		}

		layer._tileLoaded();
	}
});

L.tileLayer = function (url, options) {
	return new L.TileLayer(url, options);
};


/*
 * L.TileLayer.WMS is used for putting WMS tile layers on the map.
 */

L.TileLayer.WMS = L.TileLayer.extend({

	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'image/jpeg',
		transparent: false
	},

	initialize: function (url, options) { // (String, Object)

		this._url = url;

		var wmsParams = L.extend({}, this.defaultWmsParams),
		    tileSize = options.tileSize || this.options.tileSize;

		if (options.detectRetina && L.Browser.retina) {
			wmsParams.width = wmsParams.height = tileSize * 2;
		} else {
			wmsParams.width = wmsParams.height = tileSize;
		}

		for (var i in options) {
			// all keys that are not TileLayer options go to WMS params
			if (!this.options.hasOwnProperty(i) && i !== 'crs') {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;

		L.setOptions(this, options);
	},

	onAdd: function (map) {

		this._crs = this.options.crs || map.options.crs;

		this._wmsVersion = parseFloat(this.wmsParams.version);

		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
		this.wmsParams[projectionKey] = this._crs.code;

		L.TileLayer.prototype.onAdd.call(this, map);
	},

	getTileUrl: function (tilePoint) { // (Point, Number) -> String

		var map = this._map,
		    tileSize = this.options.tileSize,

		    nwPoint = tilePoint.multiplyBy(tileSize),
		    sePoint = nwPoint.add([tileSize, tileSize]),

		    nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)),
		    se = this._crs.project(map.unproject(sePoint, tilePoint.z)),
		    bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
		        [se.y, nw.x, nw.y, se.x].join(',') :
		        [nw.x, se.y, se.x, nw.y].join(','),

		    url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});

		return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
	},

	setParams: function (params, noRedraw) {

		L.extend(this.wmsParams, params);

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	}
});

L.tileLayer.wms = function (url, options) {
	return new L.TileLayer.WMS(url, options);
};


/*
 * L.TileLayer.Canvas is a class that you can use as a base for creating
 * dynamically drawn Canvas-based tile layers.
 */

L.TileLayer.Canvas = L.TileLayer.extend({
	options: {
		async: false
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}

		for (var i in this._tiles) {
			this._redrawTile(this._tiles[i]);
		}
		return this;
	},

	_redrawTile: function (tile) {
		this.drawTile(tile, tile._tilePoint, this._map._zoom);
	},

	_createTile: function () {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		tile.width = tile.height = this.options.tileSize;
		tile.onselectstart = tile.onmousemove = L.Util.falseFn;
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer = this;
		tile._tilePoint = tilePoint;

		this._redrawTile(tile);

		if (!this.options.async) {
			this.tileDrawn(tile);
		}
	},

	drawTile: function (/*tile, tilePoint*/) {
		// override with rendering code
	},

	tileDrawn: function (tile) {
		this._tileOnLoad.call(tile);
	}
});


L.tileLayer.canvas = function (options) {
	return new L.TileLayer.Canvas(options);
};


/*
 * L.ImageOverlay is used to overlay images over the map (to specific geographical bounds).
 */

L.ImageOverlay = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		opacity: 1
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = L.latLngBounds(bounds);

		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._image) {
			this._initImage();
		}

		map._panes.overlayPane.appendChild(this._image);

		map.on('viewreset', this._reset, this);

		if (map.options.zoomAnimation && L.Browser.any3d) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._reset();
	},

	onRemove: function (map) {
		map.getPanes().overlayPane.removeChild(this._image);

		map.off('viewreset', this._reset, this);

		if (map.options.zoomAnimation) {
			map.off('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		this._updateOpacity();
		return this;
	},

	// TODO remove bringToFront/bringToBack duplication from TileLayer/Path
	bringToFront: function () {
		if (this._image) {
			this._map._panes.overlayPane.appendChild(this._image);
		}
		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.overlayPane;
		if (this._image) {
			pane.insertBefore(this._image, pane.firstChild);
		}
		return this;
	},

	setUrl: function (url) {
		this._url = url;
		this._image.src = this._url;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	_initImage: function () {
		this._image = L.DomUtil.create('img', 'leaflet-image-layer');

		if (this._map.options.zoomAnimation && L.Browser.any3d) {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
		} else {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
		}

		this._updateOpacity();

		//TODO createImage util method to remove duplication
		L.extend(this._image, {
			galleryimg: 'no',
			onselectstart: L.Util.falseFn,
			onmousemove: L.Util.falseFn,
			onload: L.bind(this._onImageLoad, this),
			src: this._url
		});
	},

	_animateZoom: function (e) {
		var map = this._map,
		    image = this._image,
		    scale = map.getZoomScale(e.zoom),
		    nw = this._bounds.getNorthWest(),
		    se = this._bounds.getSouthEast(),

		    topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center),
		    size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft),
		    origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));

		image.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';
	},

	_reset: function () {
		var image   = this._image,
		    topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		    size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);

		L.DomUtil.setPosition(image, topLeft);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_onImageLoad: function () {
		this.fire('load');
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	}
});

L.imageOverlay = function (url, bounds, options) {
	return new L.ImageOverlay(url, bounds, options);
};


/*
 * L.Icon is an image-based icon class that you can use with L.Marker for custom markers.
 */

L.Icon = L.Class.extend({
	options: {
		/*
		iconUrl: (String) (required)
		iconRetinaUrl: (String) (optional, used for retina devices if detected)
		iconSize: (Point) (can be set through CSS)
		iconAnchor: (Point) (centered by default, can be set in CSS with negative margins)
		popupAnchor: (Point) (if not specified, popup opens in the anchor point)
		shadowUrl: (String) (no shadow by default)
		shadowRetinaUrl: (String) (optional, used for retina devices if detected)
		shadowSize: (Point)
		shadowAnchor: (Point)
		*/
		className: ''
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	createIcon: function (oldIcon) {
		return this._createIcon('icon', oldIcon);
	},

	createShadow: function (oldIcon) {
		return this._createIcon('shadow', oldIcon);
	},

	_createIcon: function (name, oldIcon) {
		var src = this._getIconUrl(name);

		if (!src) {
			if (name === 'icon') {
				throw new Error('iconUrl not set in Icon options (see the docs).');
			}
			return null;
		}

		var img;
		if (!oldIcon || oldIcon.tagName !== 'IMG') {
			img = this._createImg(src);
		} else {
			img = this._createImg(src, oldIcon);
		}
		this._setIconStyles(img, name);

		return img;
	},

	_setIconStyles: function (img, name) {
		var options = this.options,
		    size = L.point(options[name + 'Size']),
		    anchor;

		if (name === 'shadow') {
			anchor = L.point(options.shadowAnchor || options.iconAnchor);
		} else {
			anchor = L.point(options.iconAnchor);
		}

		if (!anchor && size) {
			anchor = size.divideBy(2, true);
		}

		img.className = 'leaflet-marker-' + name + ' ' + options.className;

		if (anchor) {
			img.style.marginLeft = (-anchor.x) + 'px';
			img.style.marginTop  = (-anchor.y) + 'px';
		}

		if (size) {
			img.style.width  = size.x + 'px';
			img.style.height = size.y + 'px';
		}
	},

	_createImg: function (src, el) {
		el = el || document.createElement('img');
		el.src = src;
		return el;
	},

	_getIconUrl: function (name) {
		if (L.Browser.retina && this.options[name + 'RetinaUrl']) {
			return this.options[name + 'RetinaUrl'];
		}
		return this.options[name + 'Url'];
	}
});

L.icon = function (options) {
	return new L.Icon(options);
};


/*
 * L.Icon.Default is the blue marker icon used by default in Leaflet.
 */

L.Icon.Default = L.Icon.extend({

	options: {
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],

		shadowSize: [41, 41]
	},

	_getIconUrl: function (name) {
		var key = name + 'Url';

		if (this.options[key]) {
			return this.options[key];
		}

		if (L.Browser.retina && name === 'icon') {
			name += '-2x';
		}

		var path = L.Icon.Default.imagePath;

		if (!path) {
			throw new Error('Couldn\'t autodetect L.Icon.Default.imagePath, set it manually.');
		}

		return path + '/marker-' + name + '.png';
	}
});

L.Icon.Default.imagePath = (function () {
	var scripts = document.getElementsByTagName('script'),
	    leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;

	var i, len, src, matches, path;

	for (i = 0, len = scripts.length; i < len; i++) {
		src = scripts[i].src;
		matches = src.match(leafletRe);

		if (matches) {
			path = src.split(leafletRe)[0];
			return (path ? path + '/' : '') + 'images';
		}
	}
}());


/*
 * L.Marker is used to display clickable/draggable icons on the map.
 */

L.Marker = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		icon: new L.Icon.Default(),
		title: '',
		alt: '',
		clickable: true,
		draggable: false,
		keyboard: true,
		zIndexOffset: 0,
		opacity: 1,
		riseOnHover: false,
		riseOffset: 250
	},

	initialize: function (latlng, options) {
		L.setOptions(this, options);
		this._latlng = L.latLng(latlng);
	},

	onAdd: function (map) {
		this._map = map;

		map.on('viewreset', this.update, this);

		this._initIcon();
		this.update();
		this.fire('add');

		if (map.options.zoomAnimation && map.options.markerZoomAnimation) {
			map.on('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		if (this.dragging) {
			this.dragging.disable();
		}

		this._removeIcon();
		this._removeShadow();

		this.fire('remove');

		map.off({
			'viewreset': this.update,
			'zoomanim': this._animateZoom
		}, this);

		this._map = null;
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);

		this.update();

		return this.fire('move', { latlng: this._latlng });
	},

	setZIndexOffset: function (offset) {
		this.options.zIndexOffset = offset;
		this.update();

		return this;
	},

	setIcon: function (icon) {

		this.options.icon = icon;

		if (this._map) {
			this._initIcon();
			this.update();
		}

		if (this._popup) {
			this.bindPopup(this._popup);
		}

		return this;
	},

	update: function () {
		if (this._icon) {
			var pos = this._map.latLngToLayerPoint(this._latlng).round();
			this._setPos(pos);
		}

		return this;
	},

	_initIcon: function () {
		var options = this.options,
		    map = this._map,
		    animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
		    classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';

		var icon = options.icon.createIcon(this._icon),
			addIcon = false;

		// if we're not reusing the icon, remove the old one and init new one
		if (icon !== this._icon) {
			if (this._icon) {
				this._removeIcon();
			}
			addIcon = true;

			if (options.title) {
				icon.title = options.title;
			}
			
			if (options.alt) {
				icon.alt = options.alt;
			}
		}

		L.DomUtil.addClass(icon, classToAdd);

		if (options.keyboard) {
			icon.tabIndex = '0';
		}

		this._icon = icon;

		this._initInteraction();

		if (options.riseOnHover) {
			L.DomEvent
				.on(icon, 'mouseover', this._bringToFront, this)
				.on(icon, 'mouseout', this._resetZIndex, this);
		}

		var newShadow = options.icon.createShadow(this._shadow),
			addShadow = false;

		if (newShadow !== this._shadow) {
			this._removeShadow();
			addShadow = true;
		}

		if (newShadow) {
			L.DomUtil.addClass(newShadow, classToAdd);
		}
		this._shadow = newShadow;


		if (options.opacity < 1) {
			this._updateOpacity();
		}


		var panes = this._map._panes;

		if (addIcon) {
			panes.markerPane.appendChild(this._icon);
		}

		if (newShadow && addShadow) {
			panes.shadowPane.appendChild(this._shadow);
		}
	},

	_removeIcon: function () {
		if (this.options.riseOnHover) {
			L.DomEvent
			    .off(this._icon, 'mouseover', this._bringToFront)
			    .off(this._icon, 'mouseout', this._resetZIndex);
		}

		this._map._panes.markerPane.removeChild(this._icon);

		this._icon = null;
	},

	_removeShadow: function () {
		if (this._shadow) {
			this._map._panes.shadowPane.removeChild(this._shadow);
		}
		this._shadow = null;
	},

	_setPos: function (pos) {
		L.DomUtil.setPosition(this._icon, pos);

		if (this._shadow) {
			L.DomUtil.setPosition(this._shadow, pos);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	},

	_updateZIndex: function (offset) {
		this._icon.style.zIndex = this._zIndex + offset;
	},

	_animateZoom: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	_initInteraction: function () {

		if (!this.options.clickable) { return; }

		// TODO refactor into something shared with Map/Path/etc. to DRY it up

		var icon = this._icon,
		    events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.addClass(icon, 'leaflet-clickable');
		L.DomEvent.on(icon, 'click', this._onMouseClick, this);
		L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
		}

		if (L.Handler.MarkerDrag) {
			this.dragging = new L.Handler.MarkerDrag(this);

			if (this.options.draggable) {
				this.dragging.enable();
			}
		}
	},

	_onMouseClick: function (e) {
		var wasDragged = this.dragging && this.dragging.moved();

		if (this.hasEventListeners(e.type) || wasDragged) {
			L.DomEvent.stopPropagation(e);
		}

		if (wasDragged) { return; }

		if ((!this.dragging || !this.dragging._enabled) && this._map.dragging && this._map.dragging.moved()) { return; }

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});
	},

	_onKeyPress: function (e) {
		if (e.keyCode === 13) {
			this.fire('click', {
				originalEvent: e,
				latlng: this._latlng
			});
		}
	},

	_fireMouseEvent: function (e) {

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});

		// TODO proper custom event propagation
		// this line will always be called if marker is in a FeatureGroup
		if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousedown') {
			L.DomEvent.stopPropagation(e);
		} else {
			L.DomEvent.preventDefault(e);
		}
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._icon, this.options.opacity);
		if (this._shadow) {
			L.DomUtil.setOpacity(this._shadow, this.options.opacity);
		}
	},

	_bringToFront: function () {
		this._updateZIndex(this.options.riseOffset);
	},

	_resetZIndex: function () {
		this._updateZIndex(0);
	}
});

L.marker = function (latlng, options) {
	return new L.Marker(latlng, options);
};


/*
 * L.DivIcon is a lightweight HTML-based icon class (as opposed to the image-based L.Icon)
 * to use with L.Marker.
 */

L.DivIcon = L.Icon.extend({
	options: {
		iconSize: [12, 12], // also can be set through CSS
		/*
		iconAnchor: (Point)
		popupAnchor: (Point)
		html: (String)
		bgPos: (Point)
		*/
		className: 'leaflet-div-icon',
		html: false
	},

	createIcon: function (oldIcon) {
		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;

		if (options.html !== false) {
			div.innerHTML = options.html;
		} else {
			div.innerHTML = '';
		}

		if (options.bgPos) {
			div.style.backgroundPosition =
			        (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
		}

		this._setIconStyles(div, 'icon');
		return div;
	},

	createShadow: function () {
		return null;
	}
});

L.divIcon = function (options) {
	return new L.DivIcon(options);
};


/*
 * L.Popup is used for displaying popups on the map.
 */

L.Map.mergeOptions({
	closePopupOnClick: true
});

L.Popup = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minWidth: 50,
		maxWidth: 300,
		// maxHeight: null,
		autoPan: true,
		closeButton: true,
		offset: [0, 7],
		autoPanPadding: [5, 5],
		// autoPanPaddingTopLeft: null,
		// autoPanPaddingBottomRight: null,
		keepInView: false,
		className: '',
		zoomAnimation: true
	},

	initialize: function (options, source) {
		L.setOptions(this, options);

		this._source = source;
		this._animated = L.Browser.any3d && this.options.zoomAnimation;
		this._isOpen = false;
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initLayout();
		}

		var animFade = map.options.fadeAnimation;

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 0);
		}
		map._panes.popupPane.appendChild(this._container);

		map.on(this._getEvents(), this);

		this.update();

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 1);
		}

		this.fire('open');

		map.fire('popupopen', {popup: this});

		if (this._source) {
			this._source.fire('popupopen', {popup: this});
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	openOn: function (map) {
		map.openPopup(this);
		return this;
	},

	onRemove: function (map) {
		map._panes.popupPane.removeChild(this._container);

		L.Util.falseFn(this._container.offsetWidth); // force reflow

		map.off(this._getEvents(), this);

		if (map.options.fadeAnimation) {
			L.DomUtil.setOpacity(this._container, 0);
		}

		this._map = null;

		this.fire('close');

		map.fire('popupclose', {popup: this});

		if (this._source) {
			this._source.fire('popupclose', {popup: this});
		}
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		if (this._map) {
			this._updatePosition();
			this._adjustPan();
		}
		return this;
	},

	getContent: function () {
		return this._content;
	},

	setContent: function (content) {
		this._content = content;
		this.update();
		return this;
	},

	update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updateLayout();
		this._updatePosition();

		this._container.style.visibility = '';

		this._adjustPan();
	},

	_getEvents: function () {
		var events = {
			viewreset: this._updatePosition
		};

		if (this._animated) {
			events.zoomanim = this._zoomAnimation;
		}
		if ('closeOnClick' in this.options ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
			events.preclick = this._close;
		}
		if (this.options.keepInView) {
			events.moveend = this._adjustPan;
		}

		return events;
	},

	_close: function () {
		if (this._map) {
			this._map.closePopup(this);
		}
	},

	_initLayout: function () {
		var prefix = 'leaflet-popup',
			containerClass = prefix + ' ' + this.options.className + ' leaflet-zoom-' +
			        (this._animated ? 'animated' : 'hide'),
			container = this._container = L.DomUtil.create('div', containerClass),
			closeButton;

		if (this.options.closeButton) {
			closeButton = this._closeButton =
			        L.DomUtil.create('a', prefix + '-close-button', container);
			closeButton.href = '#close';
			closeButton.innerHTML = '&#215;';
			L.DomEvent.disableClickPropagation(closeButton);

			L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
		}

		var wrapper = this._wrapper =
		        L.DomUtil.create('div', prefix + '-content-wrapper', container);
		L.DomEvent.disableClickPropagation(wrapper);

		this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

		L.DomEvent.disableScrollPropagation(this._contentNode);
		L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

		this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
		this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
	},

	_updateContent: function () {
		if (!this._content) { return; }

		if (typeof this._content === 'string') {
			this._contentNode.innerHTML = this._content;
		} else {
			while (this._contentNode.hasChildNodes()) {
				this._contentNode.removeChild(this._contentNode.firstChild);
			}
			this._contentNode.appendChild(this._content);
		}
		this.fire('contentupdate');
	},

	_updateLayout: function () {
		var container = this._contentNode,
		    style = container.style;

		style.width = '';
		style.whiteSpace = 'nowrap';

		var width = container.offsetWidth;
		width = Math.min(width, this.options.maxWidth);
		width = Math.max(width, this.options.minWidth);

		style.width = (width + 1) + 'px';
		style.whiteSpace = '';

		style.height = '';

		var height = container.offsetHeight,
		    maxHeight = this.options.maxHeight,
		    scrolledClass = 'leaflet-popup-scrolled';

		if (maxHeight && height > maxHeight) {
			style.height = maxHeight + 'px';
			L.DomUtil.addClass(container, scrolledClass);
		} else {
			L.DomUtil.removeClass(container, scrolledClass);
		}

		this._containerWidth = this._container.offsetWidth;
	},

	_updatePosition: function () {
		if (!this._map) { return; }

		var pos = this._map.latLngToLayerPoint(this._latlng),
		    animated = this._animated,
		    offset = L.point(this.options.offset);

		if (animated) {
			L.DomUtil.setPosition(this._container, pos);
		}

		this._containerBottom = -offset.y - (animated ? 0 : pos.y);
		this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (animated ? 0 : pos.x);

		// bottom position the popup in case the height of the popup changes (images loading etc)
		this._container.style.bottom = this._containerBottom + 'px';
		this._container.style.left = this._containerLeft + 'px';
	},

	_zoomAnimation: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center);

		L.DomUtil.setPosition(this._container, pos);
	},

	_adjustPan: function () {
		if (!this.options.autoPan) { return; }

		var map = this._map,
		    containerHeight = this._container.offsetHeight,
		    containerWidth = this._containerWidth,

		    layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);

		if (this._animated) {
			layerPos._add(L.DomUtil.getPosition(this._container));
		}

		var containerPos = map.layerPointToContainerPoint(layerPos),
		    padding = L.point(this.options.autoPanPadding),
		    paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
		    paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
		    size = map.getSize(),
		    dx = 0,
		    dy = 0;

		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
		}
		if (containerPos.x - dx - paddingTL.x < 0) { // left
			dx = containerPos.x - paddingTL.x;
		}
		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
		}
		if (containerPos.y - dy - paddingTL.y < 0) { // top
			dy = containerPos.y - paddingTL.y;
		}

		if (dx || dy) {
			map
			    .fire('autopanstart')
			    .panBy([dx, dy]);
		}
	},

	_onCloseButtonClick: function (e) {
		this._close();
		L.DomEvent.stop(e);
	}
});

L.popup = function (options, source) {
	return new L.Popup(options, source);
};


L.Map.include({
	openPopup: function (popup, latlng, options) { // (Popup) or (String || HTMLElement, LatLng[, Object])
		this.closePopup();

		if (!(popup instanceof L.Popup)) {
			var content = popup;

			popup = new L.Popup(options)
			    .setLatLng(latlng)
			    .setContent(content);
		}
		popup._isOpen = true;

		this._popup = popup;
		return this.addLayer(popup);
	},

	closePopup: function (popup) {
		if (!popup || popup === this._popup) {
			popup = this._popup;
			this._popup = null;
		}
		if (popup) {
			this.removeLayer(popup);
			popup._isOpen = false;
		}
		return this;
	}
});


/*
 * Popup extension to L.Marker, adding popup-related methods.
 */

L.Marker.include({
	openPopup: function () {
		if (this._popup && this._map && !this._map.hasLayer(this._popup)) {
			this._popup.setLatLng(this._latlng);
			this._map.openPopup(this._popup);
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	togglePopup: function () {
		if (this._popup) {
			if (this._popup._isOpen) {
				this.closePopup();
			} else {
				this.openPopup();
			}
		}
		return this;
	},

	bindPopup: function (content, options) {
		var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);

		anchor = anchor.add(L.Popup.prototype.options.offset);

		if (options && options.offset) {
			anchor = anchor.add(options.offset);
		}

		options = L.extend({offset: anchor}, options);

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this.togglePopup, this)
			    .on('remove', this.closePopup, this)
			    .on('move', this._movePopup, this);
			this._popupHandlersAdded = true;
		}

		if (content instanceof L.Popup) {
			L.setOptions(content, options);
			this._popup = content;
		} else {
			this._popup = new L.Popup(options, this)
				.setContent(content);
		}

		return this;
	},

	setPopupContent: function (content) {
		if (this._popup) {
			this._popup.setContent(content);
		}
		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this.togglePopup, this)
			    .off('remove', this.closePopup, this)
			    .off('move', this._movePopup, this);
			this._popupHandlersAdded = false;
		}
		return this;
	},

	getPopup: function () {
		return this._popup;
	},

	_movePopup: function (e) {
		this._popup.setLatLng(e.latlng);
	}
});


/*
 * L.LayerGroup is a class to combine several layers into one so that
 * you can manipulate the group (e.g. add/remove it) as one layer.
 */

L.LayerGroup = L.Class.extend({
	initialize: function (layers) {
		this._layers = {};

		var i, len;

		if (layers) {
			for (i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		}
	},

	addLayer: function (layer) {
		var id = this.getLayerId(layer);

		this._layers[id] = layer;

		if (this._map) {
			this._map.addLayer(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = layer in this._layers ? layer : this.getLayerId(layer);

		if (this._map && this._layers[id]) {
			this._map.removeLayer(this._layers[id]);
		}

		delete this._layers[id];

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (layer in this._layers || this.getLayerId(layer) in this._layers);
	},

	clearLayers: function () {
		this.eachLayer(this.removeLayer, this);
		return this;
	},

	invoke: function (methodName) {
		var args = Array.prototype.slice.call(arguments, 1),
		    i, layer;

		for (i in this._layers) {
			layer = this._layers[i];

			if (layer[methodName]) {
				layer[methodName].apply(layer, args);
			}
		}

		return this;
	},

	onAdd: function (map) {
		this._map = map;
		this.eachLayer(map.addLayer, map);
	},

	onRemove: function (map) {
		this.eachLayer(map.removeLayer, map);
		this._map = null;
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	getLayer: function (id) {
		return this._layers[id];
	},

	getLayers: function () {
		var layers = [];

		for (var i in this._layers) {
			layers.push(this._layers[i]);
		}
		return layers;
	},

	setZIndex: function (zIndex) {
		return this.invoke('setZIndex', zIndex);
	},

	getLayerId: function (layer) {
		return L.stamp(layer);
	}
});

L.layerGroup = function (layers) {
	return new L.LayerGroup(layers);
};


/*
 * L.FeatureGroup extends L.LayerGroup by introducing mouse events and additional methods
 * shared between a group of interactive layers (like vectors or markers).
 */

L.FeatureGroup = L.LayerGroup.extend({
	includes: L.Mixin.Events,

	statics: {
		EVENTS: 'click dblclick mouseover mouseout mousemove contextmenu popupopen popupclose'
	},

	addLayer: function (layer) {
		if (this.hasLayer(layer)) {
			return this;
		}

		if ('on' in layer) {
			layer.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);
		}

		L.LayerGroup.prototype.addLayer.call(this, layer);

		if (this._popupContent && layer.bindPopup) {
			layer.bindPopup(this._popupContent, this._popupOptions);
		}

		return this.fire('layeradd', {layer: layer});
	},

	removeLayer: function (layer) {
		if (!this.hasLayer(layer)) {
			return this;
		}
		if (layer in this._layers) {
			layer = this._layers[layer];
		}

		layer.off(L.FeatureGroup.EVENTS, this._propagateEvent, this);

		L.LayerGroup.prototype.removeLayer.call(this, layer);

		if (this._popupContent) {
			this.invoke('unbindPopup');
		}

		return this.fire('layerremove', {layer: layer});
	},

	bindPopup: function (content, options) {
		this._popupContent = content;
		this._popupOptions = options;
		return this.invoke('bindPopup', content, options);
	},

	openPopup: function (latlng) {
		// open popup on the first layer
		for (var id in this._layers) {
			this._layers[id].openPopup(latlng);
			break;
		}
		return this;
	},

	setStyle: function (style) {
		return this.invoke('setStyle', style);
	},

	bringToFront: function () {
		return this.invoke('bringToFront');
	},

	bringToBack: function () {
		return this.invoke('bringToBack');
	},

	getBounds: function () {
		var bounds = new L.LatLngBounds();

		this.eachLayer(function (layer) {
			bounds.extend(layer instanceof L.Marker ? layer.getLatLng() : layer.getBounds());
		});

		return bounds;
	},

	_propagateEvent: function (e) {
		e = L.extend({
			layer: e.target,
			target: this
		}, e);
		this.fire(e.type, e);
	}
});

L.featureGroup = function (layers) {
	return new L.FeatureGroup(layers);
};


/*
 * L.Path is a base class for rendering vector paths on a map. Inherited by Polyline, Circle, etc.
 */

L.Path = L.Class.extend({
	includes: [L.Mixin.Events],

	statics: {
		// how much to extend the clip area around the map view
		// (relative to its size, e.g. 0.5 is half the screen in each direction)
		// set it so that SVG element doesn't exceed 1280px (vectors flicker on dragend if it is)
		CLIP_PADDING: (function () {
			var max = L.Browser.mobile ? 1280 : 2000,
			    target = (max / Math.max(window.outerWidth, window.outerHeight) - 1) / 2;
			return Math.max(0, Math.min(0.5, target));
		})()
	},

	options: {
		stroke: true,
		color: '#0033ff',
		dashArray: null,
		lineCap: null,
		lineJoin: null,
		weight: 5,
		opacity: 0.5,

		fill: false,
		fillColor: null, //same as color by default
		fillOpacity: 0.2,

		clickable: true
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initElements();
			this._initEvents();
		}

		this.projectLatlngs();
		this._updatePath();

		if (this._container) {
			this._map._pathRoot.appendChild(this._container);
		}

		this.fire('add');

		map.on({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		map._pathRoot.removeChild(this._container);

		// Need to fire remove event before we set _map to null as the event hooks might need the object
		this.fire('remove');
		this._map = null;

		if (L.Browser.vml) {
			this._container = null;
			this._stroke = null;
			this._fill = null;
		}

		map.off({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	projectLatlngs: function () {
		// do all projection stuff here
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._container) {
			this._updateStyle();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._updatePath();
		}
		return this;
	}
});

L.Map.include({
	_updatePathViewport: function () {
		var p = L.Path.CLIP_PADDING,
		    size = this.getSize(),
		    panePos = L.DomUtil.getPosition(this._mapPane),
		    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
		    max = min.add(size.multiplyBy(1 + p * 2)._round());

		this._pathViewport = new L.Bounds(min, max);
	}
});


/*
 * Extends L.Path with SVG-specific rendering code.
 */

L.Path.SVG_NS = 'http://www.w3.org/2000/svg';

L.Browser.svg = !!(document.createElementNS && document.createElementNS(L.Path.SVG_NS, 'svg').createSVGRect);

L.Path = L.Path.extend({
	statics: {
		SVG: L.Browser.svg
	},

	bringToFront: function () {
		var root = this._map._pathRoot,
		    path = this._container;

		if (path && root.lastChild !== path) {
			root.appendChild(path);
		}
		return this;
	},

	bringToBack: function () {
		var root = this._map._pathRoot,
		    path = this._container,
		    first = root.firstChild;

		if (path && first !== path) {
			root.insertBefore(path, first);
		}
		return this;
	},

	getPathString: function () {
		// form path string here
	},

	_createElement: function (name) {
		return document.createElementNS(L.Path.SVG_NS, name);
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._initPath();
		this._initStyle();
	},

	_initPath: function () {
		this._container = this._createElement('g');

		this._path = this._createElement('path');

		if (this.options.className) {
			L.DomUtil.addClass(this._path, this.options.className);
		}

		this._container.appendChild(this._path);
	},

	_initStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke-linejoin', 'round');
			this._path.setAttribute('stroke-linecap', 'round');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill-rule', 'evenodd');
		}
		if (this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', this.options.pointerEvents);
		}
		if (!this.options.clickable && !this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', 'none');
		}
		this._updateStyle();
	},

	_updateStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke', this.options.color);
			this._path.setAttribute('stroke-opacity', this.options.opacity);
			this._path.setAttribute('stroke-width', this.options.weight);
			if (this.options.dashArray) {
				this._path.setAttribute('stroke-dasharray', this.options.dashArray);
			} else {
				this._path.removeAttribute('stroke-dasharray');
			}
			if (this.options.lineCap) {
				this._path.setAttribute('stroke-linecap', this.options.lineCap);
			}
			if (this.options.lineJoin) {
				this._path.setAttribute('stroke-linejoin', this.options.lineJoin);
			}
		} else {
			this._path.setAttribute('stroke', 'none');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill', this.options.fillColor || this.options.color);
			this._path.setAttribute('fill-opacity', this.options.fillOpacity);
		} else {
			this._path.setAttribute('fill', 'none');
		}
	},

	_updatePath: function () {
		var str = this.getPathString();
		if (!str) {
			// fix webkit empty string parsing bug
			str = 'M0 0';
		}
		this._path.setAttribute('d', str);
	},

	// TODO remove duplication with L.Map
	_initEvents: function () {
		if (this.options.clickable) {
			if (L.Browser.svg || !L.Browser.vml) {
				L.DomUtil.addClass(this._path, 'leaflet-clickable');
			}

			L.DomEvent.on(this._container, 'click', this._onMouseClick, this);

			var events = ['dblclick', 'mousedown', 'mouseover',
			              'mouseout', 'mousemove', 'contextmenu'];
			for (var i = 0; i < events.length; i++) {
				L.DomEvent.on(this._container, events[i], this._fireMouseEvent, this);
			}
		}
	},

	_onMouseClick: function (e) {
		if (this._map.dragging && this._map.dragging.moved()) { return; }

		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this.hasEventListeners(e.type)) { return; }

		var map = this._map,
		    containerPoint = map.mouseEventToContainerPoint(e),
		    layerPoint = map.containerPointToLayerPoint(containerPoint),
		    latlng = map.layerPointToLatLng(layerPoint);

		this.fire(e.type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});

		if (e.type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousemove') {
			L.DomEvent.stopPropagation(e);
		}
	}
});

L.Map.include({
	_initPathRoot: function () {
		if (!this._pathRoot) {
			this._pathRoot = L.Path.prototype._createElement('svg');
			this._panes.overlayPane.appendChild(this._pathRoot);

			if (this.options.zoomAnimation && L.Browser.any3d) {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-animated');

				this.on({
					'zoomanim': this._animatePathZoom,
					'zoomend': this._endPathZoom
				});
			} else {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-hide');
			}

			this.on('moveend', this._updateSvgViewport);
			this._updateSvgViewport();
		}
	},

	_animatePathZoom: function (e) {
		var scale = this.getZoomScale(e.zoom),
		    offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);

		this._pathRoot.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';

		this._pathZooming = true;
	},

	_endPathZoom: function () {
		this._pathZooming = false;
	},

	_updateSvgViewport: function () {

		if (this._pathZooming) {
			// Do not update SVGs while a zoom animation is going on otherwise the animation will break.
			// When the zoom animation ends we will be updated again anyway
			// This fixes the case where you do a momentum move and zoom while the move is still ongoing.
			return;
		}

		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    max = vp.max,
		    width = max.x - min.x,
		    height = max.y - min.y,
		    root = this._pathRoot,
		    pane = this._panes.overlayPane;

		// Hack to make flicker on drag end on mobile webkit less irritating
		if (L.Browser.mobileWebkit) {
			pane.removeChild(root);
		}

		L.DomUtil.setPosition(root, min);
		root.setAttribute('width', width);
		root.setAttribute('height', height);
		root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));

		if (L.Browser.mobileWebkit) {
			pane.appendChild(root);
		}
	}
});


/*
 * Popup extension to L.Path (polylines, polygons, circles), adding popup-related methods.
 */

L.Path.include({

	bindPopup: function (content, options) {

		if (content instanceof L.Popup) {
			this._popup = content;
		} else {
			if (!this._popup || options) {
				this._popup = new L.Popup(options, this);
			}
			this._popup.setContent(content);
		}

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this._openPopup, this)
			    .on('remove', this.closePopup, this);

			this._popupHandlersAdded = true;
		}

		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this._openPopup)
			    .off('remove', this.closePopup);

			this._popupHandlersAdded = false;
		}
		return this;
	},

	openPopup: function (latlng) {

		if (this._popup) {
			// open the popup from one of the path's points if not specified
			latlng = latlng || this._latlng ||
			         this._latlngs[Math.floor(this._latlngs.length / 2)];

			this._openPopup({latlng: latlng});
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	_openPopup: function (e) {
		this._popup.setLatLng(e.latlng);
		this._map.openPopup(this._popup);
	}
});


/*
 * Vector rendering for IE6-8 through VML.
 * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
 */

L.Browser.vml = !L.Browser.svg && (function () {
	try {
		var div = document.createElement('div');
		div.innerHTML = '<v:shape adj="1"/>';

		var shape = div.firstChild;
		shape.style.behavior = 'url(#default#VML)';

		return shape && (typeof shape.adj === 'object');

	} catch (e) {
		return false;
	}
}());

L.Path = L.Browser.svg || !L.Browser.vml ? L.Path : L.Path.extend({
	statics: {
		VML: true,
		CLIP_PADDING: 0.02
	},

	_createElement: (function () {
		try {
			document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
			return function (name) {
				return document.createElement('<lvml:' + name + ' class="lvml">');
			};
		} catch (e) {
			return function (name) {
				return document.createElement(
				        '<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
			};
		}
	}()),

	_initPath: function () {
		var container = this._container = this._createElement('shape');

		L.DomUtil.addClass(container, 'leaflet-vml-shape' +
			(this.options.className ? ' ' + this.options.className : ''));

		if (this.options.clickable) {
			L.DomUtil.addClass(container, 'leaflet-clickable');
		}

		container.coordsize = '1 1';

		this._path = this._createElement('path');
		container.appendChild(this._path);

		this._map._pathRoot.appendChild(container);
	},

	_initStyle: function () {
		this._updateStyle();
	},

	_updateStyle: function () {
		var stroke = this._stroke,
		    fill = this._fill,
		    options = this.options,
		    container = this._container;

		container.stroked = options.stroke;
		container.filled = options.fill;

		if (options.stroke) {
			if (!stroke) {
				stroke = this._stroke = this._createElement('stroke');
				stroke.endcap = 'round';
				container.appendChild(stroke);
			}
			stroke.weight = options.weight + 'px';
			stroke.color = options.color;
			stroke.opacity = options.opacity;

			if (options.dashArray) {
				stroke.dashStyle = L.Util.isArray(options.dashArray) ?
				    options.dashArray.join(' ') :
				    options.dashArray.replace(/( *, *)/g, ' ');
			} else {
				stroke.dashStyle = '';
			}
			if (options.lineCap) {
				stroke.endcap = options.lineCap.replace('butt', 'flat');
			}
			if (options.lineJoin) {
				stroke.joinstyle = options.lineJoin;
			}

		} else if (stroke) {
			container.removeChild(stroke);
			this._stroke = null;
		}

		if (options.fill) {
			if (!fill) {
				fill = this._fill = this._createElement('fill');
				container.appendChild(fill);
			}
			fill.color = options.fillColor || options.color;
			fill.opacity = options.fillOpacity;

		} else if (fill) {
			container.removeChild(fill);
			this._fill = null;
		}
	},

	_updatePath: function () {
		var style = this._container.style;

		style.display = 'none';
		this._path.v = this.getPathString() + ' '; // the space fixes IE empty path string bug
		style.display = '';
	}
});

L.Map.include(L.Browser.svg || !L.Browser.vml ? {} : {
	_initPathRoot: function () {
		if (this._pathRoot) { return; }

		var root = this._pathRoot = document.createElement('div');
		root.className = 'leaflet-vml-container';
		this._panes.overlayPane.appendChild(root);

		this.on('moveend', this._updatePathViewport);
		this._updatePathViewport();
	}
});


/*
 * Vector rendering for all browsers that support canvas.
 */

L.Browser.canvas = (function () {
	return !!document.createElement('canvas').getContext;
}());

L.Path = (L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? L.Path : L.Path.extend({
	statics: {
		//CLIP_PADDING: 0.02, // not sure if there's a need to set it to a small value
		CANVAS: true,
		SVG: false
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._requestUpdate();
		}
		return this;
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._map) {
			this._updateStyle();
			this._requestUpdate();
		}
		return this;
	},

	onRemove: function (map) {
		map
		    .off('viewreset', this.projectLatlngs, this)
		    .off('moveend', this._updatePath, this);

		if (this.options.clickable) {
			this._map.off('click', this._onClick, this);
			this._map.off('mousemove', this._onMouseMove, this);
		}

		this._requestUpdate();

		this._map = null;
	},

	_requestUpdate: function () {
		if (this._map && !L.Path._updateRequest) {
			L.Path._updateRequest = L.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
		}
	},

	_fireMapMoveEnd: function () {
		L.Path._updateRequest = null;
		this.fire('moveend');
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._ctx = this._map._canvasCtx;
	},

	_updateStyle: function () {
		var options = this.options;

		if (options.stroke) {
			this._ctx.lineWidth = options.weight;
			this._ctx.strokeStyle = options.color;
		}
		if (options.fill) {
			this._ctx.fillStyle = options.fillColor || options.color;
		}
	},

	_drawPath: function () {
		var i, j, len, len2, point, drawMethod;

		this._ctx.beginPath();

		for (i = 0, len = this._parts.length; i < len; i++) {
			for (j = 0, len2 = this._parts[i].length; j < len2; j++) {
				point = this._parts[i][j];
				drawMethod = (j === 0 ? 'move' : 'line') + 'To';

				this._ctx[drawMethod](point.x, point.y);
			}
			// TODO refactor ugly hack
			if (this instanceof L.Polygon) {
				this._ctx.closePath();
			}
		}
	},

	_checkIfEmpty: function () {
		return !this._parts.length;
	},

	_updatePath: function () {
		if (this._checkIfEmpty()) { return; }

		var ctx = this._ctx,
		    options = this.options;

		this._drawPath();
		ctx.save();
		this._updateStyle();

		if (options.fill) {
			ctx.globalAlpha = options.fillOpacity;
			ctx.fill();
		}

		if (options.stroke) {
			ctx.globalAlpha = options.opacity;
			ctx.stroke();
		}

		ctx.restore();

		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	},

	_initEvents: function () {
		if (this.options.clickable) {
			// TODO dblclick
			this._map.on('mousemove', this._onMouseMove, this);
			this._map.on('click', this._onClick, this);
		}
	},

	_onClick: function (e) {
		if (this._containsPoint(e.layerPoint)) {
			this.fire('click', e);
		}
	},

	_onMouseMove: function (e) {
		if (!this._map || this._map._animatingZoom) { return; }

		// TODO don't do on each move
		if (this._containsPoint(e.layerPoint)) {
			this._ctx.canvas.style.cursor = 'pointer';
			this._mouseInside = true;
			this.fire('mouseover', e);

		} else if (this._mouseInside) {
			this._ctx.canvas.style.cursor = '';
			this._mouseInside = false;
			this.fire('mouseout', e);
		}
	}
});

L.Map.include((L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? {} : {
	_initPathRoot: function () {
		var root = this._pathRoot,
		    ctx;

		if (!root) {
			root = this._pathRoot = document.createElement('canvas');
			root.style.position = 'absolute';
			ctx = this._canvasCtx = root.getContext('2d');

			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			this._panes.overlayPane.appendChild(root);

			if (this.options.zoomAnimation) {
				this._pathRoot.className = 'leaflet-zoom-animated';
				this.on('zoomanim', this._animatePathZoom);
				this.on('zoomend', this._endPathZoom);
			}
			this.on('moveend', this._updateCanvasViewport);
			this._updateCanvasViewport();
		}
	},

	_updateCanvasViewport: function () {
		// don't redraw while zooming. See _updateSvgViewport for more details
		if (this._pathZooming) { return; }
		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    size = vp.max.subtract(min),
		    root = this._pathRoot;

		//TODO check if this works properly on mobile webkit
		L.DomUtil.setPosition(root, min);
		root.width = size.x;
		root.height = size.y;
		root.getContext('2d').translate(-min.x, -min.y);
	}
});


/*
 * L.LineUtil contains different utility functions for line segments
 * and polylines (clipping, simplification, distances, etc.)
 */

/*jshint bitwise:false */ // allow bitwise operations for this file

L.LineUtil = {

	// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
	// Improves rendering performance dramatically by lessening the number of points to draw.

	simplify: function (/*Point[]*/ points, /*Number*/ tolerance) {
		if (!tolerance || !points.length) {
			return points.slice();
		}

		var sqTolerance = tolerance * tolerance;

		// stage 1: vertex reduction
		points = this._reducePoints(points, sqTolerance);

		// stage 2: Douglas-Peucker simplification
		points = this._simplifyDP(points, sqTolerance);

		return points;
	},

	// distance from a point to a segment between two points
	pointToSegmentDistance:  function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
	},

	closestPointOnSegment: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return this._sqClosestPointOnSegment(p, p1, p2);
	},

	// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
	_simplifyDP: function (points, sqTolerance) {

		var len = points.length,
		    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
		    markers = new ArrayConstructor(len);

		markers[0] = markers[len - 1] = 1;

		this._simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

		var i,
		    newPoints = [];

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	},

	_simplifyDPStep: function (points, markers, sqTolerance, first, last) {

		var maxSqDist = 0,
		    index, i, sqDist;

		for (i = first + 1; i <= last - 1; i++) {
			sqDist = this._sqClosestPointOnSegment(points[i], points[first], points[last], true);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			markers[index] = 1;

			this._simplifyDPStep(points, markers, sqTolerance, first, index);
			this._simplifyDPStep(points, markers, sqTolerance, index, last);
		}
	},

	// reduce points that are too close to each other to a single point
	_reducePoints: function (points, sqTolerance) {
		var reducedPoints = [points[0]];

		for (var i = 1, prev = 0, len = points.length; i < len; i++) {
			if (this._sqDist(points[i], points[prev]) > sqTolerance) {
				reducedPoints.push(points[i]);
				prev = i;
			}
		}
		if (prev < len - 1) {
			reducedPoints.push(points[len - 1]);
		}
		return reducedPoints;
	},

	// Cohen-Sutherland line clipping algorithm.
	// Used to avoid rendering parts of a polyline that are not currently visible.

	clipSegment: function (a, b, bounds, useLastCode) {
		var codeA = useLastCode ? this._lastCode : this._getBitCode(a, bounds),
		    codeB = this._getBitCode(b, bounds),

		    codeOut, p, newCode;

		// save 2nd code to avoid calculating it on the next segment
		this._lastCode = codeB;

		while (true) {
			// if a,b is inside the clip window (trivial accept)
			if (!(codeA | codeB)) {
				return [a, b];
			// if a,b is outside the clip window (trivial reject)
			} else if (codeA & codeB) {
				return false;
			// other cases
			} else {
				codeOut = codeA || codeB;
				p = this._getEdgeIntersection(a, b, codeOut, bounds);
				newCode = this._getBitCode(p, bounds);

				if (codeOut === codeA) {
					a = p;
					codeA = newCode;
				} else {
					b = p;
					codeB = newCode;
				}
			}
		}
	},

	_getEdgeIntersection: function (a, b, code, bounds) {
		var dx = b.x - a.x,
		    dy = b.y - a.y,
		    min = bounds.min,
		    max = bounds.max;

		if (code & 8) { // top
			return new L.Point(a.x + dx * (max.y - a.y) / dy, max.y);
		} else if (code & 4) { // bottom
			return new L.Point(a.x + dx * (min.y - a.y) / dy, min.y);
		} else if (code & 2) { // right
			return new L.Point(max.x, a.y + dy * (max.x - a.x) / dx);
		} else if (code & 1) { // left
			return new L.Point(min.x, a.y + dy * (min.x - a.x) / dx);
		}
	},

	_getBitCode: function (/*Point*/ p, bounds) {
		var code = 0;

		if (p.x < bounds.min.x) { // left
			code |= 1;
		} else if (p.x > bounds.max.x) { // right
			code |= 2;
		}
		if (p.y < bounds.min.y) { // bottom
			code |= 4;
		} else if (p.y > bounds.max.y) { // top
			code |= 8;
		}

		return code;
	},

	// square distance (to avoid unnecessary Math.sqrt calls)
	_sqDist: function (p1, p2) {
		var dx = p2.x - p1.x,
		    dy = p2.y - p1.y;
		return dx * dx + dy * dy;
	},

	// return closest point on segment or distance to that point
	_sqClosestPointOnSegment: function (p, p1, p2, sqDist) {
		var x = p1.x,
		    y = p1.y,
		    dx = p2.x - x,
		    dy = p2.y - y,
		    dot = dx * dx + dy * dy,
		    t;

		if (dot > 0) {
			t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

			if (t > 1) {
				x = p2.x;
				y = p2.y;
			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;

		return sqDist ? dx * dx + dy * dy : new L.Point(x, y);
	}
};


/*
 * L.Polyline is used to display polylines on a map.
 */

L.Polyline = L.Path.extend({
	initialize: function (latlngs, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlngs = this._convertLatLngs(latlngs);
	},

	options: {
		// how much to simplify the polyline on each zoom level
		// more = better performance and smoother look, less = more accurate
		smoothFactor: 1.0,
		noClip: false
	},

	projectLatlngs: function () {
		this._originalPoints = [];

		for (var i = 0, len = this._latlngs.length; i < len; i++) {
			this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
		}
	},

	getPathString: function () {
		for (var i = 0, len = this._parts.length, str = ''; i < len; i++) {
			str += this._getPathPartStr(this._parts[i]);
		}
		return str;
	},

	getLatLngs: function () {
		return this._latlngs;
	},

	setLatLngs: function (latlngs) {
		this._latlngs = this._convertLatLngs(latlngs);
		return this.redraw();
	},

	addLatLng: function (latlng) {
		this._latlngs.push(L.latLng(latlng));
		return this.redraw();
	},

	spliceLatLngs: function () { // (Number index, Number howMany)
		var removed = [].splice.apply(this._latlngs, arguments);
		this._convertLatLngs(this._latlngs, true);
		this.redraw();
		return removed;
	},

	closestLayerPoint: function (p) {
		var minDistance = Infinity, parts = this._parts, p1, p2, minPoint = null;

		for (var j = 0, jLen = parts.length; j < jLen; j++) {
			var points = parts[j];
			for (var i = 1, len = points.length; i < len; i++) {
				p1 = points[i - 1];
				p2 = points[i];
				var sqDist = L.LineUtil._sqClosestPointOnSegment(p, p1, p2, true);
				if (sqDist < minDistance) {
					minDistance = sqDist;
					minPoint = L.LineUtil._sqClosestPointOnSegment(p, p1, p2);
				}
			}
		}
		if (minPoint) {
			minPoint.distance = Math.sqrt(minDistance);
		}
		return minPoint;
	},

	getBounds: function () {
		return new L.LatLngBounds(this.getLatLngs());
	},

	_convertLatLngs: function (latlngs, overwrite) {
		var i, len, target = overwrite ? latlngs : [];

		for (i = 0, len = latlngs.length; i < len; i++) {
			if (L.Util.isArray(latlngs[i]) && typeof latlngs[i][0] !== 'number') {
				return;
			}
			target[i] = L.latLng(latlngs[i]);
		}
		return target;
	},

	_initEvents: function () {
		L.Path.prototype._initEvents.call(this);
	},

	_getPathPartStr: function (points) {
		var round = L.Path.VML;

		for (var j = 0, len2 = points.length, str = '', p; j < len2; j++) {
			p = points[j];
			if (round) {
				p._round();
			}
			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
		}
		return str;
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    len = points.length,
		    i, k, segment;

		if (this.options.noClip) {
			this._parts = [points];
			return;
		}

		this._parts = [];

		var parts = this._parts,
		    vp = this._map._pathViewport,
		    lu = L.LineUtil;

		for (i = 0, k = 0; i < len - 1; i++) {
			segment = lu.clipSegment(points[i], points[i + 1], vp, i);
			if (!segment) {
				continue;
			}

			parts[k] = parts[k] || [];
			parts[k].push(segment[0]);

			// if segment goes out of screen, or it's the last one, it's the end of the line part
			if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
				parts[k].push(segment[1]);
				k++;
			}
		}
	},

	// simplify each clipped part of the polyline
	_simplifyPoints: function () {
		var parts = this._parts,
		    lu = L.LineUtil;

		for (var i = 0, len = parts.length; i < len; i++) {
			parts[i] = lu.simplify(parts[i], this.options.smoothFactor);
		}
	},

	_updatePath: function () {
		if (!this._map) { return; }

		this._clipPoints();
		this._simplifyPoints();

		L.Path.prototype._updatePath.call(this);
	}
});

L.polyline = function (latlngs, options) {
	return new L.Polyline(latlngs, options);
};


/*
 * L.PolyUtil contains utility functions for polygons (clipping, etc.).
 */

/*jshint bitwise:false */ // allow bitwise operations here

L.PolyUtil = {};

/*
 * Sutherland-Hodgeman polygon clipping algorithm.
 * Used to avoid rendering parts of a polygon that are not currently visible.
 */
L.PolyUtil.clipPolygon = function (points, bounds) {
	var clippedPoints,
	    edges = [1, 4, 2, 8],
	    i, j, k,
	    a, b,
	    len, edge, p,
	    lu = L.LineUtil;

	for (i = 0, len = points.length; i < len; i++) {
		points[i]._code = lu._getBitCode(points[i], bounds);
	}

	// for each edge (left, bottom, right, top)
	for (k = 0; k < 4; k++) {
		edge = edges[k];
		clippedPoints = [];

		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
			a = points[i];
			b = points[j];

			// if a is inside the clip window
			if (!(a._code & edge)) {
				// if b is outside the clip window (a->b goes out of screen)
				if (b._code & edge) {
					p = lu._getEdgeIntersection(b, a, edge, bounds);
					p._code = lu._getBitCode(p, bounds);
					clippedPoints.push(p);
				}
				clippedPoints.push(a);

			// else if b is inside the clip window (a->b enters the screen)
			} else if (!(b._code & edge)) {
				p = lu._getEdgeIntersection(b, a, edge, bounds);
				p._code = lu._getBitCode(p, bounds);
				clippedPoints.push(p);
			}
		}
		points = clippedPoints;
	}

	return points;
};


/*
 * L.Polygon is used to display polygons on a map.
 */

L.Polygon = L.Polyline.extend({
	options: {
		fill: true
	},

	initialize: function (latlngs, options) {
		L.Polyline.prototype.initialize.call(this, latlngs, options);
		this._initWithHoles(latlngs);
	},

	_initWithHoles: function (latlngs) {
		var i, len, hole;
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._latlngs = this._convertLatLngs(latlngs[0]);
			this._holes = latlngs.slice(1);

			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = this._holes[i] = this._convertLatLngs(this._holes[i]);
				if (hole[0].equals(hole[hole.length - 1])) {
					hole.pop();
				}
			}
		}

		// filter out last point if its equal to the first one
		latlngs = this._latlngs;

		if (latlngs.length >= 2 && latlngs[0].equals(latlngs[latlngs.length - 1])) {
			latlngs.pop();
		}
	},

	projectLatlngs: function () {
		L.Polyline.prototype.projectLatlngs.call(this);

		// project polygon holes points
		// TODO move this logic to Polyline to get rid of duplication
		this._holePoints = [];

		if (!this._holes) { return; }

		var i, j, len, len2;

		for (i = 0, len = this._holes.length; i < len; i++) {
			this._holePoints[i] = [];

			for (j = 0, len2 = this._holes[i].length; j < len2; j++) {
				this._holePoints[i][j] = this._map.latLngToLayerPoint(this._holes[i][j]);
			}
		}
	},

	setLatLngs: function (latlngs) {
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._initWithHoles(latlngs);
			return this.redraw();
		} else {
			return L.Polyline.prototype.setLatLngs.call(this, latlngs);
		}
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    newParts = [];

		this._parts = [points].concat(this._holePoints);

		if (this.options.noClip) { return; }

		for (var i = 0, len = this._parts.length; i < len; i++) {
			var clipped = L.PolyUtil.clipPolygon(this._parts[i], this._map._pathViewport);
			if (clipped.length) {
				newParts.push(clipped);
			}
		}

		this._parts = newParts;
	},

	_getPathPartStr: function (points) {
		var str = L.Polyline.prototype._getPathPartStr.call(this, points);
		return str + (L.Browser.svg ? 'z' : 'x');
	}
});

L.polygon = function (latlngs, options) {
	return new L.Polygon(latlngs, options);
};


/*
 * Contains L.MultiPolyline and L.MultiPolygon layers.
 */

(function () {
	function createMulti(Klass) {

		return L.FeatureGroup.extend({

			initialize: function (latlngs, options) {
				this._layers = {};
				this._options = options;
				this.setLatLngs(latlngs);
			},

			setLatLngs: function (latlngs) {
				var i = 0,
				    len = latlngs.length;

				this.eachLayer(function (layer) {
					if (i < len) {
						layer.setLatLngs(latlngs[i++]);
					} else {
						this.removeLayer(layer);
					}
				}, this);

				while (i < len) {
					this.addLayer(new Klass(latlngs[i++], this._options));
				}

				return this;
			},

			getLatLngs: function () {
				var latlngs = [];

				this.eachLayer(function (layer) {
					latlngs.push(layer.getLatLngs());
				});

				return latlngs;
			}
		});
	}

	L.MultiPolyline = createMulti(L.Polyline);
	L.MultiPolygon = createMulti(L.Polygon);

	L.multiPolyline = function (latlngs, options) {
		return new L.MultiPolyline(latlngs, options);
	};

	L.multiPolygon = function (latlngs, options) {
		return new L.MultiPolygon(latlngs, options);
	};
}());


/*
 * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
 */

L.Rectangle = L.Polygon.extend({
	initialize: function (latLngBounds, options) {
		L.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
	},

	setBounds: function (latLngBounds) {
		this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	},

	_boundsToLatLngs: function (latLngBounds) {
		latLngBounds = L.latLngBounds(latLngBounds);
		return [
			latLngBounds.getSouthWest(),
			latLngBounds.getNorthWest(),
			latLngBounds.getNorthEast(),
			latLngBounds.getSouthEast()
		];
	}
});

L.rectangle = function (latLngBounds, options) {
	return new L.Rectangle(latLngBounds, options);
};


/*
 * L.Circle is a circle overlay (with a certain radius in meters).
 */

L.Circle = L.Path.extend({
	initialize: function (latlng, radius, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlng = L.latLng(latlng);
		this._mRadius = radius;
	},

	options: {
		fill: true
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		return this.redraw();
	},

	setRadius: function (radius) {
		this._mRadius = radius;
		return this.redraw();
	},

	projectLatlngs: function () {
		var lngRadius = this._getLngRadius(),
		    latlng = this._latlng,
		    pointLeft = this._map.latLngToLayerPoint([latlng.lat, latlng.lng - lngRadius]);

		this._point = this._map.latLngToLayerPoint(latlng);
		this._radius = Math.max(this._point.x - pointLeft.x, 1);
	},

	getBounds: function () {
		var lngRadius = this._getLngRadius(),
		    latRadius = (this._mRadius / 40075017) * 360,
		    latlng = this._latlng;

		return new L.LatLngBounds(
		        [latlng.lat - latRadius, latlng.lng - lngRadius],
		        [latlng.lat + latRadius, latlng.lng + lngRadius]);
	},

	getLatLng: function () {
		return this._latlng;
	},

	getPathString: function () {
		var p = this._point,
		    r = this._radius;

		if (this._checkIfEmpty()) {
			return '';
		}

		if (L.Browser.svg) {
			return 'M' + p.x + ',' + (p.y - r) +
			       'A' + r + ',' + r + ',0,1,1,' +
			       (p.x - 0.1) + ',' + (p.y - r) + ' z';
		} else {
			p._round();
			r = Math.round(r);
			return 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r + ' 0,' + (65535 * 360);
		}
	},

	getRadius: function () {
		return this._mRadius;
	},

	// TODO Earth hardcoded, move into projection code!

	_getLatRadius: function () {
		return (this._mRadius / 40075017) * 360;
	},

	_getLngRadius: function () {
		return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
	},

	_checkIfEmpty: function () {
		if (!this._map) {
			return false;
		}
		var vp = this._map._pathViewport,
		    r = this._radius,
		    p = this._point;

		return p.x - r > vp.max.x || p.y - r > vp.max.y ||
		       p.x + r < vp.min.x || p.y + r < vp.min.y;
	}
});

L.circle = function (latlng, radius, options) {
	return new L.Circle(latlng, radius, options);
};


/*
 * L.CircleMarker is a circle overlay with a permanent pixel radius.
 */

L.CircleMarker = L.Circle.extend({
	options: {
		radius: 10,
		weight: 2
	},

	initialize: function (latlng, options) {
		L.Circle.prototype.initialize.call(this, latlng, null, options);
		this._radius = this.options.radius;
	},

	projectLatlngs: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
	},

	_updateStyle : function () {
		L.Circle.prototype._updateStyle.call(this);
		this.setRadius(this.options.radius);
	},

	setLatLng: function (latlng) {
		L.Circle.prototype.setLatLng.call(this, latlng);
		if (this._popup && this._popup._isOpen) {
			this._popup.setLatLng(latlng);
		}
		return this;
	},

	setRadius: function (radius) {
		this.options.radius = this._radius = radius;
		return this.redraw();
	},

	getRadius: function () {
		return this._radius;
	}
});

L.circleMarker = function (latlng, options) {
	return new L.CircleMarker(latlng, options);
};


/*
 * Extends L.Polyline to be able to manually detect clicks on Canvas-rendered polylines.
 */

L.Polyline.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p, closed) {
		var i, j, k, len, len2, dist, part,
		    w = this.options.weight / 2;

		if (L.Browser.touch) {
			w += 10; // polyline click tolerance on touch devices
		}

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];
			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				if (!closed && (j === 0)) {
					continue;
				}

				dist = L.LineUtil.pointToSegmentDistance(p, part[k], part[j]);

				if (dist <= w) {
					return true;
				}
			}
		}
		return false;
	}
});


/*
 * Extends L.Polygon to be able to manually detect clicks on Canvas-rendered polygons.
 */

L.Polygon.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p) {
		var inside = false,
		    part, p1, p2,
		    i, j, k,
		    len, len2;

		// TODO optimization: check if within bounds first

		if (L.Polyline.prototype._containsPoint.call(this, p, true)) {
			// click on polygon border
			return true;
		}

		// ray casting algorithm for detecting if point is in polygon

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				p1 = part[j];
				p2 = part[k];

				if (((p1.y > p.y) !== (p2.y > p.y)) &&
						(p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
					inside = !inside;
				}
			}
		}

		return inside;
	}
});


/*
 * Extends L.Circle with Canvas-specific code.
 */

L.Circle.include(!L.Path.CANVAS ? {} : {
	_drawPath: function () {
		var p = this._point;
		this._ctx.beginPath();
		this._ctx.arc(p.x, p.y, this._radius, 0, Math.PI * 2, false);
	},

	_containsPoint: function (p) {
		var center = this._point,
		    w2 = this.options.stroke ? this.options.weight / 2 : 0;

		return (p.distanceTo(center) <= this._radius + w2);
	}
});


/*
 * CircleMarker canvas specific drawing parts.
 */

L.CircleMarker.include(!L.Path.CANVAS ? {} : {
	_updateStyle: function () {
		L.Path.prototype._updateStyle.call(this);
	}
});


/*
 * L.GeoJSON turns any GeoJSON data into a Leaflet layer.
 */

L.GeoJSON = L.FeatureGroup.extend({

	initialize: function (geojson, options) {
		L.setOptions(this, options);

		this._layers = {};

		if (geojson) {
			this.addData(geojson);
		}
	},

	addData: function (geojson) {
		var features = L.Util.isArray(geojson) ? geojson : geojson.features,
		    i, len, feature;

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// Only add this if geometry or geometries are set and not null
				feature = features[i];
				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(features[i]);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(geojson)) { return; }

		var layer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng, options);
		layer.feature = L.GeoJSON.asFeature(geojson);

		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(geojson, layer);
		}

		return this.addLayer(layer);
	},

	resetStyle: function (layer) {
		var style = this.options.style;
		if (style) {
			// reset any custom styles
			L.Util.extend(layer.options, layer.defaultOptions);

			this._setLayerStyle(layer, style);
		}
	},

	setStyle: function (style) {
		this.eachLayer(function (layer) {
			this._setLayerStyle(layer, style);
		}, this);
	},

	_setLayerStyle: function (layer, style) {
		if (typeof style === 'function') {
			style = style(layer.feature);
		}
		if (layer.setStyle) {
			layer.setStyle(style);
		}
	}
});

L.extend(L.GeoJSON, {
	geometryToLayer: function (geojson, pointToLayer, coordsToLatLng, vectorOptions) {
		var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
		    coords = geometry.coordinates,
		    layers = [],
		    latlng, latlngs, i, len;

		coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

		switch (geometry.type) {
		case 'Point':
			latlng = coordsToLatLng(coords);
			return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);

		case 'MultiPoint':
			for (i = 0, len = coords.length; i < len; i++) {
				latlng = coordsToLatLng(coords[i]);
				layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
			}
			return new L.FeatureGroup(layers);

		case 'LineString':
			latlngs = this.coordsToLatLngs(coords, 0, coordsToLatLng);
			return new L.Polyline(latlngs, vectorOptions);

		case 'Polygon':
			if (coords.length === 2 && !coords[1].length) {
				throw new Error('Invalid GeoJSON object.');
			}
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.Polygon(latlngs, vectorOptions);

		case 'MultiLineString':
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.MultiPolyline(latlngs, vectorOptions);

		case 'MultiPolygon':
			latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
			return new L.MultiPolygon(latlngs, vectorOptions);

		case 'GeometryCollection':
			for (i = 0, len = geometry.geometries.length; i < len; i++) {

				layers.push(this.geometryToLayer({
					geometry: geometry.geometries[i],
					type: 'Feature',
					properties: geojson.properties
				}, pointToLayer, coordsToLatLng, vectorOptions));
			}
			return new L.FeatureGroup(layers);

		default:
			throw new Error('Invalid GeoJSON object.');
		}
	},

	coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
		return new L.LatLng(coords[1], coords[0], coords[2]);
	},

	coordsToLatLngs: function (coords, levelsDeep, coordsToLatLng) { // (Array[, Number, Function]) -> Array
		var latlng, i, len,
		    latlngs = [];

		for (i = 0, len = coords.length; i < len; i++) {
			latlng = levelsDeep ?
			        this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
			        (coordsToLatLng || this.coordsToLatLng)(coords[i]);

			latlngs.push(latlng);
		}

		return latlngs;
	},

	latLngToCoords: function (latlng) {
		var coords = [latlng.lng, latlng.lat];

		if (latlng.alt !== undefined) {
			coords.push(latlng.alt);
		}
		return coords;
	},

	latLngsToCoords: function (latLngs) {
		var coords = [];

		for (var i = 0, len = latLngs.length; i < len; i++) {
			coords.push(L.GeoJSON.latLngToCoords(latLngs[i]));
		}

		return coords;
	},

	getFeature: function (layer, newGeometry) {
		return layer.feature ? L.extend({}, layer.feature, {geometry: newGeometry}) : L.GeoJSON.asFeature(newGeometry);
	},

	asFeature: function (geoJSON) {
		if (geoJSON.type === 'Feature') {
			return geoJSON;
		}

		return {
			type: 'Feature',
			properties: {},
			geometry: geoJSON
		};
	}
});

var PointToGeoJSON = {
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'Point',
			coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
		});
	}
};

L.Marker.include(PointToGeoJSON);
L.Circle.include(PointToGeoJSON);
L.CircleMarker.include(PointToGeoJSON);

L.Polyline.include({
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'LineString',
			coordinates: L.GeoJSON.latLngsToCoords(this.getLatLngs())
		});
	}
});

L.Polygon.include({
	toGeoJSON: function () {
		var coords = [L.GeoJSON.latLngsToCoords(this.getLatLngs())],
		    i, len, hole;

		coords[0].push(coords[0][0]);

		if (this._holes) {
			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = L.GeoJSON.latLngsToCoords(this._holes[i]);
				hole.push(hole[0]);
				coords.push(hole);
			}
		}

		return L.GeoJSON.getFeature(this, {
			type: 'Polygon',
			coordinates: coords
		});
	}
});

(function () {
	function multiToGeoJSON(type) {
		return function () {
			var coords = [];

			this.eachLayer(function (layer) {
				coords.push(layer.toGeoJSON().geometry.coordinates);
			});

			return L.GeoJSON.getFeature(this, {
				type: type,
				coordinates: coords
			});
		};
	}

	L.MultiPolyline.include({toGeoJSON: multiToGeoJSON('MultiLineString')});
	L.MultiPolygon.include({toGeoJSON: multiToGeoJSON('MultiPolygon')});

	L.LayerGroup.include({
		toGeoJSON: function () {

			var geometry = this.feature && this.feature.geometry,
				jsons = [],
				json;

			if (geometry && geometry.type === 'MultiPoint') {
				return multiToGeoJSON('MultiPoint').call(this);
			}

			var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

			this.eachLayer(function (layer) {
				if (layer.toGeoJSON) {
					json = layer.toGeoJSON();
					jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
				}
			});

			if (isGeometryCollection) {
				return L.GeoJSON.getFeature(this, {
					geometries: jsons,
					type: 'GeometryCollection'
				});
			}

			return {
				type: 'FeatureCollection',
				features: jsons
			};
		}
	});
}());

L.geoJson = function (geojson, options) {
	return new L.GeoJSON(geojson, options);
};


/*
 * L.DomEvent contains functions for working with DOM events.
 */

L.DomEvent = {
	/* inspired by John Resig, Dean Edwards and YUI addEvent implementations */
	addListener: function (obj, type, fn, context) { // (HTMLElement, String, Function[, Object])

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler, originalHandler, newType;

		if (obj[key]) { return this; }

		handler = function (e) {
			return fn.call(context || obj, e || L.DomEvent._getEvent());
		};

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			return this.addPointerListener(obj, type, handler, id);
		}
		if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
			this.addDoubleTapListener(obj, handler, id);
		}

		if ('addEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.addEventListener('DOMMouseScroll', handler, false);
				obj.addEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {

				originalHandler = handler;
				newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');

				handler = function (e) {
					if (!L.DomEvent._checkMouse(obj, e)) { return; }
					return originalHandler(e);
				};

				obj.addEventListener(newType, handler, false);

			} else if (type === 'click' && L.Browser.android) {
				originalHandler = handler;
				handler = function (e) {
					return L.DomEvent._filterClick(e, originalHandler);
				};

				obj.addEventListener(type, handler, false);
			} else {
				obj.addEventListener(type, handler, false);
			}

		} else if ('attachEvent' in obj) {
			obj.attachEvent('on' + type, handler);
		}

		obj[key] = handler;

		return this;
	},

	removeListener: function (obj, type, fn) {  // (HTMLElement, String, Function)

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler = obj[key];

		if (!handler) { return this; }

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			this.removePointerListener(obj, type, id);
		} else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
			this.removeDoubleTapListener(obj, id);

		} else if ('removeEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.removeEventListener('DOMMouseScroll', handler, false);
				obj.removeEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
				obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
			} else {
				obj.removeEventListener(type, handler, false);
			}
		} else if ('detachEvent' in obj) {
			obj.detachEvent('on' + type, handler);
		}

		obj[key] = null;

		return this;
	},

	stopPropagation: function (e) {

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
		L.DomEvent._skipped(e);

		return this;
	},

	disableScrollPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		return L.DomEvent
			.on(el, 'mousewheel', stop)
			.on(el, 'MozMousePixelScroll', stop);
	},

	disableClickPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(el, L.Draggable.START[i], stop);
		}

		return L.DomEvent
			.on(el, 'click', L.DomEvent._fakeStop)
			.on(el, 'dblclick', stop);
	},

	preventDefault: function (e) {

		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		return this;
	},

	stop: function (e) {
		return L.DomEvent
			.preventDefault(e)
			.stopPropagation(e);
	},

	getMousePosition: function (e, container) {
		if (!container) {
			return new L.Point(e.clientX, e.clientY);
		}

		var rect = container.getBoundingClientRect();

		return new L.Point(
			e.clientX - rect.left - container.clientLeft,
			e.clientY - rect.top - container.clientTop);
	},

	getWheelDelta: function (e) {

		var delta = 0;

		if (e.wheelDelta) {
			delta = e.wheelDelta / 120;
		}
		if (e.detail) {
			delta = -e.detail / 3;
		}
		return delta;
	},

	_skipEvents: {},

	_fakeStop: function (e) {
		// fakes stopPropagation by setting a special event flag, checked/reset with L.DomEvent._skipped(e)
		L.DomEvent._skipEvents[e.type] = true;
	},

	_skipped: function (e) {
		var skipped = this._skipEvents[e.type];
		// reset when checking, as it's only used in map container and propagates outside of the map
		this._skipEvents[e.type] = false;
		return skipped;
	},

	// check if element really left/entered the event target (for mouseenter/mouseleave)
	_checkMouse: function (el, e) {

		var related = e.relatedTarget;

		if (!related) { return true; }

		try {
			while (related && (related !== el)) {
				related = related.parentNode;
			}
		} catch (err) {
			return false;
		}
		return (related !== el);
	},

	_getEvent: function () { // evil magic for IE
		/*jshint noarg:false */
		var e = window.event;
		if (!e) {
			var caller = arguments.callee.caller;
			while (caller) {
				e = caller['arguments'][0];
				if (e && window.Event === e.constructor) {
					break;
				}
				caller = caller.caller;
			}
		}
		return e;
	},

	// this is a horrible workaround for a bug in Android where a single touch triggers two click events
	_filterClick: function (e, handler) {
		var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
			elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);

		// are they closer together than 1000ms yet more than 100ms?
		// Android typically triggers them ~300ms apart while multiple listeners
		// on the same event should be triggered far faster;
		// or check if click is simulated on the element, and if it is, reject any non-simulated events

		if ((elapsed && elapsed > 100 && elapsed < 1000) || (e.target._simulatedClick && !e._simulated)) {
			L.DomEvent.stop(e);
			return;
		}
		L.DomEvent._lastClick = timeStamp;

		return handler(e);
	}
};

L.DomEvent.on = L.DomEvent.addListener;
L.DomEvent.off = L.DomEvent.removeListener;


/*
 * L.Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
 */

L.Draggable = L.Class.extend({
	includes: L.Mixin.Events,

	statics: {
		START: L.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
		END: {
			mousedown: 'mouseup',
			touchstart: 'touchend',
			pointerdown: 'touchend',
			MSPointerDown: 'touchend'
		},
		MOVE: {
			mousedown: 'mousemove',
			touchstart: 'touchmove',
			pointerdown: 'touchmove',
			MSPointerDown: 'touchmove'
		}
	},

	initialize: function (element, dragStartTarget) {
		this._element = element;
		this._dragStartTarget = dragStartTarget || element;
	},

	enable: function () {
		if (this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = true;
	},

	disable: function () {
		if (!this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.off(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = false;
		this._moved = false;
	},

	_onDown: function (e) {
		this._moved = false;

		if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

		L.DomEvent.stopPropagation(e);

		if (L.Draggable._disabled) { return; }

		L.DomUtil.disableImageDrag();
		L.DomUtil.disableTextSelection();

		if (this._moving) { return; }

		var first = e.touches ? e.touches[0] : e;

		this._startPoint = new L.Point(first.clientX, first.clientY);
		this._startPos = this._newPos = L.DomUtil.getPosition(this._element);

		L.DomEvent
		    .on(document, L.Draggable.MOVE[e.type], this._onMove, this)
		    .on(document, L.Draggable.END[e.type], this._onUp, this);
	},

	_onMove: function (e) {
		if (e.touches && e.touches.length > 1) {
			this._moved = true;
			return;
		}

		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
		    newPoint = new L.Point(first.clientX, first.clientY),
		    offset = newPoint.subtract(this._startPoint);

		if (!offset.x && !offset.y) { return; }

		L.DomEvent.preventDefault(e);

		if (!this._moved) {
			this.fire('dragstart');

			this._moved = true;
			this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);

			L.DomUtil.addClass(document.body, 'leaflet-dragging');
			L.DomUtil.addClass((e.target || e.srcElement), 'leaflet-drag-target');
		}

		this._newPos = this._startPos.add(offset);
		this._moving = true;

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
	},

	_updatePosition: function () {
		this.fire('predrag');
		L.DomUtil.setPosition(this._element, this._newPos);
		this.fire('drag');
	},

	_onUp: function (e) {
		L.DomUtil.removeClass(document.body, 'leaflet-dragging');
		L.DomUtil.removeClass((e.target || e.srcElement), 'leaflet-drag-target');

		for (var i in L.Draggable.MOVE) {
			L.DomEvent
			    .off(document, L.Draggable.MOVE[i], this._onMove)
			    .off(document, L.Draggable.END[i], this._onUp);
		}

		L.DomUtil.enableImageDrag();
		L.DomUtil.enableTextSelection();

		if (this._moved && this._moving) {
			// ensure drag is not fired after dragend
			L.Util.cancelAnimFrame(this._animRequest);

			this.fire('dragend', {
				distance: this._newPos.distanceTo(this._startPos)
			});
		}

		this._moving = false;
	}
});


/*
	L.Handler is a base class for handler classes that are used internally to inject
	interaction features like dragging to classes like Map and Marker.
*/

L.Handler = L.Class.extend({
	initialize: function (map) {
		this._map = map;
	},

	enable: function () {
		if (this._enabled) { return; }

		this._enabled = true;
		this.addHooks();
	},

	disable: function () {
		if (!this._enabled) { return; }

		this._enabled = false;
		this.removeHooks();
	},

	enabled: function () {
		return !!this._enabled;
	}
});


/*
 * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
 */

L.Map.mergeOptions({
	dragging: true,

	inertia: !L.Browser.android23,
	inertiaDeceleration: 3400, // px/s^2
	inertiaMaxSpeed: Infinity, // px/s
	inertiaThreshold: L.Browser.touch ? 32 : 18, // ms
	easeLinearity: 0.25,

	// TODO refactor, move to CRS
	worldCopyJump: false
});

L.Map.Drag = L.Handler.extend({
	addHooks: function () {
		if (!this._draggable) {
			var map = this._map;

			this._draggable = new L.Draggable(map._mapPane, map._container);

			this._draggable.on({
				'dragstart': this._onDragStart,
				'drag': this._onDrag,
				'dragend': this._onDragEnd
			}, this);

			if (map.options.worldCopyJump) {
				this._draggable.on('predrag', this._onPreDrag, this);
				map.on('viewreset', this._onViewReset, this);

				map.whenReady(this._onViewReset, this);
			}
		}
		this._draggable.enable();
	},

	removeHooks: function () {
		this._draggable.disable();
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		var map = this._map;

		if (map._panAnim) {
			map._panAnim.stop();
		}

		map
		    .fire('movestart')
		    .fire('dragstart');

		if (map.options.inertia) {
			this._positions = [];
			this._times = [];
		}
	},

	_onDrag: function () {
		if (this._map.options.inertia) {
			var time = this._lastTime = +new Date(),
			    pos = this._lastPos = this._draggable._newPos;

			this._positions.push(pos);
			this._times.push(time);

			if (time - this._times[0] > 200) {
				this._positions.shift();
				this._times.shift();
			}
		}

		this._map
		    .fire('move')
		    .fire('drag');
	},

	_onViewReset: function () {
		// TODO fix hardcoded Earth values
		var pxCenter = this._map.getSize()._divideBy(2),
		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
		this._worldWidth = this._map.project([0, 180]).x;
	},

	_onPreDrag: function () {
		// TODO refactor to be able to adjust map pane position after zoom
		var worldWidth = this._worldWidth,
		    halfWidth = Math.round(worldWidth / 2),
		    dx = this._initialWorldOffset,
		    x = this._draggable._newPos.x,
		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

		this._draggable._newPos.x = newX;
	},

	_onDragEnd: function (e) {
		var map = this._map,
		    options = map.options,
		    delay = +new Date() - this._lastTime,

		    noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];

		map.fire('dragend', e);

		if (noInertia) {
			map.fire('moveend');

		} else {

			var direction = this._lastPos.subtract(this._positions[0]),
			    duration = (this._lastTime + delay - this._times[0]) / 1000,
			    ease = options.easeLinearity,

			    speedVector = direction.multiplyBy(ease / duration),
			    speed = speedVector.distanceTo([0, 0]),

			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

			if (!offset.x || !offset.y) {
				map.fire('moveend');

			} else {
				offset = map._limitOffset(offset, map.options.maxBounds);

				L.Util.requestAnimFrame(function () {
					map.panBy(offset, {
						duration: decelerationDuration,
						easeLinearity: ease,
						noMoveStart: true
					});
				});
			}
		}
	}
});

L.Map.addInitHook('addHandler', 'dragging', L.Map.Drag);


/*
 * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
 */

L.Map.mergeOptions({
	doubleClickZoom: true
});

L.Map.DoubleClickZoom = L.Handler.extend({
	addHooks: function () {
		this._map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this._map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		var map = this._map,
		    zoom = map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1);

		if (map.options.doubleClickZoom === 'center') {
			map.setZoom(zoom);
		} else {
			map.setZoomAround(e.containerPoint, zoom);
		}
	}
});

L.Map.addInitHook('addHandler', 'doubleClickZoom', L.Map.DoubleClickZoom);


/*
 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
 */

L.Map.mergeOptions({
	scrollWheelZoom: true
});

L.Map.ScrollWheelZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);
		L.DomEvent.on(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
		this._delta = 0;
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll);
		L.DomEvent.off(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
	},

	_onWheelScroll: function (e) {
		var delta = L.DomEvent.getWheelDelta(e);

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(40 - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(L.bind(this._performZoom, this), left);

		L.DomEvent.preventDefault(e);
		L.DomEvent.stopPropagation(e);
	},

	_performZoom: function () {
		var map = this._map,
		    delta = this._delta,
		    zoom = map.getZoom();

		delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
		delta = Math.max(Math.min(delta, 4), -4);
		delta = map._limitZoom(zoom + delta) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			map.setZoomAround(this._lastMousePos, zoom + delta);
		}
	}
});

L.Map.addInitHook('addHandler', 'scrollWheelZoom', L.Map.ScrollWheelZoom);


/*
 * Extends the event handling code with double tap support for mobile browsers.
 */

L.extend(L.DomEvent, {

	_touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
	_touchend: L.Browser.msPointer ? 'MSPointerUp' : L.Browser.pointer ? 'pointerup' : 'touchend',

	// inspired by Zepto touch code by Thomas Fuchs
	addDoubleTapListener: function (obj, handler, id) {
		var last,
		    doubleTap = false,
		    delay = 250,
		    touch,
		    pre = '_leaflet_',
		    touchstart = this._touchstart,
		    touchend = this._touchend,
		    trackedTouches = [];

		function onTouchStart(e) {
			var count;

			if (L.Browser.pointer) {
				trackedTouches.push(e.pointerId);
				count = trackedTouches.length;
			} else {
				count = e.touches.length;
			}
			if (count > 1) {
				return;
			}

			var now = Date.now(),
				delta = now - (last || now);

			touch = e.touches ? e.touches[0] : e;
			doubleTap = (delta > 0 && delta <= delay);
			last = now;
		}

		function onTouchEnd(e) {
			if (L.Browser.pointer) {
				var idx = trackedTouches.indexOf(e.pointerId);
				if (idx === -1) {
					return;
				}
				trackedTouches.splice(idx, 1);
			}

			if (doubleTap) {
				if (L.Browser.pointer) {
					// work around .type being readonly with MSPointer* events
					var newTouch = { },
						prop;

					// jshint forin:false
					for (var i in touch) {
						prop = touch[i];
						if (typeof prop === 'function') {
							newTouch[i] = prop.bind(touch);
						} else {
							newTouch[i] = prop;
						}
					}
					touch = newTouch;
				}
				touch.type = 'dblclick';
				handler(touch);
				last = null;
			}
		}
		obj[pre + touchstart + id] = onTouchStart;
		obj[pre + touchend + id] = onTouchEnd;

		// on pointer we need to listen on the document, otherwise a drag starting on the map and moving off screen
		// will not come through to us, so we will lose track of how many touches are ongoing
		var endElement = L.Browser.pointer ? document.documentElement : obj;

		obj.addEventListener(touchstart, onTouchStart, false);
		endElement.addEventListener(touchend, onTouchEnd, false);

		if (L.Browser.pointer) {
			endElement.addEventListener(L.DomEvent.POINTER_CANCEL, onTouchEnd, false);
		}

		return this;
	},

	removeDoubleTapListener: function (obj, id) {
		var pre = '_leaflet_';

		obj.removeEventListener(this._touchstart, obj[pre + this._touchstart + id], false);
		(L.Browser.pointer ? document.documentElement : obj).removeEventListener(
		        this._touchend, obj[pre + this._touchend + id], false);

		if (L.Browser.pointer) {
			document.documentElement.removeEventListener(L.DomEvent.POINTER_CANCEL, obj[pre + this._touchend + id],
				false);
		}

		return this;
	}
});


/*
 * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
 */

L.extend(L.DomEvent, {

	//static
	POINTER_DOWN: L.Browser.msPointer ? 'MSPointerDown' : 'pointerdown',
	POINTER_MOVE: L.Browser.msPointer ? 'MSPointerMove' : 'pointermove',
	POINTER_UP: L.Browser.msPointer ? 'MSPointerUp' : 'pointerup',
	POINTER_CANCEL: L.Browser.msPointer ? 'MSPointerCancel' : 'pointercancel',

	_pointers: [],
	_pointerDocumentListener: false,

	// Provides a touch events wrapper for (ms)pointer events.
	// Based on changes by veproza https://github.com/CloudMade/Leaflet/pull/1019
	//ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

	addPointerListener: function (obj, type, handler, id) {

		switch (type) {
		case 'touchstart':
			return this.addPointerListenerStart(obj, type, handler, id);
		case 'touchend':
			return this.addPointerListenerEnd(obj, type, handler, id);
		case 'touchmove':
			return this.addPointerListenerMove(obj, type, handler, id);
		default:
			throw 'Unknown touch event type';
		}
	},

	addPointerListenerStart: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    pointers = this._pointers;

		var cb = function (e) {

			L.DomEvent.preventDefault(e);

			var alreadyInArray = false;
			for (var i = 0; i < pointers.length; i++) {
				if (pointers[i].pointerId === e.pointerId) {
					alreadyInArray = true;
					break;
				}
			}
			if (!alreadyInArray) {
				pointers.push(e);
			}

			e.touches = pointers.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchstart' + id] = cb;
		obj.addEventListener(this.POINTER_DOWN, cb, false);

		// need to also listen for end events to keep the _pointers list accurate
		// this needs to be on the body and never go away
		if (!this._pointerDocumentListener) {
			var internalCb = function (e) {
				for (var i = 0; i < pointers.length; i++) {
					if (pointers[i].pointerId === e.pointerId) {
						pointers.splice(i, 1);
						break;
					}
				}
			};
			//We listen on the documentElement as any drags that end by moving the touch off the screen get fired there
			document.documentElement.addEventListener(this.POINTER_UP, internalCb, false);
			document.documentElement.addEventListener(this.POINTER_CANCEL, internalCb, false);

			this._pointerDocumentListener = true;
		}

		return this;
	},

	addPointerListenerMove: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		function cb(e) {

			// don't fire touch moves when mouse isn't down
			if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches[i] = e;
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		}

		obj[pre + 'touchmove' + id] = cb;
		obj.addEventListener(this.POINTER_MOVE, cb, false);

		return this;
	},

	addPointerListenerEnd: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		var cb = function (e) {
			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches.splice(i, 1);
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchend' + id] = cb;
		obj.addEventListener(this.POINTER_UP, cb, false);
		obj.addEventListener(this.POINTER_CANCEL, cb, false);

		return this;
	},

	removePointerListener: function (obj, type, id) {
		var pre = '_leaflet_',
		    cb = obj[pre + type + id];

		switch (type) {
		case 'touchstart':
			obj.removeEventListener(this.POINTER_DOWN, cb, false);
			break;
		case 'touchmove':
			obj.removeEventListener(this.POINTER_MOVE, cb, false);
			break;
		case 'touchend':
			obj.removeEventListener(this.POINTER_UP, cb, false);
			obj.removeEventListener(this.POINTER_CANCEL, cb, false);
			break;
		}

		return this;
	}
});


/*
 * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
 */

L.Map.mergeOptions({
	touchZoom: L.Browser.touch && !L.Browser.android23,
	bounceAtZoomLimits: true
});

L.Map.TouchZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	_onTouchStart: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]),
		    viewCenter = map._getCenterLayerPoint();

		this._startCenter = p1.add(p2)._divideBy(2);
		this._startDist = p1.distanceTo(p2);

		this._moved = false;
		this._zooming = true;

		this._centerOffset = viewCenter.subtract(this._startCenter);

		if (map._panAnim) {
			map._panAnim.stop();
		}

		L.DomEvent
		    .on(document, 'touchmove', this._onTouchMove, this)
		    .on(document, 'touchend', this._onTouchEnd, this);

		L.DomEvent.preventDefault(e);
	},

	_onTouchMove: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]);

		this._scale = p1.distanceTo(p2) / this._startDist;
		this._delta = p1._add(p2)._divideBy(2)._subtract(this._startCenter);

		if (this._scale === 1) { return; }

		if (!map.options.bounceAtZoomLimits) {
			if ((map.getZoom() === map.getMinZoom() && this._scale < 1) ||
			    (map.getZoom() === map.getMaxZoom() && this._scale > 1)) { return; }
		}

		if (!this._moved) {
			L.DomUtil.addClass(map._mapPane, 'leaflet-touching');

			map
			    .fire('movestart')
			    .fire('zoomstart');

			this._moved = true;
		}

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(
		        this._updateOnMove, this, true, this._map._container);

		L.DomEvent.preventDefault(e);
	},

	_updateOnMove: function () {
		var map = this._map,
		    origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),
		    zoom = map.getScaleZoom(this._scale);

		map._animateZoom(center, zoom, this._startCenter, this._scale, this._delta);
	},

	_onTouchEnd: function () {
		if (!this._moved || !this._zooming) {
			this._zooming = false;
			return;
		}

		var map = this._map;

		this._zooming = false;
		L.DomUtil.removeClass(map._mapPane, 'leaflet-touching');
		L.Util.cancelAnimFrame(this._animRequest);

		L.DomEvent
		    .off(document, 'touchmove', this._onTouchMove)
		    .off(document, 'touchend', this._onTouchEnd);

		var origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),

		    oldZoom = map.getZoom(),
		    floatZoomDelta = map.getScaleZoom(this._scale) - oldZoom,
		    roundZoomDelta = (floatZoomDelta > 0 ?
		            Math.ceil(floatZoomDelta) : Math.floor(floatZoomDelta)),

		    zoom = map._limitZoom(oldZoom + roundZoomDelta),
		    scale = map.getZoomScale(zoom) / this._scale;

		map._animateZoom(center, zoom, origin, scale);
	},

	_getScaleOrigin: function () {
		var centerOffset = this._centerOffset.subtract(this._delta).divideBy(this._scale);
		return this._startCenter.add(centerOffset);
	}
});

L.Map.addInitHook('addHandler', 'touchZoom', L.Map.TouchZoom);


/*
 * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
 */

L.Map.mergeOptions({
	tap: true,
	tapTolerance: 15
});

L.Map.Tap = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onDown, this);
	},

	_onDown: function (e) {
		if (!e.touches) { return; }

		L.DomEvent.preventDefault(e);

		this._fireClick = true;

		// don't simulate click or track longpress if more than 1 touch
		if (e.touches.length > 1) {
			this._fireClick = false;
			clearTimeout(this._holdTimeout);
			return;
		}

		var first = e.touches[0],
		    el = first.target;

		this._startPos = this._newPos = new L.Point(first.clientX, first.clientY);

		// if touching a link, highlight it
		if (el.tagName && el.tagName.toLowerCase() === 'a') {
			L.DomUtil.addClass(el, 'leaflet-active');
		}

		// simulate long hold but setting a timeout
		this._holdTimeout = setTimeout(L.bind(function () {
			if (this._isTapValid()) {
				this._fireClick = false;
				this._onUp();
				this._simulateEvent('contextmenu', first);
			}
		}, this), 1000);

		L.DomEvent
			.on(document, 'touchmove', this._onMove, this)
			.on(document, 'touchend', this._onUp, this);
	},

	_onUp: function (e) {
		clearTimeout(this._holdTimeout);

		L.DomEvent
			.off(document, 'touchmove', this._onMove, this)
			.off(document, 'touchend', this._onUp, this);

		if (this._fireClick && e && e.changedTouches) {

			var first = e.changedTouches[0],
			    el = first.target;

			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
				L.DomUtil.removeClass(el, 'leaflet-active');
			}

			// simulate click if the touch didn't move too much
			if (this._isTapValid()) {
				this._simulateEvent('click', first);
			}
		}
	},

	_isTapValid: function () {
		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
	},

	_onMove: function (e) {
		var first = e.touches[0];
		this._newPos = new L.Point(first.clientX, first.clientY);
	},

	_simulateEvent: function (type, e) {
		var simulatedEvent = document.createEvent('MouseEvents');

		simulatedEvent._simulated = true;
		e.target._simulatedClick = true;

		simulatedEvent.initMouseEvent(
		        type, true, true, window, 1,
		        e.screenX, e.screenY,
		        e.clientX, e.clientY,
		        false, false, false, false, 0, null);

		e.target.dispatchEvent(simulatedEvent);
	}
});

if (L.Browser.touch && !L.Browser.pointer) {
	L.Map.addInitHook('addHandler', 'tap', L.Map.Tap);
}


/*
 * L.Handler.ShiftDragZoom is used to add shift-drag zoom interaction to the map
  * (zoom to a selected bounding box), enabled by default.
 */

L.Map.mergeOptions({
	boxZoom: true
});

L.Map.BoxZoom = L.Handler.extend({
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
		this._moved = false;
	},

	addHooks: function () {
		L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._container, 'mousedown', this._onMouseDown);
		this._moved = false;
	},

	moved: function () {
		return this._moved;
	},

	_onMouseDown: function (e) {
		this._moved = false;

		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

		L.DomUtil.disableTextSelection();
		L.DomUtil.disableImageDrag();

		this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

		L.DomEvent
		    .on(document, 'mousemove', this._onMouseMove, this)
		    .on(document, 'mouseup', this._onMouseUp, this)
		    .on(document, 'keydown', this._onKeyDown, this);
	},

	_onMouseMove: function (e) {
		if (!this._moved) {
			this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
			L.DomUtil.setPosition(this._box, this._startLayerPoint);

			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';
			this._map.fire('boxzoomstart');
		}

		var startPoint = this._startLayerPoint,
		    box = this._box,

		    layerPoint = this._map.mouseEventToLayerPoint(e),
		    offset = layerPoint.subtract(startPoint),

		    newPos = new L.Point(
		        Math.min(layerPoint.x, startPoint.x),
		        Math.min(layerPoint.y, startPoint.y));

		L.DomUtil.setPosition(box, newPos);

		this._moved = true;

		// TODO refactor: remove hardcoded 4 pixels
		box.style.width  = (Math.max(0, Math.abs(offset.x) - 4)) + 'px';
		box.style.height = (Math.max(0, Math.abs(offset.y) - 4)) + 'px';
	},

	_finish: function () {
		if (this._moved) {
			this._pane.removeChild(this._box);
			this._container.style.cursor = '';
		}

		L.DomUtil.enableTextSelection();
		L.DomUtil.enableImageDrag();

		L.DomEvent
		    .off(document, 'mousemove', this._onMouseMove)
		    .off(document, 'mouseup', this._onMouseUp)
		    .off(document, 'keydown', this._onKeyDown);
	},

	_onMouseUp: function (e) {

		this._finish();

		var map = this._map,
		    layerPoint = map.mouseEventToLayerPoint(e);

		if (this._startLayerPoint.equals(layerPoint)) { return; }

		var bounds = new L.LatLngBounds(
		        map.layerPointToLatLng(this._startLayerPoint),
		        map.layerPointToLatLng(layerPoint));

		map.fitBounds(bounds);

		map.fire('boxzoomend', {
			boxZoomBounds: bounds
		});
	},

	_onKeyDown: function (e) {
		if (e.keyCode === 27) {
			this._finish();
		}
	}
});

L.Map.addInitHook('addHandler', 'boxZoom', L.Map.BoxZoom);


/*
 * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
 */

L.Map.mergeOptions({
	keyboard: true,
	keyboardPanOffset: 80,
	keyboardZoomOffset: 1
});

L.Map.Keyboard = L.Handler.extend({

	keyCodes: {
		left:    [37],
		right:   [39],
		down:    [40],
		up:      [38],
		zoomIn:  [187, 107, 61, 171],
		zoomOut: [189, 109, 173]
	},

	initialize: function (map) {
		this._map = map;

		this._setPanOffset(map.options.keyboardPanOffset);
		this._setZoomOffset(map.options.keyboardZoomOffset);
	},

	addHooks: function () {
		var container = this._map._container;

		// make the container focusable by tabbing
		if (container.tabIndex === -1) {
			container.tabIndex = '0';
		}

		L.DomEvent
		    .on(container, 'focus', this._onFocus, this)
		    .on(container, 'blur', this._onBlur, this)
		    .on(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .on('focus', this._addHooks, this)
		    .on('blur', this._removeHooks, this);
	},

	removeHooks: function () {
		this._removeHooks();

		var container = this._map._container;

		L.DomEvent
		    .off(container, 'focus', this._onFocus, this)
		    .off(container, 'blur', this._onBlur, this)
		    .off(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .off('focus', this._addHooks, this)
		    .off('blur', this._removeHooks, this);
	},

	_onMouseDown: function () {
		if (this._focused) { return; }

		var body = document.body,
		    docEl = document.documentElement,
		    top = body.scrollTop || docEl.scrollTop,
		    left = body.scrollLeft || docEl.scrollLeft;

		this._map._container.focus();

		window.scrollTo(left, top);
	},

	_onFocus: function () {
		this._focused = true;
		this._map.fire('focus');
	},

	_onBlur: function () {
		this._focused = false;
		this._map.fire('blur');
	},

	_setPanOffset: function (pan) {
		var keys = this._panKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.left.length; i < len; i++) {
			keys[codes.left[i]] = [-1 * pan, 0];
		}
		for (i = 0, len = codes.right.length; i < len; i++) {
			keys[codes.right[i]] = [pan, 0];
		}
		for (i = 0, len = codes.down.length; i < len; i++) {
			keys[codes.down[i]] = [0, pan];
		}
		for (i = 0, len = codes.up.length; i < len; i++) {
			keys[codes.up[i]] = [0, -1 * pan];
		}
	},

	_setZoomOffset: function (zoom) {
		var keys = this._zoomKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
			keys[codes.zoomIn[i]] = zoom;
		}
		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
			keys[codes.zoomOut[i]] = -zoom;
		}
	},

	_addHooks: function () {
		L.DomEvent.on(document, 'keydown', this._onKeyDown, this);
	},

	_removeHooks: function () {
		L.DomEvent.off(document, 'keydown', this._onKeyDown, this);
	},

	_onKeyDown: function (e) {
		var key = e.keyCode,
		    map = this._map;

		if (key in this._panKeys) {

			if (map._panAnim && map._panAnim._inProgress) { return; }

			map.panBy(this._panKeys[key]);

			if (map.options.maxBounds) {
				map.panInsideBounds(map.options.maxBounds);
			}

		} else if (key in this._zoomKeys) {
			map.setZoom(map.getZoom() + this._zoomKeys[key]);

		} else {
			return;
		}

		L.DomEvent.stop(e);
	}
});

L.Map.addInitHook('addHandler', 'keyboard', L.Map.Keyboard);


/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */

L.Handler.MarkerDrag = L.Handler.extend({
	initialize: function (marker) {
		this._marker = marker;
	},

	addHooks: function () {
		var icon = this._marker._icon;
		if (!this._draggable) {
			this._draggable = new L.Draggable(icon, icon);
		}

		this._draggable
			.on('dragstart', this._onDragStart, this)
			.on('drag', this._onDrag, this)
			.on('dragend', this._onDragEnd, this);
		this._draggable.enable();
		L.DomUtil.addClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	removeHooks: function () {
		this._draggable
			.off('dragstart', this._onDragStart, this)
			.off('drag', this._onDrag, this)
			.off('dragend', this._onDragEnd, this);

		this._draggable.disable();
		L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		this._marker
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart');
	},

	_onDrag: function () {
		var marker = this._marker,
		    shadow = marker._shadow,
		    iconPos = L.DomUtil.getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos);

		// update shadow position
		if (shadow) {
			L.DomUtil.setPosition(shadow, iconPos);
		}

		marker._latlng = latlng;

		marker
		    .fire('move', {latlng: latlng})
		    .fire('drag');
	},

	_onDragEnd: function (e) {
		this._marker
		    .fire('moveend')
		    .fire('dragend', e);
	}
});


/*
 * L.Control is a base class for implementing map controls. Handles positioning.
 * All other controls extend from this class.
 */

L.Control = L.Class.extend({
	options: {
		position: 'topright'
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	getPosition: function () {
		return this.options.position;
	},

	setPosition: function (position) {
		var map = this._map;

		if (map) {
			map.removeControl(this);
		}

		this.options.position = position;

		if (map) {
			map.addControl(this);
		}

		return this;
	},

	getContainer: function () {
		return this._container;
	},

	addTo: function (map) {
		this._map = map;

		var container = this._container = this.onAdd(map),
		    pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		L.DomUtil.addClass(container, 'leaflet-control');

		if (pos.indexOf('bottom') !== -1) {
			corner.insertBefore(container, corner.firstChild);
		} else {
			corner.appendChild(container);
		}

		return this;
	},

	removeFrom: function (map) {
		var pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		corner.removeChild(this._container);
		this._map = null;

		if (this.onRemove) {
			this.onRemove(map);
		}

		return this;
	},

	_refocusOnMap: function () {
		if (this._map) {
			this._map.getContainer().focus();
		}
	}
});

L.control = function (options) {
	return new L.Control(options);
};


// adds control-related methods to L.Map

L.Map.include({
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	removeControl: function (control) {
		control.removeFrom(this);
		return this;
	},

	_initControlPos: function () {
		var corners = this._controlCorners = {},
		    l = 'leaflet-',
		    container = this._controlContainer =
		            L.DomUtil.create('div', l + 'control-container', this._container);

		function createCorner(vSide, hSide) {
			var className = l + vSide + ' ' + l + hSide;

			corners[vSide + hSide] = L.DomUtil.create('div', className, container);
		}

		createCorner('top', 'left');
		createCorner('top', 'right');
		createCorner('bottom', 'left');
		createCorner('bottom', 'right');
	},

	_clearControlPos: function () {
		this._container.removeChild(this._controlContainer);
	}
});


/*
 * L.Control.Zoom is used for the default zoom buttons on the map.
 */

L.Control.Zoom = L.Control.extend({
	options: {
		position: 'topleft',
		zoomInText: '+',
		zoomInTitle: 'Zoom in',
		zoomOutText: '-',
		zoomOutTitle: 'Zoom out'
	},

	onAdd: function (map) {
		var zoomName = 'leaflet-control-zoom',
		    container = L.DomUtil.create('div', zoomName + ' leaflet-bar');

		this._map = map;

		this._zoomInButton  = this._createButton(
		        this.options.zoomInText, this.options.zoomInTitle,
		        zoomName + '-in',  container, this._zoomIn,  this);
		this._zoomOutButton = this._createButton(
		        this.options.zoomOutText, this.options.zoomOutTitle,
		        zoomName + '-out', container, this._zoomOut, this);

		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	_zoomIn: function (e) {
		this._map.zoomIn(e.shiftKey ? 3 : 1);
	},

	_zoomOut: function (e) {
		this._map.zoomOut(e.shiftKey ? 3 : 1);
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
		    .on(link, 'click', stop)
		    .on(link, 'mousedown', stop)
		    .on(link, 'dblclick', stop)
		    .on(link, 'click', L.DomEvent.preventDefault)
		    .on(link, 'click', fn, context)
		    .on(link, 'click', this._refocusOnMap, context);

		return link;
	},

	_updateDisabled: function () {
		var map = this._map,
			className = 'leaflet-disabled';

		L.DomUtil.removeClass(this._zoomInButton, className);
		L.DomUtil.removeClass(this._zoomOutButton, className);

		if (map._zoom === map.getMinZoom()) {
			L.DomUtil.addClass(this._zoomOutButton, className);
		}
		if (map._zoom === map.getMaxZoom()) {
			L.DomUtil.addClass(this._zoomInButton, className);
		}
	}
});

L.Map.mergeOptions({
	zoomControl: true
});

L.Map.addInitHook(function () {
	if (this.options.zoomControl) {
		this.zoomControl = new L.Control.Zoom();
		this.addControl(this.zoomControl);
	}
});

L.control.zoom = function (options) {
	return new L.Control.Zoom(options);
};



/*
 * L.Control.Attribution is used for displaying attribution on the map (added by default).
 */

L.Control.Attribution = L.Control.extend({
	options: {
		position: 'bottomright',
		prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this._attributions = {};
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-attribution');
		L.DomEvent.disableClickPropagation(this._container);

		for (var i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution());
			}
		}
		
		map
		    .on('layeradd', this._onLayerAdd, this)
		    .on('layerremove', this._onLayerRemove, this);

		this._update();

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerAdd)
		    .off('layerremove', this._onLayerRemove);

	},

	setPrefix: function (prefix) {
		this.options.prefix = prefix;
		this._update();
		return this;
	},

	addAttribution: function (text) {
		if (!text) { return; }

		if (!this._attributions[text]) {
			this._attributions[text] = 0;
		}
		this._attributions[text]++;

		this._update();

		return this;
	},

	removeAttribution: function (text) {
		if (!text) { return; }

		if (this._attributions[text]) {
			this._attributions[text]--;
			this._update();
		}

		return this;
	},

	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' | ');
	},

	_onLayerAdd: function (e) {
		if (e.layer.getAttribution) {
			this.addAttribution(e.layer.getAttribution());
		}
	},

	_onLayerRemove: function (e) {
		if (e.layer.getAttribution) {
			this.removeAttribution(e.layer.getAttribution());
		}
	}
});

L.Map.mergeOptions({
	attributionControl: true
});

L.Map.addInitHook(function () {
	if (this.options.attributionControl) {
		this.attributionControl = (new L.Control.Attribution()).addTo(this);
	}
});

L.control.attribution = function (options) {
	return new L.Control.Attribution(options);
};


/*
 * L.Control.Scale is used for displaying metric/imperial scale on the map.
 */

L.Control.Scale = L.Control.extend({
	options: {
		position: 'bottomleft',
		maxWidth: 100,
		metric: true,
		imperial: true,
		updateWhenIdle: false
	},

	onAdd: function (map) {
		this._map = map;

		var className = 'leaflet-control-scale',
		    container = L.DomUtil.create('div', className),
		    options = this.options;

		this._addScales(options, className, container);

		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		map.whenReady(this._update, this);

		return container;
	},

	onRemove: function (map) {
		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = L.DomUtil.create('div', className + '-line', container);
		}
		if (options.imperial) {
			this._iScale = L.DomUtil.create('div', className + '-line', container);
		}
	},

	_update: function () {
		var bounds = this._map.getBounds(),
		    centerLat = bounds.getCenter().lat,
		    halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),
		    dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,

		    size = this._map.getSize(),
		    options = this.options,
		    maxMeters = 0;

		if (size.x > 0) {
			maxMeters = dist * (options.maxWidth / size.x);
		}

		this._updateScales(options, maxMeters);
	},

	_updateScales: function (options, maxMeters) {
		if (options.metric && maxMeters) {
			this._updateMetric(maxMeters);
		}

		if (options.imperial && maxMeters) {
			this._updateImperial(maxMeters);
		}
	},

	_updateMetric: function (maxMeters) {
		var meters = this._getRoundNum(maxMeters);

		this._mScale.style.width = this._getScaleWidth(meters / maxMeters) + 'px';
		this._mScale.innerHTML = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';
	},

	_updateImperial: function (maxMeters) {
		var maxFeet = maxMeters * 3.2808399,
		    scale = this._iScale,
		    maxMiles, miles, feet;

		if (maxFeet > 5280) {
			maxMiles = maxFeet / 5280;
			miles = this._getRoundNum(maxMiles);

			scale.style.width = this._getScaleWidth(miles / maxMiles) + 'px';
			scale.innerHTML = miles + ' mi';

		} else {
			feet = this._getRoundNum(maxFeet);

			scale.style.width = this._getScaleWidth(feet / maxFeet) + 'px';
			scale.innerHTML = feet + ' ft';
		}
	},

	_getScaleWidth: function (ratio) {
		return Math.round(this.options.maxWidth * ratio) - 10;
	},

	_getRoundNum: function (num) {
		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10;

		d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;

		return pow10 * d;
	}
});

L.control.scale = function (options) {
	return new L.Control.Scale(options);
};


/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.
 */

L.Control.Layers = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		autoZIndex: true
	},

	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);

		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		map
		    .on('layeradd', this._onLayerChange, this)
		    .on('layerremove', this._onLayerChange, this);

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerChange)
		    .off('layerremove', this._onLayerChange);
	},

	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		this._update();
		return this;
	},

	addOverlay: function (layer, name) {
		this._addLayer(layer, name, true);
		this._update();
		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);
		delete this._layers[id];
		this._update();
		return this;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}
			//Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
			L.DomEvent.on(form, 'click', function () {
				setTimeout(L.bind(this._onInputClick, this), 0);
			}, this);

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_addLayer: function (layer, name, overlay) {
		var id = L.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},

	_update: function () {
		if (!this._container) {
			return;
		}

		this._baseLayersList.innerHTML = '';
		this._overlaysList.innerHTML = '';

		var baseLayersPresent = false,
		    overlaysPresent = false,
		    i, obj;

		for (i in this._layers) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
		}

		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	},

	_onLayerChange: function (e) {
		var obj = this._layers[L.stamp(e.layer)];

		if (!obj) { return; }

		if (!this._handlingClick) {
			this._update();
		}

		var type = obj.overlay ?
			(e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'layeradd' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var label = document.createElement('label'),
		    input,
		    checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		label.appendChild(input);
		label.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
	}
});

L.control.layers = function (baseLayers, overlays, options) {
	return new L.Control.Layers(baseLayers, overlays, options);
};


/*
 * L.PosAnimation is used by Leaflet internally for pan animations.
 */

L.PosAnimation = L.Class.extend({
	includes: L.Mixin.Events,

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._newPos = newPos;

		this.fire('start');

		el.style[L.DomUtil.TRANSITION] = 'all ' + (duration || 0.25) +
		        's cubic-bezier(0,0,' + (easeLinearity || 0.5) + ',1)';

		L.DomEvent.on(el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);
		L.DomUtil.setPosition(el, newPos);

		// toggle reflow, Chrome flickers for some reason if you don't do this
		L.Util.falseFn(el.offsetWidth);

		// there's no native way to track value updates of transitioned properties, so we imitate this
		this._stepTimer = setInterval(L.bind(this._onStep, this), 50);
	},

	stop: function () {
		if (!this._inProgress) { return; }

		// if we just removed the transition property, the element would jump to its final position,
		// so we need to make it stay at the current position

		L.DomUtil.setPosition(this._el, this._getPos());
		this._onTransitionEnd();
		L.Util.falseFn(this._el.offsetWidth); // force reflow in case we are about to start a new animation
	},

	_onStep: function () {
		var stepPos = this._getPos();
		if (!stepPos) {
			this._onTransitionEnd();
			return;
		}
		// jshint camelcase: false
		// make L.DomUtil.getPosition return intermediate position value during animation
		this._el._leaflet_pos = stepPos;

		this.fire('step');
	},

	// you can't easily get intermediate values of properties animated with CSS3 Transitions,
	// we need to parse computed style (in case of transform it returns matrix string)

	_transformRe: /([-+]?(?:\d*\.)?\d+)\D*, ([-+]?(?:\d*\.)?\d+)\D*\)/,

	_getPos: function () {
		var left, top, matches,
		    el = this._el,
		    style = window.getComputedStyle(el);

		if (L.Browser.any3d) {
			matches = style[L.DomUtil.TRANSFORM].match(this._transformRe);
			if (!matches) { return; }
			left = parseFloat(matches[1]);
			top  = parseFloat(matches[2]);
		} else {
			left = parseFloat(style.left);
			top  = parseFloat(style.top);
		}

		return new L.Point(left, top, true);
	},

	_onTransitionEnd: function () {
		L.DomEvent.off(this._el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);

		if (!this._inProgress) { return; }
		this._inProgress = false;

		this._el.style[L.DomUtil.TRANSITION] = '';

		// jshint camelcase: false
		// make sure L.DomUtil.getPosition returns the final position value after animation
		this._el._leaflet_pos = this._newPos;

		clearInterval(this._stepTimer);

		this.fire('step').fire('end');
	}

});


/*
 * Extends L.Map to handle panning animations.
 */

L.Map.include({

	setView: function (center, zoom, options) {

		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
		center = this._limitCenter(L.latLng(center), zoom, this.options.maxBounds);
		options = options || {};

		if (this._panAnim) {
			this._panAnim.stop();
		}

		if (this._loaded && !options.reset && options !== true) {

			if (options.animate !== undefined) {
				options.zoom = L.extend({animate: options.animate}, options.zoom);
				options.pan = L.extend({animate: options.animate}, options.pan);
			}

			// try animating pan or zoom
			var animated = (this._zoom !== zoom) ?
				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
				this._tryAnimatedPan(center, options.pan);

			if (animated) {
				// prevent resize handler call, the view will refresh after animation anyway
				clearTimeout(this._sizeTimer);
				return this;
			}
		}

		// animation didn't start, just reset the map view
		this._resetView(center, zoom);

		return this;
	},

	panBy: function (offset, options) {
		offset = L.point(offset).round();
		options = options || {};

		if (!offset.x && !offset.y) {
			return this;
		}

		if (!this._panAnim) {
			this._panAnim = new L.PosAnimation();

			this._panAnim.on({
				'step': this._onPanTransitionStep,
				'end': this._onPanTransitionEnd
			}, this);
		}

		// don't fire movestart if animating inertia
		if (!options.noMoveStart) {
			this.fire('movestart');
		}

		// animate pan unless animate: false specified
		if (options.animate !== false) {
			L.DomUtil.addClass(this._mapPane, 'leaflet-pan-anim');

			var newPos = this._getMapPanePos().subtract(offset);
			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
		} else {
			this._rawPanBy(offset);
			this.fire('move').fire('moveend');
		}

		return this;
	},

	_onPanTransitionStep: function () {
		this.fire('move');
	},

	_onPanTransitionEnd: function () {
		L.DomUtil.removeClass(this._mapPane, 'leaflet-pan-anim');
		this.fire('moveend');
	},

	_tryAnimatedPan: function (center, options) {
		// difference between the new and current centers in pixels
		var offset = this._getCenterOffset(center)._floor();

		// don't animate too far unless animate: true specified in options
		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

		this.panBy(offset, options);

		return true;
	}
});


/*
 * L.PosAnimation fallback implementation that powers Leaflet pan animations
 * in browsers that don't support CSS3 Transitions.
 */

L.PosAnimation = L.DomUtil.TRANSITION ? L.PosAnimation : L.PosAnimation.extend({

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._duration = duration || 0.25;
		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

		this._startPos = L.DomUtil.getPosition(el);
		this._offset = newPos.subtract(this._startPos);
		this._startTime = +new Date();

		this.fire('start');

		this._animate();
	},

	stop: function () {
		if (!this._inProgress) { return; }

		this._step();
		this._complete();
	},

	_animate: function () {
		// animation loop
		this._animId = L.Util.requestAnimFrame(this._animate, this);
		this._step();
	},

	_step: function () {
		var elapsed = (+new Date()) - this._startTime,
		    duration = this._duration * 1000;

		if (elapsed < duration) {
			this._runFrame(this._easeOut(elapsed / duration));
		} else {
			this._runFrame(1);
			this._complete();
		}
	},

	_runFrame: function (progress) {
		var pos = this._startPos.add(this._offset.multiplyBy(progress));
		L.DomUtil.setPosition(this._el, pos);

		this.fire('step');
	},

	_complete: function () {
		L.Util.cancelAnimFrame(this._animId);

		this._inProgress = false;
		this.fire('end');
	},

	_easeOut: function (t) {
		return 1 - Math.pow(1 - t, this._easeOutPower);
	}
});


/*
 * Extends L.Map to handle zoom animations.
 */

L.Map.mergeOptions({
	zoomAnimation: true,
	zoomAnimationThreshold: 4
});

if (L.DomUtil.TRANSITION) {

	L.Map.addInitHook(function () {
		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
		this._zoomAnimated = this.options.zoomAnimation && L.DomUtil.TRANSITION &&
				L.Browser.any3d && !L.Browser.android23 && !L.Browser.mobileOpera;

		// zoom transitions run with the same duration for all layers, so if one of transitionend events
		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
		if (this._zoomAnimated) {
			L.DomEvent.on(this._mapPane, L.DomUtil.TRANSITION_END, this._catchTransitionEnd, this);
		}
	});
}

L.Map.include(!L.DomUtil.TRANSITION ? {} : {

	_catchTransitionEnd: function (e) {
		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
			this._onZoomTransitionEnd();
		}
	},

	_nothingToAnimate: function () {
		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
	},

	_tryAnimatedZoom: function (center, zoom, options) {

		if (this._animatingZoom) { return true; }

		options = options || {};

		// don't animate if disabled, not supported or zoom difference is too large
		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

		// offset is the pixel coords of the zoom origin relative to the current center
		var scale = this.getZoomScale(zoom),
		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
			origin = this._getCenterLayerPoint()._add(offset);

		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

		this
		    .fire('movestart')
		    .fire('zoomstart');

		this._animateZoom(center, zoom, origin, scale, null, true);

		return true;
	},

	_animateZoom: function (center, zoom, origin, scale, delta, backwards) {

		this._animatingZoom = true;

		// put transform transition on all layers with leaflet-zoom-animated class
		L.DomUtil.addClass(this._mapPane, 'leaflet-zoom-anim');

		// remember what center/zoom to set after animation
		this._animateToCenter = center;
		this._animateToZoom = zoom;

		// disable any dragging during animation
		if (L.Draggable) {
			L.Draggable._disabled = true;
		}

		this.fire('zoomanim', {
			center: center,
			zoom: zoom,
			origin: origin,
			scale: scale,
			delta: delta,
			backwards: backwards
		});
	},

	_onZoomTransitionEnd: function () {

		this._animatingZoom = false;

		L.DomUtil.removeClass(this._mapPane, 'leaflet-zoom-anim');

		this._resetView(this._animateToCenter, this._animateToZoom, true, true);

		if (L.Draggable) {
			L.Draggable._disabled = false;
		}
	}
});


/*
	Zoom animation logic for L.TileLayer.
*/

L.TileLayer.include({
	_animateZoom: function (e) {
		if (!this._animating) {
			this._animating = true;
			this._prepareBgBuffer();
		}

		var bg = this._bgBuffer,
		    transform = L.DomUtil.TRANSFORM,
		    initialTransform = e.delta ? L.DomUtil.getTranslateString(e.delta) : bg.style[transform],
		    scaleStr = L.DomUtil.getScaleString(e.scale, e.origin);

		bg.style[transform] = e.backwards ?
				scaleStr + ' ' + initialTransform :
				initialTransform + ' ' + scaleStr;
	},

	_endZoomAnim: function () {
		var front = this._tileContainer,
		    bg = this._bgBuffer;

		front.style.visibility = '';
		front.parentNode.appendChild(front); // Bring to fore

		// force reflow
		L.Util.falseFn(bg.offsetWidth);

		this._animating = false;
	},

	_clearBgBuffer: function () {
		var map = this._map;

		if (map && !map._animatingZoom && !map.touchZoom._zooming) {
			this._bgBuffer.innerHTML = '';
			this._bgBuffer.style[L.DomUtil.TRANSFORM] = '';
		}
	},

	_prepareBgBuffer: function () {

		var front = this._tileContainer,
		    bg = this._bgBuffer;

		// if foreground layer doesn't have many tiles but bg layer does,
		// keep the existing bg layer and just zoom it some more

		var bgLoaded = this._getLoadedTilesPercentage(bg),
		    frontLoaded = this._getLoadedTilesPercentage(front);

		if (bg && bgLoaded > 0.5 && frontLoaded < 0.5) {

			front.style.visibility = 'hidden';
			this._stopLoadingImages(front);
			return;
		}

		// prepare the buffer to become the front tile pane
		bg.style.visibility = 'hidden';
		bg.style[L.DomUtil.TRANSFORM] = '';

		// switch out the current layer to be the new bg layer (and vice-versa)
		this._tileContainer = bg;
		bg = this._bgBuffer = front;

		this._stopLoadingImages(bg);

		//prevent bg buffer from clearing right after zoom
		clearTimeout(this._clearBgBufferTimer);
	},

	_getLoadedTilesPercentage: function (container) {
		var tiles = container.getElementsByTagName('img'),
		    i, len, count = 0;

		for (i = 0, len = tiles.length; i < len; i++) {
			if (tiles[i].complete) {
				count++;
			}
		}
		return count / len;
	},

	// stops loading all tiles in the background layer
	_stopLoadingImages: function (container) {
		var tiles = Array.prototype.slice.call(container.getElementsByTagName('img')),
		    i, len, tile;

		for (i = 0, len = tiles.length; i < len; i++) {
			tile = tiles[i];

			if (!tile.complete) {
				tile.onload = L.Util.falseFn;
				tile.onerror = L.Util.falseFn;
				tile.src = L.Util.emptyImageUrl;

				tile.parentNode.removeChild(tile);
			}
		}
	}
});


/*
 * Provides L.Map with convenient shortcuts for using browser geolocation features.
 */

L.Map.include({
	_defaultLocateOptions: {
		watch: false,
		setView: false,
		maxZoom: Infinity,
		timeout: 10000,
		maximumAge: 0,
		enableHighAccuracy: false
	},

	locate: function (/*Object*/ options) {

		options = this._locateOptions = L.extend(this._defaultLocateOptions, options);

		if (!navigator.geolocation) {
			this._handleGeolocationError({
				code: 0,
				message: 'Geolocation not supported.'
			});
			return this;
		}

		var onResponse = L.bind(this._handleGeolocationResponse, this),
			onError = L.bind(this._handleGeolocationError, this);

		if (options.watch) {
			this._locationWatchId =
			        navigator.geolocation.watchPosition(onResponse, onError, options);
		} else {
			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
		}
		return this;
	},

	stopLocate: function () {
		if (navigator.geolocation) {
			navigator.geolocation.clearWatch(this._locationWatchId);
		}
		if (this._locateOptions) {
			this._locateOptions.setView = false;
		}
		return this;
	},

	_handleGeolocationError: function (error) {
		var c = error.code,
		    message = error.message ||
		            (c === 1 ? 'permission denied' :
		            (c === 2 ? 'position unavailable' : 'timeout'));

		if (this._locateOptions.setView && !this._loaded) {
			this.fitWorld();
		}

		this.fire('locationerror', {
			code: c,
			message: 'Geolocation error: ' + message + '.'
		});
	},

	_handleGeolocationResponse: function (pos) {
		var lat = pos.coords.latitude,
		    lng = pos.coords.longitude,
		    latlng = new L.LatLng(lat, lng),

		    latAccuracy = 180 * pos.coords.accuracy / 40075017,
		    lngAccuracy = latAccuracy / Math.cos(L.LatLng.DEG_TO_RAD * lat),

		    bounds = L.latLngBounds(
		            [lat - latAccuracy, lng - lngAccuracy],
		            [lat + latAccuracy, lng + lngAccuracy]),

		    options = this._locateOptions;

		if (options.setView) {
			var zoom = Math.min(this.getBoundsZoom(bounds), options.maxZoom);
			this.setView(latlng, zoom);
		}

		var data = {
			latlng: latlng,
			bounds: bounds,
			timestamp: pos.timestamp
		};

		for (var i in pos.coords) {
			if (typeof pos.coords[i] === 'number') {
				data[i] = pos.coords[i];
			}
		}

		this.fire('locationfound', data);
	}
});


}(window, document));
},{}],3:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key)
      + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.parseBody(this.text);
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var path = req.path;

  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.path = path;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":4,"reduce":5}],4:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],5:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9qYWNvYmRhbHRvbi9oYWNrYXRob24vY2FwaXRvbF9jb2RlL2FwcC5qcyIsIi9Vc2Vycy9qYWNvYmRhbHRvbi9oYWNrYXRob24vY2FwaXRvbF9jb2RlL25vZGVfbW9kdWxlcy9sZWFmbGV0L2Rpc3QvbGVhZmxldC1zcmMuanMiLCIvVXNlcnMvamFjb2JkYWx0b24vaGFja2F0aG9uL2NhcGl0b2xfY29kZS9ub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwiL1VzZXJzL2phY29iZGFsdG9uL2hhY2thdGhvbi9jYXBpdG9sX2NvZGUvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2VtaXR0ZXItY29tcG9uZW50L2luZGV4LmpzIiwiL1VzZXJzL2phY29iZGFsdG9uL2hhY2thdGhvbi9jYXBpdG9sX2NvZGUvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaDlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3A4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEwgPSByZXF1aXJlKCdsZWFmbGV0Jyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcbnZhciBtYXAgPSBMLm1hcCgnbWFwJykuc2V0VmlldyhbNDQuOTgzMywgLTkzLjI2NjczMF0sIDcpO1xuXG5pZiAoICFTdHJpbmcucHJvdG90eXBlLmNvbnRhaW5zICkge1xuICBTdHJpbmcucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZi5hcHBseSggdGhpcywgYXJndW1lbnRzICkgIT09IC0xO1xuICB9O1xufVxuXG5jb25zb2xlLmxvZygnb2hhaScpO1xuXG5MLnRpbGVMYXllcignaHR0cDovL3tzfS50aWxlLmNsb3VkbWFkZS5jb20ve2tleX0ve3N0eWxlSWR9LzI1Ni97en0ve3h9L3t5fS5wbmcnLCB7XG4gIGF0dHJpYnV0aW9uOiAnTWFwIGRhdGEgJmNvcHk7IDIwMTEgT3BlblN0cmVldE1hcCBjb250cmlidXRvcnMsIEltYWdlcnkgJmNvcHk7IDIwMTEgQ2xvdWRNYWRlJyxcbiAga2V5OiAnQkM5QTQ5M0I0MTAxNENBQUJCOThGMDQ3MUQ3NTk3MDcnLFxuICBzdHlsZUlkOiAyMjY3N1xufSkuYWRkVG8obWFwKTtcblxuTC5JY29uLkRlZmF1bHQuaW1hZ2VQYXRoID0gJ2ltYWdlcyc7XG5cbnZhciBtYXJrZXRJY29uID0gTC5pY29uKHtcbiAgICBpY29uVXJsOiAnaW1hZ2VzL21hcmtldC5wbmcnXG59KTtcblxucmVxdWVzdC5nZXQoJ21pbm5lc290YV9ncm93bi5nZW9qc29uJykuZW5kKGZ1bmN0aW9uKHJlcykge1xuICBpZihyZXMudGV4dCkge1xuICAgIEwuZ2VvSnNvbihKU09OLnBhcnNlKHJlcy50ZXh0KSwge1xuICAgICAgICAgICAgICBvbkVhY2hGZWF0dXJlOiBtYWtlUG9wdXBzLFxuICAgICAgICAgICAgICBwb2ludFRvTGF5ZXI6IG1ha2VNYXJrZXJzXG4gICAgfSkuYWRkVG8obWFwKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIG1ha2VQb3B1cHMoZmVhdHVyZSwgbGF5ZXIpIHtcbiAgY29uc29sZS5sb2coZmVhdHVyZSk7XG4gIHZhciBwcm9wcyA9IGZlYXR1cmUucHJvcGVydGllcztcbiAgaWYgKHByb3BzKSB7XG4gICAgbGF5ZXIuYmluZFBvcHVwKFwiPGgzPlwiICsgcHJvcHMubmFtZSArIFwiPC9oMz48ZGl2IGNsYXNzPSdpdGFsaWMnPlwiICsgcHJvcHMucHJvZHVjdHMgKyBcIjwvZGl2PjxkaXY+XCIgKyBwcm9wcy5kZXNjcmlwdGlvbiArIFwiPC9kaXY+XCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VNYXJrZXJzKGZlYXR1cmUsIGxhdGxuZykge1xuICB2YXIgcHJvcHMgPSBmZWF0dXJlLnByb3BlcnRpZXM7XG4gIHZhciBteUljb24gPSBudWxsO1xuICB2YXIgbXlDb2xvciA9IFwiIzAwMFwiO1xuICBpZiAocHJvcHMpIHtcbiAgICB2YXIgcHJvZCA9IHByb3BzLnByb2R1Y3RzO1xuICAgIGlmKHByb2QuY29udGFpbnMoXCJGYXJtZXJzIE1hcmtldFwiKSkge1xuICAgICAgbXlDb2xvciA9IFwiIzAwZlwiO1xuICAgIH1cbiAgICBpZihwcm9kLmNvbnRhaW5zKFwiQ293XCIpIHx8IHByb2QuY29udGFpbnMoXCJEYWlyeVwiKSkge1xuICAgICAgbXlDb2xvciA9IFwiI2ZmZlwiO1xuICAgIH1cbiAgICBpZihwcm9kLmNvbnRhaW5zKFwiUHVtcGtpblwiKSkge1xuICAgICAgbXlDb2xvciA9IFwiI2ZmYTUwMFwiO1xuICAgIH1cbiAgICBpZihwcm9kLmNvbnRhaW5zKFwiQ1NBXCIpKSB7XG4gICAgICBteUNvbG9yID0gXCIjMGYwXCI7XG4gICAgfVxuICAgIGlmKHByb2QuY29udGFpbnMoXCJXaW5lXCIpKSB7XG4gICAgICBteUNvbG9yID0gXCIjZjAwXCI7XG4gICAgfVxuICAgIGlmKHByb2QuY29udGFpbnMoXCJCZWVmXCIpKSB7XG4gICAgICBteUNvbG9yID0gXCIjZGVkYmVmXCI7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXcgTC5jaXJjbGVNYXJrZXIobGF0bG5nLCB7ZmlsbENvbG9yOiBteUNvbG9yLCBmaWxsT3BhY2l0eTogLjgsIHN0cm9rZTogZmFsc2V9KTtcbn1cblxuIiwiLypcbiBMZWFmbGV0LCBhIEphdmFTY3JpcHQgbGlicmFyeSBmb3IgbW9iaWxlLWZyaWVuZGx5IGludGVyYWN0aXZlIG1hcHMuIGh0dHA6Ly9sZWFmbGV0anMuY29tXG4gKGMpIDIwMTAtMjAxMywgVmxhZGltaXIgQWdhZm9ua2luXG4gKGMpIDIwMTAtMjAxMSwgQ2xvdWRNYWRlXG4qL1xuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcclxudmFyIG9sZEwgPSB3aW5kb3cuTCxcclxuICAgIEwgPSB7fTtcclxuXHJcbkwudmVyc2lvbiA9ICcwLjcuMic7XHJcblxyXG4vLyBkZWZpbmUgTGVhZmxldCBmb3IgTm9kZSBtb2R1bGUgcGF0dGVybiBsb2FkZXJzLCBpbmNsdWRpbmcgQnJvd3NlcmlmeVxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG5cdG1vZHVsZS5leHBvcnRzID0gTDtcclxuXHJcbi8vIGRlZmluZSBMZWFmbGV0IGFzIGFuIEFNRCBtb2R1bGVcclxufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuXHRkZWZpbmUoTCk7XHJcbn1cclxuXHJcbi8vIGRlZmluZSBMZWFmbGV0IGFzIGEgZ2xvYmFsIEwgdmFyaWFibGUsIHNhdmluZyB0aGUgb3JpZ2luYWwgTCB0byByZXN0b3JlIGxhdGVyIGlmIG5lZWRlZFxyXG5cclxuTC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdHdpbmRvdy5MID0gb2xkTDtcclxuXHRyZXR1cm4gdGhpcztcclxufTtcclxuXHJcbndpbmRvdy5MID0gTDtcclxuXG5cbi8qXHJcbiAqIEwuVXRpbCBjb250YWlucyB2YXJpb3VzIHV0aWxpdHkgZnVuY3Rpb25zIHVzZWQgdGhyb3VnaG91dCBMZWFmbGV0IGNvZGUuXHJcbiAqL1xyXG5cclxuTC5VdGlsID0ge1xyXG5cdGV4dGVuZDogZnVuY3Rpb24gKGRlc3QpIHsgLy8gKE9iamVjdFssIE9iamVjdCwgLi4uXSkgLT5cclxuXHRcdHZhciBzb3VyY2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcclxuXHRcdCAgICBpLCBqLCBsZW4sIHNyYztcclxuXHJcblx0XHRmb3IgKGogPSAwLCBsZW4gPSBzb3VyY2VzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XHJcblx0XHRcdHNyYyA9IHNvdXJjZXNbal0gfHwge307XHJcblx0XHRcdGZvciAoaSBpbiBzcmMpIHtcclxuXHRcdFx0XHRpZiAoc3JjLmhhc093blByb3BlcnR5KGkpKSB7XHJcblx0XHRcdFx0XHRkZXN0W2ldID0gc3JjW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGRlc3Q7XHJcblx0fSxcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKGZuLCBvYmopIHsgLy8gKEZ1bmN0aW9uLCBPYmplY3QpIC0+IEZ1bmN0aW9uXHJcblx0XHR2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSA6IG51bGw7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gZm4uYXBwbHkob2JqLCBhcmdzIHx8IGFyZ3VtZW50cyk7XHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdHN0YW1wOiAoZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGxhc3RJZCA9IDAsXHJcblx0XHQgICAga2V5ID0gJ19sZWFmbGV0X2lkJztcclxuXHRcdHJldHVybiBmdW5jdGlvbiAob2JqKSB7XHJcblx0XHRcdG9ialtrZXldID0gb2JqW2tleV0gfHwgKytsYXN0SWQ7XHJcblx0XHRcdHJldHVybiBvYmpba2V5XTtcclxuXHRcdH07XHJcblx0fSgpKSxcclxuXHJcblx0aW52b2tlRWFjaDogZnVuY3Rpb24gKG9iaiwgbWV0aG9kLCBjb250ZXh0KSB7XHJcblx0XHR2YXIgaSwgYXJncztcclxuXHJcblx0XHRpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcclxuXHRcdFx0YXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XHJcblxyXG5cdFx0XHRmb3IgKGkgaW4gb2JqKSB7XHJcblx0XHRcdFx0bWV0aG9kLmFwcGx5KGNvbnRleHQsIFtpLCBvYmpbaV1dLmNvbmNhdChhcmdzKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdGxpbWl0RXhlY0J5SW50ZXJ2YWw6IGZ1bmN0aW9uIChmbiwgdGltZSwgY29udGV4dCkge1xyXG5cdFx0dmFyIGxvY2ssIGV4ZWNPblVubG9jaztcclxuXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24gd3JhcHBlckZuKCkge1xyXG5cdFx0XHR2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuXHJcblx0XHRcdGlmIChsb2NrKSB7XHJcblx0XHRcdFx0ZXhlY09uVW5sb2NrID0gdHJ1ZTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxvY2sgPSB0cnVlO1xyXG5cclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bG9jayA9IGZhbHNlO1xyXG5cclxuXHRcdFx0XHRpZiAoZXhlY09uVW5sb2NrKSB7XHJcblx0XHRcdFx0XHR3cmFwcGVyRm4uYXBwbHkoY29udGV4dCwgYXJncyk7XHJcblx0XHRcdFx0XHRleGVjT25VbmxvY2sgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHRpbWUpO1xyXG5cclxuXHRcdFx0Zm4uYXBwbHkoY29udGV4dCwgYXJncyk7XHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdGZhbHNlRm46IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHRmb3JtYXROdW06IGZ1bmN0aW9uIChudW0sIGRpZ2l0cykge1xyXG5cdFx0dmFyIHBvdyA9IE1hdGgucG93KDEwLCBkaWdpdHMgfHwgNSk7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChudW0gKiBwb3cpIC8gcG93O1xyXG5cdH0sXHJcblxyXG5cdHRyaW06IGZ1bmN0aW9uIChzdHIpIHtcclxuXHRcdHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xyXG5cdH0sXHJcblxyXG5cdHNwbGl0V29yZHM6IGZ1bmN0aW9uIChzdHIpIHtcclxuXHRcdHJldHVybiBMLlV0aWwudHJpbShzdHIpLnNwbGl0KC9cXHMrLyk7XHJcblx0fSxcclxuXHJcblx0c2V0T3B0aW9uczogZnVuY3Rpb24gKG9iaiwgb3B0aW9ucykge1xyXG5cdFx0b2JqLm9wdGlvbnMgPSBMLmV4dGVuZCh7fSwgb2JqLm9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cdFx0cmV0dXJuIG9iai5vcHRpb25zO1xyXG5cdH0sXHJcblxyXG5cdGdldFBhcmFtU3RyaW5nOiBmdW5jdGlvbiAob2JqLCBleGlzdGluZ1VybCwgdXBwZXJjYXNlKSB7XHJcblx0XHR2YXIgcGFyYW1zID0gW107XHJcblx0XHRmb3IgKHZhciBpIGluIG9iaikge1xyXG5cdFx0XHRwYXJhbXMucHVzaChlbmNvZGVVUklDb21wb25lbnQodXBwZXJjYXNlID8gaS50b1VwcGVyQ2FzZSgpIDogaSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2ldKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gKCghZXhpc3RpbmdVcmwgfHwgZXhpc3RpbmdVcmwuaW5kZXhPZignPycpID09PSAtMSkgPyAnPycgOiAnJicpICsgcGFyYW1zLmpvaW4oJyYnKTtcclxuXHR9LFxyXG5cdHRlbXBsYXRlOiBmdW5jdGlvbiAoc3RyLCBkYXRhKSB7XHJcblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoL1xceyAqKFtcXHdfXSspICpcXH0vZywgZnVuY3Rpb24gKHN0ciwga2V5KSB7XHJcblx0XHRcdHZhciB2YWx1ZSA9IGRhdGFba2V5XTtcclxuXHRcdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ05vIHZhbHVlIHByb3ZpZGVkIGZvciB2YXJpYWJsZSAnICsgc3RyKTtcclxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlKGRhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdGlzQXJyYXk6IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xyXG5cdFx0cmV0dXJuIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJyk7XHJcblx0fSxcclxuXHJcblx0ZW1wdHlJbWFnZVVybDogJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBQUQvQUN3QUFBQUFBUUFCQUFBQ0FEcz0nXHJcbn07XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG5cclxuXHQvLyBpbnNwaXJlZCBieSBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xyXG5cclxuXHRmdW5jdGlvbiBnZXRQcmVmaXhlZChuYW1lKSB7XHJcblx0XHR2YXIgaSwgZm4sXHJcblx0XHQgICAgcHJlZml4ZXMgPSBbJ3dlYmtpdCcsICdtb3onLCAnbycsICdtcyddO1xyXG5cclxuXHRcdGZvciAoaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGggJiYgIWZuOyBpKyspIHtcclxuXHRcdFx0Zm4gPSB3aW5kb3dbcHJlZml4ZXNbaV0gKyBuYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZm47XHJcblx0fVxyXG5cclxuXHR2YXIgbGFzdFRpbWUgPSAwO1xyXG5cclxuXHRmdW5jdGlvbiB0aW1lb3V0RGVmZXIoZm4pIHtcclxuXHRcdHZhciB0aW1lID0gK25ldyBEYXRlKCksXHJcblx0XHQgICAgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKHRpbWUgLSBsYXN0VGltZSkpO1xyXG5cclxuXHRcdGxhc3RUaW1lID0gdGltZSArIHRpbWVUb0NhbGw7XHJcblx0XHRyZXR1cm4gd2luZG93LnNldFRpbWVvdXQoZm4sIHRpbWVUb0NhbGwpO1xyXG5cdH1cclxuXHJcblx0dmFyIHJlcXVlc3RGbiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuXHQgICAgICAgIGdldFByZWZpeGVkKCdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnKSB8fCB0aW1lb3V0RGVmZXI7XHJcblxyXG5cdHZhciBjYW5jZWxGbiA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fFxyXG5cdCAgICAgICAgZ2V0UHJlZml4ZWQoJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJykgfHxcclxuXHQgICAgICAgIGdldFByZWZpeGVkKCdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnKSB8fFxyXG5cdCAgICAgICAgZnVuY3Rpb24gKGlkKSB7IHdpbmRvdy5jbGVhclRpbWVvdXQoaWQpOyB9O1xyXG5cclxuXHJcblx0TC5VdGlsLnJlcXVlc3RBbmltRnJhbWUgPSBmdW5jdGlvbiAoZm4sIGNvbnRleHQsIGltbWVkaWF0ZSwgZWxlbWVudCkge1xyXG5cdFx0Zm4gPSBMLmJpbmQoZm4sIGNvbnRleHQpO1xyXG5cclxuXHRcdGlmIChpbW1lZGlhdGUgJiYgcmVxdWVzdEZuID09PSB0aW1lb3V0RGVmZXIpIHtcclxuXHRcdFx0Zm4oKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiByZXF1ZXN0Rm4uY2FsbCh3aW5kb3csIGZuLCBlbGVtZW50KTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRMLlV0aWwuY2FuY2VsQW5pbUZyYW1lID0gZnVuY3Rpb24gKGlkKSB7XHJcblx0XHRpZiAoaWQpIHtcclxuXHRcdFx0Y2FuY2VsRm4uY2FsbCh3aW5kb3csIGlkKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxufSgpKTtcclxuXHJcbi8vIHNob3J0Y3V0cyBmb3IgbW9zdCB1c2VkIHV0aWxpdHkgZnVuY3Rpb25zXHJcbkwuZXh0ZW5kID0gTC5VdGlsLmV4dGVuZDtcclxuTC5iaW5kID0gTC5VdGlsLmJpbmQ7XHJcbkwuc3RhbXAgPSBMLlV0aWwuc3RhbXA7XHJcbkwuc2V0T3B0aW9ucyA9IEwuVXRpbC5zZXRPcHRpb25zO1xyXG5cblxuLypcclxuICogTC5DbGFzcyBwb3dlcnMgdGhlIE9PUCBmYWNpbGl0aWVzIG9mIHRoZSBsaWJyYXJ5LlxyXG4gKiBUaGFua3MgdG8gSm9obiBSZXNpZyBhbmQgRGVhbiBFZHdhcmRzIGZvciBpbnNwaXJhdGlvbiFcclxuICovXHJcblxyXG5MLkNsYXNzID0gZnVuY3Rpb24gKCkge307XHJcblxyXG5MLkNsYXNzLmV4dGVuZCA9IGZ1bmN0aW9uIChwcm9wcykge1xyXG5cclxuXHQvLyBleHRlbmRlZCBjbGFzcyB3aXRoIHRoZSBuZXcgcHJvdG90eXBlXHJcblx0dmFyIE5ld0NsYXNzID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIGNhbGwgdGhlIGNvbnN0cnVjdG9yXHJcblx0XHRpZiAodGhpcy5pbml0aWFsaXplKSB7XHJcblx0XHRcdHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGNhbGwgYWxsIGNvbnN0cnVjdG9yIGhvb2tzXHJcblx0XHRpZiAodGhpcy5faW5pdEhvb2tzKSB7XHJcblx0XHRcdHRoaXMuY2FsbEluaXRIb29rcygpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vIGluc3RhbnRpYXRlIGNsYXNzIHdpdGhvdXQgY2FsbGluZyBjb25zdHJ1Y3RvclxyXG5cdHZhciBGID0gZnVuY3Rpb24gKCkge307XHJcblx0Ri5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcclxuXHJcblx0dmFyIHByb3RvID0gbmV3IEYoKTtcclxuXHRwcm90by5jb25zdHJ1Y3RvciA9IE5ld0NsYXNzO1xyXG5cclxuXHROZXdDbGFzcy5wcm90b3R5cGUgPSBwcm90bztcclxuXHJcblx0Ly9pbmhlcml0IHBhcmVudCdzIHN0YXRpY3NcclxuXHRmb3IgKHZhciBpIGluIHRoaXMpIHtcclxuXHRcdGlmICh0aGlzLmhhc093blByb3BlcnR5KGkpICYmIGkgIT09ICdwcm90b3R5cGUnKSB7XHJcblx0XHRcdE5ld0NsYXNzW2ldID0gdGhpc1tpXTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIG1peCBzdGF0aWMgcHJvcGVydGllcyBpbnRvIHRoZSBjbGFzc1xyXG5cdGlmIChwcm9wcy5zdGF0aWNzKSB7XHJcblx0XHRMLmV4dGVuZChOZXdDbGFzcywgcHJvcHMuc3RhdGljcyk7XHJcblx0XHRkZWxldGUgcHJvcHMuc3RhdGljcztcclxuXHR9XHJcblxyXG5cdC8vIG1peCBpbmNsdWRlcyBpbnRvIHRoZSBwcm90b3R5cGVcclxuXHRpZiAocHJvcHMuaW5jbHVkZXMpIHtcclxuXHRcdEwuVXRpbC5leHRlbmQuYXBwbHkobnVsbCwgW3Byb3RvXS5jb25jYXQocHJvcHMuaW5jbHVkZXMpKTtcclxuXHRcdGRlbGV0ZSBwcm9wcy5pbmNsdWRlcztcclxuXHR9XHJcblxyXG5cdC8vIG1lcmdlIG9wdGlvbnNcclxuXHRpZiAocHJvcHMub3B0aW9ucyAmJiBwcm90by5vcHRpb25zKSB7XHJcblx0XHRwcm9wcy5vcHRpb25zID0gTC5leHRlbmQoe30sIHByb3RvLm9wdGlvbnMsIHByb3BzLm9wdGlvbnMpO1xyXG5cdH1cclxuXHJcblx0Ly8gbWl4IGdpdmVuIHByb3BlcnRpZXMgaW50byB0aGUgcHJvdG90eXBlXHJcblx0TC5leHRlbmQocHJvdG8sIHByb3BzKTtcclxuXHJcblx0cHJvdG8uX2luaXRIb29rcyA9IFtdO1xyXG5cclxuXHR2YXIgcGFyZW50ID0gdGhpcztcclxuXHQvLyBqc2hpbnQgY2FtZWxjYXNlOiBmYWxzZVxyXG5cdE5ld0NsYXNzLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XHJcblxyXG5cdC8vIGFkZCBtZXRob2QgZm9yIGNhbGxpbmcgYWxsIGhvb2tzXHJcblx0cHJvdG8uY2FsbEluaXRIb29rcyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5faW5pdEhvb2tzQ2FsbGVkKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGlmIChwYXJlbnQucHJvdG90eXBlLmNhbGxJbml0SG9va3MpIHtcclxuXHRcdFx0cGFyZW50LnByb3RvdHlwZS5jYWxsSW5pdEhvb2tzLmNhbGwodGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faW5pdEhvb2tzQ2FsbGVkID0gdHJ1ZTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gcHJvdG8uX2luaXRIb29rcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRwcm90by5faW5pdEhvb2tzW2ldLmNhbGwodGhpcyk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0cmV0dXJuIE5ld0NsYXNzO1xyXG59O1xyXG5cclxuXHJcbi8vIG1ldGhvZCBmb3IgYWRkaW5nIHByb3BlcnRpZXMgdG8gcHJvdG90eXBlXHJcbkwuQ2xhc3MuaW5jbHVkZSA9IGZ1bmN0aW9uIChwcm9wcykge1xyXG5cdEwuZXh0ZW5kKHRoaXMucHJvdG90eXBlLCBwcm9wcyk7XHJcbn07XHJcblxyXG4vLyBtZXJnZSBuZXcgZGVmYXVsdCBvcHRpb25zIHRvIHRoZSBDbGFzc1xyXG5MLkNsYXNzLm1lcmdlT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0TC5leHRlbmQodGhpcy5wcm90b3R5cGUub3B0aW9ucywgb3B0aW9ucyk7XHJcbn07XHJcblxyXG4vLyBhZGQgYSBjb25zdHJ1Y3RvciBob29rXHJcbkwuQ2xhc3MuYWRkSW5pdEhvb2sgPSBmdW5jdGlvbiAoZm4pIHsgLy8gKEZ1bmN0aW9uKSB8fCAoU3RyaW5nLCBhcmdzLi4uKVxyXG5cdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuXHJcblx0dmFyIGluaXQgPSB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgPyBmbiA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXNbZm5dLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMucHJvdG90eXBlLl9pbml0SG9va3MgPSB0aGlzLnByb3RvdHlwZS5faW5pdEhvb2tzIHx8IFtdO1xyXG5cdHRoaXMucHJvdG90eXBlLl9pbml0SG9va3MucHVzaChpbml0KTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuTWl4aW4uRXZlbnRzIGlzIHVzZWQgdG8gYWRkIGN1c3RvbSBldmVudHMgZnVuY3Rpb25hbGl0eSB0byBMZWFmbGV0IGNsYXNzZXMuXHJcbiAqL1xyXG5cclxudmFyIGV2ZW50c0tleSA9ICdfbGVhZmxldF9ldmVudHMnO1xyXG5cclxuTC5NaXhpbiA9IHt9O1xyXG5cclxuTC5NaXhpbi5FdmVudHMgPSB7XHJcblxyXG5cdGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uICh0eXBlcywgZm4sIGNvbnRleHQpIHsgLy8gKFN0cmluZywgRnVuY3Rpb25bLCBPYmplY3RdKSBvciAoT2JqZWN0WywgT2JqZWN0XSlcclxuXHJcblx0XHQvLyB0eXBlcyBjYW4gYmUgYSBtYXAgb2YgdHlwZXMvaGFuZGxlcnNcclxuXHRcdGlmIChMLlV0aWwuaW52b2tlRWFjaCh0eXBlcywgdGhpcy5hZGRFdmVudExpc3RlbmVyLCB0aGlzLCBmbiwgY29udGV4dCkpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHR2YXIgZXZlbnRzID0gdGhpc1tldmVudHNLZXldID0gdGhpc1tldmVudHNLZXldIHx8IHt9LFxyXG5cdFx0ICAgIGNvbnRleHRJZCA9IGNvbnRleHQgJiYgY29udGV4dCAhPT0gdGhpcyAmJiBMLnN0YW1wKGNvbnRleHQpLFxyXG5cdFx0ICAgIGksIGxlbiwgZXZlbnQsIHR5cGUsIGluZGV4S2V5LCBpbmRleExlbktleSwgdHlwZUluZGV4O1xyXG5cclxuXHRcdC8vIHR5cGVzIGNhbiBiZSBhIHN0cmluZyBvZiBzcGFjZS1zZXBhcmF0ZWQgd29yZHNcclxuXHRcdHR5cGVzID0gTC5VdGlsLnNwbGl0V29yZHModHlwZXMpO1xyXG5cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHR5cGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdGV2ZW50ID0ge1xyXG5cdFx0XHRcdGFjdGlvbjogZm4sXHJcblx0XHRcdFx0Y29udGV4dDogY29udGV4dCB8fCB0aGlzXHJcblx0XHRcdH07XHJcblx0XHRcdHR5cGUgPSB0eXBlc1tpXTtcclxuXHJcblx0XHRcdGlmIChjb250ZXh0SWQpIHtcclxuXHRcdFx0XHQvLyBzdG9yZSBsaXN0ZW5lcnMgb2YgYSBwYXJ0aWN1bGFyIGNvbnRleHQgaW4gYSBzZXBhcmF0ZSBoYXNoIChpZiBpdCBoYXMgYW4gaWQpXHJcblx0XHRcdFx0Ly8gZ2l2ZXMgYSBtYWpvciBwZXJmb3JtYW5jZSBib29zdCB3aGVuIHJlbW92aW5nIHRob3VzYW5kcyBvZiBtYXAgbGF5ZXJzXHJcblxyXG5cdFx0XHRcdGluZGV4S2V5ID0gdHlwZSArICdfaWR4JztcclxuXHRcdFx0XHRpbmRleExlbktleSA9IGluZGV4S2V5ICsgJ19sZW4nO1xyXG5cclxuXHRcdFx0XHR0eXBlSW5kZXggPSBldmVudHNbaW5kZXhLZXldID0gZXZlbnRzW2luZGV4S2V5XSB8fCB7fTtcclxuXHJcblx0XHRcdFx0aWYgKCF0eXBlSW5kZXhbY29udGV4dElkXSkge1xyXG5cdFx0XHRcdFx0dHlwZUluZGV4W2NvbnRleHRJZF0gPSBbXTtcclxuXHJcblx0XHRcdFx0XHQvLyBrZWVwIHRyYWNrIG9mIHRoZSBudW1iZXIgb2Yga2V5cyBpbiB0aGUgaW5kZXggdG8gcXVpY2tseSBjaGVjayBpZiBpdCdzIGVtcHR5XHJcblx0XHRcdFx0XHRldmVudHNbaW5kZXhMZW5LZXldID0gKGV2ZW50c1tpbmRleExlbktleV0gfHwgMCkgKyAxO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dHlwZUluZGV4W2NvbnRleHRJZF0ucHVzaChldmVudCk7XHJcblxyXG5cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRldmVudHNbdHlwZV0gPSBldmVudHNbdHlwZV0gfHwgW107XHJcblx0XHRcdFx0ZXZlbnRzW3R5cGVdLnB1c2goZXZlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0aGFzRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICh0eXBlKSB7IC8vIChTdHJpbmcpIC0+IEJvb2xlYW5cclxuXHRcdHZhciBldmVudHMgPSB0aGlzW2V2ZW50c0tleV07XHJcblx0XHRyZXR1cm4gISFldmVudHMgJiYgKCh0eXBlIGluIGV2ZW50cyAmJiBldmVudHNbdHlwZV0ubGVuZ3RoID4gMCkgfHxcclxuXHRcdCAgICAgICAgICAgICAgICAgICAgKHR5cGUgKyAnX2lkeCcgaW4gZXZlbnRzICYmIGV2ZW50c1t0eXBlICsgJ19pZHhfbGVuJ10gPiAwKSk7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKHR5cGVzLCBmbiwgY29udGV4dCkgeyAvLyAoW1N0cmluZywgRnVuY3Rpb24sIE9iamVjdF0pIG9yIChPYmplY3RbLCBPYmplY3RdKVxyXG5cclxuXHRcdGlmICghdGhpc1tldmVudHNLZXldKSB7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghdHlwZXMpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xlYXJBbGxFdmVudExpc3RlbmVycygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChMLlV0aWwuaW52b2tlRWFjaCh0eXBlcywgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyLCB0aGlzLCBmbiwgY29udGV4dCkpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHR2YXIgZXZlbnRzID0gdGhpc1tldmVudHNLZXldLFxyXG5cdFx0ICAgIGNvbnRleHRJZCA9IGNvbnRleHQgJiYgY29udGV4dCAhPT0gdGhpcyAmJiBMLnN0YW1wKGNvbnRleHQpLFxyXG5cdFx0ICAgIGksIGxlbiwgdHlwZSwgbGlzdGVuZXJzLCBqLCBpbmRleEtleSwgaW5kZXhMZW5LZXksIHR5cGVJbmRleCwgcmVtb3ZlZDtcclxuXHJcblx0XHR0eXBlcyA9IEwuVXRpbC5zcGxpdFdvcmRzKHR5cGVzKTtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSB0eXBlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHR0eXBlID0gdHlwZXNbaV07XHJcblx0XHRcdGluZGV4S2V5ID0gdHlwZSArICdfaWR4JztcclxuXHRcdFx0aW5kZXhMZW5LZXkgPSBpbmRleEtleSArICdfbGVuJztcclxuXHJcblx0XHRcdHR5cGVJbmRleCA9IGV2ZW50c1tpbmRleEtleV07XHJcblxyXG5cdFx0XHRpZiAoIWZuKSB7XHJcblx0XHRcdFx0Ly8gY2xlYXIgYWxsIGxpc3RlbmVycyBmb3IgYSB0eXBlIGlmIGZ1bmN0aW9uIGlzbid0IHNwZWNpZmllZFxyXG5cdFx0XHRcdGRlbGV0ZSBldmVudHNbdHlwZV07XHJcblx0XHRcdFx0ZGVsZXRlIGV2ZW50c1tpbmRleEtleV07XHJcblx0XHRcdFx0ZGVsZXRlIGV2ZW50c1tpbmRleExlbktleV07XHJcblxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxpc3RlbmVycyA9IGNvbnRleHRJZCAmJiB0eXBlSW5kZXggPyB0eXBlSW5kZXhbY29udGV4dElkXSA6IGV2ZW50c1t0eXBlXTtcclxuXHJcblx0XHRcdFx0aWYgKGxpc3RlbmVycykge1xyXG5cdFx0XHRcdFx0Zm9yIChqID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XHJcblx0XHRcdFx0XHRcdGlmICgobGlzdGVuZXJzW2pdLmFjdGlvbiA9PT0gZm4pICYmICghY29udGV4dCB8fCAobGlzdGVuZXJzW2pdLmNvbnRleHQgPT09IGNvbnRleHQpKSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlbW92ZWQgPSBsaXN0ZW5lcnMuc3BsaWNlKGosIDEpO1xyXG5cdFx0XHRcdFx0XHRcdC8vIHNldCB0aGUgb2xkIGFjdGlvbiB0byBhIG5vLW9wLCBiZWNhdXNlIGl0IGlzIHBvc3NpYmxlXHJcblx0XHRcdFx0XHRcdFx0Ly8gdGhhdCB0aGUgbGlzdGVuZXIgaXMgYmVpbmcgaXRlcmF0ZWQgb3ZlciBhcyBwYXJ0IG9mIGEgZGlzcGF0Y2hcclxuXHRcdFx0XHRcdFx0XHRyZW1vdmVkWzBdLmFjdGlvbiA9IEwuVXRpbC5mYWxzZUZuO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKGNvbnRleHQgJiYgdHlwZUluZGV4ICYmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSkge1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgdHlwZUluZGV4W2NvbnRleHRJZF07XHJcblx0XHRcdFx0XHRcdGV2ZW50c1tpbmRleExlbktleV0tLTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRjbGVhckFsbEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRkZWxldGUgdGhpc1tldmVudHNLZXldO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0ZmlyZUV2ZW50OiBmdW5jdGlvbiAodHlwZSwgZGF0YSkgeyAvLyAoU3RyaW5nWywgT2JqZWN0XSlcclxuXHRcdGlmICghdGhpcy5oYXNFdmVudExpc3RlbmVycyh0eXBlKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZXZlbnQgPSBMLlV0aWwuZXh0ZW5kKHt9LCBkYXRhLCB7IHR5cGU6IHR5cGUsIHRhcmdldDogdGhpcyB9KTtcclxuXHJcblx0XHR2YXIgZXZlbnRzID0gdGhpc1tldmVudHNLZXldLFxyXG5cdFx0ICAgIGxpc3RlbmVycywgaSwgbGVuLCB0eXBlSW5kZXgsIGNvbnRleHRJZDtcclxuXHJcblx0XHRpZiAoZXZlbnRzW3R5cGVdKSB7XHJcblx0XHRcdC8vIG1ha2Ugc3VyZSBhZGRpbmcvcmVtb3ZpbmcgbGlzdGVuZXJzIGluc2lkZSBvdGhlciBsaXN0ZW5lcnMgd29uJ3QgY2F1c2UgaW5maW5pdGUgbG9vcFxyXG5cdFx0XHRsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV0uc2xpY2UoKTtcclxuXHJcblx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdGxpc3RlbmVyc1tpXS5hY3Rpb24uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgZXZlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZmlyZSBldmVudCBmb3IgdGhlIGNvbnRleHQtaW5kZXhlZCBsaXN0ZW5lcnMgYXMgd2VsbFxyXG5cdFx0dHlwZUluZGV4ID0gZXZlbnRzW3R5cGUgKyAnX2lkeCddO1xyXG5cclxuXHRcdGZvciAoY29udGV4dElkIGluIHR5cGVJbmRleCkge1xyXG5cdFx0XHRsaXN0ZW5lcnMgPSB0eXBlSW5kZXhbY29udGV4dElkXS5zbGljZSgpO1xyXG5cclxuXHRcdFx0aWYgKGxpc3RlbmVycykge1xyXG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdFx0bGlzdGVuZXJzW2ldLmFjdGlvbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBldmVudCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YWRkT25lVGltZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uICh0eXBlcywgZm4sIGNvbnRleHQpIHtcclxuXHJcblx0XHRpZiAoTC5VdGlsLmludm9rZUVhY2godHlwZXMsIHRoaXMuYWRkT25lVGltZUV2ZW50TGlzdGVuZXIsIHRoaXMsIGZuLCBjb250ZXh0KSkgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdHZhciBoYW5kbGVyID0gTC5iaW5kKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0dGhpc1xyXG5cdFx0XHQgICAgLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZXMsIGZuLCBjb250ZXh0KVxyXG5cdFx0XHQgICAgLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZXMsIGhhbmRsZXIsIGNvbnRleHQpO1xyXG5cdFx0fSwgdGhpcyk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXNcclxuXHRcdCAgICAuYWRkRXZlbnRMaXN0ZW5lcih0eXBlcywgZm4sIGNvbnRleHQpXHJcblx0XHQgICAgLmFkZEV2ZW50TGlzdGVuZXIodHlwZXMsIGhhbmRsZXIsIGNvbnRleHQpO1xyXG5cdH1cclxufTtcclxuXHJcbkwuTWl4aW4uRXZlbnRzLm9uID0gTC5NaXhpbi5FdmVudHMuYWRkRXZlbnRMaXN0ZW5lcjtcclxuTC5NaXhpbi5FdmVudHMub2ZmID0gTC5NaXhpbi5FdmVudHMucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcclxuTC5NaXhpbi5FdmVudHMub25jZSA9IEwuTWl4aW4uRXZlbnRzLmFkZE9uZVRpbWVFdmVudExpc3RlbmVyO1xyXG5MLk1peGluLkV2ZW50cy5maXJlID0gTC5NaXhpbi5FdmVudHMuZmlyZUV2ZW50O1xyXG5cblxuLypcclxuICogTC5Ccm93c2VyIGhhbmRsZXMgZGlmZmVyZW50IGJyb3dzZXIgYW5kIGZlYXR1cmUgZGV0ZWN0aW9ucyBmb3IgaW50ZXJuYWwgTGVhZmxldCB1c2UuXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuXHJcblx0dmFyIGllID0gJ0FjdGl2ZVhPYmplY3QnIGluIHdpbmRvdyxcclxuXHRcdGllbHQ5ID0gaWUgJiYgIWRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIsXHJcblxyXG5cdCAgICAvLyB0ZXJyaWJsZSBicm93c2VyIGRldGVjdGlvbiB0byB3b3JrIGFyb3VuZCBTYWZhcmkgLyBpT1MgLyBBbmRyb2lkIGJyb3dzZXIgYnVnc1xyXG5cdCAgICB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSxcclxuXHQgICAgd2Via2l0ID0gdWEuaW5kZXhPZignd2Via2l0JykgIT09IC0xLFxyXG5cdCAgICBjaHJvbWUgPSB1YS5pbmRleE9mKCdjaHJvbWUnKSAhPT0gLTEsXHJcblx0ICAgIHBoYW50b21qcyA9IHVhLmluZGV4T2YoJ3BoYW50b20nKSAhPT0gLTEsXHJcblx0ICAgIGFuZHJvaWQgPSB1YS5pbmRleE9mKCdhbmRyb2lkJykgIT09IC0xLFxyXG5cdCAgICBhbmRyb2lkMjMgPSB1YS5zZWFyY2goJ2FuZHJvaWQgWzIzXScpICE9PSAtMSxcclxuXHRcdGdlY2tvID0gdWEuaW5kZXhPZignZ2Vja28nKSAhPT0gLTEsXHJcblxyXG5cdCAgICBtb2JpbGUgPSB0eXBlb2Ygb3JpZW50YXRpb24gIT09IHVuZGVmaW5lZCArICcnLFxyXG5cdCAgICBtc1BvaW50ZXIgPSB3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCAmJlxyXG5cdCAgICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzICYmICF3aW5kb3cuUG9pbnRlckV2ZW50LFxyXG5cdFx0cG9pbnRlciA9ICh3aW5kb3cuUG9pbnRlckV2ZW50ICYmIHdpbmRvdy5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgJiYgd2luZG93Lm5hdmlnYXRvci5tYXhUb3VjaFBvaW50cykgfHxcclxuXHRcdFx0XHQgIG1zUG9pbnRlcixcclxuXHQgICAgcmV0aW5hID0gKCdkZXZpY2VQaXhlbFJhdGlvJyBpbiB3aW5kb3cgJiYgd2luZG93LmRldmljZVBpeGVsUmF0aW8gPiAxKSB8fFxyXG5cdCAgICAgICAgICAgICAoJ21hdGNoTWVkaWEnIGluIHdpbmRvdyAmJiB3aW5kb3cubWF0Y2hNZWRpYSgnKG1pbi1yZXNvbHV0aW9uOjE0NGRwaSknKSAmJlxyXG5cdCAgICAgICAgICAgICAgd2luZG93Lm1hdGNoTWVkaWEoJyhtaW4tcmVzb2x1dGlvbjoxNDRkcGkpJykubWF0Y2hlcyksXHJcblxyXG5cdCAgICBkb2MgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXHJcblx0ICAgIGllM2QgPSBpZSAmJiAoJ3RyYW5zaXRpb24nIGluIGRvYy5zdHlsZSksXHJcblx0ICAgIHdlYmtpdDNkID0gKCdXZWJLaXRDU1NNYXRyaXgnIGluIHdpbmRvdykgJiYgKCdtMTEnIGluIG5ldyB3aW5kb3cuV2ViS2l0Q1NTTWF0cml4KCkpICYmICFhbmRyb2lkMjMsXHJcblx0ICAgIGdlY2tvM2QgPSAnTW96UGVyc3BlY3RpdmUnIGluIGRvYy5zdHlsZSxcclxuXHQgICAgb3BlcmEzZCA9ICdPVHJhbnNpdGlvbicgaW4gZG9jLnN0eWxlLFxyXG5cdCAgICBhbnkzZCA9ICF3aW5kb3cuTF9ESVNBQkxFXzNEICYmIChpZTNkIHx8IHdlYmtpdDNkIHx8IGdlY2tvM2QgfHwgb3BlcmEzZCkgJiYgIXBoYW50b21qcztcclxuXHJcblxyXG5cdC8vIFBoYW50b21KUyBoYXMgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBidXQgZG9lc24ndCBhY3R1YWxseSBzdXBwb3J0IHRvdWNoLlxyXG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvcHVsbC8xNDM0I2lzc3VlY29tbWVudC0xMzg0MzE1MVxyXG5cclxuXHR2YXIgdG91Y2ggPSAhd2luZG93LkxfTk9fVE9VQ0ggJiYgIXBoYW50b21qcyAmJiAoZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHZhciBzdGFydE5hbWUgPSAnb250b3VjaHN0YXJ0JztcclxuXHJcblx0XHQvLyBJRTEwKyAoV2Ugc2ltdWxhdGUgdGhlc2UgaW50byB0b3VjaCogZXZlbnRzIGluIEwuRG9tRXZlbnQgYW5kIEwuRG9tRXZlbnQuUG9pbnRlcikgb3IgV2ViS2l0LCBldGMuXHJcblx0XHRpZiAocG9pbnRlciB8fCAoc3RhcnROYW1lIGluIGRvYykpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmlyZWZveC9HZWNrb1xyXG5cdFx0dmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG5cdFx0ICAgIHN1cHBvcnRlZCA9IGZhbHNlO1xyXG5cclxuXHRcdGlmICghZGl2LnNldEF0dHJpYnV0ZSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRkaXYuc2V0QXR0cmlidXRlKHN0YXJ0TmFtZSwgJ3JldHVybjsnKTtcclxuXHJcblx0XHRpZiAodHlwZW9mIGRpdltzdGFydE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdHN1cHBvcnRlZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0ZGl2LnJlbW92ZUF0dHJpYnV0ZShzdGFydE5hbWUpO1xyXG5cdFx0ZGl2ID0gbnVsbDtcclxuXHJcblx0XHRyZXR1cm4gc3VwcG9ydGVkO1xyXG5cdH0oKSk7XHJcblxyXG5cclxuXHRMLkJyb3dzZXIgPSB7XHJcblx0XHRpZTogaWUsXHJcblx0XHRpZWx0OTogaWVsdDksXHJcblx0XHR3ZWJraXQ6IHdlYmtpdCxcclxuXHRcdGdlY2tvOiBnZWNrbyAmJiAhd2Via2l0ICYmICF3aW5kb3cub3BlcmEgJiYgIWllLFxyXG5cclxuXHRcdGFuZHJvaWQ6IGFuZHJvaWQsXHJcblx0XHRhbmRyb2lkMjM6IGFuZHJvaWQyMyxcclxuXHJcblx0XHRjaHJvbWU6IGNocm9tZSxcclxuXHJcblx0XHRpZTNkOiBpZTNkLFxyXG5cdFx0d2Via2l0M2Q6IHdlYmtpdDNkLFxyXG5cdFx0Z2Vja28zZDogZ2Vja28zZCxcclxuXHRcdG9wZXJhM2Q6IG9wZXJhM2QsXHJcblx0XHRhbnkzZDogYW55M2QsXHJcblxyXG5cdFx0bW9iaWxlOiBtb2JpbGUsXHJcblx0XHRtb2JpbGVXZWJraXQ6IG1vYmlsZSAmJiB3ZWJraXQsXHJcblx0XHRtb2JpbGVXZWJraXQzZDogbW9iaWxlICYmIHdlYmtpdDNkLFxyXG5cdFx0bW9iaWxlT3BlcmE6IG1vYmlsZSAmJiB3aW5kb3cub3BlcmEsXHJcblxyXG5cdFx0dG91Y2g6IHRvdWNoLFxyXG5cdFx0bXNQb2ludGVyOiBtc1BvaW50ZXIsXHJcblx0XHRwb2ludGVyOiBwb2ludGVyLFxyXG5cclxuXHRcdHJldGluYTogcmV0aW5hXHJcblx0fTtcclxuXHJcbn0oKSk7XHJcblxuXG4vKlxyXG4gKiBMLlBvaW50IHJlcHJlc2VudHMgYSBwb2ludCB3aXRoIHggYW5kIHkgY29vcmRpbmF0ZXMuXHJcbiAqL1xyXG5cclxuTC5Qb2ludCA9IGZ1bmN0aW9uICgvKk51bWJlciovIHgsIC8qTnVtYmVyKi8geSwgLypCb29sZWFuKi8gcm91bmQpIHtcclxuXHR0aGlzLnggPSAocm91bmQgPyBNYXRoLnJvdW5kKHgpIDogeCk7XHJcblx0dGhpcy55ID0gKHJvdW5kID8gTWF0aC5yb3VuZCh5KSA6IHkpO1xyXG59O1xyXG5cclxuTC5Qb2ludC5wcm90b3R5cGUgPSB7XHJcblxyXG5cdGNsb25lOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQodGhpcy54LCB0aGlzLnkpO1xyXG5cdH0sXHJcblxyXG5cdC8vIG5vbi1kZXN0cnVjdGl2ZSwgcmV0dXJucyBhIG5ldyBwb2ludFxyXG5cdGFkZDogZnVuY3Rpb24gKHBvaW50KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpLl9hZGQoTC5wb2ludChwb2ludCkpO1xyXG5cdH0sXHJcblxyXG5cdC8vIGRlc3RydWN0aXZlLCB1c2VkIGRpcmVjdGx5IGZvciBwZXJmb3JtYW5jZSBpbiBzaXR1YXRpb25zIHdoZXJlIGl0J3Mgc2FmZSB0byBtb2RpZnkgZXhpc3RpbmcgcG9pbnRcclxuXHRfYWRkOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHRoaXMueCArPSBwb2ludC54O1xyXG5cdFx0dGhpcy55ICs9IHBvaW50Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzdWJ0cmFjdDogZnVuY3Rpb24gKHBvaW50KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpLl9zdWJ0cmFjdChMLnBvaW50KHBvaW50KSk7XHJcblx0fSxcclxuXHJcblx0X3N1YnRyYWN0OiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHRoaXMueCAtPSBwb2ludC54O1xyXG5cdFx0dGhpcy55IC09IHBvaW50Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRkaXZpZGVCeTogZnVuY3Rpb24gKG51bSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoKS5fZGl2aWRlQnkobnVtKTtcclxuXHR9LFxyXG5cclxuXHRfZGl2aWRlQnk6IGZ1bmN0aW9uIChudW0pIHtcclxuXHRcdHRoaXMueCAvPSBudW07XHJcblx0XHR0aGlzLnkgLz0gbnVtO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0bXVsdGlwbHlCeTogZnVuY3Rpb24gKG51bSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoKS5fbXVsdGlwbHlCeShudW0pO1xyXG5cdH0sXHJcblxyXG5cdF9tdWx0aXBseUJ5OiBmdW5jdGlvbiAobnVtKSB7XHJcblx0XHR0aGlzLnggKj0gbnVtO1xyXG5cdFx0dGhpcy55ICo9IG51bTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJvdW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpLl9yb3VuZCgpO1xyXG5cdH0sXHJcblxyXG5cdF9yb3VuZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy54ID0gTWF0aC5yb3VuZCh0aGlzLngpO1xyXG5cdFx0dGhpcy55ID0gTWF0aC5yb3VuZCh0aGlzLnkpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Zmxvb3I6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmNsb25lKCkuX2Zsb29yKCk7XHJcblx0fSxcclxuXHJcblx0X2Zsb29yOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLnggPSBNYXRoLmZsb29yKHRoaXMueCk7XHJcblx0XHR0aGlzLnkgPSBNYXRoLmZsb29yKHRoaXMueSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRkaXN0YW5jZVRvOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHBvaW50ID0gTC5wb2ludChwb2ludCk7XHJcblxyXG5cdFx0dmFyIHggPSBwb2ludC54IC0gdGhpcy54LFxyXG5cdFx0ICAgIHkgPSBwb2ludC55IC0gdGhpcy55O1xyXG5cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XHJcblx0fSxcclxuXHJcblx0ZXF1YWxzOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHBvaW50ID0gTC5wb2ludChwb2ludCk7XHJcblxyXG5cdFx0cmV0dXJuIHBvaW50LnggPT09IHRoaXMueCAmJlxyXG5cdFx0ICAgICAgIHBvaW50LnkgPT09IHRoaXMueTtcclxuXHR9LFxyXG5cclxuXHRjb250YWluczogZnVuY3Rpb24gKHBvaW50KSB7XHJcblx0XHRwb2ludCA9IEwucG9pbnQocG9pbnQpO1xyXG5cclxuXHRcdHJldHVybiBNYXRoLmFicyhwb2ludC54KSA8PSBNYXRoLmFicyh0aGlzLngpICYmXHJcblx0XHQgICAgICAgTWF0aC5hYnMocG9pbnQueSkgPD0gTWF0aC5hYnModGhpcy55KTtcclxuXHR9LFxyXG5cclxuXHR0b1N0cmluZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuICdQb2ludCgnICtcclxuXHRcdCAgICAgICAgTC5VdGlsLmZvcm1hdE51bSh0aGlzLngpICsgJywgJyArXHJcblx0XHQgICAgICAgIEwuVXRpbC5mb3JtYXROdW0odGhpcy55KSArICcpJztcclxuXHR9XHJcbn07XHJcblxyXG5MLnBvaW50ID0gZnVuY3Rpb24gKHgsIHksIHJvdW5kKSB7XHJcblx0aWYgKHggaW5zdGFuY2VvZiBMLlBvaW50KSB7XHJcblx0XHRyZXR1cm4geDtcclxuXHR9XHJcblx0aWYgKEwuVXRpbC5pc0FycmF5KHgpKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQoeFswXSwgeFsxXSk7XHJcblx0fVxyXG5cdGlmICh4ID09PSB1bmRlZmluZWQgfHwgeCA9PT0gbnVsbCkge1xyXG5cdFx0cmV0dXJuIHg7XHJcblx0fVxyXG5cdHJldHVybiBuZXcgTC5Qb2ludCh4LCB5LCByb3VuZCk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLkJvdW5kcyByZXByZXNlbnRzIGEgcmVjdGFuZ3VsYXIgYXJlYSBvbiB0aGUgc2NyZWVuIGluIHBpeGVsIGNvb3JkaW5hdGVzLlxyXG4gKi9cclxuXHJcbkwuQm91bmRzID0gZnVuY3Rpb24gKGEsIGIpIHsgLy8oUG9pbnQsIFBvaW50KSBvciBQb2ludFtdXHJcblx0aWYgKCFhKSB7IHJldHVybjsgfVxyXG5cclxuXHR2YXIgcG9pbnRzID0gYiA/IFthLCBiXSA6IGE7XHJcblxyXG5cdGZvciAodmFyIGkgPSAwLCBsZW4gPSBwb2ludHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdHRoaXMuZXh0ZW5kKHBvaW50c1tpXSk7XHJcblx0fVxyXG59O1xyXG5cclxuTC5Cb3VuZHMucHJvdG90eXBlID0ge1xyXG5cdC8vIGV4dGVuZCB0aGUgYm91bmRzIHRvIGNvbnRhaW4gdGhlIGdpdmVuIHBvaW50XHJcblx0ZXh0ZW5kOiBmdW5jdGlvbiAocG9pbnQpIHsgLy8gKFBvaW50KVxyXG5cdFx0cG9pbnQgPSBMLnBvaW50KHBvaW50KTtcclxuXHJcblx0XHRpZiAoIXRoaXMubWluICYmICF0aGlzLm1heCkge1xyXG5cdFx0XHR0aGlzLm1pbiA9IHBvaW50LmNsb25lKCk7XHJcblx0XHRcdHRoaXMubWF4ID0gcG9pbnQuY2xvbmUoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMubWluLnggPSBNYXRoLm1pbihwb2ludC54LCB0aGlzLm1pbi54KTtcclxuXHRcdFx0dGhpcy5tYXgueCA9IE1hdGgubWF4KHBvaW50LngsIHRoaXMubWF4LngpO1xyXG5cdFx0XHR0aGlzLm1pbi55ID0gTWF0aC5taW4ocG9pbnQueSwgdGhpcy5taW4ueSk7XHJcblx0XHRcdHRoaXMubWF4LnkgPSBNYXRoLm1heChwb2ludC55LCB0aGlzLm1heC55KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldENlbnRlcjogZnVuY3Rpb24gKHJvdW5kKSB7IC8vIChCb29sZWFuKSAtPiBQb2ludFxyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KFxyXG5cdFx0ICAgICAgICAodGhpcy5taW4ueCArIHRoaXMubWF4LngpIC8gMixcclxuXHRcdCAgICAgICAgKHRoaXMubWluLnkgKyB0aGlzLm1heC55KSAvIDIsIHJvdW5kKTtcclxuXHR9LFxyXG5cclxuXHRnZXRCb3R0b21MZWZ0OiBmdW5jdGlvbiAoKSB7IC8vIC0+IFBvaW50XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQodGhpcy5taW4ueCwgdGhpcy5tYXgueSk7XHJcblx0fSxcclxuXHJcblx0Z2V0VG9wUmlnaHQ6IGZ1bmN0aW9uICgpIHsgLy8gLT4gUG9pbnRcclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludCh0aGlzLm1heC54LCB0aGlzLm1pbi55KTtcclxuXHR9LFxyXG5cclxuXHRnZXRTaXplOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5tYXguc3VidHJhY3QodGhpcy5taW4pO1xyXG5cdH0sXHJcblxyXG5cdGNvbnRhaW5zOiBmdW5jdGlvbiAob2JqKSB7IC8vIChCb3VuZHMpIG9yIChQb2ludCkgLT4gQm9vbGVhblxyXG5cdFx0dmFyIG1pbiwgbWF4O1xyXG5cclxuXHRcdGlmICh0eXBlb2Ygb2JqWzBdID09PSAnbnVtYmVyJyB8fCBvYmogaW5zdGFuY2VvZiBMLlBvaW50KSB7XHJcblx0XHRcdG9iaiA9IEwucG9pbnQob2JqKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG9iaiA9IEwuYm91bmRzKG9iaik7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9iaiBpbnN0YW5jZW9mIEwuQm91bmRzKSB7XHJcblx0XHRcdG1pbiA9IG9iai5taW47XHJcblx0XHRcdG1heCA9IG9iai5tYXg7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRtaW4gPSBtYXggPSBvYmo7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIChtaW4ueCA+PSB0aGlzLm1pbi54KSAmJlxyXG5cdFx0ICAgICAgIChtYXgueCA8PSB0aGlzLm1heC54KSAmJlxyXG5cdFx0ICAgICAgIChtaW4ueSA+PSB0aGlzLm1pbi55KSAmJlxyXG5cdFx0ICAgICAgIChtYXgueSA8PSB0aGlzLm1heC55KTtcclxuXHR9LFxyXG5cclxuXHRpbnRlcnNlY3RzOiBmdW5jdGlvbiAoYm91bmRzKSB7IC8vIChCb3VuZHMpIC0+IEJvb2xlYW5cclxuXHRcdGJvdW5kcyA9IEwuYm91bmRzKGJvdW5kcyk7XHJcblxyXG5cdFx0dmFyIG1pbiA9IHRoaXMubWluLFxyXG5cdFx0ICAgIG1heCA9IHRoaXMubWF4LFxyXG5cdFx0ICAgIG1pbjIgPSBib3VuZHMubWluLFxyXG5cdFx0ICAgIG1heDIgPSBib3VuZHMubWF4LFxyXG5cdFx0ICAgIHhJbnRlcnNlY3RzID0gKG1heDIueCA+PSBtaW4ueCkgJiYgKG1pbjIueCA8PSBtYXgueCksXHJcblx0XHQgICAgeUludGVyc2VjdHMgPSAobWF4Mi55ID49IG1pbi55KSAmJiAobWluMi55IDw9IG1heC55KTtcclxuXHJcblx0XHRyZXR1cm4geEludGVyc2VjdHMgJiYgeUludGVyc2VjdHM7XHJcblx0fSxcclxuXHJcblx0aXNWYWxpZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuICEhKHRoaXMubWluICYmIHRoaXMubWF4KTtcclxuXHR9XHJcbn07XHJcblxyXG5MLmJvdW5kcyA9IGZ1bmN0aW9uIChhLCBiKSB7IC8vIChCb3VuZHMpIG9yIChQb2ludCwgUG9pbnQpIG9yIChQb2ludFtdKVxyXG5cdGlmICghYSB8fCBhIGluc3RhbmNlb2YgTC5Cb3VuZHMpIHtcclxuXHRcdHJldHVybiBhO1xyXG5cdH1cclxuXHRyZXR1cm4gbmV3IEwuQm91bmRzKGEsIGIpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5UcmFuc2Zvcm1hdGlvbiBpcyBhbiB1dGlsaXR5IGNsYXNzIHRvIHBlcmZvcm0gc2ltcGxlIHBvaW50IHRyYW5zZm9ybWF0aW9ucyB0aHJvdWdoIGEgMmQtbWF0cml4LlxyXG4gKi9cclxuXHJcbkwuVHJhbnNmb3JtYXRpb24gPSBmdW5jdGlvbiAoYSwgYiwgYywgZCkge1xyXG5cdHRoaXMuX2EgPSBhO1xyXG5cdHRoaXMuX2IgPSBiO1xyXG5cdHRoaXMuX2MgPSBjO1xyXG5cdHRoaXMuX2QgPSBkO1xyXG59O1xyXG5cclxuTC5UcmFuc2Zvcm1hdGlvbi5wcm90b3R5cGUgPSB7XHJcblx0dHJhbnNmb3JtOiBmdW5jdGlvbiAocG9pbnQsIHNjYWxlKSB7IC8vIChQb2ludCwgTnVtYmVyKSAtPiBQb2ludFxyXG5cdFx0cmV0dXJuIHRoaXMuX3RyYW5zZm9ybShwb2ludC5jbG9uZSgpLCBzY2FsZSk7XHJcblx0fSxcclxuXHJcblx0Ly8gZGVzdHJ1Y3RpdmUgdHJhbnNmb3JtIChmYXN0ZXIpXHJcblx0X3RyYW5zZm9ybTogZnVuY3Rpb24gKHBvaW50LCBzY2FsZSkge1xyXG5cdFx0c2NhbGUgPSBzY2FsZSB8fCAxO1xyXG5cdFx0cG9pbnQueCA9IHNjYWxlICogKHRoaXMuX2EgKiBwb2ludC54ICsgdGhpcy5fYik7XHJcblx0XHRwb2ludC55ID0gc2NhbGUgKiAodGhpcy5fYyAqIHBvaW50LnkgKyB0aGlzLl9kKTtcclxuXHRcdHJldHVybiBwb2ludDtcclxuXHR9LFxyXG5cclxuXHR1bnRyYW5zZm9ybTogZnVuY3Rpb24gKHBvaW50LCBzY2FsZSkge1xyXG5cdFx0c2NhbGUgPSBzY2FsZSB8fCAxO1xyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KFxyXG5cdFx0ICAgICAgICAocG9pbnQueCAvIHNjYWxlIC0gdGhpcy5fYikgLyB0aGlzLl9hLFxyXG5cdFx0ICAgICAgICAocG9pbnQueSAvIHNjYWxlIC0gdGhpcy5fZCkgLyB0aGlzLl9jKTtcclxuXHR9XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLkRvbVV0aWwgY29udGFpbnMgdmFyaW91cyB1dGlsaXR5IGZ1bmN0aW9ucyBmb3Igd29ya2luZyB3aXRoIERPTS5cclxuICovXHJcblxyXG5MLkRvbVV0aWwgPSB7XHJcblx0Z2V0OiBmdW5jdGlvbiAoaWQpIHtcclxuXHRcdHJldHVybiAodHlwZW9mIGlkID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSA6IGlkKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTdHlsZTogZnVuY3Rpb24gKGVsLCBzdHlsZSkge1xyXG5cclxuXHRcdHZhciB2YWx1ZSA9IGVsLnN0eWxlW3N0eWxlXTtcclxuXHJcblx0XHRpZiAoIXZhbHVlICYmIGVsLmN1cnJlbnRTdHlsZSkge1xyXG5cdFx0XHR2YWx1ZSA9IGVsLmN1cnJlbnRTdHlsZVtzdHlsZV07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCghdmFsdWUgfHwgdmFsdWUgPT09ICdhdXRvJykgJiYgZG9jdW1lbnQuZGVmYXVsdFZpZXcpIHtcclxuXHRcdFx0dmFyIGNzcyA9IGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpO1xyXG5cdFx0XHR2YWx1ZSA9IGNzcyA/IGNzc1tzdHlsZV0gOiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZSA9PT0gJ2F1dG8nID8gbnVsbCA6IHZhbHVlO1xyXG5cdH0sXHJcblxyXG5cdGdldFZpZXdwb3J0T2Zmc2V0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG5cclxuXHRcdHZhciB0b3AgPSAwLFxyXG5cdFx0ICAgIGxlZnQgPSAwLFxyXG5cdFx0ICAgIGVsID0gZWxlbWVudCxcclxuXHRcdCAgICBkb2NCb2R5ID0gZG9jdW1lbnQuYm9keSxcclxuXHRcdCAgICBkb2NFbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcclxuXHRcdCAgICBwb3M7XHJcblxyXG5cdFx0ZG8ge1xyXG5cdFx0XHR0b3AgICs9IGVsLm9mZnNldFRvcCAgfHwgMDtcclxuXHRcdFx0bGVmdCArPSBlbC5vZmZzZXRMZWZ0IHx8IDA7XHJcblxyXG5cdFx0XHQvL2FkZCBib3JkZXJzXHJcblx0XHRcdHRvcCArPSBwYXJzZUludChMLkRvbVV0aWwuZ2V0U3R5bGUoZWwsICdib3JkZXJUb3BXaWR0aCcpLCAxMCkgfHwgMDtcclxuXHRcdFx0bGVmdCArPSBwYXJzZUludChMLkRvbVV0aWwuZ2V0U3R5bGUoZWwsICdib3JkZXJMZWZ0V2lkdGgnKSwgMTApIHx8IDA7XHJcblxyXG5cdFx0XHRwb3MgPSBMLkRvbVV0aWwuZ2V0U3R5bGUoZWwsICdwb3NpdGlvbicpO1xyXG5cclxuXHRcdFx0aWYgKGVsLm9mZnNldFBhcmVudCA9PT0gZG9jQm9keSAmJiBwb3MgPT09ICdhYnNvbHV0ZScpIHsgYnJlYWs7IH1cclxuXHJcblx0XHRcdGlmIChwb3MgPT09ICdmaXhlZCcpIHtcclxuXHRcdFx0XHR0b3AgICs9IGRvY0JvZHkuc2Nyb2xsVG9wICB8fCBkb2NFbC5zY3JvbGxUb3AgIHx8IDA7XHJcblx0XHRcdFx0bGVmdCArPSBkb2NCb2R5LnNjcm9sbExlZnQgfHwgZG9jRWwuc2Nyb2xsTGVmdCB8fCAwO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAocG9zID09PSAncmVsYXRpdmUnICYmICFlbC5vZmZzZXRMZWZ0KSB7XHJcblx0XHRcdFx0dmFyIHdpZHRoID0gTC5Eb21VdGlsLmdldFN0eWxlKGVsLCAnd2lkdGgnKSxcclxuXHRcdFx0XHQgICAgbWF4V2lkdGggPSBMLkRvbVV0aWwuZ2V0U3R5bGUoZWwsICdtYXgtd2lkdGgnKSxcclxuXHRcdFx0XHQgICAgciA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggIT09ICdub25lJyB8fCBtYXhXaWR0aCAhPT0gJ25vbmUnKSB7XHJcblx0XHRcdFx0XHRsZWZ0ICs9IHIubGVmdCArIGVsLmNsaWVudExlZnQ7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvL2NhbGN1bGF0ZSBmdWxsIHkgb2Zmc2V0IHNpbmNlIHdlJ3JlIGJyZWFraW5nIG91dCBvZiB0aGUgbG9vcFxyXG5cdFx0XHRcdHRvcCArPSByLnRvcCArIChkb2NCb2R5LnNjcm9sbFRvcCAgfHwgZG9jRWwuc2Nyb2xsVG9wICB8fCAwKTtcclxuXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGVsID0gZWwub2Zmc2V0UGFyZW50O1xyXG5cclxuXHRcdH0gd2hpbGUgKGVsKTtcclxuXHJcblx0XHRlbCA9IGVsZW1lbnQ7XHJcblxyXG5cdFx0ZG8ge1xyXG5cdFx0XHRpZiAoZWwgPT09IGRvY0JvZHkpIHsgYnJlYWs7IH1cclxuXHJcblx0XHRcdHRvcCAgLT0gZWwuc2Nyb2xsVG9wICB8fCAwO1xyXG5cdFx0XHRsZWZ0IC09IGVsLnNjcm9sbExlZnQgfHwgMDtcclxuXHJcblx0XHRcdGVsID0gZWwucGFyZW50Tm9kZTtcclxuXHRcdH0gd2hpbGUgKGVsKTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQobGVmdCwgdG9wKTtcclxuXHR9LFxyXG5cclxuXHRkb2N1bWVudElzTHRyOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIUwuRG9tVXRpbC5fZG9jSXNMdHJDYWNoZWQpIHtcclxuXHRcdFx0TC5Eb21VdGlsLl9kb2NJc0x0ckNhY2hlZCA9IHRydWU7XHJcblx0XHRcdEwuRG9tVXRpbC5fZG9jSXNMdHIgPSBMLkRvbVV0aWwuZ2V0U3R5bGUoZG9jdW1lbnQuYm9keSwgJ2RpcmVjdGlvbicpID09PSAnbHRyJztcclxuXHRcdH1cclxuXHRcdHJldHVybiBMLkRvbVV0aWwuX2RvY0lzTHRyO1xyXG5cdH0sXHJcblxyXG5cdGNyZWF0ZTogZnVuY3Rpb24gKHRhZ05hbWUsIGNsYXNzTmFtZSwgY29udGFpbmVyKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcclxuXHRcdGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcclxuXHJcblx0XHRpZiAoY29udGFpbmVyKSB7XHJcblx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cdGhhc0NsYXNzOiBmdW5jdGlvbiAoZWwsIG5hbWUpIHtcclxuXHRcdGlmIChlbC5jbGFzc0xpc3QgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRyZXR1cm4gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGNsYXNzTmFtZSA9IEwuRG9tVXRpbC5fZ2V0Q2xhc3MoZWwpO1xyXG5cdFx0cmV0dXJuIGNsYXNzTmFtZS5sZW5ndGggPiAwICYmIG5ldyBSZWdFeHAoJyhefFxcXFxzKScgKyBuYW1lICsgJyhcXFxcc3wkKScpLnRlc3QoY2xhc3NOYW1lKTtcclxuXHR9LFxyXG5cclxuXHRhZGRDbGFzczogZnVuY3Rpb24gKGVsLCBuYW1lKSB7XHJcblx0XHRpZiAoZWwuY2xhc3NMaXN0ICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0dmFyIGNsYXNzZXMgPSBMLlV0aWwuc3BsaXRXb3JkcyhuYW1lKTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGNsYXNzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRlbC5jbGFzc0xpc3QuYWRkKGNsYXNzZXNbaV0pO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKCFMLkRvbVV0aWwuaGFzQ2xhc3MoZWwsIG5hbWUpKSB7XHJcblx0XHRcdHZhciBjbGFzc05hbWUgPSBMLkRvbVV0aWwuX2dldENsYXNzKGVsKTtcclxuXHRcdFx0TC5Eb21VdGlsLl9zZXRDbGFzcyhlbCwgKGNsYXNzTmFtZSA/IGNsYXNzTmFtZSArICcgJyA6ICcnKSArIG5hbWUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUNsYXNzOiBmdW5jdGlvbiAoZWwsIG5hbWUpIHtcclxuXHRcdGlmIChlbC5jbGFzc0xpc3QgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0TC5Eb21VdGlsLl9zZXRDbGFzcyhlbCwgTC5VdGlsLnRyaW0oKCcgJyArIEwuRG9tVXRpbC5fZ2V0Q2xhc3MoZWwpICsgJyAnKS5yZXBsYWNlKCcgJyArIG5hbWUgKyAnICcsICcgJykpKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfc2V0Q2xhc3M6IGZ1bmN0aW9uIChlbCwgbmFtZSkge1xyXG5cdFx0aWYgKGVsLmNsYXNzTmFtZS5iYXNlVmFsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0ZWwuY2xhc3NOYW1lID0gbmFtZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIGluIGNhc2Ugb2YgU1ZHIGVsZW1lbnRcclxuXHRcdFx0ZWwuY2xhc3NOYW1lLmJhc2VWYWwgPSBuYW1lO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9nZXRDbGFzczogZnVuY3Rpb24gKGVsKSB7XHJcblx0XHRyZXR1cm4gZWwuY2xhc3NOYW1lLmJhc2VWYWwgPT09IHVuZGVmaW5lZCA/IGVsLmNsYXNzTmFtZSA6IGVsLmNsYXNzTmFtZS5iYXNlVmFsO1xyXG5cdH0sXHJcblxyXG5cdHNldE9wYWNpdHk6IGZ1bmN0aW9uIChlbCwgdmFsdWUpIHtcclxuXHJcblx0XHRpZiAoJ29wYWNpdHknIGluIGVsLnN0eWxlKSB7XHJcblx0XHRcdGVsLnN0eWxlLm9wYWNpdHkgPSB2YWx1ZTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKCdmaWx0ZXInIGluIGVsLnN0eWxlKSB7XHJcblxyXG5cdFx0XHR2YXIgZmlsdGVyID0gZmFsc2UsXHJcblx0XHRcdCAgICBmaWx0ZXJOYW1lID0gJ0RYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkFscGhhJztcclxuXHJcblx0XHRcdC8vIGZpbHRlcnMgY29sbGVjdGlvbiB0aHJvd3MgYW4gZXJyb3IgaWYgd2UgdHJ5IHRvIHJldHJpZXZlIGEgZmlsdGVyIHRoYXQgZG9lc24ndCBleGlzdFxyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGZpbHRlciA9IGVsLmZpbHRlcnMuaXRlbShmaWx0ZXJOYW1lKTtcclxuXHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdC8vIGRvbid0IHNldCBvcGFjaXR5IHRvIDEgaWYgd2UgaGF2ZW4ndCBhbHJlYWR5IHNldCBhbiBvcGFjaXR5LFxyXG5cdFx0XHRcdC8vIGl0IGlzbid0IG5lZWRlZCBhbmQgYnJlYWtzIHRyYW5zcGFyZW50IHBuZ3MuXHJcblx0XHRcdFx0aWYgKHZhbHVlID09PSAxKSB7IHJldHVybjsgfVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgKiAxMDApO1xyXG5cclxuXHRcdFx0aWYgKGZpbHRlcikge1xyXG5cdFx0XHRcdGZpbHRlci5FbmFibGVkID0gKHZhbHVlICE9PSAxMDApO1xyXG5cdFx0XHRcdGZpbHRlci5PcGFjaXR5ID0gdmFsdWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZWwuc3R5bGUuZmlsdGVyICs9ICcgcHJvZ2lkOicgKyBmaWx0ZXJOYW1lICsgJyhvcGFjaXR5PScgKyB2YWx1ZSArICcpJztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHRlc3RQcm9wOiBmdW5jdGlvbiAocHJvcHMpIHtcclxuXHJcblx0XHR2YXIgc3R5bGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAocHJvcHNbaV0gaW4gc3R5bGUpIHtcclxuXHRcdFx0XHRyZXR1cm4gcHJvcHNbaV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHRnZXRUcmFuc2xhdGVTdHJpbmc6IGZ1bmN0aW9uIChwb2ludCkge1xyXG5cdFx0Ly8gb24gV2ViS2l0IGJyb3dzZXJzIChDaHJvbWUvU2FmYXJpL2lPUyBTYWZhcmkvQW5kcm9pZCkgdXNpbmcgdHJhbnNsYXRlM2QgaW5zdGVhZCBvZiB0cmFuc2xhdGVcclxuXHRcdC8vIG1ha2VzIGFuaW1hdGlvbiBzbW9vdGhlciBhcyBpdCBlbnN1cmVzIEhXIGFjY2VsIGlzIHVzZWQuIEZpcmVmb3ggMTMgZG9lc24ndCBjYXJlXHJcblx0XHQvLyAoc2FtZSBzcGVlZCBlaXRoZXIgd2F5KSwgT3BlcmEgMTIgZG9lc24ndCBzdXBwb3J0IHRyYW5zbGF0ZTNkXHJcblxyXG5cdFx0dmFyIGlzM2QgPSBMLkJyb3dzZXIud2Via2l0M2QsXHJcblx0XHQgICAgb3BlbiA9ICd0cmFuc2xhdGUnICsgKGlzM2QgPyAnM2QnIDogJycpICsgJygnLFxyXG5cdFx0ICAgIGNsb3NlID0gKGlzM2QgPyAnLDAnIDogJycpICsgJyknO1xyXG5cclxuXHRcdHJldHVybiBvcGVuICsgcG9pbnQueCArICdweCwnICsgcG9pbnQueSArICdweCcgKyBjbG9zZTtcclxuXHR9LFxyXG5cclxuXHRnZXRTY2FsZVN0cmluZzogZnVuY3Rpb24gKHNjYWxlLCBvcmlnaW4pIHtcclxuXHJcblx0XHR2YXIgcHJlVHJhbnNsYXRlU3RyID0gTC5Eb21VdGlsLmdldFRyYW5zbGF0ZVN0cmluZyhvcmlnaW4uYWRkKG9yaWdpbi5tdWx0aXBseUJ5KC0xICogc2NhbGUpKSksXHJcblx0XHQgICAgc2NhbGVTdHIgPSAnIHNjYWxlKCcgKyBzY2FsZSArICcpICc7XHJcblxyXG5cdFx0cmV0dXJuIHByZVRyYW5zbGF0ZVN0ciArIHNjYWxlU3RyO1xyXG5cdH0sXHJcblxyXG5cdHNldFBvc2l0aW9uOiBmdW5jdGlvbiAoZWwsIHBvaW50LCBkaXNhYmxlM0QpIHsgLy8gKEhUTUxFbGVtZW50LCBQb2ludFssIEJvb2xlYW5dKVxyXG5cclxuXHRcdC8vIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlXHJcblx0XHRlbC5fbGVhZmxldF9wb3MgPSBwb2ludDtcclxuXHJcblx0XHRpZiAoIWRpc2FibGUzRCAmJiBMLkJyb3dzZXIuYW55M2QpIHtcclxuXHRcdFx0ZWwuc3R5bGVbTC5Eb21VdGlsLlRSQU5TRk9STV0gPSAgTC5Eb21VdGlsLmdldFRyYW5zbGF0ZVN0cmluZyhwb2ludCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbC5zdHlsZS5sZWZ0ID0gcG9pbnQueCArICdweCc7XHJcblx0XHRcdGVsLnN0eWxlLnRvcCA9IHBvaW50LnkgKyAncHgnO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoZWwpIHtcclxuXHRcdC8vIHRoaXMgbWV0aG9kIGlzIG9ubHkgdXNlZCBmb3IgZWxlbWVudHMgcHJldmlvdXNseSBwb3NpdGlvbmVkIHVzaW5nIHNldFBvc2l0aW9uLFxyXG5cdFx0Ly8gc28gaXQncyBzYWZlIHRvIGNhY2hlIHRoZSBwb3NpdGlvbiBmb3IgcGVyZm9ybWFuY2VcclxuXHJcblx0XHQvLyBqc2hpbnQgY2FtZWxjYXNlOiBmYWxzZVxyXG5cdFx0cmV0dXJuIGVsLl9sZWFmbGV0X3BvcztcclxuXHR9XHJcbn07XHJcblxyXG5cclxuLy8gcHJlZml4IHN0eWxlIHByb3BlcnR5IG5hbWVzXHJcblxyXG5MLkRvbVV0aWwuVFJBTlNGT1JNID0gTC5Eb21VdGlsLnRlc3RQcm9wKFxyXG4gICAgICAgIFsndHJhbnNmb3JtJywgJ1dlYmtpdFRyYW5zZm9ybScsICdPVHJhbnNmb3JtJywgJ01velRyYW5zZm9ybScsICdtc1RyYW5zZm9ybSddKTtcclxuXHJcbi8vIHdlYmtpdFRyYW5zaXRpb24gY29tZXMgZmlyc3QgYmVjYXVzZSBzb21lIGJyb3dzZXIgdmVyc2lvbnMgdGhhdCBkcm9wIHZlbmRvciBwcmVmaXggZG9uJ3QgZG9cclxuLy8gdGhlIHNhbWUgZm9yIHRoZSB0cmFuc2l0aW9uZW5kIGV2ZW50LCBpbiBwYXJ0aWN1bGFyIHRoZSBBbmRyb2lkIDQuMSBzdG9jayBicm93c2VyXHJcblxyXG5MLkRvbVV0aWwuVFJBTlNJVElPTiA9IEwuRG9tVXRpbC50ZXN0UHJvcChcclxuICAgICAgICBbJ3dlYmtpdFRyYW5zaXRpb24nLCAndHJhbnNpdGlvbicsICdPVHJhbnNpdGlvbicsICdNb3pUcmFuc2l0aW9uJywgJ21zVHJhbnNpdGlvbiddKTtcclxuXHJcbkwuRG9tVXRpbC5UUkFOU0lUSU9OX0VORCA9XHJcbiAgICAgICAgTC5Eb21VdGlsLlRSQU5TSVRJT04gPT09ICd3ZWJraXRUcmFuc2l0aW9uJyB8fCBMLkRvbVV0aWwuVFJBTlNJVElPTiA9PT0gJ09UcmFuc2l0aW9uJyA/XHJcbiAgICAgICAgTC5Eb21VdGlsLlRSQU5TSVRJT04gKyAnRW5kJyA6ICd0cmFuc2l0aW9uZW5kJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoJ29uc2VsZWN0c3RhcnQnIGluIGRvY3VtZW50KSB7XHJcbiAgICAgICAgTC5leHRlbmQoTC5Eb21VdGlsLCB7XHJcbiAgICAgICAgICAgIGRpc2FibGVUZXh0U2VsZWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBMLkRvbUV2ZW50Lm9uKHdpbmRvdywgJ3NlbGVjdHN0YXJ0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBlbmFibGVUZXh0U2VsZWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBMLkRvbUV2ZW50Lm9mZih3aW5kb3csICdzZWxlY3RzdGFydCcsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciB1c2VyU2VsZWN0UHJvcGVydHkgPSBMLkRvbVV0aWwudGVzdFByb3AoXHJcbiAgICAgICAgICAgIFsndXNlclNlbGVjdCcsICdXZWJraXRVc2VyU2VsZWN0JywgJ09Vc2VyU2VsZWN0JywgJ01velVzZXJTZWxlY3QnLCAnbXNVc2VyU2VsZWN0J10pO1xyXG5cclxuICAgICAgICBMLmV4dGVuZChMLkRvbVV0aWwsIHtcclxuICAgICAgICAgICAgZGlzYWJsZVRleHRTZWxlY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1c2VyU2VsZWN0UHJvcGVydHkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXNlclNlbGVjdCA9IHN0eWxlW3VzZXJTZWxlY3RQcm9wZXJ0eV07XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVbdXNlclNlbGVjdFByb3BlcnR5XSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGVuYWJsZVRleHRTZWxlY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1c2VyU2VsZWN0UHJvcGVydHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGVbdXNlclNlbGVjdFByb3BlcnR5XSA9IHRoaXMuX3VzZXJTZWxlY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3VzZXJTZWxlY3Q7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblx0TC5leHRlbmQoTC5Eb21VdGlsLCB7XHJcblx0XHRkaXNhYmxlSW1hZ2VEcmFnOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQub24od2luZG93LCAnZHJhZ3N0YXJ0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGVuYWJsZUltYWdlRHJhZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRMLkRvbUV2ZW50Lm9mZih3aW5kb3csICdkcmFnc3RhcnQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcclxuXHRcdH1cclxuXHR9KTtcclxufSkoKTtcclxuXG5cbi8qXHJcbiAqIEwuTGF0TG5nIHJlcHJlc2VudHMgYSBnZW9ncmFwaGljYWwgcG9pbnQgd2l0aCBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIGNvb3JkaW5hdGVzLlxyXG4gKi9cclxuXHJcbkwuTGF0TG5nID0gZnVuY3Rpb24gKGxhdCwgbG5nLCBhbHQpIHsgLy8gKE51bWJlciwgTnVtYmVyLCBOdW1iZXIpXHJcblx0bGF0ID0gcGFyc2VGbG9hdChsYXQpO1xyXG5cdGxuZyA9IHBhcnNlRmxvYXQobG5nKTtcclxuXHJcblx0aWYgKGlzTmFOKGxhdCkgfHwgaXNOYU4obG5nKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIExhdExuZyBvYmplY3Q6ICgnICsgbGF0ICsgJywgJyArIGxuZyArICcpJyk7XHJcblx0fVxyXG5cclxuXHR0aGlzLmxhdCA9IGxhdDtcclxuXHR0aGlzLmxuZyA9IGxuZztcclxuXHJcblx0aWYgKGFsdCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHR0aGlzLmFsdCA9IHBhcnNlRmxvYXQoYWx0KTtcclxuXHR9XHJcbn07XHJcblxyXG5MLmV4dGVuZChMLkxhdExuZywge1xyXG5cdERFR19UT19SQUQ6IE1hdGguUEkgLyAxODAsXHJcblx0UkFEX1RPX0RFRzogMTgwIC8gTWF0aC5QSSxcclxuXHRNQVhfTUFSR0lOOiAxLjBFLTkgLy8gbWF4IG1hcmdpbiBvZiBlcnJvciBmb3IgdGhlIFwiZXF1YWxzXCIgY2hlY2tcclxufSk7XHJcblxyXG5MLkxhdExuZy5wcm90b3R5cGUgPSB7XHJcblx0ZXF1YWxzOiBmdW5jdGlvbiAob2JqKSB7IC8vIChMYXRMbmcpIC0+IEJvb2xlYW5cclxuXHRcdGlmICghb2JqKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHRcdG9iaiA9IEwubGF0TG5nKG9iaik7XHJcblxyXG5cdFx0dmFyIG1hcmdpbiA9IE1hdGgubWF4KFxyXG5cdFx0ICAgICAgICBNYXRoLmFicyh0aGlzLmxhdCAtIG9iai5sYXQpLFxyXG5cdFx0ICAgICAgICBNYXRoLmFicyh0aGlzLmxuZyAtIG9iai5sbmcpKTtcclxuXHJcblx0XHRyZXR1cm4gbWFyZ2luIDw9IEwuTGF0TG5nLk1BWF9NQVJHSU47XHJcblx0fSxcclxuXHJcblx0dG9TdHJpbmc6IGZ1bmN0aW9uIChwcmVjaXNpb24pIHsgLy8gKE51bWJlcikgLT4gU3RyaW5nXHJcblx0XHRyZXR1cm4gJ0xhdExuZygnICtcclxuXHRcdCAgICAgICAgTC5VdGlsLmZvcm1hdE51bSh0aGlzLmxhdCwgcHJlY2lzaW9uKSArICcsICcgK1xyXG5cdFx0ICAgICAgICBMLlV0aWwuZm9ybWF0TnVtKHRoaXMubG5nLCBwcmVjaXNpb24pICsgJyknO1xyXG5cdH0sXHJcblxyXG5cdC8vIEhhdmVyc2luZSBkaXN0YW5jZSBmb3JtdWxhLCBzZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXZlcnNpbmVfZm9ybXVsYVxyXG5cdC8vIFRPRE8gbW92ZSB0byBwcm9qZWN0aW9uIGNvZGUsIExhdExuZyBzaG91bGRuJ3Qga25vdyBhYm91dCBFYXJ0aFxyXG5cdGRpc3RhbmNlVG86IGZ1bmN0aW9uIChvdGhlcikgeyAvLyAoTGF0TG5nKSAtPiBOdW1iZXJcclxuXHRcdG90aGVyID0gTC5sYXRMbmcob3RoZXIpO1xyXG5cclxuXHRcdHZhciBSID0gNjM3ODEzNywgLy8gZWFydGggcmFkaXVzIGluIG1ldGVyc1xyXG5cdFx0ICAgIGQyciA9IEwuTGF0TG5nLkRFR19UT19SQUQsXHJcblx0XHQgICAgZExhdCA9IChvdGhlci5sYXQgLSB0aGlzLmxhdCkgKiBkMnIsXHJcblx0XHQgICAgZExvbiA9IChvdGhlci5sbmcgLSB0aGlzLmxuZykgKiBkMnIsXHJcblx0XHQgICAgbGF0MSA9IHRoaXMubGF0ICogZDJyLFxyXG5cdFx0ICAgIGxhdDIgPSBvdGhlci5sYXQgKiBkMnIsXHJcblx0XHQgICAgc2luMSA9IE1hdGguc2luKGRMYXQgLyAyKSxcclxuXHRcdCAgICBzaW4yID0gTWF0aC5zaW4oZExvbiAvIDIpO1xyXG5cclxuXHRcdHZhciBhID0gc2luMSAqIHNpbjEgKyBzaW4yICogc2luMiAqIE1hdGguY29zKGxhdDEpICogTWF0aC5jb3MobGF0Mik7XHJcblxyXG5cdFx0cmV0dXJuIFIgKiAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxIC0gYSkpO1xyXG5cdH0sXHJcblxyXG5cdHdyYXA6IGZ1bmN0aW9uIChhLCBiKSB7IC8vIChOdW1iZXIsIE51bWJlcikgLT4gTGF0TG5nXHJcblx0XHR2YXIgbG5nID0gdGhpcy5sbmc7XHJcblxyXG5cdFx0YSA9IGEgfHwgLTE4MDtcclxuXHRcdGIgPSBiIHx8ICAxODA7XHJcblxyXG5cdFx0bG5nID0gKGxuZyArIGIpICUgKGIgLSBhKSArIChsbmcgPCBhIHx8IGxuZyA9PT0gYiA/IGIgOiBhKTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKHRoaXMubGF0LCBsbmcpO1xyXG5cdH1cclxufTtcclxuXHJcbkwubGF0TG5nID0gZnVuY3Rpb24gKGEsIGIpIHsgLy8gKExhdExuZykgb3IgKFtOdW1iZXIsIE51bWJlcl0pIG9yIChOdW1iZXIsIE51bWJlcilcclxuXHRpZiAoYSBpbnN0YW5jZW9mIEwuTGF0TG5nKSB7XHJcblx0XHRyZXR1cm4gYTtcclxuXHR9XHJcblx0aWYgKEwuVXRpbC5pc0FycmF5KGEpKSB7XHJcblx0XHRpZiAodHlwZW9mIGFbMF0gPT09ICdudW1iZXInIHx8IHR5cGVvZiBhWzBdID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKGFbMF0sIGFbMV0sIGFbMl0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG5cdGlmIChhID09PSB1bmRlZmluZWQgfHwgYSA9PT0gbnVsbCkge1xyXG5cdFx0cmV0dXJuIGE7XHJcblx0fVxyXG5cdGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcgJiYgJ2xhdCcgaW4gYSkge1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyhhLmxhdCwgJ2xuZycgaW4gYSA/IGEubG5nIDogYS5sb24pO1xyXG5cdH1cclxuXHRpZiAoYiA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0cmV0dXJuIG5ldyBMLkxhdExuZyhhLCBiKTtcclxufTtcclxuXHJcblxuXG4vKlxyXG4gKiBMLkxhdExuZ0JvdW5kcyByZXByZXNlbnRzIGEgcmVjdGFuZ3VsYXIgYXJlYSBvbiB0aGUgbWFwIGluIGdlb2dyYXBoaWNhbCBjb29yZGluYXRlcy5cclxuICovXHJcblxyXG5MLkxhdExuZ0JvdW5kcyA9IGZ1bmN0aW9uIChzb3V0aFdlc3QsIG5vcnRoRWFzdCkgeyAvLyAoTGF0TG5nLCBMYXRMbmcpIG9yIChMYXRMbmdbXSlcclxuXHRpZiAoIXNvdXRoV2VzdCkgeyByZXR1cm47IH1cclxuXHJcblx0dmFyIGxhdGxuZ3MgPSBub3J0aEVhc3QgPyBbc291dGhXZXN0LCBub3J0aEVhc3RdIDogc291dGhXZXN0O1xyXG5cclxuXHRmb3IgKHZhciBpID0gMCwgbGVuID0gbGF0bG5ncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0dGhpcy5leHRlbmQobGF0bG5nc1tpXSk7XHJcblx0fVxyXG59O1xyXG5cclxuTC5MYXRMbmdCb3VuZHMucHJvdG90eXBlID0ge1xyXG5cdC8vIGV4dGVuZCB0aGUgYm91bmRzIHRvIGNvbnRhaW4gdGhlIGdpdmVuIHBvaW50IG9yIGJvdW5kc1xyXG5cdGV4dGVuZDogZnVuY3Rpb24gKG9iaikgeyAvLyAoTGF0TG5nKSBvciAoTGF0TG5nQm91bmRzKVxyXG5cdFx0aWYgKCFvYmopIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHR2YXIgbGF0TG5nID0gTC5sYXRMbmcob2JqKTtcclxuXHRcdGlmIChsYXRMbmcgIT09IG51bGwpIHtcclxuXHRcdFx0b2JqID0gbGF0TG5nO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b2JqID0gTC5sYXRMbmdCb3VuZHMob2JqKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAob2JqIGluc3RhbmNlb2YgTC5MYXRMbmcpIHtcclxuXHRcdFx0aWYgKCF0aGlzLl9zb3V0aFdlc3QgJiYgIXRoaXMuX25vcnRoRWFzdCkge1xyXG5cdFx0XHRcdHRoaXMuX3NvdXRoV2VzdCA9IG5ldyBMLkxhdExuZyhvYmoubGF0LCBvYmoubG5nKTtcclxuXHRcdFx0XHR0aGlzLl9ub3J0aEVhc3QgPSBuZXcgTC5MYXRMbmcob2JqLmxhdCwgb2JqLmxuZyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fc291dGhXZXN0LmxhdCA9IE1hdGgubWluKG9iai5sYXQsIHRoaXMuX3NvdXRoV2VzdC5sYXQpO1xyXG5cdFx0XHRcdHRoaXMuX3NvdXRoV2VzdC5sbmcgPSBNYXRoLm1pbihvYmoubG5nLCB0aGlzLl9zb3V0aFdlc3QubG5nKTtcclxuXHJcblx0XHRcdFx0dGhpcy5fbm9ydGhFYXN0LmxhdCA9IE1hdGgubWF4KG9iai5sYXQsIHRoaXMuX25vcnRoRWFzdC5sYXQpO1xyXG5cdFx0XHRcdHRoaXMuX25vcnRoRWFzdC5sbmcgPSBNYXRoLm1heChvYmoubG5nLCB0aGlzLl9ub3J0aEVhc3QubG5nKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBMLkxhdExuZ0JvdW5kcykge1xyXG5cdFx0XHR0aGlzLmV4dGVuZChvYmouX3NvdXRoV2VzdCk7XHJcblx0XHRcdHRoaXMuZXh0ZW5kKG9iai5fbm9ydGhFYXN0KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdC8vIGV4dGVuZCB0aGUgYm91bmRzIGJ5IGEgcGVyY2VudGFnZVxyXG5cdHBhZDogZnVuY3Rpb24gKGJ1ZmZlclJhdGlvKSB7IC8vIChOdW1iZXIpIC0+IExhdExuZ0JvdW5kc1xyXG5cdFx0dmFyIHN3ID0gdGhpcy5fc291dGhXZXN0LFxyXG5cdFx0ICAgIG5lID0gdGhpcy5fbm9ydGhFYXN0LFxyXG5cdFx0ICAgIGhlaWdodEJ1ZmZlciA9IE1hdGguYWJzKHN3LmxhdCAtIG5lLmxhdCkgKiBidWZmZXJSYXRpbyxcclxuXHRcdCAgICB3aWR0aEJ1ZmZlciA9IE1hdGguYWJzKHN3LmxuZyAtIG5lLmxuZykgKiBidWZmZXJSYXRpbztcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKFxyXG5cdFx0ICAgICAgICBuZXcgTC5MYXRMbmcoc3cubGF0IC0gaGVpZ2h0QnVmZmVyLCBzdy5sbmcgLSB3aWR0aEJ1ZmZlciksXHJcblx0XHQgICAgICAgIG5ldyBMLkxhdExuZyhuZS5sYXQgKyBoZWlnaHRCdWZmZXIsIG5lLmxuZyArIHdpZHRoQnVmZmVyKSk7XHJcblx0fSxcclxuXHJcblx0Z2V0Q2VudGVyOiBmdW5jdGlvbiAoKSB7IC8vIC0+IExhdExuZ1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyhcclxuXHRcdCAgICAgICAgKHRoaXMuX3NvdXRoV2VzdC5sYXQgKyB0aGlzLl9ub3J0aEVhc3QubGF0KSAvIDIsXHJcblx0XHQgICAgICAgICh0aGlzLl9zb3V0aFdlc3QubG5nICsgdGhpcy5fbm9ydGhFYXN0LmxuZykgLyAyKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTb3V0aFdlc3Q6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9zb3V0aFdlc3Q7XHJcblx0fSxcclxuXHJcblx0Z2V0Tm9ydGhFYXN0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbm9ydGhFYXN0O1xyXG5cdH0sXHJcblxyXG5cdGdldE5vcnRoV2VzdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyh0aGlzLmdldE5vcnRoKCksIHRoaXMuZ2V0V2VzdCgpKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTb3V0aEVhc3Q6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmcodGhpcy5nZXRTb3V0aCgpLCB0aGlzLmdldEVhc3QoKSk7XHJcblx0fSxcclxuXHJcblx0Z2V0V2VzdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3NvdXRoV2VzdC5sbmc7XHJcblx0fSxcclxuXHJcblx0Z2V0U291dGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9zb3V0aFdlc3QubGF0O1xyXG5cdH0sXHJcblxyXG5cdGdldEVhc3Q6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9ub3J0aEVhc3QubG5nO1xyXG5cdH0sXHJcblxyXG5cdGdldE5vcnRoOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbm9ydGhFYXN0LmxhdDtcclxuXHR9LFxyXG5cclxuXHRjb250YWluczogZnVuY3Rpb24gKG9iaikgeyAvLyAoTGF0TG5nQm91bmRzKSBvciAoTGF0TG5nKSAtPiBCb29sZWFuXHJcblx0XHRpZiAodHlwZW9mIG9ialswXSA9PT0gJ251bWJlcicgfHwgb2JqIGluc3RhbmNlb2YgTC5MYXRMbmcpIHtcclxuXHRcdFx0b2JqID0gTC5sYXRMbmcob2JqKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG9iaiA9IEwubGF0TG5nQm91bmRzKG9iaik7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHN3ID0gdGhpcy5fc291dGhXZXN0LFxyXG5cdFx0ICAgIG5lID0gdGhpcy5fbm9ydGhFYXN0LFxyXG5cdFx0ICAgIHN3MiwgbmUyO1xyXG5cclxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBMLkxhdExuZ0JvdW5kcykge1xyXG5cdFx0XHRzdzIgPSBvYmouZ2V0U291dGhXZXN0KCk7XHJcblx0XHRcdG5lMiA9IG9iai5nZXROb3J0aEVhc3QoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHN3MiA9IG5lMiA9IG9iajtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gKHN3Mi5sYXQgPj0gc3cubGF0KSAmJiAobmUyLmxhdCA8PSBuZS5sYXQpICYmXHJcblx0XHQgICAgICAgKHN3Mi5sbmcgPj0gc3cubG5nKSAmJiAobmUyLmxuZyA8PSBuZS5sbmcpO1xyXG5cdH0sXHJcblxyXG5cdGludGVyc2VjdHM6IGZ1bmN0aW9uIChib3VuZHMpIHsgLy8gKExhdExuZ0JvdW5kcylcclxuXHRcdGJvdW5kcyA9IEwubGF0TG5nQm91bmRzKGJvdW5kcyk7XHJcblxyXG5cdFx0dmFyIHN3ID0gdGhpcy5fc291dGhXZXN0LFxyXG5cdFx0ICAgIG5lID0gdGhpcy5fbm9ydGhFYXN0LFxyXG5cdFx0ICAgIHN3MiA9IGJvdW5kcy5nZXRTb3V0aFdlc3QoKSxcclxuXHRcdCAgICBuZTIgPSBib3VuZHMuZ2V0Tm9ydGhFYXN0KCksXHJcblxyXG5cdFx0ICAgIGxhdEludGVyc2VjdHMgPSAobmUyLmxhdCA+PSBzdy5sYXQpICYmIChzdzIubGF0IDw9IG5lLmxhdCksXHJcblx0XHQgICAgbG5nSW50ZXJzZWN0cyA9IChuZTIubG5nID49IHN3LmxuZykgJiYgKHN3Mi5sbmcgPD0gbmUubG5nKTtcclxuXHJcblx0XHRyZXR1cm4gbGF0SW50ZXJzZWN0cyAmJiBsbmdJbnRlcnNlY3RzO1xyXG5cdH0sXHJcblxyXG5cdHRvQkJveFN0cmluZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIFt0aGlzLmdldFdlc3QoKSwgdGhpcy5nZXRTb3V0aCgpLCB0aGlzLmdldEVhc3QoKSwgdGhpcy5nZXROb3J0aCgpXS5qb2luKCcsJyk7XHJcblx0fSxcclxuXHJcblx0ZXF1YWxzOiBmdW5jdGlvbiAoYm91bmRzKSB7IC8vIChMYXRMbmdCb3VuZHMpXHJcblx0XHRpZiAoIWJvdW5kcykgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcblx0XHRib3VuZHMgPSBMLmxhdExuZ0JvdW5kcyhib3VuZHMpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl9zb3V0aFdlc3QuZXF1YWxzKGJvdW5kcy5nZXRTb3V0aFdlc3QoKSkgJiZcclxuXHRcdCAgICAgICB0aGlzLl9ub3J0aEVhc3QuZXF1YWxzKGJvdW5kcy5nZXROb3J0aEVhc3QoKSk7XHJcblx0fSxcclxuXHJcblx0aXNWYWxpZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuICEhKHRoaXMuX3NvdXRoV2VzdCAmJiB0aGlzLl9ub3J0aEVhc3QpO1xyXG5cdH1cclxufTtcclxuXHJcbi8vVE9ETyBJbnRlcm5hdGlvbmFsIGRhdGUgbGluZT9cclxuXHJcbkwubGF0TG5nQm91bmRzID0gZnVuY3Rpb24gKGEsIGIpIHsgLy8gKExhdExuZ0JvdW5kcykgb3IgKExhdExuZywgTGF0TG5nKVxyXG5cdGlmICghYSB8fCBhIGluc3RhbmNlb2YgTC5MYXRMbmdCb3VuZHMpIHtcclxuXHRcdHJldHVybiBhO1xyXG5cdH1cclxuXHRyZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKGEsIGIpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5Qcm9qZWN0aW9uIGNvbnRhaW5zIHZhcmlvdXMgZ2VvZ3JhcGhpY2FsIHByb2plY3Rpb25zIHVzZWQgYnkgQ1JTIGNsYXNzZXMuXHJcbiAqL1xyXG5cclxuTC5Qcm9qZWN0aW9uID0ge307XHJcblxuXG4vKlxyXG4gKiBTcGhlcmljYWwgTWVyY2F0b3IgaXMgdGhlIG1vc3QgcG9wdWxhciBtYXAgcHJvamVjdGlvbiwgdXNlZCBieSBFUFNHOjM4NTcgQ1JTIHVzZWQgYnkgZGVmYXVsdC5cclxuICovXHJcblxyXG5MLlByb2plY3Rpb24uU3BoZXJpY2FsTWVyY2F0b3IgPSB7XHJcblx0TUFYX0xBVElUVURFOiA4NS4wNTExMjg3Nzk4LFxyXG5cclxuXHRwcm9qZWN0OiBmdW5jdGlvbiAobGF0bG5nKSB7IC8vIChMYXRMbmcpIC0+IFBvaW50XHJcblx0XHR2YXIgZCA9IEwuTGF0TG5nLkRFR19UT19SQUQsXHJcblx0XHQgICAgbWF4ID0gdGhpcy5NQVhfTEFUSVRVREUsXHJcblx0XHQgICAgbGF0ID0gTWF0aC5tYXgoTWF0aC5taW4obWF4LCBsYXRsbmcubGF0KSwgLW1heCksXHJcblx0XHQgICAgeCA9IGxhdGxuZy5sbmcgKiBkLFxyXG5cdFx0ICAgIHkgPSBsYXQgKiBkO1xyXG5cclxuXHRcdHkgPSBNYXRoLmxvZyhNYXRoLnRhbigoTWF0aC5QSSAvIDQpICsgKHkgLyAyKSkpO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludCh4LCB5KTtcclxuXHR9LFxyXG5cclxuXHR1bnByb2plY3Q6IGZ1bmN0aW9uIChwb2ludCkgeyAvLyAoUG9pbnQsIEJvb2xlYW4pIC0+IExhdExuZ1xyXG5cdFx0dmFyIGQgPSBMLkxhdExuZy5SQURfVE9fREVHLFxyXG5cdFx0ICAgIGxuZyA9IHBvaW50LnggKiBkLFxyXG5cdFx0ICAgIGxhdCA9ICgyICogTWF0aC5hdGFuKE1hdGguZXhwKHBvaW50LnkpKSAtIChNYXRoLlBJIC8gMikpICogZDtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nKGxhdCwgbG5nKTtcclxuXHR9XHJcbn07XHJcblxuXG4vKlxyXG4gKiBTaW1wbGUgZXF1aXJlY3Rhbmd1bGFyIChQbGF0ZSBDYXJyZWUpIHByb2plY3Rpb24sIHVzZWQgYnkgQ1JTIGxpa2UgRVBTRzo0MzI2IGFuZCBTaW1wbGUuXHJcbiAqL1xyXG5cclxuTC5Qcm9qZWN0aW9uLkxvbkxhdCA9IHtcclxuXHRwcm9qZWN0OiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQobGF0bG5nLmxuZywgbGF0bG5nLmxhdCk7XHJcblx0fSxcclxuXHJcblx0dW5wcm9qZWN0OiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmcocG9pbnQueSwgcG9pbnQueCk7XHJcblx0fVxyXG59O1xyXG5cblxuLypcclxuICogTC5DUlMgaXMgYSBiYXNlIG9iamVjdCBmb3IgYWxsIGRlZmluZWQgQ1JTIChDb29yZGluYXRlIFJlZmVyZW5jZSBTeXN0ZW1zKSBpbiBMZWFmbGV0LlxyXG4gKi9cclxuXHJcbkwuQ1JTID0ge1xyXG5cdGxhdExuZ1RvUG9pbnQ6IGZ1bmN0aW9uIChsYXRsbmcsIHpvb20pIHsgLy8gKExhdExuZywgTnVtYmVyKSAtPiBQb2ludFxyXG5cdFx0dmFyIHByb2plY3RlZFBvaW50ID0gdGhpcy5wcm9qZWN0aW9uLnByb2plY3QobGF0bG5nKSxcclxuXHRcdCAgICBzY2FsZSA9IHRoaXMuc2NhbGUoem9vbSk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudHJhbnNmb3JtYXRpb24uX3RyYW5zZm9ybShwcm9qZWN0ZWRQb2ludCwgc2NhbGUpO1xyXG5cdH0sXHJcblxyXG5cdHBvaW50VG9MYXRMbmc6IGZ1bmN0aW9uIChwb2ludCwgem9vbSkgeyAvLyAoUG9pbnQsIE51bWJlclssIEJvb2xlYW5dKSAtPiBMYXRMbmdcclxuXHRcdHZhciBzY2FsZSA9IHRoaXMuc2NhbGUoem9vbSksXHJcblx0XHQgICAgdW50cmFuc2Zvcm1lZFBvaW50ID0gdGhpcy50cmFuc2Zvcm1hdGlvbi51bnRyYW5zZm9ybShwb2ludCwgc2NhbGUpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnByb2plY3Rpb24udW5wcm9qZWN0KHVudHJhbnNmb3JtZWRQb2ludCk7XHJcblx0fSxcclxuXHJcblx0cHJvamVjdDogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0cmV0dXJuIHRoaXMucHJvamVjdGlvbi5wcm9qZWN0KGxhdGxuZyk7XHJcblx0fSxcclxuXHJcblx0c2NhbGU6IGZ1bmN0aW9uICh6b29tKSB7XHJcblx0XHRyZXR1cm4gMjU2ICogTWF0aC5wb3coMiwgem9vbSk7XHJcblx0fSxcclxuXHJcblx0Z2V0U2l6ZTogZnVuY3Rpb24gKHpvb20pIHtcclxuXHRcdHZhciBzID0gdGhpcy5zY2FsZSh6b29tKTtcclxuXHRcdHJldHVybiBMLnBvaW50KHMsIHMpO1xyXG5cdH1cclxufTtcclxuXG5cbi8qXG4gKiBBIHNpbXBsZSBDUlMgdGhhdCBjYW4gYmUgdXNlZCBmb3IgZmxhdCBub24tRWFydGggbWFwcyBsaWtlIHBhbm9yYW1hcyBvciBnYW1lIG1hcHMuXG4gKi9cblxuTC5DUlMuU2ltcGxlID0gTC5leHRlbmQoe30sIEwuQ1JTLCB7XG5cdHByb2plY3Rpb246IEwuUHJvamVjdGlvbi5Mb25MYXQsXG5cdHRyYW5zZm9ybWF0aW9uOiBuZXcgTC5UcmFuc2Zvcm1hdGlvbigxLCAwLCAtMSwgMCksXG5cblx0c2NhbGU6IGZ1bmN0aW9uICh6b29tKSB7XG5cdFx0cmV0dXJuIE1hdGgucG93KDIsIHpvb20pO1xuXHR9XG59KTtcblxuXG4vKlxyXG4gKiBMLkNSUy5FUFNHMzg1NyAoU3BoZXJpY2FsIE1lcmNhdG9yKSBpcyB0aGUgbW9zdCBjb21tb24gQ1JTIGZvciB3ZWIgbWFwcGluZ1xyXG4gKiBhbmQgaXMgdXNlZCBieSBMZWFmbGV0IGJ5IGRlZmF1bHQuXHJcbiAqL1xyXG5cclxuTC5DUlMuRVBTRzM4NTcgPSBMLmV4dGVuZCh7fSwgTC5DUlMsIHtcclxuXHRjb2RlOiAnRVBTRzozODU3JyxcclxuXHJcblx0cHJvamVjdGlvbjogTC5Qcm9qZWN0aW9uLlNwaGVyaWNhbE1lcmNhdG9yLFxyXG5cdHRyYW5zZm9ybWF0aW9uOiBuZXcgTC5UcmFuc2Zvcm1hdGlvbigwLjUgLyBNYXRoLlBJLCAwLjUsIC0wLjUgLyBNYXRoLlBJLCAwLjUpLFxyXG5cclxuXHRwcm9qZWN0OiBmdW5jdGlvbiAobGF0bG5nKSB7IC8vIChMYXRMbmcpIC0+IFBvaW50XHJcblx0XHR2YXIgcHJvamVjdGVkUG9pbnQgPSB0aGlzLnByb2plY3Rpb24ucHJvamVjdChsYXRsbmcpLFxyXG5cdFx0ICAgIGVhcnRoUmFkaXVzID0gNjM3ODEzNztcclxuXHRcdHJldHVybiBwcm9qZWN0ZWRQb2ludC5tdWx0aXBseUJ5KGVhcnRoUmFkaXVzKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5DUlMuRVBTRzkwMDkxMyA9IEwuZXh0ZW5kKHt9LCBMLkNSUy5FUFNHMzg1Nywge1xyXG5cdGNvZGU6ICdFUFNHOjkwMDkxMydcclxufSk7XHJcblxuXG4vKlxyXG4gKiBMLkNSUy5FUFNHNDMyNiBpcyBhIENSUyBwb3B1bGFyIGFtb25nIGFkdmFuY2VkIEdJUyBzcGVjaWFsaXN0cy5cclxuICovXHJcblxyXG5MLkNSUy5FUFNHNDMyNiA9IEwuZXh0ZW5kKHt9LCBMLkNSUywge1xyXG5cdGNvZGU6ICdFUFNHOjQzMjYnLFxyXG5cclxuXHRwcm9qZWN0aW9uOiBMLlByb2plY3Rpb24uTG9uTGF0LFxyXG5cdHRyYW5zZm9ybWF0aW9uOiBuZXcgTC5UcmFuc2Zvcm1hdGlvbigxIC8gMzYwLCAwLjUsIC0xIC8gMzYwLCAwLjUpXHJcbn0pO1xyXG5cblxuLypcclxuICogTC5NYXAgaXMgdGhlIGNlbnRyYWwgY2xhc3Mgb2YgdGhlIEFQSSAtIGl0IGlzIHVzZWQgdG8gY3JlYXRlIGEgbWFwLlxyXG4gKi9cclxuXHJcbkwuTWFwID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdGNyczogTC5DUlMuRVBTRzM4NTcsXHJcblxyXG5cdFx0LypcclxuXHRcdGNlbnRlcjogTGF0TG5nLFxyXG5cdFx0em9vbTogTnVtYmVyLFxyXG5cdFx0bGF5ZXJzOiBBcnJheSxcclxuXHRcdCovXHJcblxyXG5cdFx0ZmFkZUFuaW1hdGlvbjogTC5Eb21VdGlsLlRSQU5TSVRJT04gJiYgIUwuQnJvd3Nlci5hbmRyb2lkMjMsXHJcblx0XHR0cmFja1Jlc2l6ZTogdHJ1ZSxcclxuXHRcdG1hcmtlclpvb21BbmltYXRpb246IEwuRG9tVXRpbC5UUkFOU0lUSU9OICYmIEwuQnJvd3Nlci5hbnkzZFxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChpZCwgb3B0aW9ucykgeyAvLyAoSFRNTEVsZW1lbnQgb3IgU3RyaW5nLCBPYmplY3QpXHJcblx0XHRvcHRpb25zID0gTC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHJcblx0XHR0aGlzLl9pbml0Q29udGFpbmVyKGlkKTtcclxuXHRcdHRoaXMuX2luaXRMYXlvdXQoKTtcclxuXHJcblx0XHQvLyBoYWNrIGZvciBodHRwczovL2dpdGh1Yi5jb20vTGVhZmxldC9MZWFmbGV0L2lzc3Vlcy8xOTgwXHJcblx0XHR0aGlzLl9vblJlc2l6ZSA9IEwuYmluZCh0aGlzLl9vblJlc2l6ZSwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5faW5pdEV2ZW50cygpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLm1heEJvdW5kcykge1xyXG5cdFx0XHR0aGlzLnNldE1heEJvdW5kcyhvcHRpb25zLm1heEJvdW5kcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuY2VudGVyICYmIG9wdGlvbnMuem9vbSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHRoaXMuc2V0VmlldyhMLmxhdExuZyhvcHRpb25zLmNlbnRlciksIG9wdGlvbnMuem9vbSwge3Jlc2V0OiB0cnVlfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faGFuZGxlcnMgPSBbXTtcclxuXHJcblx0XHR0aGlzLl9sYXllcnMgPSB7fTtcclxuXHRcdHRoaXMuX3pvb21Cb3VuZExheWVycyA9IHt9O1xyXG5cdFx0dGhpcy5fdGlsZUxheWVyc051bSA9IDA7XHJcblxyXG5cdFx0dGhpcy5jYWxsSW5pdEhvb2tzKCk7XHJcblxyXG5cdFx0dGhpcy5fYWRkTGF5ZXJzKG9wdGlvbnMubGF5ZXJzKTtcclxuXHR9LFxyXG5cclxuXHJcblx0Ly8gcHVibGljIG1ldGhvZHMgdGhhdCBtb2RpZnkgbWFwIHN0YXRlXHJcblxyXG5cdC8vIHJlcGxhY2VkIGJ5IGFuaW1hdGlvbi1wb3dlcmVkIGltcGxlbWVudGF0aW9uIGluIE1hcC5QYW5BbmltYXRpb24uanNcclxuXHRzZXRWaWV3OiBmdW5jdGlvbiAoY2VudGVyLCB6b29tKSB7XHJcblx0XHR6b29tID0gem9vbSA9PT0gdW5kZWZpbmVkID8gdGhpcy5nZXRab29tKCkgOiB6b29tO1xyXG5cdFx0dGhpcy5fcmVzZXRWaWV3KEwubGF0TG5nKGNlbnRlciksIHRoaXMuX2xpbWl0Wm9vbSh6b29tKSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzZXRab29tOiBmdW5jdGlvbiAoem9vbSwgb3B0aW9ucykge1xyXG5cdFx0aWYgKCF0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhpcy5fem9vbSA9IHRoaXMuX2xpbWl0Wm9vbSh6b29tKTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5zZXRWaWV3KHRoaXMuZ2V0Q2VudGVyKCksIHpvb20sIHt6b29tOiBvcHRpb25zfSk7XHJcblx0fSxcclxuXHJcblx0em9vbUluOiBmdW5jdGlvbiAoZGVsdGEsIG9wdGlvbnMpIHtcclxuXHRcdHJldHVybiB0aGlzLnNldFpvb20odGhpcy5fem9vbSArIChkZWx0YSB8fCAxKSwgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0em9vbU91dDogZnVuY3Rpb24gKGRlbHRhLCBvcHRpb25zKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zZXRab29tKHRoaXMuX3pvb20gLSAoZGVsdGEgfHwgMSksIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdHNldFpvb21Bcm91bmQ6IGZ1bmN0aW9uIChsYXRsbmcsIHpvb20sIG9wdGlvbnMpIHtcclxuXHRcdHZhciBzY2FsZSA9IHRoaXMuZ2V0Wm9vbVNjYWxlKHpvb20pLFxyXG5cdFx0ICAgIHZpZXdIYWxmID0gdGhpcy5nZXRTaXplKCkuZGl2aWRlQnkoMiksXHJcblx0XHQgICAgY29udGFpbmVyUG9pbnQgPSBsYXRsbmcgaW5zdGFuY2VvZiBMLlBvaW50ID8gbGF0bG5nIDogdGhpcy5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGxhdGxuZyksXHJcblxyXG5cdFx0ICAgIGNlbnRlck9mZnNldCA9IGNvbnRhaW5lclBvaW50LnN1YnRyYWN0KHZpZXdIYWxmKS5tdWx0aXBseUJ5KDEgLSAxIC8gc2NhbGUpLFxyXG5cdFx0ICAgIG5ld0NlbnRlciA9IHRoaXMuY29udGFpbmVyUG9pbnRUb0xhdExuZyh2aWV3SGFsZi5hZGQoY2VudGVyT2Zmc2V0KSk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuc2V0VmlldyhuZXdDZW50ZXIsIHpvb20sIHt6b29tOiBvcHRpb25zfSk7XHJcblx0fSxcclxuXHJcblx0Zml0Qm91bmRzOiBmdW5jdGlvbiAoYm91bmRzLCBvcHRpb25zKSB7XHJcblxyXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblx0XHRib3VuZHMgPSBib3VuZHMuZ2V0Qm91bmRzID8gYm91bmRzLmdldEJvdW5kcygpIDogTC5sYXRMbmdCb3VuZHMoYm91bmRzKTtcclxuXHJcblx0XHR2YXIgcGFkZGluZ1RMID0gTC5wb2ludChvcHRpb25zLnBhZGRpbmdUb3BMZWZ0IHx8IG9wdGlvbnMucGFkZGluZyB8fCBbMCwgMF0pLFxyXG5cdFx0ICAgIHBhZGRpbmdCUiA9IEwucG9pbnQob3B0aW9ucy5wYWRkaW5nQm90dG9tUmlnaHQgfHwgb3B0aW9ucy5wYWRkaW5nIHx8IFswLCAwXSksXHJcblxyXG5cdFx0ICAgIHpvb20gPSB0aGlzLmdldEJvdW5kc1pvb20oYm91bmRzLCBmYWxzZSwgcGFkZGluZ1RMLmFkZChwYWRkaW5nQlIpKSxcclxuXHRcdCAgICBwYWRkaW5nT2Zmc2V0ID0gcGFkZGluZ0JSLnN1YnRyYWN0KHBhZGRpbmdUTCkuZGl2aWRlQnkoMiksXHJcblxyXG5cdFx0ICAgIHN3UG9pbnQgPSB0aGlzLnByb2plY3QoYm91bmRzLmdldFNvdXRoV2VzdCgpLCB6b29tKSxcclxuXHRcdCAgICBuZVBvaW50ID0gdGhpcy5wcm9qZWN0KGJvdW5kcy5nZXROb3J0aEVhc3QoKSwgem9vbSksXHJcblx0XHQgICAgY2VudGVyID0gdGhpcy51bnByb2plY3Qoc3dQb2ludC5hZGQobmVQb2ludCkuZGl2aWRlQnkoMikuYWRkKHBhZGRpbmdPZmZzZXQpLCB6b29tKTtcclxuXHJcblx0XHR6b29tID0gb3B0aW9ucyAmJiBvcHRpb25zLm1heFpvb20gPyBNYXRoLm1pbihvcHRpb25zLm1heFpvb20sIHpvb20pIDogem9vbTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5zZXRWaWV3KGNlbnRlciwgem9vbSwgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0Zml0V29ybGQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5maXRCb3VuZHMoW1stOTAsIC0xODBdLCBbOTAsIDE4MF1dLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRwYW5UbzogZnVuY3Rpb24gKGNlbnRlciwgb3B0aW9ucykgeyAvLyAoTGF0TG5nKVxyXG5cdFx0cmV0dXJuIHRoaXMuc2V0VmlldyhjZW50ZXIsIHRoaXMuX3pvb20sIHtwYW46IG9wdGlvbnN9KTtcclxuXHR9LFxyXG5cclxuXHRwYW5CeTogZnVuY3Rpb24gKG9mZnNldCkgeyAvLyAoUG9pbnQpXHJcblx0XHQvLyByZXBsYWNlZCB3aXRoIGFuaW1hdGVkIHBhbkJ5IGluIE1hcC5QYW5BbmltYXRpb24uanNcclxuXHRcdHRoaXMuZmlyZSgnbW92ZXN0YXJ0Jyk7XHJcblxyXG5cdFx0dGhpcy5fcmF3UGFuQnkoTC5wb2ludChvZmZzZXQpKTtcclxuXHJcblx0XHR0aGlzLmZpcmUoJ21vdmUnKTtcclxuXHRcdHJldHVybiB0aGlzLmZpcmUoJ21vdmVlbmQnKTtcclxuXHR9LFxyXG5cclxuXHRzZXRNYXhCb3VuZHM6IGZ1bmN0aW9uIChib3VuZHMpIHtcclxuXHRcdGJvdW5kcyA9IEwubGF0TG5nQm91bmRzKGJvdW5kcyk7XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zLm1heEJvdW5kcyA9IGJvdW5kcztcclxuXHJcblx0XHRpZiAoIWJvdW5kcykge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5vZmYoJ21vdmVlbmQnLCB0aGlzLl9wYW5JbnNpZGVNYXhCb3VuZHMsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhpcy5fcGFuSW5zaWRlTWF4Qm91bmRzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMub24oJ21vdmVlbmQnLCB0aGlzLl9wYW5JbnNpZGVNYXhCb3VuZHMsIHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdHBhbkluc2lkZUJvdW5kczogZnVuY3Rpb24gKGJvdW5kcywgb3B0aW9ucykge1xyXG5cdFx0dmFyIGNlbnRlciA9IHRoaXMuZ2V0Q2VudGVyKCksXHJcblx0XHRcdG5ld0NlbnRlciA9IHRoaXMuX2xpbWl0Q2VudGVyKGNlbnRlciwgdGhpcy5fem9vbSwgYm91bmRzKTtcclxuXHJcblx0XHRpZiAoY2VudGVyLmVxdWFscyhuZXdDZW50ZXIpKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMucGFuVG8obmV3Q2VudGVyLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRhZGRMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHQvLyBUT0RPIG1ldGhvZCBpcyB0b28gYmlnLCByZWZhY3RvclxyXG5cclxuXHRcdHZhciBpZCA9IEwuc3RhbXAobGF5ZXIpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9sYXllcnNbaWRdKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0dGhpcy5fbGF5ZXJzW2lkXSA9IGxheWVyO1xyXG5cclxuXHRcdC8vIFRPRE8gZ2V0TWF4Wm9vbSwgZ2V0TWluWm9vbSBpbiBJTGF5ZXIgKGluc3RlYWQgb2Ygb3B0aW9ucylcclxuXHRcdGlmIChsYXllci5vcHRpb25zICYmICghaXNOYU4obGF5ZXIub3B0aW9ucy5tYXhab29tKSB8fCAhaXNOYU4obGF5ZXIub3B0aW9ucy5taW5ab29tKSkpIHtcclxuXHRcdFx0dGhpcy5fem9vbUJvdW5kTGF5ZXJzW2lkXSA9IGxheWVyO1xyXG5cdFx0XHR0aGlzLl91cGRhdGVab29tTGV2ZWxzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVE9ETyBsb29rcyB1Z2x5LCByZWZhY3RvciEhIVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIEwuVGlsZUxheWVyICYmIChsYXllciBpbnN0YW5jZW9mIEwuVGlsZUxheWVyKSkge1xyXG5cdFx0XHR0aGlzLl90aWxlTGF5ZXJzTnVtKys7XHJcblx0XHRcdHRoaXMuX3RpbGVMYXllcnNUb0xvYWQrKztcclxuXHRcdFx0bGF5ZXIub24oJ2xvYWQnLCB0aGlzLl9vblRpbGVMYXllckxvYWQsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhpcy5fbGF5ZXJBZGQobGF5ZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUxheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdHZhciBpZCA9IEwuc3RhbXAobGF5ZXIpO1xyXG5cclxuXHRcdGlmICghdGhpcy5fbGF5ZXJzW2lkXSkgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdGlmICh0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0bGF5ZXIub25SZW1vdmUodGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZGVsZXRlIHRoaXMuX2xheWVyc1tpZF07XHJcblxyXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2xheWVycmVtb3ZlJywge2xheWVyOiBsYXllcn0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl96b29tQm91bmRMYXllcnNbaWRdKSB7XHJcblx0XHRcdGRlbGV0ZSB0aGlzLl96b29tQm91bmRMYXllcnNbaWRdO1xyXG5cdFx0XHR0aGlzLl91cGRhdGVab29tTGV2ZWxzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVE9ETyBsb29rcyB1Z2x5LCByZWZhY3RvclxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIEwuVGlsZUxheWVyICYmIChsYXllciBpbnN0YW5jZW9mIEwuVGlsZUxheWVyKSkge1xyXG5cdFx0XHR0aGlzLl90aWxlTGF5ZXJzTnVtLS07XHJcblx0XHRcdHRoaXMuX3RpbGVMYXllcnNUb0xvYWQtLTtcclxuXHRcdFx0bGF5ZXIub2ZmKCdsb2FkJywgdGhpcy5fb25UaWxlTGF5ZXJMb2FkLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRoYXNMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRpZiAoIWxheWVyKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHRcdHJldHVybiAoTC5zdGFtcChsYXllcikgaW4gdGhpcy5fbGF5ZXJzKTtcclxuXHR9LFxyXG5cclxuXHRlYWNoTGF5ZXI6IGZ1bmN0aW9uIChtZXRob2QsIGNvbnRleHQpIHtcclxuXHRcdGZvciAodmFyIGkgaW4gdGhpcy5fbGF5ZXJzKSB7XHJcblx0XHRcdG1ldGhvZC5jYWxsKGNvbnRleHQsIHRoaXMuX2xheWVyc1tpXSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRpbnZhbGlkYXRlU2l6ZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRcdGlmICghdGhpcy5fbG9hZGVkKSB7IHJldHVybiB0aGlzOyB9XHJcblxyXG5cdFx0b3B0aW9ucyA9IEwuZXh0ZW5kKHtcclxuXHRcdFx0YW5pbWF0ZTogZmFsc2UsXHJcblx0XHRcdHBhbjogdHJ1ZVxyXG5cdFx0fSwgb3B0aW9ucyA9PT0gdHJ1ZSA/IHthbmltYXRlOiB0cnVlfSA6IG9wdGlvbnMpO1xyXG5cclxuXHRcdHZhciBvbGRTaXplID0gdGhpcy5nZXRTaXplKCk7XHJcblx0XHR0aGlzLl9zaXplQ2hhbmdlZCA9IHRydWU7XHJcblx0XHR0aGlzLl9pbml0aWFsQ2VudGVyID0gbnVsbDtcclxuXHJcblx0XHR2YXIgbmV3U2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpLFxyXG5cdFx0ICAgIG9sZENlbnRlciA9IG9sZFNpemUuZGl2aWRlQnkoMikucm91bmQoKSxcclxuXHRcdCAgICBuZXdDZW50ZXIgPSBuZXdTaXplLmRpdmlkZUJ5KDIpLnJvdW5kKCksXHJcblx0XHQgICAgb2Zmc2V0ID0gb2xkQ2VudGVyLnN1YnRyYWN0KG5ld0NlbnRlcik7XHJcblxyXG5cdFx0aWYgKCFvZmZzZXQueCAmJiAhb2Zmc2V0LnkpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHRpZiAob3B0aW9ucy5hbmltYXRlICYmIG9wdGlvbnMucGFuKSB7XHJcblx0XHRcdHRoaXMucGFuQnkob2Zmc2V0KTtcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAob3B0aW9ucy5wYW4pIHtcclxuXHRcdFx0XHR0aGlzLl9yYXdQYW5CeShvZmZzZXQpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmZpcmUoJ21vdmUnKTtcclxuXHJcblx0XHRcdGlmIChvcHRpb25zLmRlYm91bmNlTW92ZWVuZCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9zaXplVGltZXIpO1xyXG5cdFx0XHRcdHRoaXMuX3NpemVUaW1lciA9IHNldFRpbWVvdXQoTC5iaW5kKHRoaXMuZmlyZSwgdGhpcywgJ21vdmVlbmQnKSwgMjAwKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmZpcmUoJ21vdmVlbmQnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLmZpcmUoJ3Jlc2l6ZScsIHtcclxuXHRcdFx0b2xkU2l6ZTogb2xkU2l6ZSxcclxuXHRcdFx0bmV3U2l6ZTogbmV3U2l6ZVxyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0Ly8gVE9ETyBoYW5kbGVyLmFkZFRvXHJcblx0YWRkSGFuZGxlcjogZnVuY3Rpb24gKG5hbWUsIEhhbmRsZXJDbGFzcykge1xyXG5cdFx0aWYgKCFIYW5kbGVyQ2xhc3MpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHR2YXIgaGFuZGxlciA9IHRoaXNbbmFtZV0gPSBuZXcgSGFuZGxlckNsYXNzKHRoaXMpO1xyXG5cclxuXHRcdHRoaXMuX2hhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9uc1tuYW1lXSkge1xyXG5cdFx0XHRoYW5kbGVyLmVuYWJsZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ3VubG9hZCcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2luaXRFdmVudHMoJ29mZicpO1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdC8vIHRocm93cyBlcnJvciBpbiBJRTYtOFxyXG5cdFx0XHRkZWxldGUgdGhpcy5fY29udGFpbmVyLl9sZWFmbGV0O1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHR0aGlzLl9jb250YWluZXIuX2xlYWZsZXQgPSB1bmRlZmluZWQ7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fY2xlYXJQYW5lcygpO1xyXG5cdFx0aWYgKHRoaXMuX2NsZWFyQ29udHJvbFBvcykge1xyXG5cdFx0XHR0aGlzLl9jbGVhckNvbnRyb2xQb3MoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jbGVhckhhbmRsZXJzKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblxyXG5cdC8vIHB1YmxpYyBtZXRob2RzIGZvciBnZXR0aW5nIG1hcCBzdGF0ZVxyXG5cclxuXHRnZXRDZW50ZXI6IGZ1bmN0aW9uICgpIHsgLy8gKEJvb2xlYW4pIC0+IExhdExuZ1xyXG5cdFx0dGhpcy5fY2hlY2tJZkxvYWRlZCgpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9pbml0aWFsQ2VudGVyICYmICF0aGlzLl9tb3ZlZCgpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbml0aWFsQ2VudGVyO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJQb2ludFRvTGF0TG5nKHRoaXMuX2dldENlbnRlckxheWVyUG9pbnQoKSk7XHJcblx0fSxcclxuXHJcblx0Z2V0Wm9vbTogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvb207XHJcblx0fSxcclxuXHJcblx0Z2V0Qm91bmRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgYm91bmRzID0gdGhpcy5nZXRQaXhlbEJvdW5kcygpLFxyXG5cdFx0ICAgIHN3ID0gdGhpcy51bnByb2plY3QoYm91bmRzLmdldEJvdHRvbUxlZnQoKSksXHJcblx0XHQgICAgbmUgPSB0aGlzLnVucHJvamVjdChib3VuZHMuZ2V0VG9wUmlnaHQoKSk7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZ0JvdW5kcyhzdywgbmUpO1xyXG5cdH0sXHJcblxyXG5cdGdldE1pblpvb206IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMubWluWm9vbSA9PT0gdW5kZWZpbmVkID9cclxuXHRcdFx0KHRoaXMuX2xheWVyc01pblpvb20gPT09IHVuZGVmaW5lZCA/IDAgOiB0aGlzLl9sYXllcnNNaW5ab29tKSA6XHJcblx0XHRcdHRoaXMub3B0aW9ucy5taW5ab29tO1xyXG5cdH0sXHJcblxyXG5cdGdldE1heFpvb206IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMubWF4Wm9vbSA9PT0gdW5kZWZpbmVkID9cclxuXHRcdFx0KHRoaXMuX2xheWVyc01heFpvb20gPT09IHVuZGVmaW5lZCA/IEluZmluaXR5IDogdGhpcy5fbGF5ZXJzTWF4Wm9vbSkgOlxyXG5cdFx0XHR0aGlzLm9wdGlvbnMubWF4Wm9vbTtcclxuXHR9LFxyXG5cclxuXHRnZXRCb3VuZHNab29tOiBmdW5jdGlvbiAoYm91bmRzLCBpbnNpZGUsIHBhZGRpbmcpIHsgLy8gKExhdExuZ0JvdW5kc1ssIEJvb2xlYW4sIFBvaW50XSkgLT4gTnVtYmVyXHJcblx0XHRib3VuZHMgPSBMLmxhdExuZ0JvdW5kcyhib3VuZHMpO1xyXG5cclxuXHRcdHZhciB6b29tID0gdGhpcy5nZXRNaW5ab29tKCkgLSAoaW5zaWRlID8gMSA6IDApLFxyXG5cdFx0ICAgIG1heFpvb20gPSB0aGlzLmdldE1heFpvb20oKSxcclxuXHRcdCAgICBzaXplID0gdGhpcy5nZXRTaXplKCksXHJcblxyXG5cdFx0ICAgIG53ID0gYm91bmRzLmdldE5vcnRoV2VzdCgpLFxyXG5cdFx0ICAgIHNlID0gYm91bmRzLmdldFNvdXRoRWFzdCgpLFxyXG5cclxuXHRcdCAgICB6b29tTm90Rm91bmQgPSB0cnVlLFxyXG5cdFx0ICAgIGJvdW5kc1NpemU7XHJcblxyXG5cdFx0cGFkZGluZyA9IEwucG9pbnQocGFkZGluZyB8fCBbMCwgMF0pO1xyXG5cclxuXHRcdGRvIHtcclxuXHRcdFx0em9vbSsrO1xyXG5cdFx0XHRib3VuZHNTaXplID0gdGhpcy5wcm9qZWN0KHNlLCB6b29tKS5zdWJ0cmFjdCh0aGlzLnByb2plY3QobncsIHpvb20pKS5hZGQocGFkZGluZyk7XHJcblx0XHRcdHpvb21Ob3RGb3VuZCA9ICFpbnNpZGUgPyBzaXplLmNvbnRhaW5zKGJvdW5kc1NpemUpIDogYm91bmRzU2l6ZS54IDwgc2l6ZS54IHx8IGJvdW5kc1NpemUueSA8IHNpemUueTtcclxuXHJcblx0XHR9IHdoaWxlICh6b29tTm90Rm91bmQgJiYgem9vbSA8PSBtYXhab29tKTtcclxuXHJcblx0XHRpZiAoem9vbU5vdEZvdW5kICYmIGluc2lkZSkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaW5zaWRlID8gem9vbSA6IHpvb20gLSAxO1xyXG5cdH0sXHJcblxyXG5cdGdldFNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fc2l6ZSB8fCB0aGlzLl9zaXplQ2hhbmdlZCkge1xyXG5cdFx0XHR0aGlzLl9zaXplID0gbmV3IEwuUG9pbnQoXHJcblx0XHRcdFx0dGhpcy5fY29udGFpbmVyLmNsaWVudFdpZHRoLFxyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lci5jbGllbnRIZWlnaHQpO1xyXG5cclxuXHRcdFx0dGhpcy5fc2l6ZUNoYW5nZWQgPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9zaXplLmNsb25lKCk7XHJcblx0fSxcclxuXHJcblx0Z2V0UGl4ZWxCb3VuZHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciB0b3BMZWZ0UG9pbnQgPSB0aGlzLl9nZXRUb3BMZWZ0UG9pbnQoKTtcclxuXHRcdHJldHVybiBuZXcgTC5Cb3VuZHModG9wTGVmdFBvaW50LCB0b3BMZWZ0UG9pbnQuYWRkKHRoaXMuZ2V0U2l6ZSgpKSk7XHJcblx0fSxcclxuXHJcblx0Z2V0UGl4ZWxPcmlnaW46IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX2NoZWNrSWZMb2FkZWQoKTtcclxuXHRcdHJldHVybiB0aGlzLl9pbml0aWFsVG9wTGVmdFBvaW50O1xyXG5cdH0sXHJcblxyXG5cdGdldFBhbmVzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFuZXM7XHJcblx0fSxcclxuXHJcblx0Z2V0Q29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvLyBUT0RPIHJlcGxhY2Ugd2l0aCB1bml2ZXJzYWwgaW1wbGVtZW50YXRpb24gYWZ0ZXIgcmVmYWN0b3JpbmcgcHJvamVjdGlvbnNcclxuXHJcblx0Z2V0Wm9vbVNjYWxlOiBmdW5jdGlvbiAodG9ab29tKSB7XHJcblx0XHR2YXIgY3JzID0gdGhpcy5vcHRpb25zLmNycztcclxuXHRcdHJldHVybiBjcnMuc2NhbGUodG9ab29tKSAvIGNycy5zY2FsZSh0aGlzLl96b29tKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTY2FsZVpvb206IGZ1bmN0aW9uIChzY2FsZSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvb20gKyAoTWF0aC5sb2coc2NhbGUpIC8gTWF0aC5MTjIpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvLyBjb252ZXJzaW9uIG1ldGhvZHNcclxuXHJcblx0cHJvamVjdDogZnVuY3Rpb24gKGxhdGxuZywgem9vbSkgeyAvLyAoTGF0TG5nWywgTnVtYmVyXSkgLT4gUG9pbnRcclxuXHRcdHpvb20gPSB6b29tID09PSB1bmRlZmluZWQgPyB0aGlzLl96b29tIDogem9vbTtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMuY3JzLmxhdExuZ1RvUG9pbnQoTC5sYXRMbmcobGF0bG5nKSwgem9vbSk7XHJcblx0fSxcclxuXHJcblx0dW5wcm9qZWN0OiBmdW5jdGlvbiAocG9pbnQsIHpvb20pIHsgLy8gKFBvaW50WywgTnVtYmVyXSkgLT4gTGF0TG5nXHJcblx0XHR6b29tID0gem9vbSA9PT0gdW5kZWZpbmVkID8gdGhpcy5fem9vbSA6IHpvb207XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLmNycy5wb2ludFRvTGF0TG5nKEwucG9pbnQocG9pbnQpLCB6b29tKTtcclxuXHR9LFxyXG5cclxuXHRsYXllclBvaW50VG9MYXRMbmc6IGZ1bmN0aW9uIChwb2ludCkgeyAvLyAoUG9pbnQpXHJcblx0XHR2YXIgcHJvamVjdGVkUG9pbnQgPSBMLnBvaW50KHBvaW50KS5hZGQodGhpcy5nZXRQaXhlbE9yaWdpbigpKTtcclxuXHRcdHJldHVybiB0aGlzLnVucHJvamVjdChwcm9qZWN0ZWRQb2ludCk7XHJcblx0fSxcclxuXHJcblx0bGF0TG5nVG9MYXllclBvaW50OiBmdW5jdGlvbiAobGF0bG5nKSB7IC8vIChMYXRMbmcpXHJcblx0XHR2YXIgcHJvamVjdGVkUG9pbnQgPSB0aGlzLnByb2plY3QoTC5sYXRMbmcobGF0bG5nKSkuX3JvdW5kKCk7XHJcblx0XHRyZXR1cm4gcHJvamVjdGVkUG9pbnQuX3N1YnRyYWN0KHRoaXMuZ2V0UGl4ZWxPcmlnaW4oKSk7XHJcblx0fSxcclxuXHJcblx0Y29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQ6IGZ1bmN0aW9uIChwb2ludCkgeyAvLyAoUG9pbnQpXHJcblx0XHRyZXR1cm4gTC5wb2ludChwb2ludCkuc3VidHJhY3QodGhpcy5fZ2V0TWFwUGFuZVBvcygpKTtcclxuXHR9LFxyXG5cclxuXHRsYXllclBvaW50VG9Db250YWluZXJQb2ludDogZnVuY3Rpb24gKHBvaW50KSB7IC8vIChQb2ludClcclxuXHRcdHJldHVybiBMLnBvaW50KHBvaW50KS5hZGQodGhpcy5fZ2V0TWFwUGFuZVBvcygpKTtcclxuXHR9LFxyXG5cclxuXHRjb250YWluZXJQb2ludFRvTGF0TG5nOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuXHRcdHZhciBsYXllclBvaW50ID0gdGhpcy5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChMLnBvaW50KHBvaW50KSk7XHJcblx0XHRyZXR1cm4gdGhpcy5sYXllclBvaW50VG9MYXRMbmcobGF5ZXJQb2ludCk7XHJcblx0fSxcclxuXHJcblx0bGF0TG5nVG9Db250YWluZXJQb2ludDogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0cmV0dXJuIHRoaXMubGF5ZXJQb2ludFRvQ29udGFpbmVyUG9pbnQodGhpcy5sYXRMbmdUb0xheWVyUG9pbnQoTC5sYXRMbmcobGF0bG5nKSkpO1xyXG5cdH0sXHJcblxyXG5cdG1vdXNlRXZlbnRUb0NvbnRhaW5lclBvaW50OiBmdW5jdGlvbiAoZSkgeyAvLyAoTW91c2VFdmVudClcclxuXHRcdHJldHVybiBMLkRvbUV2ZW50LmdldE1vdXNlUG9zaXRpb24oZSwgdGhpcy5fY29udGFpbmVyKTtcclxuXHR9LFxyXG5cclxuXHRtb3VzZUV2ZW50VG9MYXllclBvaW50OiBmdW5jdGlvbiAoZSkgeyAvLyAoTW91c2VFdmVudClcclxuXHRcdHJldHVybiB0aGlzLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KHRoaXMubW91c2VFdmVudFRvQ29udGFpbmVyUG9pbnQoZSkpO1xyXG5cdH0sXHJcblxyXG5cdG1vdXNlRXZlbnRUb0xhdExuZzogZnVuY3Rpb24gKGUpIHsgLy8gKE1vdXNlRXZlbnQpXHJcblx0XHRyZXR1cm4gdGhpcy5sYXllclBvaW50VG9MYXRMbmcodGhpcy5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUpKTtcclxuXHR9LFxyXG5cclxuXHJcblx0Ly8gbWFwIGluaXRpYWxpemF0aW9uIG1ldGhvZHNcclxuXHJcblx0X2luaXRDb250YWluZXI6IGZ1bmN0aW9uIChpZCkge1xyXG5cdFx0dmFyIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5nZXQoaWQpO1xyXG5cclxuXHRcdGlmICghY29udGFpbmVyKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignTWFwIGNvbnRhaW5lciBub3QgZm91bmQuJyk7XHJcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci5fbGVhZmxldCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ01hcCBjb250YWluZXIgaXMgYWxyZWFkeSBpbml0aWFsaXplZC4nKTtcclxuXHRcdH1cclxuXHJcblx0XHRjb250YWluZXIuX2xlYWZsZXQgPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0TGF5b3V0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgY29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyO1xyXG5cclxuXHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsICdsZWFmbGV0LWNvbnRhaW5lcicgK1xyXG5cdFx0XHQoTC5Ccm93c2VyLnRvdWNoID8gJyBsZWFmbGV0LXRvdWNoJyA6ICcnKSArXHJcblx0XHRcdChMLkJyb3dzZXIucmV0aW5hID8gJyBsZWFmbGV0LXJldGluYScgOiAnJykgK1xyXG5cdFx0XHQoTC5Ccm93c2VyLmllbHQ5ID8gJyBsZWFmbGV0LW9sZGllJyA6ICcnKSArXHJcblx0XHRcdCh0aGlzLm9wdGlvbnMuZmFkZUFuaW1hdGlvbiA/ICcgbGVhZmxldC1mYWRlLWFuaW0nIDogJycpKTtcclxuXHJcblx0XHR2YXIgcG9zaXRpb24gPSBMLkRvbVV0aWwuZ2V0U3R5bGUoY29udGFpbmVyLCAncG9zaXRpb24nKTtcclxuXHJcblx0XHRpZiAocG9zaXRpb24gIT09ICdhYnNvbHV0ZScgJiYgcG9zaXRpb24gIT09ICdyZWxhdGl2ZScgJiYgcG9zaXRpb24gIT09ICdmaXhlZCcpIHtcclxuXHRcdFx0Y29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9pbml0UGFuZXMoKTtcclxuXHJcblx0XHRpZiAodGhpcy5faW5pdENvbnRyb2xQb3MpIHtcclxuXHRcdFx0dGhpcy5faW5pdENvbnRyb2xQb3MoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfaW5pdFBhbmVzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcGFuZXMgPSB0aGlzLl9wYW5lcyA9IHt9O1xyXG5cclxuXHRcdHRoaXMuX21hcFBhbmUgPSBwYW5lcy5tYXBQYW5lID0gdGhpcy5fY3JlYXRlUGFuZSgnbGVhZmxldC1tYXAtcGFuZScsIHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0dGhpcy5fdGlsZVBhbmUgPSBwYW5lcy50aWxlUGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmUoJ2xlYWZsZXQtdGlsZS1wYW5lJywgdGhpcy5fbWFwUGFuZSk7XHJcblx0XHRwYW5lcy5vYmplY3RzUGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmUoJ2xlYWZsZXQtb2JqZWN0cy1wYW5lJywgdGhpcy5fbWFwUGFuZSk7XHJcblx0XHRwYW5lcy5zaGFkb3dQYW5lID0gdGhpcy5fY3JlYXRlUGFuZSgnbGVhZmxldC1zaGFkb3ctcGFuZScpO1xyXG5cdFx0cGFuZXMub3ZlcmxheVBhbmUgPSB0aGlzLl9jcmVhdGVQYW5lKCdsZWFmbGV0LW92ZXJsYXktcGFuZScpO1xyXG5cdFx0cGFuZXMubWFya2VyUGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmUoJ2xlYWZsZXQtbWFya2VyLXBhbmUnKTtcclxuXHRcdHBhbmVzLnBvcHVwUGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmUoJ2xlYWZsZXQtcG9wdXAtcGFuZScpO1xyXG5cclxuXHRcdHZhciB6b29tSGlkZSA9ICcgbGVhZmxldC16b29tLWhpZGUnO1xyXG5cclxuXHRcdGlmICghdGhpcy5vcHRpb25zLm1hcmtlclpvb21BbmltYXRpb24pIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHBhbmVzLm1hcmtlclBhbmUsIHpvb21IaWRlKTtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHBhbmVzLnNoYWRvd1BhbmUsIHpvb21IaWRlKTtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHBhbmVzLnBvcHVwUGFuZSwgem9vbUhpZGUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVQYW5lOiBmdW5jdGlvbiAoY2xhc3NOYW1lLCBjb250YWluZXIpIHtcclxuXHRcdHJldHVybiBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUsIGNvbnRhaW5lciB8fCB0aGlzLl9wYW5lcy5vYmplY3RzUGFuZSk7XHJcblx0fSxcclxuXHJcblx0X2NsZWFyUGFuZXM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX2NvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLl9tYXBQYW5lKTtcclxuXHR9LFxyXG5cclxuXHRfYWRkTGF5ZXJzOiBmdW5jdGlvbiAobGF5ZXJzKSB7XHJcblx0XHRsYXllcnMgPSBsYXllcnMgPyAoTC5VdGlsLmlzQXJyYXkobGF5ZXJzKSA/IGxheWVycyA6IFtsYXllcnNdKSA6IFtdO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBsYXllcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0dGhpcy5hZGRMYXllcihsYXllcnNbaV0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvLyBwcml2YXRlIG1ldGhvZHMgdGhhdCBtb2RpZnkgbWFwIHN0YXRlXHJcblxyXG5cdF9yZXNldFZpZXc6IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20sIHByZXNlcnZlTWFwT2Zmc2V0LCBhZnRlclpvb21BbmltKSB7XHJcblxyXG5cdFx0dmFyIHpvb21DaGFuZ2VkID0gKHRoaXMuX3pvb20gIT09IHpvb20pO1xyXG5cclxuXHRcdGlmICghYWZ0ZXJab29tQW5pbSkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ21vdmVzdGFydCcpO1xyXG5cclxuXHRcdFx0aWYgKHpvb21DaGFuZ2VkKSB7XHJcblx0XHRcdFx0dGhpcy5maXJlKCd6b29tc3RhcnQnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3pvb20gPSB6b29tO1xyXG5cdFx0dGhpcy5faW5pdGlhbENlbnRlciA9IGNlbnRlcjtcclxuXHJcblx0XHR0aGlzLl9pbml0aWFsVG9wTGVmdFBvaW50ID0gdGhpcy5fZ2V0TmV3VG9wTGVmdFBvaW50KGNlbnRlcik7XHJcblxyXG5cdFx0aWYgKCFwcmVzZXJ2ZU1hcE9mZnNldCkge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fbWFwUGFuZSwgbmV3IEwuUG9pbnQoMCwgMCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5faW5pdGlhbFRvcExlZnRQb2ludC5fYWRkKHRoaXMuX2dldE1hcFBhbmVQb3MoKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fdGlsZUxheWVyc1RvTG9hZCA9IHRoaXMuX3RpbGVMYXllcnNOdW07XHJcblxyXG5cdFx0dmFyIGxvYWRpbmcgPSAhdGhpcy5fbG9hZGVkO1xyXG5cdFx0dGhpcy5fbG9hZGVkID0gdHJ1ZTtcclxuXHJcblx0XHRpZiAobG9hZGluZykge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2xvYWQnKTtcclxuXHRcdFx0dGhpcy5lYWNoTGF5ZXIodGhpcy5fbGF5ZXJBZGQsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgndmlld3Jlc2V0Jywge2hhcmQ6ICFwcmVzZXJ2ZU1hcE9mZnNldH0pO1xyXG5cclxuXHRcdHRoaXMuZmlyZSgnbW92ZScpO1xyXG5cclxuXHRcdGlmICh6b29tQ2hhbmdlZCB8fCBhZnRlclpvb21BbmltKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnem9vbWVuZCcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgnbW92ZWVuZCcsIHtoYXJkOiAhcHJlc2VydmVNYXBPZmZzZXR9KTtcclxuXHR9LFxyXG5cclxuXHRfcmF3UGFuQnk6IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9tYXBQYW5lLCB0aGlzLl9nZXRNYXBQYW5lUG9zKCkuc3VidHJhY3Qob2Zmc2V0KSk7XHJcblx0fSxcclxuXHJcblx0X2dldFpvb21TcGFuOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRNYXhab29tKCkgLSB0aGlzLmdldE1pblpvb20oKTtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlWm9vbUxldmVsczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGksXHJcblx0XHRcdG1pblpvb20gPSBJbmZpbml0eSxcclxuXHRcdFx0bWF4Wm9vbSA9IC1JbmZpbml0eSxcclxuXHRcdFx0b2xkWm9vbVNwYW4gPSB0aGlzLl9nZXRab29tU3BhbigpO1xyXG5cclxuXHRcdGZvciAoaSBpbiB0aGlzLl96b29tQm91bmRMYXllcnMpIHtcclxuXHRcdFx0dmFyIGxheWVyID0gdGhpcy5fem9vbUJvdW5kTGF5ZXJzW2ldO1xyXG5cdFx0XHRpZiAoIWlzTmFOKGxheWVyLm9wdGlvbnMubWluWm9vbSkpIHtcclxuXHRcdFx0XHRtaW5ab29tID0gTWF0aC5taW4obWluWm9vbSwgbGF5ZXIub3B0aW9ucy5taW5ab29tKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIWlzTmFOKGxheWVyLm9wdGlvbnMubWF4Wm9vbSkpIHtcclxuXHRcdFx0XHRtYXhab29tID0gTWF0aC5tYXgobWF4Wm9vbSwgbGF5ZXIub3B0aW9ucy5tYXhab29tKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChpID09PSB1bmRlZmluZWQpIHsgLy8gd2UgaGF2ZSBubyB0aWxlbGF5ZXJzXHJcblx0XHRcdHRoaXMuX2xheWVyc01heFpvb20gPSB0aGlzLl9sYXllcnNNaW5ab29tID0gdW5kZWZpbmVkO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fbGF5ZXJzTWF4Wm9vbSA9IG1heFpvb207XHJcblx0XHRcdHRoaXMuX2xheWVyc01pblpvb20gPSBtaW5ab29tO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChvbGRab29tU3BhbiAhPT0gdGhpcy5fZ2V0Wm9vbVNwYW4oKSkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ3pvb21sZXZlbHNjaGFuZ2UnKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfcGFuSW5zaWRlTWF4Qm91bmRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLnBhbkluc2lkZUJvdW5kcyh0aGlzLm9wdGlvbnMubWF4Qm91bmRzKTtcclxuXHR9LFxyXG5cclxuXHRfY2hlY2tJZkxvYWRlZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdTZXQgbWFwIGNlbnRlciBhbmQgem9vbSBmaXJzdC4nKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyBtYXAgZXZlbnRzXHJcblxyXG5cdF9pbml0RXZlbnRzOiBmdW5jdGlvbiAob25PZmYpIHtcclxuXHRcdGlmICghTC5Eb21FdmVudCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRvbk9mZiA9IG9uT2ZmIHx8ICdvbic7XHJcblxyXG5cdFx0TC5Eb21FdmVudFtvbk9mZl0odGhpcy5fY29udGFpbmVyLCAnY2xpY2snLCB0aGlzLl9vbk1vdXNlQ2xpY2ssIHRoaXMpO1xyXG5cclxuXHRcdHZhciBldmVudHMgPSBbJ2RibGNsaWNrJywgJ21vdXNlZG93bicsICdtb3VzZXVwJywgJ21vdXNlZW50ZXInLFxyXG5cdFx0ICAgICAgICAgICAgICAnbW91c2VsZWF2ZScsICdtb3VzZW1vdmUnLCAnY29udGV4dG1lbnUnXSxcclxuXHRcdCAgICBpLCBsZW47XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gZXZlbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdEwuRG9tRXZlbnRbb25PZmZdKHRoaXMuX2NvbnRhaW5lciwgZXZlbnRzW2ldLCB0aGlzLl9maXJlTW91c2VFdmVudCwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy50cmFja1Jlc2l6ZSkge1xyXG5cdFx0XHRMLkRvbUV2ZW50W29uT2ZmXSh3aW5kb3csICdyZXNpemUnLCB0aGlzLl9vblJlc2l6ZSwgdGhpcyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X29uUmVzaXplOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLlV0aWwuY2FuY2VsQW5pbUZyYW1lKHRoaXMuX3Jlc2l6ZVJlcXVlc3QpO1xyXG5cdFx0dGhpcy5fcmVzaXplUmVxdWVzdCA9IEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKFxyXG5cdFx0ICAgICAgICBmdW5jdGlvbiAoKSB7IHRoaXMuaW52YWxpZGF0ZVNpemUoe2RlYm91bmNlTW92ZWVuZDogdHJ1ZX0pOyB9LCB0aGlzLCBmYWxzZSwgdGhpcy5fY29udGFpbmVyKTtcclxuXHR9LFxyXG5cclxuXHRfb25Nb3VzZUNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKCF0aGlzLl9sb2FkZWQgfHwgKCFlLl9zaW11bGF0ZWQgJiZcclxuXHRcdCAgICAgICAgKCh0aGlzLmRyYWdnaW5nICYmIHRoaXMuZHJhZ2dpbmcubW92ZWQoKSkgfHxcclxuXHRcdCAgICAgICAgICh0aGlzLmJveFpvb20gICYmIHRoaXMuYm94Wm9vbS5tb3ZlZCgpKSkpIHx8XHJcblx0XHQgICAgICAgICAgICBMLkRvbUV2ZW50Ll9za2lwcGVkKGUpKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHRoaXMuZmlyZSgncHJlY2xpY2snKTtcclxuXHRcdHRoaXMuX2ZpcmVNb3VzZUV2ZW50KGUpO1xyXG5cdH0sXHJcblxyXG5cdF9maXJlTW91c2VFdmVudDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGlmICghdGhpcy5fbG9hZGVkIHx8IEwuRG9tRXZlbnQuX3NraXBwZWQoZSkpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dmFyIHR5cGUgPSBlLnR5cGU7XHJcblxyXG5cdFx0dHlwZSA9ICh0eXBlID09PSAnbW91c2VlbnRlcicgPyAnbW91c2VvdmVyJyA6ICh0eXBlID09PSAnbW91c2VsZWF2ZScgPyAnbW91c2VvdXQnIDogdHlwZSkpO1xyXG5cclxuXHRcdGlmICghdGhpcy5oYXNFdmVudExpc3RlbmVycyh0eXBlKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHRpZiAodHlwZSA9PT0gJ2NvbnRleHRtZW51Jykge1xyXG5cdFx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBjb250YWluZXJQb2ludCA9IHRoaXMubW91c2VFdmVudFRvQ29udGFpbmVyUG9pbnQoZSksXHJcblx0XHQgICAgbGF5ZXJQb2ludCA9IHRoaXMuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoY29udGFpbmVyUG9pbnQpLFxyXG5cdFx0ICAgIGxhdGxuZyA9IHRoaXMubGF5ZXJQb2ludFRvTGF0TG5nKGxheWVyUG9pbnQpO1xyXG5cclxuXHRcdHRoaXMuZmlyZSh0eXBlLCB7XHJcblx0XHRcdGxhdGxuZzogbGF0bG5nLFxyXG5cdFx0XHRsYXllclBvaW50OiBsYXllclBvaW50LFxyXG5cdFx0XHRjb250YWluZXJQb2ludDogY29udGFpbmVyUG9pbnQsXHJcblx0XHRcdG9yaWdpbmFsRXZlbnQ6IGVcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdF9vblRpbGVMYXllckxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX3RpbGVMYXllcnNUb0xvYWQtLTtcclxuXHRcdGlmICh0aGlzLl90aWxlTGF5ZXJzTnVtICYmICF0aGlzLl90aWxlTGF5ZXJzVG9Mb2FkKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgndGlsZWxheWVyc2xvYWQnKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfY2xlYXJIYW5kbGVyczogZnVuY3Rpb24gKCkge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX2hhbmRsZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHRoaXMuX2hhbmRsZXJzW2ldLmRpc2FibGUoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHR3aGVuUmVhZHk6IGZ1bmN0aW9uIChjYWxsYmFjaywgY29udGV4dCkge1xyXG5cdFx0aWYgKHRoaXMuX2xvYWRlZCkge1xyXG5cdFx0XHRjYWxsYmFjay5jYWxsKGNvbnRleHQgfHwgdGhpcywgdGhpcyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLm9uKCdsb2FkJywgY2FsbGJhY2ssIGNvbnRleHQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X2xheWVyQWRkOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdGxheWVyLm9uQWRkKHRoaXMpO1xyXG5cdFx0dGhpcy5maXJlKCdsYXllcmFkZCcsIHtsYXllcjogbGF5ZXJ9KTtcclxuXHR9LFxyXG5cclxuXHJcblx0Ly8gcHJpdmF0ZSBtZXRob2RzIGZvciBnZXR0aW5nIG1hcCBzdGF0ZVxyXG5cclxuXHRfZ2V0TWFwUGFuZVBvczogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIEwuRG9tVXRpbC5nZXRQb3NpdGlvbih0aGlzLl9tYXBQYW5lKTtcclxuXHR9LFxyXG5cclxuXHRfbW92ZWQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwb3MgPSB0aGlzLl9nZXRNYXBQYW5lUG9zKCk7XHJcblx0XHRyZXR1cm4gcG9zICYmICFwb3MuZXF1YWxzKFswLCAwXSk7XHJcblx0fSxcclxuXHJcblx0X2dldFRvcExlZnRQb2ludDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0UGl4ZWxPcmlnaW4oKS5zdWJ0cmFjdCh0aGlzLl9nZXRNYXBQYW5lUG9zKCkpO1xyXG5cdH0sXHJcblxyXG5cdF9nZXROZXdUb3BMZWZ0UG9pbnQ6IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20pIHtcclxuXHRcdHZhciB2aWV3SGFsZiA9IHRoaXMuZ2V0U2l6ZSgpLl9kaXZpZGVCeSgyKTtcclxuXHRcdC8vIFRPRE8gcm91bmQgb24gZGlzcGxheSwgbm90IGNhbGN1bGF0aW9uIHRvIGluY3JlYXNlIHByZWNpc2lvbj9cclxuXHRcdHJldHVybiB0aGlzLnByb2plY3QoY2VudGVyLCB6b29tKS5fc3VidHJhY3Qodmlld0hhbGYpLl9yb3VuZCgpO1xyXG5cdH0sXHJcblxyXG5cdF9sYXRMbmdUb05ld0xheWVyUG9pbnQ6IGZ1bmN0aW9uIChsYXRsbmcsIG5ld1pvb20sIG5ld0NlbnRlcikge1xyXG5cdFx0dmFyIHRvcExlZnQgPSB0aGlzLl9nZXROZXdUb3BMZWZ0UG9pbnQobmV3Q2VudGVyLCBuZXdab29tKS5hZGQodGhpcy5fZ2V0TWFwUGFuZVBvcygpKTtcclxuXHRcdHJldHVybiB0aGlzLnByb2plY3QobGF0bG5nLCBuZXdab29tKS5fc3VidHJhY3QodG9wTGVmdCk7XHJcblx0fSxcclxuXHJcblx0Ly8gbGF5ZXIgcG9pbnQgb2YgdGhlIGN1cnJlbnQgY2VudGVyXHJcblx0X2dldENlbnRlckxheWVyUG9pbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KHRoaXMuZ2V0U2l6ZSgpLl9kaXZpZGVCeSgyKSk7XHJcblx0fSxcclxuXHJcblx0Ly8gb2Zmc2V0IG9mIHRoZSBzcGVjaWZpZWQgcGxhY2UgdG8gdGhlIGN1cnJlbnQgY2VudGVyIGluIHBpeGVsc1xyXG5cdF9nZXRDZW50ZXJPZmZzZXQ6IGZ1bmN0aW9uIChsYXRsbmcpIHtcclxuXHRcdHJldHVybiB0aGlzLmxhdExuZ1RvTGF5ZXJQb2ludChsYXRsbmcpLnN1YnRyYWN0KHRoaXMuX2dldENlbnRlckxheWVyUG9pbnQoKSk7XHJcblx0fSxcclxuXHJcblx0Ly8gYWRqdXN0IGNlbnRlciBmb3IgdmlldyB0byBnZXQgaW5zaWRlIGJvdW5kc1xyXG5cdF9saW1pdENlbnRlcjogZnVuY3Rpb24gKGNlbnRlciwgem9vbSwgYm91bmRzKSB7XHJcblxyXG5cdFx0aWYgKCFib3VuZHMpIHsgcmV0dXJuIGNlbnRlcjsgfVxyXG5cclxuXHRcdHZhciBjZW50ZXJQb2ludCA9IHRoaXMucHJvamVjdChjZW50ZXIsIHpvb20pLFxyXG5cdFx0ICAgIHZpZXdIYWxmID0gdGhpcy5nZXRTaXplKCkuZGl2aWRlQnkoMiksXHJcblx0XHQgICAgdmlld0JvdW5kcyA9IG5ldyBMLkJvdW5kcyhjZW50ZXJQb2ludC5zdWJ0cmFjdCh2aWV3SGFsZiksIGNlbnRlclBvaW50LmFkZCh2aWV3SGFsZikpLFxyXG5cdFx0ICAgIG9mZnNldCA9IHRoaXMuX2dldEJvdW5kc09mZnNldCh2aWV3Qm91bmRzLCBib3VuZHMsIHpvb20pO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnVucHJvamVjdChjZW50ZXJQb2ludC5hZGQob2Zmc2V0KSwgem9vbSk7XHJcblx0fSxcclxuXHJcblx0Ly8gYWRqdXN0IG9mZnNldCBmb3IgdmlldyB0byBnZXQgaW5zaWRlIGJvdW5kc1xyXG5cdF9saW1pdE9mZnNldDogZnVuY3Rpb24gKG9mZnNldCwgYm91bmRzKSB7XHJcblx0XHRpZiAoIWJvdW5kcykgeyByZXR1cm4gb2Zmc2V0OyB9XHJcblxyXG5cdFx0dmFyIHZpZXdCb3VuZHMgPSB0aGlzLmdldFBpeGVsQm91bmRzKCksXHJcblx0XHQgICAgbmV3Qm91bmRzID0gbmV3IEwuQm91bmRzKHZpZXdCb3VuZHMubWluLmFkZChvZmZzZXQpLCB2aWV3Qm91bmRzLm1heC5hZGQob2Zmc2V0KSk7XHJcblxyXG5cdFx0cmV0dXJuIG9mZnNldC5hZGQodGhpcy5fZ2V0Qm91bmRzT2Zmc2V0KG5ld0JvdW5kcywgYm91bmRzKSk7XHJcblx0fSxcclxuXHJcblx0Ly8gcmV0dXJucyBvZmZzZXQgbmVlZGVkIGZvciBweEJvdW5kcyB0byBnZXQgaW5zaWRlIG1heEJvdW5kcyBhdCBhIHNwZWNpZmllZCB6b29tXHJcblx0X2dldEJvdW5kc09mZnNldDogZnVuY3Rpb24gKHB4Qm91bmRzLCBtYXhCb3VuZHMsIHpvb20pIHtcclxuXHRcdHZhciBud09mZnNldCA9IHRoaXMucHJvamVjdChtYXhCb3VuZHMuZ2V0Tm9ydGhXZXN0KCksIHpvb20pLnN1YnRyYWN0KHB4Qm91bmRzLm1pbiksXHJcblx0XHQgICAgc2VPZmZzZXQgPSB0aGlzLnByb2plY3QobWF4Qm91bmRzLmdldFNvdXRoRWFzdCgpLCB6b29tKS5zdWJ0cmFjdChweEJvdW5kcy5tYXgpLFxyXG5cclxuXHRcdCAgICBkeCA9IHRoaXMuX3JlYm91bmQobndPZmZzZXQueCwgLXNlT2Zmc2V0LngpLFxyXG5cdFx0ICAgIGR5ID0gdGhpcy5fcmVib3VuZChud09mZnNldC55LCAtc2VPZmZzZXQueSk7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBMLlBvaW50KGR4LCBkeSk7XHJcblx0fSxcclxuXHJcblx0X3JlYm91bmQ6IGZ1bmN0aW9uIChsZWZ0LCByaWdodCkge1xyXG5cdFx0cmV0dXJuIGxlZnQgKyByaWdodCA+IDAgP1xyXG5cdFx0XHRNYXRoLnJvdW5kKGxlZnQgLSByaWdodCkgLyAyIDpcclxuXHRcdFx0TWF0aC5tYXgoMCwgTWF0aC5jZWlsKGxlZnQpKSAtIE1hdGgubWF4KDAsIE1hdGguZmxvb3IocmlnaHQpKTtcclxuXHR9LFxyXG5cclxuXHRfbGltaXRab29tOiBmdW5jdGlvbiAoem9vbSkge1xyXG5cdFx0dmFyIG1pbiA9IHRoaXMuZ2V0TWluWm9vbSgpLFxyXG5cdFx0ICAgIG1heCA9IHRoaXMuZ2V0TWF4Wm9vbSgpO1xyXG5cclxuXHRcdHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgem9vbSkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLm1hcCA9IGZ1bmN0aW9uIChpZCwgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5NYXAoaWQsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTWVyY2F0b3IgcHJvamVjdGlvbiB0aGF0IHRha2VzIGludG8gYWNjb3VudCB0aGF0IHRoZSBFYXJ0aCBpcyBub3QgYSBwZXJmZWN0IHNwaGVyZS5cclxuICogTGVzcyBwb3B1bGFyIHRoYW4gc3BoZXJpY2FsIG1lcmNhdG9yOyB1c2VkIGJ5IHByb2plY3Rpb25zIGxpa2UgRVBTRzozMzk1LlxyXG4gKi9cclxuXHJcbkwuUHJvamVjdGlvbi5NZXJjYXRvciA9IHtcclxuXHRNQVhfTEFUSVRVREU6IDg1LjA4NDA1OTE1NTYsXHJcblxyXG5cdFJfTUlOT1I6IDYzNTY3NTIuMzE0MjQ1MTc5LFxyXG5cdFJfTUFKT1I6IDYzNzgxMzcsXHJcblxyXG5cdHByb2plY3Q6IGZ1bmN0aW9uIChsYXRsbmcpIHsgLy8gKExhdExuZykgLT4gUG9pbnRcclxuXHRcdHZhciBkID0gTC5MYXRMbmcuREVHX1RPX1JBRCxcclxuXHRcdCAgICBtYXggPSB0aGlzLk1BWF9MQVRJVFVERSxcclxuXHRcdCAgICBsYXQgPSBNYXRoLm1heChNYXRoLm1pbihtYXgsIGxhdGxuZy5sYXQpLCAtbWF4KSxcclxuXHRcdCAgICByID0gdGhpcy5SX01BSk9SLFxyXG5cdFx0ICAgIHIyID0gdGhpcy5SX01JTk9SLFxyXG5cdFx0ICAgIHggPSBsYXRsbmcubG5nICogZCAqIHIsXHJcblx0XHQgICAgeSA9IGxhdCAqIGQsXHJcblx0XHQgICAgdG1wID0gcjIgLyByLFxyXG5cdFx0ICAgIGVjY2VudCA9IE1hdGguc3FydCgxLjAgLSB0bXAgKiB0bXApLFxyXG5cdFx0ICAgIGNvbiA9IGVjY2VudCAqIE1hdGguc2luKHkpO1xyXG5cclxuXHRcdGNvbiA9IE1hdGgucG93KCgxIC0gY29uKSAvICgxICsgY29uKSwgZWNjZW50ICogMC41KTtcclxuXHJcblx0XHR2YXIgdHMgPSBNYXRoLnRhbigwLjUgKiAoKE1hdGguUEkgKiAwLjUpIC0geSkpIC8gY29uO1xyXG5cdFx0eSA9IC1yICogTWF0aC5sb2codHMpO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5Qb2ludCh4LCB5KTtcclxuXHR9LFxyXG5cclxuXHR1bnByb2plY3Q6IGZ1bmN0aW9uIChwb2ludCkgeyAvLyAoUG9pbnQsIEJvb2xlYW4pIC0+IExhdExuZ1xyXG5cdFx0dmFyIGQgPSBMLkxhdExuZy5SQURfVE9fREVHLFxyXG5cdFx0ICAgIHIgPSB0aGlzLlJfTUFKT1IsXHJcblx0XHQgICAgcjIgPSB0aGlzLlJfTUlOT1IsXHJcblx0XHQgICAgbG5nID0gcG9pbnQueCAqIGQgLyByLFxyXG5cdFx0ICAgIHRtcCA9IHIyIC8gcixcclxuXHRcdCAgICBlY2NlbnQgPSBNYXRoLnNxcnQoMSAtICh0bXAgKiB0bXApKSxcclxuXHRcdCAgICB0cyA9IE1hdGguZXhwKC0gcG9pbnQueSAvIHIpLFxyXG5cdFx0ICAgIHBoaSA9IChNYXRoLlBJIC8gMikgLSAyICogTWF0aC5hdGFuKHRzKSxcclxuXHRcdCAgICBudW1JdGVyID0gMTUsXHJcblx0XHQgICAgdG9sID0gMWUtNyxcclxuXHRcdCAgICBpID0gbnVtSXRlcixcclxuXHRcdCAgICBkcGhpID0gMC4xLFxyXG5cdFx0ICAgIGNvbjtcclxuXHJcblx0XHR3aGlsZSAoKE1hdGguYWJzKGRwaGkpID4gdG9sKSAmJiAoLS1pID4gMCkpIHtcclxuXHRcdFx0Y29uID0gZWNjZW50ICogTWF0aC5zaW4ocGhpKTtcclxuXHRcdFx0ZHBoaSA9IChNYXRoLlBJIC8gMikgLSAyICogTWF0aC5hdGFuKHRzICpcclxuXHRcdFx0ICAgICAgICAgICAgTWF0aC5wb3coKDEuMCAtIGNvbikgLyAoMS4wICsgY29uKSwgMC41ICogZWNjZW50KSkgLSBwaGk7XHJcblx0XHRcdHBoaSArPSBkcGhpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmcocGhpICogZCwgbG5nKTtcclxuXHR9XHJcbn07XHJcblxuXG5cclxuTC5DUlMuRVBTRzMzOTUgPSBMLmV4dGVuZCh7fSwgTC5DUlMsIHtcclxuXHRjb2RlOiAnRVBTRzozMzk1JyxcclxuXHJcblx0cHJvamVjdGlvbjogTC5Qcm9qZWN0aW9uLk1lcmNhdG9yLFxyXG5cclxuXHR0cmFuc2Zvcm1hdGlvbjogKGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBtID0gTC5Qcm9qZWN0aW9uLk1lcmNhdG9yLFxyXG5cdFx0ICAgIHIgPSBtLlJfTUFKT1IsXHJcblx0XHQgICAgc2NhbGUgPSAwLjUgLyAoTWF0aC5QSSAqIHIpO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5UcmFuc2Zvcm1hdGlvbihzY2FsZSwgMC41LCAtc2NhbGUsIDAuNSk7XHJcblx0fSgpKVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIEwuVGlsZUxheWVyIGlzIHVzZWQgZm9yIHN0YW5kYXJkIHh5ei1udW1iZXJlZCB0aWxlIGxheWVycy5cclxuICovXHJcblxyXG5MLlRpbGVMYXllciA9IEwuQ2xhc3MuZXh0ZW5kKHtcclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdG1pblpvb206IDAsXHJcblx0XHRtYXhab29tOiAxOCxcclxuXHRcdHRpbGVTaXplOiAyNTYsXHJcblx0XHRzdWJkb21haW5zOiAnYWJjJyxcclxuXHRcdGVycm9yVGlsZVVybDogJycsXHJcblx0XHRhdHRyaWJ1dGlvbjogJycsXHJcblx0XHR6b29tT2Zmc2V0OiAwLFxyXG5cdFx0b3BhY2l0eTogMSxcclxuXHRcdC8qXHJcblx0XHRtYXhOYXRpdmVab29tOiBudWxsLFxyXG5cdFx0ekluZGV4OiBudWxsLFxyXG5cdFx0dG1zOiBmYWxzZSxcclxuXHRcdGNvbnRpbnVvdXNXb3JsZDogZmFsc2UsXHJcblx0XHRub1dyYXA6IGZhbHNlLFxyXG5cdFx0em9vbVJldmVyc2U6IGZhbHNlLFxyXG5cdFx0ZGV0ZWN0UmV0aW5hOiBmYWxzZSxcclxuXHRcdHJldXNlVGlsZXM6IGZhbHNlLFxyXG5cdFx0Ym91bmRzOiBmYWxzZSxcclxuXHRcdCovXHJcblx0XHR1bmxvYWRJbnZpc2libGVUaWxlczogTC5Ccm93c2VyLm1vYmlsZSxcclxuXHRcdHVwZGF0ZVdoZW5JZGxlOiBMLkJyb3dzZXIubW9iaWxlXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xyXG5cdFx0b3B0aW9ucyA9IEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHQvLyBkZXRlY3RpbmcgcmV0aW5hIGRpc3BsYXlzLCBhZGp1c3RpbmcgdGlsZVNpemUgYW5kIHpvb20gbGV2ZWxzXHJcblx0XHRpZiAob3B0aW9ucy5kZXRlY3RSZXRpbmEgJiYgTC5Ccm93c2VyLnJldGluYSAmJiBvcHRpb25zLm1heFpvb20gPiAwKSB7XHJcblxyXG5cdFx0XHRvcHRpb25zLnRpbGVTaXplID0gTWF0aC5mbG9vcihvcHRpb25zLnRpbGVTaXplIC8gMik7XHJcblx0XHRcdG9wdGlvbnMuem9vbU9mZnNldCsrO1xyXG5cclxuXHRcdFx0aWYgKG9wdGlvbnMubWluWm9vbSA+IDApIHtcclxuXHRcdFx0XHRvcHRpb25zLm1pblpvb20tLTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLm9wdGlvbnMubWF4Wm9vbS0tO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChvcHRpb25zLmJvdW5kcykge1xyXG5cdFx0XHRvcHRpb25zLmJvdW5kcyA9IEwubGF0TG5nQm91bmRzKG9wdGlvbnMuYm91bmRzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl91cmwgPSB1cmw7XHJcblxyXG5cdFx0dmFyIHN1YmRvbWFpbnMgPSB0aGlzLm9wdGlvbnMuc3ViZG9tYWlucztcclxuXHJcblx0XHRpZiAodHlwZW9mIHN1YmRvbWFpbnMgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdHRoaXMub3B0aW9ucy5zdWJkb21haW5zID0gc3ViZG9tYWlucy5zcGxpdCgnJyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX21hcCA9IG1hcDtcclxuXHRcdHRoaXMuX2FuaW1hdGVkID0gbWFwLl96b29tQW5pbWF0ZWQ7XHJcblxyXG5cdFx0Ly8gY3JlYXRlIGEgY29udGFpbmVyIGRpdiBmb3IgdGlsZXNcclxuXHRcdHRoaXMuX2luaXRDb250YWluZXIoKTtcclxuXHJcblx0XHQvLyBzZXQgdXAgZXZlbnRzXHJcblx0XHRtYXAub24oe1xyXG5cdFx0XHQndmlld3Jlc2V0JzogdGhpcy5fcmVzZXQsXHJcblx0XHRcdCdtb3ZlZW5kJzogdGhpcy5fdXBkYXRlXHJcblx0XHR9LCB0aGlzKTtcclxuXHJcblx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0bWFwLm9uKHtcclxuXHRcdFx0XHQnem9vbWFuaW0nOiB0aGlzLl9hbmltYXRlWm9vbSxcclxuXHRcdFx0XHQnem9vbWVuZCc6IHRoaXMuX2VuZFpvb21BbmltXHJcblx0XHRcdH0sIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghdGhpcy5vcHRpb25zLnVwZGF0ZVdoZW5JZGxlKSB7XHJcblx0XHRcdHRoaXMuX2xpbWl0ZWRVcGRhdGUgPSBMLlV0aWwubGltaXRFeGVjQnlJbnRlcnZhbCh0aGlzLl91cGRhdGUsIDE1MCwgdGhpcyk7XHJcblx0XHRcdG1hcC5vbignbW92ZScsIHRoaXMuX2xpbWl0ZWRVcGRhdGUsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3Jlc2V0KCk7XHJcblx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX2NvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0bWFwLm9mZih7XHJcblx0XHRcdCd2aWV3cmVzZXQnOiB0aGlzLl9yZXNldCxcclxuXHRcdFx0J21vdmVlbmQnOiB0aGlzLl91cGRhdGVcclxuXHRcdH0sIHRoaXMpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9hbmltYXRlZCkge1xyXG5cdFx0XHRtYXAub2ZmKHtcclxuXHRcdFx0XHQnem9vbWFuaW0nOiB0aGlzLl9hbmltYXRlWm9vbSxcclxuXHRcdFx0XHQnem9vbWVuZCc6IHRoaXMuX2VuZFpvb21BbmltXHJcblx0XHRcdH0sIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghdGhpcy5vcHRpb25zLnVwZGF0ZVdoZW5JZGxlKSB7XHJcblx0XHRcdG1hcC5vZmYoJ21vdmUnLCB0aGlzLl9saW1pdGVkVXBkYXRlLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250YWluZXIgPSBudWxsO1xyXG5cdFx0dGhpcy5fbWFwID0gbnVsbDtcclxuXHR9LFxyXG5cclxuXHRicmluZ1RvRnJvbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcclxuXHJcblx0XHRpZiAodGhpcy5fY29udGFpbmVyKSB7XHJcblx0XHRcdHBhbmUuYXBwZW5kQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHRcdFx0dGhpcy5fc2V0QXV0b1pJbmRleChwYW5lLCBNYXRoLm1heCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YnJpbmdUb0JhY2s6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcclxuXHJcblx0XHRpZiAodGhpcy5fY29udGFpbmVyKSB7XHJcblx0XHRcdHBhbmUuaW5zZXJ0QmVmb3JlKHRoaXMuX2NvbnRhaW5lciwgcGFuZS5maXJzdENoaWxkKTtcclxuXHRcdFx0dGhpcy5fc2V0QXV0b1pJbmRleChwYW5lLCBNYXRoLm1pbik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Z2V0QXR0cmlidXRpb246IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMuYXR0cmlidXRpb247XHJcblx0fSxcclxuXHJcblx0Z2V0Q29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xyXG5cdH0sXHJcblxyXG5cdHNldE9wYWNpdHk6IGZ1bmN0aW9uIChvcGFjaXR5KSB7XHJcblx0XHR0aGlzLm9wdGlvbnMub3BhY2l0eSA9IG9wYWNpdHk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl91cGRhdGVPcGFjaXR5KCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0WkluZGV4OiBmdW5jdGlvbiAoekluZGV4KSB7XHJcblx0XHR0aGlzLm9wdGlvbnMuekluZGV4ID0gekluZGV4O1xyXG5cdFx0dGhpcy5fdXBkYXRlWkluZGV4KCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0VXJsOiBmdW5jdGlvbiAodXJsLCBub1JlZHJhdykge1xyXG5cdFx0dGhpcy5fdXJsID0gdXJsO1xyXG5cclxuXHRcdGlmICghbm9SZWRyYXcpIHtcclxuXHRcdFx0dGhpcy5yZWRyYXcoKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRyZWRyYXc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fcmVzZXQoe2hhcmQ6IHRydWV9KTtcclxuXHRcdFx0dGhpcy5fdXBkYXRlKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlWkluZGV4OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fY29udGFpbmVyICYmIHRoaXMub3B0aW9ucy56SW5kZXggIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR0aGlzLl9jb250YWluZXIuc3R5bGUuekluZGV4ID0gdGhpcy5vcHRpb25zLnpJbmRleDtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfc2V0QXV0b1pJbmRleDogZnVuY3Rpb24gKHBhbmUsIGNvbXBhcmUpIHtcclxuXHJcblx0XHR2YXIgbGF5ZXJzID0gcGFuZS5jaGlsZHJlbixcclxuXHRcdCAgICBlZGdlWkluZGV4ID0gLWNvbXBhcmUoSW5maW5pdHksIC1JbmZpbml0eSksIC8vIC1JbmZpbml0eSBmb3IgbWF4LCBJbmZpbml0eSBmb3IgbWluXHJcblx0XHQgICAgekluZGV4LCBpLCBsZW47XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gbGF5ZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblxyXG5cdFx0XHRpZiAobGF5ZXJzW2ldICE9PSB0aGlzLl9jb250YWluZXIpIHtcclxuXHRcdFx0XHR6SW5kZXggPSBwYXJzZUludChsYXllcnNbaV0uc3R5bGUuekluZGV4LCAxMCk7XHJcblxyXG5cdFx0XHRcdGlmICghaXNOYU4oekluZGV4KSkge1xyXG5cdFx0XHRcdFx0ZWRnZVpJbmRleCA9IGNvbXBhcmUoZWRnZVpJbmRleCwgekluZGV4KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLm9wdGlvbnMuekluZGV4ID0gdGhpcy5fY29udGFpbmVyLnN0eWxlLnpJbmRleCA9XHJcblx0XHQgICAgICAgIChpc0Zpbml0ZShlZGdlWkluZGV4KSA/IGVkZ2VaSW5kZXggOiAwKSArIGNvbXBhcmUoMSwgLTEpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVPcGFjaXR5OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgaSxcclxuXHRcdCAgICB0aWxlcyA9IHRoaXMuX3RpbGVzO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIuaWVsdDkpIHtcclxuXHRcdFx0Zm9yIChpIGluIHRpbGVzKSB7XHJcblx0XHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGlsZXNbaV0sIHRoaXMub3B0aW9ucy5vcGFjaXR5KTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGhpcy5fY29udGFpbmVyLCB0aGlzLm9wdGlvbnMub3BhY2l0eSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2luaXRDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciB0aWxlUGFuZSA9IHRoaXMuX21hcC5fcGFuZXMudGlsZVBhbmU7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9jb250YWluZXIpIHtcclxuXHRcdFx0dGhpcy5fY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbGF5ZXInKTtcclxuXHJcblx0XHRcdHRoaXMuX3VwZGF0ZVpJbmRleCgpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2FuaW1hdGVkKSB7XHJcblx0XHRcdFx0dmFyIGNsYXNzTmFtZSA9ICdsZWFmbGV0LXRpbGUtY29udGFpbmVyJztcclxuXHJcblx0XHRcdFx0dGhpcy5fYmdCdWZmZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUsIHRoaXMuX2NvbnRhaW5lcik7XHJcblx0XHRcdFx0dGhpcy5fdGlsZUNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSwgdGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fdGlsZUNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lcjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGlsZVBhbmUuYXBwZW5kQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMub3BhY2l0eSA8IDEpIHtcclxuXHRcdFx0XHR0aGlzLl91cGRhdGVPcGFjaXR5KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfcmVzZXQ6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5fdGlsZXMpIHtcclxuXHRcdFx0dGhpcy5maXJlKCd0aWxldW5sb2FkJywge3RpbGU6IHRoaXMuX3RpbGVzW2tleV19KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl90aWxlcyA9IHt9O1xyXG5cdFx0dGhpcy5fdGlsZXNUb0xvYWQgPSAwO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMucmV1c2VUaWxlcykge1xyXG5cdFx0XHR0aGlzLl91bnVzZWRUaWxlcyA9IFtdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3RpbGVDb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2FuaW1hdGVkICYmIGUgJiYgZS5oYXJkKSB7XHJcblx0XHRcdHRoaXMuX2NsZWFyQmdCdWZmZXIoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9pbml0Q29udGFpbmVyKCk7XHJcblx0fSxcclxuXHJcblx0X2dldFRpbGVTaXplOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIHpvb20gPSBtYXAuZ2V0Wm9vbSgpICsgdGhpcy5vcHRpb25zLnpvb21PZmZzZXQsXHJcblx0XHQgICAgem9vbU4gPSB0aGlzLm9wdGlvbnMubWF4TmF0aXZlWm9vbSxcclxuXHRcdCAgICB0aWxlU2l6ZSA9IHRoaXMub3B0aW9ucy50aWxlU2l6ZTtcclxuXHJcblx0XHRpZiAoem9vbU4gJiYgem9vbSA+IHpvb21OKSB7XHJcblx0XHRcdHRpbGVTaXplID0gTWF0aC5yb3VuZChtYXAuZ2V0Wm9vbVNjYWxlKHpvb20pIC8gbWFwLmdldFpvb21TY2FsZSh6b29tTikgKiB0aWxlU2l6ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRpbGVTaXplO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAoIXRoaXMuX21hcCkgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIGJvdW5kcyA9IG1hcC5nZXRQaXhlbEJvdW5kcygpLFxyXG5cdFx0ICAgIHpvb20gPSBtYXAuZ2V0Wm9vbSgpLFxyXG5cdFx0ICAgIHRpbGVTaXplID0gdGhpcy5fZ2V0VGlsZVNpemUoKTtcclxuXHJcblx0XHRpZiAoem9vbSA+IHRoaXMub3B0aW9ucy5tYXhab29tIHx8IHpvb20gPCB0aGlzLm9wdGlvbnMubWluWm9vbSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHRpbGVCb3VuZHMgPSBMLmJvdW5kcyhcclxuXHRcdCAgICAgICAgYm91bmRzLm1pbi5kaXZpZGVCeSh0aWxlU2l6ZSkuX2Zsb29yKCksXHJcblx0XHQgICAgICAgIGJvdW5kcy5tYXguZGl2aWRlQnkodGlsZVNpemUpLl9mbG9vcigpKTtcclxuXHJcblx0XHR0aGlzLl9hZGRUaWxlc0Zyb21DZW50ZXJPdXQodGlsZUJvdW5kcyk7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy51bmxvYWRJbnZpc2libGVUaWxlcyB8fCB0aGlzLm9wdGlvbnMucmV1c2VUaWxlcykge1xyXG5cdFx0XHR0aGlzLl9yZW1vdmVPdGhlclRpbGVzKHRpbGVCb3VuZHMpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9hZGRUaWxlc0Zyb21DZW50ZXJPdXQ6IGZ1bmN0aW9uIChib3VuZHMpIHtcclxuXHRcdHZhciBxdWV1ZSA9IFtdLFxyXG5cdFx0ICAgIGNlbnRlciA9IGJvdW5kcy5nZXRDZW50ZXIoKTtcclxuXHJcblx0XHR2YXIgaiwgaSwgcG9pbnQ7XHJcblxyXG5cdFx0Zm9yIChqID0gYm91bmRzLm1pbi55OyBqIDw9IGJvdW5kcy5tYXgueTsgaisrKSB7XHJcblx0XHRcdGZvciAoaSA9IGJvdW5kcy5taW4ueDsgaSA8PSBib3VuZHMubWF4Lng7IGkrKykge1xyXG5cdFx0XHRcdHBvaW50ID0gbmV3IEwuUG9pbnQoaSwgaik7XHJcblxyXG5cdFx0XHRcdGlmICh0aGlzLl90aWxlU2hvdWxkQmVMb2FkZWQocG9pbnQpKSB7XHJcblx0XHRcdFx0XHRxdWV1ZS5wdXNoKHBvaW50KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgdGlsZXNUb0xvYWQgPSBxdWV1ZS5sZW5ndGg7XHJcblxyXG5cdFx0aWYgKHRpbGVzVG9Mb2FkID09PSAwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIGxvYWQgdGlsZXMgaW4gb3JkZXIgb2YgdGhlaXIgZGlzdGFuY2UgdG8gY2VudGVyXHJcblx0XHRxdWV1ZS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcblx0XHRcdHJldHVybiBhLmRpc3RhbmNlVG8oY2VudGVyKSAtIGIuZGlzdGFuY2VUbyhjZW50ZXIpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG5cclxuXHRcdC8vIGlmIGl0cyB0aGUgZmlyc3QgYmF0Y2ggb2YgdGlsZXMgdG8gbG9hZFxyXG5cdFx0aWYgKCF0aGlzLl90aWxlc1RvTG9hZCkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2xvYWRpbmcnKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl90aWxlc1RvTG9hZCArPSB0aWxlc1RvTG9hZDtcclxuXHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgdGlsZXNUb0xvYWQ7IGkrKykge1xyXG5cdFx0XHR0aGlzLl9hZGRUaWxlKHF1ZXVlW2ldLCBmcmFnbWVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fdGlsZUNvbnRhaW5lci5hcHBlbmRDaGlsZChmcmFnbWVudCk7XHJcblx0fSxcclxuXHJcblx0X3RpbGVTaG91bGRCZUxvYWRlZDogZnVuY3Rpb24gKHRpbGVQb2ludCkge1xyXG5cdFx0aWYgKCh0aWxlUG9pbnQueCArICc6JyArIHRpbGVQb2ludC55KSBpbiB0aGlzLl90aWxlcykge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7IC8vIGFscmVhZHkgbG9hZGVkXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG5cdFx0aWYgKCFvcHRpb25zLmNvbnRpbnVvdXNXb3JsZCkge1xyXG5cdFx0XHR2YXIgbGltaXQgPSB0aGlzLl9nZXRXcmFwVGlsZU51bSgpO1xyXG5cclxuXHRcdFx0Ly8gZG9uJ3QgbG9hZCBpZiBleGNlZWRzIHdvcmxkIGJvdW5kc1xyXG5cdFx0XHRpZiAoKG9wdGlvbnMubm9XcmFwICYmICh0aWxlUG9pbnQueCA8IDAgfHwgdGlsZVBvaW50LnggPj0gbGltaXQueCkpIHx8XHJcblx0XHRcdFx0dGlsZVBvaW50LnkgPCAwIHx8IHRpbGVQb2ludC55ID49IGxpbWl0LnkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuYm91bmRzKSB7XHJcblx0XHRcdHZhciB0aWxlU2l6ZSA9IG9wdGlvbnMudGlsZVNpemUsXHJcblx0XHRcdCAgICBud1BvaW50ID0gdGlsZVBvaW50Lm11bHRpcGx5QnkodGlsZVNpemUpLFxyXG5cdFx0XHQgICAgc2VQb2ludCA9IG53UG9pbnQuYWRkKFt0aWxlU2l6ZSwgdGlsZVNpemVdKSxcclxuXHRcdFx0ICAgIG53ID0gdGhpcy5fbWFwLnVucHJvamVjdChud1BvaW50KSxcclxuXHRcdFx0ICAgIHNlID0gdGhpcy5fbWFwLnVucHJvamVjdChzZVBvaW50KTtcclxuXHJcblx0XHRcdC8vIFRPRE8gdGVtcG9yYXJ5IGhhY2ssIHdpbGwgYmUgcmVtb3ZlZCBhZnRlciByZWZhY3RvcmluZyBwcm9qZWN0aW9uc1xyXG5cdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vTGVhZmxldC9MZWFmbGV0L2lzc3Vlcy8xNjE4XHJcblx0XHRcdGlmICghb3B0aW9ucy5jb250aW51b3VzV29ybGQgJiYgIW9wdGlvbnMubm9XcmFwKSB7XHJcblx0XHRcdFx0bncgPSBudy53cmFwKCk7XHJcblx0XHRcdFx0c2UgPSBzZS53cmFwKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICghb3B0aW9ucy5ib3VuZHMuaW50ZXJzZWN0cyhbbncsIHNlXSkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0X3JlbW92ZU90aGVyVGlsZXM6IGZ1bmN0aW9uIChib3VuZHMpIHtcclxuXHRcdHZhciBrQXJyLCB4LCB5LCBrZXk7XHJcblxyXG5cdFx0Zm9yIChrZXkgaW4gdGhpcy5fdGlsZXMpIHtcclxuXHRcdFx0a0FyciA9IGtleS5zcGxpdCgnOicpO1xyXG5cdFx0XHR4ID0gcGFyc2VJbnQoa0FyclswXSwgMTApO1xyXG5cdFx0XHR5ID0gcGFyc2VJbnQoa0FyclsxXSwgMTApO1xyXG5cclxuXHRcdFx0Ly8gcmVtb3ZlIHRpbGUgaWYgaXQncyBvdXQgb2YgYm91bmRzXHJcblx0XHRcdGlmICh4IDwgYm91bmRzLm1pbi54IHx8IHggPiBib3VuZHMubWF4LnggfHwgeSA8IGJvdW5kcy5taW4ueSB8fCB5ID4gYm91bmRzLm1heC55KSB7XHJcblx0XHRcdFx0dGhpcy5fcmVtb3ZlVGlsZShrZXkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3JlbW92ZVRpbGU6IGZ1bmN0aW9uIChrZXkpIHtcclxuXHRcdHZhciB0aWxlID0gdGhpcy5fdGlsZXNba2V5XTtcclxuXHJcblx0XHR0aGlzLmZpcmUoJ3RpbGV1bmxvYWQnLCB7dGlsZTogdGlsZSwgdXJsOiB0aWxlLnNyY30pO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMucmV1c2VUaWxlcykge1xyXG5cdFx0XHRMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGlsZSwgJ2xlYWZsZXQtdGlsZS1sb2FkZWQnKTtcclxuXHRcdFx0dGhpcy5fdW51c2VkVGlsZXMucHVzaCh0aWxlKTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKHRpbGUucGFyZW50Tm9kZSA9PT0gdGhpcy5fdGlsZUNvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl90aWxlQ29udGFpbmVyLnJlbW92ZUNoaWxkKHRpbGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGZvciBodHRwczovL2dpdGh1Yi5jb20vQ2xvdWRNYWRlL0xlYWZsZXQvaXNzdWVzLzEzN1xyXG5cdFx0aWYgKCFMLkJyb3dzZXIuYW5kcm9pZCkge1xyXG5cdFx0XHR0aWxlLm9ubG9hZCA9IG51bGw7XHJcblx0XHRcdHRpbGUuc3JjID0gTC5VdGlsLmVtcHR5SW1hZ2VVcmw7XHJcblx0XHR9XHJcblxyXG5cdFx0ZGVsZXRlIHRoaXMuX3RpbGVzW2tleV07XHJcblx0fSxcclxuXHJcblx0X2FkZFRpbGU6IGZ1bmN0aW9uICh0aWxlUG9pbnQsIGNvbnRhaW5lcikge1xyXG5cdFx0dmFyIHRpbGVQb3MgPSB0aGlzLl9nZXRUaWxlUG9zKHRpbGVQb2ludCk7XHJcblxyXG5cdFx0Ly8gZ2V0IHVudXNlZCB0aWxlIC0gb3IgY3JlYXRlIGEgbmV3IHRpbGVcclxuXHRcdHZhciB0aWxlID0gdGhpcy5fZ2V0VGlsZSgpO1xyXG5cclxuXHRcdC8qXHJcblx0XHRDaHJvbWUgMjAgbGF5b3V0cyBtdWNoIGZhc3RlciB3aXRoIHRvcC9sZWZ0ICh2ZXJpZnkgd2l0aCB0aW1lbGluZSwgZnJhbWVzKVxyXG5cdFx0QW5kcm9pZCA0IGJyb3dzZXIgaGFzIGRpc3BsYXkgaXNzdWVzIHdpdGggdG9wL2xlZnQgYW5kIHJlcXVpcmVzIHRyYW5zZm9ybSBpbnN0ZWFkXHJcblx0XHQob3RoZXIgYnJvd3NlcnMgZG9uJ3QgY3VycmVudGx5IGNhcmUpIC0gc2VlIGRlYnVnL2hhY2tzL2ppdHRlci5odG1sIGZvciBhbiBleGFtcGxlXHJcblx0XHQqL1xyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRpbGUsIHRpbGVQb3MsIEwuQnJvd3Nlci5jaHJvbWUpO1xyXG5cclxuXHRcdHRoaXMuX3RpbGVzW3RpbGVQb2ludC54ICsgJzonICsgdGlsZVBvaW50LnldID0gdGlsZTtcclxuXHJcblx0XHR0aGlzLl9sb2FkVGlsZSh0aWxlLCB0aWxlUG9pbnQpO1xyXG5cclxuXHRcdGlmICh0aWxlLnBhcmVudE5vZGUgIT09IHRoaXMuX3RpbGVDb250YWluZXIpIHtcclxuXHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRpbGUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9nZXRab29tRm9yVXJsOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXHJcblx0XHQgICAgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuem9vbVJldmVyc2UpIHtcclxuXHRcdFx0em9vbSA9IG9wdGlvbnMubWF4Wm9vbSAtIHpvb207XHJcblx0XHR9XHJcblxyXG5cdFx0em9vbSArPSBvcHRpb25zLnpvb21PZmZzZXQ7XHJcblxyXG5cdFx0cmV0dXJuIG9wdGlvbnMubWF4TmF0aXZlWm9vbSA/IE1hdGgubWluKHpvb20sIG9wdGlvbnMubWF4TmF0aXZlWm9vbSkgOiB6b29tO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRUaWxlUG9zOiBmdW5jdGlvbiAodGlsZVBvaW50KSB7XHJcblx0XHR2YXIgb3JpZ2luID0gdGhpcy5fbWFwLmdldFBpeGVsT3JpZ2luKCksXHJcblx0XHQgICAgdGlsZVNpemUgPSB0aGlzLl9nZXRUaWxlU2l6ZSgpO1xyXG5cclxuXHRcdHJldHVybiB0aWxlUG9pbnQubXVsdGlwbHlCeSh0aWxlU2l6ZSkuc3VidHJhY3Qob3JpZ2luKTtcclxuXHR9LFxyXG5cclxuXHQvLyBpbWFnZS1zcGVjaWZpYyBjb2RlIChvdmVycmlkZSB0byBpbXBsZW1lbnQgZS5nLiBDYW52YXMgb3IgU1ZHIHRpbGUgbGF5ZXIpXHJcblxyXG5cdGdldFRpbGVVcmw6IGZ1bmN0aW9uICh0aWxlUG9pbnQpIHtcclxuXHRcdHJldHVybiBMLlV0aWwudGVtcGxhdGUodGhpcy5fdXJsLCBMLmV4dGVuZCh7XHJcblx0XHRcdHM6IHRoaXMuX2dldFN1YmRvbWFpbih0aWxlUG9pbnQpLFxyXG5cdFx0XHR6OiB0aWxlUG9pbnQueixcclxuXHRcdFx0eDogdGlsZVBvaW50LngsXHJcblx0XHRcdHk6IHRpbGVQb2ludC55XHJcblx0XHR9LCB0aGlzLm9wdGlvbnMpKTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0V3JhcFRpbGVOdW06IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjcnMgPSB0aGlzLl9tYXAub3B0aW9ucy5jcnMsXHJcblx0XHQgICAgc2l6ZSA9IGNycy5nZXRTaXplKHRoaXMuX21hcC5nZXRab29tKCkpO1xyXG5cdFx0cmV0dXJuIHNpemUuZGl2aWRlQnkodGhpcy5fZ2V0VGlsZVNpemUoKSkuX2Zsb29yKCk7XHJcblx0fSxcclxuXHJcblx0X2FkanVzdFRpbGVQb2ludDogZnVuY3Rpb24gKHRpbGVQb2ludCkge1xyXG5cclxuXHRcdHZhciBsaW1pdCA9IHRoaXMuX2dldFdyYXBUaWxlTnVtKCk7XHJcblxyXG5cdFx0Ly8gd3JhcCB0aWxlIGNvb3JkaW5hdGVzXHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5jb250aW51b3VzV29ybGQgJiYgIXRoaXMub3B0aW9ucy5ub1dyYXApIHtcclxuXHRcdFx0dGlsZVBvaW50LnggPSAoKHRpbGVQb2ludC54ICUgbGltaXQueCkgKyBsaW1pdC54KSAlIGxpbWl0Lng7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy50bXMpIHtcclxuXHRcdFx0dGlsZVBvaW50LnkgPSBsaW1pdC55IC0gdGlsZVBvaW50LnkgLSAxO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRpbGVQb2ludC56ID0gdGhpcy5fZ2V0Wm9vbUZvclVybCgpO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRTdWJkb21haW46IGZ1bmN0aW9uICh0aWxlUG9pbnQpIHtcclxuXHRcdHZhciBpbmRleCA9IE1hdGguYWJzKHRpbGVQb2ludC54ICsgdGlsZVBvaW50LnkpICUgdGhpcy5vcHRpb25zLnN1YmRvbWFpbnMubGVuZ3RoO1xyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5zdWJkb21haW5zW2luZGV4XTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0VGlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXVzZVRpbGVzICYmIHRoaXMuX3VudXNlZFRpbGVzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0dmFyIHRpbGUgPSB0aGlzLl91bnVzZWRUaWxlcy5wb3AoKTtcclxuXHRcdFx0dGhpcy5fcmVzZXRUaWxlKHRpbGUpO1xyXG5cdFx0XHRyZXR1cm4gdGlsZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9jcmVhdGVUaWxlKCk7XHJcblx0fSxcclxuXHJcblx0Ly8gT3ZlcnJpZGUgaWYgZGF0YSBzdG9yZWQgb24gYSB0aWxlIG5lZWRzIHRvIGJlIGNsZWFuZWQgdXAgYmVmb3JlIHJldXNlXHJcblx0X3Jlc2V0VGlsZTogZnVuY3Rpb24gKC8qdGlsZSovKSB7fSxcclxuXHJcblx0X2NyZWF0ZVRpbGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciB0aWxlID0gTC5Eb21VdGlsLmNyZWF0ZSgnaW1nJywgJ2xlYWZsZXQtdGlsZScpO1xyXG5cdFx0dGlsZS5zdHlsZS53aWR0aCA9IHRpbGUuc3R5bGUuaGVpZ2h0ID0gdGhpcy5fZ2V0VGlsZVNpemUoKSArICdweCc7XHJcblx0XHR0aWxlLmdhbGxlcnlpbWcgPSAnbm8nO1xyXG5cclxuXHRcdHRpbGUub25zZWxlY3RzdGFydCA9IHRpbGUub25tb3VzZW1vdmUgPSBMLlV0aWwuZmFsc2VGbjtcclxuXHJcblx0XHRpZiAoTC5Ccm93c2VyLmllbHQ5ICYmIHRoaXMub3B0aW9ucy5vcGFjaXR5ICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGlsZSwgdGhpcy5vcHRpb25zLm9wYWNpdHkpO1xyXG5cdFx0fVxyXG5cdFx0Ly8gd2l0aG91dCB0aGlzIGhhY2ssIHRpbGVzIGRpc2FwcGVhciBhZnRlciB6b29tIG9uIENocm9tZSBmb3IgQW5kcm9pZFxyXG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL0xlYWZsZXQvTGVhZmxldC9pc3N1ZXMvMjA3OFxyXG5cdFx0aWYgKEwuQnJvd3Nlci5tb2JpbGVXZWJraXQzZCkge1xyXG5cdFx0XHR0aWxlLnN0eWxlLldlYmtpdEJhY2tmYWNlVmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRpbGU7XHJcblx0fSxcclxuXHJcblx0X2xvYWRUaWxlOiBmdW5jdGlvbiAodGlsZSwgdGlsZVBvaW50KSB7XHJcblx0XHR0aWxlLl9sYXllciAgPSB0aGlzO1xyXG5cdFx0dGlsZS5vbmxvYWQgID0gdGhpcy5fdGlsZU9uTG9hZDtcclxuXHRcdHRpbGUub25lcnJvciA9IHRoaXMuX3RpbGVPbkVycm9yO1xyXG5cclxuXHRcdHRoaXMuX2FkanVzdFRpbGVQb2ludCh0aWxlUG9pbnQpO1xyXG5cdFx0dGlsZS5zcmMgICAgID0gdGhpcy5nZXRUaWxlVXJsKHRpbGVQb2ludCk7XHJcblxyXG5cdFx0dGhpcy5maXJlKCd0aWxlbG9hZHN0YXJ0Jywge1xyXG5cdFx0XHR0aWxlOiB0aWxlLFxyXG5cdFx0XHR1cmw6IHRpbGUuc3JjXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHRfdGlsZUxvYWRlZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fdGlsZXNUb0xvYWQtLTtcclxuXHJcblx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpbGVDb250YWluZXIsICdsZWFmbGV0LXpvb20tYW5pbWF0ZWQnKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIXRoaXMuX3RpbGVzVG9Mb2FkKSB7XHJcblx0XHRcdHRoaXMuZmlyZSgnbG9hZCcpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2FuaW1hdGVkKSB7XHJcblx0XHRcdFx0Ly8gY2xlYXIgc2NhbGVkIHRpbGVzIGFmdGVyIGFsbCBuZXcgdGlsZXMgYXJlIGxvYWRlZCAoZm9yIHBlcmZvcm1hbmNlKVxyXG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9jbGVhckJnQnVmZmVyVGltZXIpO1xyXG5cdFx0XHRcdHRoaXMuX2NsZWFyQmdCdWZmZXJUaW1lciA9IHNldFRpbWVvdXQoTC5iaW5kKHRoaXMuX2NsZWFyQmdCdWZmZXIsIHRoaXMpLCA1MDApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3RpbGVPbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBsYXllciA9IHRoaXMuX2xheWVyO1xyXG5cclxuXHRcdC8vT25seSBpZiB3ZSBhcmUgbG9hZGluZyBhbiBhY3R1YWwgaW1hZ2VcclxuXHRcdGlmICh0aGlzLnNyYyAhPT0gTC5VdGlsLmVtcHR5SW1hZ2VVcmwpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMsICdsZWFmbGV0LXRpbGUtbG9hZGVkJyk7XHJcblxyXG5cdFx0XHRsYXllci5maXJlKCd0aWxlbG9hZCcsIHtcclxuXHRcdFx0XHR0aWxlOiB0aGlzLFxyXG5cdFx0XHRcdHVybDogdGhpcy5zcmNcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0bGF5ZXIuX3RpbGVMb2FkZWQoKTtcclxuXHR9LFxyXG5cclxuXHRfdGlsZU9uRXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBsYXllciA9IHRoaXMuX2xheWVyO1xyXG5cclxuXHRcdGxheWVyLmZpcmUoJ3RpbGVlcnJvcicsIHtcclxuXHRcdFx0dGlsZTogdGhpcyxcclxuXHRcdFx0dXJsOiB0aGlzLnNyY1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dmFyIG5ld1VybCA9IGxheWVyLm9wdGlvbnMuZXJyb3JUaWxlVXJsO1xyXG5cdFx0aWYgKG5ld1VybCkge1xyXG5cdFx0XHR0aGlzLnNyYyA9IG5ld1VybDtcclxuXHRcdH1cclxuXHJcblx0XHRsYXllci5fdGlsZUxvYWRlZCgpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLnRpbGVMYXllciA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuVGlsZUxheWVyKHVybCwgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlRpbGVMYXllci5XTVMgaXMgdXNlZCBmb3IgcHV0dGluZyBXTVMgdGlsZSBsYXllcnMgb24gdGhlIG1hcC5cclxuICovXHJcblxyXG5MLlRpbGVMYXllci5XTVMgPSBMLlRpbGVMYXllci5leHRlbmQoe1xyXG5cclxuXHRkZWZhdWx0V21zUGFyYW1zOiB7XHJcblx0XHRzZXJ2aWNlOiAnV01TJyxcclxuXHRcdHJlcXVlc3Q6ICdHZXRNYXAnLFxyXG5cdFx0dmVyc2lvbjogJzEuMS4xJyxcclxuXHRcdGxheWVyczogJycsXHJcblx0XHRzdHlsZXM6ICcnLFxyXG5cdFx0Zm9ybWF0OiAnaW1hZ2UvanBlZycsXHJcblx0XHR0cmFuc3BhcmVudDogZmFsc2VcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7IC8vIChTdHJpbmcsIE9iamVjdClcclxuXHJcblx0XHR0aGlzLl91cmwgPSB1cmw7XHJcblxyXG5cdFx0dmFyIHdtc1BhcmFtcyA9IEwuZXh0ZW5kKHt9LCB0aGlzLmRlZmF1bHRXbXNQYXJhbXMpLFxyXG5cdFx0ICAgIHRpbGVTaXplID0gb3B0aW9ucy50aWxlU2l6ZSB8fCB0aGlzLm9wdGlvbnMudGlsZVNpemU7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuZGV0ZWN0UmV0aW5hICYmIEwuQnJvd3Nlci5yZXRpbmEpIHtcclxuXHRcdFx0d21zUGFyYW1zLndpZHRoID0gd21zUGFyYW1zLmhlaWdodCA9IHRpbGVTaXplICogMjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHdtc1BhcmFtcy53aWR0aCA9IHdtc1BhcmFtcy5oZWlnaHQgPSB0aWxlU2l6ZTtcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcclxuXHRcdFx0Ly8gYWxsIGtleXMgdGhhdCBhcmUgbm90IFRpbGVMYXllciBvcHRpb25zIGdvIHRvIFdNUyBwYXJhbXNcclxuXHRcdFx0aWYgKCF0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkgJiYgaSAhPT0gJ2NycycpIHtcclxuXHRcdFx0XHR3bXNQYXJhbXNbaV0gPSBvcHRpb25zW2ldO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy53bXNQYXJhbXMgPSB3bXNQYXJhbXM7XHJcblxyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblxyXG5cdFx0dGhpcy5fY3JzID0gdGhpcy5vcHRpb25zLmNycyB8fCBtYXAub3B0aW9ucy5jcnM7XHJcblxyXG5cdFx0dGhpcy5fd21zVmVyc2lvbiA9IHBhcnNlRmxvYXQodGhpcy53bXNQYXJhbXMudmVyc2lvbik7XHJcblxyXG5cdFx0dmFyIHByb2plY3Rpb25LZXkgPSB0aGlzLl93bXNWZXJzaW9uID49IDEuMyA/ICdjcnMnIDogJ3Nycyc7XHJcblx0XHR0aGlzLndtc1BhcmFtc1twcm9qZWN0aW9uS2V5XSA9IHRoaXMuX2Nycy5jb2RlO1xyXG5cclxuXHRcdEwuVGlsZUxheWVyLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XHJcblx0fSxcclxuXHJcblx0Z2V0VGlsZVVybDogZnVuY3Rpb24gKHRpbGVQb2ludCkgeyAvLyAoUG9pbnQsIE51bWJlcikgLT4gU3RyaW5nXHJcblxyXG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcCxcclxuXHRcdCAgICB0aWxlU2l6ZSA9IHRoaXMub3B0aW9ucy50aWxlU2l6ZSxcclxuXHJcblx0XHQgICAgbndQb2ludCA9IHRpbGVQb2ludC5tdWx0aXBseUJ5KHRpbGVTaXplKSxcclxuXHRcdCAgICBzZVBvaW50ID0gbndQb2ludC5hZGQoW3RpbGVTaXplLCB0aWxlU2l6ZV0pLFxyXG5cclxuXHRcdCAgICBudyA9IHRoaXMuX2Nycy5wcm9qZWN0KG1hcC51bnByb2plY3QobndQb2ludCwgdGlsZVBvaW50LnopKSxcclxuXHRcdCAgICBzZSA9IHRoaXMuX2Nycy5wcm9qZWN0KG1hcC51bnByb2plY3Qoc2VQb2ludCwgdGlsZVBvaW50LnopKSxcclxuXHRcdCAgICBiYm94ID0gdGhpcy5fd21zVmVyc2lvbiA+PSAxLjMgJiYgdGhpcy5fY3JzID09PSBMLkNSUy5FUFNHNDMyNiA/XHJcblx0XHQgICAgICAgIFtzZS55LCBudy54LCBudy55LCBzZS54XS5qb2luKCcsJykgOlxyXG5cdFx0ICAgICAgICBbbncueCwgc2UueSwgc2UueCwgbncueV0uam9pbignLCcpLFxyXG5cclxuXHRcdCAgICB1cmwgPSBMLlV0aWwudGVtcGxhdGUodGhpcy5fdXJsLCB7czogdGhpcy5fZ2V0U3ViZG9tYWluKHRpbGVQb2ludCl9KTtcclxuXHJcblx0XHRyZXR1cm4gdXJsICsgTC5VdGlsLmdldFBhcmFtU3RyaW5nKHRoaXMud21zUGFyYW1zLCB1cmwsIHRydWUpICsgJyZCQk9YPScgKyBiYm94O1xyXG5cdH0sXHJcblxyXG5cdHNldFBhcmFtczogZnVuY3Rpb24gKHBhcmFtcywgbm9SZWRyYXcpIHtcclxuXHJcblx0XHRMLmV4dGVuZCh0aGlzLndtc1BhcmFtcywgcGFyYW1zKTtcclxuXHJcblx0XHRpZiAoIW5vUmVkcmF3KSB7XHJcblx0XHRcdHRoaXMucmVkcmF3KCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG59KTtcclxuXHJcbkwudGlsZUxheWVyLndtcyA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuVGlsZUxheWVyLldNUyh1cmwsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5UaWxlTGF5ZXIuQ2FudmFzIGlzIGEgY2xhc3MgdGhhdCB5b3UgY2FuIHVzZSBhcyBhIGJhc2UgZm9yIGNyZWF0aW5nXHJcbiAqIGR5bmFtaWNhbGx5IGRyYXduIENhbnZhcy1iYXNlZCB0aWxlIGxheWVycy5cclxuICovXHJcblxyXG5MLlRpbGVMYXllci5DYW52YXMgPSBMLlRpbGVMYXllci5leHRlbmQoe1xyXG5cdG9wdGlvbnM6IHtcclxuXHRcdGFzeW5jOiBmYWxzZVxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0cmVkcmF3OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMuX3Jlc2V0KHtoYXJkOiB0cnVlfSk7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gdGhpcy5fdGlsZXMpIHtcclxuXHRcdFx0dGhpcy5fcmVkcmF3VGlsZSh0aGlzLl90aWxlc1tpXSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfcmVkcmF3VGlsZTogZnVuY3Rpb24gKHRpbGUpIHtcclxuXHRcdHRoaXMuZHJhd1RpbGUodGlsZSwgdGlsZS5fdGlsZVBvaW50LCB0aGlzLl9tYXAuX3pvb20pO1xyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVUaWxlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgdGlsZSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2NhbnZhcycsICdsZWFmbGV0LXRpbGUnKTtcclxuXHRcdHRpbGUud2lkdGggPSB0aWxlLmhlaWdodCA9IHRoaXMub3B0aW9ucy50aWxlU2l6ZTtcclxuXHRcdHRpbGUub25zZWxlY3RzdGFydCA9IHRpbGUub25tb3VzZW1vdmUgPSBMLlV0aWwuZmFsc2VGbjtcclxuXHRcdHJldHVybiB0aWxlO1xyXG5cdH0sXHJcblxyXG5cdF9sb2FkVGlsZTogZnVuY3Rpb24gKHRpbGUsIHRpbGVQb2ludCkge1xyXG5cdFx0dGlsZS5fbGF5ZXIgPSB0aGlzO1xyXG5cdFx0dGlsZS5fdGlsZVBvaW50ID0gdGlsZVBvaW50O1xyXG5cclxuXHRcdHRoaXMuX3JlZHJhd1RpbGUodGlsZSk7XHJcblxyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuYXN5bmMpIHtcclxuXHRcdFx0dGhpcy50aWxlRHJhd24odGlsZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0ZHJhd1RpbGU6IGZ1bmN0aW9uICgvKnRpbGUsIHRpbGVQb2ludCovKSB7XHJcblx0XHQvLyBvdmVycmlkZSB3aXRoIHJlbmRlcmluZyBjb2RlXHJcblx0fSxcclxuXHJcblx0dGlsZURyYXduOiBmdW5jdGlvbiAodGlsZSkge1xyXG5cdFx0dGhpcy5fdGlsZU9uTG9hZC5jYWxsKHRpbGUpO1xyXG5cdH1cclxufSk7XHJcblxyXG5cclxuTC50aWxlTGF5ZXIuY2FudmFzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuVGlsZUxheWVyLkNhbnZhcyhvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuSW1hZ2VPdmVybGF5IGlzIHVzZWQgdG8gb3ZlcmxheSBpbWFnZXMgb3ZlciB0aGUgbWFwICh0byBzcGVjaWZpYyBnZW9ncmFwaGljYWwgYm91bmRzKS5cclxuICovXHJcblxyXG5MLkltYWdlT3ZlcmxheSA9IEwuQ2xhc3MuZXh0ZW5kKHtcclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdG9wYWNpdHk6IDFcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAodXJsLCBib3VuZHMsIG9wdGlvbnMpIHsgLy8gKFN0cmluZywgTGF0TG5nQm91bmRzLCBPYmplY3QpXHJcblx0XHR0aGlzLl91cmwgPSB1cmw7XHJcblx0XHR0aGlzLl9ib3VuZHMgPSBMLmxhdExuZ0JvdW5kcyhib3VuZHMpO1xyXG5cclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5fbWFwID0gbWFwO1xyXG5cclxuXHRcdGlmICghdGhpcy5faW1hZ2UpIHtcclxuXHRcdFx0dGhpcy5faW5pdEltYWdlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0bWFwLl9wYW5lcy5vdmVybGF5UGFuZS5hcHBlbmRDaGlsZCh0aGlzLl9pbWFnZSk7XHJcblxyXG5cdFx0bWFwLm9uKCd2aWV3cmVzZXQnLCB0aGlzLl9yZXNldCwgdGhpcyk7XHJcblxyXG5cdFx0aWYgKG1hcC5vcHRpb25zLnpvb21BbmltYXRpb24gJiYgTC5Ccm93c2VyLmFueTNkKSB7XHJcblx0XHRcdG1hcC5vbignem9vbWFuaW0nLCB0aGlzLl9hbmltYXRlWm9vbSwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmVzZXQoKTtcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmdldFBhbmVzKCkub3ZlcmxheVBhbmUucmVtb3ZlQ2hpbGQodGhpcy5faW1hZ2UpO1xyXG5cclxuXHRcdG1hcC5vZmYoJ3ZpZXdyZXNldCcsIHRoaXMuX3Jlc2V0LCB0aGlzKTtcclxuXHJcblx0XHRpZiAobWFwLm9wdGlvbnMuem9vbUFuaW1hdGlvbikge1xyXG5cdFx0XHRtYXAub2ZmKCd6b29tYW5pbScsIHRoaXMuX2FuaW1hdGVab29tLCB0aGlzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0T3BhY2l0eTogZnVuY3Rpb24gKG9wYWNpdHkpIHtcclxuXHRcdHRoaXMub3B0aW9ucy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuXHRcdHRoaXMuX3VwZGF0ZU9wYWNpdHkoKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdC8vIFRPRE8gcmVtb3ZlIGJyaW5nVG9Gcm9udC9icmluZ1RvQmFjayBkdXBsaWNhdGlvbiBmcm9tIFRpbGVMYXllci9QYXRoXHJcblx0YnJpbmdUb0Zyb250OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5faW1hZ2UpIHtcclxuXHRcdFx0dGhpcy5fbWFwLl9wYW5lcy5vdmVybGF5UGFuZS5hcHBlbmRDaGlsZCh0aGlzLl9pbWFnZSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRicmluZ1RvQmFjazogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHBhbmUgPSB0aGlzLl9tYXAuX3BhbmVzLm92ZXJsYXlQYW5lO1xyXG5cdFx0aWYgKHRoaXMuX2ltYWdlKSB7XHJcblx0XHRcdHBhbmUuaW5zZXJ0QmVmb3JlKHRoaXMuX2ltYWdlLCBwYW5lLmZpcnN0Q2hpbGQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0VXJsOiBmdW5jdGlvbiAodXJsKSB7XHJcblx0XHR0aGlzLl91cmwgPSB1cmw7XHJcblx0XHR0aGlzLl9pbWFnZS5zcmMgPSB0aGlzLl91cmw7XHJcblx0fSxcclxuXHJcblx0Z2V0QXR0cmlidXRpb246IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMuYXR0cmlidXRpb247XHJcblx0fSxcclxuXHJcblx0X2luaXRJbWFnZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5faW1hZ2UgPSBMLkRvbVV0aWwuY3JlYXRlKCdpbWcnLCAnbGVhZmxldC1pbWFnZS1sYXllcicpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9tYXAub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIEwuQnJvd3Nlci5hbnkzZCkge1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5faW1hZ2UsICdsZWFmbGV0LXpvb20tYW5pbWF0ZWQnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9pbWFnZSwgJ2xlYWZsZXQtem9vbS1oaWRlJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlT3BhY2l0eSgpO1xyXG5cclxuXHRcdC8vVE9ETyBjcmVhdGVJbWFnZSB1dGlsIG1ldGhvZCB0byByZW1vdmUgZHVwbGljYXRpb25cclxuXHRcdEwuZXh0ZW5kKHRoaXMuX2ltYWdlLCB7XHJcblx0XHRcdGdhbGxlcnlpbWc6ICdubycsXHJcblx0XHRcdG9uc2VsZWN0c3RhcnQ6IEwuVXRpbC5mYWxzZUZuLFxyXG5cdFx0XHRvbm1vdXNlbW92ZTogTC5VdGlsLmZhbHNlRm4sXHJcblx0XHRcdG9ubG9hZDogTC5iaW5kKHRoaXMuX29uSW1hZ2VMb2FkLCB0aGlzKSxcclxuXHRcdFx0c3JjOiB0aGlzLl91cmxcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdF9hbmltYXRlWm9vbTogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXHJcblx0XHQgICAgaW1hZ2UgPSB0aGlzLl9pbWFnZSxcclxuXHRcdCAgICBzY2FsZSA9IG1hcC5nZXRab29tU2NhbGUoZS56b29tKSxcclxuXHRcdCAgICBudyA9IHRoaXMuX2JvdW5kcy5nZXROb3J0aFdlc3QoKSxcclxuXHRcdCAgICBzZSA9IHRoaXMuX2JvdW5kcy5nZXRTb3V0aEVhc3QoKSxcclxuXHJcblx0XHQgICAgdG9wTGVmdCA9IG1hcC5fbGF0TG5nVG9OZXdMYXllclBvaW50KG53LCBlLnpvb20sIGUuY2VudGVyKSxcclxuXHRcdCAgICBzaXplID0gbWFwLl9sYXRMbmdUb05ld0xheWVyUG9pbnQoc2UsIGUuem9vbSwgZS5jZW50ZXIpLl9zdWJ0cmFjdCh0b3BMZWZ0KSxcclxuXHRcdCAgICBvcmlnaW4gPSB0b3BMZWZ0Ll9hZGQoc2l6ZS5fbXVsdGlwbHlCeSgoMSAvIDIpICogKDEgLSAxIC8gc2NhbGUpKSk7XHJcblxyXG5cdFx0aW1hZ2Uuc3R5bGVbTC5Eb21VdGlsLlRSQU5TRk9STV0gPVxyXG5cdFx0ICAgICAgICBMLkRvbVV0aWwuZ2V0VHJhbnNsYXRlU3RyaW5nKG9yaWdpbikgKyAnIHNjYWxlKCcgKyBzY2FsZSArICcpICc7XHJcblx0fSxcclxuXHJcblx0X3Jlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgaW1hZ2UgICA9IHRoaXMuX2ltYWdlLFxyXG5cdFx0ICAgIHRvcExlZnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KHRoaXMuX2JvdW5kcy5nZXROb3J0aFdlc3QoKSksXHJcblx0XHQgICAgc2l6ZSA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQodGhpcy5fYm91bmRzLmdldFNvdXRoRWFzdCgpKS5fc3VidHJhY3QodG9wTGVmdCk7XHJcblxyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKGltYWdlLCB0b3BMZWZ0KTtcclxuXHJcblx0XHRpbWFnZS5zdHlsZS53aWR0aCAgPSBzaXplLnggKyAncHgnO1xyXG5cdFx0aW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gc2l6ZS55ICsgJ3B4JztcclxuXHR9LFxyXG5cclxuXHRfb25JbWFnZUxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuZmlyZSgnbG9hZCcpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVPcGFjaXR5OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aGlzLl9pbWFnZSwgdGhpcy5vcHRpb25zLm9wYWNpdHkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmltYWdlT3ZlcmxheSA9IGZ1bmN0aW9uICh1cmwsIGJvdW5kcywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5JbWFnZU92ZXJsYXkodXJsLCBib3VuZHMsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5JY29uIGlzIGFuIGltYWdlLWJhc2VkIGljb24gY2xhc3MgdGhhdCB5b3UgY2FuIHVzZSB3aXRoIEwuTWFya2VyIGZvciBjdXN0b20gbWFya2Vycy5cclxuICovXHJcblxyXG5MLkljb24gPSBMLkNsYXNzLmV4dGVuZCh7XHJcblx0b3B0aW9uczoge1xyXG5cdFx0LypcclxuXHRcdGljb25Vcmw6IChTdHJpbmcpIChyZXF1aXJlZClcclxuXHRcdGljb25SZXRpbmFVcmw6IChTdHJpbmcpIChvcHRpb25hbCwgdXNlZCBmb3IgcmV0aW5hIGRldmljZXMgaWYgZGV0ZWN0ZWQpXHJcblx0XHRpY29uU2l6ZTogKFBvaW50KSAoY2FuIGJlIHNldCB0aHJvdWdoIENTUylcclxuXHRcdGljb25BbmNob3I6IChQb2ludCkgKGNlbnRlcmVkIGJ5IGRlZmF1bHQsIGNhbiBiZSBzZXQgaW4gQ1NTIHdpdGggbmVnYXRpdmUgbWFyZ2lucylcclxuXHRcdHBvcHVwQW5jaG9yOiAoUG9pbnQpIChpZiBub3Qgc3BlY2lmaWVkLCBwb3B1cCBvcGVucyBpbiB0aGUgYW5jaG9yIHBvaW50KVxyXG5cdFx0c2hhZG93VXJsOiAoU3RyaW5nKSAobm8gc2hhZG93IGJ5IGRlZmF1bHQpXHJcblx0XHRzaGFkb3dSZXRpbmFVcmw6IChTdHJpbmcpIChvcHRpb25hbCwgdXNlZCBmb3IgcmV0aW5hIGRldmljZXMgaWYgZGV0ZWN0ZWQpXHJcblx0XHRzaGFkb3dTaXplOiAoUG9pbnQpXHJcblx0XHRzaGFkb3dBbmNob3I6IChQb2ludClcclxuXHRcdCovXHJcblx0XHRjbGFzc05hbWU6ICcnXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHR9LFxyXG5cclxuXHRjcmVhdGVJY29uOiBmdW5jdGlvbiAob2xkSWNvbikge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2NyZWF0ZUljb24oJ2ljb24nLCBvbGRJY29uKTtcclxuXHR9LFxyXG5cclxuXHRjcmVhdGVTaGFkb3c6IGZ1bmN0aW9uIChvbGRJY29uKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlSWNvbignc2hhZG93Jywgb2xkSWNvbik7XHJcblx0fSxcclxuXHJcblx0X2NyZWF0ZUljb246IGZ1bmN0aW9uIChuYW1lLCBvbGRJY29uKSB7XHJcblx0XHR2YXIgc3JjID0gdGhpcy5fZ2V0SWNvblVybChuYW1lKTtcclxuXHJcblx0XHRpZiAoIXNyYykge1xyXG5cdFx0XHRpZiAobmFtZSA9PT0gJ2ljb24nKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdpY29uVXJsIG5vdCBzZXQgaW4gSWNvbiBvcHRpb25zIChzZWUgdGhlIGRvY3MpLicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBpbWc7XHJcblx0XHRpZiAoIW9sZEljb24gfHwgb2xkSWNvbi50YWdOYW1lICE9PSAnSU1HJykge1xyXG5cdFx0XHRpbWcgPSB0aGlzLl9jcmVhdGVJbWcoc3JjKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGltZyA9IHRoaXMuX2NyZWF0ZUltZyhzcmMsIG9sZEljb24pO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5fc2V0SWNvblN0eWxlcyhpbWcsIG5hbWUpO1xyXG5cclxuXHRcdHJldHVybiBpbWc7XHJcblx0fSxcclxuXHJcblx0X3NldEljb25TdHlsZXM6IGZ1bmN0aW9uIChpbWcsIG5hbWUpIHtcclxuXHRcdHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxyXG5cdFx0ICAgIHNpemUgPSBMLnBvaW50KG9wdGlvbnNbbmFtZSArICdTaXplJ10pLFxyXG5cdFx0ICAgIGFuY2hvcjtcclxuXHJcblx0XHRpZiAobmFtZSA9PT0gJ3NoYWRvdycpIHtcclxuXHRcdFx0YW5jaG9yID0gTC5wb2ludChvcHRpb25zLnNoYWRvd0FuY2hvciB8fCBvcHRpb25zLmljb25BbmNob3IpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YW5jaG9yID0gTC5wb2ludChvcHRpb25zLmljb25BbmNob3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghYW5jaG9yICYmIHNpemUpIHtcclxuXHRcdFx0YW5jaG9yID0gc2l6ZS5kaXZpZGVCeSgyLCB0cnVlKTtcclxuXHRcdH1cclxuXHJcblx0XHRpbWcuY2xhc3NOYW1lID0gJ2xlYWZsZXQtbWFya2VyLScgKyBuYW1lICsgJyAnICsgb3B0aW9ucy5jbGFzc05hbWU7XHJcblxyXG5cdFx0aWYgKGFuY2hvcikge1xyXG5cdFx0XHRpbWcuc3R5bGUubWFyZ2luTGVmdCA9ICgtYW5jaG9yLngpICsgJ3B4JztcclxuXHRcdFx0aW1nLnN0eWxlLm1hcmdpblRvcCAgPSAoLWFuY2hvci55KSArICdweCc7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHNpemUpIHtcclxuXHRcdFx0aW1nLnN0eWxlLndpZHRoICA9IHNpemUueCArICdweCc7XHJcblx0XHRcdGltZy5zdHlsZS5oZWlnaHQgPSBzaXplLnkgKyAncHgnO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVJbWc6IGZ1bmN0aW9uIChzcmMsIGVsKSB7XHJcblx0XHRlbCA9IGVsIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdFx0ZWwuc3JjID0gc3JjO1xyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRJY29uVXJsOiBmdW5jdGlvbiAobmFtZSkge1xyXG5cdFx0aWYgKEwuQnJvd3Nlci5yZXRpbmEgJiYgdGhpcy5vcHRpb25zW25hbWUgKyAnUmV0aW5hVXJsJ10pIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uc1tuYW1lICsgJ1JldGluYVVybCddO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMub3B0aW9uc1tuYW1lICsgJ1VybCddO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmljb24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5JY29uKG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcbiAqIEwuSWNvbi5EZWZhdWx0IGlzIHRoZSBibHVlIG1hcmtlciBpY29uIHVzZWQgYnkgZGVmYXVsdCBpbiBMZWFmbGV0LlxuICovXG5cbkwuSWNvbi5EZWZhdWx0ID0gTC5JY29uLmV4dGVuZCh7XG5cblx0b3B0aW9uczoge1xuXHRcdGljb25TaXplOiBbMjUsIDQxXSxcblx0XHRpY29uQW5jaG9yOiBbMTIsIDQxXSxcblx0XHRwb3B1cEFuY2hvcjogWzEsIC0zNF0sXG5cblx0XHRzaGFkb3dTaXplOiBbNDEsIDQxXVxuXHR9LFxuXG5cdF9nZXRJY29uVXJsOiBmdW5jdGlvbiAobmFtZSkge1xuXHRcdHZhciBrZXkgPSBuYW1lICsgJ1VybCc7XG5cblx0XHRpZiAodGhpcy5vcHRpb25zW2tleV0pIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnNba2V5XTtcblx0XHR9XG5cblx0XHRpZiAoTC5Ccm93c2VyLnJldGluYSAmJiBuYW1lID09PSAnaWNvbicpIHtcblx0XHRcdG5hbWUgKz0gJy0yeCc7XG5cdFx0fVxuXG5cdFx0dmFyIHBhdGggPSBMLkljb24uRGVmYXVsdC5pbWFnZVBhdGg7XG5cblx0XHRpZiAoIXBhdGgpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignQ291bGRuXFwndCBhdXRvZGV0ZWN0IEwuSWNvbi5EZWZhdWx0LmltYWdlUGF0aCwgc2V0IGl0IG1hbnVhbGx5LicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoICsgJy9tYXJrZXItJyArIG5hbWUgKyAnLnBuZyc7XG5cdH1cbn0pO1xuXG5MLkljb24uRGVmYXVsdC5pbWFnZVBhdGggPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSxcblx0ICAgIGxlYWZsZXRSZSA9IC9bXFwvXl1sZWFmbGV0W1xcLVxcLl9dPyhbXFx3XFwtXFwuX10qKVxcLmpzXFw/Py87XG5cblx0dmFyIGksIGxlbiwgc3JjLCBtYXRjaGVzLCBwYXRoO1xuXG5cdGZvciAoaSA9IDAsIGxlbiA9IHNjcmlwdHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRzcmMgPSBzY3JpcHRzW2ldLnNyYztcblx0XHRtYXRjaGVzID0gc3JjLm1hdGNoKGxlYWZsZXRSZSk7XG5cblx0XHRpZiAobWF0Y2hlcykge1xuXHRcdFx0cGF0aCA9IHNyYy5zcGxpdChsZWFmbGV0UmUpWzBdO1xuXHRcdFx0cmV0dXJuIChwYXRoID8gcGF0aCArICcvJyA6ICcnKSArICdpbWFnZXMnO1xuXHRcdH1cblx0fVxufSgpKTtcblxuXG4vKlxyXG4gKiBMLk1hcmtlciBpcyB1c2VkIHRvIGRpc3BsYXkgY2xpY2thYmxlL2RyYWdnYWJsZSBpY29ucyBvbiB0aGUgbWFwLlxyXG4gKi9cclxuXHJcbkwuTWFya2VyID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdG9wdGlvbnM6IHtcclxuXHRcdGljb246IG5ldyBMLkljb24uRGVmYXVsdCgpLFxyXG5cdFx0dGl0bGU6ICcnLFxyXG5cdFx0YWx0OiAnJyxcclxuXHRcdGNsaWNrYWJsZTogdHJ1ZSxcclxuXHRcdGRyYWdnYWJsZTogZmFsc2UsXHJcblx0XHRrZXlib2FyZDogdHJ1ZSxcclxuXHRcdHpJbmRleE9mZnNldDogMCxcclxuXHRcdG9wYWNpdHk6IDEsXHJcblx0XHRyaXNlT25Ib3ZlcjogZmFsc2UsXHJcblx0XHRyaXNlT2Zmc2V0OiAyNTBcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAobGF0bG5nLCBvcHRpb25zKSB7XHJcblx0XHRMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblx0XHR0aGlzLl9sYXRsbmcgPSBMLmxhdExuZyhsYXRsbmcpO1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9tYXAgPSBtYXA7XHJcblxyXG5cdFx0bWFwLm9uKCd2aWV3cmVzZXQnLCB0aGlzLnVwZGF0ZSwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5faW5pdEljb24oKTtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0XHR0aGlzLmZpcmUoJ2FkZCcpO1xyXG5cclxuXHRcdGlmIChtYXAub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIG1hcC5vcHRpb25zLm1hcmtlclpvb21BbmltYXRpb24pIHtcclxuXHRcdFx0bWFwLm9uKCd6b29tYW5pbScsIHRoaXMuX2FuaW1hdGVab29tLCB0aGlzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdGlmICh0aGlzLmRyYWdnaW5nKSB7XHJcblx0XHRcdHRoaXMuZHJhZ2dpbmcuZGlzYWJsZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3JlbW92ZUljb24oKTtcclxuXHRcdHRoaXMuX3JlbW92ZVNoYWRvdygpO1xyXG5cclxuXHRcdHRoaXMuZmlyZSgncmVtb3ZlJyk7XHJcblxyXG5cdFx0bWFwLm9mZih7XHJcblx0XHRcdCd2aWV3cmVzZXQnOiB0aGlzLnVwZGF0ZSxcclxuXHRcdFx0J3pvb21hbmltJzogdGhpcy5fYW5pbWF0ZVpvb21cclxuXHRcdH0sIHRoaXMpO1xyXG5cclxuXHRcdHRoaXMuX21hcCA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0Z2V0TGF0TG5nOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbGF0bG5nO1xyXG5cdH0sXHJcblxyXG5cdHNldExhdExuZzogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0dGhpcy5fbGF0bG5nID0gTC5sYXRMbmcobGF0bG5nKTtcclxuXHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLmZpcmUoJ21vdmUnLCB7IGxhdGxuZzogdGhpcy5fbGF0bG5nIH0pO1xyXG5cdH0sXHJcblxyXG5cdHNldFpJbmRleE9mZnNldDogZnVuY3Rpb24gKG9mZnNldCkge1xyXG5cdFx0dGhpcy5vcHRpb25zLnpJbmRleE9mZnNldCA9IG9mZnNldDtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0SWNvbjogZnVuY3Rpb24gKGljb24pIHtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMuaWNvbiA9IGljb247XHJcblxyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl9pbml0SWNvbigpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHR0aGlzLmJpbmRQb3B1cCh0aGlzLl9wb3B1cCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5faWNvbikge1xyXG5cdFx0XHR2YXIgcG9zID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcpLnJvdW5kKCk7XHJcblx0XHRcdHRoaXMuX3NldFBvcyhwb3MpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0SWNvbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXHJcblx0XHQgICAgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIGFuaW1hdGlvbiA9IChtYXAub3B0aW9ucy56b29tQW5pbWF0aW9uICYmIG1hcC5vcHRpb25zLm1hcmtlclpvb21BbmltYXRpb24pLFxyXG5cdFx0ICAgIGNsYXNzVG9BZGQgPSBhbmltYXRpb24gPyAnbGVhZmxldC16b29tLWFuaW1hdGVkJyA6ICdsZWFmbGV0LXpvb20taGlkZSc7XHJcblxyXG5cdFx0dmFyIGljb24gPSBvcHRpb25zLmljb24uY3JlYXRlSWNvbih0aGlzLl9pY29uKSxcclxuXHRcdFx0YWRkSWNvbiA9IGZhbHNlO1xyXG5cclxuXHRcdC8vIGlmIHdlJ3JlIG5vdCByZXVzaW5nIHRoZSBpY29uLCByZW1vdmUgdGhlIG9sZCBvbmUgYW5kIGluaXQgbmV3IG9uZVxyXG5cdFx0aWYgKGljb24gIT09IHRoaXMuX2ljb24pIHtcclxuXHRcdFx0aWYgKHRoaXMuX2ljb24pIHtcclxuXHRcdFx0XHR0aGlzLl9yZW1vdmVJY29uKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0YWRkSWNvbiA9IHRydWU7XHJcblxyXG5cdFx0XHRpZiAob3B0aW9ucy50aXRsZSkge1xyXG5cdFx0XHRcdGljb24udGl0bGUgPSBvcHRpb25zLnRpdGxlO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAob3B0aW9ucy5hbHQpIHtcclxuXHRcdFx0XHRpY29uLmFsdCA9IG9wdGlvbnMuYWx0O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0TC5Eb21VdGlsLmFkZENsYXNzKGljb24sIGNsYXNzVG9BZGQpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLmtleWJvYXJkKSB7XHJcblx0XHRcdGljb24udGFiSW5kZXggPSAnMCc7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faWNvbiA9IGljb247XHJcblxyXG5cdFx0dGhpcy5faW5pdEludGVyYWN0aW9uKCk7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMucmlzZU9uSG92ZXIpIHtcclxuXHRcdFx0TC5Eb21FdmVudFxyXG5cdFx0XHRcdC5vbihpY29uLCAnbW91c2VvdmVyJywgdGhpcy5fYnJpbmdUb0Zyb250LCB0aGlzKVxyXG5cdFx0XHRcdC5vbihpY29uLCAnbW91c2VvdXQnLCB0aGlzLl9yZXNldFpJbmRleCwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG5ld1NoYWRvdyA9IG9wdGlvbnMuaWNvbi5jcmVhdGVTaGFkb3codGhpcy5fc2hhZG93KSxcclxuXHRcdFx0YWRkU2hhZG93ID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKG5ld1NoYWRvdyAhPT0gdGhpcy5fc2hhZG93KSB7XHJcblx0XHRcdHRoaXMuX3JlbW92ZVNoYWRvdygpO1xyXG5cdFx0XHRhZGRTaGFkb3cgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChuZXdTaGFkb3cpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKG5ld1NoYWRvdywgY2xhc3NUb0FkZCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLl9zaGFkb3cgPSBuZXdTaGFkb3c7XHJcblxyXG5cclxuXHRcdGlmIChvcHRpb25zLm9wYWNpdHkgPCAxKSB7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZU9wYWNpdHkoKTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0dmFyIHBhbmVzID0gdGhpcy5fbWFwLl9wYW5lcztcclxuXHJcblx0XHRpZiAoYWRkSWNvbikge1xyXG5cdFx0XHRwYW5lcy5tYXJrZXJQYW5lLmFwcGVuZENoaWxkKHRoaXMuX2ljb24pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChuZXdTaGFkb3cgJiYgYWRkU2hhZG93KSB7XHJcblx0XHRcdHBhbmVzLnNoYWRvd1BhbmUuYXBwZW5kQ2hpbGQodGhpcy5fc2hhZG93KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfcmVtb3ZlSWNvbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yaXNlT25Ib3Zlcikge1xyXG5cdFx0XHRMLkRvbUV2ZW50XHJcblx0XHRcdCAgICAub2ZmKHRoaXMuX2ljb24sICdtb3VzZW92ZXInLCB0aGlzLl9icmluZ1RvRnJvbnQpXHJcblx0XHRcdCAgICAub2ZmKHRoaXMuX2ljb24sICdtb3VzZW91dCcsIHRoaXMuX3Jlc2V0WkluZGV4KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9tYXAuX3BhbmVzLm1hcmtlclBhbmUucmVtb3ZlQ2hpbGQodGhpcy5faWNvbik7XHJcblxyXG5cdFx0dGhpcy5faWNvbiA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0X3JlbW92ZVNoYWRvdzogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3NoYWRvdykge1xyXG5cdFx0XHR0aGlzLl9tYXAuX3BhbmVzLnNoYWRvd1BhbmUucmVtb3ZlQ2hpbGQodGhpcy5fc2hhZG93KTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX3NoYWRvdyA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0X3NldFBvczogZnVuY3Rpb24gKHBvcykge1xyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2ljb24sIHBvcyk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3NoYWRvdykge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fc2hhZG93LCBwb3MpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX3pJbmRleCA9IHBvcy55ICsgdGhpcy5vcHRpb25zLnpJbmRleE9mZnNldDtcclxuXHJcblx0XHR0aGlzLl9yZXNldFpJbmRleCgpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVaSW5kZXg6IGZ1bmN0aW9uIChvZmZzZXQpIHtcclxuXHRcdHRoaXMuX2ljb24uc3R5bGUuekluZGV4ID0gdGhpcy5fekluZGV4ICsgb2Zmc2V0O1xyXG5cdH0sXHJcblxyXG5cdF9hbmltYXRlWm9vbTogZnVuY3Rpb24gKG9wdCkge1xyXG5cdFx0dmFyIHBvcyA9IHRoaXMuX21hcC5fbGF0TG5nVG9OZXdMYXllclBvaW50KHRoaXMuX2xhdGxuZywgb3B0Lnpvb20sIG9wdC5jZW50ZXIpLnJvdW5kKCk7XHJcblxyXG5cdFx0dGhpcy5fc2V0UG9zKHBvcyk7XHJcblx0fSxcclxuXHJcblx0X2luaXRJbnRlcmFjdGlvbjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICghdGhpcy5vcHRpb25zLmNsaWNrYWJsZSkgeyByZXR1cm47IH1cclxuXHJcblx0XHQvLyBUT0RPIHJlZmFjdG9yIGludG8gc29tZXRoaW5nIHNoYXJlZCB3aXRoIE1hcC9QYXRoL2V0Yy4gdG8gRFJZIGl0IHVwXHJcblxyXG5cdFx0dmFyIGljb24gPSB0aGlzLl9pY29uLFxyXG5cdFx0ICAgIGV2ZW50cyA9IFsnZGJsY2xpY2snLCAnbW91c2Vkb3duJywgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcsICdjb250ZXh0bWVudSddO1xyXG5cclxuXHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhpY29uLCAnbGVhZmxldC1jbGlja2FibGUnKTtcclxuXHRcdEwuRG9tRXZlbnQub24oaWNvbiwgJ2NsaWNrJywgdGhpcy5fb25Nb3VzZUNsaWNrLCB0aGlzKTtcclxuXHRcdEwuRG9tRXZlbnQub24oaWNvbiwgJ2tleXByZXNzJywgdGhpcy5fb25LZXlQcmVzcywgdGhpcyk7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0TC5Eb21FdmVudC5vbihpY29uLCBldmVudHNbaV0sIHRoaXMuX2ZpcmVNb3VzZUV2ZW50LCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoTC5IYW5kbGVyLk1hcmtlckRyYWcpIHtcclxuXHRcdFx0dGhpcy5kcmFnZ2luZyA9IG5ldyBMLkhhbmRsZXIuTWFya2VyRHJhZyh0aGlzKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlKSB7XHJcblx0XHRcdFx0dGhpcy5kcmFnZ2luZy5lbmFibGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9vbk1vdXNlQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHR2YXIgd2FzRHJhZ2dlZCA9IHRoaXMuZHJhZ2dpbmcgJiYgdGhpcy5kcmFnZ2luZy5tb3ZlZCgpO1xyXG5cclxuXHRcdGlmICh0aGlzLmhhc0V2ZW50TGlzdGVuZXJzKGUudHlwZSkgfHwgd2FzRHJhZ2dlZCkge1xyXG5cdFx0XHRMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbihlKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAod2FzRHJhZ2dlZCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRpZiAoKCF0aGlzLmRyYWdnaW5nIHx8ICF0aGlzLmRyYWdnaW5nLl9lbmFibGVkKSAmJiB0aGlzLl9tYXAuZHJhZ2dpbmcgJiYgdGhpcy5fbWFwLmRyYWdnaW5nLm1vdmVkKCkpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dGhpcy5maXJlKGUudHlwZSwge1xyXG5cdFx0XHRvcmlnaW5hbEV2ZW50OiBlLFxyXG5cdFx0XHRsYXRsbmc6IHRoaXMuX2xhdGxuZ1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0X29uS2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2NsaWNrJywge1xyXG5cdFx0XHRcdG9yaWdpbmFsRXZlbnQ6IGUsXHJcblx0XHRcdFx0bGF0bG5nOiB0aGlzLl9sYXRsbmdcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2ZpcmVNb3VzZUV2ZW50OiBmdW5jdGlvbiAoZSkge1xyXG5cclxuXHRcdHRoaXMuZmlyZShlLnR5cGUsIHtcclxuXHRcdFx0b3JpZ2luYWxFdmVudDogZSxcclxuXHRcdFx0bGF0bG5nOiB0aGlzLl9sYXRsbmdcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFRPRE8gcHJvcGVyIGN1c3RvbSBldmVudCBwcm9wYWdhdGlvblxyXG5cdFx0Ly8gdGhpcyBsaW5lIHdpbGwgYWx3YXlzIGJlIGNhbGxlZCBpZiBtYXJrZXIgaXMgaW4gYSBGZWF0dXJlR3JvdXBcclxuXHRcdGlmIChlLnR5cGUgPT09ICdjb250ZXh0bWVudScgJiYgdGhpcy5oYXNFdmVudExpc3RlbmVycyhlLnR5cGUpKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZS50eXBlICE9PSAnbW91c2Vkb3duJykge1xyXG5cdFx0XHRMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbihlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0c2V0T3BhY2l0eTogZnVuY3Rpb24gKG9wYWNpdHkpIHtcclxuXHRcdHRoaXMub3B0aW9ucy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fdXBkYXRlT3BhY2l0eSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVPcGFjaXR5OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aGlzLl9pY29uLCB0aGlzLm9wdGlvbnMub3BhY2l0eSk7XHJcblx0XHRpZiAodGhpcy5fc2hhZG93KSB7XHJcblx0XHRcdEwuRG9tVXRpbC5zZXRPcGFjaXR5KHRoaXMuX3NoYWRvdywgdGhpcy5vcHRpb25zLm9wYWNpdHkpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9icmluZ1RvRnJvbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX3VwZGF0ZVpJbmRleCh0aGlzLm9wdGlvbnMucmlzZU9mZnNldCk7XHJcblx0fSxcclxuXHJcblx0X3Jlc2V0WkluZGV4OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl91cGRhdGVaSW5kZXgoMCk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwubWFya2VyID0gZnVuY3Rpb24gKGxhdGxuZywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5NYXJrZXIobGF0bG5nLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXG4gKiBMLkRpdkljb24gaXMgYSBsaWdodHdlaWdodCBIVE1MLWJhc2VkIGljb24gY2xhc3MgKGFzIG9wcG9zZWQgdG8gdGhlIGltYWdlLWJhc2VkIEwuSWNvbilcbiAqIHRvIHVzZSB3aXRoIEwuTWFya2VyLlxuICovXG5cbkwuRGl2SWNvbiA9IEwuSWNvbi5leHRlbmQoe1xuXHRvcHRpb25zOiB7XG5cdFx0aWNvblNpemU6IFsxMiwgMTJdLCAvLyBhbHNvIGNhbiBiZSBzZXQgdGhyb3VnaCBDU1Ncblx0XHQvKlxuXHRcdGljb25BbmNob3I6IChQb2ludClcblx0XHRwb3B1cEFuY2hvcjogKFBvaW50KVxuXHRcdGh0bWw6IChTdHJpbmcpXG5cdFx0YmdQb3M6IChQb2ludClcblx0XHQqL1xuXHRcdGNsYXNzTmFtZTogJ2xlYWZsZXQtZGl2LWljb24nLFxuXHRcdGh0bWw6IGZhbHNlXG5cdH0sXG5cblx0Y3JlYXRlSWNvbjogZnVuY3Rpb24gKG9sZEljb24pIHtcblx0XHR2YXIgZGl2ID0gKG9sZEljb24gJiYgb2xkSWNvbi50YWdOYW1lID09PSAnRElWJykgPyBvbGRJY29uIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG5cdFx0ICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cblx0XHRpZiAob3B0aW9ucy5odG1sICE9PSBmYWxzZSkge1xuXHRcdFx0ZGl2LmlubmVySFRNTCA9IG9wdGlvbnMuaHRtbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGl2LmlubmVySFRNTCA9ICcnO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLmJnUG9zKSB7XG5cdFx0XHRkaXYuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID1cblx0XHRcdCAgICAgICAgKC1vcHRpb25zLmJnUG9zLngpICsgJ3B4ICcgKyAoLW9wdGlvbnMuYmdQb3MueSkgKyAncHgnO1xuXHRcdH1cblxuXHRcdHRoaXMuX3NldEljb25TdHlsZXMoZGl2LCAnaWNvbicpO1xuXHRcdHJldHVybiBkaXY7XG5cdH0sXG5cblx0Y3JlYXRlU2hhZG93OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn0pO1xuXG5MLmRpdkljb24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRyZXR1cm4gbmV3IEwuRGl2SWNvbihvcHRpb25zKTtcbn07XG5cblxuLypcclxuICogTC5Qb3B1cCBpcyB1c2VkIGZvciBkaXNwbGF5aW5nIHBvcHVwcyBvbiB0aGUgbWFwLlxyXG4gKi9cclxuXHJcbkwuTWFwLm1lcmdlT3B0aW9ucyh7XHJcblx0Y2xvc2VQb3B1cE9uQ2xpY2s6IHRydWVcclxufSk7XHJcblxyXG5MLlBvcHVwID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcclxuXHJcblx0b3B0aW9uczoge1xyXG5cdFx0bWluV2lkdGg6IDUwLFxyXG5cdFx0bWF4V2lkdGg6IDMwMCxcclxuXHRcdC8vIG1heEhlaWdodDogbnVsbCxcclxuXHRcdGF1dG9QYW46IHRydWUsXHJcblx0XHRjbG9zZUJ1dHRvbjogdHJ1ZSxcclxuXHRcdG9mZnNldDogWzAsIDddLFxyXG5cdFx0YXV0b1BhblBhZGRpbmc6IFs1LCA1XSxcclxuXHRcdC8vIGF1dG9QYW5QYWRkaW5nVG9wTGVmdDogbnVsbCxcclxuXHRcdC8vIGF1dG9QYW5QYWRkaW5nQm90dG9tUmlnaHQ6IG51bGwsXHJcblx0XHRrZWVwSW5WaWV3OiBmYWxzZSxcclxuXHRcdGNsYXNzTmFtZTogJycsXHJcblx0XHR6b29tQW5pbWF0aW9uOiB0cnVlXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG9wdGlvbnMsIHNvdXJjZSkge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcclxuXHRcdHRoaXMuX2FuaW1hdGVkID0gTC5Ccm93c2VyLmFueTNkICYmIHRoaXMub3B0aW9ucy56b29tQW5pbWF0aW9uO1xyXG5cdFx0dGhpcy5faXNPcGVuID0gZmFsc2U7XHJcblx0fSxcclxuXHJcblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuX21hcCA9IG1hcDtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2NvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl9pbml0TGF5b3V0KCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGFuaW1GYWRlID0gbWFwLm9wdGlvbnMuZmFkZUFuaW1hdGlvbjtcclxuXHJcblx0XHRpZiAoYW5pbUZhZGUpIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGhpcy5fY29udGFpbmVyLCAwKTtcclxuXHRcdH1cclxuXHRcdG1hcC5fcGFuZXMucG9wdXBQYW5lLmFwcGVuZENoaWxkKHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0bWFwLm9uKHRoaXMuX2dldEV2ZW50cygpLCB0aGlzKTtcclxuXHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cclxuXHRcdGlmIChhbmltRmFkZSkge1xyXG5cdFx0XHRMLkRvbVV0aWwuc2V0T3BhY2l0eSh0aGlzLl9jb250YWluZXIsIDEpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgnb3BlbicpO1xyXG5cclxuXHRcdG1hcC5maXJlKCdwb3B1cG9wZW4nLCB7cG9wdXA6IHRoaXN9KTtcclxuXHJcblx0XHRpZiAodGhpcy5fc291cmNlKSB7XHJcblx0XHRcdHRoaXMuX3NvdXJjZS5maXJlKCdwb3B1cG9wZW4nLCB7cG9wdXA6IHRoaXN9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b3Blbk9uOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXAub3BlblBvcHVwKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcC5fcGFuZXMucG9wdXBQYW5lLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRhaW5lcik7XHJcblxyXG5cdFx0TC5VdGlsLmZhbHNlRm4odGhpcy5fY29udGFpbmVyLm9mZnNldFdpZHRoKTsgLy8gZm9yY2UgcmVmbG93XHJcblxyXG5cdFx0bWFwLm9mZih0aGlzLl9nZXRFdmVudHMoKSwgdGhpcyk7XHJcblxyXG5cdFx0aWYgKG1hcC5vcHRpb25zLmZhZGVBbmltYXRpb24pIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldE9wYWNpdHkodGhpcy5fY29udGFpbmVyLCAwKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9tYXAgPSBudWxsO1xyXG5cclxuXHRcdHRoaXMuZmlyZSgnY2xvc2UnKTtcclxuXHJcblx0XHRtYXAuZmlyZSgncG9wdXBjbG9zZScsIHtwb3B1cDogdGhpc30pO1xyXG5cclxuXHRcdGlmICh0aGlzLl9zb3VyY2UpIHtcclxuXHRcdFx0dGhpcy5fc291cmNlLmZpcmUoJ3BvcHVwY2xvc2UnLCB7cG9wdXA6IHRoaXN9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRnZXRMYXRMbmc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9sYXRsbmc7XHJcblx0fSxcclxuXHJcblx0c2V0TGF0TG5nOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHR0aGlzLl9sYXRsbmcgPSBMLmxhdExuZyhsYXRsbmcpO1xyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xyXG5cdFx0XHR0aGlzLl9hZGp1c3RQYW4oKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9jb250ZW50O1xyXG5cdH0sXHJcblxyXG5cdHNldENvbnRlbnQ6IGZ1bmN0aW9uIChjb250ZW50KSB7XHJcblx0XHR0aGlzLl9jb250ZW50ID0gY29udGVudDtcclxuXHRcdHRoaXMudXBkYXRlKCk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHR1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fbWFwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlQ29udGVudCgpO1xyXG5cdFx0dGhpcy5fdXBkYXRlTGF5b3V0KCk7XHJcblx0XHR0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XHJcblxyXG5cdFx0dGhpcy5fYWRqdXN0UGFuKCk7XHJcblx0fSxcclxuXHJcblx0X2dldEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGV2ZW50cyA9IHtcclxuXHRcdFx0dmlld3Jlc2V0OiB0aGlzLl91cGRhdGVQb3NpdGlvblxyXG5cdFx0fTtcclxuXHJcblx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0ZXZlbnRzLnpvb21hbmltID0gdGhpcy5fem9vbUFuaW1hdGlvbjtcclxuXHRcdH1cclxuXHRcdGlmICgnY2xvc2VPbkNsaWNrJyBpbiB0aGlzLm9wdGlvbnMgPyB0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrIDogdGhpcy5fbWFwLm9wdGlvbnMuY2xvc2VQb3B1cE9uQ2xpY2spIHtcclxuXHRcdFx0ZXZlbnRzLnByZWNsaWNrID0gdGhpcy5fY2xvc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmtlZXBJblZpZXcpIHtcclxuXHRcdFx0ZXZlbnRzLm1vdmVlbmQgPSB0aGlzLl9hZGp1c3RQYW47XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGV2ZW50cztcclxuXHR9LFxyXG5cclxuXHRfY2xvc2U6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fbWFwLmNsb3NlUG9wdXAodGhpcyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2luaXRMYXlvdXQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwcmVmaXggPSAnbGVhZmxldC1wb3B1cCcsXHJcblx0XHRcdGNvbnRhaW5lckNsYXNzID0gcHJlZml4ICsgJyAnICsgdGhpcy5vcHRpb25zLmNsYXNzTmFtZSArICcgbGVhZmxldC16b29tLScgK1xyXG5cdFx0XHQgICAgICAgICh0aGlzLl9hbmltYXRlZCA/ICdhbmltYXRlZCcgOiAnaGlkZScpLFxyXG5cdFx0XHRjb250YWluZXIgPSB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjb250YWluZXJDbGFzcyksXHJcblx0XHRcdGNsb3NlQnV0dG9uO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY2xvc2VCdXR0b24pIHtcclxuXHRcdFx0Y2xvc2VCdXR0b24gPSB0aGlzLl9jbG9zZUJ1dHRvbiA9XHJcblx0XHRcdCAgICAgICAgTC5Eb21VdGlsLmNyZWF0ZSgnYScsIHByZWZpeCArICctY2xvc2UtYnV0dG9uJywgY29udGFpbmVyKTtcclxuXHRcdFx0Y2xvc2VCdXR0b24uaHJlZiA9ICcjY2xvc2UnO1xyXG5cdFx0XHRjbG9zZUJ1dHRvbi5pbm5lckhUTUwgPSAnJiMyMTU7JztcclxuXHRcdFx0TC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbihjbG9zZUJ1dHRvbik7XHJcblxyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKGNsb3NlQnV0dG9uLCAnY2xpY2snLCB0aGlzLl9vbkNsb3NlQnV0dG9uQ2xpY2ssIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciB3cmFwcGVyID0gdGhpcy5fd3JhcHBlciA9XHJcblx0XHQgICAgICAgIEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIHByZWZpeCArICctY29udGVudC13cmFwcGVyJywgY29udGFpbmVyKTtcclxuXHRcdEwuRG9tRXZlbnQuZGlzYWJsZUNsaWNrUHJvcGFnYXRpb24od3JhcHBlcik7XHJcblxyXG5cdFx0dGhpcy5fY29udGVudE5vZGUgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBwcmVmaXggKyAnLWNvbnRlbnQnLCB3cmFwcGVyKTtcclxuXHJcblx0XHRMLkRvbUV2ZW50LmRpc2FibGVTY3JvbGxQcm9wYWdhdGlvbih0aGlzLl9jb250ZW50Tm9kZSk7XHJcblx0XHRMLkRvbUV2ZW50Lm9uKHdyYXBwZXIsICdjb250ZXh0bWVudScsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKTtcclxuXHJcblx0XHR0aGlzLl90aXBDb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBwcmVmaXggKyAnLXRpcC1jb250YWluZXInLCBjb250YWluZXIpO1xyXG5cdFx0dGhpcy5fdGlwID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgcHJlZml4ICsgJy10aXAnLCB0aGlzLl90aXBDb250YWluZXIpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVDb250ZW50OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMuX2NvbnRlbnQpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jb250ZW50ID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHR0aGlzLl9jb250ZW50Tm9kZS5pbm5lckhUTUwgPSB0aGlzLl9jb250ZW50O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0d2hpbGUgKHRoaXMuX2NvbnRlbnROb2RlLmhhc0NoaWxkTm9kZXMoKSkge1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRlbnROb2RlLmZpcnN0Q2hpbGQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX2NvbnRlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuX2NvbnRlbnQpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5maXJlKCdjb250ZW50dXBkYXRlJyk7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZUxheW91dDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRlbnROb2RlLFxyXG5cdFx0ICAgIHN0eWxlID0gY29udGFpbmVyLnN0eWxlO1xyXG5cclxuXHRcdHN0eWxlLndpZHRoID0gJyc7XHJcblx0XHRzdHlsZS53aGl0ZVNwYWNlID0gJ25vd3JhcCc7XHJcblxyXG5cdFx0dmFyIHdpZHRoID0gY29udGFpbmVyLm9mZnNldFdpZHRoO1xyXG5cdFx0d2lkdGggPSBNYXRoLm1pbih3aWR0aCwgdGhpcy5vcHRpb25zLm1heFdpZHRoKTtcclxuXHRcdHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIHRoaXMub3B0aW9ucy5taW5XaWR0aCk7XHJcblxyXG5cdFx0c3R5bGUud2lkdGggPSAod2lkdGggKyAxKSArICdweCc7XHJcblx0XHRzdHlsZS53aGl0ZVNwYWNlID0gJyc7XHJcblxyXG5cdFx0c3R5bGUuaGVpZ2h0ID0gJyc7XHJcblxyXG5cdFx0dmFyIGhlaWdodCA9IGNvbnRhaW5lci5vZmZzZXRIZWlnaHQsXHJcblx0XHQgICAgbWF4SGVpZ2h0ID0gdGhpcy5vcHRpb25zLm1heEhlaWdodCxcclxuXHRcdCAgICBzY3JvbGxlZENsYXNzID0gJ2xlYWZsZXQtcG9wdXAtc2Nyb2xsZWQnO1xyXG5cclxuXHRcdGlmIChtYXhIZWlnaHQgJiYgaGVpZ2h0ID4gbWF4SGVpZ2h0KSB7XHJcblx0XHRcdHN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCc7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsIHNjcm9sbGVkQ2xhc3MpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKGNvbnRhaW5lciwgc2Nyb2xsZWRDbGFzcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fY29udGFpbmVyV2lkdGggPSB0aGlzLl9jb250YWluZXIub2Zmc2V0V2lkdGg7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMuX21hcCkgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgcG9zID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcpLFxyXG5cdFx0ICAgIGFuaW1hdGVkID0gdGhpcy5fYW5pbWF0ZWQsXHJcblx0XHQgICAgb2Zmc2V0ID0gTC5wb2ludCh0aGlzLm9wdGlvbnMub2Zmc2V0KTtcclxuXHJcblx0XHRpZiAoYW5pbWF0ZWQpIHtcclxuXHRcdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2NvbnRhaW5lciwgcG9zKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250YWluZXJCb3R0b20gPSAtb2Zmc2V0LnkgLSAoYW5pbWF0ZWQgPyAwIDogcG9zLnkpO1xyXG5cdFx0dGhpcy5fY29udGFpbmVyTGVmdCA9IC1NYXRoLnJvdW5kKHRoaXMuX2NvbnRhaW5lcldpZHRoIC8gMikgKyBvZmZzZXQueCArIChhbmltYXRlZCA/IDAgOiBwb3MueCk7XHJcblxyXG5cdFx0Ly8gYm90dG9tIHBvc2l0aW9uIHRoZSBwb3B1cCBpbiBjYXNlIHRoZSBoZWlnaHQgb2YgdGhlIHBvcHVwIGNoYW5nZXMgKGltYWdlcyBsb2FkaW5nIGV0YylcclxuXHRcdHRoaXMuX2NvbnRhaW5lci5zdHlsZS5ib3R0b20gPSB0aGlzLl9jb250YWluZXJCb3R0b20gKyAncHgnO1xyXG5cdFx0dGhpcy5fY29udGFpbmVyLnN0eWxlLmxlZnQgPSB0aGlzLl9jb250YWluZXJMZWZ0ICsgJ3B4JztcclxuXHR9LFxyXG5cclxuXHRfem9vbUFuaW1hdGlvbjogZnVuY3Rpb24gKG9wdCkge1xyXG5cdFx0dmFyIHBvcyA9IHRoaXMuX21hcC5fbGF0TG5nVG9OZXdMYXllclBvaW50KHRoaXMuX2xhdGxuZywgb3B0Lnpvb20sIG9wdC5jZW50ZXIpO1xyXG5cclxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jb250YWluZXIsIHBvcyk7XHJcblx0fSxcclxuXHJcblx0X2FkanVzdFBhbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuYXV0b1BhbikgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIGNvbnRhaW5lckhlaWdodCA9IHRoaXMuX2NvbnRhaW5lci5vZmZzZXRIZWlnaHQsXHJcblx0XHQgICAgY29udGFpbmVyV2lkdGggPSB0aGlzLl9jb250YWluZXJXaWR0aCxcclxuXHJcblx0XHQgICAgbGF5ZXJQb3MgPSBuZXcgTC5Qb2ludCh0aGlzLl9jb250YWluZXJMZWZ0LCAtY29udGFpbmVySGVpZ2h0IC0gdGhpcy5fY29udGFpbmVyQm90dG9tKTtcclxuXHJcblx0XHRpZiAodGhpcy5fYW5pbWF0ZWQpIHtcclxuXHRcdFx0bGF5ZXJQb3MuX2FkZChMLkRvbVV0aWwuZ2V0UG9zaXRpb24odGhpcy5fY29udGFpbmVyKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGNvbnRhaW5lclBvcyA9IG1hcC5sYXllclBvaW50VG9Db250YWluZXJQb2ludChsYXllclBvcyksXHJcblx0XHQgICAgcGFkZGluZyA9IEwucG9pbnQodGhpcy5vcHRpb25zLmF1dG9QYW5QYWRkaW5nKSxcclxuXHRcdCAgICBwYWRkaW5nVEwgPSBMLnBvaW50KHRoaXMub3B0aW9ucy5hdXRvUGFuUGFkZGluZ1RvcExlZnQgfHwgcGFkZGluZyksXHJcblx0XHQgICAgcGFkZGluZ0JSID0gTC5wb2ludCh0aGlzLm9wdGlvbnMuYXV0b1BhblBhZGRpbmdCb3R0b21SaWdodCB8fCBwYWRkaW5nKSxcclxuXHRcdCAgICBzaXplID0gbWFwLmdldFNpemUoKSxcclxuXHRcdCAgICBkeCA9IDAsXHJcblx0XHQgICAgZHkgPSAwO1xyXG5cclxuXHRcdGlmIChjb250YWluZXJQb3MueCArIGNvbnRhaW5lcldpZHRoICsgcGFkZGluZ0JSLnggPiBzaXplLngpIHsgLy8gcmlnaHRcclxuXHRcdFx0ZHggPSBjb250YWluZXJQb3MueCArIGNvbnRhaW5lcldpZHRoIC0gc2l6ZS54ICsgcGFkZGluZ0JSLng7XHJcblx0XHR9XHJcblx0XHRpZiAoY29udGFpbmVyUG9zLnggLSBkeCAtIHBhZGRpbmdUTC54IDwgMCkgeyAvLyBsZWZ0XHJcblx0XHRcdGR4ID0gY29udGFpbmVyUG9zLnggLSBwYWRkaW5nVEwueDtcclxuXHRcdH1cclxuXHRcdGlmIChjb250YWluZXJQb3MueSArIGNvbnRhaW5lckhlaWdodCArIHBhZGRpbmdCUi55ID4gc2l6ZS55KSB7IC8vIGJvdHRvbVxyXG5cdFx0XHRkeSA9IGNvbnRhaW5lclBvcy55ICsgY29udGFpbmVySGVpZ2h0IC0gc2l6ZS55ICsgcGFkZGluZ0JSLnk7XHJcblx0XHR9XHJcblx0XHRpZiAoY29udGFpbmVyUG9zLnkgLSBkeSAtIHBhZGRpbmdUTC55IDwgMCkgeyAvLyB0b3BcclxuXHRcdFx0ZHkgPSBjb250YWluZXJQb3MueSAtIHBhZGRpbmdUTC55O1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChkeCB8fCBkeSkge1xyXG5cdFx0XHRtYXBcclxuXHRcdFx0ICAgIC5maXJlKCdhdXRvcGFuc3RhcnQnKVxyXG5cdFx0XHQgICAgLnBhbkJ5KFtkeCwgZHldKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfb25DbG9zZUJ1dHRvbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dGhpcy5fY2xvc2UoKTtcclxuXHRcdEwuRG9tRXZlbnQuc3RvcChlKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5wb3B1cCA9IGZ1bmN0aW9uIChvcHRpb25zLCBzb3VyY2UpIHtcclxuXHRyZXR1cm4gbmV3IEwuUG9wdXAob3B0aW9ucywgc291cmNlKTtcclxufTtcclxuXHJcblxyXG5MLk1hcC5pbmNsdWRlKHtcclxuXHRvcGVuUG9wdXA6IGZ1bmN0aW9uIChwb3B1cCwgbGF0bG5nLCBvcHRpb25zKSB7IC8vIChQb3B1cCkgb3IgKFN0cmluZyB8fCBIVE1MRWxlbWVudCwgTGF0TG5nWywgT2JqZWN0XSlcclxuXHRcdHRoaXMuY2xvc2VQb3B1cCgpO1xyXG5cclxuXHRcdGlmICghKHBvcHVwIGluc3RhbmNlb2YgTC5Qb3B1cCkpIHtcclxuXHRcdFx0dmFyIGNvbnRlbnQgPSBwb3B1cDtcclxuXHJcblx0XHRcdHBvcHVwID0gbmV3IEwuUG9wdXAob3B0aW9ucylcclxuXHRcdFx0ICAgIC5zZXRMYXRMbmcobGF0bG5nKVxyXG5cdFx0XHQgICAgLnNldENvbnRlbnQoY29udGVudCk7XHJcblx0XHR9XHJcblx0XHRwb3B1cC5faXNPcGVuID0gdHJ1ZTtcclxuXHJcblx0XHR0aGlzLl9wb3B1cCA9IHBvcHVwO1xyXG5cdFx0cmV0dXJuIHRoaXMuYWRkTGF5ZXIocG9wdXApO1xyXG5cdH0sXHJcblxyXG5cdGNsb3NlUG9wdXA6IGZ1bmN0aW9uIChwb3B1cCkge1xyXG5cdFx0aWYgKCFwb3B1cCB8fCBwb3B1cCA9PT0gdGhpcy5fcG9wdXApIHtcclxuXHRcdFx0cG9wdXAgPSB0aGlzLl9wb3B1cDtcclxuXHRcdFx0dGhpcy5fcG9wdXAgPSBudWxsO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHBvcHVwKSB7XHJcblx0XHRcdHRoaXMucmVtb3ZlTGF5ZXIocG9wdXApO1xyXG5cdFx0XHRwb3B1cC5faXNPcGVuID0gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcclxuICogUG9wdXAgZXh0ZW5zaW9uIHRvIEwuTWFya2VyLCBhZGRpbmcgcG9wdXAtcmVsYXRlZCBtZXRob2RzLlxyXG4gKi9cclxuXHJcbkwuTWFya2VyLmluY2x1ZGUoe1xyXG5cdG9wZW5Qb3B1cDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwICYmIHRoaXMuX21hcCAmJiAhdGhpcy5fbWFwLmhhc0xheWVyKHRoaXMuX3BvcHVwKSkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cC5zZXRMYXRMbmcodGhpcy5fbGF0bG5nKTtcclxuXHRcdFx0dGhpcy5fbWFwLm9wZW5Qb3B1cCh0aGlzLl9wb3B1cCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Y2xvc2VQb3B1cDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwLl9jbG9zZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0dG9nZ2xlUG9wdXA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHRpZiAodGhpcy5fcG9wdXAuX2lzT3Blbikge1xyXG5cdFx0XHRcdHRoaXMuY2xvc2VQb3B1cCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMub3BlblBvcHVwKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGJpbmRQb3B1cDogZnVuY3Rpb24gKGNvbnRlbnQsIG9wdGlvbnMpIHtcclxuXHRcdHZhciBhbmNob3IgPSBMLnBvaW50KHRoaXMub3B0aW9ucy5pY29uLm9wdGlvbnMucG9wdXBBbmNob3IgfHwgWzAsIDBdKTtcclxuXHJcblx0XHRhbmNob3IgPSBhbmNob3IuYWRkKEwuUG9wdXAucHJvdG90eXBlLm9wdGlvbnMub2Zmc2V0KTtcclxuXHJcblx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLm9mZnNldCkge1xyXG5cdFx0XHRhbmNob3IgPSBhbmNob3IuYWRkKG9wdGlvbnMub2Zmc2V0KTtcclxuXHRcdH1cclxuXHJcblx0XHRvcHRpb25zID0gTC5leHRlbmQoe29mZnNldDogYW5jaG9yfSwgb3B0aW9ucyk7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9wb3B1cEhhbmRsZXJzQWRkZWQpIHtcclxuXHRcdFx0dGhpc1xyXG5cdFx0XHQgICAgLm9uKCdjbGljaycsIHRoaXMudG9nZ2xlUG9wdXAsIHRoaXMpXHJcblx0XHRcdCAgICAub24oJ3JlbW92ZScsIHRoaXMuY2xvc2VQb3B1cCwgdGhpcylcclxuXHRcdFx0ICAgIC5vbignbW92ZScsIHRoaXMuX21vdmVQb3B1cCwgdGhpcyk7XHJcblx0XHRcdHRoaXMuX3BvcHVwSGFuZGxlcnNBZGRlZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBMLlBvcHVwKSB7XHJcblx0XHRcdEwuc2V0T3B0aW9ucyhjb250ZW50LCBvcHRpb25zKTtcclxuXHRcdFx0dGhpcy5fcG9wdXAgPSBjb250ZW50O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fcG9wdXAgPSBuZXcgTC5Qb3B1cChvcHRpb25zLCB0aGlzKVxyXG5cdFx0XHRcdC5zZXRDb250ZW50KGNvbnRlbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHNldFBvcHVwQ29udGVudDogZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cC5zZXRDb250ZW50KGNvbnRlbnQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0dW5iaW5kUG9wdXA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cCA9IG51bGw7XHJcblx0XHRcdHRoaXNcclxuXHRcdFx0ICAgIC5vZmYoJ2NsaWNrJywgdGhpcy50b2dnbGVQb3B1cCwgdGhpcylcclxuXHRcdFx0ICAgIC5vZmYoJ3JlbW92ZScsIHRoaXMuY2xvc2VQb3B1cCwgdGhpcylcclxuXHRcdFx0ICAgIC5vZmYoJ21vdmUnLCB0aGlzLl9tb3ZlUG9wdXAsIHRoaXMpO1xyXG5cdFx0XHR0aGlzLl9wb3B1cEhhbmRsZXJzQWRkZWQgPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldFBvcHVwOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcG9wdXA7XHJcblx0fSxcclxuXHJcblx0X21vdmVQb3B1cDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHRoaXMuX3BvcHVwLnNldExhdExuZyhlLmxhdGxuZyk7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIEwuTGF5ZXJHcm91cCBpcyBhIGNsYXNzIHRvIGNvbWJpbmUgc2V2ZXJhbCBsYXllcnMgaW50byBvbmUgc28gdGhhdFxyXG4gKiB5b3UgY2FuIG1hbmlwdWxhdGUgdGhlIGdyb3VwIChlLmcuIGFkZC9yZW1vdmUgaXQpIGFzIG9uZSBsYXllci5cclxuICovXHJcblxyXG5MLkxheWVyR3JvdXAgPSBMLkNsYXNzLmV4dGVuZCh7XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGxheWVycykge1xyXG5cdFx0dGhpcy5fbGF5ZXJzID0ge307XHJcblxyXG5cdFx0dmFyIGksIGxlbjtcclxuXHJcblx0XHRpZiAobGF5ZXJzKSB7XHJcblx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IGxheWVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdHRoaXMuYWRkTGF5ZXIobGF5ZXJzW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGFkZExheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdHZhciBpZCA9IHRoaXMuZ2V0TGF5ZXJJZChsYXllcik7XHJcblxyXG5cdFx0dGhpcy5fbGF5ZXJzW2lkXSA9IGxheWVyO1xyXG5cclxuXHRcdGlmICh0aGlzLl9tYXApIHtcclxuXHRcdFx0dGhpcy5fbWFwLmFkZExheWVyKGxheWVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRyZW1vdmVMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHR2YXIgaWQgPSBsYXllciBpbiB0aGlzLl9sYXllcnMgPyBsYXllciA6IHRoaXMuZ2V0TGF5ZXJJZChsYXllcik7XHJcblxyXG5cdFx0aWYgKHRoaXMuX21hcCAmJiB0aGlzLl9sYXllcnNbaWRdKSB7XHJcblx0XHRcdHRoaXMuX21hcC5yZW1vdmVMYXllcih0aGlzLl9sYXllcnNbaWRdKTtcclxuXHRcdH1cclxuXHJcblx0XHRkZWxldGUgdGhpcy5fbGF5ZXJzW2lkXTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRoYXNMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRpZiAoIWxheWVyKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHRcdHJldHVybiAobGF5ZXIgaW4gdGhpcy5fbGF5ZXJzIHx8IHRoaXMuZ2V0TGF5ZXJJZChsYXllcikgaW4gdGhpcy5fbGF5ZXJzKTtcclxuXHR9LFxyXG5cclxuXHRjbGVhckxheWVyczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5lYWNoTGF5ZXIodGhpcy5yZW1vdmVMYXllciwgdGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRpbnZva2U6IGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XHJcblx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXHJcblx0XHQgICAgaSwgbGF5ZXI7XHJcblxyXG5cdFx0Zm9yIChpIGluIHRoaXMuX2xheWVycykge1xyXG5cdFx0XHRsYXllciA9IHRoaXMuX2xheWVyc1tpXTtcclxuXHJcblx0XHRcdGlmIChsYXllclttZXRob2ROYW1lXSkge1xyXG5cdFx0XHRcdGxheWVyW21ldGhvZE5hbWVdLmFwcGx5KGxheWVyLCBhcmdzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9tYXAgPSBtYXA7XHJcblx0XHR0aGlzLmVhY2hMYXllcihtYXAuYWRkTGF5ZXIsIG1hcCk7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHRoaXMuZWFjaExheWVyKG1hcC5yZW1vdmVMYXllciwgbWFwKTtcclxuXHRcdHRoaXMuX21hcCA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0YWRkVG86IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcC5hZGRMYXllcih0aGlzKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGVhY2hMYXllcjogZnVuY3Rpb24gKG1ldGhvZCwgY29udGV4dCkge1xyXG5cdFx0Zm9yICh2YXIgaSBpbiB0aGlzLl9sYXllcnMpIHtcclxuXHRcdFx0bWV0aG9kLmNhbGwoY29udGV4dCwgdGhpcy5fbGF5ZXJzW2ldKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldExheWVyOiBmdW5jdGlvbiAoaWQpIHtcclxuXHRcdHJldHVybiB0aGlzLl9sYXllcnNbaWRdO1xyXG5cdH0sXHJcblxyXG5cdGdldExheWVyczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGxheWVycyA9IFtdO1xyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gdGhpcy5fbGF5ZXJzKSB7XHJcblx0XHRcdGxheWVycy5wdXNoKHRoaXMuX2xheWVyc1tpXSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbGF5ZXJzO1xyXG5cdH0sXHJcblxyXG5cdHNldFpJbmRleDogZnVuY3Rpb24gKHpJbmRleCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuaW52b2tlKCdzZXRaSW5kZXgnLCB6SW5kZXgpO1xyXG5cdH0sXHJcblxyXG5cdGdldExheWVySWQ6IGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0cmV0dXJuIEwuc3RhbXAobGF5ZXIpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmxheWVyR3JvdXAgPSBmdW5jdGlvbiAobGF5ZXJzKSB7XHJcblx0cmV0dXJuIG5ldyBMLkxheWVyR3JvdXAobGF5ZXJzKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIEwuRmVhdHVyZUdyb3VwIGV4dGVuZHMgTC5MYXllckdyb3VwIGJ5IGludHJvZHVjaW5nIG1vdXNlIGV2ZW50cyBhbmQgYWRkaXRpb25hbCBtZXRob2RzXHJcbiAqIHNoYXJlZCBiZXR3ZWVuIGEgZ3JvdXAgb2YgaW50ZXJhY3RpdmUgbGF5ZXJzIChsaWtlIHZlY3RvcnMgb3IgbWFya2VycykuXHJcbiAqL1xyXG5cclxuTC5GZWF0dXJlR3JvdXAgPSBMLkxheWVyR3JvdXAuZXh0ZW5kKHtcclxuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXHJcblxyXG5cdHN0YXRpY3M6IHtcclxuXHRcdEVWRU5UUzogJ2NsaWNrIGRibGNsaWNrIG1vdXNlb3ZlciBtb3VzZW91dCBtb3VzZW1vdmUgY29udGV4dG1lbnUgcG9wdXBvcGVuIHBvcHVwY2xvc2UnXHJcblx0fSxcclxuXHJcblx0YWRkTGF5ZXI6IGZ1bmN0aW9uIChsYXllcikge1xyXG5cdFx0aWYgKHRoaXMuaGFzTGF5ZXIobGF5ZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICgnb24nIGluIGxheWVyKSB7XHJcblx0XHRcdGxheWVyLm9uKEwuRmVhdHVyZUdyb3VwLkVWRU5UUywgdGhpcy5fcHJvcGFnYXRlRXZlbnQsIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdEwuTGF5ZXJHcm91cC5wcm90b3R5cGUuYWRkTGF5ZXIuY2FsbCh0aGlzLCBsYXllcik7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3BvcHVwQ29udGVudCAmJiBsYXllci5iaW5kUG9wdXApIHtcclxuXHRcdFx0bGF5ZXIuYmluZFBvcHVwKHRoaXMuX3BvcHVwQ29udGVudCwgdGhpcy5fcG9wdXBPcHRpb25zKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5maXJlKCdsYXllcmFkZCcsIHtsYXllcjogbGF5ZXJ9KTtcclxuXHR9LFxyXG5cclxuXHRyZW1vdmVMYXllcjogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRpZiAoIXRoaXMuaGFzTGF5ZXIobGF5ZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGxheWVyIGluIHRoaXMuX2xheWVycykge1xyXG5cdFx0XHRsYXllciA9IHRoaXMuX2xheWVyc1tsYXllcl07XHJcblx0XHR9XHJcblxyXG5cdFx0bGF5ZXIub2ZmKEwuRmVhdHVyZUdyb3VwLkVWRU5UUywgdGhpcy5fcHJvcGFnYXRlRXZlbnQsIHRoaXMpO1xyXG5cclxuXHRcdEwuTGF5ZXJHcm91cC5wcm90b3R5cGUucmVtb3ZlTGF5ZXIuY2FsbCh0aGlzLCBsYXllcik7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3BvcHVwQ29udGVudCkge1xyXG5cdFx0XHR0aGlzLmludm9rZSgndW5iaW5kUG9wdXAnKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5maXJlKCdsYXllcnJlbW92ZScsIHtsYXllcjogbGF5ZXJ9KTtcclxuXHR9LFxyXG5cclxuXHRiaW5kUG9wdXA6IGZ1bmN0aW9uIChjb250ZW50LCBvcHRpb25zKSB7XHJcblx0XHR0aGlzLl9wb3B1cENvbnRlbnQgPSBjb250ZW50O1xyXG5cdFx0dGhpcy5fcG9wdXBPcHRpb25zID0gb3B0aW9ucztcclxuXHRcdHJldHVybiB0aGlzLmludm9rZSgnYmluZFBvcHVwJywgY29udGVudCwgb3B0aW9ucyk7XHJcblx0fSxcclxuXHJcblx0b3BlblBvcHVwOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHQvLyBvcGVuIHBvcHVwIG9uIHRoZSBmaXJzdCBsYXllclxyXG5cdFx0Zm9yICh2YXIgaWQgaW4gdGhpcy5fbGF5ZXJzKSB7XHJcblx0XHRcdHRoaXMuX2xheWVyc1tpZF0ub3BlblBvcHVwKGxhdGxuZyk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0U3R5bGU6IGZ1bmN0aW9uIChzdHlsZSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuaW52b2tlKCdzZXRTdHlsZScsIHN0eWxlKTtcclxuXHR9LFxyXG5cclxuXHRicmluZ1RvRnJvbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmludm9rZSgnYnJpbmdUb0Zyb250Jyk7XHJcblx0fSxcclxuXHJcblx0YnJpbmdUb0JhY2s6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmludm9rZSgnYnJpbmdUb0JhY2snKTtcclxuXHR9LFxyXG5cclxuXHRnZXRCb3VuZHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBib3VuZHMgPSBuZXcgTC5MYXRMbmdCb3VuZHMoKTtcclxuXHJcblx0XHR0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdFx0Ym91bmRzLmV4dGVuZChsYXllciBpbnN0YW5jZW9mIEwuTWFya2VyID8gbGF5ZXIuZ2V0TGF0TG5nKCkgOiBsYXllci5nZXRCb3VuZHMoKSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gYm91bmRzO1xyXG5cdH0sXHJcblxyXG5cdF9wcm9wYWdhdGVFdmVudDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGUgPSBMLmV4dGVuZCh7XHJcblx0XHRcdGxheWVyOiBlLnRhcmdldCxcclxuXHRcdFx0dGFyZ2V0OiB0aGlzXHJcblx0XHR9LCBlKTtcclxuXHRcdHRoaXMuZmlyZShlLnR5cGUsIGUpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmZlYXR1cmVHcm91cCA9IGZ1bmN0aW9uIChsYXllcnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuRmVhdHVyZUdyb3VwKGxheWVycyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLlBhdGggaXMgYSBiYXNlIGNsYXNzIGZvciByZW5kZXJpbmcgdmVjdG9yIHBhdGhzIG9uIGEgbWFwLiBJbmhlcml0ZWQgYnkgUG9seWxpbmUsIENpcmNsZSwgZXRjLlxyXG4gKi9cclxuXHJcbkwuUGF0aCA9IEwuQ2xhc3MuZXh0ZW5kKHtcclxuXHRpbmNsdWRlczogW0wuTWl4aW4uRXZlbnRzXSxcclxuXHJcblx0c3RhdGljczoge1xyXG5cdFx0Ly8gaG93IG11Y2ggdG8gZXh0ZW5kIHRoZSBjbGlwIGFyZWEgYXJvdW5kIHRoZSBtYXAgdmlld1xyXG5cdFx0Ly8gKHJlbGF0aXZlIHRvIGl0cyBzaXplLCBlLmcuIDAuNSBpcyBoYWxmIHRoZSBzY3JlZW4gaW4gZWFjaCBkaXJlY3Rpb24pXHJcblx0XHQvLyBzZXQgaXQgc28gdGhhdCBTVkcgZWxlbWVudCBkb2Vzbid0IGV4Y2VlZCAxMjgwcHggKHZlY3RvcnMgZmxpY2tlciBvbiBkcmFnZW5kIGlmIGl0IGlzKVxyXG5cdFx0Q0xJUF9QQURESU5HOiAoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHR2YXIgbWF4ID0gTC5Ccm93c2VyLm1vYmlsZSA/IDEyODAgOiAyMDAwLFxyXG5cdFx0XHQgICAgdGFyZ2V0ID0gKG1heCAvIE1hdGgubWF4KHdpbmRvdy5vdXRlcldpZHRoLCB3aW5kb3cub3V0ZXJIZWlnaHQpIC0gMSkgLyAyO1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMC41LCB0YXJnZXQpKTtcclxuXHRcdH0pKClcclxuXHR9LFxyXG5cclxuXHRvcHRpb25zOiB7XHJcblx0XHRzdHJva2U6IHRydWUsXHJcblx0XHRjb2xvcjogJyMwMDMzZmYnLFxyXG5cdFx0ZGFzaEFycmF5OiBudWxsLFxyXG5cdFx0bGluZUNhcDogbnVsbCxcclxuXHRcdGxpbmVKb2luOiBudWxsLFxyXG5cdFx0d2VpZ2h0OiA1LFxyXG5cdFx0b3BhY2l0eTogMC41LFxyXG5cclxuXHRcdGZpbGw6IGZhbHNlLFxyXG5cdFx0ZmlsbENvbG9yOiBudWxsLCAvL3NhbWUgYXMgY29sb3IgYnkgZGVmYXVsdFxyXG5cdFx0ZmlsbE9wYWNpdHk6IDAuMixcclxuXHJcblx0XHRjbGlja2FibGU6IHRydWVcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9tYXAgPSBtYXA7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9jb250YWluZXIpIHtcclxuXHRcdFx0dGhpcy5faW5pdEVsZW1lbnRzKCk7XHJcblx0XHRcdHRoaXMuX2luaXRFdmVudHMoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnByb2plY3RMYXRsbmdzKCk7XHJcblx0XHR0aGlzLl91cGRhdGVQYXRoKCk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2NvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl9tYXAuX3BhdGhSb290LmFwcGVuZENoaWxkKHRoaXMuX2NvbnRhaW5lcik7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5maXJlKCdhZGQnKTtcclxuXHJcblx0XHRtYXAub24oe1xyXG5cdFx0XHQndmlld3Jlc2V0JzogdGhpcy5wcm9qZWN0TGF0bG5ncyxcclxuXHRcdFx0J21vdmVlbmQnOiB0aGlzLl91cGRhdGVQYXRoXHJcblx0XHR9LCB0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwLmFkZExheWVyKHRoaXMpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcC5fcGF0aFJvb3QucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHQvLyBOZWVkIHRvIGZpcmUgcmVtb3ZlIGV2ZW50IGJlZm9yZSB3ZSBzZXQgX21hcCB0byBudWxsIGFzIHRoZSBldmVudCBob29rcyBtaWdodCBuZWVkIHRoZSBvYmplY3RcclxuXHRcdHRoaXMuZmlyZSgncmVtb3ZlJyk7XHJcblx0XHR0aGlzLl9tYXAgPSBudWxsO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIudm1sKSB7XHJcblx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdHRoaXMuX3N0cm9rZSA9IG51bGw7XHJcblx0XHRcdHRoaXMuX2ZpbGwgPSBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdG1hcC5vZmYoe1xyXG5cdFx0XHQndmlld3Jlc2V0JzogdGhpcy5wcm9qZWN0TGF0bG5ncyxcclxuXHRcdFx0J21vdmVlbmQnOiB0aGlzLl91cGRhdGVQYXRoXHJcblx0XHR9LCB0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRwcm9qZWN0TGF0bG5nczogZnVuY3Rpb24gKCkge1xyXG5cdFx0Ly8gZG8gYWxsIHByb2plY3Rpb24gc3R1ZmYgaGVyZVxyXG5cdH0sXHJcblxyXG5cdHNldFN0eWxlOiBmdW5jdGlvbiAoc3R5bGUpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBzdHlsZSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2NvbnRhaW5lcikge1xyXG5cdFx0XHR0aGlzLl91cGRhdGVTdHlsZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlZHJhdzogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLnByb2plY3RMYXRsbmdzKCk7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVBhdGgoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLk1hcC5pbmNsdWRlKHtcclxuXHRfdXBkYXRlUGF0aFZpZXdwb3J0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcCA9IEwuUGF0aC5DTElQX1BBRERJTkcsXHJcblx0XHQgICAgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpLFxyXG5cdFx0ICAgIHBhbmVQb3MgPSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24odGhpcy5fbWFwUGFuZSksXHJcblx0XHQgICAgbWluID0gcGFuZVBvcy5tdWx0aXBseUJ5KC0xKS5fc3VidHJhY3Qoc2l6ZS5tdWx0aXBseUJ5KHApLl9yb3VuZCgpKSxcclxuXHRcdCAgICBtYXggPSBtaW4uYWRkKHNpemUubXVsdGlwbHlCeSgxICsgcCAqIDIpLl9yb3VuZCgpKTtcclxuXHJcblx0XHR0aGlzLl9wYXRoVmlld3BvcnQgPSBuZXcgTC5Cb3VuZHMobWluLCBtYXgpO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBFeHRlbmRzIEwuUGF0aCB3aXRoIFNWRy1zcGVjaWZpYyByZW5kZXJpbmcgY29kZS5cclxuICovXHJcblxyXG5MLlBhdGguU1ZHX05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcclxuXHJcbkwuQnJvd3Nlci5zdmcgPSAhIShkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiYgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEwuUGF0aC5TVkdfTlMsICdzdmcnKS5jcmVhdGVTVkdSZWN0KTtcclxuXHJcbkwuUGF0aCA9IEwuUGF0aC5leHRlbmQoe1xyXG5cdHN0YXRpY3M6IHtcclxuXHRcdFNWRzogTC5Ccm93c2VyLnN2Z1xyXG5cdH0sXHJcblxyXG5cdGJyaW5nVG9Gcm9udDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHJvb3QgPSB0aGlzLl9tYXAuX3BhdGhSb290LFxyXG5cdFx0ICAgIHBhdGggPSB0aGlzLl9jb250YWluZXI7XHJcblxyXG5cdFx0aWYgKHBhdGggJiYgcm9vdC5sYXN0Q2hpbGQgIT09IHBhdGgpIHtcclxuXHRcdFx0cm9vdC5hcHBlbmRDaGlsZChwYXRoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGJyaW5nVG9CYWNrOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcm9vdCA9IHRoaXMuX21hcC5fcGF0aFJvb3QsXHJcblx0XHQgICAgcGF0aCA9IHRoaXMuX2NvbnRhaW5lcixcclxuXHRcdCAgICBmaXJzdCA9IHJvb3QuZmlyc3RDaGlsZDtcclxuXHJcblx0XHRpZiAocGF0aCAmJiBmaXJzdCAhPT0gcGF0aCkge1xyXG5cdFx0XHRyb290Lmluc2VydEJlZm9yZShwYXRoLCBmaXJzdCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRnZXRQYXRoU3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcblx0XHQvLyBmb3JtIHBhdGggc3RyaW5nIGhlcmVcclxuXHR9LFxyXG5cclxuXHRfY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKG5hbWUpIHtcclxuXHRcdHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoTC5QYXRoLlNWR19OUywgbmFtZSk7XHJcblx0fSxcclxuXHJcblx0X2luaXRFbGVtZW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fbWFwLl9pbml0UGF0aFJvb3QoKTtcclxuXHRcdHRoaXMuX2luaXRQYXRoKCk7XHJcblx0XHR0aGlzLl9pbml0U3R5bGUoKTtcclxuXHR9LFxyXG5cclxuXHRfaW5pdFBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IHRoaXMuX2NyZWF0ZUVsZW1lbnQoJ2cnKTtcclxuXHJcblx0XHR0aGlzLl9wYXRoID0gdGhpcy5fY3JlYXRlRWxlbWVudCgncGF0aCcpO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY2xhc3NOYW1lKSB7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9wYXRoLCB0aGlzLm9wdGlvbnMuY2xhc3NOYW1lKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fcGF0aCk7XHJcblx0fSxcclxuXHJcblx0X2luaXRTdHlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdHJva2UpIHtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS1saW5lam9pbicsICdyb3VuZCcpO1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLWxpbmVjYXAnLCAncm91bmQnKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuZmlsbCkge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnZmlsbC1ydWxlJywgJ2V2ZW5vZGQnKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMucG9pbnRlckV2ZW50cykge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgncG9pbnRlci1ldmVudHMnLCB0aGlzLm9wdGlvbnMucG9pbnRlckV2ZW50cyk7XHJcblx0XHR9XHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5jbGlja2FibGUgJiYgIXRoaXMub3B0aW9ucy5wb2ludGVyRXZlbnRzKSB7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XHJcblx0XHR9XHJcblx0XHR0aGlzLl91cGRhdGVTdHlsZSgpO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVTdHlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdHJva2UpIHtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsIHRoaXMub3B0aW9ucy5jb2xvcik7XHJcblx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdzdHJva2Utb3BhY2l0eScsIHRoaXMub3B0aW9ucy5vcGFjaXR5KTtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsIHRoaXMub3B0aW9ucy53ZWlnaHQpO1xyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmRhc2hBcnJheSkge1xyXG5cdFx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdzdHJva2UtZGFzaGFycmF5JywgdGhpcy5vcHRpb25zLmRhc2hBcnJheSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fcGF0aC5yZW1vdmVBdHRyaWJ1dGUoJ3N0cm9rZS1kYXNoYXJyYXknKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmxpbmVDYXApIHtcclxuXHRcdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLWxpbmVjYXAnLCB0aGlzLm9wdGlvbnMubGluZUNhcCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5saW5lSm9pbikge1xyXG5cdFx0XHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdzdHJva2UtbGluZWpvaW4nLCB0aGlzLm9wdGlvbnMubGluZUpvaW4pO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgJ25vbmUnKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuZmlsbCkge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnZmlsbCcsIHRoaXMub3B0aW9ucy5maWxsQ29sb3IgfHwgdGhpcy5vcHRpb25zLmNvbG9yKTtcclxuXHRcdFx0dGhpcy5fcGF0aC5zZXRBdHRyaWJ1dGUoJ2ZpbGwtb3BhY2l0eScsIHRoaXMub3B0aW9ucy5maWxsT3BhY2l0eSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9wYXRoLnNldEF0dHJpYnV0ZSgnZmlsbCcsICdub25lJyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBzdHIgPSB0aGlzLmdldFBhdGhTdHJpbmcoKTtcclxuXHRcdGlmICghc3RyKSB7XHJcblx0XHRcdC8vIGZpeCB3ZWJraXQgZW1wdHkgc3RyaW5nIHBhcnNpbmcgYnVnXHJcblx0XHRcdHN0ciA9ICdNMCAwJztcclxuXHRcdH1cclxuXHRcdHRoaXMuX3BhdGguc2V0QXR0cmlidXRlKCdkJywgc3RyKTtcclxuXHR9LFxyXG5cclxuXHQvLyBUT0RPIHJlbW92ZSBkdXBsaWNhdGlvbiB3aXRoIEwuTWFwXHJcblx0X2luaXRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMuY2xpY2thYmxlKSB7XHJcblx0XHRcdGlmIChMLkJyb3dzZXIuc3ZnIHx8ICFMLkJyb3dzZXIudm1sKSB7XHJcblx0XHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3BhdGgsICdsZWFmbGV0LWNsaWNrYWJsZScpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX2NvbnRhaW5lciwgJ2NsaWNrJywgdGhpcy5fb25Nb3VzZUNsaWNrLCB0aGlzKTtcclxuXHJcblx0XHRcdHZhciBldmVudHMgPSBbJ2RibGNsaWNrJywgJ21vdXNlZG93bicsICdtb3VzZW92ZXInLFxyXG5cdFx0XHQgICAgICAgICAgICAgICdtb3VzZW91dCcsICdtb3VzZW1vdmUnLCAnY29udGV4dG1lbnUnXTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX2NvbnRhaW5lciwgZXZlbnRzW2ldLCB0aGlzLl9maXJlTW91c2VFdmVudCwgdGhpcyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfb25Nb3VzZUNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKHRoaXMuX21hcC5kcmFnZ2luZyAmJiB0aGlzLl9tYXAuZHJhZ2dpbmcubW92ZWQoKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHR0aGlzLl9maXJlTW91c2VFdmVudChlKTtcclxuXHR9LFxyXG5cclxuXHRfZmlyZU1vdXNlRXZlbnQ6IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRpZiAoIXRoaXMuaGFzRXZlbnRMaXN0ZW5lcnMoZS50eXBlKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0ICAgIGNvbnRhaW5lclBvaW50ID0gbWFwLm1vdXNlRXZlbnRUb0NvbnRhaW5lclBvaW50KGUpLFxyXG5cdFx0ICAgIGxheWVyUG9pbnQgPSBtYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoY29udGFpbmVyUG9pbnQpLFxyXG5cdFx0ICAgIGxhdGxuZyA9IG1hcC5sYXllclBvaW50VG9MYXRMbmcobGF5ZXJQb2ludCk7XHJcblxyXG5cdFx0dGhpcy5maXJlKGUudHlwZSwge1xyXG5cdFx0XHRsYXRsbmc6IGxhdGxuZyxcclxuXHRcdFx0bGF5ZXJQb2ludDogbGF5ZXJQb2ludCxcclxuXHRcdFx0Y29udGFpbmVyUG9pbnQ6IGNvbnRhaW5lclBvaW50LFxyXG5cdFx0XHRvcmlnaW5hbEV2ZW50OiBlXHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAoZS50eXBlID09PSAnY29udGV4dG1lbnUnKSB7XHJcblx0XHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZS50eXBlICE9PSAnbW91c2Vtb3ZlJykge1xyXG5cdFx0XHRMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbihlKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxuTC5NYXAuaW5jbHVkZSh7XHJcblx0X2luaXRQYXRoUm9vdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9wYXRoUm9vdCkge1xyXG5cdFx0XHR0aGlzLl9wYXRoUm9vdCA9IEwuUGF0aC5wcm90b3R5cGUuX2NyZWF0ZUVsZW1lbnQoJ3N2ZycpO1xyXG5cdFx0XHR0aGlzLl9wYW5lcy5vdmVybGF5UGFuZS5hcHBlbmRDaGlsZCh0aGlzLl9wYXRoUm9vdCk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLnpvb21BbmltYXRpb24gJiYgTC5Ccm93c2VyLmFueTNkKSB7XHJcblx0XHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3BhdGhSb290LCAnbGVhZmxldC16b29tLWFuaW1hdGVkJyk7XHJcblxyXG5cdFx0XHRcdHRoaXMub24oe1xyXG5cdFx0XHRcdFx0J3pvb21hbmltJzogdGhpcy5fYW5pbWF0ZVBhdGhab29tLFxyXG5cdFx0XHRcdFx0J3pvb21lbmQnOiB0aGlzLl9lbmRQYXRoWm9vbVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9wYXRoUm9vdCwgJ2xlYWZsZXQtem9vbS1oaWRlJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMub24oJ21vdmVlbmQnLCB0aGlzLl91cGRhdGVTdmdWaWV3cG9ydCk7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVN2Z1ZpZXdwb3J0KCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2FuaW1hdGVQYXRoWm9vbTogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHZhciBzY2FsZSA9IHRoaXMuZ2V0Wm9vbVNjYWxlKGUuem9vbSksXHJcblx0XHQgICAgb2Zmc2V0ID0gdGhpcy5fZ2V0Q2VudGVyT2Zmc2V0KGUuY2VudGVyKS5fbXVsdGlwbHlCeSgtc2NhbGUpLl9hZGQodGhpcy5fcGF0aFZpZXdwb3J0Lm1pbik7XHJcblxyXG5cdFx0dGhpcy5fcGF0aFJvb3Quc3R5bGVbTC5Eb21VdGlsLlRSQU5TRk9STV0gPVxyXG5cdFx0ICAgICAgICBMLkRvbVV0aWwuZ2V0VHJhbnNsYXRlU3RyaW5nKG9mZnNldCkgKyAnIHNjYWxlKCcgKyBzY2FsZSArICcpICc7XHJcblxyXG5cdFx0dGhpcy5fcGF0aFpvb21pbmcgPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdF9lbmRQYXRoWm9vbTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fcGF0aFpvb21pbmcgPSBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlU3ZnVmlld3BvcnQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5fcGF0aFpvb21pbmcpIHtcclxuXHRcdFx0Ly8gRG8gbm90IHVwZGF0ZSBTVkdzIHdoaWxlIGEgem9vbSBhbmltYXRpb24gaXMgZ29pbmcgb24gb3RoZXJ3aXNlIHRoZSBhbmltYXRpb24gd2lsbCBicmVhay5cclxuXHRcdFx0Ly8gV2hlbiB0aGUgem9vbSBhbmltYXRpb24gZW5kcyB3ZSB3aWxsIGJlIHVwZGF0ZWQgYWdhaW4gYW55d2F5XHJcblx0XHRcdC8vIFRoaXMgZml4ZXMgdGhlIGNhc2Ugd2hlcmUgeW91IGRvIGEgbW9tZW50dW0gbW92ZSBhbmQgem9vbSB3aGlsZSB0aGUgbW92ZSBpcyBzdGlsbCBvbmdvaW5nLlxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlUGF0aFZpZXdwb3J0KCk7XHJcblxyXG5cdFx0dmFyIHZwID0gdGhpcy5fcGF0aFZpZXdwb3J0LFxyXG5cdFx0ICAgIG1pbiA9IHZwLm1pbixcclxuXHRcdCAgICBtYXggPSB2cC5tYXgsXHJcblx0XHQgICAgd2lkdGggPSBtYXgueCAtIG1pbi54LFxyXG5cdFx0ICAgIGhlaWdodCA9IG1heC55IC0gbWluLnksXHJcblx0XHQgICAgcm9vdCA9IHRoaXMuX3BhdGhSb290LFxyXG5cdFx0ICAgIHBhbmUgPSB0aGlzLl9wYW5lcy5vdmVybGF5UGFuZTtcclxuXHJcblx0XHQvLyBIYWNrIHRvIG1ha2UgZmxpY2tlciBvbiBkcmFnIGVuZCBvbiBtb2JpbGUgd2Via2l0IGxlc3MgaXJyaXRhdGluZ1xyXG5cdFx0aWYgKEwuQnJvd3Nlci5tb2JpbGVXZWJraXQpIHtcclxuXHRcdFx0cGFuZS5yZW1vdmVDaGlsZChyb290KTtcclxuXHRcdH1cclxuXHJcblx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24ocm9vdCwgbWluKTtcclxuXHRcdHJvb3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIHdpZHRoKTtcclxuXHRcdHJvb3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBoZWlnaHQpO1xyXG5cdFx0cm9vdC5zZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnLCBbbWluLngsIG1pbi55LCB3aWR0aCwgaGVpZ2h0XS5qb2luKCcgJykpO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIubW9iaWxlV2Via2l0KSB7XHJcblx0XHRcdHBhbmUuYXBwZW5kQ2hpbGQocm9vdCk7XHJcblx0XHR9XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIFBvcHVwIGV4dGVuc2lvbiB0byBMLlBhdGggKHBvbHlsaW5lcywgcG9seWdvbnMsIGNpcmNsZXMpLCBhZGRpbmcgcG9wdXAtcmVsYXRlZCBtZXRob2RzLlxyXG4gKi9cclxuXHJcbkwuUGF0aC5pbmNsdWRlKHtcclxuXHJcblx0YmluZFBvcHVwOiBmdW5jdGlvbiAoY29udGVudCwgb3B0aW9ucykge1xyXG5cclxuXHRcdGlmIChjb250ZW50IGluc3RhbmNlb2YgTC5Qb3B1cCkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cCA9IGNvbnRlbnQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoIXRoaXMuX3BvcHVwIHx8IG9wdGlvbnMpIHtcclxuXHRcdFx0XHR0aGlzLl9wb3B1cCA9IG5ldyBMLlBvcHVwKG9wdGlvbnMsIHRoaXMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX3BvcHVwLnNldENvbnRlbnQoY29udGVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9wb3B1cEhhbmRsZXJzQWRkZWQpIHtcclxuXHRcdFx0dGhpc1xyXG5cdFx0XHQgICAgLm9uKCdjbGljaycsIHRoaXMuX29wZW5Qb3B1cCwgdGhpcylcclxuXHRcdFx0ICAgIC5vbigncmVtb3ZlJywgdGhpcy5jbG9zZVBvcHVwLCB0aGlzKTtcclxuXHJcblx0XHRcdHRoaXMuX3BvcHVwSGFuZGxlcnNBZGRlZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0dW5iaW5kUG9wdXA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9wb3B1cCkge1xyXG5cdFx0XHR0aGlzLl9wb3B1cCA9IG51bGw7XHJcblx0XHRcdHRoaXNcclxuXHRcdFx0ICAgIC5vZmYoJ2NsaWNrJywgdGhpcy5fb3BlblBvcHVwKVxyXG5cdFx0XHQgICAgLm9mZigncmVtb3ZlJywgdGhpcy5jbG9zZVBvcHVwKTtcclxuXHJcblx0XHRcdHRoaXMuX3BvcHVwSGFuZGxlcnNBZGRlZCA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0b3BlblBvcHVwOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdC8vIG9wZW4gdGhlIHBvcHVwIGZyb20gb25lIG9mIHRoZSBwYXRoJ3MgcG9pbnRzIGlmIG5vdCBzcGVjaWZpZWRcclxuXHRcdFx0bGF0bG5nID0gbGF0bG5nIHx8IHRoaXMuX2xhdGxuZyB8fFxyXG5cdFx0XHQgICAgICAgICB0aGlzLl9sYXRsbmdzW01hdGguZmxvb3IodGhpcy5fbGF0bG5ncy5sZW5ndGggLyAyKV07XHJcblxyXG5cdFx0XHR0aGlzLl9vcGVuUG9wdXAoe2xhdGxuZzogbGF0bG5nfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0Y2xvc2VQb3B1cDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BvcHVwKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwLl9jbG9zZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X29wZW5Qb3B1cDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHRoaXMuX3BvcHVwLnNldExhdExuZyhlLmxhdGxuZyk7XHJcblx0XHR0aGlzLl9tYXAub3BlblBvcHVwKHRoaXMuX3BvcHVwKTtcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcclxuICogVmVjdG9yIHJlbmRlcmluZyBmb3IgSUU2LTggdGhyb3VnaCBWTUwuXHJcbiAqIFRoYW5rcyB0byBEbWl0cnkgQmFyYW5vdnNreSBhbmQgaGlzIFJhcGhhZWwgbGlicmFyeSBmb3IgaW5zcGlyYXRpb24hXHJcbiAqL1xyXG5cclxuTC5Ccm93c2VyLnZtbCA9ICFMLkJyb3dzZXIuc3ZnICYmIChmdW5jdGlvbiAoKSB7XHJcblx0dHJ5IHtcclxuXHRcdHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdGRpdi5pbm5lckhUTUwgPSAnPHY6c2hhcGUgYWRqPVwiMVwiLz4nO1xyXG5cclxuXHRcdHZhciBzaGFwZSA9IGRpdi5maXJzdENoaWxkO1xyXG5cdFx0c2hhcGUuc3R5bGUuYmVoYXZpb3IgPSAndXJsKCNkZWZhdWx0I1ZNTCknO1xyXG5cclxuXHRcdHJldHVybiBzaGFwZSAmJiAodHlwZW9mIHNoYXBlLmFkaiA9PT0gJ29iamVjdCcpO1xyXG5cclxuXHR9IGNhdGNoIChlKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG59KCkpO1xyXG5cclxuTC5QYXRoID0gTC5Ccm93c2VyLnN2ZyB8fCAhTC5Ccm93c2VyLnZtbCA/IEwuUGF0aCA6IEwuUGF0aC5leHRlbmQoe1xyXG5cdHN0YXRpY3M6IHtcclxuXHRcdFZNTDogdHJ1ZSxcclxuXHRcdENMSVBfUEFERElORzogMC4wMlxyXG5cdH0sXHJcblxyXG5cdF9jcmVhdGVFbGVtZW50OiAoZnVuY3Rpb24gKCkge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0ZG9jdW1lbnQubmFtZXNwYWNlcy5hZGQoJ2x2bWwnLCAndXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTp2bWwnKTtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIChuYW1lKSB7XHJcblx0XHRcdFx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJzxsdm1sOicgKyBuYW1lICsgJyBjbGFzcz1cImx2bWxcIj4nKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIChuYW1lKSB7XHJcblx0XHRcdFx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXHJcblx0XHRcdFx0ICAgICAgICAnPCcgKyBuYW1lICsgJyB4bWxucz1cInVybjpzY2hlbWFzLW1pY3Jvc29mdC5jb206dm1sXCIgY2xhc3M9XCJsdm1sXCI+Jyk7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fSgpKSxcclxuXHJcblx0X2luaXRQYXRoOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgY29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyID0gdGhpcy5fY3JlYXRlRWxlbWVudCgnc2hhcGUnKTtcclxuXHJcblx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MoY29udGFpbmVyLCAnbGVhZmxldC12bWwtc2hhcGUnICtcclxuXHRcdFx0KHRoaXMub3B0aW9ucy5jbGFzc05hbWUgPyAnICcgKyB0aGlzLm9wdGlvbnMuY2xhc3NOYW1lIDogJycpKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmNsaWNrYWJsZSkge1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MoY29udGFpbmVyLCAnbGVhZmxldC1jbGlja2FibGUnKTtcclxuXHRcdH1cclxuXHJcblx0XHRjb250YWluZXIuY29vcmRzaXplID0gJzEgMSc7XHJcblxyXG5cdFx0dGhpcy5fcGF0aCA9IHRoaXMuX2NyZWF0ZUVsZW1lbnQoJ3BhdGgnKTtcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9wYXRoKTtcclxuXHJcblx0XHR0aGlzLl9tYXAuX3BhdGhSb290LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XHJcblx0fSxcclxuXHJcblx0X2luaXRTdHlsZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fdXBkYXRlU3R5bGUoKTtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlU3R5bGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBzdHJva2UgPSB0aGlzLl9zdHJva2UsXHJcblx0XHQgICAgZmlsbCA9IHRoaXMuX2ZpbGwsXHJcblx0XHQgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcclxuXHRcdCAgICBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXI7XHJcblxyXG5cdFx0Y29udGFpbmVyLnN0cm9rZWQgPSBvcHRpb25zLnN0cm9rZTtcclxuXHRcdGNvbnRhaW5lci5maWxsZWQgPSBvcHRpb25zLmZpbGw7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuc3Ryb2tlKSB7XHJcblx0XHRcdGlmICghc3Ryb2tlKSB7XHJcblx0XHRcdFx0c3Ryb2tlID0gdGhpcy5fc3Ryb2tlID0gdGhpcy5fY3JlYXRlRWxlbWVudCgnc3Ryb2tlJyk7XHJcblx0XHRcdFx0c3Ryb2tlLmVuZGNhcCA9ICdyb3VuZCc7XHJcblx0XHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHN0cm9rZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0c3Ryb2tlLndlaWdodCA9IG9wdGlvbnMud2VpZ2h0ICsgJ3B4JztcclxuXHRcdFx0c3Ryb2tlLmNvbG9yID0gb3B0aW9ucy5jb2xvcjtcclxuXHRcdFx0c3Ryb2tlLm9wYWNpdHkgPSBvcHRpb25zLm9wYWNpdHk7XHJcblxyXG5cdFx0XHRpZiAob3B0aW9ucy5kYXNoQXJyYXkpIHtcclxuXHRcdFx0XHRzdHJva2UuZGFzaFN0eWxlID0gTC5VdGlsLmlzQXJyYXkob3B0aW9ucy5kYXNoQXJyYXkpID9cclxuXHRcdFx0XHQgICAgb3B0aW9ucy5kYXNoQXJyYXkuam9pbignICcpIDpcclxuXHRcdFx0XHQgICAgb3B0aW9ucy5kYXNoQXJyYXkucmVwbGFjZSgvKCAqLCAqKS9nLCAnICcpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHN0cm9rZS5kYXNoU3R5bGUgPSAnJztcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAob3B0aW9ucy5saW5lQ2FwKSB7XHJcblx0XHRcdFx0c3Ryb2tlLmVuZGNhcCA9IG9wdGlvbnMubGluZUNhcC5yZXBsYWNlKCdidXR0JywgJ2ZsYXQnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAob3B0aW9ucy5saW5lSm9pbikge1xyXG5cdFx0XHRcdHN0cm9rZS5qb2luc3R5bGUgPSBvcHRpb25zLmxpbmVKb2luO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSBlbHNlIGlmIChzdHJva2UpIHtcclxuXHRcdFx0Y29udGFpbmVyLnJlbW92ZUNoaWxkKHN0cm9rZSk7XHJcblx0XHRcdHRoaXMuX3N0cm9rZSA9IG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuZmlsbCkge1xyXG5cdFx0XHRpZiAoIWZpbGwpIHtcclxuXHRcdFx0XHRmaWxsID0gdGhpcy5fZmlsbCA9IHRoaXMuX2NyZWF0ZUVsZW1lbnQoJ2ZpbGwnKTtcclxuXHRcdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoZmlsbCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZmlsbC5jb2xvciA9IG9wdGlvbnMuZmlsbENvbG9yIHx8IG9wdGlvbnMuY29sb3I7XHJcblx0XHRcdGZpbGwub3BhY2l0eSA9IG9wdGlvbnMuZmlsbE9wYWNpdHk7XHJcblxyXG5cdFx0fSBlbHNlIGlmIChmaWxsKSB7XHJcblx0XHRcdGNvbnRhaW5lci5yZW1vdmVDaGlsZChmaWxsKTtcclxuXHRcdFx0dGhpcy5fZmlsbCA9IG51bGw7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBzdHlsZSA9IHRoaXMuX2NvbnRhaW5lci5zdHlsZTtcclxuXHJcblx0XHRzdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cdFx0dGhpcy5fcGF0aC52ID0gdGhpcy5nZXRQYXRoU3RyaW5nKCkgKyAnICc7IC8vIHRoZSBzcGFjZSBmaXhlcyBJRSBlbXB0eSBwYXRoIHN0cmluZyBidWdcclxuXHRcdHN0eWxlLmRpc3BsYXkgPSAnJztcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5NYXAuaW5jbHVkZShMLkJyb3dzZXIuc3ZnIHx8ICFMLkJyb3dzZXIudm1sID8ge30gOiB7XHJcblx0X2luaXRQYXRoUm9vdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX3BhdGhSb290KSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciByb290ID0gdGhpcy5fcGF0aFJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdHJvb3QuY2xhc3NOYW1lID0gJ2xlYWZsZXQtdm1sLWNvbnRhaW5lcic7XHJcblx0XHR0aGlzLl9wYW5lcy5vdmVybGF5UGFuZS5hcHBlbmRDaGlsZChyb290KTtcclxuXHJcblx0XHR0aGlzLm9uKCdtb3ZlZW5kJywgdGhpcy5fdXBkYXRlUGF0aFZpZXdwb3J0KTtcclxuXHRcdHRoaXMuX3VwZGF0ZVBhdGhWaWV3cG9ydCgpO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBWZWN0b3IgcmVuZGVyaW5nIGZvciBhbGwgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IGNhbnZhcy5cclxuICovXHJcblxyXG5MLkJyb3dzZXIuY2FudmFzID0gKGZ1bmN0aW9uICgpIHtcclxuXHRyZXR1cm4gISFkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0O1xyXG59KCkpO1xyXG5cclxuTC5QYXRoID0gKEwuUGF0aC5TVkcgJiYgIXdpbmRvdy5MX1BSRUZFUl9DQU5WQVMpIHx8ICFMLkJyb3dzZXIuY2FudmFzID8gTC5QYXRoIDogTC5QYXRoLmV4dGVuZCh7XHJcblx0c3RhdGljczoge1xyXG5cdFx0Ly9DTElQX1BBRERJTkc6IDAuMDIsIC8vIG5vdCBzdXJlIGlmIHRoZXJlJ3MgYSBuZWVkIHRvIHNldCBpdCB0byBhIHNtYWxsIHZhbHVlXHJcblx0XHRDQU5WQVM6IHRydWUsXHJcblx0XHRTVkc6IGZhbHNlXHJcblx0fSxcclxuXHJcblx0cmVkcmF3OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMucHJvamVjdExhdGxuZ3MoKTtcclxuXHRcdFx0dGhpcy5fcmVxdWVzdFVwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0U3R5bGU6IGZ1bmN0aW9uIChzdHlsZSkge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIHN0eWxlKTtcclxuXHJcblx0XHRpZiAodGhpcy5fbWFwKSB7XHJcblx0XHRcdHRoaXMuX3VwZGF0ZVN0eWxlKCk7XHJcblx0XHRcdHRoaXMuX3JlcXVlc3RVcGRhdGUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHRtYXBcclxuXHRcdCAgICAub2ZmKCd2aWV3cmVzZXQnLCB0aGlzLnByb2plY3RMYXRsbmdzLCB0aGlzKVxyXG5cdFx0ICAgIC5vZmYoJ21vdmVlbmQnLCB0aGlzLl91cGRhdGVQYXRoLCB0aGlzKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmNsaWNrYWJsZSkge1xyXG5cdFx0XHR0aGlzLl9tYXAub2ZmKCdjbGljaycsIHRoaXMuX29uQ2xpY2ssIHRoaXMpO1xyXG5cdFx0XHR0aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcmVxdWVzdFVwZGF0ZSgpO1xyXG5cclxuXHRcdHRoaXMuX21hcCA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0X3JlcXVlc3RVcGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9tYXAgJiYgIUwuUGF0aC5fdXBkYXRlUmVxdWVzdCkge1xyXG5cdFx0XHRMLlBhdGguX3VwZGF0ZVJlcXVlc3QgPSBMLlV0aWwucmVxdWVzdEFuaW1GcmFtZSh0aGlzLl9maXJlTWFwTW92ZUVuZCwgdGhpcy5fbWFwKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfZmlyZU1hcE1vdmVFbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuUGF0aC5fdXBkYXRlUmVxdWVzdCA9IG51bGw7XHJcblx0XHR0aGlzLmZpcmUoJ21vdmVlbmQnKTtcclxuXHR9LFxyXG5cclxuXHRfaW5pdEVsZW1lbnRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl9tYXAuX2luaXRQYXRoUm9vdCgpO1xyXG5cdFx0dGhpcy5fY3R4ID0gdGhpcy5fbWFwLl9jYW52YXNDdHg7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVN0eWxlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHJcblx0XHRpZiAob3B0aW9ucy5zdHJva2UpIHtcclxuXHRcdFx0dGhpcy5fY3R4LmxpbmVXaWR0aCA9IG9wdGlvbnMud2VpZ2h0O1xyXG5cdFx0XHR0aGlzLl9jdHguc3Ryb2tlU3R5bGUgPSBvcHRpb25zLmNvbG9yO1xyXG5cdFx0fVxyXG5cdFx0aWYgKG9wdGlvbnMuZmlsbCkge1xyXG5cdFx0XHR0aGlzLl9jdHguZmlsbFN0eWxlID0gb3B0aW9ucy5maWxsQ29sb3IgfHwgb3B0aW9ucy5jb2xvcjtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfZHJhd1BhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBpLCBqLCBsZW4sIGxlbjIsIHBvaW50LCBkcmF3TWV0aG9kO1xyXG5cclxuXHRcdHRoaXMuX2N0eC5iZWdpblBhdGgoKTtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSB0aGlzLl9wYXJ0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRmb3IgKGogPSAwLCBsZW4yID0gdGhpcy5fcGFydHNbaV0ubGVuZ3RoOyBqIDwgbGVuMjsgaisrKSB7XHJcblx0XHRcdFx0cG9pbnQgPSB0aGlzLl9wYXJ0c1tpXVtqXTtcclxuXHRcdFx0XHRkcmF3TWV0aG9kID0gKGogPT09IDAgPyAnbW92ZScgOiAnbGluZScpICsgJ1RvJztcclxuXHJcblx0XHRcdFx0dGhpcy5fY3R4W2RyYXdNZXRob2RdKHBvaW50LngsIHBvaW50LnkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vIFRPRE8gcmVmYWN0b3IgdWdseSBoYWNrXHJcblx0XHRcdGlmICh0aGlzIGluc3RhbmNlb2YgTC5Qb2x5Z29uKSB7XHJcblx0XHRcdFx0dGhpcy5fY3R4LmNsb3NlUGF0aCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2NoZWNrSWZFbXB0eTogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuICF0aGlzLl9wYXJ0cy5sZW5ndGg7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICh0aGlzLl9jaGVja0lmRW1wdHkoKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHR2YXIgY3R4ID0gdGhpcy5fY3R4LFxyXG5cdFx0ICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG5cdFx0dGhpcy5fZHJhd1BhdGgoKTtcclxuXHRcdGN0eC5zYXZlKCk7XHJcblx0XHR0aGlzLl91cGRhdGVTdHlsZSgpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLmZpbGwpIHtcclxuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gb3B0aW9ucy5maWxsT3BhY2l0eTtcclxuXHRcdFx0Y3R4LmZpbGwoKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAob3B0aW9ucy5zdHJva2UpIHtcclxuXHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gb3B0aW9ucy5vcGFjaXR5O1xyXG5cdFx0XHRjdHguc3Ryb2tlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Y3R4LnJlc3RvcmUoKTtcclxuXHJcblx0XHQvLyBUT0RPIG9wdGltaXphdGlvbjogMSBmaWxsL3N0cm9rZSBmb3IgYWxsIGZlYXR1cmVzIHdpdGggZXF1YWwgc3R5bGUgaW5zdGVhZCBvZiAxIGZvciBlYWNoIGZlYXR1cmVcclxuXHR9LFxyXG5cclxuXHRfaW5pdEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5jbGlja2FibGUpIHtcclxuXHRcdFx0Ly8gVE9ETyBkYmxjbGlja1xyXG5cdFx0XHR0aGlzLl9tYXAub24oJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcclxuXHRcdFx0dGhpcy5fbWFwLm9uKCdjbGljaycsIHRoaXMuX29uQ2xpY2ssIHRoaXMpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9vbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKHRoaXMuX2NvbnRhaW5zUG9pbnQoZS5sYXllclBvaW50KSkge1xyXG5cdFx0XHR0aGlzLmZpcmUoJ2NsaWNrJywgZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X29uTW91c2VNb3ZlOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKCF0aGlzLl9tYXAgfHwgdGhpcy5fbWFwLl9hbmltYXRpbmdab29tKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIFRPRE8gZG9uJ3QgZG8gb24gZWFjaCBtb3ZlXHJcblx0XHRpZiAodGhpcy5fY29udGFpbnNQb2ludChlLmxheWVyUG9pbnQpKSB7XHJcblx0XHRcdHRoaXMuX2N0eC5jYW52YXMuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG5cdFx0XHR0aGlzLl9tb3VzZUluc2lkZSA9IHRydWU7XHJcblx0XHRcdHRoaXMuZmlyZSgnbW91c2VvdmVyJywgZSk7XHJcblxyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl9tb3VzZUluc2lkZSkge1xyXG5cdFx0XHR0aGlzLl9jdHguY2FudmFzLnN0eWxlLmN1cnNvciA9ICcnO1xyXG5cdFx0XHR0aGlzLl9tb3VzZUluc2lkZSA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLmZpcmUoJ21vdXNlb3V0JywgZSk7XHJcblx0XHR9XHJcblx0fVxyXG59KTtcclxuXHJcbkwuTWFwLmluY2x1ZGUoKEwuUGF0aC5TVkcgJiYgIXdpbmRvdy5MX1BSRUZFUl9DQU5WQVMpIHx8ICFMLkJyb3dzZXIuY2FudmFzID8ge30gOiB7XHJcblx0X2luaXRQYXRoUm9vdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHJvb3QgPSB0aGlzLl9wYXRoUm9vdCxcclxuXHRcdCAgICBjdHg7XHJcblxyXG5cdFx0aWYgKCFyb290KSB7XHJcblx0XHRcdHJvb3QgPSB0aGlzLl9wYXRoUm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cdFx0XHRyb290LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuXHRcdFx0Y3R4ID0gdGhpcy5fY2FudmFzQ3R4ID0gcm9vdC5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuXHRcdFx0Y3R4LmxpbmVDYXAgPSAncm91bmQnO1xyXG5cdFx0XHRjdHgubGluZUpvaW4gPSAncm91bmQnO1xyXG5cclxuXHRcdFx0dGhpcy5fcGFuZXMub3ZlcmxheVBhbmUuYXBwZW5kQ2hpbGQocm9vdCk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLnpvb21BbmltYXRpb24pIHtcclxuXHRcdFx0XHR0aGlzLl9wYXRoUm9vdC5jbGFzc05hbWUgPSAnbGVhZmxldC16b29tLWFuaW1hdGVkJztcclxuXHRcdFx0XHR0aGlzLm9uKCd6b29tYW5pbScsIHRoaXMuX2FuaW1hdGVQYXRoWm9vbSk7XHJcblx0XHRcdFx0dGhpcy5vbignem9vbWVuZCcsIHRoaXMuX2VuZFBhdGhab29tKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLm9uKCdtb3ZlZW5kJywgdGhpcy5fdXBkYXRlQ2FudmFzVmlld3BvcnQpO1xyXG5cdFx0XHR0aGlzLl91cGRhdGVDYW52YXNWaWV3cG9ydCgpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVDYW52YXNWaWV3cG9ydDogZnVuY3Rpb24gKCkge1xyXG5cdFx0Ly8gZG9uJ3QgcmVkcmF3IHdoaWxlIHpvb21pbmcuIFNlZSBfdXBkYXRlU3ZnVmlld3BvcnQgZm9yIG1vcmUgZGV0YWlsc1xyXG5cdFx0aWYgKHRoaXMuX3BhdGhab29taW5nKSB7IHJldHVybjsgfVxyXG5cdFx0dGhpcy5fdXBkYXRlUGF0aFZpZXdwb3J0KCk7XHJcblxyXG5cdFx0dmFyIHZwID0gdGhpcy5fcGF0aFZpZXdwb3J0LFxyXG5cdFx0ICAgIG1pbiA9IHZwLm1pbixcclxuXHRcdCAgICBzaXplID0gdnAubWF4LnN1YnRyYWN0KG1pbiksXHJcblx0XHQgICAgcm9vdCA9IHRoaXMuX3BhdGhSb290O1xyXG5cclxuXHRcdC8vVE9ETyBjaGVjayBpZiB0aGlzIHdvcmtzIHByb3Blcmx5IG9uIG1vYmlsZSB3ZWJraXRcclxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbihyb290LCBtaW4pO1xyXG5cdFx0cm9vdC53aWR0aCA9IHNpemUueDtcclxuXHRcdHJvb3QuaGVpZ2h0ID0gc2l6ZS55O1xyXG5cdFx0cm9vdC5nZXRDb250ZXh0KCcyZCcpLnRyYW5zbGF0ZSgtbWluLngsIC1taW4ueSk7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXHJcbiAqIEwuTGluZVV0aWwgY29udGFpbnMgZGlmZmVyZW50IHV0aWxpdHkgZnVuY3Rpb25zIGZvciBsaW5lIHNlZ21lbnRzXHJcbiAqIGFuZCBwb2x5bGluZXMgKGNsaXBwaW5nLCBzaW1wbGlmaWNhdGlvbiwgZGlzdGFuY2VzLCBldGMuKVxyXG4gKi9cclxuXHJcbi8qanNoaW50IGJpdHdpc2U6ZmFsc2UgKi8gLy8gYWxsb3cgYml0d2lzZSBvcGVyYXRpb25zIGZvciB0aGlzIGZpbGVcclxuXHJcbkwuTGluZVV0aWwgPSB7XHJcblxyXG5cdC8vIFNpbXBsaWZ5IHBvbHlsaW5lIHdpdGggdmVydGV4IHJlZHVjdGlvbiBhbmQgRG91Z2xhcy1QZXVja2VyIHNpbXBsaWZpY2F0aW9uLlxyXG5cdC8vIEltcHJvdmVzIHJlbmRlcmluZyBwZXJmb3JtYW5jZSBkcmFtYXRpY2FsbHkgYnkgbGVzc2VuaW5nIHRoZSBudW1iZXIgb2YgcG9pbnRzIHRvIGRyYXcuXHJcblxyXG5cdHNpbXBsaWZ5OiBmdW5jdGlvbiAoLypQb2ludFtdKi8gcG9pbnRzLCAvKk51bWJlciovIHRvbGVyYW5jZSkge1xyXG5cdFx0aWYgKCF0b2xlcmFuY2UgfHwgIXBvaW50cy5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIHBvaW50cy5zbGljZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBzcVRvbGVyYW5jZSA9IHRvbGVyYW5jZSAqIHRvbGVyYW5jZTtcclxuXHJcblx0XHQvLyBzdGFnZSAxOiB2ZXJ0ZXggcmVkdWN0aW9uXHJcblx0XHRwb2ludHMgPSB0aGlzLl9yZWR1Y2VQb2ludHMocG9pbnRzLCBzcVRvbGVyYW5jZSk7XHJcblxyXG5cdFx0Ly8gc3RhZ2UgMjogRG91Z2xhcy1QZXVja2VyIHNpbXBsaWZpY2F0aW9uXHJcblx0XHRwb2ludHMgPSB0aGlzLl9zaW1wbGlmeURQKHBvaW50cywgc3FUb2xlcmFuY2UpO1xyXG5cclxuXHRcdHJldHVybiBwb2ludHM7XHJcblx0fSxcclxuXHJcblx0Ly8gZGlzdGFuY2UgZnJvbSBhIHBvaW50IHRvIGEgc2VnbWVudCBiZXR3ZWVuIHR3byBwb2ludHNcclxuXHRwb2ludFRvU2VnbWVudERpc3RhbmNlOiAgZnVuY3Rpb24gKC8qUG9pbnQqLyBwLCAvKlBvaW50Ki8gcDEsIC8qUG9pbnQqLyBwMikge1xyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh0aGlzLl9zcUNsb3Nlc3RQb2ludE9uU2VnbWVudChwLCBwMSwgcDIsIHRydWUpKTtcclxuXHR9LFxyXG5cclxuXHRjbG9zZXN0UG9pbnRPblNlZ21lbnQ6IGZ1bmN0aW9uICgvKlBvaW50Ki8gcCwgLypQb2ludCovIHAxLCAvKlBvaW50Ki8gcDIpIHtcclxuXHRcdHJldHVybiB0aGlzLl9zcUNsb3Nlc3RQb2ludE9uU2VnbWVudChwLCBwMSwgcDIpO1xyXG5cdH0sXHJcblxyXG5cdC8vIERvdWdsYXMtUGV1Y2tlciBzaW1wbGlmaWNhdGlvbiwgc2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRG91Z2xhcy1QZXVja2VyX2FsZ29yaXRobVxyXG5cdF9zaW1wbGlmeURQOiBmdW5jdGlvbiAocG9pbnRzLCBzcVRvbGVyYW5jZSkge1xyXG5cclxuXHRcdHZhciBsZW4gPSBwb2ludHMubGVuZ3RoLFxyXG5cdFx0ICAgIEFycmF5Q29uc3RydWN0b3IgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gdW5kZWZpbmVkICsgJycgPyBVaW50OEFycmF5IDogQXJyYXksXHJcblx0XHQgICAgbWFya2VycyA9IG5ldyBBcnJheUNvbnN0cnVjdG9yKGxlbik7XHJcblxyXG5cdFx0bWFya2Vyc1swXSA9IG1hcmtlcnNbbGVuIC0gMV0gPSAxO1xyXG5cclxuXHRcdHRoaXMuX3NpbXBsaWZ5RFBTdGVwKHBvaW50cywgbWFya2Vycywgc3FUb2xlcmFuY2UsIDAsIGxlbiAtIDEpO1xyXG5cclxuXHRcdHZhciBpLFxyXG5cdFx0ICAgIG5ld1BvaW50cyA9IFtdO1xyXG5cclxuXHRcdGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRpZiAobWFya2Vyc1tpXSkge1xyXG5cdFx0XHRcdG5ld1BvaW50cy5wdXNoKHBvaW50c1tpXSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbmV3UG9pbnRzO1xyXG5cdH0sXHJcblxyXG5cdF9zaW1wbGlmeURQU3RlcDogZnVuY3Rpb24gKHBvaW50cywgbWFya2Vycywgc3FUb2xlcmFuY2UsIGZpcnN0LCBsYXN0KSB7XHJcblxyXG5cdFx0dmFyIG1heFNxRGlzdCA9IDAsXHJcblx0XHQgICAgaW5kZXgsIGksIHNxRGlzdDtcclxuXHJcblx0XHRmb3IgKGkgPSBmaXJzdCArIDE7IGkgPD0gbGFzdCAtIDE7IGkrKykge1xyXG5cdFx0XHRzcURpc3QgPSB0aGlzLl9zcUNsb3Nlc3RQb2ludE9uU2VnbWVudChwb2ludHNbaV0sIHBvaW50c1tmaXJzdF0sIHBvaW50c1tsYXN0XSwgdHJ1ZSk7XHJcblxyXG5cdFx0XHRpZiAoc3FEaXN0ID4gbWF4U3FEaXN0KSB7XHJcblx0XHRcdFx0aW5kZXggPSBpO1xyXG5cdFx0XHRcdG1heFNxRGlzdCA9IHNxRGlzdDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChtYXhTcURpc3QgPiBzcVRvbGVyYW5jZSkge1xyXG5cdFx0XHRtYXJrZXJzW2luZGV4XSA9IDE7XHJcblxyXG5cdFx0XHR0aGlzLl9zaW1wbGlmeURQU3RlcChwb2ludHMsIG1hcmtlcnMsIHNxVG9sZXJhbmNlLCBmaXJzdCwgaW5kZXgpO1xyXG5cdFx0XHR0aGlzLl9zaW1wbGlmeURQU3RlcChwb2ludHMsIG1hcmtlcnMsIHNxVG9sZXJhbmNlLCBpbmRleCwgbGFzdCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Ly8gcmVkdWNlIHBvaW50cyB0aGF0IGFyZSB0b28gY2xvc2UgdG8gZWFjaCBvdGhlciB0byBhIHNpbmdsZSBwb2ludFxyXG5cdF9yZWR1Y2VQb2ludHM6IGZ1bmN0aW9uIChwb2ludHMsIHNxVG9sZXJhbmNlKSB7XHJcblx0XHR2YXIgcmVkdWNlZFBvaW50cyA9IFtwb2ludHNbMF1dO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAxLCBwcmV2ID0gMCwgbGVuID0gcG9pbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdGlmICh0aGlzLl9zcURpc3QocG9pbnRzW2ldLCBwb2ludHNbcHJldl0pID4gc3FUb2xlcmFuY2UpIHtcclxuXHRcdFx0XHRyZWR1Y2VkUG9pbnRzLnB1c2gocG9pbnRzW2ldKTtcclxuXHRcdFx0XHRwcmV2ID0gaTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYgKHByZXYgPCBsZW4gLSAxKSB7XHJcblx0XHRcdHJlZHVjZWRQb2ludHMucHVzaChwb2ludHNbbGVuIC0gMV0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlZHVjZWRQb2ludHM7XHJcblx0fSxcclxuXHJcblx0Ly8gQ29oZW4tU3V0aGVybGFuZCBsaW5lIGNsaXBwaW5nIGFsZ29yaXRobS5cclxuXHQvLyBVc2VkIHRvIGF2b2lkIHJlbmRlcmluZyBwYXJ0cyBvZiBhIHBvbHlsaW5lIHRoYXQgYXJlIG5vdCBjdXJyZW50bHkgdmlzaWJsZS5cclxuXHJcblx0Y2xpcFNlZ21lbnQ6IGZ1bmN0aW9uIChhLCBiLCBib3VuZHMsIHVzZUxhc3RDb2RlKSB7XHJcblx0XHR2YXIgY29kZUEgPSB1c2VMYXN0Q29kZSA/IHRoaXMuX2xhc3RDb2RlIDogdGhpcy5fZ2V0Qml0Q29kZShhLCBib3VuZHMpLFxyXG5cdFx0ICAgIGNvZGVCID0gdGhpcy5fZ2V0Qml0Q29kZShiLCBib3VuZHMpLFxyXG5cclxuXHRcdCAgICBjb2RlT3V0LCBwLCBuZXdDb2RlO1xyXG5cclxuXHRcdC8vIHNhdmUgMm5kIGNvZGUgdG8gYXZvaWQgY2FsY3VsYXRpbmcgaXQgb24gdGhlIG5leHQgc2VnbWVudFxyXG5cdFx0dGhpcy5fbGFzdENvZGUgPSBjb2RlQjtcclxuXHJcblx0XHR3aGlsZSAodHJ1ZSkge1xyXG5cdFx0XHQvLyBpZiBhLGIgaXMgaW5zaWRlIHRoZSBjbGlwIHdpbmRvdyAodHJpdmlhbCBhY2NlcHQpXHJcblx0XHRcdGlmICghKGNvZGVBIHwgY29kZUIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIFthLCBiXTtcclxuXHRcdFx0Ly8gaWYgYSxiIGlzIG91dHNpZGUgdGhlIGNsaXAgd2luZG93ICh0cml2aWFsIHJlamVjdClcclxuXHRcdFx0fSBlbHNlIGlmIChjb2RlQSAmIGNvZGVCKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHQvLyBvdGhlciBjYXNlc1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvZGVPdXQgPSBjb2RlQSB8fCBjb2RlQjtcclxuXHRcdFx0XHRwID0gdGhpcy5fZ2V0RWRnZUludGVyc2VjdGlvbihhLCBiLCBjb2RlT3V0LCBib3VuZHMpO1xyXG5cdFx0XHRcdG5ld0NvZGUgPSB0aGlzLl9nZXRCaXRDb2RlKHAsIGJvdW5kcyk7XHJcblxyXG5cdFx0XHRcdGlmIChjb2RlT3V0ID09PSBjb2RlQSkge1xyXG5cdFx0XHRcdFx0YSA9IHA7XHJcblx0XHRcdFx0XHRjb2RlQSA9IG5ld0NvZGU7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGIgPSBwO1xyXG5cdFx0XHRcdFx0Y29kZUIgPSBuZXdDb2RlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9nZXRFZGdlSW50ZXJzZWN0aW9uOiBmdW5jdGlvbiAoYSwgYiwgY29kZSwgYm91bmRzKSB7XHJcblx0XHR2YXIgZHggPSBiLnggLSBhLngsXHJcblx0XHQgICAgZHkgPSBiLnkgLSBhLnksXHJcblx0XHQgICAgbWluID0gYm91bmRzLm1pbixcclxuXHRcdCAgICBtYXggPSBib3VuZHMubWF4O1xyXG5cclxuXHRcdGlmIChjb2RlICYgOCkgeyAvLyB0b3BcclxuXHRcdFx0cmV0dXJuIG5ldyBMLlBvaW50KGEueCArIGR4ICogKG1heC55IC0gYS55KSAvIGR5LCBtYXgueSk7XHJcblx0XHR9IGVsc2UgaWYgKGNvZGUgJiA0KSB7IC8vIGJvdHRvbVxyXG5cdFx0XHRyZXR1cm4gbmV3IEwuUG9pbnQoYS54ICsgZHggKiAobWluLnkgLSBhLnkpIC8gZHksIG1pbi55KTtcclxuXHRcdH0gZWxzZSBpZiAoY29kZSAmIDIpIHsgLy8gcmlnaHRcclxuXHRcdFx0cmV0dXJuIG5ldyBMLlBvaW50KG1heC54LCBhLnkgKyBkeSAqIChtYXgueCAtIGEueCkgLyBkeCk7XHJcblx0XHR9IGVsc2UgaWYgKGNvZGUgJiAxKSB7IC8vIGxlZnRcclxuXHRcdFx0cmV0dXJuIG5ldyBMLlBvaW50KG1pbi54LCBhLnkgKyBkeSAqIChtaW4ueCAtIGEueCkgLyBkeCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2dldEJpdENvZGU6IGZ1bmN0aW9uICgvKlBvaW50Ki8gcCwgYm91bmRzKSB7XHJcblx0XHR2YXIgY29kZSA9IDA7XHJcblxyXG5cdFx0aWYgKHAueCA8IGJvdW5kcy5taW4ueCkgeyAvLyBsZWZ0XHJcblx0XHRcdGNvZGUgfD0gMTtcclxuXHRcdH0gZWxzZSBpZiAocC54ID4gYm91bmRzLm1heC54KSB7IC8vIHJpZ2h0XHJcblx0XHRcdGNvZGUgfD0gMjtcclxuXHRcdH1cclxuXHRcdGlmIChwLnkgPCBib3VuZHMubWluLnkpIHsgLy8gYm90dG9tXHJcblx0XHRcdGNvZGUgfD0gNDtcclxuXHRcdH0gZWxzZSBpZiAocC55ID4gYm91bmRzLm1heC55KSB7IC8vIHRvcFxyXG5cdFx0XHRjb2RlIHw9IDg7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGNvZGU7XHJcblx0fSxcclxuXHJcblx0Ly8gc3F1YXJlIGRpc3RhbmNlICh0byBhdm9pZCB1bm5lY2Vzc2FyeSBNYXRoLnNxcnQgY2FsbHMpXHJcblx0X3NxRGlzdDogZnVuY3Rpb24gKHAxLCBwMikge1xyXG5cdFx0dmFyIGR4ID0gcDIueCAtIHAxLngsXHJcblx0XHQgICAgZHkgPSBwMi55IC0gcDEueTtcclxuXHRcdHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcclxuXHR9LFxyXG5cclxuXHQvLyByZXR1cm4gY2xvc2VzdCBwb2ludCBvbiBzZWdtZW50IG9yIGRpc3RhbmNlIHRvIHRoYXQgcG9pbnRcclxuXHRfc3FDbG9zZXN0UG9pbnRPblNlZ21lbnQ6IGZ1bmN0aW9uIChwLCBwMSwgcDIsIHNxRGlzdCkge1xyXG5cdFx0dmFyIHggPSBwMS54LFxyXG5cdFx0ICAgIHkgPSBwMS55LFxyXG5cdFx0ICAgIGR4ID0gcDIueCAtIHgsXHJcblx0XHQgICAgZHkgPSBwMi55IC0geSxcclxuXHRcdCAgICBkb3QgPSBkeCAqIGR4ICsgZHkgKiBkeSxcclxuXHRcdCAgICB0O1xyXG5cclxuXHRcdGlmIChkb3QgPiAwKSB7XHJcblx0XHRcdHQgPSAoKHAueCAtIHgpICogZHggKyAocC55IC0geSkgKiBkeSkgLyBkb3Q7XHJcblxyXG5cdFx0XHRpZiAodCA+IDEpIHtcclxuXHRcdFx0XHR4ID0gcDIueDtcclxuXHRcdFx0XHR5ID0gcDIueTtcclxuXHRcdFx0fSBlbHNlIGlmICh0ID4gMCkge1xyXG5cdFx0XHRcdHggKz0gZHggKiB0O1xyXG5cdFx0XHRcdHkgKz0gZHkgKiB0O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZHggPSBwLnggLSB4O1xyXG5cdFx0ZHkgPSBwLnkgLSB5O1xyXG5cclxuXHRcdHJldHVybiBzcURpc3QgPyBkeCAqIGR4ICsgZHkgKiBkeSA6IG5ldyBMLlBvaW50KHgsIHkpO1xyXG5cdH1cclxufTtcclxuXG5cbi8qXHJcbiAqIEwuUG9seWxpbmUgaXMgdXNlZCB0byBkaXNwbGF5IHBvbHlsaW5lcyBvbiBhIG1hcC5cclxuICovXHJcblxyXG5MLlBvbHlsaW5lID0gTC5QYXRoLmV4dGVuZCh7XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGxhdGxuZ3MsIG9wdGlvbnMpIHtcclxuXHRcdEwuUGF0aC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuX2xhdGxuZ3MgPSB0aGlzLl9jb252ZXJ0TGF0TG5ncyhsYXRsbmdzKTtcclxuXHR9LFxyXG5cclxuXHRvcHRpb25zOiB7XHJcblx0XHQvLyBob3cgbXVjaCB0byBzaW1wbGlmeSB0aGUgcG9seWxpbmUgb24gZWFjaCB6b29tIGxldmVsXHJcblx0XHQvLyBtb3JlID0gYmV0dGVyIHBlcmZvcm1hbmNlIGFuZCBzbW9vdGhlciBsb29rLCBsZXNzID0gbW9yZSBhY2N1cmF0ZVxyXG5cdFx0c21vb3RoRmFjdG9yOiAxLjAsXHJcblx0XHRub0NsaXA6IGZhbHNlXHJcblx0fSxcclxuXHJcblx0cHJvamVjdExhdGxuZ3M6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuX29yaWdpbmFsUG9pbnRzID0gW107XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX2xhdGxuZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0dGhpcy5fb3JpZ2luYWxQb2ludHNbaV0gPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KHRoaXMuX2xhdGxuZ3NbaV0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGdldFBhdGhTdHJpbmc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl9wYXJ0cy5sZW5ndGgsIHN0ciA9ICcnOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0c3RyICs9IHRoaXMuX2dldFBhdGhQYXJ0U3RyKHRoaXMuX3BhcnRzW2ldKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBzdHI7XHJcblx0fSxcclxuXHJcblx0Z2V0TGF0TG5nczogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2xhdGxuZ3M7XHJcblx0fSxcclxuXHJcblx0c2V0TGF0TG5nczogZnVuY3Rpb24gKGxhdGxuZ3MpIHtcclxuXHRcdHRoaXMuX2xhdGxuZ3MgPSB0aGlzLl9jb252ZXJ0TGF0TG5ncyhsYXRsbmdzKTtcclxuXHRcdHJldHVybiB0aGlzLnJlZHJhdygpO1xyXG5cdH0sXHJcblxyXG5cdGFkZExhdExuZzogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0dGhpcy5fbGF0bG5ncy5wdXNoKEwubGF0TG5nKGxhdGxuZykpO1xyXG5cdFx0cmV0dXJuIHRoaXMucmVkcmF3KCk7XHJcblx0fSxcclxuXHJcblx0c3BsaWNlTGF0TG5nczogZnVuY3Rpb24gKCkgeyAvLyAoTnVtYmVyIGluZGV4LCBOdW1iZXIgaG93TWFueSlcclxuXHRcdHZhciByZW1vdmVkID0gW10uc3BsaWNlLmFwcGx5KHRoaXMuX2xhdGxuZ3MsIGFyZ3VtZW50cyk7XHJcblx0XHR0aGlzLl9jb252ZXJ0TGF0TG5ncyh0aGlzLl9sYXRsbmdzLCB0cnVlKTtcclxuXHRcdHRoaXMucmVkcmF3KCk7XHJcblx0XHRyZXR1cm4gcmVtb3ZlZDtcclxuXHR9LFxyXG5cclxuXHRjbG9zZXN0TGF5ZXJQb2ludDogZnVuY3Rpb24gKHApIHtcclxuXHRcdHZhciBtaW5EaXN0YW5jZSA9IEluZmluaXR5LCBwYXJ0cyA9IHRoaXMuX3BhcnRzLCBwMSwgcDIsIG1pblBvaW50ID0gbnVsbDtcclxuXHJcblx0XHRmb3IgKHZhciBqID0gMCwgakxlbiA9IHBhcnRzLmxlbmd0aDsgaiA8IGpMZW47IGorKykge1xyXG5cdFx0XHR2YXIgcG9pbnRzID0gcGFydHNbal07XHJcblx0XHRcdGZvciAodmFyIGkgPSAxLCBsZW4gPSBwb2ludHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRwMSA9IHBvaW50c1tpIC0gMV07XHJcblx0XHRcdFx0cDIgPSBwb2ludHNbaV07XHJcblx0XHRcdFx0dmFyIHNxRGlzdCA9IEwuTGluZVV0aWwuX3NxQ2xvc2VzdFBvaW50T25TZWdtZW50KHAsIHAxLCBwMiwgdHJ1ZSk7XHJcblx0XHRcdFx0aWYgKHNxRGlzdCA8IG1pbkRpc3RhbmNlKSB7XHJcblx0XHRcdFx0XHRtaW5EaXN0YW5jZSA9IHNxRGlzdDtcclxuXHRcdFx0XHRcdG1pblBvaW50ID0gTC5MaW5lVXRpbC5fc3FDbG9zZXN0UG9pbnRPblNlZ21lbnQocCwgcDEsIHAyKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmIChtaW5Qb2ludCkge1xyXG5cdFx0XHRtaW5Qb2ludC5kaXN0YW5jZSA9IE1hdGguc3FydChtaW5EaXN0YW5jZSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbWluUG9pbnQ7XHJcblx0fSxcclxuXHJcblx0Z2V0Qm91bmRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuTGF0TG5nQm91bmRzKHRoaXMuZ2V0TGF0TG5ncygpKTtcclxuXHR9LFxyXG5cclxuXHRfY29udmVydExhdExuZ3M6IGZ1bmN0aW9uIChsYXRsbmdzLCBvdmVyd3JpdGUpIHtcclxuXHRcdHZhciBpLCBsZW4sIHRhcmdldCA9IG92ZXJ3cml0ZSA/IGxhdGxuZ3MgOiBbXTtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBsYXRsbmdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdGlmIChMLlV0aWwuaXNBcnJheShsYXRsbmdzW2ldKSAmJiB0eXBlb2YgbGF0bG5nc1tpXVswXSAhPT0gJ251bWJlcicpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0dGFyZ2V0W2ldID0gTC5sYXRMbmcobGF0bG5nc1tpXSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGFyZ2V0O1xyXG5cdH0sXHJcblxyXG5cdF9pbml0RXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRMLlBhdGgucHJvdG90eXBlLl9pbml0RXZlbnRzLmNhbGwodGhpcyk7XHJcblx0fSxcclxuXHJcblx0X2dldFBhdGhQYXJ0U3RyOiBmdW5jdGlvbiAocG9pbnRzKSB7XHJcblx0XHR2YXIgcm91bmQgPSBMLlBhdGguVk1MO1xyXG5cclxuXHRcdGZvciAodmFyIGogPSAwLCBsZW4yID0gcG9pbnRzLmxlbmd0aCwgc3RyID0gJycsIHA7IGogPCBsZW4yOyBqKyspIHtcclxuXHRcdFx0cCA9IHBvaW50c1tqXTtcclxuXHRcdFx0aWYgKHJvdW5kKSB7XHJcblx0XHRcdFx0cC5fcm91bmQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRzdHIgKz0gKGogPyAnTCcgOiAnTScpICsgcC54ICsgJyAnICsgcC55O1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHN0cjtcclxuXHR9LFxyXG5cclxuXHRfY2xpcFBvaW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLFxyXG5cdFx0ICAgIGxlbiA9IHBvaW50cy5sZW5ndGgsXHJcblx0XHQgICAgaSwgaywgc2VnbWVudDtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm5vQ2xpcCkge1xyXG5cdFx0XHR0aGlzLl9wYXJ0cyA9IFtwb2ludHNdO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcGFydHMgPSBbXTtcclxuXHJcblx0XHR2YXIgcGFydHMgPSB0aGlzLl9wYXJ0cyxcclxuXHRcdCAgICB2cCA9IHRoaXMuX21hcC5fcGF0aFZpZXdwb3J0LFxyXG5cdFx0ICAgIGx1ID0gTC5MaW5lVXRpbDtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBrID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xyXG5cdFx0XHRzZWdtZW50ID0gbHUuY2xpcFNlZ21lbnQocG9pbnRzW2ldLCBwb2ludHNbaSArIDFdLCB2cCwgaSk7XHJcblx0XHRcdGlmICghc2VnbWVudCkge1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwYXJ0c1trXSA9IHBhcnRzW2tdIHx8IFtdO1xyXG5cdFx0XHRwYXJ0c1trXS5wdXNoKHNlZ21lbnRbMF0pO1xyXG5cclxuXHRcdFx0Ly8gaWYgc2VnbWVudCBnb2VzIG91dCBvZiBzY3JlZW4sIG9yIGl0J3MgdGhlIGxhc3Qgb25lLCBpdCdzIHRoZSBlbmQgb2YgdGhlIGxpbmUgcGFydFxyXG5cdFx0XHRpZiAoKHNlZ21lbnRbMV0gIT09IHBvaW50c1tpICsgMV0pIHx8IChpID09PSBsZW4gLSAyKSkge1xyXG5cdFx0XHRcdHBhcnRzW2tdLnB1c2goc2VnbWVudFsxXSk7XHJcblx0XHRcdFx0aysrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Ly8gc2ltcGxpZnkgZWFjaCBjbGlwcGVkIHBhcnQgb2YgdGhlIHBvbHlsaW5lXHJcblx0X3NpbXBsaWZ5UG9pbnRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcGFydHMgPSB0aGlzLl9wYXJ0cyxcclxuXHRcdCAgICBsdSA9IEwuTGluZVV0aWw7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhcnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHBhcnRzW2ldID0gbHUuc2ltcGxpZnkocGFydHNbaV0sIHRoaXMub3B0aW9ucy5zbW9vdGhGYWN0b3IpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF91cGRhdGVQYXRoOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMuX21hcCkgeyByZXR1cm47IH1cclxuXHJcblx0XHR0aGlzLl9jbGlwUG9pbnRzKCk7XHJcblx0XHR0aGlzLl9zaW1wbGlmeVBvaW50cygpO1xyXG5cclxuXHRcdEwuUGF0aC5wcm90b3R5cGUuX3VwZGF0ZVBhdGguY2FsbCh0aGlzKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5wb2x5bGluZSA9IGZ1bmN0aW9uIChsYXRsbmdzLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLlBvbHlsaW5lKGxhdGxuZ3MsIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5Qb2x5VXRpbCBjb250YWlucyB1dGlsaXR5IGZ1bmN0aW9ucyBmb3IgcG9seWdvbnMgKGNsaXBwaW5nLCBldGMuKS5cclxuICovXHJcblxyXG4vKmpzaGludCBiaXR3aXNlOmZhbHNlICovIC8vIGFsbG93IGJpdHdpc2Ugb3BlcmF0aW9ucyBoZXJlXHJcblxyXG5MLlBvbHlVdGlsID0ge307XHJcblxyXG4vKlxyXG4gKiBTdXRoZXJsYW5kLUhvZGdlbWFuIHBvbHlnb24gY2xpcHBpbmcgYWxnb3JpdGhtLlxyXG4gKiBVc2VkIHRvIGF2b2lkIHJlbmRlcmluZyBwYXJ0cyBvZiBhIHBvbHlnb24gdGhhdCBhcmUgbm90IGN1cnJlbnRseSB2aXNpYmxlLlxyXG4gKi9cclxuTC5Qb2x5VXRpbC5jbGlwUG9seWdvbiA9IGZ1bmN0aW9uIChwb2ludHMsIGJvdW5kcykge1xyXG5cdHZhciBjbGlwcGVkUG9pbnRzLFxyXG5cdCAgICBlZGdlcyA9IFsxLCA0LCAyLCA4XSxcclxuXHQgICAgaSwgaiwgayxcclxuXHQgICAgYSwgYixcclxuXHQgICAgbGVuLCBlZGdlLCBwLFxyXG5cdCAgICBsdSA9IEwuTGluZVV0aWw7XHJcblxyXG5cdGZvciAoaSA9IDAsIGxlbiA9IHBvaW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0cG9pbnRzW2ldLl9jb2RlID0gbHUuX2dldEJpdENvZGUocG9pbnRzW2ldLCBib3VuZHMpO1xyXG5cdH1cclxuXHJcblx0Ly8gZm9yIGVhY2ggZWRnZSAobGVmdCwgYm90dG9tLCByaWdodCwgdG9wKVxyXG5cdGZvciAoayA9IDA7IGsgPCA0OyBrKyspIHtcclxuXHRcdGVkZ2UgPSBlZGdlc1trXTtcclxuXHRcdGNsaXBwZWRQb2ludHMgPSBbXTtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBwb2ludHMubGVuZ3RoLCBqID0gbGVuIC0gMTsgaSA8IGxlbjsgaiA9IGkrKykge1xyXG5cdFx0XHRhID0gcG9pbnRzW2ldO1xyXG5cdFx0XHRiID0gcG9pbnRzW2pdO1xyXG5cclxuXHRcdFx0Ly8gaWYgYSBpcyBpbnNpZGUgdGhlIGNsaXAgd2luZG93XHJcblx0XHRcdGlmICghKGEuX2NvZGUgJiBlZGdlKSkge1xyXG5cdFx0XHRcdC8vIGlmIGIgaXMgb3V0c2lkZSB0aGUgY2xpcCB3aW5kb3cgKGEtPmIgZ29lcyBvdXQgb2Ygc2NyZWVuKVxyXG5cdFx0XHRcdGlmIChiLl9jb2RlICYgZWRnZSkge1xyXG5cdFx0XHRcdFx0cCA9IGx1Ll9nZXRFZGdlSW50ZXJzZWN0aW9uKGIsIGEsIGVkZ2UsIGJvdW5kcyk7XHJcblx0XHRcdFx0XHRwLl9jb2RlID0gbHUuX2dldEJpdENvZGUocCwgYm91bmRzKTtcclxuXHRcdFx0XHRcdGNsaXBwZWRQb2ludHMucHVzaChwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2xpcHBlZFBvaW50cy5wdXNoKGEpO1xyXG5cclxuXHRcdFx0Ly8gZWxzZSBpZiBiIGlzIGluc2lkZSB0aGUgY2xpcCB3aW5kb3cgKGEtPmIgZW50ZXJzIHRoZSBzY3JlZW4pXHJcblx0XHRcdH0gZWxzZSBpZiAoIShiLl9jb2RlICYgZWRnZSkpIHtcclxuXHRcdFx0XHRwID0gbHUuX2dldEVkZ2VJbnRlcnNlY3Rpb24oYiwgYSwgZWRnZSwgYm91bmRzKTtcclxuXHRcdFx0XHRwLl9jb2RlID0gbHUuX2dldEJpdENvZGUocCwgYm91bmRzKTtcclxuXHRcdFx0XHRjbGlwcGVkUG9pbnRzLnB1c2gocCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHBvaW50cyA9IGNsaXBwZWRQb2ludHM7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcG9pbnRzO1xyXG59O1xyXG5cblxuLypcclxuICogTC5Qb2x5Z29uIGlzIHVzZWQgdG8gZGlzcGxheSBwb2x5Z29ucyBvbiBhIG1hcC5cclxuICovXHJcblxyXG5MLlBvbHlnb24gPSBMLlBvbHlsaW5lLmV4dGVuZCh7XHJcblx0b3B0aW9uczoge1xyXG5cdFx0ZmlsbDogdHJ1ZVxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChsYXRsbmdzLCBvcHRpb25zKSB7XHJcblx0XHRMLlBvbHlsaW5lLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5ncywgb3B0aW9ucyk7XHJcblx0XHR0aGlzLl9pbml0V2l0aEhvbGVzKGxhdGxuZ3MpO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0V2l0aEhvbGVzOiBmdW5jdGlvbiAobGF0bG5ncykge1xyXG5cdFx0dmFyIGksIGxlbiwgaG9sZTtcclxuXHRcdGlmIChsYXRsbmdzICYmIEwuVXRpbC5pc0FycmF5KGxhdGxuZ3NbMF0pICYmICh0eXBlb2YgbGF0bG5nc1swXVswXSAhPT0gJ251bWJlcicpKSB7XHJcblx0XHRcdHRoaXMuX2xhdGxuZ3MgPSB0aGlzLl9jb252ZXJ0TGF0TG5ncyhsYXRsbmdzWzBdKTtcclxuXHRcdFx0dGhpcy5faG9sZXMgPSBsYXRsbmdzLnNsaWNlKDEpO1xyXG5cclxuXHRcdFx0Zm9yIChpID0gMCwgbGVuID0gdGhpcy5faG9sZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRob2xlID0gdGhpcy5faG9sZXNbaV0gPSB0aGlzLl9jb252ZXJ0TGF0TG5ncyh0aGlzLl9ob2xlc1tpXSk7XHJcblx0XHRcdFx0aWYgKGhvbGVbMF0uZXF1YWxzKGhvbGVbaG9sZS5sZW5ndGggLSAxXSkpIHtcclxuXHRcdFx0XHRcdGhvbGUucG9wKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZmlsdGVyIG91dCBsYXN0IHBvaW50IGlmIGl0cyBlcXVhbCB0byB0aGUgZmlyc3Qgb25lXHJcblx0XHRsYXRsbmdzID0gdGhpcy5fbGF0bG5ncztcclxuXHJcblx0XHRpZiAobGF0bG5ncy5sZW5ndGggPj0gMiAmJiBsYXRsbmdzWzBdLmVxdWFscyhsYXRsbmdzW2xhdGxuZ3MubGVuZ3RoIC0gMV0pKSB7XHJcblx0XHRcdGxhdGxuZ3MucG9wKCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0cHJvamVjdExhdGxuZ3M6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuUG9seWxpbmUucHJvdG90eXBlLnByb2plY3RMYXRsbmdzLmNhbGwodGhpcyk7XHJcblxyXG5cdFx0Ly8gcHJvamVjdCBwb2x5Z29uIGhvbGVzIHBvaW50c1xyXG5cdFx0Ly8gVE9ETyBtb3ZlIHRoaXMgbG9naWMgdG8gUG9seWxpbmUgdG8gZ2V0IHJpZCBvZiBkdXBsaWNhdGlvblxyXG5cdFx0dGhpcy5faG9sZVBvaW50cyA9IFtdO1xyXG5cclxuXHRcdGlmICghdGhpcy5faG9sZXMpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dmFyIGksIGosIGxlbiwgbGVuMjtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSB0aGlzLl9ob2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHR0aGlzLl9ob2xlUG9pbnRzW2ldID0gW107XHJcblxyXG5cdFx0XHRmb3IgKGogPSAwLCBsZW4yID0gdGhpcy5faG9sZXNbaV0ubGVuZ3RoOyBqIDwgbGVuMjsgaisrKSB7XHJcblx0XHRcdFx0dGhpcy5faG9sZVBvaW50c1tpXVtqXSA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQodGhpcy5faG9sZXNbaV1bal0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0c2V0TGF0TG5nczogZnVuY3Rpb24gKGxhdGxuZ3MpIHtcclxuXHRcdGlmIChsYXRsbmdzICYmIEwuVXRpbC5pc0FycmF5KGxhdGxuZ3NbMF0pICYmICh0eXBlb2YgbGF0bG5nc1swXVswXSAhPT0gJ251bWJlcicpKSB7XHJcblx0XHRcdHRoaXMuX2luaXRXaXRoSG9sZXMobGF0bG5ncyk7XHJcblx0XHRcdHJldHVybiB0aGlzLnJlZHJhdygpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIEwuUG9seWxpbmUucHJvdG90eXBlLnNldExhdExuZ3MuY2FsbCh0aGlzLCBsYXRsbmdzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfY2xpcFBvaW50czogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLFxyXG5cdFx0ICAgIG5ld1BhcnRzID0gW107XHJcblxyXG5cdFx0dGhpcy5fcGFydHMgPSBbcG9pbnRzXS5jb25jYXQodGhpcy5faG9sZVBvaW50cyk7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5ub0NsaXApIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3BhcnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHZhciBjbGlwcGVkID0gTC5Qb2x5VXRpbC5jbGlwUG9seWdvbih0aGlzLl9wYXJ0c1tpXSwgdGhpcy5fbWFwLl9wYXRoVmlld3BvcnQpO1xyXG5cdFx0XHRpZiAoY2xpcHBlZC5sZW5ndGgpIHtcclxuXHRcdFx0XHRuZXdQYXJ0cy5wdXNoKGNsaXBwZWQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fcGFydHMgPSBuZXdQYXJ0cztcclxuXHR9LFxyXG5cclxuXHRfZ2V0UGF0aFBhcnRTdHI6IGZ1bmN0aW9uIChwb2ludHMpIHtcclxuXHRcdHZhciBzdHIgPSBMLlBvbHlsaW5lLnByb3RvdHlwZS5fZ2V0UGF0aFBhcnRTdHIuY2FsbCh0aGlzLCBwb2ludHMpO1xyXG5cdFx0cmV0dXJuIHN0ciArIChMLkJyb3dzZXIuc3ZnID8gJ3onIDogJ3gnKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5wb2x5Z29uID0gZnVuY3Rpb24gKGxhdGxuZ3MsIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuUG9seWdvbihsYXRsbmdzLCBvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXHJcbiAqIENvbnRhaW5zIEwuTXVsdGlQb2x5bGluZSBhbmQgTC5NdWx0aVBvbHlnb24gbGF5ZXJzLlxyXG4gKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblx0ZnVuY3Rpb24gY3JlYXRlTXVsdGkoS2xhc3MpIHtcclxuXHJcblx0XHRyZXR1cm4gTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcclxuXHJcblx0XHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uIChsYXRsbmdzLCBvcHRpb25zKSB7XHJcblx0XHRcdFx0dGhpcy5fbGF5ZXJzID0ge307XHJcblx0XHRcdFx0dGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XHJcblx0XHRcdFx0dGhpcy5zZXRMYXRMbmdzKGxhdGxuZ3MpO1xyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0c2V0TGF0TG5nczogZnVuY3Rpb24gKGxhdGxuZ3MpIHtcclxuXHRcdFx0XHR2YXIgaSA9IDAsXHJcblx0XHRcdFx0ICAgIGxlbiA9IGxhdGxuZ3MubGVuZ3RoO1xyXG5cclxuXHRcdFx0XHR0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdFx0XHRcdGlmIChpIDwgbGVuKSB7XHJcblx0XHRcdFx0XHRcdGxheWVyLnNldExhdExuZ3MobGF0bG5nc1tpKytdKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlTGF5ZXIobGF5ZXIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sIHRoaXMpO1xyXG5cclxuXHRcdFx0XHR3aGlsZSAoaSA8IGxlbikge1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRMYXllcihuZXcgS2xhc3MobGF0bG5nc1tpKytdLCB0aGlzLl9vcHRpb25zKSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdGdldExhdExuZ3M6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHR2YXIgbGF0bG5ncyA9IFtdO1xyXG5cclxuXHRcdFx0XHR0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdFx0XHRcdGxhdGxuZ3MucHVzaChsYXllci5nZXRMYXRMbmdzKCkpO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gbGF0bG5ncztcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRMLk11bHRpUG9seWxpbmUgPSBjcmVhdGVNdWx0aShMLlBvbHlsaW5lKTtcclxuXHRMLk11bHRpUG9seWdvbiA9IGNyZWF0ZU11bHRpKEwuUG9seWdvbik7XHJcblxyXG5cdEwubXVsdGlQb2x5bGluZSA9IGZ1bmN0aW9uIChsYXRsbmdzLCBvcHRpb25zKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuTXVsdGlQb2x5bGluZShsYXRsbmdzLCBvcHRpb25zKTtcclxuXHR9O1xyXG5cclxuXHRMLm11bHRpUG9seWdvbiA9IGZ1bmN0aW9uIChsYXRsbmdzLCBvcHRpb25zKSB7XHJcblx0XHRyZXR1cm4gbmV3IEwuTXVsdGlQb2x5Z29uKGxhdGxuZ3MsIG9wdGlvbnMpO1xyXG5cdH07XHJcbn0oKSk7XHJcblxuXG4vKlxyXG4gKiBMLlJlY3RhbmdsZSBleHRlbmRzIFBvbHlnb24gYW5kIGNyZWF0ZXMgYSByZWN0YW5nbGUgd2hlbiBwYXNzZWQgYSBMYXRMbmdCb3VuZHMgb2JqZWN0LlxyXG4gKi9cclxuXHJcbkwuUmVjdGFuZ2xlID0gTC5Qb2x5Z29uLmV4dGVuZCh7XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGxhdExuZ0JvdW5kcywgb3B0aW9ucykge1xyXG5cdFx0TC5Qb2x5Z29uLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgdGhpcy5fYm91bmRzVG9MYXRMbmdzKGxhdExuZ0JvdW5kcyksIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdHNldEJvdW5kczogZnVuY3Rpb24gKGxhdExuZ0JvdW5kcykge1xyXG5cdFx0dGhpcy5zZXRMYXRMbmdzKHRoaXMuX2JvdW5kc1RvTGF0TG5ncyhsYXRMbmdCb3VuZHMpKTtcclxuXHR9LFxyXG5cclxuXHRfYm91bmRzVG9MYXRMbmdzOiBmdW5jdGlvbiAobGF0TG5nQm91bmRzKSB7XHJcblx0XHRsYXRMbmdCb3VuZHMgPSBMLmxhdExuZ0JvdW5kcyhsYXRMbmdCb3VuZHMpO1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0bGF0TG5nQm91bmRzLmdldFNvdXRoV2VzdCgpLFxyXG5cdFx0XHRsYXRMbmdCb3VuZHMuZ2V0Tm9ydGhXZXN0KCksXHJcblx0XHRcdGxhdExuZ0JvdW5kcy5nZXROb3J0aEVhc3QoKSxcclxuXHRcdFx0bGF0TG5nQm91bmRzLmdldFNvdXRoRWFzdCgpXHJcblx0XHRdO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLnJlY3RhbmdsZSA9IGZ1bmN0aW9uIChsYXRMbmdCb3VuZHMsIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuUmVjdGFuZ2xlKGxhdExuZ0JvdW5kcywgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLkNpcmNsZSBpcyBhIGNpcmNsZSBvdmVybGF5ICh3aXRoIGEgY2VydGFpbiByYWRpdXMgaW4gbWV0ZXJzKS5cclxuICovXHJcblxyXG5MLkNpcmNsZSA9IEwuUGF0aC5leHRlbmQoe1xyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChsYXRsbmcsIHJhZGl1cywgb3B0aW9ucykge1xyXG5cdFx0TC5QYXRoLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy5fbGF0bG5nID0gTC5sYXRMbmcobGF0bG5nKTtcclxuXHRcdHRoaXMuX21SYWRpdXMgPSByYWRpdXM7XHJcblx0fSxcclxuXHJcblx0b3B0aW9uczoge1xyXG5cdFx0ZmlsbDogdHJ1ZVxyXG5cdH0sXHJcblxyXG5cdHNldExhdExuZzogZnVuY3Rpb24gKGxhdGxuZykge1xyXG5cdFx0dGhpcy5fbGF0bG5nID0gTC5sYXRMbmcobGF0bG5nKTtcclxuXHRcdHJldHVybiB0aGlzLnJlZHJhdygpO1xyXG5cdH0sXHJcblxyXG5cdHNldFJhZGl1czogZnVuY3Rpb24gKHJhZGl1cykge1xyXG5cdFx0dGhpcy5fbVJhZGl1cyA9IHJhZGl1cztcclxuXHRcdHJldHVybiB0aGlzLnJlZHJhdygpO1xyXG5cdH0sXHJcblxyXG5cdHByb2plY3RMYXRsbmdzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgbG5nUmFkaXVzID0gdGhpcy5fZ2V0TG5nUmFkaXVzKCksXHJcblx0XHQgICAgbGF0bG5nID0gdGhpcy5fbGF0bG5nLFxyXG5cdFx0ICAgIHBvaW50TGVmdCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQoW2xhdGxuZy5sYXQsIGxhdGxuZy5sbmcgLSBsbmdSYWRpdXNdKTtcclxuXHJcblx0XHR0aGlzLl9wb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKTtcclxuXHRcdHRoaXMuX3JhZGl1cyA9IE1hdGgubWF4KHRoaXMuX3BvaW50LnggLSBwb2ludExlZnQueCwgMSk7XHJcblx0fSxcclxuXHJcblx0Z2V0Qm91bmRzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgbG5nUmFkaXVzID0gdGhpcy5fZ2V0TG5nUmFkaXVzKCksXHJcblx0XHQgICAgbGF0UmFkaXVzID0gKHRoaXMuX21SYWRpdXMgLyA0MDA3NTAxNykgKiAzNjAsXHJcblx0XHQgICAgbGF0bG5nID0gdGhpcy5fbGF0bG5nO1xyXG5cclxuXHRcdHJldHVybiBuZXcgTC5MYXRMbmdCb3VuZHMoXHJcblx0XHQgICAgICAgIFtsYXRsbmcubGF0IC0gbGF0UmFkaXVzLCBsYXRsbmcubG5nIC0gbG5nUmFkaXVzXSxcclxuXHRcdCAgICAgICAgW2xhdGxuZy5sYXQgKyBsYXRSYWRpdXMsIGxhdGxuZy5sbmcgKyBsbmdSYWRpdXNdKTtcclxuXHR9LFxyXG5cclxuXHRnZXRMYXRMbmc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9sYXRsbmc7XHJcblx0fSxcclxuXHJcblx0Z2V0UGF0aFN0cmluZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHAgPSB0aGlzLl9wb2ludCxcclxuXHRcdCAgICByID0gdGhpcy5fcmFkaXVzO1xyXG5cclxuXHRcdGlmICh0aGlzLl9jaGVja0lmRW1wdHkoKSkge1xyXG5cdFx0XHRyZXR1cm4gJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKEwuQnJvd3Nlci5zdmcpIHtcclxuXHRcdFx0cmV0dXJuICdNJyArIHAueCArICcsJyArIChwLnkgLSByKSArXHJcblx0XHRcdCAgICAgICAnQScgKyByICsgJywnICsgciArICcsMCwxLDEsJyArXHJcblx0XHRcdCAgICAgICAocC54IC0gMC4xKSArICcsJyArIChwLnkgLSByKSArICcgeic7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwLl9yb3VuZCgpO1xyXG5cdFx0XHRyID0gTWF0aC5yb3VuZChyKTtcclxuXHRcdFx0cmV0dXJuICdBTCAnICsgcC54ICsgJywnICsgcC55ICsgJyAnICsgciArICcsJyArIHIgKyAnIDAsJyArICg2NTUzNSAqIDM2MCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Z2V0UmFkaXVzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbVJhZGl1cztcclxuXHR9LFxyXG5cclxuXHQvLyBUT0RPIEVhcnRoIGhhcmRjb2RlZCwgbW92ZSBpbnRvIHByb2plY3Rpb24gY29kZSFcclxuXHJcblx0X2dldExhdFJhZGl1czogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuICh0aGlzLl9tUmFkaXVzIC8gNDAwNzUwMTcpICogMzYwO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRMbmdSYWRpdXM6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9nZXRMYXRSYWRpdXMoKSAvIE1hdGguY29zKEwuTGF0TG5nLkRFR19UT19SQUQgKiB0aGlzLl9sYXRsbmcubGF0KTtcclxuXHR9LFxyXG5cclxuXHRfY2hlY2tJZkVtcHR5OiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMuX21hcCkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHR2YXIgdnAgPSB0aGlzLl9tYXAuX3BhdGhWaWV3cG9ydCxcclxuXHRcdCAgICByID0gdGhpcy5fcmFkaXVzLFxyXG5cdFx0ICAgIHAgPSB0aGlzLl9wb2ludDtcclxuXHJcblx0XHRyZXR1cm4gcC54IC0gciA+IHZwLm1heC54IHx8IHAueSAtIHIgPiB2cC5tYXgueSB8fFxyXG5cdFx0ICAgICAgIHAueCArIHIgPCB2cC5taW4ueCB8fCBwLnkgKyByIDwgdnAubWluLnk7XHJcblx0fVxyXG59KTtcclxuXHJcbkwuY2lyY2xlID0gZnVuY3Rpb24gKGxhdGxuZywgcmFkaXVzLCBvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLkNpcmNsZShsYXRsbmcsIHJhZGl1cywgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBMLkNpcmNsZU1hcmtlciBpcyBhIGNpcmNsZSBvdmVybGF5IHdpdGggYSBwZXJtYW5lbnQgcGl4ZWwgcmFkaXVzLlxyXG4gKi9cclxuXHJcbkwuQ2lyY2xlTWFya2VyID0gTC5DaXJjbGUuZXh0ZW5kKHtcclxuXHRvcHRpb25zOiB7XHJcblx0XHRyYWRpdXM6IDEwLFxyXG5cdFx0d2VpZ2h0OiAyXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKGxhdGxuZywgb3B0aW9ucykge1xyXG5cdFx0TC5DaXJjbGUucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXRsbmcsIG51bGwsIG9wdGlvbnMpO1xyXG5cdFx0dGhpcy5fcmFkaXVzID0gdGhpcy5vcHRpb25zLnJhZGl1cztcclxuXHR9LFxyXG5cclxuXHRwcm9qZWN0TGF0bG5nczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fcG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KHRoaXMuX2xhdGxuZyk7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZVN0eWxlIDogZnVuY3Rpb24gKCkge1xyXG5cdFx0TC5DaXJjbGUucHJvdG90eXBlLl91cGRhdGVTdHlsZS5jYWxsKHRoaXMpO1xyXG5cdFx0dGhpcy5zZXRSYWRpdXModGhpcy5vcHRpb25zLnJhZGl1cyk7XHJcblx0fSxcclxuXHJcblx0c2V0TGF0TG5nOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHRMLkNpcmNsZS5wcm90b3R5cGUuc2V0TGF0TG5nLmNhbGwodGhpcywgbGF0bG5nKTtcclxuXHRcdGlmICh0aGlzLl9wb3B1cCAmJiB0aGlzLl9wb3B1cC5faXNPcGVuKSB7XHJcblx0XHRcdHRoaXMuX3BvcHVwLnNldExhdExuZyhsYXRsbmcpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c2V0UmFkaXVzOiBmdW5jdGlvbiAocmFkaXVzKSB7XHJcblx0XHR0aGlzLm9wdGlvbnMucmFkaXVzID0gdGhpcy5fcmFkaXVzID0gcmFkaXVzO1xyXG5cdFx0cmV0dXJuIHRoaXMucmVkcmF3KCk7XHJcblx0fSxcclxuXHJcblx0Z2V0UmFkaXVzOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcmFkaXVzO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmNpcmNsZU1hcmtlciA9IGZ1bmN0aW9uIChsYXRsbmcsIG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuQ2lyY2xlTWFya2VyKGxhdGxuZywgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxyXG4gKiBFeHRlbmRzIEwuUG9seWxpbmUgdG8gYmUgYWJsZSB0byBtYW51YWxseSBkZXRlY3QgY2xpY2tzIG9uIENhbnZhcy1yZW5kZXJlZCBwb2x5bGluZXMuXHJcbiAqL1xyXG5cclxuTC5Qb2x5bGluZS5pbmNsdWRlKCFMLlBhdGguQ0FOVkFTID8ge30gOiB7XHJcblx0X2NvbnRhaW5zUG9pbnQ6IGZ1bmN0aW9uIChwLCBjbG9zZWQpIHtcclxuXHRcdHZhciBpLCBqLCBrLCBsZW4sIGxlbjIsIGRpc3QsIHBhcnQsXHJcblx0XHQgICAgdyA9IHRoaXMub3B0aW9ucy53ZWlnaHQgLyAyO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIudG91Y2gpIHtcclxuXHRcdFx0dyArPSAxMDsgLy8gcG9seWxpbmUgY2xpY2sgdG9sZXJhbmNlIG9uIHRvdWNoIGRldmljZXNcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSB0aGlzLl9wYXJ0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRwYXJ0ID0gdGhpcy5fcGFydHNbaV07XHJcblx0XHRcdGZvciAoaiA9IDAsIGxlbjIgPSBwYXJ0Lmxlbmd0aCwgayA9IGxlbjIgLSAxOyBqIDwgbGVuMjsgayA9IGorKykge1xyXG5cdFx0XHRcdGlmICghY2xvc2VkICYmIChqID09PSAwKSkge1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRkaXN0ID0gTC5MaW5lVXRpbC5wb2ludFRvU2VnbWVudERpc3RhbmNlKHAsIHBhcnRba10sIHBhcnRbal0pO1xyXG5cclxuXHRcdFx0XHRpZiAoZGlzdCA8PSB3KSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn0pO1xyXG5cblxuLypcclxuICogRXh0ZW5kcyBMLlBvbHlnb24gdG8gYmUgYWJsZSB0byBtYW51YWxseSBkZXRlY3QgY2xpY2tzIG9uIENhbnZhcy1yZW5kZXJlZCBwb2x5Z29ucy5cclxuICovXHJcblxyXG5MLlBvbHlnb24uaW5jbHVkZSghTC5QYXRoLkNBTlZBUyA/IHt9IDoge1xyXG5cdF9jb250YWluc1BvaW50OiBmdW5jdGlvbiAocCkge1xyXG5cdFx0dmFyIGluc2lkZSA9IGZhbHNlLFxyXG5cdFx0ICAgIHBhcnQsIHAxLCBwMixcclxuXHRcdCAgICBpLCBqLCBrLFxyXG5cdFx0ICAgIGxlbiwgbGVuMjtcclxuXHJcblx0XHQvLyBUT0RPIG9wdGltaXphdGlvbjogY2hlY2sgaWYgd2l0aGluIGJvdW5kcyBmaXJzdFxyXG5cclxuXHRcdGlmIChMLlBvbHlsaW5lLnByb3RvdHlwZS5fY29udGFpbnNQb2ludC5jYWxsKHRoaXMsIHAsIHRydWUpKSB7XHJcblx0XHRcdC8vIGNsaWNrIG9uIHBvbHlnb24gYm9yZGVyXHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHJheSBjYXN0aW5nIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGlmIHBvaW50IGlzIGluIHBvbHlnb25cclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSB0aGlzLl9wYXJ0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRwYXJ0ID0gdGhpcy5fcGFydHNbaV07XHJcblxyXG5cdFx0XHRmb3IgKGogPSAwLCBsZW4yID0gcGFydC5sZW5ndGgsIGsgPSBsZW4yIC0gMTsgaiA8IGxlbjI7IGsgPSBqKyspIHtcclxuXHRcdFx0XHRwMSA9IHBhcnRbal07XHJcblx0XHRcdFx0cDIgPSBwYXJ0W2tdO1xyXG5cclxuXHRcdFx0XHRpZiAoKChwMS55ID4gcC55KSAhPT0gKHAyLnkgPiBwLnkpKSAmJlxyXG5cdFx0XHRcdFx0XHQocC54IDwgKHAyLnggLSBwMS54KSAqIChwLnkgLSBwMS55KSAvIChwMi55IC0gcDEueSkgKyBwMS54KSkge1xyXG5cdFx0XHRcdFx0aW5zaWRlID0gIWluc2lkZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaW5zaWRlO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBFeHRlbmRzIEwuQ2lyY2xlIHdpdGggQ2FudmFzLXNwZWNpZmljIGNvZGUuXHJcbiAqL1xyXG5cclxuTC5DaXJjbGUuaW5jbHVkZSghTC5QYXRoLkNBTlZBUyA/IHt9IDoge1xyXG5cdF9kcmF3UGF0aDogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHAgPSB0aGlzLl9wb2ludDtcclxuXHRcdHRoaXMuX2N0eC5iZWdpblBhdGgoKTtcclxuXHRcdHRoaXMuX2N0eC5hcmMocC54LCBwLnksIHRoaXMuX3JhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcclxuXHR9LFxyXG5cclxuXHRfY29udGFpbnNQb2ludDogZnVuY3Rpb24gKHApIHtcclxuXHRcdHZhciBjZW50ZXIgPSB0aGlzLl9wb2ludCxcclxuXHRcdCAgICB3MiA9IHRoaXMub3B0aW9ucy5zdHJva2UgPyB0aGlzLm9wdGlvbnMud2VpZ2h0IC8gMiA6IDA7XHJcblxyXG5cdFx0cmV0dXJuIChwLmRpc3RhbmNlVG8oY2VudGVyKSA8PSB0aGlzLl9yYWRpdXMgKyB3Mik7XHJcblx0fVxyXG59KTtcclxuXG5cbi8qXG4gKiBDaXJjbGVNYXJrZXIgY2FudmFzIHNwZWNpZmljIGRyYXdpbmcgcGFydHMuXG4gKi9cblxuTC5DaXJjbGVNYXJrZXIuaW5jbHVkZSghTC5QYXRoLkNBTlZBUyA/IHt9IDoge1xuXHRfdXBkYXRlU3R5bGU6IGZ1bmN0aW9uICgpIHtcblx0XHRMLlBhdGgucHJvdG90eXBlLl91cGRhdGVTdHlsZS5jYWxsKHRoaXMpO1xuXHR9XG59KTtcblxuXG4vKlxyXG4gKiBMLkdlb0pTT04gdHVybnMgYW55IEdlb0pTT04gZGF0YSBpbnRvIGEgTGVhZmxldCBsYXllci5cclxuICovXHJcblxyXG5MLkdlb0pTT04gPSBMLkZlYXR1cmVHcm91cC5leHRlbmQoe1xyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAoZ2VvanNvbiwgb3B0aW9ucykge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuX2xheWVycyA9IHt9O1xyXG5cclxuXHRcdGlmIChnZW9qc29uKSB7XHJcblx0XHRcdHRoaXMuYWRkRGF0YShnZW9qc29uKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRhZGREYXRhOiBmdW5jdGlvbiAoZ2VvanNvbikge1xyXG5cdFx0dmFyIGZlYXR1cmVzID0gTC5VdGlsLmlzQXJyYXkoZ2VvanNvbikgPyBnZW9qc29uIDogZ2VvanNvbi5mZWF0dXJlcyxcclxuXHRcdCAgICBpLCBsZW4sIGZlYXR1cmU7XHJcblxyXG5cdFx0aWYgKGZlYXR1cmVzKSB7XHJcblx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IGZlYXR1cmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0Ly8gT25seSBhZGQgdGhpcyBpZiBnZW9tZXRyeSBvciBnZW9tZXRyaWVzIGFyZSBzZXQgYW5kIG5vdCBudWxsXHJcblx0XHRcdFx0ZmVhdHVyZSA9IGZlYXR1cmVzW2ldO1xyXG5cdFx0XHRcdGlmIChmZWF0dXJlLmdlb21ldHJpZXMgfHwgZmVhdHVyZS5nZW9tZXRyeSB8fCBmZWF0dXJlLmZlYXR1cmVzIHx8IGZlYXR1cmUuY29vcmRpbmF0ZXMpIHtcclxuXHRcdFx0XHRcdHRoaXMuYWRkRGF0YShmZWF0dXJlc1tpXSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLmZpbHRlciAmJiAhb3B0aW9ucy5maWx0ZXIoZ2VvanNvbikpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dmFyIGxheWVyID0gTC5HZW9KU09OLmdlb21ldHJ5VG9MYXllcihnZW9qc29uLCBvcHRpb25zLnBvaW50VG9MYXllciwgb3B0aW9ucy5jb29yZHNUb0xhdExuZywgb3B0aW9ucyk7XHJcblx0XHRsYXllci5mZWF0dXJlID0gTC5HZW9KU09OLmFzRmVhdHVyZShnZW9qc29uKTtcclxuXHJcblx0XHRsYXllci5kZWZhdWx0T3B0aW9ucyA9IGxheWVyLm9wdGlvbnM7XHJcblx0XHR0aGlzLnJlc2V0U3R5bGUobGF5ZXIpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLm9uRWFjaEZlYXR1cmUpIHtcclxuXHRcdFx0b3B0aW9ucy5vbkVhY2hGZWF0dXJlKGdlb2pzb24sIGxheWVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5hZGRMYXllcihsYXllcik7XHJcblx0fSxcclxuXHJcblx0cmVzZXRTdHlsZTogZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHR2YXIgc3R5bGUgPSB0aGlzLm9wdGlvbnMuc3R5bGU7XHJcblx0XHRpZiAoc3R5bGUpIHtcclxuXHRcdFx0Ly8gcmVzZXQgYW55IGN1c3RvbSBzdHlsZXNcclxuXHRcdFx0TC5VdGlsLmV4dGVuZChsYXllci5vcHRpb25zLCBsYXllci5kZWZhdWx0T3B0aW9ucyk7XHJcblxyXG5cdFx0XHR0aGlzLl9zZXRMYXllclN0eWxlKGxheWVyLCBzdHlsZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0c2V0U3R5bGU6IGZ1bmN0aW9uIChzdHlsZSkge1xyXG5cdFx0dGhpcy5lYWNoTGF5ZXIoZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRcdHRoaXMuX3NldExheWVyU3R5bGUobGF5ZXIsIHN0eWxlKTtcclxuXHRcdH0sIHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdF9zZXRMYXllclN0eWxlOiBmdW5jdGlvbiAobGF5ZXIsIHN0eWxlKSB7XHJcblx0XHRpZiAodHlwZW9mIHN0eWxlID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdHN0eWxlID0gc3R5bGUobGF5ZXIuZmVhdHVyZSk7XHJcblx0XHR9XHJcblx0XHRpZiAobGF5ZXIuc2V0U3R5bGUpIHtcclxuXHRcdFx0bGF5ZXIuc2V0U3R5bGUoc3R5bGUpO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcblxyXG5MLmV4dGVuZChMLkdlb0pTT04sIHtcclxuXHRnZW9tZXRyeVRvTGF5ZXI6IGZ1bmN0aW9uIChnZW9qc29uLCBwb2ludFRvTGF5ZXIsIGNvb3Jkc1RvTGF0TG5nLCB2ZWN0b3JPcHRpb25zKSB7XHJcblx0XHR2YXIgZ2VvbWV0cnkgPSBnZW9qc29uLnR5cGUgPT09ICdGZWF0dXJlJyA/IGdlb2pzb24uZ2VvbWV0cnkgOiBnZW9qc29uLFxyXG5cdFx0ICAgIGNvb3JkcyA9IGdlb21ldHJ5LmNvb3JkaW5hdGVzLFxyXG5cdFx0ICAgIGxheWVycyA9IFtdLFxyXG5cdFx0ICAgIGxhdGxuZywgbGF0bG5ncywgaSwgbGVuO1xyXG5cclxuXHRcdGNvb3Jkc1RvTGF0TG5nID0gY29vcmRzVG9MYXRMbmcgfHwgdGhpcy5jb29yZHNUb0xhdExuZztcclxuXHJcblx0XHRzd2l0Y2ggKGdlb21ldHJ5LnR5cGUpIHtcclxuXHRcdGNhc2UgJ1BvaW50JzpcclxuXHRcdFx0bGF0bG5nID0gY29vcmRzVG9MYXRMbmcoY29vcmRzKTtcclxuXHRcdFx0cmV0dXJuIHBvaW50VG9MYXllciA/IHBvaW50VG9MYXllcihnZW9qc29uLCBsYXRsbmcpIDogbmV3IEwuTWFya2VyKGxhdGxuZyk7XHJcblxyXG5cdFx0Y2FzZSAnTXVsdGlQb2ludCc6XHJcblx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvb3Jkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdGxhdGxuZyA9IGNvb3Jkc1RvTGF0TG5nKGNvb3Jkc1tpXSk7XHJcblx0XHRcdFx0bGF5ZXJzLnB1c2gocG9pbnRUb0xheWVyID8gcG9pbnRUb0xheWVyKGdlb2pzb24sIGxhdGxuZykgOiBuZXcgTC5NYXJrZXIobGF0bG5nKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG5ldyBMLkZlYXR1cmVHcm91cChsYXllcnMpO1xyXG5cclxuXHRcdGNhc2UgJ0xpbmVTdHJpbmcnOlxyXG5cdFx0XHRsYXRsbmdzID0gdGhpcy5jb29yZHNUb0xhdExuZ3MoY29vcmRzLCAwLCBjb29yZHNUb0xhdExuZyk7XHJcblx0XHRcdHJldHVybiBuZXcgTC5Qb2x5bGluZShsYXRsbmdzLCB2ZWN0b3JPcHRpb25zKTtcclxuXHJcblx0XHRjYXNlICdQb2x5Z29uJzpcclxuXHRcdFx0aWYgKGNvb3Jkcy5sZW5ndGggPT09IDIgJiYgIWNvb3Jkc1sxXS5sZW5ndGgpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgR2VvSlNPTiBvYmplY3QuJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0bGF0bG5ncyA9IHRoaXMuY29vcmRzVG9MYXRMbmdzKGNvb3JkcywgMSwgY29vcmRzVG9MYXRMbmcpO1xyXG5cdFx0XHRyZXR1cm4gbmV3IEwuUG9seWdvbihsYXRsbmdzLCB2ZWN0b3JPcHRpb25zKTtcclxuXHJcblx0XHRjYXNlICdNdWx0aUxpbmVTdHJpbmcnOlxyXG5cdFx0XHRsYXRsbmdzID0gdGhpcy5jb29yZHNUb0xhdExuZ3MoY29vcmRzLCAxLCBjb29yZHNUb0xhdExuZyk7XHJcblx0XHRcdHJldHVybiBuZXcgTC5NdWx0aVBvbHlsaW5lKGxhdGxuZ3MsIHZlY3Rvck9wdGlvbnMpO1xyXG5cclxuXHRcdGNhc2UgJ011bHRpUG9seWdvbic6XHJcblx0XHRcdGxhdGxuZ3MgPSB0aGlzLmNvb3Jkc1RvTGF0TG5ncyhjb29yZHMsIDIsIGNvb3Jkc1RvTGF0TG5nKTtcclxuXHRcdFx0cmV0dXJuIG5ldyBMLk11bHRpUG9seWdvbihsYXRsbmdzLCB2ZWN0b3JPcHRpb25zKTtcclxuXHJcblx0XHRjYXNlICdHZW9tZXRyeUNvbGxlY3Rpb24nOlxyXG5cdFx0XHRmb3IgKGkgPSAwLCBsZW4gPSBnZW9tZXRyeS5nZW9tZXRyaWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblxyXG5cdFx0XHRcdGxheWVycy5wdXNoKHRoaXMuZ2VvbWV0cnlUb0xheWVyKHtcclxuXHRcdFx0XHRcdGdlb21ldHJ5OiBnZW9tZXRyeS5nZW9tZXRyaWVzW2ldLFxyXG5cdFx0XHRcdFx0dHlwZTogJ0ZlYXR1cmUnLFxyXG5cdFx0XHRcdFx0cHJvcGVydGllczogZ2VvanNvbi5wcm9wZXJ0aWVzXHJcblx0XHRcdFx0fSwgcG9pbnRUb0xheWVyLCBjb29yZHNUb0xhdExuZywgdmVjdG9yT3B0aW9ucykpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBuZXcgTC5GZWF0dXJlR3JvdXAobGF5ZXJzKTtcclxuXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgR2VvSlNPTiBvYmplY3QuJyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Y29vcmRzVG9MYXRMbmc6IGZ1bmN0aW9uIChjb29yZHMpIHsgLy8gKEFycmF5WywgQm9vbGVhbl0pIC0+IExhdExuZ1xyXG5cdFx0cmV0dXJuIG5ldyBMLkxhdExuZyhjb29yZHNbMV0sIGNvb3Jkc1swXSwgY29vcmRzWzJdKTtcclxuXHR9LFxyXG5cclxuXHRjb29yZHNUb0xhdExuZ3M6IGZ1bmN0aW9uIChjb29yZHMsIGxldmVsc0RlZXAsIGNvb3Jkc1RvTGF0TG5nKSB7IC8vIChBcnJheVssIE51bWJlciwgRnVuY3Rpb25dKSAtPiBBcnJheVxyXG5cdFx0dmFyIGxhdGxuZywgaSwgbGVuLFxyXG5cdFx0ICAgIGxhdGxuZ3MgPSBbXTtcclxuXHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBjb29yZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0bGF0bG5nID0gbGV2ZWxzRGVlcCA/XHJcblx0XHRcdCAgICAgICAgdGhpcy5jb29yZHNUb0xhdExuZ3MoY29vcmRzW2ldLCBsZXZlbHNEZWVwIC0gMSwgY29vcmRzVG9MYXRMbmcpIDpcclxuXHRcdFx0ICAgICAgICAoY29vcmRzVG9MYXRMbmcgfHwgdGhpcy5jb29yZHNUb0xhdExuZykoY29vcmRzW2ldKTtcclxuXHJcblx0XHRcdGxhdGxuZ3MucHVzaChsYXRsbmcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBsYXRsbmdzO1xyXG5cdH0sXHJcblxyXG5cdGxhdExuZ1RvQ29vcmRzOiBmdW5jdGlvbiAobGF0bG5nKSB7XHJcblx0XHR2YXIgY29vcmRzID0gW2xhdGxuZy5sbmcsIGxhdGxuZy5sYXRdO1xyXG5cclxuXHRcdGlmIChsYXRsbmcuYWx0ICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0Y29vcmRzLnB1c2gobGF0bG5nLmFsdCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY29vcmRzO1xyXG5cdH0sXHJcblxyXG5cdGxhdExuZ3NUb0Nvb3JkczogZnVuY3Rpb24gKGxhdExuZ3MpIHtcclxuXHRcdHZhciBjb29yZHMgPSBbXTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gbGF0TG5ncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRjb29yZHMucHVzaChMLkdlb0pTT04ubGF0TG5nVG9Db29yZHMobGF0TG5nc1tpXSkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjb29yZHM7XHJcblx0fSxcclxuXHJcblx0Z2V0RmVhdHVyZTogZnVuY3Rpb24gKGxheWVyLCBuZXdHZW9tZXRyeSkge1xyXG5cdFx0cmV0dXJuIGxheWVyLmZlYXR1cmUgPyBMLmV4dGVuZCh7fSwgbGF5ZXIuZmVhdHVyZSwge2dlb21ldHJ5OiBuZXdHZW9tZXRyeX0pIDogTC5HZW9KU09OLmFzRmVhdHVyZShuZXdHZW9tZXRyeSk7XHJcblx0fSxcclxuXHJcblx0YXNGZWF0dXJlOiBmdW5jdGlvbiAoZ2VvSlNPTikge1xyXG5cdFx0aWYgKGdlb0pTT04udHlwZSA9PT0gJ0ZlYXR1cmUnKSB7XHJcblx0XHRcdHJldHVybiBnZW9KU09OO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHR5cGU6ICdGZWF0dXJlJyxcclxuXHRcdFx0cHJvcGVydGllczoge30sXHJcblx0XHRcdGdlb21ldHJ5OiBnZW9KU09OXHJcblx0XHR9O1xyXG5cdH1cclxufSk7XHJcblxyXG52YXIgUG9pbnRUb0dlb0pTT04gPSB7XHJcblx0dG9HZW9KU09OOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gTC5HZW9KU09OLmdldEZlYXR1cmUodGhpcywge1xyXG5cdFx0XHR0eXBlOiAnUG9pbnQnLFxyXG5cdFx0XHRjb29yZGluYXRlczogTC5HZW9KU09OLmxhdExuZ1RvQ29vcmRzKHRoaXMuZ2V0TGF0TG5nKCkpXHJcblx0XHR9KTtcclxuXHR9XHJcbn07XHJcblxyXG5MLk1hcmtlci5pbmNsdWRlKFBvaW50VG9HZW9KU09OKTtcclxuTC5DaXJjbGUuaW5jbHVkZShQb2ludFRvR2VvSlNPTik7XHJcbkwuQ2lyY2xlTWFya2VyLmluY2x1ZGUoUG9pbnRUb0dlb0pTT04pO1xyXG5cclxuTC5Qb2x5bGluZS5pbmNsdWRlKHtcclxuXHR0b0dlb0pTT046IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBMLkdlb0pTT04uZ2V0RmVhdHVyZSh0aGlzLCB7XHJcblx0XHRcdHR5cGU6ICdMaW5lU3RyaW5nJyxcclxuXHRcdFx0Y29vcmRpbmF0ZXM6IEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHModGhpcy5nZXRMYXRMbmdzKCkpXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5Qb2x5Z29uLmluY2x1ZGUoe1xyXG5cdHRvR2VvSlNPTjogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGNvb3JkcyA9IFtMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHRoaXMuZ2V0TGF0TG5ncygpKV0sXHJcblx0XHQgICAgaSwgbGVuLCBob2xlO1xyXG5cclxuXHRcdGNvb3Jkc1swXS5wdXNoKGNvb3Jkc1swXVswXSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2hvbGVzKSB7XHJcblx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IHRoaXMuX2hvbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0aG9sZSA9IEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHModGhpcy5faG9sZXNbaV0pO1xyXG5cdFx0XHRcdGhvbGUucHVzaChob2xlWzBdKTtcclxuXHRcdFx0XHRjb29yZHMucHVzaChob2xlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBMLkdlb0pTT04uZ2V0RmVhdHVyZSh0aGlzLCB7XHJcblx0XHRcdHR5cGU6ICdQb2x5Z29uJyxcclxuXHRcdFx0Y29vcmRpbmF0ZXM6IGNvb3Jkc1xyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblx0ZnVuY3Rpb24gbXVsdGlUb0dlb0pTT04odHlwZSkge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0dmFyIGNvb3JkcyA9IFtdO1xyXG5cclxuXHRcdFx0dGhpcy5lYWNoTGF5ZXIoZnVuY3Rpb24gKGxheWVyKSB7XHJcblx0XHRcdFx0Y29vcmRzLnB1c2gobGF5ZXIudG9HZW9KU09OKCkuZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBMLkdlb0pTT04uZ2V0RmVhdHVyZSh0aGlzLCB7XHJcblx0XHRcdFx0dHlwZTogdHlwZSxcclxuXHRcdFx0XHRjb29yZGluYXRlczogY29vcmRzXHJcblx0XHRcdH0pO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdEwuTXVsdGlQb2x5bGluZS5pbmNsdWRlKHt0b0dlb0pTT046IG11bHRpVG9HZW9KU09OKCdNdWx0aUxpbmVTdHJpbmcnKX0pO1xyXG5cdEwuTXVsdGlQb2x5Z29uLmluY2x1ZGUoe3RvR2VvSlNPTjogbXVsdGlUb0dlb0pTT04oJ011bHRpUG9seWdvbicpfSk7XHJcblxyXG5cdEwuTGF5ZXJHcm91cC5pbmNsdWRlKHtcclxuXHRcdHRvR2VvSlNPTjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdFx0dmFyIGdlb21ldHJ5ID0gdGhpcy5mZWF0dXJlICYmIHRoaXMuZmVhdHVyZS5nZW9tZXRyeSxcclxuXHRcdFx0XHRqc29ucyA9IFtdLFxyXG5cdFx0XHRcdGpzb247XHJcblxyXG5cdFx0XHRpZiAoZ2VvbWV0cnkgJiYgZ2VvbWV0cnkudHlwZSA9PT0gJ011bHRpUG9pbnQnKSB7XHJcblx0XHRcdFx0cmV0dXJuIG11bHRpVG9HZW9KU09OKCdNdWx0aVBvaW50JykuY2FsbCh0aGlzKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIGlzR2VvbWV0cnlDb2xsZWN0aW9uID0gZ2VvbWV0cnkgJiYgZ2VvbWV0cnkudHlwZSA9PT0gJ0dlb21ldHJ5Q29sbGVjdGlvbic7XHJcblxyXG5cdFx0XHR0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdFx0XHRpZiAobGF5ZXIudG9HZW9KU09OKSB7XHJcblx0XHRcdFx0XHRqc29uID0gbGF5ZXIudG9HZW9KU09OKCk7XHJcblx0XHRcdFx0XHRqc29ucy5wdXNoKGlzR2VvbWV0cnlDb2xsZWN0aW9uID8ganNvbi5nZW9tZXRyeSA6IEwuR2VvSlNPTi5hc0ZlYXR1cmUoanNvbikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRpZiAoaXNHZW9tZXRyeUNvbGxlY3Rpb24pIHtcclxuXHRcdFx0XHRyZXR1cm4gTC5HZW9KU09OLmdldEZlYXR1cmUodGhpcywge1xyXG5cdFx0XHRcdFx0Z2VvbWV0cmllczoganNvbnMsXHJcblx0XHRcdFx0XHR0eXBlOiAnR2VvbWV0cnlDb2xsZWN0aW9uJ1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXHJcblx0XHRcdFx0ZmVhdHVyZXM6IGpzb25zXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fSk7XHJcbn0oKSk7XHJcblxyXG5MLmdlb0pzb24gPSBmdW5jdGlvbiAoZ2VvanNvbiwgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5HZW9KU09OKGdlb2pzb24sIG9wdGlvbnMpO1xyXG59O1xyXG5cblxuLypcclxuICogTC5Eb21FdmVudCBjb250YWlucyBmdW5jdGlvbnMgZm9yIHdvcmtpbmcgd2l0aCBET00gZXZlbnRzLlxyXG4gKi9cclxuXHJcbkwuRG9tRXZlbnQgPSB7XHJcblx0LyogaW5zcGlyZWQgYnkgSm9obiBSZXNpZywgRGVhbiBFZHdhcmRzIGFuZCBZVUkgYWRkRXZlbnQgaW1wbGVtZW50YXRpb25zICovXHJcblx0YWRkTGlzdGVuZXI6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGZuLCBjb250ZXh0KSB7IC8vIChIVE1MRWxlbWVudCwgU3RyaW5nLCBGdW5jdGlvblssIE9iamVjdF0pXHJcblxyXG5cdFx0dmFyIGlkID0gTC5zdGFtcChmbiksXHJcblx0XHQgICAga2V5ID0gJ19sZWFmbGV0XycgKyB0eXBlICsgaWQsXHJcblx0XHQgICAgaGFuZGxlciwgb3JpZ2luYWxIYW5kbGVyLCBuZXdUeXBlO1xyXG5cclxuXHRcdGlmIChvYmpba2V5XSkgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHRcdGhhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRyZXR1cm4gZm4uY2FsbChjb250ZXh0IHx8IG9iaiwgZSB8fCBMLkRvbUV2ZW50Ll9nZXRFdmVudCgpKTtcclxuXHRcdH07XHJcblxyXG5cdFx0aWYgKEwuQnJvd3Nlci5wb2ludGVyICYmIHR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRQb2ludGVyTGlzdGVuZXIob2JqLCB0eXBlLCBoYW5kbGVyLCBpZCk7XHJcblx0XHR9XHJcblx0XHRpZiAoTC5Ccm93c2VyLnRvdWNoICYmICh0eXBlID09PSAnZGJsY2xpY2snKSAmJiB0aGlzLmFkZERvdWJsZVRhcExpc3RlbmVyKSB7XHJcblx0XHRcdHRoaXMuYWRkRG91YmxlVGFwTGlzdGVuZXIob2JqLCBoYW5kbGVyLCBpZCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCdhZGRFdmVudExpc3RlbmVyJyBpbiBvYmopIHtcclxuXHJcblx0XHRcdGlmICh0eXBlID09PSAnbW91c2V3aGVlbCcpIHtcclxuXHRcdFx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLCBoYW5kbGVyLCBmYWxzZSk7XHJcblx0XHRcdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xyXG5cclxuXHRcdFx0fSBlbHNlIGlmICgodHlwZSA9PT0gJ21vdXNlZW50ZXInKSB8fCAodHlwZSA9PT0gJ21vdXNlbGVhdmUnKSkge1xyXG5cclxuXHRcdFx0XHRvcmlnaW5hbEhhbmRsZXIgPSBoYW5kbGVyO1xyXG5cdFx0XHRcdG5ld1R5cGUgPSAodHlwZSA9PT0gJ21vdXNlZW50ZXInID8gJ21vdXNlb3ZlcicgOiAnbW91c2VvdXQnKTtcclxuXHJcblx0XHRcdFx0aGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdFx0XHRpZiAoIUwuRG9tRXZlbnQuX2NoZWNrTW91c2Uob2JqLCBlKSkgeyByZXR1cm47IH1cclxuXHRcdFx0XHRcdHJldHVybiBvcmlnaW5hbEhhbmRsZXIoZSk7XHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIobmV3VHlwZSwgaGFuZGxlciwgZmFsc2UpO1xyXG5cclxuXHRcdFx0fSBlbHNlIGlmICh0eXBlID09PSAnY2xpY2snICYmIEwuQnJvd3Nlci5hbmRyb2lkKSB7XHJcblx0XHRcdFx0b3JpZ2luYWxIYW5kbGVyID0gaGFuZGxlcjtcclxuXHRcdFx0XHRoYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHRcdHJldHVybiBMLkRvbUV2ZW50Ll9maWx0ZXJDbGljayhlLCBvcmlnaW5hbEhhbmRsZXIpO1xyXG5cdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2UgaWYgKCdhdHRhY2hFdmVudCcgaW4gb2JqKSB7XHJcblx0XHRcdG9iai5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgaGFuZGxlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0b2JqW2tleV0gPSBoYW5kbGVyO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUxpc3RlbmVyOiBmdW5jdGlvbiAob2JqLCB0eXBlLCBmbikgeyAgLy8gKEhUTUxFbGVtZW50LCBTdHJpbmcsIEZ1bmN0aW9uKVxyXG5cclxuXHRcdHZhciBpZCA9IEwuc3RhbXAoZm4pLFxyXG5cdFx0ICAgIGtleSA9ICdfbGVhZmxldF8nICsgdHlwZSArIGlkLFxyXG5cdFx0ICAgIGhhbmRsZXIgPSBvYmpba2V5XTtcclxuXHJcblx0XHRpZiAoIWhhbmRsZXIpIHsgcmV0dXJuIHRoaXM7IH1cclxuXHJcblx0XHRpZiAoTC5Ccm93c2VyLnBvaW50ZXIgJiYgdHlwZS5pbmRleE9mKCd0b3VjaCcpID09PSAwKSB7XHJcblx0XHRcdHRoaXMucmVtb3ZlUG9pbnRlckxpc3RlbmVyKG9iaiwgdHlwZSwgaWQpO1xyXG5cdFx0fSBlbHNlIGlmIChMLkJyb3dzZXIudG91Y2ggJiYgKHR5cGUgPT09ICdkYmxjbGljaycpICYmIHRoaXMucmVtb3ZlRG91YmxlVGFwTGlzdGVuZXIpIHtcclxuXHRcdFx0dGhpcy5yZW1vdmVEb3VibGVUYXBMaXN0ZW5lcihvYmosIGlkKTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKCdyZW1vdmVFdmVudExpc3RlbmVyJyBpbiBvYmopIHtcclxuXHJcblx0XHRcdGlmICh0eXBlID09PSAnbW91c2V3aGVlbCcpIHtcclxuXHRcdFx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLCBoYW5kbGVyLCBmYWxzZSk7XHJcblx0XHRcdFx0b2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xyXG5cclxuXHRcdFx0fSBlbHNlIGlmICgodHlwZSA9PT0gJ21vdXNlZW50ZXInKSB8fCAodHlwZSA9PT0gJ21vdXNlbGVhdmUnKSkge1xyXG5cdFx0XHRcdG9iai5yZW1vdmVFdmVudExpc3RlbmVyKCh0eXBlID09PSAnbW91c2VlbnRlcicgPyAnbW91c2VvdmVyJyA6ICdtb3VzZW91dCcpLCBoYW5kbGVyLCBmYWxzZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0b2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKCdkZXRhY2hFdmVudCcgaW4gb2JqKSB7XHJcblx0XHRcdG9iai5kZXRhY2hFdmVudCgnb24nICsgdHlwZSwgaGFuZGxlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0b2JqW2tleV0gPSBudWxsO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHN0b3BQcm9wYWdhdGlvbjogZnVuY3Rpb24gKGUpIHtcclxuXHJcblx0XHRpZiAoZS5zdG9wUHJvcGFnYXRpb24pIHtcclxuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdEwuRG9tRXZlbnQuX3NraXBwZWQoZSk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0ZGlzYWJsZVNjcm9sbFByb3BhZ2F0aW9uOiBmdW5jdGlvbiAoZWwpIHtcclxuXHRcdHZhciBzdG9wID0gTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb247XHJcblxyXG5cdFx0cmV0dXJuIEwuRG9tRXZlbnRcclxuXHRcdFx0Lm9uKGVsLCAnbW91c2V3aGVlbCcsIHN0b3ApXHJcblx0XHRcdC5vbihlbCwgJ01vek1vdXNlUGl4ZWxTY3JvbGwnLCBzdG9wKTtcclxuXHR9LFxyXG5cclxuXHRkaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbjogZnVuY3Rpb24gKGVsKSB7XHJcblx0XHR2YXIgc3RvcCA9IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSBMLkRyYWdnYWJsZS5TVEFSVC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKGVsLCBMLkRyYWdnYWJsZS5TVEFSVFtpXSwgc3RvcCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIEwuRG9tRXZlbnRcclxuXHRcdFx0Lm9uKGVsLCAnY2xpY2snLCBMLkRvbUV2ZW50Ll9mYWtlU3RvcClcclxuXHRcdFx0Lm9uKGVsLCAnZGJsY2xpY2snLCBzdG9wKTtcclxuXHR9LFxyXG5cclxuXHRwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24gKGUpIHtcclxuXHJcblx0XHRpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRzdG9wOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0cmV0dXJuIEwuRG9tRXZlbnRcclxuXHRcdFx0LnByZXZlbnREZWZhdWx0KGUpXHJcblx0XHRcdC5zdG9wUHJvcGFnYXRpb24oZSk7XHJcblx0fSxcclxuXHJcblx0Z2V0TW91c2VQb3NpdGlvbjogZnVuY3Rpb24gKGUsIGNvbnRhaW5lcikge1xyXG5cdFx0aWYgKCFjb250YWluZXIpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBMLlBvaW50KGUuY2xpZW50WCwgZS5jbGllbnRZKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgcmVjdCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQoXHJcblx0XHRcdGUuY2xpZW50WCAtIHJlY3QubGVmdCAtIGNvbnRhaW5lci5jbGllbnRMZWZ0LFxyXG5cdFx0XHRlLmNsaWVudFkgLSByZWN0LnRvcCAtIGNvbnRhaW5lci5jbGllbnRUb3ApO1xyXG5cdH0sXHJcblxyXG5cdGdldFdoZWVsRGVsdGE6IGZ1bmN0aW9uIChlKSB7XHJcblxyXG5cdFx0dmFyIGRlbHRhID0gMDtcclxuXHJcblx0XHRpZiAoZS53aGVlbERlbHRhKSB7XHJcblx0XHRcdGRlbHRhID0gZS53aGVlbERlbHRhIC8gMTIwO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGUuZGV0YWlsKSB7XHJcblx0XHRcdGRlbHRhID0gLWUuZGV0YWlsIC8gMztcclxuXHRcdH1cclxuXHRcdHJldHVybiBkZWx0YTtcclxuXHR9LFxyXG5cclxuXHRfc2tpcEV2ZW50czoge30sXHJcblxyXG5cdF9mYWtlU3RvcDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdC8vIGZha2VzIHN0b3BQcm9wYWdhdGlvbiBieSBzZXR0aW5nIGEgc3BlY2lhbCBldmVudCBmbGFnLCBjaGVja2VkL3Jlc2V0IHdpdGggTC5Eb21FdmVudC5fc2tpcHBlZChlKVxyXG5cdFx0TC5Eb21FdmVudC5fc2tpcEV2ZW50c1tlLnR5cGVdID0gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHRfc2tpcHBlZDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdHZhciBza2lwcGVkID0gdGhpcy5fc2tpcEV2ZW50c1tlLnR5cGVdO1xyXG5cdFx0Ly8gcmVzZXQgd2hlbiBjaGVja2luZywgYXMgaXQncyBvbmx5IHVzZWQgaW4gbWFwIGNvbnRhaW5lciBhbmQgcHJvcGFnYXRlcyBvdXRzaWRlIG9mIHRoZSBtYXBcclxuXHRcdHRoaXMuX3NraXBFdmVudHNbZS50eXBlXSA9IGZhbHNlO1xyXG5cdFx0cmV0dXJuIHNraXBwZWQ7XHJcblx0fSxcclxuXHJcblx0Ly8gY2hlY2sgaWYgZWxlbWVudCByZWFsbHkgbGVmdC9lbnRlcmVkIHRoZSBldmVudCB0YXJnZXQgKGZvciBtb3VzZWVudGVyL21vdXNlbGVhdmUpXHJcblx0X2NoZWNrTW91c2U6IGZ1bmN0aW9uIChlbCwgZSkge1xyXG5cclxuXHRcdHZhciByZWxhdGVkID0gZS5yZWxhdGVkVGFyZ2V0O1xyXG5cclxuXHRcdGlmICghcmVsYXRlZCkgeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdHdoaWxlIChyZWxhdGVkICYmIChyZWxhdGVkICE9PSBlbCkpIHtcclxuXHRcdFx0XHRyZWxhdGVkID0gcmVsYXRlZC5wYXJlbnROb2RlO1xyXG5cdFx0XHR9XHJcblx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIChyZWxhdGVkICE9PSBlbCk7XHJcblx0fSxcclxuXHJcblx0X2dldEV2ZW50OiBmdW5jdGlvbiAoKSB7IC8vIGV2aWwgbWFnaWMgZm9yIElFXHJcblx0XHQvKmpzaGludCBub2FyZzpmYWxzZSAqL1xyXG5cdFx0dmFyIGUgPSB3aW5kb3cuZXZlbnQ7XHJcblx0XHRpZiAoIWUpIHtcclxuXHRcdFx0dmFyIGNhbGxlciA9IGFyZ3VtZW50cy5jYWxsZWUuY2FsbGVyO1xyXG5cdFx0XHR3aGlsZSAoY2FsbGVyKSB7XHJcblx0XHRcdFx0ZSA9IGNhbGxlclsnYXJndW1lbnRzJ11bMF07XHJcblx0XHRcdFx0aWYgKGUgJiYgd2luZG93LkV2ZW50ID09PSBlLmNvbnN0cnVjdG9yKSB7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FsbGVyID0gY2FsbGVyLmNhbGxlcjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGU7XHJcblx0fSxcclxuXHJcblx0Ly8gdGhpcyBpcyBhIGhvcnJpYmxlIHdvcmthcm91bmQgZm9yIGEgYnVnIGluIEFuZHJvaWQgd2hlcmUgYSBzaW5nbGUgdG91Y2ggdHJpZ2dlcnMgdHdvIGNsaWNrIGV2ZW50c1xyXG5cdF9maWx0ZXJDbGljazogZnVuY3Rpb24gKGUsIGhhbmRsZXIpIHtcclxuXHRcdHZhciB0aW1lU3RhbXAgPSAoZS50aW1lU3RhbXAgfHwgZS5vcmlnaW5hbEV2ZW50LnRpbWVTdGFtcCksXHJcblx0XHRcdGVsYXBzZWQgPSBMLkRvbUV2ZW50Ll9sYXN0Q2xpY2sgJiYgKHRpbWVTdGFtcCAtIEwuRG9tRXZlbnQuX2xhc3RDbGljayk7XHJcblxyXG5cdFx0Ly8gYXJlIHRoZXkgY2xvc2VyIHRvZ2V0aGVyIHRoYW4gMTAwMG1zIHlldCBtb3JlIHRoYW4gMTAwbXM/XHJcblx0XHQvLyBBbmRyb2lkIHR5cGljYWxseSB0cmlnZ2VycyB0aGVtIH4zMDBtcyBhcGFydCB3aGlsZSBtdWx0aXBsZSBsaXN0ZW5lcnNcclxuXHRcdC8vIG9uIHRoZSBzYW1lIGV2ZW50IHNob3VsZCBiZSB0cmlnZ2VyZWQgZmFyIGZhc3RlcjtcclxuXHRcdC8vIG9yIGNoZWNrIGlmIGNsaWNrIGlzIHNpbXVsYXRlZCBvbiB0aGUgZWxlbWVudCwgYW5kIGlmIGl0IGlzLCByZWplY3QgYW55IG5vbi1zaW11bGF0ZWQgZXZlbnRzXHJcblxyXG5cdFx0aWYgKChlbGFwc2VkICYmIGVsYXBzZWQgPiAxMDAgJiYgZWxhcHNlZCA8IDEwMDApIHx8IChlLnRhcmdldC5fc2ltdWxhdGVkQ2xpY2sgJiYgIWUuX3NpbXVsYXRlZCkpIHtcclxuXHRcdFx0TC5Eb21FdmVudC5zdG9wKGUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRMLkRvbUV2ZW50Ll9sYXN0Q2xpY2sgPSB0aW1lU3RhbXA7XHJcblxyXG5cdFx0cmV0dXJuIGhhbmRsZXIoZSk7XHJcblx0fVxyXG59O1xyXG5cclxuTC5Eb21FdmVudC5vbiA9IEwuRG9tRXZlbnQuYWRkTGlzdGVuZXI7XHJcbkwuRG9tRXZlbnQub2ZmID0gTC5Eb21FdmVudC5yZW1vdmVMaXN0ZW5lcjtcclxuXG5cbi8qXHJcbiAqIEwuRHJhZ2dhYmxlIGFsbG93cyB5b3UgdG8gYWRkIGRyYWdnaW5nIGNhcGFiaWxpdGllcyB0byBhbnkgZWxlbWVudC4gU3VwcG9ydHMgbW9iaWxlIGRldmljZXMgdG9vLlxyXG4gKi9cclxuXHJcbkwuRHJhZ2dhYmxlID0gTC5DbGFzcy5leHRlbmQoe1xyXG5cdGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcclxuXHJcblx0c3RhdGljczoge1xyXG5cdFx0U1RBUlQ6IEwuQnJvd3Nlci50b3VjaCA/IFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXSA6IFsnbW91c2Vkb3duJ10sXHJcblx0XHRFTkQ6IHtcclxuXHRcdFx0bW91c2Vkb3duOiAnbW91c2V1cCcsXHJcblx0XHRcdHRvdWNoc3RhcnQ6ICd0b3VjaGVuZCcsXHJcblx0XHRcdHBvaW50ZXJkb3duOiAndG91Y2hlbmQnLFxyXG5cdFx0XHRNU1BvaW50ZXJEb3duOiAndG91Y2hlbmQnXHJcblx0XHR9LFxyXG5cdFx0TU9WRToge1xyXG5cdFx0XHRtb3VzZWRvd246ICdtb3VzZW1vdmUnLFxyXG5cdFx0XHR0b3VjaHN0YXJ0OiAndG91Y2htb3ZlJyxcclxuXHRcdFx0cG9pbnRlcmRvd246ICd0b3VjaG1vdmUnLFxyXG5cdFx0XHRNU1BvaW50ZXJEb3duOiAndG91Y2htb3ZlJ1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChlbGVtZW50LCBkcmFnU3RhcnRUYXJnZXQpIHtcclxuXHRcdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xyXG5cdFx0dGhpcy5fZHJhZ1N0YXJ0VGFyZ2V0ID0gZHJhZ1N0YXJ0VGFyZ2V0IHx8IGVsZW1lbnQ7XHJcblx0fSxcclxuXHJcblx0ZW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAodGhpcy5fZW5hYmxlZCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRmb3IgKHZhciBpID0gTC5EcmFnZ2FibGUuU1RBUlQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0TC5Eb21FdmVudC5vbih0aGlzLl9kcmFnU3RhcnRUYXJnZXQsIEwuRHJhZ2dhYmxlLlNUQVJUW2ldLCB0aGlzLl9vbkRvd24sIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fZW5hYmxlZCkgeyByZXR1cm47IH1cclxuXHJcblx0XHRmb3IgKHZhciBpID0gTC5EcmFnZ2FibGUuU1RBUlQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0TC5Eb21FdmVudC5vZmYodGhpcy5fZHJhZ1N0YXJ0VGFyZ2V0LCBMLkRyYWdnYWJsZS5TVEFSVFtpXSwgdGhpcy5fb25Eb3duLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9lbmFibGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLl9tb3ZlZCA9IGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdF9vbkRvd246IGZ1bmN0aW9uIChlKSB7XHJcblx0XHR0aGlzLl9tb3ZlZCA9IGZhbHNlO1xyXG5cclxuXHRcdGlmIChlLnNoaWZ0S2V5IHx8ICgoZS53aGljaCAhPT0gMSkgJiYgKGUuYnV0dG9uICE9PSAxKSAmJiAhZS50b3VjaGVzKSkgeyByZXR1cm47IH1cclxuXHJcblx0XHRMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbihlKTtcclxuXHJcblx0XHRpZiAoTC5EcmFnZ2FibGUuX2Rpc2FibGVkKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdEwuRG9tVXRpbC5kaXNhYmxlSW1hZ2VEcmFnKCk7XHJcblx0XHRMLkRvbVV0aWwuZGlzYWJsZVRleHRTZWxlY3Rpb24oKTtcclxuXHJcblx0XHRpZiAodGhpcy5fbW92aW5nKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBmaXJzdCA9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXSA6IGU7XHJcblxyXG5cdFx0dGhpcy5fc3RhcnRQb2ludCA9IG5ldyBMLlBvaW50KGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFkpO1xyXG5cdFx0dGhpcy5fc3RhcnRQb3MgPSB0aGlzLl9uZXdQb3MgPSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24odGhpcy5fZWxlbWVudCk7XHJcblxyXG5cdFx0TC5Eb21FdmVudFxyXG5cdFx0ICAgIC5vbihkb2N1bWVudCwgTC5EcmFnZ2FibGUuTU9WRVtlLnR5cGVdLCB0aGlzLl9vbk1vdmUsIHRoaXMpXHJcblx0XHQgICAgLm9uKGRvY3VtZW50LCBMLkRyYWdnYWJsZS5FTkRbZS50eXBlXSwgdGhpcy5fb25VcCwgdGhpcyk7XHJcblx0fSxcclxuXHJcblx0X29uTW92ZTogZnVuY3Rpb24gKGUpIHtcclxuXHRcdGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0dGhpcy5fbW92ZWQgPSB0cnVlO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGZpcnN0ID0gKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID09PSAxID8gZS50b3VjaGVzWzBdIDogZSksXHJcblx0XHQgICAgbmV3UG9pbnQgPSBuZXcgTC5Qb2ludChmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZKSxcclxuXHRcdCAgICBvZmZzZXQgPSBuZXdQb2ludC5zdWJ0cmFjdCh0aGlzLl9zdGFydFBvaW50KTtcclxuXHJcblx0XHRpZiAoIW9mZnNldC54ICYmICFvZmZzZXQueSkgeyByZXR1cm47IH1cclxuXHJcblx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xyXG5cclxuXHRcdGlmICghdGhpcy5fbW92ZWQpIHtcclxuXHRcdFx0dGhpcy5maXJlKCdkcmFnc3RhcnQnKTtcclxuXHJcblx0XHRcdHRoaXMuX21vdmVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5fc3RhcnRQb3MgPSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24odGhpcy5fZWxlbWVudCkuc3VidHJhY3Qob2Zmc2V0KTtcclxuXHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyhkb2N1bWVudC5ib2R5LCAnbGVhZmxldC1kcmFnZ2luZycpO1xyXG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MoKGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCksICdsZWFmbGV0LWRyYWctdGFyZ2V0Jyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fbmV3UG9zID0gdGhpcy5fc3RhcnRQb3MuYWRkKG9mZnNldCk7XHJcblx0XHR0aGlzLl9tb3ZpbmcgPSB0cnVlO1xyXG5cclxuXHRcdEwuVXRpbC5jYW5jZWxBbmltRnJhbWUodGhpcy5fYW5pbVJlcXVlc3QpO1xyXG5cdFx0dGhpcy5fYW5pbVJlcXVlc3QgPSBMLlV0aWwucmVxdWVzdEFuaW1GcmFtZSh0aGlzLl91cGRhdGVQb3NpdGlvbiwgdGhpcywgdHJ1ZSwgdGhpcy5fZHJhZ1N0YXJ0VGFyZ2V0KTtcclxuXHR9LFxyXG5cclxuXHRfdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uICgpIHtcclxuXHRcdHRoaXMuZmlyZSgncHJlZHJhZycpO1xyXG5cdFx0TC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2VsZW1lbnQsIHRoaXMuX25ld1Bvcyk7XHJcblx0XHR0aGlzLmZpcmUoJ2RyYWcnKTtcclxuXHR9LFxyXG5cclxuXHRfb25VcDogZnVuY3Rpb24gKGUpIHtcclxuXHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCAnbGVhZmxldC1kcmFnZ2luZycpO1xyXG5cdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKChlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpLCAnbGVhZmxldC1kcmFnLXRhcmdldCcpO1xyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gTC5EcmFnZ2FibGUuTU9WRSkge1xyXG5cdFx0XHRMLkRvbUV2ZW50XHJcblx0XHRcdCAgICAub2ZmKGRvY3VtZW50LCBMLkRyYWdnYWJsZS5NT1ZFW2ldLCB0aGlzLl9vbk1vdmUpXHJcblx0XHRcdCAgICAub2ZmKGRvY3VtZW50LCBMLkRyYWdnYWJsZS5FTkRbaV0sIHRoaXMuX29uVXApO1xyXG5cdFx0fVxyXG5cclxuXHRcdEwuRG9tVXRpbC5lbmFibGVJbWFnZURyYWcoKTtcclxuXHRcdEwuRG9tVXRpbC5lbmFibGVUZXh0U2VsZWN0aW9uKCk7XHJcblxyXG5cdFx0aWYgKHRoaXMuX21vdmVkICYmIHRoaXMuX21vdmluZykge1xyXG5cdFx0XHQvLyBlbnN1cmUgZHJhZyBpcyBub3QgZmlyZWQgYWZ0ZXIgZHJhZ2VuZFxyXG5cdFx0XHRMLlV0aWwuY2FuY2VsQW5pbUZyYW1lKHRoaXMuX2FuaW1SZXF1ZXN0KTtcclxuXHJcblx0XHRcdHRoaXMuZmlyZSgnZHJhZ2VuZCcsIHtcclxuXHRcdFx0XHRkaXN0YW5jZTogdGhpcy5fbmV3UG9zLmRpc3RhbmNlVG8odGhpcy5fc3RhcnRQb3MpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX21vdmluZyA9IGZhbHNlO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxuXHRMLkhhbmRsZXIgaXMgYSBiYXNlIGNsYXNzIGZvciBoYW5kbGVyIGNsYXNzZXMgdGhhdCBhcmUgdXNlZCBpbnRlcm5hbGx5IHRvIGluamVjdFxuXHRpbnRlcmFjdGlvbiBmZWF0dXJlcyBsaWtlIGRyYWdnaW5nIHRvIGNsYXNzZXMgbGlrZSBNYXAgYW5kIE1hcmtlci5cbiovXG5cbkwuSGFuZGxlciA9IEwuQ2xhc3MuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG1hcCkge1xuXHRcdHRoaXMuX21hcCA9IG1hcDtcblx0fSxcblxuXHRlbmFibGU6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5fZW5hYmxlZCkgeyByZXR1cm47IH1cblxuXHRcdHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xuXHRcdHRoaXMuYWRkSG9va3MoKTtcblx0fSxcblxuXHRkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF0aGlzLl9lbmFibGVkKSB7IHJldHVybjsgfVxuXG5cdFx0dGhpcy5fZW5hYmxlZCA9IGZhbHNlO1xuXHRcdHRoaXMucmVtb3ZlSG9va3MoKTtcblx0fSxcblxuXHRlbmFibGVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuICEhdGhpcy5fZW5hYmxlZDtcblx0fVxufSk7XG5cblxuLypcbiAqIEwuSGFuZGxlci5NYXBEcmFnIGlzIHVzZWQgdG8gbWFrZSB0aGUgbWFwIGRyYWdnYWJsZSAod2l0aCBwYW5uaW5nIGluZXJ0aWEpLCBlbmFibGVkIGJ5IGRlZmF1bHQuXG4gKi9cblxuTC5NYXAubWVyZ2VPcHRpb25zKHtcblx0ZHJhZ2dpbmc6IHRydWUsXG5cblx0aW5lcnRpYTogIUwuQnJvd3Nlci5hbmRyb2lkMjMsXG5cdGluZXJ0aWFEZWNlbGVyYXRpb246IDM0MDAsIC8vIHB4L3NeMlxuXHRpbmVydGlhTWF4U3BlZWQ6IEluZmluaXR5LCAvLyBweC9zXG5cdGluZXJ0aWFUaHJlc2hvbGQ6IEwuQnJvd3Nlci50b3VjaCA/IDMyIDogMTgsIC8vIG1zXG5cdGVhc2VMaW5lYXJpdHk6IDAuMjUsXG5cblx0Ly8gVE9ETyByZWZhY3RvciwgbW92ZSB0byBDUlNcblx0d29ybGRDb3B5SnVtcDogZmFsc2Vcbn0pO1xuXG5MLk1hcC5EcmFnID0gTC5IYW5kbGVyLmV4dGVuZCh7XG5cdGFkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF0aGlzLl9kcmFnZ2FibGUpIHtcblx0XHRcdHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cblx0XHRcdHRoaXMuX2RyYWdnYWJsZSA9IG5ldyBMLkRyYWdnYWJsZShtYXAuX21hcFBhbmUsIG1hcC5fY29udGFpbmVyKTtcblxuXHRcdFx0dGhpcy5fZHJhZ2dhYmxlLm9uKHtcblx0XHRcdFx0J2RyYWdzdGFydCc6IHRoaXMuX29uRHJhZ1N0YXJ0LFxuXHRcdFx0XHQnZHJhZyc6IHRoaXMuX29uRHJhZyxcblx0XHRcdFx0J2RyYWdlbmQnOiB0aGlzLl9vbkRyYWdFbmRcblx0XHRcdH0sIHRoaXMpO1xuXG5cdFx0XHRpZiAobWFwLm9wdGlvbnMud29ybGRDb3B5SnVtcCkge1xuXHRcdFx0XHR0aGlzLl9kcmFnZ2FibGUub24oJ3ByZWRyYWcnLCB0aGlzLl9vblByZURyYWcsIHRoaXMpO1xuXHRcdFx0XHRtYXAub24oJ3ZpZXdyZXNldCcsIHRoaXMuX29uVmlld1Jlc2V0LCB0aGlzKTtcblxuXHRcdFx0XHRtYXAud2hlblJlYWR5KHRoaXMuX29uVmlld1Jlc2V0LCB0aGlzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5fZHJhZ2dhYmxlLmVuYWJsZSgpO1xuXHR9LFxuXG5cdHJlbW92ZUhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fZHJhZ2dhYmxlLmRpc2FibGUoKTtcblx0fSxcblxuXHRtb3ZlZDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLl9kcmFnZ2FibGUgJiYgdGhpcy5fZHJhZ2dhYmxlLl9tb3ZlZDtcblx0fSxcblxuXHRfb25EcmFnU3RhcnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG5cdFx0aWYgKG1hcC5fcGFuQW5pbSkge1xuXHRcdFx0bWFwLl9wYW5BbmltLnN0b3AoKTtcblx0XHR9XG5cblx0XHRtYXBcblx0XHQgICAgLmZpcmUoJ21vdmVzdGFydCcpXG5cdFx0ICAgIC5maXJlKCdkcmFnc3RhcnQnKTtcblxuXHRcdGlmIChtYXAub3B0aW9ucy5pbmVydGlhKSB7XG5cdFx0XHR0aGlzLl9wb3NpdGlvbnMgPSBbXTtcblx0XHRcdHRoaXMuX3RpbWVzID0gW107XG5cdFx0fVxuXHR9LFxuXG5cdF9vbkRyYWc6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5fbWFwLm9wdGlvbnMuaW5lcnRpYSkge1xuXHRcdFx0dmFyIHRpbWUgPSB0aGlzLl9sYXN0VGltZSA9ICtuZXcgRGF0ZSgpLFxuXHRcdFx0ICAgIHBvcyA9IHRoaXMuX2xhc3RQb3MgPSB0aGlzLl9kcmFnZ2FibGUuX25ld1BvcztcblxuXHRcdFx0dGhpcy5fcG9zaXRpb25zLnB1c2gocG9zKTtcblx0XHRcdHRoaXMuX3RpbWVzLnB1c2godGltZSk7XG5cblx0XHRcdGlmICh0aW1lIC0gdGhpcy5fdGltZXNbMF0gPiAyMDApIHtcblx0XHRcdFx0dGhpcy5fcG9zaXRpb25zLnNoaWZ0KCk7XG5cdFx0XHRcdHRoaXMuX3RpbWVzLnNoaWZ0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fbWFwXG5cdFx0ICAgIC5maXJlKCdtb3ZlJylcblx0XHQgICAgLmZpcmUoJ2RyYWcnKTtcblx0fSxcblxuXHRfb25WaWV3UmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBUT0RPIGZpeCBoYXJkY29kZWQgRWFydGggdmFsdWVzXG5cdFx0dmFyIHB4Q2VudGVyID0gdGhpcy5fbWFwLmdldFNpemUoKS5fZGl2aWRlQnkoMiksXG5cdFx0ICAgIHB4V29ybGRDZW50ZXIgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KFswLCAwXSk7XG5cblx0XHR0aGlzLl9pbml0aWFsV29ybGRPZmZzZXQgPSBweFdvcmxkQ2VudGVyLnN1YnRyYWN0KHB4Q2VudGVyKS54O1xuXHRcdHRoaXMuX3dvcmxkV2lkdGggPSB0aGlzLl9tYXAucHJvamVjdChbMCwgMTgwXSkueDtcblx0fSxcblxuXHRfb25QcmVEcmFnOiBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gVE9ETyByZWZhY3RvciB0byBiZSBhYmxlIHRvIGFkanVzdCBtYXAgcGFuZSBwb3NpdGlvbiBhZnRlciB6b29tXG5cdFx0dmFyIHdvcmxkV2lkdGggPSB0aGlzLl93b3JsZFdpZHRoLFxuXHRcdCAgICBoYWxmV2lkdGggPSBNYXRoLnJvdW5kKHdvcmxkV2lkdGggLyAyKSxcblx0XHQgICAgZHggPSB0aGlzLl9pbml0aWFsV29ybGRPZmZzZXQsXG5cdFx0ICAgIHggPSB0aGlzLl9kcmFnZ2FibGUuX25ld1Bvcy54LFxuXHRcdCAgICBuZXdYMSA9ICh4IC0gaGFsZldpZHRoICsgZHgpICUgd29ybGRXaWR0aCArIGhhbGZXaWR0aCAtIGR4LFxuXHRcdCAgICBuZXdYMiA9ICh4ICsgaGFsZldpZHRoICsgZHgpICUgd29ybGRXaWR0aCAtIGhhbGZXaWR0aCAtIGR4LFxuXHRcdCAgICBuZXdYID0gTWF0aC5hYnMobmV3WDEgKyBkeCkgPCBNYXRoLmFicyhuZXdYMiArIGR4KSA/IG5ld1gxIDogbmV3WDI7XG5cblx0XHR0aGlzLl9kcmFnZ2FibGUuX25ld1Bvcy54ID0gbmV3WDtcblx0fSxcblxuXHRfb25EcmFnRW5kOiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXAsXG5cdFx0ICAgIG9wdGlvbnMgPSBtYXAub3B0aW9ucyxcblx0XHQgICAgZGVsYXkgPSArbmV3IERhdGUoKSAtIHRoaXMuX2xhc3RUaW1lLFxuXG5cdFx0ICAgIG5vSW5lcnRpYSA9ICFvcHRpb25zLmluZXJ0aWEgfHwgZGVsYXkgPiBvcHRpb25zLmluZXJ0aWFUaHJlc2hvbGQgfHwgIXRoaXMuX3Bvc2l0aW9uc1swXTtcblxuXHRcdG1hcC5maXJlKCdkcmFnZW5kJywgZSk7XG5cblx0XHRpZiAobm9JbmVydGlhKSB7XG5cdFx0XHRtYXAuZmlyZSgnbW92ZWVuZCcpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dmFyIGRpcmVjdGlvbiA9IHRoaXMuX2xhc3RQb3Muc3VidHJhY3QodGhpcy5fcG9zaXRpb25zWzBdKSxcblx0XHRcdCAgICBkdXJhdGlvbiA9ICh0aGlzLl9sYXN0VGltZSArIGRlbGF5IC0gdGhpcy5fdGltZXNbMF0pIC8gMTAwMCxcblx0XHRcdCAgICBlYXNlID0gb3B0aW9ucy5lYXNlTGluZWFyaXR5LFxuXG5cdFx0XHQgICAgc3BlZWRWZWN0b3IgPSBkaXJlY3Rpb24ubXVsdGlwbHlCeShlYXNlIC8gZHVyYXRpb24pLFxuXHRcdFx0ICAgIHNwZWVkID0gc3BlZWRWZWN0b3IuZGlzdGFuY2VUbyhbMCwgMF0pLFxuXG5cdFx0XHQgICAgbGltaXRlZFNwZWVkID0gTWF0aC5taW4ob3B0aW9ucy5pbmVydGlhTWF4U3BlZWQsIHNwZWVkKSxcblx0XHRcdCAgICBsaW1pdGVkU3BlZWRWZWN0b3IgPSBzcGVlZFZlY3Rvci5tdWx0aXBseUJ5KGxpbWl0ZWRTcGVlZCAvIHNwZWVkKSxcblxuXHRcdFx0ICAgIGRlY2VsZXJhdGlvbkR1cmF0aW9uID0gbGltaXRlZFNwZWVkIC8gKG9wdGlvbnMuaW5lcnRpYURlY2VsZXJhdGlvbiAqIGVhc2UpLFxuXHRcdFx0ICAgIG9mZnNldCA9IGxpbWl0ZWRTcGVlZFZlY3Rvci5tdWx0aXBseUJ5KC1kZWNlbGVyYXRpb25EdXJhdGlvbiAvIDIpLnJvdW5kKCk7XG5cblx0XHRcdGlmICghb2Zmc2V0LnggfHwgIW9mZnNldC55KSB7XG5cdFx0XHRcdG1hcC5maXJlKCdtb3ZlZW5kJyk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9mZnNldCA9IG1hcC5fbGltaXRPZmZzZXQob2Zmc2V0LCBtYXAub3B0aW9ucy5tYXhCb3VuZHMpO1xuXG5cdFx0XHRcdEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRtYXAucGFuQnkob2Zmc2V0LCB7XG5cdFx0XHRcdFx0XHRkdXJhdGlvbjogZGVjZWxlcmF0aW9uRHVyYXRpb24sXG5cdFx0XHRcdFx0XHRlYXNlTGluZWFyaXR5OiBlYXNlLFxuXHRcdFx0XHRcdFx0bm9Nb3ZlU3RhcnQ6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KTtcblxuTC5NYXAuYWRkSW5pdEhvb2soJ2FkZEhhbmRsZXInLCAnZHJhZ2dpbmcnLCBMLk1hcC5EcmFnKTtcblxuXG4vKlxuICogTC5IYW5kbGVyLkRvdWJsZUNsaWNrWm9vbSBpcyB1c2VkIHRvIGhhbmRsZSBkb3VibGUtY2xpY2sgem9vbSBvbiB0aGUgbWFwLCBlbmFibGVkIGJ5IGRlZmF1bHQuXG4gKi9cblxuTC5NYXAubWVyZ2VPcHRpb25zKHtcblx0ZG91YmxlQ2xpY2tab29tOiB0cnVlXG59KTtcblxuTC5NYXAuRG91YmxlQ2xpY2tab29tID0gTC5IYW5kbGVyLmV4dGVuZCh7XG5cdGFkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fbWFwLm9uKCdkYmxjbGljaycsIHRoaXMuX29uRG91YmxlQ2xpY2ssIHRoaXMpO1xuXHR9LFxuXG5cdHJlbW92ZUhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fbWFwLm9mZignZGJsY2xpY2snLCB0aGlzLl9vbkRvdWJsZUNsaWNrLCB0aGlzKTtcblx0fSxcblxuXHRfb25Eb3VibGVDbGljazogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxuXHRcdCAgICB6b29tID0gbWFwLmdldFpvb20oKSArIChlLm9yaWdpbmFsRXZlbnQuc2hpZnRLZXkgPyAtMSA6IDEpO1xuXG5cdFx0aWYgKG1hcC5vcHRpb25zLmRvdWJsZUNsaWNrWm9vbSA9PT0gJ2NlbnRlcicpIHtcblx0XHRcdG1hcC5zZXRab29tKHpvb20pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtYXAuc2V0Wm9vbUFyb3VuZChlLmNvbnRhaW5lclBvaW50LCB6b29tKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5MLk1hcC5hZGRJbml0SG9vaygnYWRkSGFuZGxlcicsICdkb3VibGVDbGlja1pvb20nLCBMLk1hcC5Eb3VibGVDbGlja1pvb20pO1xuXG5cbi8qXG4gKiBMLkhhbmRsZXIuU2Nyb2xsV2hlZWxab29tIGlzIHVzZWQgYnkgTC5NYXAgdG8gZW5hYmxlIG1vdXNlIHNjcm9sbCB3aGVlbCB6b29tIG9uIHRoZSBtYXAuXG4gKi9cblxuTC5NYXAubWVyZ2VPcHRpb25zKHtcblx0c2Nyb2xsV2hlZWxab29tOiB0cnVlXG59KTtcblxuTC5NYXAuU2Nyb2xsV2hlZWxab29tID0gTC5IYW5kbGVyLmV4dGVuZCh7XG5cdGFkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vbih0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ21vdXNld2hlZWwnLCB0aGlzLl9vbldoZWVsU2Nyb2xsLCB0aGlzKTtcblx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX21hcC5fY29udGFpbmVyLCAnTW96TW91c2VQaXhlbFNjcm9sbCcsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xuXHRcdHRoaXMuX2RlbHRhID0gMDtcblx0fSxcblxuXHRyZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tRXZlbnQub2ZmKHRoaXMuX21hcC5fY29udGFpbmVyLCAnbW91c2V3aGVlbCcsIHRoaXMuX29uV2hlZWxTY3JvbGwpO1xuXHRcdEwuRG9tRXZlbnQub2ZmKHRoaXMuX21hcC5fY29udGFpbmVyLCAnTW96TW91c2VQaXhlbFNjcm9sbCcsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xuXHR9LFxuXG5cdF9vbldoZWVsU2Nyb2xsOiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBkZWx0YSA9IEwuRG9tRXZlbnQuZ2V0V2hlZWxEZWx0YShlKTtcblxuXHRcdHRoaXMuX2RlbHRhICs9IGRlbHRhO1xuXHRcdHRoaXMuX2xhc3RNb3VzZVBvcyA9IHRoaXMuX21hcC5tb3VzZUV2ZW50VG9Db250YWluZXJQb2ludChlKTtcblxuXHRcdGlmICghdGhpcy5fc3RhcnRUaW1lKSB7XG5cdFx0XHR0aGlzLl9zdGFydFRpbWUgPSArbmV3IERhdGUoKTtcblx0XHR9XG5cblx0XHR2YXIgbGVmdCA9IE1hdGgubWF4KDQwIC0gKCtuZXcgRGF0ZSgpIC0gdGhpcy5fc3RhcnRUaW1lKSwgMCk7XG5cblx0XHRjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuXHRcdHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChMLmJpbmQodGhpcy5fcGVyZm9ybVpvb20sIHRoaXMpLCBsZWZ0KTtcblxuXHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XG5cdFx0TC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24oZSk7XG5cdH0sXG5cblx0X3BlcmZvcm1ab29tOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcCxcblx0XHQgICAgZGVsdGEgPSB0aGlzLl9kZWx0YSxcblx0XHQgICAgem9vbSA9IG1hcC5nZXRab29tKCk7XG5cblx0XHRkZWx0YSA9IGRlbHRhID4gMCA/IE1hdGguY2VpbChkZWx0YSkgOiBNYXRoLmZsb29yKGRlbHRhKTtcblx0XHRkZWx0YSA9IE1hdGgubWF4KE1hdGgubWluKGRlbHRhLCA0KSwgLTQpO1xuXHRcdGRlbHRhID0gbWFwLl9saW1pdFpvb20oem9vbSArIGRlbHRhKSAtIHpvb207XG5cblx0XHR0aGlzLl9kZWx0YSA9IDA7XG5cdFx0dGhpcy5fc3RhcnRUaW1lID0gbnVsbDtcblxuXHRcdGlmICghZGVsdGEpIHsgcmV0dXJuOyB9XG5cblx0XHRpZiAobWFwLm9wdGlvbnMuc2Nyb2xsV2hlZWxab29tID09PSAnY2VudGVyJykge1xuXHRcdFx0bWFwLnNldFpvb20oem9vbSArIGRlbHRhKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bWFwLnNldFpvb21Bcm91bmQodGhpcy5fbGFzdE1vdXNlUG9zLCB6b29tICsgZGVsdGEpO1xuXHRcdH1cblx0fVxufSk7XG5cbkwuTWFwLmFkZEluaXRIb29rKCdhZGRIYW5kbGVyJywgJ3Njcm9sbFdoZWVsWm9vbScsIEwuTWFwLlNjcm9sbFdoZWVsWm9vbSk7XG5cblxuLypcclxuICogRXh0ZW5kcyB0aGUgZXZlbnQgaGFuZGxpbmcgY29kZSB3aXRoIGRvdWJsZSB0YXAgc3VwcG9ydCBmb3IgbW9iaWxlIGJyb3dzZXJzLlxyXG4gKi9cclxuXHJcbkwuZXh0ZW5kKEwuRG9tRXZlbnQsIHtcclxuXHJcblx0X3RvdWNoc3RhcnQ6IEwuQnJvd3Nlci5tc1BvaW50ZXIgPyAnTVNQb2ludGVyRG93bicgOiBMLkJyb3dzZXIucG9pbnRlciA/ICdwb2ludGVyZG93bicgOiAndG91Y2hzdGFydCcsXHJcblx0X3RvdWNoZW5kOiBMLkJyb3dzZXIubXNQb2ludGVyID8gJ01TUG9pbnRlclVwJyA6IEwuQnJvd3Nlci5wb2ludGVyID8gJ3BvaW50ZXJ1cCcgOiAndG91Y2hlbmQnLFxyXG5cclxuXHQvLyBpbnNwaXJlZCBieSBaZXB0byB0b3VjaCBjb2RlIGJ5IFRob21hcyBGdWNoc1xyXG5cdGFkZERvdWJsZVRhcExpc3RlbmVyOiBmdW5jdGlvbiAob2JqLCBoYW5kbGVyLCBpZCkge1xyXG5cdFx0dmFyIGxhc3QsXHJcblx0XHQgICAgZG91YmxlVGFwID0gZmFsc2UsXHJcblx0XHQgICAgZGVsYXkgPSAyNTAsXHJcblx0XHQgICAgdG91Y2gsXHJcblx0XHQgICAgcHJlID0gJ19sZWFmbGV0XycsXHJcblx0XHQgICAgdG91Y2hzdGFydCA9IHRoaXMuX3RvdWNoc3RhcnQsXHJcblx0XHQgICAgdG91Y2hlbmQgPSB0aGlzLl90b3VjaGVuZCxcclxuXHRcdCAgICB0cmFja2VkVG91Y2hlcyA9IFtdO1xyXG5cclxuXHRcdGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XHJcblx0XHRcdHZhciBjb3VudDtcclxuXHJcblx0XHRcdGlmIChMLkJyb3dzZXIucG9pbnRlcikge1xyXG5cdFx0XHRcdHRyYWNrZWRUb3VjaGVzLnB1c2goZS5wb2ludGVySWQpO1xyXG5cdFx0XHRcdGNvdW50ID0gdHJhY2tlZFRvdWNoZXMubGVuZ3RoO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvdW50ID0gZS50b3VjaGVzLmxlbmd0aDtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoY291bnQgPiAxKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgbm93ID0gRGF0ZS5ub3coKSxcclxuXHRcdFx0XHRkZWx0YSA9IG5vdyAtIChsYXN0IHx8IG5vdyk7XHJcblxyXG5cdFx0XHR0b3VjaCA9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXSA6IGU7XHJcblx0XHRcdGRvdWJsZVRhcCA9IChkZWx0YSA+IDAgJiYgZGVsdGEgPD0gZGVsYXkpO1xyXG5cdFx0XHRsYXN0ID0gbm93O1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIG9uVG91Y2hFbmQoZSkge1xyXG5cdFx0XHRpZiAoTC5Ccm93c2VyLnBvaW50ZXIpIHtcclxuXHRcdFx0XHR2YXIgaWR4ID0gdHJhY2tlZFRvdWNoZXMuaW5kZXhPZihlLnBvaW50ZXJJZCk7XHJcblx0XHRcdFx0aWYgKGlkeCA9PT0gLTEpIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dHJhY2tlZFRvdWNoZXMuc3BsaWNlKGlkeCwgMSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChkb3VibGVUYXApIHtcclxuXHRcdFx0XHRpZiAoTC5Ccm93c2VyLnBvaW50ZXIpIHtcclxuXHRcdFx0XHRcdC8vIHdvcmsgYXJvdW5kIC50eXBlIGJlaW5nIHJlYWRvbmx5IHdpdGggTVNQb2ludGVyKiBldmVudHNcclxuXHRcdFx0XHRcdHZhciBuZXdUb3VjaCA9IHsgfSxcclxuXHRcdFx0XHRcdFx0cHJvcDtcclxuXHJcblx0XHRcdFx0XHQvLyBqc2hpbnQgZm9yaW46ZmFsc2VcclxuXHRcdFx0XHRcdGZvciAodmFyIGkgaW4gdG91Y2gpIHtcclxuXHRcdFx0XHRcdFx0cHJvcCA9IHRvdWNoW2ldO1xyXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRcdFx0XHRuZXdUb3VjaFtpXSA9IHByb3AuYmluZCh0b3VjaCk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0bmV3VG91Y2hbaV0gPSBwcm9wO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR0b3VjaCA9IG5ld1RvdWNoO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0b3VjaC50eXBlID0gJ2RibGNsaWNrJztcclxuXHRcdFx0XHRoYW5kbGVyKHRvdWNoKTtcclxuXHRcdFx0XHRsYXN0ID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0b2JqW3ByZSArIHRvdWNoc3RhcnQgKyBpZF0gPSBvblRvdWNoU3RhcnQ7XHJcblx0XHRvYmpbcHJlICsgdG91Y2hlbmQgKyBpZF0gPSBvblRvdWNoRW5kO1xyXG5cclxuXHRcdC8vIG9uIHBvaW50ZXIgd2UgbmVlZCB0byBsaXN0ZW4gb24gdGhlIGRvY3VtZW50LCBvdGhlcndpc2UgYSBkcmFnIHN0YXJ0aW5nIG9uIHRoZSBtYXAgYW5kIG1vdmluZyBvZmYgc2NyZWVuXHJcblx0XHQvLyB3aWxsIG5vdCBjb21lIHRocm91Z2ggdG8gdXMsIHNvIHdlIHdpbGwgbG9zZSB0cmFjayBvZiBob3cgbWFueSB0b3VjaGVzIGFyZSBvbmdvaW5nXHJcblx0XHR2YXIgZW5kRWxlbWVudCA9IEwuQnJvd3Nlci5wb2ludGVyID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IDogb2JqO1xyXG5cclxuXHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHRvdWNoc3RhcnQsIG9uVG91Y2hTdGFydCwgZmFsc2UpO1xyXG5cdFx0ZW5kRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRvdWNoZW5kLCBvblRvdWNoRW5kLCBmYWxzZSk7XHJcblxyXG5cdFx0aWYgKEwuQnJvd3Nlci5wb2ludGVyKSB7XHJcblx0XHRcdGVuZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihMLkRvbUV2ZW50LlBPSU5URVJfQ0FOQ0VMLCBvblRvdWNoRW5kLCBmYWxzZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0cmVtb3ZlRG91YmxlVGFwTGlzdGVuZXI6IGZ1bmN0aW9uIChvYmosIGlkKSB7XHJcblx0XHR2YXIgcHJlID0gJ19sZWFmbGV0Xyc7XHJcblxyXG5cdFx0b2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5fdG91Y2hzdGFydCwgb2JqW3ByZSArIHRoaXMuX3RvdWNoc3RhcnQgKyBpZF0sIGZhbHNlKTtcclxuXHRcdChMLkJyb3dzZXIucG9pbnRlciA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA6IG9iaikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcclxuXHRcdCAgICAgICAgdGhpcy5fdG91Y2hlbmQsIG9ialtwcmUgKyB0aGlzLl90b3VjaGVuZCArIGlkXSwgZmFsc2UpO1xyXG5cclxuXHRcdGlmIChMLkJyb3dzZXIucG9pbnRlcikge1xyXG5cdFx0XHRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihMLkRvbUV2ZW50LlBPSU5URVJfQ0FOQ0VMLCBvYmpbcHJlICsgdGhpcy5fdG91Y2hlbmQgKyBpZF0sXHJcblx0XHRcdFx0ZmFsc2UpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxuICogRXh0ZW5kcyBMLkRvbUV2ZW50IHRvIHByb3ZpZGUgdG91Y2ggc3VwcG9ydCBmb3IgSW50ZXJuZXQgRXhwbG9yZXIgYW5kIFdpbmRvd3MtYmFzZWQgZGV2aWNlcy5cbiAqL1xuXG5MLmV4dGVuZChMLkRvbUV2ZW50LCB7XG5cblx0Ly9zdGF0aWNcblx0UE9JTlRFUl9ET1dOOiBMLkJyb3dzZXIubXNQb2ludGVyID8gJ01TUG9pbnRlckRvd24nIDogJ3BvaW50ZXJkb3duJyxcblx0UE9JTlRFUl9NT1ZFOiBMLkJyb3dzZXIubXNQb2ludGVyID8gJ01TUG9pbnRlck1vdmUnIDogJ3BvaW50ZXJtb3ZlJyxcblx0UE9JTlRFUl9VUDogTC5Ccm93c2VyLm1zUG9pbnRlciA/ICdNU1BvaW50ZXJVcCcgOiAncG9pbnRlcnVwJyxcblx0UE9JTlRFUl9DQU5DRUw6IEwuQnJvd3Nlci5tc1BvaW50ZXIgPyAnTVNQb2ludGVyQ2FuY2VsJyA6ICdwb2ludGVyY2FuY2VsJyxcblxuXHRfcG9pbnRlcnM6IFtdLFxuXHRfcG9pbnRlckRvY3VtZW50TGlzdGVuZXI6IGZhbHNlLFxuXG5cdC8vIFByb3ZpZGVzIGEgdG91Y2ggZXZlbnRzIHdyYXBwZXIgZm9yIChtcylwb2ludGVyIGV2ZW50cy5cblx0Ly8gQmFzZWQgb24gY2hhbmdlcyBieSB2ZXByb3phIGh0dHBzOi8vZ2l0aHViLmNvbS9DbG91ZE1hZGUvTGVhZmxldC9wdWxsLzEwMTlcblx0Ly9yZWYgaHR0cDovL3d3dy53My5vcmcvVFIvcG9pbnRlcmV2ZW50cy8gaHR0cHM6Ly93d3cudzMub3JnL0J1Z3MvUHVibGljL3Nob3dfYnVnLmNnaT9pZD0yMjg5MFxuXG5cdGFkZFBvaW50ZXJMaXN0ZW5lcjogZnVuY3Rpb24gKG9iaiwgdHlwZSwgaGFuZGxlciwgaWQpIHtcblxuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdGNhc2UgJ3RvdWNoc3RhcnQnOlxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkUG9pbnRlckxpc3RlbmVyU3RhcnQob2JqLCB0eXBlLCBoYW5kbGVyLCBpZCk7XG5cdFx0Y2FzZSAndG91Y2hlbmQnOlxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkUG9pbnRlckxpc3RlbmVyRW5kKG9iaiwgdHlwZSwgaGFuZGxlciwgaWQpO1xuXHRcdGNhc2UgJ3RvdWNobW92ZSc6XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRQb2ludGVyTGlzdGVuZXJNb3ZlKG9iaiwgdHlwZSwgaGFuZGxlciwgaWQpO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyAnVW5rbm93biB0b3VjaCBldmVudCB0eXBlJztcblx0XHR9XG5cdH0sXG5cblx0YWRkUG9pbnRlckxpc3RlbmVyU3RhcnQ6IGZ1bmN0aW9uIChvYmosIHR5cGUsIGhhbmRsZXIsIGlkKSB7XG5cdFx0dmFyIHByZSA9ICdfbGVhZmxldF8nLFxuXHRcdCAgICBwb2ludGVycyA9IHRoaXMuX3BvaW50ZXJzO1xuXG5cdFx0dmFyIGNiID0gZnVuY3Rpb24gKGUpIHtcblxuXHRcdFx0TC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdChlKTtcblxuXHRcdFx0dmFyIGFscmVhZHlJbkFycmF5ID0gZmFsc2U7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChwb2ludGVyc1tpXS5wb2ludGVySWQgPT09IGUucG9pbnRlcklkKSB7XG5cdFx0XHRcdFx0YWxyZWFkeUluQXJyYXkgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoIWFscmVhZHlJbkFycmF5KSB7XG5cdFx0XHRcdHBvaW50ZXJzLnB1c2goZSk7XG5cdFx0XHR9XG5cblx0XHRcdGUudG91Y2hlcyA9IHBvaW50ZXJzLnNsaWNlKCk7XG5cdFx0XHRlLmNoYW5nZWRUb3VjaGVzID0gW2VdO1xuXG5cdFx0XHRoYW5kbGVyKGUpO1xuXHRcdH07XG5cblx0XHRvYmpbcHJlICsgJ3RvdWNoc3RhcnQnICsgaWRdID0gY2I7XG5cdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX0RPV04sIGNiLCBmYWxzZSk7XG5cblx0XHQvLyBuZWVkIHRvIGFsc28gbGlzdGVuIGZvciBlbmQgZXZlbnRzIHRvIGtlZXAgdGhlIF9wb2ludGVycyBsaXN0IGFjY3VyYXRlXG5cdFx0Ly8gdGhpcyBuZWVkcyB0byBiZSBvbiB0aGUgYm9keSBhbmQgbmV2ZXIgZ28gYXdheVxuXHRcdGlmICghdGhpcy5fcG9pbnRlckRvY3VtZW50TGlzdGVuZXIpIHtcblx0XHRcdHZhciBpbnRlcm5hbENiID0gZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmIChwb2ludGVyc1tpXS5wb2ludGVySWQgPT09IGUucG9pbnRlcklkKSB7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHQvL1dlIGxpc3RlbiBvbiB0aGUgZG9jdW1lbnRFbGVtZW50IGFzIGFueSBkcmFncyB0aGF0IGVuZCBieSBtb3ZpbmcgdGhlIHRvdWNoIG9mZiB0aGUgc2NyZWVuIGdldCBmaXJlZCB0aGVyZVxuXHRcdFx0ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX1VQLCBpbnRlcm5hbENiLCBmYWxzZSk7XG5cdFx0XHRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfQ0FOQ0VMLCBpbnRlcm5hbENiLCBmYWxzZSk7XG5cblx0XHRcdHRoaXMuX3BvaW50ZXJEb2N1bWVudExpc3RlbmVyID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRhZGRQb2ludGVyTGlzdGVuZXJNb3ZlOiBmdW5jdGlvbiAob2JqLCB0eXBlLCBoYW5kbGVyLCBpZCkge1xuXHRcdHZhciBwcmUgPSAnX2xlYWZsZXRfJyxcblx0XHQgICAgdG91Y2hlcyA9IHRoaXMuX3BvaW50ZXJzO1xuXG5cdFx0ZnVuY3Rpb24gY2IoZSkge1xuXG5cdFx0XHQvLyBkb24ndCBmaXJlIHRvdWNoIG1vdmVzIHdoZW4gbW91c2UgaXNuJ3QgZG93blxuXHRcdFx0aWYgKChlLnBvaW50ZXJUeXBlID09PSBlLk1TUE9JTlRFUl9UWVBFX01PVVNFIHx8IGUucG9pbnRlclR5cGUgPT09ICdtb3VzZScpICYmIGUuYnV0dG9ucyA9PT0gMCkgeyByZXR1cm47IH1cblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3VjaGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICh0b3VjaGVzW2ldLnBvaW50ZXJJZCA9PT0gZS5wb2ludGVySWQpIHtcblx0XHRcdFx0XHR0b3VjaGVzW2ldID0gZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRlLnRvdWNoZXMgPSB0b3VjaGVzLnNsaWNlKCk7XG5cdFx0XHRlLmNoYW5nZWRUb3VjaGVzID0gW2VdO1xuXG5cdFx0XHRoYW5kbGVyKGUpO1xuXHRcdH1cblxuXHRcdG9ialtwcmUgKyAndG91Y2htb3ZlJyArIGlkXSA9IGNiO1xuXHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9NT1ZFLCBjYiwgZmFsc2UpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0YWRkUG9pbnRlckxpc3RlbmVyRW5kOiBmdW5jdGlvbiAob2JqLCB0eXBlLCBoYW5kbGVyLCBpZCkge1xuXHRcdHZhciBwcmUgPSAnX2xlYWZsZXRfJyxcblx0XHQgICAgdG91Y2hlcyA9IHRoaXMuX3BvaW50ZXJzO1xuXG5cdFx0dmFyIGNiID0gZnVuY3Rpb24gKGUpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAodG91Y2hlc1tpXS5wb2ludGVySWQgPT09IGUucG9pbnRlcklkKSB7XG5cdFx0XHRcdFx0dG91Y2hlcy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZS50b3VjaGVzID0gdG91Y2hlcy5zbGljZSgpO1xuXHRcdFx0ZS5jaGFuZ2VkVG91Y2hlcyA9IFtlXTtcblxuXHRcdFx0aGFuZGxlcihlKTtcblx0XHR9O1xuXG5cdFx0b2JqW3ByZSArICd0b3VjaGVuZCcgKyBpZF0gPSBjYjtcblx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0aGlzLlBPSU5URVJfVVAsIGNiLCBmYWxzZSk7XG5cdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX0NBTkNFTCwgY2IsIGZhbHNlKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHJlbW92ZVBvaW50ZXJMaXN0ZW5lcjogZnVuY3Rpb24gKG9iaiwgdHlwZSwgaWQpIHtcblx0XHR2YXIgcHJlID0gJ19sZWFmbGV0XycsXG5cdFx0ICAgIGNiID0gb2JqW3ByZSArIHR5cGUgKyBpZF07XG5cblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRjYXNlICd0b3VjaHN0YXJ0Jzpcblx0XHRcdG9iai5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9ET1dOLCBjYiwgZmFsc2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAndG91Y2htb3ZlJzpcblx0XHRcdG9iai5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuUE9JTlRFUl9NT1ZFLCBjYiwgZmFsc2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAndG91Y2hlbmQnOlxuXHRcdFx0b2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX1VQLCBjYiwgZmFsc2UpO1xuXHRcdFx0b2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5QT0lOVEVSX0NBTkNFTCwgY2IsIGZhbHNlKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxuXG4vKlxuICogTC5IYW5kbGVyLlRvdWNoWm9vbSBpcyB1c2VkIGJ5IEwuTWFwIHRvIGFkZCBwaW5jaCB6b29tIG9uIHN1cHBvcnRlZCBtb2JpbGUgYnJvd3NlcnMuXG4gKi9cblxuTC5NYXAubWVyZ2VPcHRpb25zKHtcblx0dG91Y2hab29tOiBMLkJyb3dzZXIudG91Y2ggJiYgIUwuQnJvd3Nlci5hbmRyb2lkMjMsXG5cdGJvdW5jZUF0Wm9vbUxpbWl0czogdHJ1ZVxufSk7XG5cbkwuTWFwLlRvdWNoWm9vbSA9IEwuSGFuZGxlci5leHRlbmQoe1xuXHRhZGRIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tRXZlbnQub24odGhpcy5fbWFwLl9jb250YWluZXIsICd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaFN0YXJ0LCB0aGlzKTtcblx0fSxcblxuXHRyZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tRXZlbnQub2ZmKHRoaXMuX21hcC5fY29udGFpbmVyLCAndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2hTdGFydCwgdGhpcyk7XG5cdH0sXG5cblx0X29uVG91Y2hTdGFydDogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG5cdFx0aWYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCAhPT0gMiB8fCBtYXAuX2FuaW1hdGluZ1pvb20gfHwgdGhpcy5fem9vbWluZykgeyByZXR1cm47IH1cblxuXHRcdHZhciBwMSA9IG1hcC5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUudG91Y2hlc1swXSksXG5cdFx0ICAgIHAyID0gbWFwLm1vdXNlRXZlbnRUb0xheWVyUG9pbnQoZS50b3VjaGVzWzFdKSxcblx0XHQgICAgdmlld0NlbnRlciA9IG1hcC5fZ2V0Q2VudGVyTGF5ZXJQb2ludCgpO1xuXG5cdFx0dGhpcy5fc3RhcnRDZW50ZXIgPSBwMS5hZGQocDIpLl9kaXZpZGVCeSgyKTtcblx0XHR0aGlzLl9zdGFydERpc3QgPSBwMS5kaXN0YW5jZVRvKHAyKTtcblxuXHRcdHRoaXMuX21vdmVkID0gZmFsc2U7XG5cdFx0dGhpcy5fem9vbWluZyA9IHRydWU7XG5cblx0XHR0aGlzLl9jZW50ZXJPZmZzZXQgPSB2aWV3Q2VudGVyLnN1YnRyYWN0KHRoaXMuX3N0YXJ0Q2VudGVyKTtcblxuXHRcdGlmIChtYXAuX3BhbkFuaW0pIHtcblx0XHRcdG1hcC5fcGFuQW5pbS5zdG9wKCk7XG5cdFx0fVxuXG5cdFx0TC5Eb21FdmVudFxuXHRcdCAgICAub24oZG9jdW1lbnQsICd0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoTW92ZSwgdGhpcylcblx0XHQgICAgLm9uKGRvY3VtZW50LCAndG91Y2hlbmQnLCB0aGlzLl9vblRvdWNoRW5kLCB0aGlzKTtcblxuXHRcdEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQoZSk7XG5cdH0sXG5cblx0X29uVG91Y2hNb3ZlOiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cblx0XHRpZiAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoICE9PSAyIHx8ICF0aGlzLl96b29taW5nKSB7IHJldHVybjsgfVxuXG5cdFx0dmFyIHAxID0gbWFwLm1vdXNlRXZlbnRUb0xheWVyUG9pbnQoZS50b3VjaGVzWzBdKSxcblx0XHQgICAgcDIgPSBtYXAubW91c2VFdmVudFRvTGF5ZXJQb2ludChlLnRvdWNoZXNbMV0pO1xuXG5cdFx0dGhpcy5fc2NhbGUgPSBwMS5kaXN0YW5jZVRvKHAyKSAvIHRoaXMuX3N0YXJ0RGlzdDtcblx0XHR0aGlzLl9kZWx0YSA9IHAxLl9hZGQocDIpLl9kaXZpZGVCeSgyKS5fc3VidHJhY3QodGhpcy5fc3RhcnRDZW50ZXIpO1xuXG5cdFx0aWYgKHRoaXMuX3NjYWxlID09PSAxKSB7IHJldHVybjsgfVxuXG5cdFx0aWYgKCFtYXAub3B0aW9ucy5ib3VuY2VBdFpvb21MaW1pdHMpIHtcblx0XHRcdGlmICgobWFwLmdldFpvb20oKSA9PT0gbWFwLmdldE1pblpvb20oKSAmJiB0aGlzLl9zY2FsZSA8IDEpIHx8XG5cdFx0XHQgICAgKG1hcC5nZXRab29tKCkgPT09IG1hcC5nZXRNYXhab29tKCkgJiYgdGhpcy5fc2NhbGUgPiAxKSkgeyByZXR1cm47IH1cblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuX21vdmVkKSB7XG5cdFx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MobWFwLl9tYXBQYW5lLCAnbGVhZmxldC10b3VjaGluZycpO1xuXG5cdFx0XHRtYXBcblx0XHRcdCAgICAuZmlyZSgnbW92ZXN0YXJ0Jylcblx0XHRcdCAgICAuZmlyZSgnem9vbXN0YXJ0Jyk7XG5cblx0XHRcdHRoaXMuX21vdmVkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRMLlV0aWwuY2FuY2VsQW5pbUZyYW1lKHRoaXMuX2FuaW1SZXF1ZXN0KTtcblx0XHR0aGlzLl9hbmltUmVxdWVzdCA9IEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKFxuXHRcdCAgICAgICAgdGhpcy5fdXBkYXRlT25Nb3ZlLCB0aGlzLCB0cnVlLCB0aGlzLl9tYXAuX2NvbnRhaW5lcik7XG5cblx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xuXHR9LFxuXG5cdF91cGRhdGVPbk1vdmU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxuXHRcdCAgICBvcmlnaW4gPSB0aGlzLl9nZXRTY2FsZU9yaWdpbigpLFxuXHRcdCAgICBjZW50ZXIgPSBtYXAubGF5ZXJQb2ludFRvTGF0TG5nKG9yaWdpbiksXG5cdFx0ICAgIHpvb20gPSBtYXAuZ2V0U2NhbGVab29tKHRoaXMuX3NjYWxlKTtcblxuXHRcdG1hcC5fYW5pbWF0ZVpvb20oY2VudGVyLCB6b29tLCB0aGlzLl9zdGFydENlbnRlciwgdGhpcy5fc2NhbGUsIHRoaXMuX2RlbHRhKTtcblx0fSxcblxuXHRfb25Ub3VjaEVuZDogZnVuY3Rpb24gKCkge1xuXHRcdGlmICghdGhpcy5fbW92ZWQgfHwgIXRoaXMuX3pvb21pbmcpIHtcblx0XHRcdHRoaXMuX3pvb21pbmcgPSBmYWxzZTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG5cdFx0dGhpcy5fem9vbWluZyA9IGZhbHNlO1xuXHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhtYXAuX21hcFBhbmUsICdsZWFmbGV0LXRvdWNoaW5nJyk7XG5cdFx0TC5VdGlsLmNhbmNlbEFuaW1GcmFtZSh0aGlzLl9hbmltUmVxdWVzdCk7XG5cblx0XHRMLkRvbUV2ZW50XG5cdFx0ICAgIC5vZmYoZG9jdW1lbnQsICd0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoTW92ZSlcblx0XHQgICAgLm9mZihkb2N1bWVudCwgJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaEVuZCk7XG5cblx0XHR2YXIgb3JpZ2luID0gdGhpcy5fZ2V0U2NhbGVPcmlnaW4oKSxcblx0XHQgICAgY2VudGVyID0gbWFwLmxheWVyUG9pbnRUb0xhdExuZyhvcmlnaW4pLFxuXG5cdFx0ICAgIG9sZFpvb20gPSBtYXAuZ2V0Wm9vbSgpLFxuXHRcdCAgICBmbG9hdFpvb21EZWx0YSA9IG1hcC5nZXRTY2FsZVpvb20odGhpcy5fc2NhbGUpIC0gb2xkWm9vbSxcblx0XHQgICAgcm91bmRab29tRGVsdGEgPSAoZmxvYXRab29tRGVsdGEgPiAwID9cblx0XHQgICAgICAgICAgICBNYXRoLmNlaWwoZmxvYXRab29tRGVsdGEpIDogTWF0aC5mbG9vcihmbG9hdFpvb21EZWx0YSkpLFxuXG5cdFx0ICAgIHpvb20gPSBtYXAuX2xpbWl0Wm9vbShvbGRab29tICsgcm91bmRab29tRGVsdGEpLFxuXHRcdCAgICBzY2FsZSA9IG1hcC5nZXRab29tU2NhbGUoem9vbSkgLyB0aGlzLl9zY2FsZTtcblxuXHRcdG1hcC5fYW5pbWF0ZVpvb20oY2VudGVyLCB6b29tLCBvcmlnaW4sIHNjYWxlKTtcblx0fSxcblxuXHRfZ2V0U2NhbGVPcmlnaW46IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgY2VudGVyT2Zmc2V0ID0gdGhpcy5fY2VudGVyT2Zmc2V0LnN1YnRyYWN0KHRoaXMuX2RlbHRhKS5kaXZpZGVCeSh0aGlzLl9zY2FsZSk7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YXJ0Q2VudGVyLmFkZChjZW50ZXJPZmZzZXQpO1xuXHR9XG59KTtcblxuTC5NYXAuYWRkSW5pdEhvb2soJ2FkZEhhbmRsZXInLCAndG91Y2hab29tJywgTC5NYXAuVG91Y2hab29tKTtcblxuXG4vKlxuICogTC5NYXAuVGFwIGlzIHVzZWQgdG8gZW5hYmxlIG1vYmlsZSBoYWNrcyBsaWtlIHF1aWNrIHRhcHMgYW5kIGxvbmcgaG9sZC5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHR0YXA6IHRydWUsXG5cdHRhcFRvbGVyYW5jZTogMTVcbn0pO1xuXG5MLk1hcC5UYXAgPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0YWRkSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9uKHRoaXMuX21hcC5fY29udGFpbmVyLCAndG91Y2hzdGFydCcsIHRoaXMuX29uRG93biwgdGhpcyk7XG5cdH0sXG5cblx0cmVtb3ZlSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9mZih0aGlzLl9tYXAuX2NvbnRhaW5lciwgJ3RvdWNoc3RhcnQnLCB0aGlzLl9vbkRvd24sIHRoaXMpO1xuXHR9LFxuXG5cdF9vbkRvd246IGZ1bmN0aW9uIChlKSB7XG5cdFx0aWYgKCFlLnRvdWNoZXMpIHsgcmV0dXJuOyB9XG5cblx0XHRMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KGUpO1xuXG5cdFx0dGhpcy5fZmlyZUNsaWNrID0gdHJ1ZTtcblxuXHRcdC8vIGRvbid0IHNpbXVsYXRlIGNsaWNrIG9yIHRyYWNrIGxvbmdwcmVzcyBpZiBtb3JlIHRoYW4gMSB0b3VjaFxuXHRcdGlmIChlLnRvdWNoZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0dGhpcy5fZmlyZUNsaWNrID0gZmFsc2U7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5faG9sZFRpbWVvdXQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBmaXJzdCA9IGUudG91Y2hlc1swXSxcblx0XHQgICAgZWwgPSBmaXJzdC50YXJnZXQ7XG5cblx0XHR0aGlzLl9zdGFydFBvcyA9IHRoaXMuX25ld1BvcyA9IG5ldyBMLlBvaW50KGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFkpO1xuXG5cdFx0Ly8gaWYgdG91Y2hpbmcgYSBsaW5rLCBoaWdobGlnaHQgaXRcblx0XHRpZiAoZWwudGFnTmFtZSAmJiBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhJykge1xuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKGVsLCAnbGVhZmxldC1hY3RpdmUnKTtcblx0XHR9XG5cblx0XHQvLyBzaW11bGF0ZSBsb25nIGhvbGQgYnV0IHNldHRpbmcgYSB0aW1lb3V0XG5cdFx0dGhpcy5faG9sZFRpbWVvdXQgPSBzZXRUaW1lb3V0KEwuYmluZChmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAodGhpcy5faXNUYXBWYWxpZCgpKSB7XG5cdFx0XHRcdHRoaXMuX2ZpcmVDbGljayA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLl9vblVwKCk7XG5cdFx0XHRcdHRoaXMuX3NpbXVsYXRlRXZlbnQoJ2NvbnRleHRtZW51JywgZmlyc3QpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMpLCAxMDAwKTtcblxuXHRcdEwuRG9tRXZlbnRcblx0XHRcdC5vbihkb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuX29uTW92ZSwgdGhpcylcblx0XHRcdC5vbihkb2N1bWVudCwgJ3RvdWNoZW5kJywgdGhpcy5fb25VcCwgdGhpcyk7XG5cdH0sXG5cblx0X29uVXA6IGZ1bmN0aW9uIChlKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2hvbGRUaW1lb3V0KTtcblxuXHRcdEwuRG9tRXZlbnRcblx0XHRcdC5vZmYoZG9jdW1lbnQsICd0b3VjaG1vdmUnLCB0aGlzLl9vbk1vdmUsIHRoaXMpXG5cdFx0XHQub2ZmKGRvY3VtZW50LCAndG91Y2hlbmQnLCB0aGlzLl9vblVwLCB0aGlzKTtcblxuXHRcdGlmICh0aGlzLl9maXJlQ2xpY2sgJiYgZSAmJiBlLmNoYW5nZWRUb3VjaGVzKSB7XG5cblx0XHRcdHZhciBmaXJzdCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0sXG5cdFx0XHQgICAgZWwgPSBmaXJzdC50YXJnZXQ7XG5cblx0XHRcdGlmIChlbCAmJiBlbC50YWdOYW1lICYmIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2EnKSB7XG5cdFx0XHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhlbCwgJ2xlYWZsZXQtYWN0aXZlJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHNpbXVsYXRlIGNsaWNrIGlmIHRoZSB0b3VjaCBkaWRuJ3QgbW92ZSB0b28gbXVjaFxuXHRcdFx0aWYgKHRoaXMuX2lzVGFwVmFsaWQoKSkge1xuXHRcdFx0XHR0aGlzLl9zaW11bGF0ZUV2ZW50KCdjbGljaycsIGZpcnN0KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X2lzVGFwVmFsaWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fbmV3UG9zLmRpc3RhbmNlVG8odGhpcy5fc3RhcnRQb3MpIDw9IHRoaXMuX21hcC5vcHRpb25zLnRhcFRvbGVyYW5jZTtcblx0fSxcblxuXHRfb25Nb3ZlOiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBmaXJzdCA9IGUudG91Y2hlc1swXTtcblx0XHR0aGlzLl9uZXdQb3MgPSBuZXcgTC5Qb2ludChmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZKTtcblx0fSxcblxuXHRfc2ltdWxhdGVFdmVudDogZnVuY3Rpb24gKHR5cGUsIGUpIHtcblx0XHR2YXIgc2ltdWxhdGVkRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcblxuXHRcdHNpbXVsYXRlZEV2ZW50Ll9zaW11bGF0ZWQgPSB0cnVlO1xuXHRcdGUudGFyZ2V0Ll9zaW11bGF0ZWRDbGljayA9IHRydWU7XG5cblx0XHRzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudChcblx0XHQgICAgICAgIHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMSxcblx0XHQgICAgICAgIGUuc2NyZWVuWCwgZS5zY3JlZW5ZLFxuXHRcdCAgICAgICAgZS5jbGllbnRYLCBlLmNsaWVudFksXG5cdFx0ICAgICAgICBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCwgbnVsbCk7XG5cblx0XHRlLnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcblx0fVxufSk7XG5cbmlmIChMLkJyb3dzZXIudG91Y2ggJiYgIUwuQnJvd3Nlci5wb2ludGVyKSB7XG5cdEwuTWFwLmFkZEluaXRIb29rKCdhZGRIYW5kbGVyJywgJ3RhcCcsIEwuTWFwLlRhcCk7XG59XG5cblxuLypcbiAqIEwuSGFuZGxlci5TaGlmdERyYWdab29tIGlzIHVzZWQgdG8gYWRkIHNoaWZ0LWRyYWcgem9vbSBpbnRlcmFjdGlvbiB0byB0aGUgbWFwXG4gICogKHpvb20gdG8gYSBzZWxlY3RlZCBib3VuZGluZyBib3gpLCBlbmFibGVkIGJ5IGRlZmF1bHQuXG4gKi9cblxuTC5NYXAubWVyZ2VPcHRpb25zKHtcblx0Ym94Wm9vbTogdHJ1ZVxufSk7XG5cbkwuTWFwLkJveFpvb20gPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG1hcCkge1xuXHRcdHRoaXMuX21hcCA9IG1hcDtcblx0XHR0aGlzLl9jb250YWluZXIgPSBtYXAuX2NvbnRhaW5lcjtcblx0XHR0aGlzLl9wYW5lID0gbWFwLl9wYW5lcy5vdmVybGF5UGFuZTtcblx0XHR0aGlzLl9tb3ZlZCA9IGZhbHNlO1xuXHR9LFxuXG5cdGFkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vbih0aGlzLl9jb250YWluZXIsICdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93biwgdGhpcyk7XG5cdH0sXG5cblx0cmVtb3ZlSG9va3M6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbUV2ZW50Lm9mZih0aGlzLl9jb250YWluZXIsICdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bik7XG5cdFx0dGhpcy5fbW92ZWQgPSBmYWxzZTtcblx0fSxcblxuXHRtb3ZlZDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLl9tb3ZlZDtcblx0fSxcblxuXHRfb25Nb3VzZURvd246IGZ1bmN0aW9uIChlKSB7XG5cdFx0dGhpcy5fbW92ZWQgPSBmYWxzZTtcblxuXHRcdGlmICghZS5zaGlmdEtleSB8fCAoKGUud2hpY2ggIT09IDEpICYmIChlLmJ1dHRvbiAhPT0gMSkpKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdFx0TC5Eb21VdGlsLmRpc2FibGVUZXh0U2VsZWN0aW9uKCk7XG5cdFx0TC5Eb21VdGlsLmRpc2FibGVJbWFnZURyYWcoKTtcblxuXHRcdHRoaXMuX3N0YXJ0TGF5ZXJQb2ludCA9IHRoaXMuX21hcC5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUpO1xuXG5cdFx0TC5Eb21FdmVudFxuXHRcdCAgICAub24oZG9jdW1lbnQsICdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcylcblx0XHQgICAgLm9uKGRvY3VtZW50LCAnbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCwgdGhpcylcblx0XHQgICAgLm9uKGRvY3VtZW50LCAna2V5ZG93bicsIHRoaXMuX29uS2V5RG93biwgdGhpcyk7XG5cdH0sXG5cblx0X29uTW91c2VNb3ZlOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmICghdGhpcy5fbW92ZWQpIHtcblx0XHRcdHRoaXMuX2JveCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LXpvb20tYm94JywgdGhpcy5fcGFuZSk7XG5cdFx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fYm94LCB0aGlzLl9zdGFydExheWVyUG9pbnQpO1xuXG5cdFx0XHQvL1RPRE8gcmVmYWN0b3I6IG1vdmUgY3Vyc29yIHRvIHN0eWxlc1xuXHRcdFx0dGhpcy5fY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInO1xuXHRcdFx0dGhpcy5fbWFwLmZpcmUoJ2JveHpvb21zdGFydCcpO1xuXHRcdH1cblxuXHRcdHZhciBzdGFydFBvaW50ID0gdGhpcy5fc3RhcnRMYXllclBvaW50LFxuXHRcdCAgICBib3ggPSB0aGlzLl9ib3gsXG5cblx0XHQgICAgbGF5ZXJQb2ludCA9IHRoaXMuX21hcC5tb3VzZUV2ZW50VG9MYXllclBvaW50KGUpLFxuXHRcdCAgICBvZmZzZXQgPSBsYXllclBvaW50LnN1YnRyYWN0KHN0YXJ0UG9pbnQpLFxuXG5cdFx0ICAgIG5ld1BvcyA9IG5ldyBMLlBvaW50KFxuXHRcdCAgICAgICAgTWF0aC5taW4obGF5ZXJQb2ludC54LCBzdGFydFBvaW50LngpLFxuXHRcdCAgICAgICAgTWF0aC5taW4obGF5ZXJQb2ludC55LCBzdGFydFBvaW50LnkpKTtcblxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbihib3gsIG5ld1Bvcyk7XG5cblx0XHR0aGlzLl9tb3ZlZCA9IHRydWU7XG5cblx0XHQvLyBUT0RPIHJlZmFjdG9yOiByZW1vdmUgaGFyZGNvZGVkIDQgcGl4ZWxzXG5cdFx0Ym94LnN0eWxlLndpZHRoICA9IChNYXRoLm1heCgwLCBNYXRoLmFicyhvZmZzZXQueCkgLSA0KSkgKyAncHgnO1xuXHRcdGJveC5zdHlsZS5oZWlnaHQgPSAoTWF0aC5tYXgoMCwgTWF0aC5hYnMob2Zmc2V0LnkpIC0gNCkpICsgJ3B4Jztcblx0fSxcblxuXHRfZmluaXNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX21vdmVkKSB7XG5cdFx0XHR0aGlzLl9wYW5lLnJlbW92ZUNoaWxkKHRoaXMuX2JveCk7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJyc7XG5cdFx0fVxuXG5cdFx0TC5Eb21VdGlsLmVuYWJsZVRleHRTZWxlY3Rpb24oKTtcblx0XHRMLkRvbVV0aWwuZW5hYmxlSW1hZ2VEcmFnKCk7XG5cblx0XHRMLkRvbUV2ZW50XG5cdFx0ICAgIC5vZmYoZG9jdW1lbnQsICdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSlcblx0XHQgICAgLm9mZihkb2N1bWVudCwgJ21vdXNldXAnLCB0aGlzLl9vbk1vdXNlVXApXG5cdFx0ICAgIC5vZmYoZG9jdW1lbnQsICdrZXlkb3duJywgdGhpcy5fb25LZXlEb3duKTtcblx0fSxcblxuXHRfb25Nb3VzZVVwOiBmdW5jdGlvbiAoZSkge1xuXG5cdFx0dGhpcy5fZmluaXNoKCk7XG5cblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxuXHRcdCAgICBsYXllclBvaW50ID0gbWFwLm1vdXNlRXZlbnRUb0xheWVyUG9pbnQoZSk7XG5cblx0XHRpZiAodGhpcy5fc3RhcnRMYXllclBvaW50LmVxdWFscyhsYXllclBvaW50KSkgeyByZXR1cm47IH1cblxuXHRcdHZhciBib3VuZHMgPSBuZXcgTC5MYXRMbmdCb3VuZHMoXG5cdFx0ICAgICAgICBtYXAubGF5ZXJQb2ludFRvTGF0TG5nKHRoaXMuX3N0YXJ0TGF5ZXJQb2ludCksXG5cdFx0ICAgICAgICBtYXAubGF5ZXJQb2ludFRvTGF0TG5nKGxheWVyUG9pbnQpKTtcblxuXHRcdG1hcC5maXRCb3VuZHMoYm91bmRzKTtcblxuXHRcdG1hcC5maXJlKCdib3h6b29tZW5kJywge1xuXHRcdFx0Ym94Wm9vbUJvdW5kczogYm91bmRzXG5cdFx0fSk7XG5cdH0sXG5cblx0X29uS2V5RG93bjogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAoZS5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0dGhpcy5fZmluaXNoKCk7XG5cdFx0fVxuXHR9XG59KTtcblxuTC5NYXAuYWRkSW5pdEhvb2soJ2FkZEhhbmRsZXInLCAnYm94Wm9vbScsIEwuTWFwLkJveFpvb20pO1xuXG5cbi8qXG4gKiBMLk1hcC5LZXlib2FyZCBpcyBoYW5kbGluZyBrZXlib2FyZCBpbnRlcmFjdGlvbiB3aXRoIHRoZSBtYXAsIGVuYWJsZWQgYnkgZGVmYXVsdC5cbiAqL1xuXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xuXHRrZXlib2FyZDogdHJ1ZSxcblx0a2V5Ym9hcmRQYW5PZmZzZXQ6IDgwLFxuXHRrZXlib2FyZFpvb21PZmZzZXQ6IDFcbn0pO1xuXG5MLk1hcC5LZXlib2FyZCA9IEwuSGFuZGxlci5leHRlbmQoe1xuXG5cdGtleUNvZGVzOiB7XG5cdFx0bGVmdDogICAgWzM3XSxcblx0XHRyaWdodDogICBbMzldLFxuXHRcdGRvd246ICAgIFs0MF0sXG5cdFx0dXA6ICAgICAgWzM4XSxcblx0XHR6b29tSW46ICBbMTg3LCAxMDcsIDYxLCAxNzFdLFxuXHRcdHpvb21PdXQ6IFsxODksIDEwOSwgMTczXVxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uIChtYXApIHtcblx0XHR0aGlzLl9tYXAgPSBtYXA7XG5cblx0XHR0aGlzLl9zZXRQYW5PZmZzZXQobWFwLm9wdGlvbnMua2V5Ym9hcmRQYW5PZmZzZXQpO1xuXHRcdHRoaXMuX3NldFpvb21PZmZzZXQobWFwLm9wdGlvbnMua2V5Ym9hcmRab29tT2Zmc2V0KTtcblx0fSxcblxuXHRhZGRIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBjb250YWluZXIgPSB0aGlzLl9tYXAuX2NvbnRhaW5lcjtcblxuXHRcdC8vIG1ha2UgdGhlIGNvbnRhaW5lciBmb2N1c2FibGUgYnkgdGFiYmluZ1xuXHRcdGlmIChjb250YWluZXIudGFiSW5kZXggPT09IC0xKSB7XG5cdFx0XHRjb250YWluZXIudGFiSW5kZXggPSAnMCc7XG5cdFx0fVxuXG5cdFx0TC5Eb21FdmVudFxuXHRcdCAgICAub24oY29udGFpbmVyLCAnZm9jdXMnLCB0aGlzLl9vbkZvY3VzLCB0aGlzKVxuXHRcdCAgICAub24oY29udGFpbmVyLCAnYmx1cicsIHRoaXMuX29uQmx1ciwgdGhpcylcblx0XHQgICAgLm9uKGNvbnRhaW5lciwgJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLCB0aGlzKTtcblxuXHRcdHRoaXMuX21hcFxuXHRcdCAgICAub24oJ2ZvY3VzJywgdGhpcy5fYWRkSG9va3MsIHRoaXMpXG5cdFx0ICAgIC5vbignYmx1cicsIHRoaXMuX3JlbW92ZUhvb2tzLCB0aGlzKTtcblx0fSxcblxuXHRyZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX3JlbW92ZUhvb2tzKCk7XG5cblx0XHR2YXIgY29udGFpbmVyID0gdGhpcy5fbWFwLl9jb250YWluZXI7XG5cblx0XHRMLkRvbUV2ZW50XG5cdFx0ICAgIC5vZmYoY29udGFpbmVyLCAnZm9jdXMnLCB0aGlzLl9vbkZvY3VzLCB0aGlzKVxuXHRcdCAgICAub2ZmKGNvbnRhaW5lciwgJ2JsdXInLCB0aGlzLl9vbkJsdXIsIHRoaXMpXG5cdFx0ICAgIC5vZmYoY29udGFpbmVyLCAnbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24sIHRoaXMpO1xuXG5cdFx0dGhpcy5fbWFwXG5cdFx0ICAgIC5vZmYoJ2ZvY3VzJywgdGhpcy5fYWRkSG9va3MsIHRoaXMpXG5cdFx0ICAgIC5vZmYoJ2JsdXInLCB0aGlzLl9yZW1vdmVIb29rcywgdGhpcyk7XG5cdH0sXG5cblx0X29uTW91c2VEb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX2ZvY3VzZWQpIHsgcmV0dXJuOyB9XG5cblx0XHR2YXIgYm9keSA9IGRvY3VtZW50LmJvZHksXG5cdFx0ICAgIGRvY0VsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuXHRcdCAgICB0b3AgPSBib2R5LnNjcm9sbFRvcCB8fCBkb2NFbC5zY3JvbGxUb3AsXG5cdFx0ICAgIGxlZnQgPSBib2R5LnNjcm9sbExlZnQgfHwgZG9jRWwuc2Nyb2xsTGVmdDtcblxuXHRcdHRoaXMuX21hcC5fY29udGFpbmVyLmZvY3VzKCk7XG5cblx0XHR3aW5kb3cuc2Nyb2xsVG8obGVmdCwgdG9wKTtcblx0fSxcblxuXHRfb25Gb2N1czogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX2ZvY3VzZWQgPSB0cnVlO1xuXHRcdHRoaXMuX21hcC5maXJlKCdmb2N1cycpO1xuXHR9LFxuXG5cdF9vbkJsdXI6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9mb2N1c2VkID0gZmFsc2U7XG5cdFx0dGhpcy5fbWFwLmZpcmUoJ2JsdXInKTtcblx0fSxcblxuXHRfc2V0UGFuT2Zmc2V0OiBmdW5jdGlvbiAocGFuKSB7XG5cdFx0dmFyIGtleXMgPSB0aGlzLl9wYW5LZXlzID0ge30sXG5cdFx0ICAgIGNvZGVzID0gdGhpcy5rZXlDb2Rlcyxcblx0XHQgICAgaSwgbGVuO1xuXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gY29kZXMubGVmdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0a2V5c1tjb2Rlcy5sZWZ0W2ldXSA9IFstMSAqIHBhbiwgMF07XG5cdFx0fVxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvZGVzLnJpZ2h0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRrZXlzW2NvZGVzLnJpZ2h0W2ldXSA9IFtwYW4sIDBdO1xuXHRcdH1cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBjb2Rlcy5kb3duLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRrZXlzW2NvZGVzLmRvd25baV1dID0gWzAsIHBhbl07XG5cdFx0fVxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvZGVzLnVwLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRrZXlzW2NvZGVzLnVwW2ldXSA9IFswLCAtMSAqIHBhbl07XG5cdFx0fVxuXHR9LFxuXG5cdF9zZXRab29tT2Zmc2V0OiBmdW5jdGlvbiAoem9vbSkge1xuXHRcdHZhciBrZXlzID0gdGhpcy5fem9vbUtleXMgPSB7fSxcblx0XHQgICAgY29kZXMgPSB0aGlzLmtleUNvZGVzLFxuXHRcdCAgICBpLCBsZW47XG5cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBjb2Rlcy56b29tSW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGtleXNbY29kZXMuem9vbUluW2ldXSA9IHpvb207XG5cdFx0fVxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IGNvZGVzLnpvb21PdXQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGtleXNbY29kZXMuem9vbU91dFtpXV0gPSAtem9vbTtcblx0XHR9XG5cdH0sXG5cblx0X2FkZEhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vbihkb2N1bWVudCwgJ2tleWRvd24nLCB0aGlzLl9vbktleURvd24sIHRoaXMpO1xuXHR9LFxuXG5cdF9yZW1vdmVIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdEwuRG9tRXZlbnQub2ZmKGRvY3VtZW50LCAna2V5ZG93bicsIHRoaXMuX29uS2V5RG93biwgdGhpcyk7XG5cdH0sXG5cblx0X29uS2V5RG93bjogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIga2V5ID0gZS5rZXlDb2RlLFxuXHRcdCAgICBtYXAgPSB0aGlzLl9tYXA7XG5cblx0XHRpZiAoa2V5IGluIHRoaXMuX3BhbktleXMpIHtcblxuXHRcdFx0aWYgKG1hcC5fcGFuQW5pbSAmJiBtYXAuX3BhbkFuaW0uX2luUHJvZ3Jlc3MpIHsgcmV0dXJuOyB9XG5cblx0XHRcdG1hcC5wYW5CeSh0aGlzLl9wYW5LZXlzW2tleV0pO1xuXG5cdFx0XHRpZiAobWFwLm9wdGlvbnMubWF4Qm91bmRzKSB7XG5cdFx0XHRcdG1hcC5wYW5JbnNpZGVCb3VuZHMobWFwLm9wdGlvbnMubWF4Qm91bmRzKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZiAoa2V5IGluIHRoaXMuX3pvb21LZXlzKSB7XG5cdFx0XHRtYXAuc2V0Wm9vbShtYXAuZ2V0Wm9vbSgpICsgdGhpcy5fem9vbUtleXNba2V5XSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdEwuRG9tRXZlbnQuc3RvcChlKTtcblx0fVxufSk7XG5cbkwuTWFwLmFkZEluaXRIb29rKCdhZGRIYW5kbGVyJywgJ2tleWJvYXJkJywgTC5NYXAuS2V5Ym9hcmQpO1xuXG5cbi8qXG4gKiBMLkhhbmRsZXIuTWFya2VyRHJhZyBpcyB1c2VkIGludGVybmFsbHkgYnkgTC5NYXJrZXIgdG8gbWFrZSB0aGUgbWFya2VycyBkcmFnZ2FibGUuXG4gKi9cblxuTC5IYW5kbGVyLk1hcmtlckRyYWcgPSBMLkhhbmRsZXIuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG1hcmtlcikge1xuXHRcdHRoaXMuX21hcmtlciA9IG1hcmtlcjtcblx0fSxcblxuXHRhZGRIb29rczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBpY29uID0gdGhpcy5fbWFya2VyLl9pY29uO1xuXHRcdGlmICghdGhpcy5fZHJhZ2dhYmxlKSB7XG5cdFx0XHR0aGlzLl9kcmFnZ2FibGUgPSBuZXcgTC5EcmFnZ2FibGUoaWNvbiwgaWNvbik7XG5cdFx0fVxuXG5cdFx0dGhpcy5fZHJhZ2dhYmxlXG5cdFx0XHQub24oJ2RyYWdzdGFydCcsIHRoaXMuX29uRHJhZ1N0YXJ0LCB0aGlzKVxuXHRcdFx0Lm9uKCdkcmFnJywgdGhpcy5fb25EcmFnLCB0aGlzKVxuXHRcdFx0Lm9uKCdkcmFnZW5kJywgdGhpcy5fb25EcmFnRW5kLCB0aGlzKTtcblx0XHR0aGlzLl9kcmFnZ2FibGUuZW5hYmxlKCk7XG5cdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX21hcmtlci5faWNvbiwgJ2xlYWZsZXQtbWFya2VyLWRyYWdnYWJsZScpO1xuXHR9LFxuXG5cdHJlbW92ZUhvb2tzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fZHJhZ2dhYmxlXG5cdFx0XHQub2ZmKCdkcmFnc3RhcnQnLCB0aGlzLl9vbkRyYWdTdGFydCwgdGhpcylcblx0XHRcdC5vZmYoJ2RyYWcnLCB0aGlzLl9vbkRyYWcsIHRoaXMpXG5cdFx0XHQub2ZmKCdkcmFnZW5kJywgdGhpcy5fb25EcmFnRW5kLCB0aGlzKTtcblxuXHRcdHRoaXMuX2RyYWdnYWJsZS5kaXNhYmxlKCk7XG5cdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX21hcmtlci5faWNvbiwgJ2xlYWZsZXQtbWFya2VyLWRyYWdnYWJsZScpO1xuXHR9LFxuXG5cdG1vdmVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2RyYWdnYWJsZSAmJiB0aGlzLl9kcmFnZ2FibGUuX21vdmVkO1xuXHR9LFxuXG5cdF9vbkRyYWdTdGFydDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX21hcmtlclxuXHRcdCAgICAuY2xvc2VQb3B1cCgpXG5cdFx0ICAgIC5maXJlKCdtb3Zlc3RhcnQnKVxuXHRcdCAgICAuZmlyZSgnZHJhZ3N0YXJ0Jyk7XG5cdH0sXG5cblx0X29uRHJhZzogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBtYXJrZXIgPSB0aGlzLl9tYXJrZXIsXG5cdFx0ICAgIHNoYWRvdyA9IG1hcmtlci5fc2hhZG93LFxuXHRcdCAgICBpY29uUG9zID0gTC5Eb21VdGlsLmdldFBvc2l0aW9uKG1hcmtlci5faWNvbiksXG5cdFx0ICAgIGxhdGxuZyA9IG1hcmtlci5fbWFwLmxheWVyUG9pbnRUb0xhdExuZyhpY29uUG9zKTtcblxuXHRcdC8vIHVwZGF0ZSBzaGFkb3cgcG9zaXRpb25cblx0XHRpZiAoc2hhZG93KSB7XG5cdFx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24oc2hhZG93LCBpY29uUG9zKTtcblx0XHR9XG5cblx0XHRtYXJrZXIuX2xhdGxuZyA9IGxhdGxuZztcblxuXHRcdG1hcmtlclxuXHRcdCAgICAuZmlyZSgnbW92ZScsIHtsYXRsbmc6IGxhdGxuZ30pXG5cdFx0ICAgIC5maXJlKCdkcmFnJyk7XG5cdH0sXG5cblx0X29uRHJhZ0VuZDogZnVuY3Rpb24gKGUpIHtcblx0XHR0aGlzLl9tYXJrZXJcblx0XHQgICAgLmZpcmUoJ21vdmVlbmQnKVxuXHRcdCAgICAuZmlyZSgnZHJhZ2VuZCcsIGUpO1xuXHR9XG59KTtcblxuXG4vKlxyXG4gKiBMLkNvbnRyb2wgaXMgYSBiYXNlIGNsYXNzIGZvciBpbXBsZW1lbnRpbmcgbWFwIGNvbnRyb2xzLiBIYW5kbGVzIHBvc2l0aW9uaW5nLlxyXG4gKiBBbGwgb3RoZXIgY29udHJvbHMgZXh0ZW5kIGZyb20gdGhpcyBjbGFzcy5cclxuICovXHJcblxyXG5MLkNvbnRyb2wgPSBMLkNsYXNzLmV4dGVuZCh7XHJcblx0b3B0aW9uczoge1xyXG5cdFx0cG9zaXRpb246ICd0b3ByaWdodCdcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cdFx0TC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xyXG5cdH0sXHJcblxyXG5cdGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLnBvc2l0aW9uO1xyXG5cdH0sXHJcblxyXG5cdHNldFBvc2l0aW9uOiBmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuXHRcdHZhciBtYXAgPSB0aGlzLl9tYXA7XHJcblxyXG5cdFx0aWYgKG1hcCkge1xyXG5cdFx0XHRtYXAucmVtb3ZlQ29udHJvbCh0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLm9wdGlvbnMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHJcblx0XHRpZiAobWFwKSB7XHJcblx0XHRcdG1hcC5hZGRDb250cm9sKHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdGdldENvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcclxuXHR9LFxyXG5cclxuXHRhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5fbWFwID0gbWFwO1xyXG5cclxuXHRcdHZhciBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXIgPSB0aGlzLm9uQWRkKG1hcCksXHJcblx0XHQgICAgcG9zID0gdGhpcy5nZXRQb3NpdGlvbigpLFxyXG5cdFx0ICAgIGNvcm5lciA9IG1hcC5fY29udHJvbENvcm5lcnNbcG9zXTtcclxuXHJcblx0XHRMLkRvbVV0aWwuYWRkQ2xhc3MoY29udGFpbmVyLCAnbGVhZmxldC1jb250cm9sJyk7XHJcblxyXG5cdFx0aWYgKHBvcy5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpIHtcclxuXHRcdFx0Y29ybmVyLmluc2VydEJlZm9yZShjb250YWluZXIsIGNvcm5lci5maXJzdENoaWxkKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvcm5lci5hcHBlbmRDaGlsZChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUZyb206IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdHZhciBwb3MgPSB0aGlzLmdldFBvc2l0aW9uKCksXHJcblx0XHQgICAgY29ybmVyID0gbWFwLl9jb250cm9sQ29ybmVyc1twb3NdO1xyXG5cclxuXHRcdGNvcm5lci5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xyXG5cdFx0dGhpcy5fbWFwID0gbnVsbDtcclxuXHJcblx0XHRpZiAodGhpcy5vblJlbW92ZSkge1xyXG5cdFx0XHR0aGlzLm9uUmVtb3ZlKG1hcCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0X3JlZm9jdXNPbk1hcDogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKHRoaXMuX21hcCkge1xyXG5cdFx0XHR0aGlzLl9tYXAuZ2V0Q29udGFpbmVyKCkuZm9jdXMoKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxuTC5jb250cm9sID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuQ29udHJvbChvcHRpb25zKTtcclxufTtcclxuXHJcblxyXG4vLyBhZGRzIGNvbnRyb2wtcmVsYXRlZCBtZXRob2RzIHRvIEwuTWFwXHJcblxyXG5MLk1hcC5pbmNsdWRlKHtcclxuXHRhZGRDb250cm9sOiBmdW5jdGlvbiAoY29udHJvbCkge1xyXG5cdFx0Y29udHJvbC5hZGRUbyh0aGlzKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUNvbnRyb2w6IGZ1bmN0aW9uIChjb250cm9sKSB7XHJcblx0XHRjb250cm9sLnJlbW92ZUZyb20odGhpcyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfaW5pdENvbnRyb2xQb3M6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjb3JuZXJzID0gdGhpcy5fY29udHJvbENvcm5lcnMgPSB7fSxcclxuXHRcdCAgICBsID0gJ2xlYWZsZXQtJyxcclxuXHRcdCAgICBjb250YWluZXIgPSB0aGlzLl9jb250cm9sQ29udGFpbmVyID1cclxuXHRcdCAgICAgICAgICAgIEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGwgKyAnY29udHJvbC1jb250YWluZXInLCB0aGlzLl9jb250YWluZXIpO1xyXG5cclxuXHRcdGZ1bmN0aW9uIGNyZWF0ZUNvcm5lcih2U2lkZSwgaFNpZGUpIHtcclxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IGwgKyB2U2lkZSArICcgJyArIGwgKyBoU2lkZTtcclxuXHJcblx0XHRcdGNvcm5lcnNbdlNpZGUgKyBoU2lkZV0gPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCBjbGFzc05hbWUsIGNvbnRhaW5lcik7XHJcblx0XHR9XHJcblxyXG5cdFx0Y3JlYXRlQ29ybmVyKCd0b3AnLCAnbGVmdCcpO1xyXG5cdFx0Y3JlYXRlQ29ybmVyKCd0b3AnLCAncmlnaHQnKTtcclxuXHRcdGNyZWF0ZUNvcm5lcignYm90dG9tJywgJ2xlZnQnKTtcclxuXHRcdGNyZWF0ZUNvcm5lcignYm90dG9tJywgJ3JpZ2h0Jyk7XHJcblx0fSxcclxuXHJcblx0X2NsZWFyQ29udHJvbFBvczogZnVuY3Rpb24gKCkge1xyXG5cdFx0dGhpcy5fY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRyb2xDb250YWluZXIpO1xyXG5cdH1cclxufSk7XHJcblxuXG4vKlxyXG4gKiBMLkNvbnRyb2wuWm9vbSBpcyB1c2VkIGZvciB0aGUgZGVmYXVsdCB6b29tIGJ1dHRvbnMgb24gdGhlIG1hcC5cclxuICovXHJcblxyXG5MLkNvbnRyb2wuWm9vbSA9IEwuQ29udHJvbC5leHRlbmQoe1xyXG5cdG9wdGlvbnM6IHtcclxuXHRcdHBvc2l0aW9uOiAndG9wbGVmdCcsXHJcblx0XHR6b29tSW5UZXh0OiAnKycsXHJcblx0XHR6b29tSW5UaXRsZTogJ1pvb20gaW4nLFxyXG5cdFx0em9vbU91dFRleHQ6ICctJyxcclxuXHRcdHpvb21PdXRUaXRsZTogJ1pvb20gb3V0J1xyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR2YXIgem9vbU5hbWUgPSAnbGVhZmxldC1jb250cm9sLXpvb20nLFxyXG5cdFx0ICAgIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIHpvb21OYW1lICsgJyBsZWFmbGV0LWJhcicpO1xyXG5cclxuXHRcdHRoaXMuX21hcCA9IG1hcDtcclxuXHJcblx0XHR0aGlzLl96b29tSW5CdXR0b24gID0gdGhpcy5fY3JlYXRlQnV0dG9uKFxyXG5cdFx0ICAgICAgICB0aGlzLm9wdGlvbnMuem9vbUluVGV4dCwgdGhpcy5vcHRpb25zLnpvb21JblRpdGxlLFxyXG5cdFx0ICAgICAgICB6b29tTmFtZSArICctaW4nLCAgY29udGFpbmVyLCB0aGlzLl96b29tSW4sICB0aGlzKTtcclxuXHRcdHRoaXMuX3pvb21PdXRCdXR0b24gPSB0aGlzLl9jcmVhdGVCdXR0b24oXHJcblx0XHQgICAgICAgIHRoaXMub3B0aW9ucy56b29tT3V0VGV4dCwgdGhpcy5vcHRpb25zLnpvb21PdXRUaXRsZSxcclxuXHRcdCAgICAgICAgem9vbU5hbWUgKyAnLW91dCcsIGNvbnRhaW5lciwgdGhpcy5fem9vbU91dCwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlRGlzYWJsZWQoKTtcclxuXHRcdG1hcC5vbignem9vbWVuZCB6b29tbGV2ZWxzY2hhbmdlJywgdGhpcy5fdXBkYXRlRGlzYWJsZWQsIHRoaXMpO1xyXG5cclxuXHRcdHJldHVybiBjb250YWluZXI7XHJcblx0fSxcclxuXHJcblx0b25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcclxuXHRcdG1hcC5vZmYoJ3pvb21lbmQgem9vbWxldmVsc2NoYW5nZScsIHRoaXMuX3VwZGF0ZURpc2FibGVkLCB0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRfem9vbUluOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dGhpcy5fbWFwLnpvb21JbihlLnNoaWZ0S2V5ID8gMyA6IDEpO1xyXG5cdH0sXHJcblxyXG5cdF96b29tT3V0OiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dGhpcy5fbWFwLnpvb21PdXQoZS5zaGlmdEtleSA/IDMgOiAxKTtcclxuXHR9LFxyXG5cclxuXHRfY3JlYXRlQnV0dG9uOiBmdW5jdGlvbiAoaHRtbCwgdGl0bGUsIGNsYXNzTmFtZSwgY29udGFpbmVyLCBmbiwgY29udGV4dCkge1xyXG5cdFx0dmFyIGxpbmsgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgY2xhc3NOYW1lLCBjb250YWluZXIpO1xyXG5cdFx0bGluay5pbm5lckhUTUwgPSBodG1sO1xyXG5cdFx0bGluay5ocmVmID0gJyMnO1xyXG5cdFx0bGluay50aXRsZSA9IHRpdGxlO1xyXG5cclxuXHRcdHZhciBzdG9wID0gTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb247XHJcblxyXG5cdFx0TC5Eb21FdmVudFxyXG5cdFx0ICAgIC5vbihsaW5rLCAnY2xpY2snLCBzdG9wKVxyXG5cdFx0ICAgIC5vbihsaW5rLCAnbW91c2Vkb3duJywgc3RvcClcclxuXHRcdCAgICAub24obGluaywgJ2RibGNsaWNrJywgc3RvcClcclxuXHRcdCAgICAub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdClcclxuXHRcdCAgICAub24obGluaywgJ2NsaWNrJywgZm4sIGNvbnRleHQpXHJcblx0XHQgICAgLm9uKGxpbmssICdjbGljaycsIHRoaXMuX3JlZm9jdXNPbk1hcCwgY29udGV4dCk7XHJcblxyXG5cdFx0cmV0dXJuIGxpbms7XHJcblx0fSxcclxuXHJcblx0X3VwZGF0ZURpc2FibGVkOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgbWFwID0gdGhpcy5fbWFwLFxyXG5cdFx0XHRjbGFzc05hbWUgPSAnbGVhZmxldC1kaXNhYmxlZCc7XHJcblxyXG5cdFx0TC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3pvb21JbkJ1dHRvbiwgY2xhc3NOYW1lKTtcclxuXHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl96b29tT3V0QnV0dG9uLCBjbGFzc05hbWUpO1xyXG5cclxuXHRcdGlmIChtYXAuX3pvb20gPT09IG1hcC5nZXRNaW5ab29tKCkpIHtcclxuXHRcdFx0TC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3pvb21PdXRCdXR0b24sIGNsYXNzTmFtZSk7XHJcblx0XHR9XHJcblx0XHRpZiAobWFwLl96b29tID09PSBtYXAuZ2V0TWF4Wm9vbSgpKSB7XHJcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl96b29tSW5CdXR0b24sIGNsYXNzTmFtZSk7XHJcblx0XHR9XHJcblx0fVxyXG59KTtcclxuXHJcbkwuTWFwLm1lcmdlT3B0aW9ucyh7XHJcblx0em9vbUNvbnRyb2w6IHRydWVcclxufSk7XHJcblxyXG5MLk1hcC5hZGRJbml0SG9vayhmdW5jdGlvbiAoKSB7XHJcblx0aWYgKHRoaXMub3B0aW9ucy56b29tQ29udHJvbCkge1xyXG5cdFx0dGhpcy56b29tQ29udHJvbCA9IG5ldyBMLkNvbnRyb2wuWm9vbSgpO1xyXG5cdFx0dGhpcy5hZGRDb250cm9sKHRoaXMuem9vbUNvbnRyb2wpO1xyXG5cdH1cclxufSk7XHJcblxyXG5MLmNvbnRyb2wuem9vbSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0cmV0dXJuIG5ldyBMLkNvbnRyb2wuWm9vbShvcHRpb25zKTtcclxufTtcclxuXHJcblxuXG4vKlxyXG4gKiBMLkNvbnRyb2wuQXR0cmlidXRpb24gaXMgdXNlZCBmb3IgZGlzcGxheWluZyBhdHRyaWJ1dGlvbiBvbiB0aGUgbWFwIChhZGRlZCBieSBkZWZhdWx0KS5cclxuICovXHJcblxyXG5MLkNvbnRyb2wuQXR0cmlidXRpb24gPSBMLkNvbnRyb2wuZXh0ZW5kKHtcclxuXHRvcHRpb25zOiB7XHJcblx0XHRwb3NpdGlvbjogJ2JvdHRvbXJpZ2h0JyxcclxuXHRcdHByZWZpeDogJzxhIGhyZWY9XCJodHRwOi8vbGVhZmxldGpzLmNvbVwiIHRpdGxlPVwiQSBKUyBsaWJyYXJ5IGZvciBpbnRlcmFjdGl2ZSBtYXBzXCI+TGVhZmxldDwvYT4nXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLl9hdHRyaWJ1dGlvbnMgPSB7fTtcclxuXHR9LFxyXG5cclxuXHRvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0dGhpcy5fY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtY29udHJvbC1hdHRyaWJ1dGlvbicpO1xyXG5cdFx0TC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbih0aGlzLl9jb250YWluZXIpO1xyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gbWFwLl9sYXllcnMpIHtcclxuXHRcdFx0aWYgKG1hcC5fbGF5ZXJzW2ldLmdldEF0dHJpYnV0aW9uKSB7XHJcblx0XHRcdFx0dGhpcy5hZGRBdHRyaWJ1dGlvbihtYXAuX2xheWVyc1tpXS5nZXRBdHRyaWJ1dGlvbigpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRtYXBcclxuXHRcdCAgICAub24oJ2xheWVyYWRkJywgdGhpcy5fb25MYXllckFkZCwgdGhpcylcclxuXHRcdCAgICAub24oJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllclJlbW92ZSwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5fdXBkYXRlKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwXHJcblx0XHQgICAgLm9mZignbGF5ZXJhZGQnLCB0aGlzLl9vbkxheWVyQWRkKVxyXG5cdFx0ICAgIC5vZmYoJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllclJlbW92ZSk7XHJcblxyXG5cdH0sXHJcblxyXG5cdHNldFByZWZpeDogZnVuY3Rpb24gKHByZWZpeCkge1xyXG5cdFx0dGhpcy5vcHRpb25zLnByZWZpeCA9IHByZWZpeDtcclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YWRkQXR0cmlidXRpb246IGZ1bmN0aW9uICh0ZXh0KSB7XHJcblx0XHRpZiAoIXRleHQpIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9hdHRyaWJ1dGlvbnNbdGV4dF0pIHtcclxuXHRcdFx0dGhpcy5fYXR0cmlidXRpb25zW3RleHRdID0gMDtcclxuXHRcdH1cclxuXHRcdHRoaXMuX2F0dHJpYnV0aW9uc1t0ZXh0XSsrO1xyXG5cclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUF0dHJpYnV0aW9uOiBmdW5jdGlvbiAodGV4dCkge1xyXG5cdFx0aWYgKCF0ZXh0KSB7IHJldHVybjsgfVxyXG5cclxuXHRcdGlmICh0aGlzLl9hdHRyaWJ1dGlvbnNbdGV4dF0pIHtcclxuXHRcdFx0dGhpcy5fYXR0cmlidXRpb25zW3RleHRdLS07XHJcblx0XHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fbWFwKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHZhciBhdHRyaWJzID0gW107XHJcblxyXG5cdFx0Zm9yICh2YXIgaSBpbiB0aGlzLl9hdHRyaWJ1dGlvbnMpIHtcclxuXHRcdFx0aWYgKHRoaXMuX2F0dHJpYnV0aW9uc1tpXSkge1xyXG5cdFx0XHRcdGF0dHJpYnMucHVzaChpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBwcmVmaXhBbmRBdHRyaWJzID0gW107XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5wcmVmaXgpIHtcclxuXHRcdFx0cHJlZml4QW5kQXR0cmlicy5wdXNoKHRoaXMub3B0aW9ucy5wcmVmaXgpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGF0dHJpYnMubGVuZ3RoKSB7XHJcblx0XHRcdHByZWZpeEFuZEF0dHJpYnMucHVzaChhdHRyaWJzLmpvaW4oJywgJykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lci5pbm5lckhUTUwgPSBwcmVmaXhBbmRBdHRyaWJzLmpvaW4oJyB8ICcpO1xyXG5cdH0sXHJcblxyXG5cdF9vbkxheWVyQWRkOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24pIHtcclxuXHRcdFx0dGhpcy5hZGRBdHRyaWJ1dGlvbihlLmxheWVyLmdldEF0dHJpYnV0aW9uKCkpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9vbkxheWVyUmVtb3ZlOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0aWYgKGUubGF5ZXIuZ2V0QXR0cmlidXRpb24pIHtcclxuXHRcdFx0dGhpcy5yZW1vdmVBdHRyaWJ1dGlvbihlLmxheWVyLmdldEF0dHJpYnV0aW9uKCkpO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcblxyXG5MLk1hcC5tZXJnZU9wdGlvbnMoe1xyXG5cdGF0dHJpYnV0aW9uQ29udHJvbDogdHJ1ZVxyXG59KTtcclxuXHJcbkwuTWFwLmFkZEluaXRIb29rKGZ1bmN0aW9uICgpIHtcclxuXHRpZiAodGhpcy5vcHRpb25zLmF0dHJpYnV0aW9uQ29udHJvbCkge1xyXG5cdFx0dGhpcy5hdHRyaWJ1dGlvbkNvbnRyb2wgPSAobmV3IEwuQ29udHJvbC5BdHRyaWJ1dGlvbigpKS5hZGRUbyh0aGlzKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5jb250cm9sLmF0dHJpYnV0aW9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRyZXR1cm4gbmV3IEwuQ29udHJvbC5BdHRyaWJ1dGlvbihvcHRpb25zKTtcclxufTtcclxuXG5cbi8qXG4gKiBMLkNvbnRyb2wuU2NhbGUgaXMgdXNlZCBmb3IgZGlzcGxheWluZyBtZXRyaWMvaW1wZXJpYWwgc2NhbGUgb24gdGhlIG1hcC5cbiAqL1xuXG5MLkNvbnRyb2wuU2NhbGUgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcblx0b3B0aW9uczoge1xuXHRcdHBvc2l0aW9uOiAnYm90dG9tbGVmdCcsXG5cdFx0bWF4V2lkdGg6IDEwMCxcblx0XHRtZXRyaWM6IHRydWUsXG5cdFx0aW1wZXJpYWw6IHRydWUsXG5cdFx0dXBkYXRlV2hlbklkbGU6IGZhbHNlXG5cdH0sXG5cblx0b25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcblx0XHR0aGlzLl9tYXAgPSBtYXA7XG5cblx0XHR2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtY29udHJvbC1zY2FsZScsXG5cdFx0ICAgIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSksXG5cdFx0ICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cblx0XHR0aGlzLl9hZGRTY2FsZXMob3B0aW9ucywgY2xhc3NOYW1lLCBjb250YWluZXIpO1xuXG5cdFx0bWFwLm9uKG9wdGlvbnMudXBkYXRlV2hlbklkbGUgPyAnbW92ZWVuZCcgOiAnbW92ZScsIHRoaXMuX3VwZGF0ZSwgdGhpcyk7XG5cdFx0bWFwLndoZW5SZWFkeSh0aGlzLl91cGRhdGUsIHRoaXMpO1xuXG5cdFx0cmV0dXJuIGNvbnRhaW5lcjtcblx0fSxcblxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xuXHRcdG1hcC5vZmYodGhpcy5vcHRpb25zLnVwZGF0ZVdoZW5JZGxlID8gJ21vdmVlbmQnIDogJ21vdmUnLCB0aGlzLl91cGRhdGUsIHRoaXMpO1xuXHR9LFxuXG5cdF9hZGRTY2FsZXM6IGZ1bmN0aW9uIChvcHRpb25zLCBjbGFzc05hbWUsIGNvbnRhaW5lcikge1xuXHRcdGlmIChvcHRpb25zLm1ldHJpYykge1xuXHRcdFx0dGhpcy5fbVNjYWxlID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lICsgJy1saW5lJywgY29udGFpbmVyKTtcblx0XHR9XG5cdFx0aWYgKG9wdGlvbnMuaW1wZXJpYWwpIHtcblx0XHRcdHRoaXMuX2lTY2FsZSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSArICctbGluZScsIGNvbnRhaW5lcik7XG5cdFx0fVxuXHR9LFxuXG5cdF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgYm91bmRzID0gdGhpcy5fbWFwLmdldEJvdW5kcygpLFxuXHRcdCAgICBjZW50ZXJMYXQgPSBib3VuZHMuZ2V0Q2VudGVyKCkubGF0LFxuXHRcdCAgICBoYWxmV29ybGRNZXRlcnMgPSA2Mzc4MTM3ICogTWF0aC5QSSAqIE1hdGguY29zKGNlbnRlckxhdCAqIE1hdGguUEkgLyAxODApLFxuXHRcdCAgICBkaXN0ID0gaGFsZldvcmxkTWV0ZXJzICogKGJvdW5kcy5nZXROb3J0aEVhc3QoKS5sbmcgLSBib3VuZHMuZ2V0U291dGhXZXN0KCkubG5nKSAvIDE4MCxcblxuXHRcdCAgICBzaXplID0gdGhpcy5fbWFwLmdldFNpemUoKSxcblx0XHQgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHQgICAgbWF4TWV0ZXJzID0gMDtcblxuXHRcdGlmIChzaXplLnggPiAwKSB7XG5cdFx0XHRtYXhNZXRlcnMgPSBkaXN0ICogKG9wdGlvbnMubWF4V2lkdGggLyBzaXplLngpO1xuXHRcdH1cblxuXHRcdHRoaXMuX3VwZGF0ZVNjYWxlcyhvcHRpb25zLCBtYXhNZXRlcnMpO1xuXHR9LFxuXG5cdF91cGRhdGVTY2FsZXM6IGZ1bmN0aW9uIChvcHRpb25zLCBtYXhNZXRlcnMpIHtcblx0XHRpZiAob3B0aW9ucy5tZXRyaWMgJiYgbWF4TWV0ZXJzKSB7XG5cdFx0XHR0aGlzLl91cGRhdGVNZXRyaWMobWF4TWV0ZXJzKTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5pbXBlcmlhbCAmJiBtYXhNZXRlcnMpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZUltcGVyaWFsKG1heE1ldGVycyk7XG5cdFx0fVxuXHR9LFxuXG5cdF91cGRhdGVNZXRyaWM6IGZ1bmN0aW9uIChtYXhNZXRlcnMpIHtcblx0XHR2YXIgbWV0ZXJzID0gdGhpcy5fZ2V0Um91bmROdW0obWF4TWV0ZXJzKTtcblxuXHRcdHRoaXMuX21TY2FsZS5zdHlsZS53aWR0aCA9IHRoaXMuX2dldFNjYWxlV2lkdGgobWV0ZXJzIC8gbWF4TWV0ZXJzKSArICdweCc7XG5cdFx0dGhpcy5fbVNjYWxlLmlubmVySFRNTCA9IG1ldGVycyA8IDEwMDAgPyBtZXRlcnMgKyAnIG0nIDogKG1ldGVycyAvIDEwMDApICsgJyBrbSc7XG5cdH0sXG5cblx0X3VwZGF0ZUltcGVyaWFsOiBmdW5jdGlvbiAobWF4TWV0ZXJzKSB7XG5cdFx0dmFyIG1heEZlZXQgPSBtYXhNZXRlcnMgKiAzLjI4MDgzOTksXG5cdFx0ICAgIHNjYWxlID0gdGhpcy5faVNjYWxlLFxuXHRcdCAgICBtYXhNaWxlcywgbWlsZXMsIGZlZXQ7XG5cblx0XHRpZiAobWF4RmVldCA+IDUyODApIHtcblx0XHRcdG1heE1pbGVzID0gbWF4RmVldCAvIDUyODA7XG5cdFx0XHRtaWxlcyA9IHRoaXMuX2dldFJvdW5kTnVtKG1heE1pbGVzKTtcblxuXHRcdFx0c2NhbGUuc3R5bGUud2lkdGggPSB0aGlzLl9nZXRTY2FsZVdpZHRoKG1pbGVzIC8gbWF4TWlsZXMpICsgJ3B4Jztcblx0XHRcdHNjYWxlLmlubmVySFRNTCA9IG1pbGVzICsgJyBtaSc7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmVldCA9IHRoaXMuX2dldFJvdW5kTnVtKG1heEZlZXQpO1xuXG5cdFx0XHRzY2FsZS5zdHlsZS53aWR0aCA9IHRoaXMuX2dldFNjYWxlV2lkdGgoZmVldCAvIG1heEZlZXQpICsgJ3B4Jztcblx0XHRcdHNjYWxlLmlubmVySFRNTCA9IGZlZXQgKyAnIGZ0Jztcblx0XHR9XG5cdH0sXG5cblx0X2dldFNjYWxlV2lkdGg6IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKHRoaXMub3B0aW9ucy5tYXhXaWR0aCAqIHJhdGlvKSAtIDEwO1xuXHR9LFxuXG5cdF9nZXRSb3VuZE51bTogZnVuY3Rpb24gKG51bSkge1xuXHRcdHZhciBwb3cxMCA9IE1hdGgucG93KDEwLCAoTWF0aC5mbG9vcihudW0pICsgJycpLmxlbmd0aCAtIDEpLFxuXHRcdCAgICBkID0gbnVtIC8gcG93MTA7XG5cblx0XHRkID0gZCA+PSAxMCA/IDEwIDogZCA+PSA1ID8gNSA6IGQgPj0gMyA/IDMgOiBkID49IDIgPyAyIDogMTtcblxuXHRcdHJldHVybiBwb3cxMCAqIGQ7XG5cdH1cbn0pO1xuXG5MLmNvbnRyb2wuc2NhbGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRyZXR1cm4gbmV3IEwuQ29udHJvbC5TY2FsZShvcHRpb25zKTtcbn07XG5cblxuLypcclxuICogTC5Db250cm9sLkxheWVycyBpcyBhIGNvbnRyb2wgdG8gYWxsb3cgdXNlcnMgdG8gc3dpdGNoIGJldHdlZW4gZGlmZmVyZW50IGxheWVycyBvbiB0aGUgbWFwLlxyXG4gKi9cclxuXHJcbkwuQ29udHJvbC5MYXllcnMgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcclxuXHRvcHRpb25zOiB7XHJcblx0XHRjb2xsYXBzZWQ6IHRydWUsXHJcblx0XHRwb3NpdGlvbjogJ3RvcHJpZ2h0JyxcclxuXHRcdGF1dG9aSW5kZXg6IHRydWVcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiAoYmFzZUxheWVycywgb3ZlcmxheXMsIG9wdGlvbnMpIHtcclxuXHRcdEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcclxuXHJcblx0XHR0aGlzLl9sYXllcnMgPSB7fTtcclxuXHRcdHRoaXMuX2xhc3RaSW5kZXggPSAwO1xyXG5cdFx0dGhpcy5faGFuZGxpbmdDbGljayA9IGZhbHNlO1xyXG5cclxuXHRcdGZvciAodmFyIGkgaW4gYmFzZUxheWVycykge1xyXG5cdFx0XHR0aGlzLl9hZGRMYXllcihiYXNlTGF5ZXJzW2ldLCBpKTtcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGkgaW4gb3ZlcmxheXMpIHtcclxuXHRcdFx0dGhpcy5fYWRkTGF5ZXIob3ZlcmxheXNbaV0sIGksIHRydWUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XHJcblx0XHR0aGlzLl9pbml0TGF5b3V0KCk7XHJcblx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHJcblx0XHRtYXBcclxuXHRcdCAgICAub24oJ2xheWVyYWRkJywgdGhpcy5fb25MYXllckNoYW5nZSwgdGhpcylcclxuXHRcdCAgICAub24oJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllckNoYW5nZSwgdGhpcyk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcclxuXHR9LFxyXG5cclxuXHRvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xyXG5cdFx0bWFwXHJcblx0XHQgICAgLm9mZignbGF5ZXJhZGQnLCB0aGlzLl9vbkxheWVyQ2hhbmdlKVxyXG5cdFx0ICAgIC5vZmYoJ2xheWVycmVtb3ZlJywgdGhpcy5fb25MYXllckNoYW5nZSk7XHJcblx0fSxcclxuXHJcblx0YWRkQmFzZUxheWVyOiBmdW5jdGlvbiAobGF5ZXIsIG5hbWUpIHtcclxuXHRcdHRoaXMuX2FkZExheWVyKGxheWVyLCBuYW1lKTtcclxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0YWRkT3ZlcmxheTogZnVuY3Rpb24gKGxheWVyLCBuYW1lKSB7XHJcblx0XHR0aGlzLl9hZGRMYXllcihsYXllciwgbmFtZSwgdHJ1ZSk7XHJcblx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdHJlbW92ZUxheWVyOiBmdW5jdGlvbiAobGF5ZXIpIHtcclxuXHRcdHZhciBpZCA9IEwuc3RhbXAobGF5ZXIpO1xyXG5cdFx0ZGVsZXRlIHRoaXMuX2xheWVyc1tpZF07XHJcblx0XHR0aGlzLl91cGRhdGUoKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH0sXHJcblxyXG5cdF9pbml0TGF5b3V0OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtY29udHJvbC1sYXllcnMnLFxyXG5cdFx0ICAgIGNvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSk7XHJcblxyXG5cdFx0Ly9NYWtlcyB0aGlzIHdvcmsgb24gSUUxMCBUb3VjaCBkZXZpY2VzIGJ5IHN0b3BwaW5nIGl0IGZyb20gZmlyaW5nIGEgbW91c2VvdXQgZXZlbnQgd2hlbiB0aGUgdG91Y2ggaXMgcmVsZWFzZWRcclxuXHRcdGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGFzcG9wdXAnLCB0cnVlKTtcclxuXHJcblx0XHRpZiAoIUwuQnJvd3Nlci50b3VjaCkge1xyXG5cdFx0XHRMLkRvbUV2ZW50XHJcblx0XHRcdFx0LmRpc2FibGVDbGlja1Byb3BhZ2F0aW9uKGNvbnRhaW5lcilcclxuXHRcdFx0XHQuZGlzYWJsZVNjcm9sbFByb3BhZ2F0aW9uKGNvbnRhaW5lcik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRMLkRvbUV2ZW50Lm9uKGNvbnRhaW5lciwgJ2NsaWNrJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBmb3JtID0gdGhpcy5fZm9ybSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2Zvcm0nLCBjbGFzc05hbWUgKyAnLWxpc3QnKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmNvbGxhcHNlZCkge1xyXG5cdFx0XHRpZiAoIUwuQnJvd3Nlci5hbmRyb2lkKSB7XHJcblx0XHRcdFx0TC5Eb21FdmVudFxyXG5cdFx0XHRcdCAgICAub24oY29udGFpbmVyLCAnbW91c2VvdmVyJywgdGhpcy5fZXhwYW5kLCB0aGlzKVxyXG5cdFx0XHRcdCAgICAub24oY29udGFpbmVyLCAnbW91c2VvdXQnLCB0aGlzLl9jb2xsYXBzZSwgdGhpcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0dmFyIGxpbmsgPSB0aGlzLl9sYXllcnNMaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsIGNsYXNzTmFtZSArICctdG9nZ2xlJywgY29udGFpbmVyKTtcclxuXHRcdFx0bGluay5ocmVmID0gJyMnO1xyXG5cdFx0XHRsaW5rLnRpdGxlID0gJ0xheWVycyc7XHJcblxyXG5cdFx0XHRpZiAoTC5Ccm93c2VyLnRvdWNoKSB7XHJcblx0XHRcdFx0TC5Eb21FdmVudFxyXG5cdFx0XHRcdCAgICAub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5zdG9wKVxyXG5cdFx0XHRcdCAgICAub24obGluaywgJ2NsaWNrJywgdGhpcy5fZXhwYW5kLCB0aGlzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRMLkRvbUV2ZW50Lm9uKGxpbmssICdmb2N1cycsIHRoaXMuX2V4cGFuZCwgdGhpcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly9Xb3JrIGFyb3VuZCBmb3IgRmlyZWZveCBhbmRyb2lkIGlzc3VlIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvaXNzdWVzLzIwMzNcclxuXHRcdFx0TC5Eb21FdmVudC5vbihmb3JtLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2V0VGltZW91dChMLmJpbmQodGhpcy5fb25JbnB1dENsaWNrLCB0aGlzKSwgMCk7XHJcblx0XHRcdH0sIHRoaXMpO1xyXG5cclxuXHRcdFx0dGhpcy5fbWFwLm9uKCdjbGljaycsIHRoaXMuX2NvbGxhcHNlLCB0aGlzKTtcclxuXHRcdFx0Ly8gVE9ETyBrZXlib2FyZCBhY2Nlc3NpYmlsaXR5XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9leHBhbmQoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9iYXNlTGF5ZXJzTGlzdCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSArICctYmFzZScsIGZvcm0pO1xyXG5cdFx0dGhpcy5fc2VwYXJhdG9yID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgY2xhc3NOYW1lICsgJy1zZXBhcmF0b3InLCBmb3JtKTtcclxuXHRcdHRoaXMuX292ZXJsYXlzTGlzdCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsIGNsYXNzTmFtZSArICctb3ZlcmxheXMnLCBmb3JtKTtcclxuXHJcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XHJcblx0fSxcclxuXHJcblx0X2FkZExheWVyOiBmdW5jdGlvbiAobGF5ZXIsIG5hbWUsIG92ZXJsYXkpIHtcclxuXHRcdHZhciBpZCA9IEwuc3RhbXAobGF5ZXIpO1xyXG5cclxuXHRcdHRoaXMuX2xheWVyc1tpZF0gPSB7XHJcblx0XHRcdGxheWVyOiBsYXllcixcclxuXHRcdFx0bmFtZTogbmFtZSxcclxuXHRcdFx0b3ZlcmxheTogb3ZlcmxheVxyXG5cdFx0fTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmF1dG9aSW5kZXggJiYgbGF5ZXIuc2V0WkluZGV4KSB7XHJcblx0XHRcdHRoaXMuX2xhc3RaSW5kZXgrKztcclxuXHRcdFx0bGF5ZXIuc2V0WkluZGV4KHRoaXMuX2xhc3RaSW5kZXgpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmICghdGhpcy5fY29udGFpbmVyKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9iYXNlTGF5ZXJzTGlzdC5pbm5lckhUTUwgPSAnJztcclxuXHRcdHRoaXMuX292ZXJsYXlzTGlzdC5pbm5lckhUTUwgPSAnJztcclxuXHJcblx0XHR2YXIgYmFzZUxheWVyc1ByZXNlbnQgPSBmYWxzZSxcclxuXHRcdCAgICBvdmVybGF5c1ByZXNlbnQgPSBmYWxzZSxcclxuXHRcdCAgICBpLCBvYmo7XHJcblxyXG5cdFx0Zm9yIChpIGluIHRoaXMuX2xheWVycykge1xyXG5cdFx0XHRvYmogPSB0aGlzLl9sYXllcnNbaV07XHJcblx0XHRcdHRoaXMuX2FkZEl0ZW0ob2JqKTtcclxuXHRcdFx0b3ZlcmxheXNQcmVzZW50ID0gb3ZlcmxheXNQcmVzZW50IHx8IG9iai5vdmVybGF5O1xyXG5cdFx0XHRiYXNlTGF5ZXJzUHJlc2VudCA9IGJhc2VMYXllcnNQcmVzZW50IHx8ICFvYmoub3ZlcmxheTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9zZXBhcmF0b3Iuc3R5bGUuZGlzcGxheSA9IG92ZXJsYXlzUHJlc2VudCAmJiBiYXNlTGF5ZXJzUHJlc2VudCA/ICcnIDogJ25vbmUnO1xyXG5cdH0sXHJcblxyXG5cdF9vbkxheWVyQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dmFyIG9iaiA9IHRoaXMuX2xheWVyc1tMLnN0YW1wKGUubGF5ZXIpXTtcclxuXHJcblx0XHRpZiAoIW9iaikgeyByZXR1cm47IH1cclxuXHJcblx0XHRpZiAoIXRoaXMuX2hhbmRsaW5nQ2xpY2spIHtcclxuXHRcdFx0dGhpcy5fdXBkYXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHR5cGUgPSBvYmoub3ZlcmxheSA/XHJcblx0XHRcdChlLnR5cGUgPT09ICdsYXllcmFkZCcgPyAnb3ZlcmxheWFkZCcgOiAnb3ZlcmxheXJlbW92ZScpIDpcclxuXHRcdFx0KGUudHlwZSA9PT0gJ2xheWVyYWRkJyA/ICdiYXNlbGF5ZXJjaGFuZ2UnIDogbnVsbCk7XHJcblxyXG5cdFx0aWYgKHR5cGUpIHtcclxuXHRcdFx0dGhpcy5fbWFwLmZpcmUodHlwZSwgb2JqKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyBJRTcgYnVncyBvdXQgaWYgeW91IGNyZWF0ZSBhIHJhZGlvIGR5bmFtaWNhbGx5LCBzbyB5b3UgaGF2ZSB0byBkbyBpdCB0aGlzIGhhY2t5IHdheSAoc2VlIGh0dHA6Ly9iaXQubHkvUHFZTEJlKVxyXG5cdF9jcmVhdGVSYWRpb0VsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBjaGVja2VkKSB7XHJcblxyXG5cdFx0dmFyIHJhZGlvSHRtbCA9ICc8aW5wdXQgdHlwZT1cInJhZGlvXCIgY2xhc3M9XCJsZWFmbGV0LWNvbnRyb2wtbGF5ZXJzLXNlbGVjdG9yXCIgbmFtZT1cIicgKyBuYW1lICsgJ1wiJztcclxuXHRcdGlmIChjaGVja2VkKSB7XHJcblx0XHRcdHJhZGlvSHRtbCArPSAnIGNoZWNrZWQ9XCJjaGVja2VkXCInO1xyXG5cdFx0fVxyXG5cdFx0cmFkaW9IdG1sICs9ICcvPic7XHJcblxyXG5cdFx0dmFyIHJhZGlvRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdHJhZGlvRnJhZ21lbnQuaW5uZXJIVE1MID0gcmFkaW9IdG1sO1xyXG5cclxuXHRcdHJldHVybiByYWRpb0ZyYWdtZW50LmZpcnN0Q2hpbGQ7XHJcblx0fSxcclxuXHJcblx0X2FkZEl0ZW06IGZ1bmN0aW9uIChvYmopIHtcclxuXHRcdHZhciBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyksXHJcblx0XHQgICAgaW5wdXQsXHJcblx0XHQgICAgY2hlY2tlZCA9IHRoaXMuX21hcC5oYXNMYXllcihvYmoubGF5ZXIpO1xyXG5cclxuXHRcdGlmIChvYmoub3ZlcmxheSkge1xyXG5cdFx0XHRpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcblx0XHRcdGlucHV0LnR5cGUgPSAnY2hlY2tib3gnO1xyXG5cdFx0XHRpbnB1dC5jbGFzc05hbWUgPSAnbGVhZmxldC1jb250cm9sLWxheWVycy1zZWxlY3Rvcic7XHJcblx0XHRcdGlucHV0LmRlZmF1bHRDaGVja2VkID0gY2hlY2tlZDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlucHV0ID0gdGhpcy5fY3JlYXRlUmFkaW9FbGVtZW50KCdsZWFmbGV0LWJhc2UtbGF5ZXJzJywgY2hlY2tlZCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aW5wdXQubGF5ZXJJZCA9IEwuc3RhbXAob2JqLmxheWVyKTtcclxuXHJcblx0XHRMLkRvbUV2ZW50Lm9uKGlucHV0LCAnY2xpY2snLCB0aGlzLl9vbklucHV0Q2xpY2ssIHRoaXMpO1xyXG5cclxuXHRcdHZhciBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG5cdFx0bmFtZS5pbm5lckhUTUwgPSAnICcgKyBvYmoubmFtZTtcclxuXHJcblx0XHRsYWJlbC5hcHBlbmRDaGlsZChpbnB1dCk7XHJcblx0XHRsYWJlbC5hcHBlbmRDaGlsZChuYW1lKTtcclxuXHJcblx0XHR2YXIgY29udGFpbmVyID0gb2JqLm92ZXJsYXkgPyB0aGlzLl9vdmVybGF5c0xpc3QgOiB0aGlzLl9iYXNlTGF5ZXJzTGlzdDtcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChsYWJlbCk7XHJcblxyXG5cdFx0cmV0dXJuIGxhYmVsO1xyXG5cdH0sXHJcblxyXG5cdF9vbklucHV0Q2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBpLCBpbnB1dCwgb2JqLFxyXG5cdFx0ICAgIGlucHV0cyA9IHRoaXMuX2Zvcm0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JyksXHJcblx0XHQgICAgaW5wdXRzTGVuID0gaW5wdXRzLmxlbmd0aDtcclxuXHJcblx0XHR0aGlzLl9oYW5kbGluZ0NsaWNrID0gdHJ1ZTtcclxuXHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgaW5wdXRzTGVuOyBpKyspIHtcclxuXHRcdFx0aW5wdXQgPSBpbnB1dHNbaV07XHJcblx0XHRcdG9iaiA9IHRoaXMuX2xheWVyc1tpbnB1dC5sYXllcklkXTtcclxuXHJcblx0XHRcdGlmIChpbnB1dC5jaGVja2VkICYmICF0aGlzLl9tYXAuaGFzTGF5ZXIob2JqLmxheWVyKSkge1xyXG5cdFx0XHRcdHRoaXMuX21hcC5hZGRMYXllcihvYmoubGF5ZXIpO1xyXG5cclxuXHRcdFx0fSBlbHNlIGlmICghaW5wdXQuY2hlY2tlZCAmJiB0aGlzLl9tYXAuaGFzTGF5ZXIob2JqLmxheWVyKSkge1xyXG5cdFx0XHRcdHRoaXMuX21hcC5yZW1vdmVMYXllcihvYmoubGF5ZXIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5faGFuZGxpbmdDbGljayA9IGZhbHNlO1xyXG5cclxuXHRcdHRoaXMuX3JlZm9jdXNPbk1hcCgpO1xyXG5cdH0sXHJcblxyXG5cdF9leHBhbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWNvbnRyb2wtbGF5ZXJzLWV4cGFuZGVkJyk7XHJcblx0fSxcclxuXHJcblx0X2NvbGxhcHNlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR0aGlzLl9jb250YWluZXIuY2xhc3NOYW1lID0gdGhpcy5fY29udGFpbmVyLmNsYXNzTmFtZS5yZXBsYWNlKCcgbGVhZmxldC1jb250cm9sLWxheWVycy1leHBhbmRlZCcsICcnKTtcclxuXHR9XHJcbn0pO1xyXG5cclxuTC5jb250cm9sLmxheWVycyA9IGZ1bmN0aW9uIChiYXNlTGF5ZXJzLCBvdmVybGF5cywgb3B0aW9ucykge1xyXG5cdHJldHVybiBuZXcgTC5Db250cm9sLkxheWVycyhiYXNlTGF5ZXJzLCBvdmVybGF5cywgb3B0aW9ucyk7XHJcbn07XHJcblxuXG4vKlxuICogTC5Qb3NBbmltYXRpb24gaXMgdXNlZCBieSBMZWFmbGV0IGludGVybmFsbHkgZm9yIHBhbiBhbmltYXRpb25zLlxuICovXG5cbkwuUG9zQW5pbWF0aW9uID0gTC5DbGFzcy5leHRlbmQoe1xuXHRpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXG5cblx0cnVuOiBmdW5jdGlvbiAoZWwsIG5ld1BvcywgZHVyYXRpb24sIGVhc2VMaW5lYXJpdHkpIHsgLy8gKEhUTUxFbGVtZW50LCBQb2ludFssIE51bWJlciwgTnVtYmVyXSlcblx0XHR0aGlzLnN0b3AoKTtcblxuXHRcdHRoaXMuX2VsID0gZWw7XG5cdFx0dGhpcy5faW5Qcm9ncmVzcyA9IHRydWU7XG5cdFx0dGhpcy5fbmV3UG9zID0gbmV3UG9zO1xuXG5cdFx0dGhpcy5maXJlKCdzdGFydCcpO1xuXG5cdFx0ZWwuc3R5bGVbTC5Eb21VdGlsLlRSQU5TSVRJT05dID0gJ2FsbCAnICsgKGR1cmF0aW9uIHx8IDAuMjUpICtcblx0XHQgICAgICAgICdzIGN1YmljLWJlemllcigwLDAsJyArIChlYXNlTGluZWFyaXR5IHx8IDAuNSkgKyAnLDEpJztcblxuXHRcdEwuRG9tRXZlbnQub24oZWwsIEwuRG9tVXRpbC5UUkFOU0lUSU9OX0VORCwgdGhpcy5fb25UcmFuc2l0aW9uRW5kLCB0aGlzKTtcblx0XHRMLkRvbVV0aWwuc2V0UG9zaXRpb24oZWwsIG5ld1Bvcyk7XG5cblx0XHQvLyB0b2dnbGUgcmVmbG93LCBDaHJvbWUgZmxpY2tlcnMgZm9yIHNvbWUgcmVhc29uIGlmIHlvdSBkb24ndCBkbyB0aGlzXG5cdFx0TC5VdGlsLmZhbHNlRm4oZWwub2Zmc2V0V2lkdGgpO1xuXG5cdFx0Ly8gdGhlcmUncyBubyBuYXRpdmUgd2F5IHRvIHRyYWNrIHZhbHVlIHVwZGF0ZXMgb2YgdHJhbnNpdGlvbmVkIHByb3BlcnRpZXMsIHNvIHdlIGltaXRhdGUgdGhpc1xuXHRcdHRoaXMuX3N0ZXBUaW1lciA9IHNldEludGVydmFsKEwuYmluZCh0aGlzLl9vblN0ZXAsIHRoaXMpLCA1MCk7XG5cdH0sXG5cblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdGlmICghdGhpcy5faW5Qcm9ncmVzcykgeyByZXR1cm47IH1cblxuXHRcdC8vIGlmIHdlIGp1c3QgcmVtb3ZlZCB0aGUgdHJhbnNpdGlvbiBwcm9wZXJ0eSwgdGhlIGVsZW1lbnQgd291bGQganVtcCB0byBpdHMgZmluYWwgcG9zaXRpb24sXG5cdFx0Ly8gc28gd2UgbmVlZCB0byBtYWtlIGl0IHN0YXkgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb25cblxuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9lbCwgdGhpcy5fZ2V0UG9zKCkpO1xuXHRcdHRoaXMuX29uVHJhbnNpdGlvbkVuZCgpO1xuXHRcdEwuVXRpbC5mYWxzZUZuKHRoaXMuX2VsLm9mZnNldFdpZHRoKTsgLy8gZm9yY2UgcmVmbG93IGluIGNhc2Ugd2UgYXJlIGFib3V0IHRvIHN0YXJ0IGEgbmV3IGFuaW1hdGlvblxuXHR9LFxuXG5cdF9vblN0ZXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgc3RlcFBvcyA9IHRoaXMuX2dldFBvcygpO1xuXHRcdGlmICghc3RlcFBvcykge1xuXHRcdFx0dGhpcy5fb25UcmFuc2l0aW9uRW5kKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlXG5cdFx0Ly8gbWFrZSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24gcmV0dXJuIGludGVybWVkaWF0ZSBwb3NpdGlvbiB2YWx1ZSBkdXJpbmcgYW5pbWF0aW9uXG5cdFx0dGhpcy5fZWwuX2xlYWZsZXRfcG9zID0gc3RlcFBvcztcblxuXHRcdHRoaXMuZmlyZSgnc3RlcCcpO1xuXHR9LFxuXG5cdC8vIHlvdSBjYW4ndCBlYXNpbHkgZ2V0IGludGVybWVkaWF0ZSB2YWx1ZXMgb2YgcHJvcGVydGllcyBhbmltYXRlZCB3aXRoIENTUzMgVHJhbnNpdGlvbnMsXG5cdC8vIHdlIG5lZWQgdG8gcGFyc2UgY29tcHV0ZWQgc3R5bGUgKGluIGNhc2Ugb2YgdHJhbnNmb3JtIGl0IHJldHVybnMgbWF0cml4IHN0cmluZylcblxuXHRfdHJhbnNmb3JtUmU6IC8oWy0rXT8oPzpcXGQqXFwuKT9cXGQrKVxcRCosIChbLStdPyg/OlxcZCpcXC4pP1xcZCspXFxEKlxcKS8sXG5cblx0X2dldFBvczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBsZWZ0LCB0b3AsIG1hdGNoZXMsXG5cdFx0ICAgIGVsID0gdGhpcy5fZWwsXG5cdFx0ICAgIHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpO1xuXG5cdFx0aWYgKEwuQnJvd3Nlci5hbnkzZCkge1xuXHRcdFx0bWF0Y2hlcyA9IHN0eWxlW0wuRG9tVXRpbC5UUkFOU0ZPUk1dLm1hdGNoKHRoaXMuX3RyYW5zZm9ybVJlKTtcblx0XHRcdGlmICghbWF0Y2hlcykgeyByZXR1cm47IH1cblx0XHRcdGxlZnQgPSBwYXJzZUZsb2F0KG1hdGNoZXNbMV0pO1xuXHRcdFx0dG9wICA9IHBhcnNlRmxvYXQobWF0Y2hlc1syXSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxlZnQgPSBwYXJzZUZsb2F0KHN0eWxlLmxlZnQpO1xuXHRcdFx0dG9wICA9IHBhcnNlRmxvYXQoc3R5bGUudG9wKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IEwuUG9pbnQobGVmdCwgdG9wLCB0cnVlKTtcblx0fSxcblxuXHRfb25UcmFuc2l0aW9uRW5kOiBmdW5jdGlvbiAoKSB7XG5cdFx0TC5Eb21FdmVudC5vZmYodGhpcy5fZWwsIEwuRG9tVXRpbC5UUkFOU0lUSU9OX0VORCwgdGhpcy5fb25UcmFuc2l0aW9uRW5kLCB0aGlzKTtcblxuXHRcdGlmICghdGhpcy5faW5Qcm9ncmVzcykgeyByZXR1cm47IH1cblx0XHR0aGlzLl9pblByb2dyZXNzID0gZmFsc2U7XG5cblx0XHR0aGlzLl9lbC5zdHlsZVtMLkRvbVV0aWwuVFJBTlNJVElPTl0gPSAnJztcblxuXHRcdC8vIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlXG5cdFx0Ly8gbWFrZSBzdXJlIEwuRG9tVXRpbC5nZXRQb3NpdGlvbiByZXR1cm5zIHRoZSBmaW5hbCBwb3NpdGlvbiB2YWx1ZSBhZnRlciBhbmltYXRpb25cblx0XHR0aGlzLl9lbC5fbGVhZmxldF9wb3MgPSB0aGlzLl9uZXdQb3M7XG5cblx0XHRjbGVhckludGVydmFsKHRoaXMuX3N0ZXBUaW1lcik7XG5cblx0XHR0aGlzLmZpcmUoJ3N0ZXAnKS5maXJlKCdlbmQnKTtcblx0fVxuXG59KTtcblxuXG4vKlxuICogRXh0ZW5kcyBMLk1hcCB0byBoYW5kbGUgcGFubmluZyBhbmltYXRpb25zLlxuICovXG5cbkwuTWFwLmluY2x1ZGUoe1xuXG5cdHNldFZpZXc6IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20sIG9wdGlvbnMpIHtcblxuXHRcdHpvb20gPSB6b29tID09PSB1bmRlZmluZWQgPyB0aGlzLl96b29tIDogdGhpcy5fbGltaXRab29tKHpvb20pO1xuXHRcdGNlbnRlciA9IHRoaXMuX2xpbWl0Q2VudGVyKEwubGF0TG5nKGNlbnRlciksIHpvb20sIHRoaXMub3B0aW9ucy5tYXhCb3VuZHMpO1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYgKHRoaXMuX3BhbkFuaW0pIHtcblx0XHRcdHRoaXMuX3BhbkFuaW0uc3RvcCgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9sb2FkZWQgJiYgIW9wdGlvbnMucmVzZXQgJiYgb3B0aW9ucyAhPT0gdHJ1ZSkge1xuXG5cdFx0XHRpZiAob3B0aW9ucy5hbmltYXRlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0b3B0aW9ucy56b29tID0gTC5leHRlbmQoe2FuaW1hdGU6IG9wdGlvbnMuYW5pbWF0ZX0sIG9wdGlvbnMuem9vbSk7XG5cdFx0XHRcdG9wdGlvbnMucGFuID0gTC5leHRlbmQoe2FuaW1hdGU6IG9wdGlvbnMuYW5pbWF0ZX0sIG9wdGlvbnMucGFuKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gdHJ5IGFuaW1hdGluZyBwYW4gb3Igem9vbVxuXHRcdFx0dmFyIGFuaW1hdGVkID0gKHRoaXMuX3pvb20gIT09IHpvb20pID9cblx0XHRcdFx0dGhpcy5fdHJ5QW5pbWF0ZWRab29tICYmIHRoaXMuX3RyeUFuaW1hdGVkWm9vbShjZW50ZXIsIHpvb20sIG9wdGlvbnMuem9vbSkgOlxuXHRcdFx0XHR0aGlzLl90cnlBbmltYXRlZFBhbihjZW50ZXIsIG9wdGlvbnMucGFuKTtcblxuXHRcdFx0aWYgKGFuaW1hdGVkKSB7XG5cdFx0XHRcdC8vIHByZXZlbnQgcmVzaXplIGhhbmRsZXIgY2FsbCwgdGhlIHZpZXcgd2lsbCByZWZyZXNoIGFmdGVyIGFuaW1hdGlvbiBhbnl3YXlcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX3NpemVUaW1lcik7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGFuaW1hdGlvbiBkaWRuJ3Qgc3RhcnQsIGp1c3QgcmVzZXQgdGhlIG1hcCB2aWV3XG5cdFx0dGhpcy5fcmVzZXRWaWV3KGNlbnRlciwgem9vbSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRwYW5CeTogZnVuY3Rpb24gKG9mZnNldCwgb3B0aW9ucykge1xuXHRcdG9mZnNldCA9IEwucG9pbnQob2Zmc2V0KS5yb3VuZCgpO1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYgKCFvZmZzZXQueCAmJiAhb2Zmc2V0LnkpIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5fcGFuQW5pbSkge1xuXHRcdFx0dGhpcy5fcGFuQW5pbSA9IG5ldyBMLlBvc0FuaW1hdGlvbigpO1xuXG5cdFx0XHR0aGlzLl9wYW5BbmltLm9uKHtcblx0XHRcdFx0J3N0ZXAnOiB0aGlzLl9vblBhblRyYW5zaXRpb25TdGVwLFxuXHRcdFx0XHQnZW5kJzogdGhpcy5fb25QYW5UcmFuc2l0aW9uRW5kXG5cdFx0XHR9LCB0aGlzKTtcblx0XHR9XG5cblx0XHQvLyBkb24ndCBmaXJlIG1vdmVzdGFydCBpZiBhbmltYXRpbmcgaW5lcnRpYVxuXHRcdGlmICghb3B0aW9ucy5ub01vdmVTdGFydCkge1xuXHRcdFx0dGhpcy5maXJlKCdtb3Zlc3RhcnQnKTtcblx0XHR9XG5cblx0XHQvLyBhbmltYXRlIHBhbiB1bmxlc3MgYW5pbWF0ZTogZmFsc2Ugc3BlY2lmaWVkXG5cdFx0aWYgKG9wdGlvbnMuYW5pbWF0ZSAhPT0gZmFsc2UpIHtcblx0XHRcdEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9tYXBQYW5lLCAnbGVhZmxldC1wYW4tYW5pbScpO1xuXG5cdFx0XHR2YXIgbmV3UG9zID0gdGhpcy5fZ2V0TWFwUGFuZVBvcygpLnN1YnRyYWN0KG9mZnNldCk7XG5cdFx0XHR0aGlzLl9wYW5BbmltLnJ1bih0aGlzLl9tYXBQYW5lLCBuZXdQb3MsIG9wdGlvbnMuZHVyYXRpb24gfHwgMC4yNSwgb3B0aW9ucy5lYXNlTGluZWFyaXR5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fcmF3UGFuQnkob2Zmc2V0KTtcblx0XHRcdHRoaXMuZmlyZSgnbW92ZScpLmZpcmUoJ21vdmVlbmQnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRfb25QYW5UcmFuc2l0aW9uU3RlcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZmlyZSgnbW92ZScpO1xuXHR9LFxuXG5cdF9vblBhblRyYW5zaXRpb25FbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fbWFwUGFuZSwgJ2xlYWZsZXQtcGFuLWFuaW0nKTtcblx0XHR0aGlzLmZpcmUoJ21vdmVlbmQnKTtcblx0fSxcblxuXHRfdHJ5QW5pbWF0ZWRQYW46IGZ1bmN0aW9uIChjZW50ZXIsIG9wdGlvbnMpIHtcblx0XHQvLyBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG5ldyBhbmQgY3VycmVudCBjZW50ZXJzIGluIHBpeGVsc1xuXHRcdHZhciBvZmZzZXQgPSB0aGlzLl9nZXRDZW50ZXJPZmZzZXQoY2VudGVyKS5fZmxvb3IoKTtcblxuXHRcdC8vIGRvbid0IGFuaW1hdGUgdG9vIGZhciB1bmxlc3MgYW5pbWF0ZTogdHJ1ZSBzcGVjaWZpZWQgaW4gb3B0aW9uc1xuXHRcdGlmICgob3B0aW9ucyAmJiBvcHRpb25zLmFuaW1hdGUpICE9PSB0cnVlICYmICF0aGlzLmdldFNpemUoKS5jb250YWlucyhvZmZzZXQpKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdFx0dGhpcy5wYW5CeShvZmZzZXQsIG9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn0pO1xuXG5cbi8qXG4gKiBMLlBvc0FuaW1hdGlvbiBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiB0aGF0IHBvd2VycyBMZWFmbGV0IHBhbiBhbmltYXRpb25zXG4gKiBpbiBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgQ1NTMyBUcmFuc2l0aW9ucy5cbiAqL1xuXG5MLlBvc0FuaW1hdGlvbiA9IEwuRG9tVXRpbC5UUkFOU0lUSU9OID8gTC5Qb3NBbmltYXRpb24gOiBMLlBvc0FuaW1hdGlvbi5leHRlbmQoe1xuXG5cdHJ1bjogZnVuY3Rpb24gKGVsLCBuZXdQb3MsIGR1cmF0aW9uLCBlYXNlTGluZWFyaXR5KSB7IC8vIChIVE1MRWxlbWVudCwgUG9pbnRbLCBOdW1iZXIsIE51bWJlcl0pXG5cdFx0dGhpcy5zdG9wKCk7XG5cblx0XHR0aGlzLl9lbCA9IGVsO1xuXHRcdHRoaXMuX2luUHJvZ3Jlc3MgPSB0cnVlO1xuXHRcdHRoaXMuX2R1cmF0aW9uID0gZHVyYXRpb24gfHwgMC4yNTtcblx0XHR0aGlzLl9lYXNlT3V0UG93ZXIgPSAxIC8gTWF0aC5tYXgoZWFzZUxpbmVhcml0eSB8fCAwLjUsIDAuMik7XG5cblx0XHR0aGlzLl9zdGFydFBvcyA9IEwuRG9tVXRpbC5nZXRQb3NpdGlvbihlbCk7XG5cdFx0dGhpcy5fb2Zmc2V0ID0gbmV3UG9zLnN1YnRyYWN0KHRoaXMuX3N0YXJ0UG9zKTtcblx0XHR0aGlzLl9zdGFydFRpbWUgPSArbmV3IERhdGUoKTtcblxuXHRcdHRoaXMuZmlyZSgnc3RhcnQnKTtcblxuXHRcdHRoaXMuX2FuaW1hdGUoKTtcblx0fSxcblxuXHRzdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF0aGlzLl9pblByb2dyZXNzKSB7IHJldHVybjsgfVxuXG5cdFx0dGhpcy5fc3RlcCgpO1xuXHRcdHRoaXMuX2NvbXBsZXRlKCk7XG5cdH0sXG5cblx0X2FuaW1hdGU6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBhbmltYXRpb24gbG9vcFxuXHRcdHRoaXMuX2FuaW1JZCA9IEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKHRoaXMuX2FuaW1hdGUsIHRoaXMpO1xuXHRcdHRoaXMuX3N0ZXAoKTtcblx0fSxcblxuXHRfc3RlcDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBlbGFwc2VkID0gKCtuZXcgRGF0ZSgpKSAtIHRoaXMuX3N0YXJ0VGltZSxcblx0XHQgICAgZHVyYXRpb24gPSB0aGlzLl9kdXJhdGlvbiAqIDEwMDA7XG5cblx0XHRpZiAoZWxhcHNlZCA8IGR1cmF0aW9uKSB7XG5cdFx0XHR0aGlzLl9ydW5GcmFtZSh0aGlzLl9lYXNlT3V0KGVsYXBzZWQgLyBkdXJhdGlvbikpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9ydW5GcmFtZSgxKTtcblx0XHRcdHRoaXMuX2NvbXBsZXRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9ydW5GcmFtZTogZnVuY3Rpb24gKHByb2dyZXNzKSB7XG5cdFx0dmFyIHBvcyA9IHRoaXMuX3N0YXJ0UG9zLmFkZCh0aGlzLl9vZmZzZXQubXVsdGlwbHlCeShwcm9ncmVzcykpO1xuXHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9lbCwgcG9zKTtcblxuXHRcdHRoaXMuZmlyZSgnc3RlcCcpO1xuXHR9LFxuXG5cdF9jb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuXHRcdEwuVXRpbC5jYW5jZWxBbmltRnJhbWUodGhpcy5fYW5pbUlkKTtcblxuXHRcdHRoaXMuX2luUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHR0aGlzLmZpcmUoJ2VuZCcpO1xuXHR9LFxuXG5cdF9lYXNlT3V0OiBmdW5jdGlvbiAodCkge1xuXHRcdHJldHVybiAxIC0gTWF0aC5wb3coMSAtIHQsIHRoaXMuX2Vhc2VPdXRQb3dlcik7XG5cdH1cbn0pO1xuXG5cbi8qXG4gKiBFeHRlbmRzIEwuTWFwIHRvIGhhbmRsZSB6b29tIGFuaW1hdGlvbnMuXG4gKi9cblxuTC5NYXAubWVyZ2VPcHRpb25zKHtcblx0em9vbUFuaW1hdGlvbjogdHJ1ZSxcblx0em9vbUFuaW1hdGlvblRocmVzaG9sZDogNFxufSk7XG5cbmlmIChMLkRvbVV0aWwuVFJBTlNJVElPTikge1xuXG5cdEwuTWFwLmFkZEluaXRIb29rKGZ1bmN0aW9uICgpIHtcblx0XHQvLyBkb24ndCBhbmltYXRlIG9uIGJyb3dzZXJzIHdpdGhvdXQgaGFyZHdhcmUtYWNjZWxlcmF0ZWQgdHJhbnNpdGlvbnMgb3Igb2xkIEFuZHJvaWQvT3BlcmFcblx0XHR0aGlzLl96b29tQW5pbWF0ZWQgPSB0aGlzLm9wdGlvbnMuem9vbUFuaW1hdGlvbiAmJiBMLkRvbVV0aWwuVFJBTlNJVElPTiAmJlxuXHRcdFx0XHRMLkJyb3dzZXIuYW55M2QgJiYgIUwuQnJvd3Nlci5hbmRyb2lkMjMgJiYgIUwuQnJvd3Nlci5tb2JpbGVPcGVyYTtcblxuXHRcdC8vIHpvb20gdHJhbnNpdGlvbnMgcnVuIHdpdGggdGhlIHNhbWUgZHVyYXRpb24gZm9yIGFsbCBsYXllcnMsIHNvIGlmIG9uZSBvZiB0cmFuc2l0aW9uZW5kIGV2ZW50c1xuXHRcdC8vIGhhcHBlbnMgYWZ0ZXIgc3RhcnRpbmcgem9vbSBhbmltYXRpb24gKHByb3BhZ2F0aW5nIHRvIHRoZSBtYXAgcGFuZSksIHdlIGtub3cgdGhhdCBpdCBlbmRlZCBnbG9iYWxseVxuXHRcdGlmICh0aGlzLl96b29tQW5pbWF0ZWQpIHtcblx0XHRcdEwuRG9tRXZlbnQub24odGhpcy5fbWFwUGFuZSwgTC5Eb21VdGlsLlRSQU5TSVRJT05fRU5ELCB0aGlzLl9jYXRjaFRyYW5zaXRpb25FbmQsIHRoaXMpO1xuXHRcdH1cblx0fSk7XG59XG5cbkwuTWFwLmluY2x1ZGUoIUwuRG9tVXRpbC5UUkFOU0lUSU9OID8ge30gOiB7XG5cblx0X2NhdGNoVHJhbnNpdGlvbkVuZDogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAodGhpcy5fYW5pbWF0aW5nWm9vbSAmJiBlLnByb3BlcnR5TmFtZS5pbmRleE9mKCd0cmFuc2Zvcm0nKSA+PSAwKSB7XG5cdFx0XHR0aGlzLl9vblpvb21UcmFuc2l0aW9uRW5kKCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9ub3RoaW5nVG9BbmltYXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuICF0aGlzLl9jb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbGVhZmxldC16b29tLWFuaW1hdGVkJykubGVuZ3RoO1xuXHR9LFxuXG5cdF90cnlBbmltYXRlZFpvb206IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20sIG9wdGlvbnMpIHtcblxuXHRcdGlmICh0aGlzLl9hbmltYXRpbmdab29tKSB7IHJldHVybiB0cnVlOyB9XG5cblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdC8vIGRvbid0IGFuaW1hdGUgaWYgZGlzYWJsZWQsIG5vdCBzdXBwb3J0ZWQgb3Igem9vbSBkaWZmZXJlbmNlIGlzIHRvbyBsYXJnZVxuXHRcdGlmICghdGhpcy5fem9vbUFuaW1hdGVkIHx8IG9wdGlvbnMuYW5pbWF0ZSA9PT0gZmFsc2UgfHwgdGhpcy5fbm90aGluZ1RvQW5pbWF0ZSgpIHx8XG5cdFx0ICAgICAgICBNYXRoLmFicyh6b29tIC0gdGhpcy5fem9vbSkgPiB0aGlzLm9wdGlvbnMuem9vbUFuaW1hdGlvblRocmVzaG9sZCkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRcdC8vIG9mZnNldCBpcyB0aGUgcGl4ZWwgY29vcmRzIG9mIHRoZSB6b29tIG9yaWdpbiByZWxhdGl2ZSB0byB0aGUgY3VycmVudCBjZW50ZXJcblx0XHR2YXIgc2NhbGUgPSB0aGlzLmdldFpvb21TY2FsZSh6b29tKSxcblx0XHQgICAgb2Zmc2V0ID0gdGhpcy5fZ2V0Q2VudGVyT2Zmc2V0KGNlbnRlcikuX2RpdmlkZUJ5KDEgLSAxIC8gc2NhbGUpLFxuXHRcdFx0b3JpZ2luID0gdGhpcy5fZ2V0Q2VudGVyTGF5ZXJQb2ludCgpLl9hZGQob2Zmc2V0KTtcblxuXHRcdC8vIGRvbid0IGFuaW1hdGUgaWYgdGhlIHpvb20gb3JpZ2luIGlzbid0IHdpdGhpbiBvbmUgc2NyZWVuIGZyb20gdGhlIGN1cnJlbnQgY2VudGVyLCB1bmxlc3MgZm9yY2VkXG5cdFx0aWYgKG9wdGlvbnMuYW5pbWF0ZSAhPT0gdHJ1ZSAmJiAhdGhpcy5nZXRTaXplKCkuY29udGFpbnMob2Zmc2V0KSkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRcdHRoaXNcblx0XHQgICAgLmZpcmUoJ21vdmVzdGFydCcpXG5cdFx0ICAgIC5maXJlKCd6b29tc3RhcnQnKTtcblxuXHRcdHRoaXMuX2FuaW1hdGVab29tKGNlbnRlciwgem9vbSwgb3JpZ2luLCBzY2FsZSwgbnVsbCwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHRfYW5pbWF0ZVpvb206IGZ1bmN0aW9uIChjZW50ZXIsIHpvb20sIG9yaWdpbiwgc2NhbGUsIGRlbHRhLCBiYWNrd2FyZHMpIHtcblxuXHRcdHRoaXMuX2FuaW1hdGluZ1pvb20gPSB0cnVlO1xuXG5cdFx0Ly8gcHV0IHRyYW5zZm9ybSB0cmFuc2l0aW9uIG9uIGFsbCBsYXllcnMgd2l0aCBsZWFmbGV0LXpvb20tYW5pbWF0ZWQgY2xhc3Ncblx0XHRMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fbWFwUGFuZSwgJ2xlYWZsZXQtem9vbS1hbmltJyk7XG5cblx0XHQvLyByZW1lbWJlciB3aGF0IGNlbnRlci96b29tIHRvIHNldCBhZnRlciBhbmltYXRpb25cblx0XHR0aGlzLl9hbmltYXRlVG9DZW50ZXIgPSBjZW50ZXI7XG5cdFx0dGhpcy5fYW5pbWF0ZVRvWm9vbSA9IHpvb207XG5cblx0XHQvLyBkaXNhYmxlIGFueSBkcmFnZ2luZyBkdXJpbmcgYW5pbWF0aW9uXG5cdFx0aWYgKEwuRHJhZ2dhYmxlKSB7XG5cdFx0XHRMLkRyYWdnYWJsZS5fZGlzYWJsZWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHRoaXMuZmlyZSgnem9vbWFuaW0nLCB7XG5cdFx0XHRjZW50ZXI6IGNlbnRlcixcblx0XHRcdHpvb206IHpvb20sXG5cdFx0XHRvcmlnaW46IG9yaWdpbixcblx0XHRcdHNjYWxlOiBzY2FsZSxcblx0XHRcdGRlbHRhOiBkZWx0YSxcblx0XHRcdGJhY2t3YXJkczogYmFja3dhcmRzXG5cdFx0fSk7XG5cdH0sXG5cblx0X29uWm9vbVRyYW5zaXRpb25FbmQ6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHRoaXMuX2FuaW1hdGluZ1pvb20gPSBmYWxzZTtcblxuXHRcdEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9tYXBQYW5lLCAnbGVhZmxldC16b29tLWFuaW0nKTtcblxuXHRcdHRoaXMuX3Jlc2V0Vmlldyh0aGlzLl9hbmltYXRlVG9DZW50ZXIsIHRoaXMuX2FuaW1hdGVUb1pvb20sIHRydWUsIHRydWUpO1xuXG5cdFx0aWYgKEwuRHJhZ2dhYmxlKSB7XG5cdFx0XHRMLkRyYWdnYWJsZS5fZGlzYWJsZWQgPSBmYWxzZTtcblx0XHR9XG5cdH1cbn0pO1xuXG5cbi8qXG5cdFpvb20gYW5pbWF0aW9uIGxvZ2ljIGZvciBMLlRpbGVMYXllci5cbiovXG5cbkwuVGlsZUxheWVyLmluY2x1ZGUoe1xuXHRfYW5pbWF0ZVpvb206IGZ1bmN0aW9uIChlKSB7XG5cdFx0aWYgKCF0aGlzLl9hbmltYXRpbmcpIHtcblx0XHRcdHRoaXMuX2FuaW1hdGluZyA9IHRydWU7XG5cdFx0XHR0aGlzLl9wcmVwYXJlQmdCdWZmZXIoKTtcblx0XHR9XG5cblx0XHR2YXIgYmcgPSB0aGlzLl9iZ0J1ZmZlcixcblx0XHQgICAgdHJhbnNmb3JtID0gTC5Eb21VdGlsLlRSQU5TRk9STSxcblx0XHQgICAgaW5pdGlhbFRyYW5zZm9ybSA9IGUuZGVsdGEgPyBMLkRvbVV0aWwuZ2V0VHJhbnNsYXRlU3RyaW5nKGUuZGVsdGEpIDogYmcuc3R5bGVbdHJhbnNmb3JtXSxcblx0XHQgICAgc2NhbGVTdHIgPSBMLkRvbVV0aWwuZ2V0U2NhbGVTdHJpbmcoZS5zY2FsZSwgZS5vcmlnaW4pO1xuXG5cdFx0Ymcuc3R5bGVbdHJhbnNmb3JtXSA9IGUuYmFja3dhcmRzID9cblx0XHRcdFx0c2NhbGVTdHIgKyAnICcgKyBpbml0aWFsVHJhbnNmb3JtIDpcblx0XHRcdFx0aW5pdGlhbFRyYW5zZm9ybSArICcgJyArIHNjYWxlU3RyO1xuXHR9LFxuXG5cdF9lbmRab29tQW5pbTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBmcm9udCA9IHRoaXMuX3RpbGVDb250YWluZXIsXG5cdFx0ICAgIGJnID0gdGhpcy5fYmdCdWZmZXI7XG5cblx0XHRmcm9udC5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XG5cdFx0ZnJvbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChmcm9udCk7IC8vIEJyaW5nIHRvIGZvcmVcblxuXHRcdC8vIGZvcmNlIHJlZmxvd1xuXHRcdEwuVXRpbC5mYWxzZUZuKGJnLm9mZnNldFdpZHRoKTtcblxuXHRcdHRoaXMuX2FuaW1hdGluZyA9IGZhbHNlO1xuXHR9LFxuXG5cdF9jbGVhckJnQnVmZmVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIG1hcCA9IHRoaXMuX21hcDtcblxuXHRcdGlmIChtYXAgJiYgIW1hcC5fYW5pbWF0aW5nWm9vbSAmJiAhbWFwLnRvdWNoWm9vbS5fem9vbWluZykge1xuXHRcdFx0dGhpcy5fYmdCdWZmZXIuaW5uZXJIVE1MID0gJyc7XG5cdFx0XHR0aGlzLl9iZ0J1ZmZlci5zdHlsZVtMLkRvbVV0aWwuVFJBTlNGT1JNXSA9ICcnO1xuXHRcdH1cblx0fSxcblxuXHRfcHJlcGFyZUJnQnVmZmVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgZnJvbnQgPSB0aGlzLl90aWxlQ29udGFpbmVyLFxuXHRcdCAgICBiZyA9IHRoaXMuX2JnQnVmZmVyO1xuXG5cdFx0Ly8gaWYgZm9yZWdyb3VuZCBsYXllciBkb2Vzbid0IGhhdmUgbWFueSB0aWxlcyBidXQgYmcgbGF5ZXIgZG9lcyxcblx0XHQvLyBrZWVwIHRoZSBleGlzdGluZyBiZyBsYXllciBhbmQganVzdCB6b29tIGl0IHNvbWUgbW9yZVxuXG5cdFx0dmFyIGJnTG9hZGVkID0gdGhpcy5fZ2V0TG9hZGVkVGlsZXNQZXJjZW50YWdlKGJnKSxcblx0XHQgICAgZnJvbnRMb2FkZWQgPSB0aGlzLl9nZXRMb2FkZWRUaWxlc1BlcmNlbnRhZ2UoZnJvbnQpO1xuXG5cdFx0aWYgKGJnICYmIGJnTG9hZGVkID4gMC41ICYmIGZyb250TG9hZGVkIDwgMC41KSB7XG5cblx0XHRcdGZyb250LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblx0XHRcdHRoaXMuX3N0b3BMb2FkaW5nSW1hZ2VzKGZyb250KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBwcmVwYXJlIHRoZSBidWZmZXIgdG8gYmVjb21lIHRoZSBmcm9udCB0aWxlIHBhbmVcblx0XHRiZy5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG5cdFx0Ymcuc3R5bGVbTC5Eb21VdGlsLlRSQU5TRk9STV0gPSAnJztcblxuXHRcdC8vIHN3aXRjaCBvdXQgdGhlIGN1cnJlbnQgbGF5ZXIgdG8gYmUgdGhlIG5ldyBiZyBsYXllciAoYW5kIHZpY2UtdmVyc2EpXG5cdFx0dGhpcy5fdGlsZUNvbnRhaW5lciA9IGJnO1xuXHRcdGJnID0gdGhpcy5fYmdCdWZmZXIgPSBmcm9udDtcblxuXHRcdHRoaXMuX3N0b3BMb2FkaW5nSW1hZ2VzKGJnKTtcblxuXHRcdC8vcHJldmVudCBiZyBidWZmZXIgZnJvbSBjbGVhcmluZyByaWdodCBhZnRlciB6b29tXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2NsZWFyQmdCdWZmZXJUaW1lcik7XG5cdH0sXG5cblx0X2dldExvYWRlZFRpbGVzUGVyY2VudGFnZTogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuXHRcdHZhciB0aWxlcyA9IGNvbnRhaW5lci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJyksXG5cdFx0ICAgIGksIGxlbiwgY291bnQgPSAwO1xuXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gdGlsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGlmICh0aWxlc1tpXS5jb21wbGV0ZSkge1xuXHRcdFx0XHRjb3VudCsrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gY291bnQgLyBsZW47XG5cdH0sXG5cblx0Ly8gc3RvcHMgbG9hZGluZyBhbGwgdGlsZXMgaW4gdGhlIGJhY2tncm91bmQgbGF5ZXJcblx0X3N0b3BMb2FkaW5nSW1hZ2VzOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG5cdFx0dmFyIHRpbGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY29udGFpbmVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKSksXG5cdFx0ICAgIGksIGxlbiwgdGlsZTtcblxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHRpbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHR0aWxlID0gdGlsZXNbaV07XG5cblx0XHRcdGlmICghdGlsZS5jb21wbGV0ZSkge1xuXHRcdFx0XHR0aWxlLm9ubG9hZCA9IEwuVXRpbC5mYWxzZUZuO1xuXHRcdFx0XHR0aWxlLm9uZXJyb3IgPSBMLlV0aWwuZmFsc2VGbjtcblx0XHRcdFx0dGlsZS5zcmMgPSBMLlV0aWwuZW1wdHlJbWFnZVVybDtcblxuXHRcdFx0XHR0aWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGlsZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KTtcblxuXG4vKlxyXG4gKiBQcm92aWRlcyBMLk1hcCB3aXRoIGNvbnZlbmllbnQgc2hvcnRjdXRzIGZvciB1c2luZyBicm93c2VyIGdlb2xvY2F0aW9uIGZlYXR1cmVzLlxyXG4gKi9cclxuXHJcbkwuTWFwLmluY2x1ZGUoe1xyXG5cdF9kZWZhdWx0TG9jYXRlT3B0aW9uczoge1xyXG5cdFx0d2F0Y2g6IGZhbHNlLFxyXG5cdFx0c2V0VmlldzogZmFsc2UsXHJcblx0XHRtYXhab29tOiBJbmZpbml0eSxcclxuXHRcdHRpbWVvdXQ6IDEwMDAwLFxyXG5cdFx0bWF4aW11bUFnZTogMCxcclxuXHRcdGVuYWJsZUhpZ2hBY2N1cmFjeTogZmFsc2VcclxuXHR9LFxyXG5cclxuXHRsb2NhdGU6IGZ1bmN0aW9uICgvKk9iamVjdCovIG9wdGlvbnMpIHtcclxuXHJcblx0XHRvcHRpb25zID0gdGhpcy5fbG9jYXRlT3B0aW9ucyA9IEwuZXh0ZW5kKHRoaXMuX2RlZmF1bHRMb2NhdGVPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcblx0XHRpZiAoIW5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xyXG5cdFx0XHR0aGlzLl9oYW5kbGVHZW9sb2NhdGlvbkVycm9yKHtcclxuXHRcdFx0XHRjb2RlOiAwLFxyXG5cdFx0XHRcdG1lc3NhZ2U6ICdHZW9sb2NhdGlvbiBub3Qgc3VwcG9ydGVkLidcclxuXHRcdFx0fSk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBvblJlc3BvbnNlID0gTC5iaW5kKHRoaXMuX2hhbmRsZUdlb2xvY2F0aW9uUmVzcG9uc2UsIHRoaXMpLFxyXG5cdFx0XHRvbkVycm9yID0gTC5iaW5kKHRoaXMuX2hhbmRsZUdlb2xvY2F0aW9uRXJyb3IsIHRoaXMpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLndhdGNoKSB7XHJcblx0XHRcdHRoaXMuX2xvY2F0aW9uV2F0Y2hJZCA9XHJcblx0XHRcdCAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLndhdGNoUG9zaXRpb24ob25SZXNwb25zZSwgb25FcnJvciwgb3B0aW9ucyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKG9uUmVzcG9uc2UsIG9uRXJyb3IsIG9wdGlvbnMpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fSxcclxuXHJcblx0c3RvcExvY2F0ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKG5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xyXG5cdFx0XHRuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh0aGlzLl9sb2NhdGlvbldhdGNoSWQpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuX2xvY2F0ZU9wdGlvbnMpIHtcclxuXHRcdFx0dGhpcy5fbG9jYXRlT3B0aW9ucy5zZXRWaWV3ID0gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9LFxyXG5cclxuXHRfaGFuZGxlR2VvbG9jYXRpb25FcnJvcjogZnVuY3Rpb24gKGVycm9yKSB7XHJcblx0XHR2YXIgYyA9IGVycm9yLmNvZGUsXHJcblx0XHQgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgfHxcclxuXHRcdCAgICAgICAgICAgIChjID09PSAxID8gJ3Blcm1pc3Npb24gZGVuaWVkJyA6XHJcblx0XHQgICAgICAgICAgICAoYyA9PT0gMiA/ICdwb3NpdGlvbiB1bmF2YWlsYWJsZScgOiAndGltZW91dCcpKTtcclxuXHJcblx0XHRpZiAodGhpcy5fbG9jYXRlT3B0aW9ucy5zZXRWaWV3ICYmICF0aGlzLl9sb2FkZWQpIHtcclxuXHRcdFx0dGhpcy5maXRXb3JsZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgnbG9jYXRpb25lcnJvcicsIHtcclxuXHRcdFx0Y29kZTogYyxcclxuXHRcdFx0bWVzc2FnZTogJ0dlb2xvY2F0aW9uIGVycm9yOiAnICsgbWVzc2FnZSArICcuJ1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0X2hhbmRsZUdlb2xvY2F0aW9uUmVzcG9uc2U6IGZ1bmN0aW9uIChwb3MpIHtcclxuXHRcdHZhciBsYXQgPSBwb3MuY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0ICAgIGxuZyA9IHBvcy5jb29yZHMubG9uZ2l0dWRlLFxyXG5cdFx0ICAgIGxhdGxuZyA9IG5ldyBMLkxhdExuZyhsYXQsIGxuZyksXHJcblxyXG5cdFx0ICAgIGxhdEFjY3VyYWN5ID0gMTgwICogcG9zLmNvb3Jkcy5hY2N1cmFjeSAvIDQwMDc1MDE3LFxyXG5cdFx0ICAgIGxuZ0FjY3VyYWN5ID0gbGF0QWNjdXJhY3kgLyBNYXRoLmNvcyhMLkxhdExuZy5ERUdfVE9fUkFEICogbGF0KSxcclxuXHJcblx0XHQgICAgYm91bmRzID0gTC5sYXRMbmdCb3VuZHMoXHJcblx0XHQgICAgICAgICAgICBbbGF0IC0gbGF0QWNjdXJhY3ksIGxuZyAtIGxuZ0FjY3VyYWN5XSxcclxuXHRcdCAgICAgICAgICAgIFtsYXQgKyBsYXRBY2N1cmFjeSwgbG5nICsgbG5nQWNjdXJhY3ldKSxcclxuXHJcblx0XHQgICAgb3B0aW9ucyA9IHRoaXMuX2xvY2F0ZU9wdGlvbnM7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMuc2V0Vmlldykge1xyXG5cdFx0XHR2YXIgem9vbSA9IE1hdGgubWluKHRoaXMuZ2V0Qm91bmRzWm9vbShib3VuZHMpLCBvcHRpb25zLm1heFpvb20pO1xyXG5cdFx0XHR0aGlzLnNldFZpZXcobGF0bG5nLCB6b29tKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0bGF0bG5nOiBsYXRsbmcsXHJcblx0XHRcdGJvdW5kczogYm91bmRzLFxyXG5cdFx0XHR0aW1lc3RhbXA6IHBvcy50aW1lc3RhbXBcclxuXHRcdH07XHJcblxyXG5cdFx0Zm9yICh2YXIgaSBpbiBwb3MuY29vcmRzKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgcG9zLmNvb3Jkc1tpXSA9PT0gJ251bWJlcicpIHtcclxuXHRcdFx0XHRkYXRhW2ldID0gcG9zLmNvb3Jkc1tpXTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZmlyZSgnbG9jYXRpb25mb3VuZCcsIGRhdGEpO1xyXG5cdH1cclxufSk7XHJcblxuXG59KHdpbmRvdywgZG9jdW1lbnQpKTsiLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gdGhpc1xuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbmZ1bmN0aW9uIGdldFhIUigpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAmJiAoJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSlcbiAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4gLyoqXG4gICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwcml2YXRlXG4gICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICB2YXIgcGFydHM7XG4gIHZhciBwYWlyO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwYXJ0cyA9IHBhaXIuc3BsaXQoJz0nKTtcbiAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBFeHBvc2UgcGFyc2VyLlxuICovXG5cbnJlcXVlc3QucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcblxuLyoqXG4gKiBEZWZhdWx0IE1JTUUgdHlwZSBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICovXG5cbnJlcXVlc3QudHlwZXMgPSB7XG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybS1kYXRhJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogc2VyaWFsaXplLFxuICAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnN0cmluZ2lmeVxuIH07XG5cbiAvKipcbiAgKiBEZWZhdWx0IHBhcnNlcnMuXG4gICpcbiAgKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihzdHIpe1xuICAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAgKiAgICAgfTtcbiAgKlxuICAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cikge1xuICB2YXIgbGluZXMgPSBzdHIuc3BsaXQoL1xccj9cXG4vKTtcbiAgdmFyIGZpZWxkcyA9IHt9O1xuICB2YXIgaW5kZXg7XG4gIHZhciBsaW5lO1xuICB2YXIgZmllbGQ7XG4gIHZhciB2YWw7XG5cbiAgbGluZXMucG9wKCk7IC8vIHRyYWlsaW5nIENSTEZcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBmaWVsZCA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdHJpbShsaW5lLnNsaWNlKGluZGV4ICsgMSkpO1xuICAgIGZpZWxkc1tmaWVsZF0gPSB2YWw7XG4gIH1cblxuICByZXR1cm4gZmllbGRzO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICB0aGlzLnRleHQgPSB0aGlzLnhoci5yZXNwb25zZVRleHQ7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dCk7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2VcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzIHx8IDEyMjMgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHBhdGggPSByZXEucGF0aDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgcGF0aCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci5wYXRoID0gcGF0aDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIGlmICgnSEVBRCcgPT0gbWV0aG9kKSByZXMudGV4dCA9IG51bGw7XG4gICAgc2VsZi5jYWxsYmFjayhudWxsLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogU2V0IHRpbWVvdXQgdG8gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICB0aGlzLl90aW1lb3V0ID0gbXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0SGVhZGVyID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzKXtcbiAgdmFyIHN0ciA9IGJ0b2EodXNlciArICc6JyArIHBhc3MpO1xuICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaikgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIGlmICgyID09IGZuLmxlbmd0aCkgcmV0dXJuIGZuKGVyciwgcmVzKTtcbiAgaWYgKGVycikgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICBmbihyZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSBnZXRYSFIoKTtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBkYXRhID0gdGhpcy5fZGF0YTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcbiAgICBpZiAoMCA9PSB4aHIuc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm4gc2VsZi50aW1lb3V0RXJyb3IoKTtcbiAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfTtcblxuICAvLyBwcm9ncmVzc1xuICBpZiAoeGhyLnVwbG9hZCkge1xuICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICAgIH07XG4gIH1cblxuICAvLyB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVt0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyldO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHhoci5zZW5kKGRhdGEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5kZWwgPSBmdW5jdGlvbih1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGZuLl9vZmYgPSBvbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgaSA9IGNhbGxiYWNrcy5pbmRleE9mKGZuLl9vZmYgfHwgZm4pO1xuICBpZiAofmkpIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyJdfQ==
