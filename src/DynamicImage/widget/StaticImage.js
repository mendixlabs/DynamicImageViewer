define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/_base/lang",
    "dojo/text!DynamicImage/widget/template/DynamicImage.html"
], function (declare, _WidgetBase, _TemplatedMixin,lang, widgetTemplate) {
    "use strict";

    return declare("DynamicImage.widget.StaticImage", [_WidgetBase,_TemplatedMixin], {

        _contextObj: null,
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
            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        _updateRendering: function (callback) {
            mx.logger.debug(this.id + "._updateRendering");

            if (this.imageurl !== "") {
                var isAbsolutePath = 
                    this.imageurl.indexOf('://') > 0 ||
                    this.imageurl.indexOf('/') === 0;
                
                this._imageNode.src = isAbsolutePath
                    ? this.imageurl
                    : window.location.origin + "/" + this.imageurl;

            } else {
                var isAbsolutePath = 
                    this.defaultImage.indexOf('://') > 0 ||
                    this.defaultImage.indexOf('/') === 0;

                this._imageNode.src = isAbsolutePath
                    ? this.defaultImage
                    : window.location.origin + "/" + this.defaultImage;
                
            }

            this._executeCallback(callback, "_updateRendering");
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

require(["DynamicImage/widget/StaticImage"]);