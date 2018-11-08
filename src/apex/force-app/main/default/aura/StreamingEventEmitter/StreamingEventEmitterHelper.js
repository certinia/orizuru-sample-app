({
	subscribe: function (component, event, helper) {

		// Get the empApi component.
		const empApi = component.find('empApi');

		// Get the channel from the eventSubscription attribute.
		const channel = component.get('v.eventSubscription');

		// Subscription option to get only new events.
		const replayId = -1;

		// Callback function to be passed in the subscribe call.
		// After an event is received, this callback prints the event
		// payload to the console. A helper method displays the message
		// in the console app.
		const callback = function (platformEvent) {
			console.log('Event Received : ' + JSON.stringify(platformEvent));
			helper.onReceiveNotification(component, platformEvent);
		};

		// Subscribe to the channel and save the returned subscription object.
		empApi.subscribe('/event/' + channel, replayId, callback).then(function (newSubscription) {
			console.log('Subscribed to channel /event/' + channel);
			component.set('v.subscription', newSubscription);
		});

	},

	unsubscribe: function (component) {

		// Get the empApi component.
		const empApi = component.find('empApi');

		// Callback function to be passed in the unsubscribe call.
		const callback = function (message) {
			console.log('Unsubscribed from channel ' + message.subscription);
		};

		// Unsubscribe from the channel using the subscription object.        
		const subscription = component.get('v.subscription');
		empApi.unsubscribe(subscription, callback);

	},

	onReceiveNotification: function (component, platformEvent) {

		var monitoredEvent = component.getEvent("streamingEvent");
		if (monitoredEvent) {
			monitoredEvent.setParams({
				payload: platformEvent.data.payload
			});
			monitoredEvent.fire()
		}

	}

});
