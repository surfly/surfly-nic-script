/**
* Surfly NIC integration
*
* Make sure the following variables are initialized based on your configuration before importing this script
*     showLiveChatButton
*     showVideoChatButton
*     scaleDroneChannelId
*     nicHomeURL
*     nicBusNumber
*     nicChatPOC
*     clusterNiC
*     videoSignalerURL
*     chatSignalerURL
*     surflySettings
*     surflyWidgetKey
*     surflyModalTitle
*     surflyModalBody
*
* Example in HTML pages:
*
* <html>
*     <head>
*     ...
*     </head>
*     <body>
*         ...
*         <script>
*             var showLiveChatButton  = true;
*             var showVideoChatButton = true;
*             var scaleDroneChannelId = 'fygLrCqVZUYQZL6';
*             var nicHomeURL          = 'https://home-b99.nice-incontact.com';
*             var nicBusNumber        = '1809119';
*             var nicChatPOC          = '1605d121-489c-4df4-83b1-334dbeb0a781u';
*             var clusterNiC          = 'b99';
*             var videoSignalerURL    = "https://home-b99.nice-incontact.com/inContact/Manage/Scripts/Spawn.aspx?scriptName=Surfly_Signaler&bus_no=1534130&scriptId=64719900&skill_no=1197136&Guid=602b102c74-c935-4539-9f80-0827ab18918";
*             var chatSignalerURL     = "https://home-b99.nice-incontact.com/inContact/Manage/Scripts/Spawn.aspx?scriptName=Surfly_Signaler&bus_no=1534130&scriptId=64719900&skill_no=1197136&Guid=602b102c74-c935-4539-9f80-0827ab18918";
*             var surflySettings      = { ... };
*             // The following variables can be passed as part of the surflySettings object. we keep supporting them for backward compatibility
*             var surflyWidgetKey     = '134f5fd2ac8842c0a1cd6062818yd2ac';
*             var surflyModalTitle    = 'Start Videochat';
*             var surflyModalBody     = 'By clicking Accept, an agent will automatically join you in a videochat session. You will be prompted to enable/disable your camera and mute/unmute your microphone. You can access your audio settings using the gear icon. You can end the videochat at any time, by clicking ✕ in the menu or by closing this tab in your browser.';
* ​        </script>
*         <script type="text/javascript" src="https://nic.surfly.com/surfly-nic-script.js"></script>
*         ...
*     ​</body>
* </html>
*/

const config = {
	signalURL: "https://nic.surf.ly/signal",
	workItemURL: "https://nic.surf.ly/work-item",
	nicHomeURL: nicHomeURL || "https://home-" + clusterNiC + ".nice-incontact.com",
	showLiveChatButton: typeof showLiveChatButton === 'undefined' ? true : showLiveChatButton,
	showVideoChatButton: typeof showVideoChatButton === 'undefined' ? true : showVideoChatButton,
	surflySettings: typeof surflySettings === 'undefined' ? {} : surflySettings,
} 

function initialize(){
	if (config.showLiveChatButton === false && config.showVideoChatButton === false) {
		throw new Error('Surfly NIC integration: No buttons to show');
	};
	
	loadChatNiC().then(() => {
		loadScaledrone().then(() => {
			initScaledrone();
			
			loadSurfly();
			initSurfly();
		});
	});
};

// NICE utilities functions
function loadChatNiC() {
	var chatSrc = document.createElement("script");
	chatSrc.src = nicHomeURL + "/inContact/ChatClient/js/embed.min.js";
	
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(chatSrc);
	
	return new Promise((resolve, reject) => {
		chatSrc.onload = function() {
			resolve();
		}
	});	
}

function initializeChatNiC() {
	icPatronChat.init({
		serverHost: nicHomeURL,
		bus_no: nicBusNumber,
		poc: nicChatPOC,
		params: [getOrCreateUniqueClientID()]
	});
	
	console.log('Initializing NiC');
}

function signal(nicContactID, followerLink, pin, type) {
	return new Promise((resolve, reject) => {
		try {
			fetch(config.signalURL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					nic_contact_id: nicContactID,
					follower_link: followerLink,
					pin: pin,
					type: type,
				}),
			}).then(response => {
				return response.json();
			}).then(result => {
				console.log("Success:", result);
				resolve(result);
			}).catch(error => {
				console.error("Error:", error);
				reject(error);
			});
		} catch (error) {
			console.error("Error:", error);
			reject(error);
		}
	});
}

