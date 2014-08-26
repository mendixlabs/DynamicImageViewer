/**
	Image Viewer Widget
	========================

	@file      : DynamicImage.js
	@version   : 2.0
	@author    : Mendix
	@date      : 18-08-2014
	@copyright : Mendix
	@license   : Please contact our sales department.

	Documentation
	=============
	The image viewer provides the possibility to display images based on a URL. This URL can either be predefined in the modeler, or retrieved from the domain model. Furthermore interaction with the image can be defined. It can either trigger a microflow or open a web link.  Last but not least the viewer supports cross-browser proportional scaling. 

**/
dojo.provide("DynamicImage.widget.DynamicImage");

mendix.widget.declare('DynamicImage.widget.DynamicImage', {
	//DECLARATION
	addons       : [dijit._Templated, mendix.addon._Contextable],
	templatePath : dojo.moduleUrl('DynamicImage.widget', "templates/DynamicImage.html"),
    inputargs: { 
			imageattr : 'image',
			width  : 300,
			height : 300,
			defaultImage: '',
			pathprefix : '',
			pathpostfix: '',
			clickmicroflow : '',
			linkattr     : '',
			linktarget   : '_blank',
			alt          : '',
			tooltipattr : ''
    },
	
	//IMPLEMENTATION
	dataobject : null,
	subhandler : null,
	
    loadImagefromUrl : function( url) {
        logger.debug(this.id + ".setDataobject: using url "+url);
        
        if (url != '' && url != undefined && url != null) {
            this.imageNode.onerror = dojo.hitch(this,this.setToDefaultImage);
            
            if (mx.ui.isQuirky)  //IE size/ constraint hackery, since IE does not respect CSS properties
                this.imageNode.onload = dojo.hitch(this,this.IEresize);
            else {	//the easy way
                this.imageNode.style.height = this.height+'px';
                this.imageNode.style.width = this.width+'px';
            }

            this.imageNode.src = this.pathprefix + url + this.pathpostfix;
            if (this.tooltipattr)
                this.imageNode.title = this.dataobject.getAttribute(this.tooltipattr);
            
           return true;
        }
        return false;
    },
    
  // updates the image with a new dataobject 
	setDataobject : function(dataobject) {
		logger.debug(this.id + ".setDataobject");
		
		if (/\d+/.test(dataobject) && !dojo.isObject(dataobject)) { //MWE: stupid case, setContext sometimes just provides us a number...
			mx.processor.get({ //fetch the object first
				guid : dataobject,
				nocache : true,
				callback : this.setDataobject
			}, this);
			return;
		}		
		
		//load image
		var loaded = false;
		this.dataobject = dataobject;
		//TODO: in mendix 3.somany we get a nice api call for this..
		if (this.dataobject != null)
		{
			try {
				if (this.imageattr != '') {
                    if (this.imageattr.indexOf("/") == -1)
                        loaded = this.loadImagefromUrl(this.dataobject.getAttribute(this.imageattr));
                    else {
                        var targetObj = this.dataobject.getAttribute(this.imageattr.split("/")[0]);
                        if (/\d+/.test(targetObj)) { //guid only
                            var loaded = true;
                            this.setToDefaultImage();
                            mx.processor.get({ //fetch the object first
                                guid : targetObj,
                                nocache : true,
                                callback : function(obj) {
                                    this.loadImagefromUrl(obj.getAttribute(this.imageattr.split("/")[2]));
                                }
                            }, this);
                        }
                        else if (targetObj != null) 
                            loaded = this.loadImagefromUrl(targetObj.attributes[ this.imageattr.split("/")[2] ].value);
                    }
				}
				this.connect(this.imageNode, "onclick", this.execclick);
			}
			catch (err) {
				logger.warn(this.id +'.setDataobject: error while loading image' + err);
				loaded = false;
			}
		}
		else
			logger.warn(this.id + '.setDataobject: received null object');
			
		//serve default?
		if (!loaded)
			this.setToDefaultImage();
	},
	
	//sets the image to the default image
	setToDefaultImage : function() {
		logger.debug(this.id + ".setToDefaultImage");
		if (this.imageNode) {
			this.imageNode.onerror = null;  //do not catch exceptions when loading default
			this.imageNode.src = this.defaultImage;
		}
	},
	
	//function which corrects internet explorer resize problems
	IEresize : function() {
		logger.debug(this.id + ".IEresize");	
		var origw = this.imageNode.width;
		var origh = this.imageNode.height;
		if (origw > 0 && origh > 0) {//only apply if an valid image has been loaded
			var factorw = this.width / origw;
			var factorh = this.height / origh;
			var factor = (factorw < factorh ? factorw : factorh);
			if (factor < 1) {//check prevents upscaling
				dojo.style(this.imageNode, 'width',  (factor * origw) + 'px');
				dojo.style(this.imageNode, 'height', (factor * origh) + 'px');
			}
		}
	},
	
	execclick : function(index) {
		if (this.dataobject != null && this.imageNode)
		{
			//the microflow
			if (this.clickmicroflow != '')
			{
				mx.processor.xasAction({
					error       : function() {
						logger.error(this.id + "error: XAS error executing microflow");
					},
					actionname  : this.clickmicroflow,
					applyto     : 'selection',
					//MWE: XXX sometimes dataobject appears to be number only?!
					guids       : [dojo.isObject(this.dataobject) ? this.dataobject.getGUID() : this.dataobject]
				});
			}
			//the link
			if (this.linkattr != '')
			{
				var url = this.dataobject.getAttribute(this.linkattr);
				if (url != '' && url != undefined && url != null)
					window.open(url, this.linktarget);
			}
		}
	},
	
	postCreate : function(){
		//houskeeping
		logger.debug(this.id + ".postCreate");
		this.initContext();
		this.actRendered();
	},
	
	applyContext : function(context, callback){
		logger.debug(this.id + ".applyContext"); 
		if (context && !!context.getTrackId()) {
			this.subhandler = this.subscribe({ guid : context.getTrackID(), callback : dojo.hitch(this, this.setDataobject)});
			//mx.processor.subscribeToGUID(this, context.getTrackID());
			var obj =  context.getTrackObject();
			if (obj != null)
				this.setDataobject(obj);
			else {
				mx.processor.get({
					guid : context.getTrackID(),
					callback : this.setDataobject
				}, this);
			}
		}
		else
			logger.warn(this.id + ".applyContext received empty context");
		callback && callback();
	},
	
	uninitialize : function(){
		try {
			if (this.dataobject != null && this.dataobject.getGUID != null) 
				this.unsubscribe(this.subhandler);
				//mx.processor.unSubscribeFromGUID(this, this.dataobject.getGUID());
		} catch (e) {
			console.warn('Unitialize of Dynamic Image Viewer failed');
		}
	}
});
