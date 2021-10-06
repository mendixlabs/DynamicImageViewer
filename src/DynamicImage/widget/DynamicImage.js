define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/dom-class",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/text!DynamicImage/widget/template/DynamicImage.html"
], function (declare, _WidgetBase, _TemplatedMixin,domClass, domAttr, domStyle, lang, on, widgetTemplate) {
    "use strict";

    return declare("DynamicImage.widget.DynamicImage", [_WidgetBase,_TemplatedMixin], {

        _contextObj: null,
        _clickHandler: null,
        _imageNode: null,
        templateString: widgetTemplate,

        postCreate: function () {
            mx.logger.debug(this.id + ".postCreate");
            domAttr.set(this._imageNode,"src",this.defaultImage || "");
            domAttr.set(this._imageNode,"alt",this.alt || "");
        },
        update: function (obj, callback) {
            mx.logger.debug(this.id + ".update");
            this._contextObj = obj;
            if (obj !== null) {
                this._resetSubscriptions();
                this._updateRendering(callback);
            } else {
                if (this.mxcontext && this.mxcontext.getTrackId()) {
                    mx.data.get({
                        guid: this.mxcontext.getTrackId(),
                        callback: lang.hitch(this, function (obj) {
                            this._contextObj = obj;
                            this._updateRendering(callback);
                        }),
                        error: lang.hitch(this, function (err) {
                            console.warn(this.id + ".update mx.data.get failed");
                            this._executeCallback(callback, "update mx.data.get errorCb");
                        })
                    }, this);
                } else {
                    mx.logger.warn(this.id + ".update: no context object && no trackId");
                    this._executeCallback(callback, "update no context");
                }
            }
        },

        uninitialize: function () {
            mx.logger.debug(this.id + ".uninitialize");
            this.unsubscribeAll();
            if (this._clickHandler) {
                this._clickHandler.remove();
                this._clickHandler = null;
            }
        },

        _updateRendering: function (callback) {
            mx.logger.debug(this.id + "._updateRendering");

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
                                    guid: targetObj,
                                    nocache: true,
                                    callback: lang.hitch(this, function (obj) {
                                        this._loadImagefromUrl(obj.get(this.imageattr.split("/")[2]));
                                    })
                                }, this);
                            } else if (targetObj !== null) {
                                loaded = this._loadImagefromUrl(targetObj.attributes[this.imageattr.split("/")[2]].value);
                            }
                        }
                    }
                    if (this._clickHandler === null) {
                        this._clickHandler = on(this._imageNode, "click", lang.hitch(this, this._execClick));
                    }
                } catch (err) {
                    console.warn(this.id + ".setDataobject: error while loading image" + err);
                    loaded = false;
                }
            } else {
                console.warn(this.id + ".setDataobject: received null object");
            }

            if (!loaded) {
                this._setToDefaultImage();
            }

            this._executeCallback(callback, "_updateRendering");
        },

        _loadImagefromUrl: function (url) {
            mx.logger.debug(this.id + "._loadImagefromUrl");

            if (url !== "" && typeof url !== "undefined" && url !== null) {
                this._imageNode.onerror = lang.hitch(this, this._setToDefaultImage);
                this._imageNode.onload = lang.hitch(this, this._resizeImage);
                this._imageNode.src = this.pathprefix + url + this.pathpostfix;
                if (this.tooltipattr) {
                    this._imageNode.title = this._contextObj.get(this.tooltipattr);
                }
                this._setClickClass();
                return true;
            }
            return false;
        },

        _resizeImage: function () {
            mx.logger.debug(this.id + "._resizeImage");
            if (!this._imageNode) {
                return;
            }
            var origw, origh, factorw, factorh, factor;
            origw = this._imageNode.width;
            origh = this._imageNode.height;
            if (origw > 0 && origh > 0) { //only apply if an valid image has been loaded
                factorw = this.width / origw;
                factorh = this.height / origh;
                factor = (factorw < factorh ? factorw : factorh);
                if (factor < 1) { //check prevents upscaling
                    domStyle.set(this._imageNode, "width", (factor * origw) + "px");
                    domStyle.set(this._imageNode, "height", (factor * origh) + "px");
                }
            }
        },

        _setToDefaultImage: function () {
            mx.logger.debug(this.id + "._setToDefaultImage");
            if (this._imageNode) {
                this._imageNode.onerror = null; //do not catch exceptions when loading default
                var isAbsolutePath = 
                    this.defaultImage.indexOf('://') > 0 ||
                    this.defaultImage.indexOf('/') === 0;

                this._imageNode.src = isAbsolutePath
                    ? this.defaultImage
                    : window.location.origin + "/" + this.defaultImage;
                
                this._setClickClass();
            }
        },

        _execClick: function (index) {
            mx.logger.debug(this.id + "._execClick");
            if (this._contextObj !== null && this._imageNode) {
                if (this.clickmicroflow !== "") {
                    mx.ui.action(this.clickmicroflow, {
                        params: {
                            applyto: "selection",
                            guids: [this._contextObj.getGuid()]
                        },
                        error: function (error) {
                            console.error(this.id + "error: XAS error executing microflow");
                        }
                    }, this);
                }
                if (this.linkattr !== "") {
                    var url = this._contextObj.get(this.linkattr);
                    if (url !== "" && url !== undefined && url !== null) {
                        window.open(url, this.linktarget);
                    }
                }
            }
        },

        _setClickClass: function () {
            domClass.toggle(this._imageNode, "dynamicimage-clickable", this.clickmicroflow !== "" || this.linkattr !== "");
        },

        _resetSubscriptions: function () {
            mx.logger.debug(this.id + "._resetSubscriptions");
            this.unsubscribeAll();

            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });
            }
        },

        _executeCallback: function (cb, from) {
            mx.logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["DynamicImage/widget/DynamicImage"]);