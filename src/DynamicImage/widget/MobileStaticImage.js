
define([
    "dojo/_base/declare", "mxui/widget/_WidgetBase", "dijit/_TemplatedMixin",
    "mxui/dom", "dojo/dom", "dojo/query", "dojo/dom-prop", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/array", "dojo/_base/lang", "dojo/text", "dojo/html", "dojo/_base/event",
    "dojo/text!DynamicImage/widget/template/DynamicImage.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, html, event, widgetTemplate) {
    "use strict";

    return declare("DynamicImage.widget.MobileStaticImage", [_WidgetBase, _TemplatedMixin], {

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
            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        applyContext: function (context, callback) {
            logger.debug(this.id + ".applyContext");
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

        // Rerender the interface.
        _updateRendering: function (callback) {
            if (this.imageurl !== "") {
                this.imageNode.src = this.imageurl;
            } else {
                this.imageNode.src = this.defaultImage;
            }

            if (callback)
                callback();
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
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
require(["DynamicImage/widget/MobileStaticImage"], function () {
    "use strict";
});
