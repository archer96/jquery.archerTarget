(function (window, document, $, undefined) {

/*
	undefined is used here as the undefined global
	variable in ECMAScript 3 and is mutable (i.e. it can
	be changed by someone else). undefined isn't really
	being passed in so we can ensure that its value is
	truly undefined. In ES5, undefined can no longer be
	modified.

	window and document are passed through as local
	variables rather than as globals, because this (slightly)
	quickens the resolution process and can be more
	efficiently minified (especially when both are
	regularly referenced in your plugin).

	$ (jQuery or Zepto) is passed through as a local
	variable because it could be overwritten by other
	libraries or jQuery could be in noConflict mode
	so $ would not be jQuery or Zepto
*/

// ECMAScript 5 strict mode
'use strict';
