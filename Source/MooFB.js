/*
---

name: MooFb

description: Provides an easier way to make use of Facebook Connect API

license: MIT-style license

authors:
  - Ciul

requires: [Core/Class, Core/Object]

provides: [MooFB]

...
*/

var MooFB = new Class({
	Implements: [Options, Events, SubObjectMapping],
	
	options: {
		// use any option from http://developers.facebook.com/docs/reference/javascript/FB.init/
		languageLocale: 'en_US', // Search for Facebook language locales available at http://www.facebook.com/translations/FacebookLocales.xml
		automatic: {
			fbroot		: true,
			fbsdk		: true,
			init		: true,
			loginStatus	: true
		}
	},
	
	subObjectMapping: {
		'this.fbObj' : {
			functions: ['init', 'login', 'logout', 'getLoginStatus', 'getSession', 'api', 'ui']
		},
		'this.fbObj.Event' : {
			functions: ['subscribe', 'unsubscribe']
		},
		'this.fbObj.Data' : {
			functions: ['query', 'waitOn']
		}
	},
	
	/**
	 * Objects
	 */
	fbObj:		null,
	
	/**
	 * Properties
	 */
	appId:		null,
	response:	null,
	
	/**
	 * Initialize method
	 *
	 * @param		appId		Facebook appId
	 * @options		options		
	 *
	 */
	initialize: function(appId, options) {
		this.setOptions(options);
		this.appId = appId;
		
		if(this.options.automatic) {
			if(this.options.automatic.fbroot) { this.addFBRoot(); }
			
			if(this.options.automatic.fbsdk) {
				var src = String.from(document.location.protocol).concat('//connect.facebook.net/', this.options.languageLocale, '/all.js');
				var e = new Element('script', {	async:	true, src:	src	});
				e.inject(document.head);
				
				if(this.options.automatic.init) {
					
					window.fbAsyncInit = function() {
						this.fbObj = FB;
						this.mapToSubObject();
						
						this.init(Object.merge({appId: this.appId }, this.options) );
						
						if(this.options.automatic.loginStatus) {
							this.getLoginStatus(function(response) {
								this.response = response;
								this.fireEvent('onLoad', response);
							}.bind(this));
						} else {
							this.response = null;
							this.fireEvent('onLoad', null);
						}
						
						this.suscribeFBEvents();
						
					}.bind(this)
				}
				
			}
		
		}
		
		
	},
	
	/**
	 * Adds <div id="fb-root"></div> to the site; this is mandatory for FB Connect API to work.
	 */
	addFBRoot: function() {
		if(typeOf($('fb-root') !== 'element')) {
			var fbroot = new Element('div#fb-root');
			document.body.grab(fbroot, 'top');
		}
	}.protect(),
	
	/**
	 * Suscribe Facebook events and map them to CustomEvents(more friendly names)
	 */
	suscribeFBEvents: function() {
		if(this.fbObj === null) { return; } // Make sure this only run once and after FB Connect API being loaded.
		var fbEvents = {
			'auth.login'		: 'onLogin',
			'auth.logout'		: 'onLogout',
			'auth.promt'		: 'onPrompt',
			'auth.sessionChange': 'onSessionChange',
			'auth.statusChange'	: 'onStatusChange',
			'xfbml.render'		: 'onXFBMLRender',
			'edge.create'		: 'onLike',
			'edge.remove'		: 'onUnlike',
			'comment.create'	: 'onComment',
			'comment.remove'	: 'onUncomment',
			'fb.log'			: 'onLog'
		};
		Object.each(fbEvents, function(customEvent, fbEvent) {
			this.fbObj.Event.subscribe(fbEvent, function(response) {
				this.response = response;
				this.fireEvent(customEvent, response);
			}.bind(this));
		}, this);
	}
	
	/*------------------------- CUSTOM MAPPING METHODS -------------------------*/
	
	/*------------------------------ CUSTOM METHODS ---------------------------*/
	
	/**
	 * 
	 * 
	 */
	
	/*------------------------- CUSTOM EVENTS METHODS -------------------------*/
	
});