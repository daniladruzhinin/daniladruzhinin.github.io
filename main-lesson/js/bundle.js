var ScrollingAnchors =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const EventEmitter = __webpack_require__(1);

	class ScrollingAnchors {
	    constructor( options ) {
			
			var self 				= this,
			parent 					= options.parent ? options.parent : window,
			anchors					= options.anchors ? options.anchors.map(function(item) {
				return new (class Anchors extends EventEmitter {
					constructor () {
						super();
						
						this.el = item.anchor;
						this.name = item.name;
						this.coords = $(item.anchor).offset().top;
						this.onScreen = null;
					}
				});
			}) : [],
			ranges					= options.ranges ? options.ranges.map(function(item) {
				return new (class Ranges extends EventEmitter {
					constructor () {
						super();
						
						this.el = item.range;
						this.name = item.name;
						this.coords = {
							top:		$(item.range[0]).offset().top,
							bottom:		$(item.range[1]).offset().top
						};
						this.onScreen = undefined;
						this.position = undefined; // top bottom middle cover
						this.isMostNotable = undefined;
						this.visiblePart = 0;
					}
				});
			}) : [],
			mostNotableIndex 		= null,
			eventListeners			= [];
			this.routingTables 		= {
				anchors: (function() {
					var table = {};
					for ( let i = anchors.length; i--; )
						table[anchors[i].name] = i;
					return table;
				})(),
				ranges: (function() {
					var table = {};
					for ( let i = ranges.length; i--; )
						table[ranges[i].name] = i;
					return table;
				})()
			};
			var currentState = {};
			
			
			$(parent)
			.on("scroll", onScrollParent);
			
			
			function onScrollParent() {
				
				if (anchors.length) {
					for(var i = 0; i < anchors.length; i++) {
					
						// ANCHORS
						if (ScrollingAnchors.coordsOnScreen(parent, anchors[i].coords)) {
							if ( !anchors[i].onScreen )
								anchors[i].emit("onTheScreen", [anchors[i]]);
							anchors[i].onScreen = true;
							
						} else {
							if ( anchors[i].onScreen )
								anchors[i].emit("notOnTheScreen", [anchors[i]]);
							anchors[i].onScreen = false;
							
						}
						// ANCHORS
					
					}
				}
				
				if (ranges.length) {
					// RANGES
					mostNotableIndex 		= 0;
					var saveSize 			= 0;
					
					for(var i = 0; i < ranges.length; i++) {
						currentState.onScreen = ranges[i].onScreen;
						currentState.position = ranges[i].position;
						
						ranges[i].onScreen = false;
						
						if ( ranges[i].coords.top > ($(parent).scrollTop() + $(parent).height()) ) {
							ranges[i].position = "bottom";
						}
						if ( ranges[i].coords.bottom < $(parent).scrollTop() ) {
							ranges[i].position = "top";
						}
						if( ScrollingAnchors.coordsOnScreen(parent, ranges[i].coords.bottom) && !ScrollingAnchors.coordsOnScreen(parent, ranges[i].coords.top) ) {
							ranges[i].position = "top";
							ranges[i].onScreen = true;
							ranges[i].visiblePart = ranges[i].coords.bottom - $(parent).scrollTop();
						}
						if( ScrollingAnchors.coordsOnScreen(parent, ranges[i].coords.bottom) && ScrollingAnchors.coordsOnScreen(parent, ranges[i].coords.top) ) {
							ranges[i].position = "middle";
							ranges[i].onScreen = true;
							ranges[i].visiblePart = ranges[i].coords.bottom - ranges[i].coords.top;
						}
						if( ScrollingAnchors.rangeLargerThanScreen(parent, ranges[i].coords) ) {
							ranges[i].position = "cover";
							ranges[i].onScreen = true;
							ranges[i].visiblePart = $(parent).height();
						}
						if ( !ScrollingAnchors.coordsOnScreen(parent, ranges[i].coords.bottom) && ScrollingAnchors.coordsOnScreen(parent, ranges[i].coords.top) ) {
							ranges[i].position = "bottom";
							ranges[i].onScreen = true;
							ranges[i].visiblePart = ($(parent).scrollTop() + $(parent).height()) - ranges[i].coords.top;
						}
						
						
						// emit events
						if ( currentState.onScreen === undefined ) {
							if ( ranges[i].onScreen ) {
								ranges[i].emit("onTheScreen", [ranges[i]]);
							} else {
								ranges[i].emit("notOnTheScreen", [ranges[i]]);
							}
						} else
						if ( currentState.onScreen !== ranges[i].onScreen ) {
							if ( ranges[i].onScreen ) {
								ranges[i].emit("onTheScreen", [ranges[i]]);
							} else {
								ranges[i].emit("notOnTheScreen", [ranges[i]]);
							}
						}
						
						if ( currentState.position === undefined ) {
							ranges[i].emit( ranges[i].position, [ranges[i]] );
						} else
						if ( currentState.position !== ranges[i].position ) {
							ranges[i].emit( ranges[i].position, [ranges[i]] );
						}
							
					}
					
					for ( var i = 0; i < ranges.length; i++ ) {
						if ( saveSize < ranges[i].visiblePart ) {
							saveSize = ranges[i].visiblePart;
							mostNotableIndex = i;
						}
					}
					for ( var i = 0; i < ranges.length; i++ ) {
						if ( i == mostNotableIndex) continue;
						ranges[i].isMostNotablePrev = ranges[i].isMostNotable;
						ranges[i].isMostNotable = false;
					}
						
					ranges[mostNotableIndex].isMostNotablePrev = ranges[mostNotableIndex].isMostNotable;
					ranges[mostNotableIndex].isMostNotable = true;
					
					
					for ( var i = 0; i < ranges.length; i++ ) {
						// emit event
						if ( ranges[i].isMostNotablePrev === undefined ) {
							if ( ranges[i].isMostNotable ) {
								ranges[i].emit("mostNotable", [ranges[i]]);
							} else {
								ranges[i].emit("notMostNotable", [ranges[i]]);
							}
						} else
						if ( ranges[i].isMostNotablePrev !== ranges[i].isMostNotable ) {
							if ( ranges[i].isMostNotable ) {
								ranges[i].emit("mostNotable", [ranges[i]]);
							} else {
								ranges[i].emit("notMostNotable", [ranges[i]]);
							}
						}
						
					}
					
					
					// RANGES
				}
				
				if(!eventListeners.length) return;
				
				for (var i = 0; i < eventListeners.length; i++) {
					eventListeners[i]({
						anchors: 			anchors,
						ranges: 			ranges,
						mostNotableIndex: 	mostNotableIndex
					});
				}
				
			}
			
			self.addListeners = function (func) {
				eventListeners.push(func);
				onScrollParent();
			}
			
			self.get = function(what) {
				if ( what === "anchors" ) return anchors;
				if ( what === "ranges" ) return ranges;
			}

			
	    }
		
		
		on(event, handler) {
			try {
				var parse = event.split(":"),
				event = parse[0],
				label = parse[1], // label type. anchors or ranges 
				which = parse[2]; // index or name
				
				if ( isNumeric(which) ) {
					this.get(label)[which].on(event, handler);
				} else {
					this.get(label)[this.routingTables[label][which]].on(event, handler);
				}
				
				return true;
			} catch(e) {
				console.log(event);
				console.log(label);
				console.log(which);
				console.log(e);
				console.log("parse error. maybe incorrectly stated the name");
			}

			function isNumeric(n) {
			  return !isNaN(parseFloat(n)) && isFinite(n);
			}
		}
		
		
		static coordsOnScreen (screen, coords) {
			var top 		= $(screen).scrollTop(),
			bottom 			= $(screen).scrollTop() + $(screen).height();
			return (top <= coords && bottom >= coords);
		}
		
		static rangeLargerThanScreen (screen, rangeCoords) {
			var top 		= $(screen).scrollTop(),
			bottom 			= $(screen).scrollTop() + $(screen).height();
			if(rangeCoords.top < top && rangeCoords.bottom > bottom)
				return true;
			return false;
		}
	}


	module.exports = ScrollingAnchors;


