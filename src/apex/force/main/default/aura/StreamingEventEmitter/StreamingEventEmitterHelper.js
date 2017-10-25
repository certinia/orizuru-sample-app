({
	connectCometd: function (component) {
		var cometd = component.get('v.cometd'),
			cometdReplayExtension = component.get('v.cometdReplayExtension'),
			location = window.location,
			cometdUrl = location.protocol + '//' + location.hostname + '/cometd/40.0/',
			eventSubscriptions = component.get('v.eventSubscriptions');

		cometdReplayExtension.setChannel('/event/' + eventSubscriptions[0]);
		cometdReplayExtension.setReplay(-2);
		cometd.registerExtension('myReplayExtensionName', cometdReplayExtension);

		cometd.configure({
			url: cometdUrl,
			requestHeaders: { Authorization: 'OAuth ' + component.get('v.sessionId') },
			appendMessageTypeToURL: false
		});

		cometd.websocketEnabled = false;

		// Establish CometD connection
		cometd.handshake(function (handshakeReply) {
			var cometdSubscriptions;

			if (handshakeReply.successful) {
				// Create a CometD subscription for each platform event subscription
				cometdSubscriptions = eventSubscriptions.map(function (eventSubscription) {

					return cometd.subscribe('/event/' + eventSubscription, function (platformEvent) {
						var monitoredEvent = component.getEvent("streamingEvent");
						if (monitoredEvent) {
							console.log(JSON.stringify(platformEvent));
							monitoredEvent.setParams({
								payload: platformEvent.data.payload
							});
							monitoredEvent.fire()
						} else {
							console.log('Null monitoredEvent');
						}
					});
				});

				// Remember subscriptions so we can unsubscribe on unload
				component.set('v.cometdSubscriptions', cometdSubscriptions);
			}
		});

		// Disconnect CometD when leaving page
		window.addEventListener('unload', function (event) {
			helper.disconnectCometd(component);
		});
	},

	disconnectCometd: function (component) {
		var cometd = component.get('v.cometd');

		// Unsubscribe all CometD subscriptions
		cometd.batch(function () {
			var subscriptions = component.get('v.cometdSubscriptions');
			subscriptions.forEach(function (subscription) {
				cometd.unsubscribe(subscription);
			});
		});
		component.set('v.cometdSubscriptions', []);

		// Disconnect CometD
		cometd.disconnect();
	},

	cometdReplayExtension: function () {
		var REPLAY_FROM_KEY = "replay";

		var _cometd;
		var _extensionEnabled;
		var _replay;
		var _channel;

		this.setExtensionEnabled = function (extensionEnabled) {
			_extensionEnabled = extensionEnabled;
		}

		this.setReplay = function (replay) {
			_replay = parseInt(replay, 10);
		}

		this.setChannel = function (channel) {
			_channel = channel;
		}

		this.registered = function (name, cometd) {
			_cometd = cometd;
		};

		this.incoming = function (message) {
			if (message.channel === '/meta/handshake') {
				if (message.ext && message.ext[REPLAY_FROM_KEY] == true) {
					_extensionEnabled = true;
				}
			}
		}

		this.outgoing = function (message) {
			if (message.channel === '/meta/subscribe') {
				if (_extensionEnabled) {
					if (!message.ext) { message.ext = {}; }

					var replayFromMap = {};
					replayFromMap[_channel] = _replay;

					// add "ext : { "replay" : { CHANNEL : REPLAY_VALUE }}" to subscribe message
					message.ext[REPLAY_FROM_KEY] = replayFromMap;
				}
			}
		};
	}
});
