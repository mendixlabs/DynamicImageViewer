/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, document, jQuery, window */
/*mendix */
/*
    DynamicImage
    ========================

    @file      : DynamicImage.js
    @version   : 1.1
    @author    : Gerhard Richard Edens
    @date      : Tue, 09 Jun 2015 07:51:58 GMT
    @copyright : Mendix bv
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

define([
    "dojo/_base/declare", "mxui/widget/_WidgetBase", "dijit/_TemplatedMixin",
    "mxui/dom", "dojo/dom", "dojo/query", "dojo/dom-prop", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/array", "dojo/_base/lang", "dojo/text", "dojo/html", "dojo/_base/event",
    "dojo/text!DynamicImage/widget/template/DynamicImage.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, html, event, widgetTemplate) {
    "use strict";

    return declare("DynamicImage.widget.DynamicImage", [_WidgetBase, _TemplatedMixin], {

        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // Parameters configured in the Modeler.
        mfToExecute: "",
        messageString: "",
        backgroundColor: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _contextContext: null,
        _alertDiv: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            console.log(this.id + ".postCreate");
            this._updateRendering(function(){});
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            console.log(this.id + ".update");
            this._contextObj = obj;
            if (obj !== null) {
                this._resetSubscriptions();
                this._updateRendering(callback);
            } else {
                callback();
            }
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        applyContext: function (context, callback) {
            console.log(this.id + ".applyContext");
            this._contextContext = context;
            if (context && !!context.getTrackId()) {
                var obj =  context.getTrackObject();
                if (obj !== null) {
                    this._contextObj = obj;
                    this._updateRendering(callback);
                } else {
                    mx.data.get({
                        guid    : context.getTrackId(),
                        callback : function(obj) {
                            this._contextObj = obj;
                            this._updateRendering(callback);
                        }
                    }, this);
                }
            }
        },

        uninitialize: function () {
            console.log(this.id + ".uninitialize");
            try {
                if (this._handles) {
                    this._handles.forEach(function (handle, i) {
                        this.unsubscribe(handle);
                    });
                    this._handles = [];
                }
            } catch (e) {
                console.warn('Unitialize of Dynamic Image Viewer failed');
            }
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            console.log(this.id + "._updateRendering");

            var targetObj,
                loaded = false;

            if (this._contextObj !== null) {
                try {
                    if (this.imageattr !== '') {
                        if (this.imageattr.indexOf("/") === -1) {
                            loaded = this._loadImagefromUrl(this._contextObj.get(this.imageattr));
                        } else {
                            targetObj = this._contextObj.get(this.imageattr.split("/")[0]);
                            if (/\d+/.test(targetObj)) { //guid only
                                loaded = true;
                                this.setToDefaultImage();
                                mx.data.get({ //fetch the object first
                                    guid : targetObj,
                                    nocache : true,
                                    callback : function(obj) {
                                        this._loadImagefromUrl(obj.get(this.imageattr.split("/")[2]));
                                    }
                                }, this);
                            } else if (targetObj !== null) {
                                loaded = this._loadImagefromUrl(targetObj.attributes[ this.imageattr.split("/")[2]].value);
                            }
                        }
                    }
                    this.connect(this.imageNode, "onclick", this.execclick);
                } catch (err) {
                    console.warn(this.id +'.setDataobject: error while loading image' + err);
                    loaded = false;
                }
            } else {
                console.warn(this.id + '.setDataobject: received null object');
            }

            if (!loaded) {
                this._setToDefaultImage();
            }

            callback();
        },

        _loadImagefromUrl : function(url) {
            console.log(this.id + "._loadImagefromUrl");

            if (url !== "" && typeof url !== "undefined" && url !== null) {
                this.imageNode.onerror = lang.hitch(this, this._setToDefaultImage);
                this.imageNode.onload = lang.hitch(this, this._resizeImage);
                this.imageNode.src = this.pathprefix + url + this.pathpostfix;
                if (this.tooltipattr) {
                    this.imageNode.title = this._contextObj.get(this.tooltipattr);
                }
                return true;
            }
            return false;
        },

        _resizeImage: function() {
            console.log(this.id + "._resizeImage");
            var origw, origh, factorw, factorh, factor;
            origw = this.imageNode.width;
            origh = this.imageNode.height;
            if (origw > 0 && origh > 0) {//only apply if an valid image has been loaded
                factorw = this.width / origw;
                factorh = this.height / origh;
                factor = (factorw < factorh ? factorw : factorh);
                if (factor < 1) {//check prevents upscaling
                    domStyle.add(this.imageNode, 'width',  (factor * origw) + 'px');
                    domStyle.add(this.imageNode, 'height', (factor * origh) + 'px');
                }
            }
        },

        _setToDefaultImage : function() {
            console.log(this.id + "._setToDefaultImage");
            if (this.imageNode) {
                this.imageNode.onerror = null;  //do not catch exceptions when loading default
                this.imageNode.src = this.defaultImage;
            }
        },

        _execClick : function(index) {
            if (this._contextObj !== null && this.imageNode) {
                if (this.clickmicroflow !== '')
                {
                    mx.data.action({
                        params          : {
                            applyto     : "selection",
                            actionname  : this.clickmicroflow,
                            guids       : [this._contextObj.getGuid()]
                        },
                        callback        : function(obj) {
                        },
                        error           : function(error) {
                            console.error(this.id + "error: XAS error executing microflow");
                        }
                    });
                }
                if (this.linkattr !== '')
                {
                    var url = this._contextObj.get(this.linkattr);
                    if (url !== '' && url !== undefined && url !== null) {
                        window.open(url, this.linktarget);
                    }
                }
            }
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            console.log(this.id + "._resetSubscriptions");
            var _objectHandle = null;

            // Release handles on previous object, if any.
            if (this._handles) {
                this._handles.forEach(function (handle, i) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }

            // When a mendix object exists create subscribtions. 
            if (this._contextObj) {
                _objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });
                this._handles = [_objectHandle];
            }
        }
    });
});
require(["DynamicImage/widget/DynamicImage"], function () {
    "use strict";
});