define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/_base/lang",
    "DynamicImage/widget/ImageNode"
], function (declare, _WidgetBase, lang, CreateImageNode) {
    "use strict";

    return declare("DynamicImage.widget.StaticImage", [_WidgetBase], {

        _contextObj: null,
        _imageNode: null,
        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            this._imageNode = CreateImageNode(this.defaultImage, this.alt);
        },
        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");

            if (this.imageurl !== "") {
                this._imageNode.src = this.imageurl;
            } else {
                this._imageNode.src = this.defaultImage;
            }

            this._executeCallback(callback, "_updateRendering");
        },

        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
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
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["DynamicImage/widget/StaticImage"]);