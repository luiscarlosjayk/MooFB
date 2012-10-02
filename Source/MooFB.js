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

// Create MooFB closure
(function($) { // Dollar Safe Mode
	
	var MooFB = {
		Mixins:	{}
	};
	
	this['MooFB'] = MooFB;
	
})(document.id);

// Create MooFB FBMapping Mixin
(function($) { // Dollar Safe Mode
	
	var FBMapping = this.MooFB.Mixins.FBMapping = new Class({
		
		$initMapping: function() {
			var $self = this;
			var FBMapping = $self.$FBMapping || {};
			// Map Functions
			var functionsObject = FBMapping.functions || {};
			Object.each(functionsObject, function(_function, subObject) {
				$self.$mapFunction(_function, subObject);
			});
			
			// Events must be mapped only after FB init call
			//var eventsObject = FBMapping.events || {};
				//$self.$mapEvents(eventsObject);
		},
		
		// MapFunction method
		$mapFunction: function(_function, subObject) {
			var $self = this;
			
			subObject = !!eval(subObject) ? eval(subObject) : null;
			if (!subObject)
				return null;
			
			Object.each(_function, function(mappedName, name) {
				mappedName = mappedName != null ? mappedName : name;
				
				$self[mappedName] = function() {
					return subObject[name].apply(subObject, Array.from(arguments));
				}
			});
			
		}.protect(),
		
		// MapEvents method
		$mapEvents: function(events) {
			var $self = this;
			
			if ($self.$fb === null && $self.$fb.Event === null)
				return;
			
			Object.each(events, function(mappedName, name) {
				mappedName = mappedName != null ? mappedName : name;
				
				// Facebook Event Subscriber
				$self.$fb.Event.subscribe(name, function(response) {
					$self.$response; // Store latest event response
					$self[mappedName].apply($self, Array.from(response));
				});
			});
			
		}.protect()
		
	});
	
})(document.id);

// MooFB Base Class
(function($) { // Dollar Safe Mode
	var FBMappingMixin = this.MooFB.Mixins.FBMapping;
	
	// Mapping
	var FBMapping = {
		functions: {
			'this.$fb': {
				init:				null,
				login:				null,
				logout:				null,
				getLoginStatus:		null,
				getSession:			null,
				api:				null,
				ui:					null
			},
			'this.$fb.Event': {
				subscribe:			null,
				unsubscribe:		null
			},
			'this.$fb.Data': {
				query:				null,
				waitOn:				null
			}
		},
		
		events: {
			'auth.login':			'$login',
			'auth.logout':			'$logout',
			'auth.promt':			'$prompt',
			'auth.sessionChange':	'$sessionchange',
			'auth.statusChange':	'$statuschange',
			'xfbml.render':			'$XFBMLrender',
			'edge.create':			'$like',
			'edge.remove':			'$unlike',
			'comment.create':		'$comment',
			'comment.remove':		'$uncomment',
			'fb.log':				'$log'
		}
	};
	
	var Base = this.MooFB.Base = new Class({
		Implements: [Events, Options, FBMappingMixin],
		
		// Options
		options: {
			// use any option from http://developers.facebook.com/docs/reference/javascript/FB.init/
			languageLocale: 'en_US', // Search for Facebook language locales available at http://www.facebook.com/translations/FacebookLocales.xml
			automatic: {
				fbroot:			true,
				fbsdk:			true,
				init:			true,
				/**
				 * loginStatus:	true => DEPRECATED [Use status:true in options while initializing]
				 */
			}
		},
		
		// Properties
		$fb:		null,
		$appId:		null,
		$response:	null,
		
		// Initialize method
		initialize: function(appId, options) {
			this.setOptions(options);
			this.$appId = String.from(appId);
			// Set FBMapping object
			this.$FBMapping = FBMapping;
			
			if (this.options.automatic) {
				var $self = this;
				options = $self.options;
				if (options.automatic.fbroot == true)
					this.$addFBRoot();
				
				if (options.automatic.fbsdk) {
					var src = '{locationProtocol}//connect.facebook.net/{languageLocale}/all.js';
					src = src.substitute({
						locationProtocol:	location.protocol,
						languageLocale:		options.languageLocale
					});
					
					var e = new Element('script', {async: true, src: src });
					e.inject(document.head);
					
					if (options.automatic.init) {
						
						window.fbAsyncInit = function() {
							$self.$fb = FB;
							// Map FB API functions and subscribe events
							$self.$initMapping();
							
							$self.init(Object.merge( {appId: $self.$appId}, options ));
							
							// Map Events, these must be subscribed after init calls
							$self.$subscribeFBEvents();
							
							// Notify when it has finalized initializing MooFB.Base class
							$self.fireEvent('load');
						};
					}
					
				}
			}
			
		},
		
		// ------------------------- PRIVATE METHODS -------------------------
		
		/**
		 * Adds <div id="fb-root"></div> to the site; this is mandatory for FB Connect API to work.
		 */
		$addFBRoot: function() {
			if (!Type.isElement($('fb-root'))) {
				var fbroot = new Element('div#fb-root');
				document.body.grab(fbroot, 'top');
			}
		}.protect(),
		
		/**
		 * Subscribe Facebook API events to mapped events methods
		 */
		$subscribeFBEvents: function() {
			var eventsObject = this.$FBMapping.events || {};
			this.$mapEvents(eventsObject);
		},
		
		// ------------------------- EVENTS METHODS -------------------------
		
		$login: function(response) {
			this.fireEvent('login', response);
		},
		
		$logout: function(response) {
			this.fireEvent('logout', response);
		},
		
		$prompt: function(response) {
			this.fireEvent('prompt', response);
		},
		
		$sessionchange: function(response) {
			this.fireEvent('sessionchange', response);
		},
		
		$statuschange: function(response) {
			this.fireEvent('statuschange', response);
		},
		
		$XFBMLrender: function(response) {
			this.fireEvent('XFBMLrender', response);
		},
		
		$like: function(response) {
			this.fireEvent('like', response);
		},
		
		$unlike: function(response) {
			this.fireEvent('unlike', response);
		},
		
		$comment: function(response) {
			this.fireEvent('comment', response);
		},
		
		$uncomment: function(response) {
			this.fireEvent('uncomment', response);
		},
		
		$log: function(response) {
			this.fireEvent('log', response);
		},
		
		// ------------------------- CUSTOM METHODS -------------------------
		
		// Get Latest Response
		getResponse: function() {
			return this.$response;
		},
		
		// Get User Basic info
		getUser: function(fn) {
			this.api('/me', fn);
		}
		
	});
	
})(document.id);

