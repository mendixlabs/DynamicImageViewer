// A replacement for widget template.
define([
    "dojo/dom-construct"
], function (domConstruct) {
    "use strict";
    // creates image DOM node with the given src and alt text.
    return function (src, alt) {
        return domConstruct("img", {
            src: src || "",
            alt: alt || ""
        });
    };
});