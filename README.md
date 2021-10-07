[![Support](https://img.shields.io/badge/Mendix%20Support%3A-Community-green.svg)](https://docs.mendix.com/appstore/general/app-store-content-support#community-category)

Image Viewer
===

**Note: Per version 5.0 we remove the Mobile Dynamic Imageviewer and Mobile Static Imageviewer, as there is no difference with the normal ones. This is breaking, do not update if you use those two**

## 1 Introduction

The [Image Viewer](https://marketplace.mendix.com/link/component/65122/) widget displays an image and optionally performs an on-click action (enlarging to mobile-friendly, opening a page, or calling a mircoflow).

### 1.1 Features

* Supports different data sources:
	* Set a static image
	* Retrieve an image from a static URL
	* Retrieve an image from the URL attribute of a context object
	* Retrieve an image from **System.Images**
* Supports the following actions:
	* Enlarge and pinch zoom
	* Open page
	* Call a microflow or nanoflow

### 1.2 Demo App

For a demo app that has been deployed with these widgets, see [here](https://imageviewer.mxapps.io/).

## 2 Usage

The widget requires a context via the following available data sources:

* Dynamic image
	* For the **Data source** option of the **General** tab, select the dynamic image
	* The widget will pick the image from the context object (context object should inherit from the **system.image** entity)
	* Refer to the **Appearance** section for configuring the height and width
* Dynamic URL attribute
	* For the **Data source** option of the **General** tab, select the dynamic URL
	* Select the attribute from the context objext that contains the URL of the image
	* Refer to the **Appearance** section for configuring the height and width
* Static URL
	* For the **Data source** option of the **General** tab, select the static URL
	* Specify the URL that points to the image (a URL outside the Mendix Platform)
	* Refer to the **Appearance** section for configuring the height and width
* Static image
	* For the **Data source** option of the **General** tab, select the static image
	* Click **Select** to add static images from Studio Pro
	* Refer to the **Appearance** section for configuring the height and width
