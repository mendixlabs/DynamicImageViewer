Image Viewer
---

**Note: Per version 5.0 we remove the Mobile Dynamic Imageviewer and Mobile Static Imageviewer, as there is no difference with the normal ones. This is breaking, do not update if you use those two**

## Description

The image viewer package provides the possibility to display images using URLs. Those URLs can be constructed dynamically, or be be predefined in the modeler. To 'just' display an image, without having a System.Image object, this package is just what you are looking for. Last but not least the viewer supports cross-browser proportional scaling.

## Typical usage scenario

- Display images from a remote URL (like facebook or MxID)
- Display images not from Mendix in your application
- Display images in a pagewith a predefined, fixed URL.
- Display images based on a calculated URL.
- Just display an image in your application, based on a modeler image or a predefined URL.

## Features and limitations

- Display images based on a URL, either predefined or extracted from your domain model
- The image viewer can display images derived from System.Image as well

## Installation

Import the widget to your project and add the widget inside a dataview. Configure the properties to determine how the widget will behave in your application.

### Properties

---

#### Alt Caption

Alternative caption which will be shown when the image cannot be loaded.

#### Click Action

This microflow will be invoked when the image is clicked. The return value is ignored.

#### Height & Width

Maximum height and/or width of the image in pixels.

#### Image URL

This image can be shown if the image cannot be found, is loading or if the image attribute is not defined.

#### Image attribute

If set, this fields provides the image URL of an image. This property overrides the Image URL property. The final URL (src) of the image then becomes the concatenation: <Path prefix><Image attribute value><Path postfix>.

#### Link attribute

This fields provides the URL of the website which should be opened when the image is clicked.

#### Link target

Defines where the link (see Link attribute) should be opened.

#### Tooltip attribute

This attribute will be used as the tooltip hover text for the image.

#### Path prefix

If set, this path will be prefixed before the image URL.

#### Path postfix

If set, this path will be append after the image URL.
