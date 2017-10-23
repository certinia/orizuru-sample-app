({
	connectCometd: function (component) {
		var cometd = component.get('v.cometd'),
			location = window.location,
			cometdUrl = location.protocol + '//' + location.hostname + '/cometd/40.0/';

		cometd.configure({
			url: cometdUrl,
			requestHeaders: { Authorization: 'OAuth ' + component.get('v.sessionId') },
			appendMessageTypeToURL: false
		});

		cometd.websocketEnabled = false;

		// Establish CometD connection
		cometd.handshake(function (handshakeReply) {
			var eventSubscriptions = component.get('v.eventSubscriptions'),
				cometdSubscriptions;

			if (handshakeReply.successful) {
				// Create a CometD subcription for each platform event subscription
				cometdSubscriptions = eventSubscriptions.map(function (eventSubscription) {
					return cometd.subscribe('/event/' + eventSubscription, function (platformEvent) {
						var monitoredEvent = component.getEvent("streamingEvent");
						if (monitoredEvent) {
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

		// Unsubcribe all CometD subscriptions
		cometd.batch(function () {
			var subscriptions = component.get('v.cometdSubscriptions');
			subscriptions.forEach(function (subscription) {
				cometd.unsubscribe(subscription);
			});
		});
		component.set('v.cometdSubscriptions', []);

		// Disconnect CometD
		cometd.disconnect();
	}
});