function createWorkItem(followerLink) {
	return new Promise((resolve, reject) => {
		try {
			fetch(config.workItemURL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					follower_link: followerLink,
				}),
			}).then(response => {
				return response.json();
			}).then(result => {
				console.log("Success:", result);
				resolve(result);
			}).catch(error => {
				console.error("Error:", error);
				reject(error);
			});
		} catch (error) {
			console.error("Error:", error);
			reject(error);
		}
	});
}


function updateStudioScript(contactId, type) {
	var url = new URL(chatSignalerURL);
	url.searchParams.set('p1', contactId);
	url.searchParams.set('p2', 'NA');
	url.searchParams.set('p3', `sessionended-${type}`);
	url.searchParams.set('p4', 'NA');
	fetch(url);
}


function endWorkItem(contactId) {
	var url = new URL(videoSignalerURL);
	url.searchParams.set('p1', 'endWorkItem');
	url.searchParams.set('p2', contactId);
	fetch(url);
}


// Surfly utilities functions
function createVideochatButton() {
	Surfly.button();
	var surflyIframe = document.getElementById("surfly-api-frame");
	var surflyButton = surflyIframe.contentWindow.document.getElementsByClassName("surfly-button-visible")[0];
	surflyButton.innerHTML = '<span>Start Videochat</span>';
	surflyButton.style.backgroundColor = 'rgb(0,0,0)';
	var newSurflyButton = surflyButton.cloneNode(true);
	surflyButton.parentNode.replaceChild(newSurflyButton, surflyButton);
	newSurflyButton.addEventListener('click', function() {
		createVideochatSession();
	});
}

function createVideochatSession() {
	var videochatSession = Surfly.session({
		block_until_agent_joins: false,
		start_with_videochat_on: true,
		start_with_fullscreen_videochat: true,
	});
	var surflyMetadata = {
		"name": "Customer"
	};
	
	videochatSession.on("session_started", function(session, event) {
		var surflySessionPin = session.pin;
		var surflyFollowerLink = session.followerLink;
		createWorkItem(surflyFollowerLink);
		console.log("Videochat session started");
		console.log('Session Pin: ' + surflySessionPin);
	}).on("viewer_joined", function(session, event) {
		window.nicVideochatContactId = event.userData.contactId;
	}).on("session_ended", function(session, event) {
		console.log("Videochat session ended");
		config.showVideoChatButton && createVideochatButton();
		endWorkItem(window.nicVideochatContactId);
	}).startLeader(null, surflyMetadata)
}


function createSurflySession(contactId, inviteType) {
	var surflyMetadata = {
		"name": "Customer"
	};
	if (inviteType == 'cobrowse') {
		var regularSession = Surfly.session({
			block_until_agent_joins: false
		});
		regularSession.on("session_started", function(session, event) {
			var surflySessionPin = session.pin;
			var surflyFollowerLink = session.followerLink;
			signal(contactId, surflyFollowerLink, surflySessionPin, 'cobrowse');
			var chatDiv = document.getElementById("chat-div-wrap");
			chatDiv.style.zIndex = "2147483549";
			console.log('Session Pin: ' + surflySessionPin);
			console.log('Contact ID: ' + contactId);
		}).on("session_ended", function(session, event) {
			console.log("Regular session ended, updating Studio");
			updateStudioScript(contactId, 'cobrowse');
			config.showVideoChatButton && createVideochatButton();
		}).startLeader(null, surflyMetadata);
	} else if (inviteType == 'videochat') {
		var regularSession = Surfly.session({
			block_until_agent_joins: false,
			videochat_autostart: true,
			videochat_start_fullscreen: true
		});
		regularSession.on("session_started", function(session, event) {
			var surflySessionPin = session.pin;
			var surflyFollowerLink = session.followerLink;
			signal(contactId, surflyFollowerLink, surflySessionPin, 'videochat');
			var chatDiv = document.getElementById("chat-div-wrap");
			chatDiv.style.zIndex = "2147483549";
			console.log('Session Pin: ' + surflySessionPin);
			console.log('Contact ID: ' + contactId);
		}).on("session_ended", function(session, event) {
			console.log("Regular session ended, updating Studio");
			updateStudioScript(contactId, 'videochat');
			config.showVideoChatButton && createVideochatButton();
		}).startLeader(null, surflyMetadata);
	}
}