(function($) { // Dollar Safe Mode
	/**
	 * These are took from the list of permissions at:
	 * http://developers.facebook.com/docs/authentication/permissions/
	 */
	
	this.MooFB.Permissions = {
		Basic: {
			/**
			 * When a user auths your app and you request no additional permissions, your application will have access to only the user's basic information.
			 * By default, this includes certain properties of the User object such as id, name, picture, gender, and their locale.
			 */
		},
		User: {
			about:						'user_about_me',
			activities:					'user_activities',
			birthday:					'user_birthday',
			chekins:					'user_checkins',
			education:					'user_education_history',
			events:						'user_events',
			groups:						'user_groups',
			hometown:					'user_hometown',
			interests:					'user_interests',
			likes:						'user_likes',
			location:					'user_location',
			notes:						'user_notes',
			photos:						'user_photos',
			questions:					'user_questions',
			relationships:				'user_relationships',
			relationshipDetails:		'user_relationship_details',
			religionPolitics:			'user_religion_politics',
			status:						'user_status',
			videos:						'user_videos',
			website:					'user_videos',
			work:						'user_work_history',
			email:						'email'
		},	
		Friends: {	
			about:						'friends_about_me',
			activities:					'friends_activities',
			birthday:					'friends_birthday',
			chekins:					'friends_checkins',
			education:					'friends_education_history',
			events:						'friends_events',
			groups:						'friends_groups',
			hometown:					'friends_hometown',
			interests:					'friends_interests',
			likes:						'friends_likes',
			location:					'friends_location',
			notes:						'friends_notes',
			photos:						'friends_photos',
			questions:					'friends_questions',
			relationships:				'friends_relationships',
			relationshipDetails:		'friends_relationship_details',
			religionPolitics:			'friends_religion_politics',
			status:						'friends_status',
			videos:						'friends_videos',
			website:					'friends_website',
			work:						'friends_work_history',
			email:						null // N/A
		},	
		Extended: {	
			readFriendlists:			'read_friendlists',
			readInsights:				'read_insights',
			readMailbox:				'read_mailbox',
			readRequests:				'read_requests',
			readStream:					'read_stream',
			xmppLogin:					'xmpp_login',
			adsManagement:				'ads_management',
			createEvent:				'create_event',
			managaFriendlists:			'manage_friendlists',
			mangageNotifications:		'manage_notifications',
			userOnlinepresence:			'user_online_presence',
			friendsOnlinepresence:		'friends_online_presence',
			publishCheckins:			'publish_checkins',
			publishStream:				'publish_stream',
			rsvpEvents:					'rsvp_event'
		},	
		OpenGraph: {	
			User: {	
				publishActions:			'publish_actions',
				actionsMusic:			'user_actions.music',
				actionsNews:			'user_actions.news',
				actionsVideo:			'user_actions.video',
				actionsAPPNamespace:	'user_actions:APP_NAMESPACE',
				gamesActivity:			'user_games_activity'
			},
			Friends: {
				publishActions:			null, // N/A
				actionsMusic:			'friends_actions.music',
				actionsNews:			'friends_actions.news',
				actionsVideo:			'friends_actions.video',
				actionsAPPNamespace:	'friends_actions:APP_NAMESPACE',
				gamesActivity:			'friends_games_activity'
			}
		},
		Page: {
			manage:						'manage_pages'
		}
	};
	
})(document.id);