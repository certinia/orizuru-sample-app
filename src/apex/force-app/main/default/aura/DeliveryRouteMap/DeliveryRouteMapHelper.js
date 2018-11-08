({
	calculateRoute: function (component) {
		var action = component.get('c.calculateRoute'),
			routeId = component.get('v.routeId');

		if (routeId) {
			action.setParams({ routeId: routeId });
			action.setCallback(this, function (data) {
				component.set('v.url', data.getReturnValue());
			});

			$A.enqueueAction(action);
		}
	},

	initRouteId: function (component) {
		var objectType = component.get('v.sObjectName'),
			recordId = component.get('v.recordId');

		if (objectType && objectType.includes('DeliveryRoute__c')) {
			component.set('v.routeId', recordId);
		}
	}
})