/***/ },
/* 1 */
/***/ function(module, exports) {

	class EventEmitter {
		constructor() {
		  this.repository = {};
	    }
	    on(event, func) {
	  	  let handlers = this.repository[event];
	      if ( handlers ) {
	      	handlers.push(func);
	      } else {
	    	this.repository[event] = [func];
	      }
		  return this;
	    }
	    off(event, func) {
	  	  let handlers = this.repository[event];
	      if ( handlers ) {
	    	handlers.splice(handlers.indexOf(func));
	      }
		  return this;
	    }
	    emit(event, args, context) {
	  	  context = context ? context : this;
	      args = args ? args : []
	  	  let handlers = this.repository[event];
	      if (handlers) {
	    	for (let i = 0, length = handlers.length; i < length; i++)
	    		handlers[i].apply(context, args);
	      }
		  return this;
	    }
	    get allEvents() {
	  	  let allEvents = [];
	      for (let key in this.repository) {
	    	allEvents.push(key);
	      }
	  	  return allEvents;
	    }
	}

	module.exports = EventEmitter;
	/*
	var emiter = new EventEmitter();
	emiter.on("isLoad", function(data) {
		alert("Отправить данные на сервер! Данные " + data);
	});


	setTimeout(function() {
		emiter.emit("isLoad", ["Мои данные!!!!"])
	}, 2000);
	*/

/***/ }
/******/ ]);