function loadSurfly() {
	(function(s, u, r, f, l, y) {
		s[f] = s[f] || {
			init: function() {
				s[f].q = arguments
			}
		};
		l = u.createElement(r);
		y = u.getElementsByTagName(r)[0];
		l.async = 1;
		l.src = 'https://surfly-us.com/surfly.js';
		y.parentNode.insertBefore(l, y);
	})(window, document, 'script', 'Surfly');
}

function initSurfly() {
	var settings = {
		widget_key: surflyWidgetKey,
		block_until_agent_joins: true,
		session_autorestore_enabled: false,
		session_start_confirmation: true,
		hide_support_button: false,
		end_redirect_enabled: false,
		private_session: true,
		password_required: false,
		chat_enabled: false,
		confirmation_modal_body: surflyModalBody,
		support_button_position: 'bottomright',
		...config.surflySettings,
	};
	
	Surfly.init(settings, function(initResult) {
		if (initResult.success) {
			if (!Surfly.isInsideSession) {
				if (config.showVideoChatButton) {
					createVideochatButton();
				}

				if (config.showLiveChatButton) {
					initializeChatNiC();
				}
			}
		}
	});
}

// Helper functions
function loadScaledrone() {
	var scaledroneSrc = document.createElement("script");
	scaledroneSrc.src = "https://cdn.scaledrone.com/scaledrone.min.js";
	
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(scaledroneSrc);
	
	return new Promise((resolve, reject) => {
		scaledroneSrc.onload = function() {
			resolve();
		}
	});
};

function initScaledrone() {
	const drone = new Scaledrone(scaleDroneChannelId);
	drone.on('open', error => {
		if (error) {
			return console.error(error);
		}
		
		console.log("Connection has been opened");
		
		const cobrowseRoom = drone.subscribe('cobrowse');
		cobrowseRoom.on('open', error => {
			if (error) {
				return console.error(error);
			} else {
				console.log("Cobrowse room has been opened");
			}
		})
		
		cobrowseRoom.on('message', message => {
			const {
				data,
				id,
				timestamp,
				clientId,
				member
			} = message;
			
			if (data.type == 'ElevateToCobrowse' && data.bu == nicBusNumber && data.uniquePageId == getOrCreateUniqueClientID()) {
				createSurflySession(data.contactId, 'cobrowse');
				
				console.log('Co-browsing session requested');
				console.log("Message ID: " + id);
				console.log("Timestamp: " + timestamp);
				console.log(data);
			} else if (data.type == 'sessionended' && data.bu == nicBusNumber && data.uniquePageId == getOrCreateUniqueClientID()) {
				
				Surfly.listSessions().forEach(function(session) {
					session.end();
				});
				
				console.log("NiC chat ended");
				console.log("Message ID: " + id);
				console.log("Timestamp: " + timestamp);
				console.log(data);
			}
		});
		
		const videoRoom = drone.subscribe('videochat');
		videoRoom.on('open', error => {
			if (error) {
				return console.error(error);
			} else {
				console.log("Videochat room has been opened");
			}
		})
		
		videoRoom.on('message', message => {
			const {
				data,
				id,
				timestamp,
				clientId,
				member
			} = message;
			
			if (data.type == 'ElevateToVideo' && data.bu == nicBusNumber && data.uniquePageId == getOrCreateUniqueClientID()) {
				createSurflySession(data.contactId, 'videochat');
				
				console.log('Videochat session requested');
				console.log("Message ID: " + id);
				console.log("Timestamp: " + timestamp);
				console.log(data);
			}
		});
	});
	
	drone.on('error', error => {
		console.log("An error has occurred with the connection", error);
	});
	
	drone.on('close', event => {
		console.log("Connection has been closed", event);
	})
	
	drone.on('disconnect', event => {
		console.log("User has disconnected, Scaledrone will try to reconnect soon", event);
	})
	
	drone.on('reconnect', event => {
		console.log("User has been reconnected", event);
	});
}

function getOrCreateUniqueClientID() {
	const suffix = "-uniquePageId"
	const uniqueClientIDKey = nicBusNumber + suffix;
	let uniqueClientID = localStorage.getItem(uniqueClientIDKey);
	if (!uniqueClientID) {
		let randomString = Math.random().toString(36).substring(7);
		let dateNow = Date.now();
		uniqueClientID = randomString + "-" + dateNow;
		localStorage.setItem(uniqueClientIDKey, uniquePageId);
	}
	
	return uniqueClientID;
}

initialize();