/**
* Surfly NIC integration
*
* Make sure the following variables are initialized based on your configuration before importing this script
*
*     scaleDroneChannelId
*     nicBusNumber
*     nicChatPOC
*     clusterNiC
*     surflyWidgetKey
*     videoSignalerURL
*     chatSignalerURL
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
*             var scaleDroneChannelId = 'fygLrCqVZUYQZL6';
*             var nicBusNumber        = '1809119';
*             var nicChatPOC          = '1605d121-489c-4df4-83b1-334dbeb0a781u';
*             var clusterNiC          = 'b99';
*             var surflyWidgetKey     = '134f5fd2ac8842c0a1cd6062818yd2ac';
*             var videoSignalerURL    = "https://home-b99.nice-incontact.com/inContact/Manage/Scripts/Spawn.aspx?scriptName=Surfly_Signaler&bus_no=1534130&scriptId=64719900&skill_no=1197136&Guid=602b102c74-c935-4539-9f80-0827ab18918";
*             var chatSignalerURL     = "https://home-b99.nice-incontact.com/inContact/Manage/Scripts/Spawn.aspx?scriptName=Surfly_Signaler&bus_no=1534130&scriptId=64719900&skill_no=1197136&Guid=602b102c74-c935-4539-9f80-0827ab18918";
*             var surflyModalTitle    = 'Start Videochat';
*             var surflyModalBody     = 'By clicking Accept, an agent will automatically join you in a videochat session. You will be prompted to enable/disable your camera and mute/unmute your microphone. You can access your audio settings using the gear icon. You can end the videochat at any time, by clicking ✕ in the menu or by closing this tab in your browser.';
*         ​</script>
*         <script type="text/javascript" src="https://nic.surfly.com/surfly-nic-script.js"></script>
*         ...
*     ​</body>
* </html>
*/

let NicHomeURL = "https://home-" + clusterNiC + ".nice-incontact.com";

var chatSrc = document.createElement("script");
chatSrc.src = NicHomeURL + "/inContact/ChatClient/js/embed.min.js";

var head = document.getElementsByTagName("head")[0];
head.appendChild(chatSrc);

chatSrc.onload = function () {
    var scaledroneSrc  = document.createElement("script");
    scaledroneSrc.src  = "https://cdn.scaledrone.com/scaledrone.min.js";
    scaledroneSrc.type = "text/javascript";
    head.appendChild(scaledroneSrc);

    (function(s,u,r,f,l,y){s[f]=s[f]||{init:function(){s[f].q=arguments}};
    l=u.createElement(r);y=u.getElementsByTagName(r)[0];l.async=1;
    l.src='https://surfly-us.com/surfly.js';y.parentNode.insertBefore(l,y);})
    (window,document,'script','Surfly');

    scaledroneSrc.onload = function () {
        loadSurfly();
    }
}


function signalContact(contactId, followerLink, sessionPin, type) {
    var url = new URL(chatSignalerURL);
    url.searchParams.set('p1', contactId);
    url.searchParams.set('p2', followerLink);
    url.searchParams.set('p3', sessionPin);
    url.searchParams.set('p4', type);
    fetch(url);
}


function updateStudioScript(contactId, type) {
    var url = new URL(chatSignalerURL);
    url.searchParams.set('p1', contactId);
    url.searchParams.set('p2', 'NA');
    url.searchParams.set('p3', `sessionended-${type}`);
    url.searchParams.set('p4', 'NA');
    fetch(url);
}


function signalWorkItem(followerLink) {
    var url = new URL(videoSignalerURL);
    url.searchParams.set('p1', 'startWorkItem');
    url.searchParams.set('p2', followerLink);
    fetch(url);
}


function endWorkItem(contactId) {
    var url = new URL(videoSignalerURL);
    url.searchParams.set('p1', 'endWorkItem');
    url.searchParams.set('p2', contactId);
    fetch(url);
}


function createVideochatSession()
{
    var videochatSession = Surfly.session({ block_until_agent_joins: false,
                                            videochat_autostart: true,
                                            videochat_start_fullscreen: true });
    var surflyMetadata = {"name": "Customer"};

	videochatSession.on("session_created", function(session, event) {
		console.log('Waiting for confirmation');
        session.startLeader(null, surflyMetadata);
    }).on("session_started", function(session, event) {
        var surflySessionPin = session.pin;
        var surflyFollowerLink = session.followerLink;
        signalWorkItem(surflyFollowerLink);
        console.log("Videochat session started");
        console.log('Session Pin: ' + surflySessionPin);
    }).on("viewer_joined", function(session, event){
          window.nicVideochatContactId = event.userData.contactId;
    }).on("session_ended", function(session, event) {
        console.log("Videochat session ended");
        createVideochatButton();
        endWorkItem(window.nicVideochatContactId);
    }).create();
}


