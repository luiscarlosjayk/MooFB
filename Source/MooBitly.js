/*
---

name: MooBitly

description: Provides an easier way to make use of Youtube Iframe API

license: MIT-style license

authors:
  - Ciul

requires: [More/Request/JSONP]

provides: [MooBitly]

documentation: http://dev.bitly.com/links.html

...
*/

(function($) { // Dollar Safe Mode
	var $global = this;
	
	var MooBitly = $global.MooBitly = new Class({
		Implements: [Options],
		
		// Options
		options: {
			onRequest:  function(url) {
				// pass your own code onRequest handler ...
			},
			onCancel: function() {
				// pass your own code onCancel handler ...
			},
			onTimeout: function() {
				// pass your own code onTimeout handler ...
			}
		},
		
		// Properties
		$store:			{},
		$login:			null,
		$apiKey:		null,
		$apiAddress:	'http://api-ssl.bitly.com/v3/',
		
		// Initialize
		initialize: function(login, apiKey, options) {
			this.setOptions(options);
			
			this.$login = Type.isString(login) ? login : null;
			this.$apiKey = Type.isString(apiKey) ? apiKey : null;
			
			/**
			 * Retrieve static $instance property,
			 * which holds instance of this class, or assign it if not set yet.
			 **/
			if ( instanceOf($global.MooBitly.$instance, $global.MooBitly) ) {
				return $global.MooBitly.$instance
			} else {
				$global.MooBitly.$instance = this;
			}
			return this;
		},
		
		/********************** PRIVATE METHODS **********************/
		
		/**
		 * $storeResult
		 */
		$storeResult: function(id, json) {
			if (!Type.isString(id) || !Type.isObject(json))
				return;
			this.$store[id] = json;
		},
		
		/**
		 * $requestBitly
		 */
		$requestBitly: function(method, data, fn, id) {
			// Create Bitly API url
			var bitlyUrl = this.$apiAddress.concat(method);
			
			// Add login and apiKey to the requested data
			Object.merge(data, {login: this.$login, apiKey: this.$apiKey});
			
			var requestOptions = {
				url: bitlyUrl,
				data: data,
				onComplete: function(response) {
					fn.call(this, response);
					
					if (Type.isString(id))
						this.$storeResult(id, response);
				}.bind(this)
			};
			
			// Add the user options to the requested options
			Object.merge(requestOptions, this.options);
			
			// Request Bitly API
			var jsonpRequest = new Request.JSONP(requestOptions).send();
			
		}.protect(),
		
		/********************** PUBLIC METHODS **********************/
		
		/**
		 * name: expand
		 * description: Given a bitly URL or hash, returns the target (long) URL.
		 */
		expand: function(hash_shortUrl, fn, id) {
			var $isUrl = hash_shortUrl.test('^(https?):\/\/', 'i');
			var data = $isUrl ? {shortUrl: hash_shortUrl} : {hash: hash_shortUrl};
			
			this.$requestBitly('expand', data, fn, id);
		},
		
		/**
		 * name: info
		 * description: This is used to return the page title for a given bitly link.
		 */
		info: function(hash_shortUrl, expand_user, fn, id) {
			var $isUrl = hash_shortUrl.test('^(https?):\/\/', 'i');
			var data = $isUrl ? {shortUrl: hash_shortUrl} : {hash: hash_shortUrl};
			
			expand_user = !!expand_user;
			Object.merge(data, {expand_user: expand_user});
			
			this.$requestBitly('info', data, fn, id);
		},
		
		/**
		 * name: lookup
		 * description: This is used to query for a bitly link based on a long URL.
		 */
		lookup: function(url, fn, id) {
			var data = {url: url};
			this.$requestBitly('lookup', data, fn, id);
		},
		
		/**
		 * shorten
		 * Given a long URL, returns a bitly short URL.
		 * arguments:
		 *		@string		longUrl		A long URL to be shortened
		 *		@string		domain		(optional) refers to a preferred domain; either bit.ly, j.mp, or bitly.com, for users who do NOT have a custom short domain set up with bitly.
		 *		@function	fn			function to be called on succesful bitly API call.
		 *		@string		id			Convertion id stored result for retrieval.
		 */
		shorten: function(longUrl, domain, fn, id) {
			var data = {longUrl: longUrl}
			if (Type.isString(domain))
				Object.merge(data, {domain: domain});
			
			this.$requestBitly('shorten', data, fn, id);
		},
		
		/********************** PUBLIC STORE METHODS **********************/
		
		/**
		 * name: retrieve
		 * description: Retrieves an object result previously stored.
		 * arguments:
		 *		@string		id			Convertion id stored result for retrieval.
		 * return:
		 *		@object		object		Convertion result object or null if id is not found.
		 **/
		retrieve: function(id) {
			if (this.$store.hasOwnProperty(id)) {
				return this.$store[id];
			}
			return null;
		},
		
		/**
		 * name: remove
		 * description: Removes an object result previously stored.
		 * arguments:
		 *		@string		id			Convertion id stored result for retrieval.
		 * return:
		 *		@object		object		Result from deleting object in store or null if id is not found.
		 **/
		remove: function(id) {
			if (this.$store.hasOwnProperty(id)) {
				this.$store[id] = null;
				return delete this.$store[id];
			}
			return null;
		}
		
	});
	
	/**
	 * Extend static $instance property which holds an instance of MooBitly,
	 * since just one is capable of being reused for multiple api calls.
	 **/
	MooBitly.extend({
		$instance: null
	});
	
})(document.id);