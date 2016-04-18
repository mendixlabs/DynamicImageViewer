define([
    "dojo/_base/declare", "DynamicImage/widget/StaticImage"
], function (declare, StaticImage) {
    "use strict";

    // Declare widget"s prototype.
    return declare("DynamicImage.widget.MobileStaticImage", [StaticImage]);

});
require(["DynamicImage/widget/MobileStaticImage"], function () {
    "use strict";
});
