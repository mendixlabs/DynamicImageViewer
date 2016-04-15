
define([
    "dojo/_base/declare", "DynamicImage/widget/DynamicImage"
], function (declare, DynamicImage) {
    "use strict";

    // Declare widget"s prototype.
    return declare("DynamicImage.widget.MobileDynamicImage", [DynamicImage]);
        
});
require(["DynamicImage/widget/MobileDynamicImage"], function () {
    "use strict";
});
