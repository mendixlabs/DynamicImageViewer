/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, document, jQuery */
/*mendix */
/*
    StaticImage
    ========================

    @file      : StaticImage.js
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
    "dojo/text!DynamicImage/widget/template/MobileStaticImage.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, html, event, widgetTemplate) {
    "use strict";
	
    return declare("DynamicImage.widget.MobileStaticImage", [_WidgetBase, _TemplatedMixin], {

        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // Parameters configured in the Modeler.
        mfToExecute: "",
        messageString: "",
        backgroundColor: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
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
            this._resetSubscriptions();
            this._updateRendering(callback);
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

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {},

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {},

        // mxui.widget._WidgetBase.resize is called when the page"s layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {},

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            if (this.imageurl !== '') {
                this.imageNode.src = this.imageurl;
            } else {
                this.imageNode.src = this.defaultImage;
            }
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