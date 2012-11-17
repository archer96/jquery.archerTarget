/**
 * jArcherTarget version 0.2
 *
 * Copyright 2012, Andre Meyering
 * Licensed under the MIT license.
 */

var jat = {};

(function ($) {

if (typeof DEVMODE === 'undefined') {

    DEVMODE = 15;

}

DEVMODE && (DEVNAME = '');

    var apiEvents = {
        
            onTargetOver: 'targetOver',
            onTargetOut: 'targetOut',
            onTargetMove: 'targetMove',
            onTargetClick: 'targetClick',
            
            onArrowOver: 'arrowOver',
            onArrowOut: 'arrowOut',
            onArrowMove: 'arrowMove',
            onArrowSelect: 'arrowSelect',
            onArrowDeselect: 'arrowDeselect',
    
            onZoom: 'zoom',

            onContainerTap: 'containerTap',
            onContainerMousedown: 'containerMousedown'
        },
        apiParams = {
            get: {
                ring: 1,
                targetParams: 1,
                transform: 1,
                arrows: 1
            },
            set: {
                arrowOptions: 1,
                arrowActive: 1,
                arrowStyle: 1,

                backgroundColor: 1,
                zoom: 1,
                transform: 1
            }
        };
        
    $.fn.archerTarget = function (options) {
    
        var defaultParams = {
                target: 'wa_x',
                targetDefaults: {
                    center: [50, 50],
                    diameter: 90,
                    style: {
                        initial: {
                            opacity: 1
                        },
                        hover: {
                            opacity: 1
                        },
                        arrowOn: {
                            opacity: 1
                        },
                        arrowOff: {
                            opacity: 0.9
                        }
                    }
                },
                backgroundColor: 'transparent',
                draggable: 1,
                arrowDefaults: {
                    active: 1,
                    draggable: 1,
                    radius: 5,
                    style: {
                        initial: {
                            opacity: 0.9,
                            color: '#00ff00',
                            stroke: false
                        },
                        hover: {
                            opacity: 1
                        },
                        selected: {
                            opacity: 1
                        }
                    },
                    target: 0
                },
                zoom: 1,
                maxZoom: 6,
                minZoom: 0.6,
                zoomStep: 0.2,
                zoomable: 1,
                transX: 0,
                transY: 0,
                plugins: {}
            },
            targetObj,
            methodName,
            event,
            style;
            
            
        if (options === 'addTarget') {
            
            jat.Target.targets[arguments[1]] = arguments[2];

            DEVMODE && console.log('jAT ' + DEVNAME + ':: added target ' + arguments[1]);
             
        } else if (options === 'addPlugin') {
            
            jat.Target.plugins[arguments[1]] = arguments[2];

            DEVMODE && console.log('jAT ' + DEVNAME + ':: added plugin ' + arguments[1]);
             
        } else if ((options === 'set' || options === 'get') && apiParams[options][arguments[1]]) {
            
            /* Example: ring -> Ring -> get + Ring -> getRing */
            methodName = options + arguments[1].charAt(0).toUpperCase() + arguments[1].substr(1);
       
            /* Note that arguments is not an Array, but we want to call the .slice() method on it. We do this with the .call() method.  */
            return this.data('targetObject')[methodName].apply(this.data('targetObject'), Array.prototype.slice.call(arguments, 2));
            
        } else {

            DEVMODE && (DEVNAME = ':: ' + $(this).attr('id') + ' ');

            DEVMODE && console.log('jAT ' + DEVNAME + ':: initializing jAT');

            $.extend(true, defaultParams, options);
            
            
            for (style in defaultParams.targetDefaults.style) {
                if (defaultParams.targetDefaults.style.hasOwnProperty(style)) {
                    defaultParams.targetDefaults.style[style] = $.extend(true, {}, defaultParams.targetDefaults.style.initial, defaultParams.targetDefaults.style[style]);
                }
            }
            
            for (style in defaultParams.arrowDefaults.style) {
                if (defaultParams.arrowDefaults.style.hasOwnProperty(style)) {
                    defaultParams.arrowDefaults.style[style] = $.extend(true, {}, defaultParams.arrowDefaults.style.initial, defaultParams.arrowDefaults.style[style]);
                }
            }
            
            defaultParams.container = this;
            
            targetObj = new jat.Target(defaultParams);
            
            this.data('targetObject', targetObj);

            for (event in apiEvents) {
                if (apiEvents.hasOwnProperty(event)) {
                    if (defaultParams[event]) {
                        this.on(apiEvents[event] + '.jArcherTarget', defaultParams[event]);
                    }
                }
            }

        }

        return this;
    };
    
    
    
    jat.Target = function (params) {
        
        var self = this,
            plugin,

            converterCacheCanvas = {
                x: {},
                y: {}
            },
            converterCachePx = {
                x: {},
                y: {}
            },
            converterCachePc = {
                x: {},
                y: {}
            };

        params = params || {};
        
        this.params = params;
        
        this.container = params.container.addClass('archerTargetContainer').css({
            position: 'relative',
            overflow: 'hidden'
        });

        this.plugins = params.plugins;

        this.arrowClass = 'arrow';
        
        this.zoom = params.zoom;

        this.maxZoom = params.maxZoom;

        this.minZoom = params.minZoom;
        
        this.zoomStep = params.zoomStep;
        
        this.draggable = params.draggable;
        
        this.zoomable = params.zoomable;

        this.transX = params.transX;

        this.transY = params.transY;
        
        this.arrowDrag = false;

        this.setSize();

        this.clearConverterCache = function () {

            converterCachePx = {
                x: {},
                y: {}
            };

            converterCachePc = {
                x: {},
                y: {}
            };

        };
    
        this.convertTo = {

            pcX: function (arg, targetID) {

                    if (!targetID) { targetID = 0; }
                    
                    if (!converterCachePc.x[targetID]) { converterCachePc.x[targetID] = {}; }

                    var tmpCache = converterCachePc.x[targetID];

                    if (!tmpCache[arg]) {

                        DEVMODE > 10 && console.log('jAT ' + DEVNAME + ':: converter :: pc     :: x-axe :: NOT using cache', targetID, arg);
                        
                        /* Attention: converting the target diameter using the x-axe; otherwise an error will occur */
                        tmpCache[arg] = (arg / self.zoom - self.gap[targetID].left - self.transX) / self.convertTo.canvasX(self.target[targetID].diameter) * 100;

                    } else {

                        DEVMODE > 10 && console.log('jAT ' + DEVNAME + ':: converter :: pc     :: x-axe :: using cache', targetID, arg);
  
                    }

                    return tmpCache[arg];

            },

            pcY: function (arg, targetID) {

                    if (!targetID) { targetID = 0; }

                    if (!converterCachePc.y[targetID]) { converterCachePc.y[targetID] = {}; }

                    var tmpCache = converterCachePc.y[targetID];

                    if (!tmpCache[arg]) {

                        DEVMODE > 10 && console.log('jAT ' + DEVNAME + ':: converter :: pc     :: y-axe :: NOT using cache', targetID, arg);
                        
                        /* Attention: converting the target diameter using the x-axe; otherwise an error will occur */
                        tmpCache[arg] = (arg / self.zoom - self.gap[targetID].top - self.transY) / self.convertTo.canvasX(self.target[targetID].diameter) * 100;

                    } else {

                        DEVMODE > 10 && console.log('jAT ' + DEVNAME + ':: converter :: pc     :: y-axe :: using cache', targetID, arg);
  
                    }

                    return tmpCache[arg];

            },

            pxX: function (arg, targetID) {

                    if (!targetID) { targetID = 0; }

                    if (!converterCachePx.x[targetID]) { converterCachePx.x[targetID] = {}; }

                    var tmpCache = converterCachePx.x[targetID];

                    if (!tmpCache[arg]) {

                        DEVMODE > 10 && console.log('jAT ' + DEVNAME + ':: converter :: px     :: x-axe :: NOT using cache', targetID, arg);
                        
                        tmpCache[arg] = ((self.convertTo.canvasX(self.target[targetID].diameter) / 100) * arg + self.gap[targetID].left + self.transX) * self.zoom;

                    } else {

                        DEVMODE > 10 && console.log('jAT ' + DEVNAME + ':: converter :: px     :: x-axe :: using cache', targetID, arg);
  
                    }

                    return tmpCache[arg];
                        
            },

            pxY: function (arg, targetID) {

                    if (!targetID) { targetID = 0; }

                    if (!converterCachePx.y[targetID]) { converterCachePx.y[targetID] = {}; }

                    var tmpCache = converterCachePx.y[targetID];

                    if (!tmpCache[arg]) {

                        DEVMODE > 10 && console.log('jAT ' + DEVNAME + ':: converter :: px     :: y-axe :: NOT using cache', targetID, arg);
                        
                        /* Attention: converting the target diameter using the x-axe; otherwise an error will occur */
                        tmpCache[arg] = ((self.convertTo.canvasX(self.target[targetID].diameter) / 100) * arg + self.gap[targetID].top + self.transY) * self.zoom;

                    } else {

                        DEVMODE > 10 && console.log('jAT ' + DEVNAME + ':: converter :: px     :: y-axe :: using cache', targetID, arg);
  
                    }

                    return tmpCache[arg];
                   
            },

            canvasX: function (arg, targetDiameter) {

                    if (!targetDiameter) { targetDiameter = 100; }

                    if (!converterCacheCanvas.x[targetDiameter]) { converterCacheCanvas.x[targetDiameter] = {}; }

                    var tmpCache = converterCacheCanvas.x[targetDiameter];

                    if (!tmpCache[arg]) {

                        DEVMODE > 12 && console.log('jAT ' + DEVNAME + ':: converter :: canvas :: y-axe :: NOT using cache', targetDiameter, arg);
                        
                        tmpCache[arg] = self.width / 100 * targetDiameter / 100 * arg

                    } else {

                        DEVMODE > 12 && console.log('jAT ' + DEVNAME + ':: converter :: canvas :: y-axe :: using cache', targetDiameter, arg);
  
                    }

                    return tmpCache[arg];

            },

            canvasY: function (arg, targetDiameter) {

                    if (!targetDiameter) { targetDiameter = 100; }


                    if (!converterCacheCanvas.y[targetDiameter]) { converterCacheCanvas.y[targetDiameter] = {}; }

                    var tmpCache = converterCacheCanvas.y[targetDiameter];

                    if (!tmpCache[arg]) {

                        DEVMODE > 12 && console.log('jAT ' + DEVNAME + ':: converter :: canvas :: y-axe :: NOT using cache', targetDiameter, arg);
                        
                        tmpCache[arg] = self.height / 100 * targetDiameter / 100 * arg;

                    } else {

                        DEVMODE > 12 && console.log('jAT ' + DEVNAME + ':: converter :: canvas :: y-axe :: using cache', targetDiameter, arg);
                        
                    }

                    return tmpCache[arg];

            }
            
        };
        
        this.setBackgroundColor(params.backgroundColor);
        
        this.canvas = new jat.VectorCanvas(this.width, this.height);
        
        this.container.append(this.canvas.canvas);
        
        this.rootGroup = this.canvas.createGroup(true, {id: this.container.attr('id') + 'TargetContainer' });

        this.canvas.canvas.appendChild(this.rootGroup);
                
        this.target = params.target instanceof Array ? params.target : [{ name: params.target }];

        this.target = this.createTarget(this.target);
                
        this.setGap();
        
        this.arrow = this.createArrows(params.arrows);
        


        /*
         * requestAnimationFrame - browser check
         * see: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
         */
        var lastTime = 0,
            vendors = ['ms', 'moz', 'webkit', 'o'];

        for (i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {

            window.requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[i]+'CancelAnimationFrame'] || window[vendors[i]+'CancelRequestAnimationFrame'];

        }
     
        if (!window.requestAnimationFrame) {

            window.requestAnimationFrame = function (callback, element) {

                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                    id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    }, timeToCall);

                lastTime = currTime + timeToCall;

                return id;

            };

        }

        if (!window.cancelAnimationFrame) {

            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            }

        };



        if (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch) || this.params.touch === true) {

            DEVMODE && console.log('jAT ' + DEVNAME + ':: using a touch device');
            
            this.bindContainerTouchEvents();
            this.bindArrowTouchEvents();
            this.bindTargetTouchEvents();

        } else {

            DEVMODE && console.log('jAT ' + DEVNAME + ':: using a non-touch device');

            this.bindContainerEvents();
            this.bindArrowEvents();
            this.bindTargetEvents();

        }


        if (this.zoomable) {
            $('<div/>').addClass('archerTarget-zoomin').text('+').appendTo(params.container);
            $('<div/>').addClass('archerTarget-zoomout').html('&#x2212;').appendTo(params.container);
        }
        
        this.bindZoomEvents();
        
        /* Apply possible zoom */
        this.setTransform();


        for (plugin in this.plugins) {

            if (this.plugins.hasOwnProperty(plugin) && jat.Target.plugins[plugin]) {

                jat.Target.plugins[plugin].initialize(this, this.plugins[plugin]);

            }

        }

        
    };
    
    
    jat.Target.targets = {};
    jat.Target.plugins = {};
    
}(jQuery));