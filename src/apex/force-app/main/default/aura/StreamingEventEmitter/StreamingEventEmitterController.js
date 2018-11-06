({
	onInit: function (component, event, helper) {

		component.set('v.subscription', null);

		// Register error listener for the empApi component.
		const empApi = component.find('empApi');
		// Error handler function that prints the error to the console.
		const errorHandler = function (message) {
			console.error('Received error ', JSON.stringify(message));
		};

		// Register error listener and pass in the error handler function.
		empApi.onError(errorHandler);

		helper.subscribe(component, event, helper);

	},

	onLocationChange: function (component, event, helper) {
		helper.unsubscribe(component, event, helper);
	}

});
