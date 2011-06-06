MooFB
=====

Takes advantage of Facebook Connect api to ease make use of it.

How to use
----------
	
	First you need to follow Krpano instructions on how to include it on a site.
	You can read about at http://www.krpano.com/docu/swfkrpanojs
	
	As a simple example, you could use the following lines at Document Head:
	
	<html>
		<head>
			<title>My Fantastic Facebook App</title>
			<script type="text/javascript" src="mootools-core.js" />
			<script type="text/javascript" src="Class.SubObjectMapping.js" />
			<script type="text/javascript" src="MooFB.js" />
			
			[... whatever else you have in your document head]
		</head>
		
		<body>
			<h1>Connect JavaScript - MooTools Login Example</h1>
			<div>
			  <button id="login">Login</button>
			  <button id="logout">Logout</button>
			  <button id="perms">Ask for perms</button>
			</div>
			
			[... whatever else code you have in your document body]
		</body>
	</html>
	
	You have to register a Facebook app at (you have to login to Facebook): http://www.facebook.com/developers/createapp.php
	then use the Facebook app id to create an instance of MooFB this way:
	var moofb = new MooFB(myFBAppId);
	
	My personal recommendation is that use automatic options, which are enabled by default.
	Otherwise you would have to read how to include and load the Facebook api by yourself.
	
	Facebook documentation is a little messy but with some effort you can find what you need.
	Read about at: http://developers.facebook.com/docs/reference/javascript/
	
How to make api calls
---------------------
	
	After you FB api has loaded, you can call for other methods, like login, logout, etc:
	
	$('login').addEvent('click', function() {
		moofb.login(function(response) {
			if(response.session) {
				if(response.perms) {
					console.log(response);
				}
			}
		}.bind(moofb));
	});
	
	Or better make use of events for asynchronous calls:
	
	var moofb = new MooFB(myFBAppId).addEvents({
		login: function(response) {
			console.log(response);
		},
		logout: function(response) {
			console.log(response);
		}
	});
	
	
How to ask for permissions
--------------------------
	
	$('perms').addEvent('click', function() {
		moofb.login(function(response) {
			if(response.session) {
				if(response.perms) {
					
				}
			}
		}.bind(moofb), {perms: 'read_stream,publish_stream'});
	});
	
	You can see the whole table of permissions you can request at http://developers.facebook.com/docs/authentication/permissions/

Coming Soon
-----------
	
	You can already request for user's data, pictures, albums and other, but, I'm writing a class to make it even easier.
	Please be patient.

Donations
---------
	
	Donations are welcome. By donating you contribute to this and other Open Source efforts.