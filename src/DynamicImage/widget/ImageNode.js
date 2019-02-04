// A replacement for widget template.
define([
    "dojo/dom-construct"
], function (domConstruct) {
    // creates image DOM node with the given src and alt text.
    var createImageNode = function (src, alt) {
        return domConstruct.create("img", {
            src: src || "",
            alt: alt || ""
        });
    };
    return createImageNode;
});