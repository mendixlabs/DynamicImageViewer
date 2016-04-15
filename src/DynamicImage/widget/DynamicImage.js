
define([
    "dojo/_base/declare", "mxui/widget/_WidgetBase", "dijit/_TemplatedMixin",
    "mxui/dom", "dojo/dom", "dojo/query", "dojo/dom-prop", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/array", "dojo/_base/lang", "dojo/text", "dojo/html", "dojo/_base/event",
    "dojo/text!DynamicImage/widget/template/DynamicImage.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, html, event, widgetTemplate) {
    "use strict";

    return declare("DynamicImage.widget.DynamicImage", [_WidgetBase, _TemplatedMixin], {

        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        _handles: null,
        _contextObj: null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            this._updateRendering();
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;
            if (obj !== null) {
                this._resetSubscriptions();
                this._updateRendering(callback);
            } else {
                mx.data.get({
                   guid    : this.mxcontext.getTrackId(),
                   callback : lang.hitch(this, function(obj) {
                       this._contextObj = obj;
                       this._updateRendering(callback);
                   })
               }, this);
            }
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
            try {
                if (this._handles) {
                    this._handles.forEach(function (handle, i) {
                        this.unsubscribe(handle);
                    });
                    this._handles = [];
                }
            } catch (e) {
                console.warn("Unitialize of Dynamic Image Viewer failed");
            }
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");

            var targetObj,
                loaded = false;

            if (this._contextObj !== null) {
                try {
                    if (this.imageattr !== "") {
                        if (this.imageattr.indexOf("/") === -1) {
                            loaded = this._loadImagefromUrl(this._contextObj.get(this.imageattr));
                        } else {
                            targetObj = this._contextObj.get(this.imageattr.split("/")[0]);
                            if (/\d+/.test(targetObj)) { //guid only
                                loaded = true;
                                this._setToDefaultImage();
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
                    this.connect(this.imageNode, "onclick", this._execClick);
                } catch (err) {
                    console.warn(this.id +".setDataobject: error while loading image" + err);
                    loaded = false;
                }
            } else {
                console.warn(this.id + ".setDataobject: received null object");
            }

            if (!loaded) {
                this._setToDefaultImage();
            }

            if (callback)
                callback();
        },

        _loadImagefromUrl : function(url) {
            logger.debug(this.id + "._loadImagefromUrl");

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
            logger.debug(this.id + "._resizeImage");
            var origw, origh, factorw, factorh, factor;
            origw = this.imageNode.width;
            origh = this.imageNode.height;
            if (origw > 0 && origh > 0) {//only apply if an valid image has been loaded
                factorw = this.width / origw;
                factorh = this.height / origh;
                factor = (factorw < factorh ? factorw : factorh);
                if (factor < 1) {//check prevents upscaling
                    domStyle.add(this.imageNode, "width",  (factor * origw) + "px");
                    domStyle.add(this.imageNode, "height", (factor * origh) + "px");
                }
            }
        },

        _setToDefaultImage : function() {
            logger.debug(this.id + "._setToDefaultImage");
            if (this.imageNode) {
                this.imageNode.onerror = null;  //do not catch exceptions when loading default
                this.imageNode.src = this.defaultImage;
            }
        },

        _execClick : function(index) {
            logger.debug(this.id + "._execClick");
            if (this._contextObj !== null && this.imageNode) {
                if (this.clickmicroflow !== "") {
                    mx.data.action({
                        params          : {
                            applyto     : "selection",
                            actionname  : this.clickmicroflow,
                            guids       : [this._contextObj.getGuid()]
                        },
                        store: {
                            caller: this.mxform
                        },
                        callback        : function(obj) {
                        },
                        error           : function(error) {
                            console.error(this.id + "error: XAS error executing microflow");
                        }
                    });
                }
                if (this.linkattr !== "") {
                    var url = this._contextObj.get(this.linkattr);
                    if (url !== "" && url !== undefined && url !== null) {
                        window.open(url, this.linktarget);
                    }
                }
            }
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
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
