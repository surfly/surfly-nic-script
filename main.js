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


var nicChatContactId;

function signalContact(contactId, followerLink, sessionPin, type)
{
    var actionURL = chatSignalerURL;

	ctdURL = actionURL;
    ctdURL += '&p1=';
    ctdURL += contactId;
    ctdURL += '&p2=';
    ctdURL += followerLink;
    ctdURL += '&p3=';
    ctdURL += sessionPin;
    ctdURL += '&p4=';
    ctdURL += type;

	var hiddenAction = document.createElement('iframe');

	hiddenAction.setAttribute('id', 'hiddenAction');
    hiddenAction.style.width     = '0';
    hiddenAction.style.height   = '0';
    hiddenAction.style.border   = '0';
    hiddenAction.style.border   = 'none';
    hiddenAction.style.position = 'absolute';
    hiddenAction.src            = ctdURL;

	document.body.appendChild(hiddenAction);

	setTimeout(function() {
      var hiddenFrame = document.getElementById("hiddenAction");
      hiddenFrame.parentNode.removeChild(hiddenFrame);
    },1500);
}


function updateStudioScript(contactId, type)
{
    var actionURL = chatSignalerURL;

	ctdURL = actionURL;
    ctdURL += '&p1=';
    ctdURL += contactId;
    ctdURL += '&p2=NA';
    ctdURL += '&p3=';
    ctdURL += 'sessionended-';
    ctdURL += type;
    ctdURL += '&p4=NA';

	var hiddenAction = document.createElement('iframe');

	hiddenAction.setAttribute('id', 'hiddenAction');
    hiddenAction.style.width    = '0';
    hiddenAction.style.height   = '0';
    hiddenAction.style.border   = '0';
    hiddenAction.style.border   = 'none';
    hiddenAction.style.position = 'absolute';
    hiddenAction.src            = ctdURL;
    document.body.appendChild(hiddenAction);

	setTimeout(function() {
      var hiddenFrame = document.getElementById("hiddenAction");
      hiddenFrame.parentNode.removeChild(hiddenFrame);
    },1500);
}


function signalWorkItem(followerLink)
{
    var actionURL = videoSignalerURL;

	ctdURL = actionURL;
    ctdURL += '&p1=';
    ctdURL += 'startWorkItem';
    ctdURL += '&p2=';
    ctdURL += followerLink;

	var hiddenAction = document.createElement('iframe');

	hiddenAction.setAttribute('id', 'hiddenAction');
    hiddenAction.style.width    = '0';
    hiddenAction.style.height   = '0';
    hiddenAction.style.border   = '0';
    hiddenAction.style.border   = 'none';
    hiddenAction.style.position = 'absolute';
    hiddenAction.src            = ctdURL;

	document.body.appendChild(hiddenAction);

	setTimeout(function() {
      var hiddenFrame = document.getElementById("hiddenAction");
      hiddenFrame.parentNode.removeChild(hiddenFrame);
    },1500);
}


function endWorkItem(contactId)
{
    var actionURL = videoSignalerURL;

	ctdURL = actionURL;
    ctdURL += '&p1=';
    ctdURL += 'endWorkItem';
    ctdURL += '&p2=';
    ctdURL += contactId;

	var hiddenAction = document.createElement('iframe');

	hiddenAction.setAttribute('id', 'hiddenAction');
    hiddenAction.style.width    = '0';
    hiddenAction.style.height   = '0';
    hiddenAction.style.border   = '0';
    hiddenAction.style.border   = 'none';
    hiddenAction.style.position = 'absolute';

	hiddenAction.src = ctdURL;

	document.body.appendChild(hiddenAction);
    setTimeout(function() {
      var hiddenFrame = document.getElementById("hiddenAction");
      hiddenFrame.parentNode.removeChild(hiddenFrame);
    },1500);
}


function createVideochatSession()
{
    var videochatSession = Surfly.session({ block_until_agent_joins: false,
                                            videochat_autostart: true,
                                            videochat_start_fullscreen: true });
    var surflyMetadata = {"name": "Customer"};

	videochatSession.on("session_created", function(session, event) {

		var surflyFollowerLink = session.followerLink;

		console.log('Waiting for confirmation');
        session.startLeader(null, surflyMetadata);
		
        if (surflyModalBody) {
			var observer = new MutationObserver(function (mutations, observer) {
				mutations.forEach(function (mutation) {
					[].filter.call(mutation.addedNodes, function (node) {
						return node.nodeName == 'DIV';
					}).forEach(function (node) {
						if (node.matches('.surfly-modal.fadein')) {
							observer.disconnect();
						  
							var modalBody          = node.querySelector('.body').getElementsByTagName("P")[0];
							modalBody.innerHTML    = surflyModalBody;
							var surflyAcceptButton = node.querySelector('.accept');

							function surflyModalCancel(event) {
								createVideochatButton();
								console.log('cancel button was clicked, removing listeners');
								surflyAcceptButton.removeEventListener('click', surflyModalAccept);
							}


							function surflyModalAccept(event) {
								console.log('accept button was clicked, removing listeners');
								surflyAcceptButton.removeEventListener('click', surflyModalAccept);   
							}
							surflyAcceptButton.addEventListener('click', surflyModalAccept);
						}
					});
				});
			});
			observer.observe(document.getElementById("surfly-api-frame").contentWindow.document.body, { childList: true, subtree: true });
		}
		
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
        endWorkItem(nicVideochatContactId);
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
        var surflyFollowerLink = session.followerLink;
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
        updateStudioScript(nicChatContactId, 'cobrowse');
        createVideochatButton();
     }).create();
  } else if (inviteType == 'videochat') {
    var regularSession = Surfly.session({ block_until_agent_joins: false,
                                            videochat_autostart: true,
                                            videochat_start_fullscreen: true });
    regularSession.on("session_created", function(session, event) {
       var surflyFollowerLink = session.followerLink;
       console.log('Waiting for confirmation');
       session.startLeader(null, surflyMetadata);
       
	   var observer = new MutationObserver(function (mutations, observer) {
            mutations.forEach(function (mutation) {
              [].filter.call(mutation.addedNodes, function (node) {
                return node.nodeName == 'DIV';
              }).forEach(function (node) {
                if (node.matches('.surfly-modal.fadein')) {
                  observer.disconnect();
                  var modalBody = node.querySelector('.body').getElementsByTagName("P")[0];
                  //modalTitle.innerHTML = surflyModalTitle;
                  modalBody.innerHTML = surflyModalBody;
                }
              });
            });
          });
          observer.observe(document.getElementById("surfly-api-frame").contentWindow.document.body, { childList: true, subtree: true });
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
       updateStudioScript(nicChatContactId, 'videochat');
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
                       agent_can_request_control : true
                   };

    Surfly.init(settings, function (initResult) {
        if (initResult.success) {
            if (!Surfly.isInsideSession) {
                createVideochatButton();

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
                                window.nicChatContactId = data.contactId;

                                createSurflySession(nicChatContactId, 'cobrowse');

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
                                window.nicChatContactId = data.contactId;

                                createSurflySession(nicChatContactId, 'videochat');

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