function createVideochatButton()
{
    Surfly.button({position: 'bottomright'});
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


function createSurflySession(contactId, inviteType)
{
  var surflyMetadata = {"name": "Customer"};
  if (inviteType == 'cobrowse') {
     var regularSession = Surfly.session({block_until_agent_joins: false});
     regularSession.on("session_created", function(session, event) {
        console.log('Waiting for confirmation');
        session.startLeader(null, surflyMetadata);
     }).on("session_started", function(session, event) {
        var surflySessionPin = session.pin;
        var surflyFollowerLink = session.followerLink;
        
		signalContact(contactId, surflyFollowerLink, surflySessionPin, 'cobrowse');
        
		var chatDiv = document.getElementById("chat-div-wrap");
        chatDiv.style.zIndex = "2147483549";
        console.log('Session Pin: ' + surflySessionPin);
        console.log('Contact ID: ' + contactId);
     }).on("session_ended", function(session, event) {
        console.log("Regular session ended, updating Studio");
        updateStudioScript(contactId, 'cobrowse');
        createVideochatButton();
     }).create();
  } else if (inviteType == 'videochat') {
    var regularSession = Surfly.session({ block_until_agent_joins: false,
                                            videochat_autostart: true,
                                            videochat_start_fullscreen: true });
    regularSession.on("session_created", function(session, event) {
       console.log('Waiting for confirmation');
       session.startLeader(null, surflyMetadata);
    }).on("session_started", function(session, event) {
       var surflySessionPin = session.pin;
       var surflyFollowerLink = session.followerLink;
       
	   signalContact(contactId, surflyFollowerLink, surflySessionPin, 'videochat');
       
	   var chatDiv = document.getElementById("chat-div-wrap");
       
	   chatDiv.style.zIndex = "2147483549";
       console.log('Session Pin: ' + surflySessionPin);
       console.log('Contact ID: ' + contactId);
    }).on("session_ended", function(session, event) {
       console.log("Regular session ended, updating Studio");
       updateStudioScript(contactId, 'videochat');
       createVideochatButton();
    }).create();
  }
}


function loadSurfly()
{
    var settings = {
                       widget_key                : surflyWidgetKey,
                       block_until_agent_joins   : true,
                       auto_restore              : false,
                       confirm_session_start     : true,
                       hidden                    : false,
                       disable_end_redirect      : true,
                       private_session           : true,
                       require_password          : false,
                       docked_only               : true,
                       agent_can_request_control : true,
                       confirmation_modal_body: surflyModalBody,
                   };

    Surfly.init(settings, function (initResult) {
        if (initResult.success) {
            if (!Surfly.isInsideSession) {
                const drone = new Scaledrone(scaleDroneChannelId);

                drone.on('open', error => {

                    if (error) {
                        return console.error(error);
                    } else {
                        console.log("Connection has been opened");

                        const cobrowseRoom = drone.subscribe('cobrowse');

                        cobrowseRoom.on('open', error => {

                            if (error) {
                                return console.error(error);
                            } else {
                                console.log("Cobrowse room has been opened");
                            }
                        }).on('message', message => {
                            const {data, id, timestamp, clientId, member} = message;

                            if (data.type == 'ElevateToCobrowse' && data.bu == nicBusNumber && data.uniquePageId == localStorage.getItem(nicBusNumber + "-uniquePageId")) {
                                createSurflySession(data.contactId, 'cobrowse');

                                console.log('Co-browsing session requested');
                                console.log("Message ID: " + id);
                                console.log("Timestamp: " + timestamp);
                                console.log(data);
                            } else if (data.type == 'sessionended' && data.bu == nicBusNumber && data.uniquePageId == localStorage.getItem(nicBusNumber + "-uniquePageId")) {

                                Surfly.listSessions().forEach(function (session) {
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
                        }).on('message', message => {
                            const {data, id, timestamp, clientId, member} = message;

                            if (data.type == 'ElevateToVideo' && data.bu == nicBusNumber && data.uniquePageId == localStorage.getItem(nicBusNumber + "-uniquePageId")) {
                                createSurflySession(data.contactId, 'videochat');

                                console.log('Videochat session requested');
                                console.log("Message ID: " + id);
                                console.log("Timestamp: " + timestamp);
                                console.log(data);
                            }
                        });
                    }
                }).on('error', error => {
                    console.log("An error has occurred with the connection");
                }).on('close', event => {
                    console.log("Connection has been closed");
                }).on('disconnect', () => {
                    console.log("User has disconnected, Scaledrone will try to reconnect soon");
                }).on('reconnect', () => {
                    console.log("User has been reconnected");
                });

                if (localStorage.getItem(nicBusNumber + "-uniquePageId")) {
                    console.log("random: " + localStorage.getItem(nicBusNumber + "-uniquePageId"));
                } else {
                    let randomString = Math.random().toString(36).substring(7);
                    let dateNow = Date.now();
                    let uniquePageId = randomString + "-" + dateNow;

                    console.log("random: " + uniquePageId);

                    localStorage.setItem(nicBusNumber + "-uniquePageId", uniquePageId);
                }
				
				initializeChatNiC();
            }
        }
    });
}


function initializeChatNiC()
{
  icPatronChat.init(
                      {
					    serverHost : NicHomeURL, 
					    bus_no     : nicBusNumber, 
						poc        : nicChatPOC, 
						params     : [ localStorage.getItem(nicBusNumber + "-uniquePageId") ]
					  }
					);
  
  console.log('Initializing NiC');
}
