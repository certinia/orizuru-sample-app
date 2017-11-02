({
	initRoutes: function (component) {
		var action = component.get('c.getRoutes'),
			objectType = component.get('v.sObjectName'),
			recordId = component.get('v.recordId');

		if (recordId && objectType && objectType.includes('DeliveryPlan__c')) {
			action.setParams({ planIds: [recordId] });
			action.setCallback(this, function (data) {
				var routes = data.getReturnValue();

				console.log(routes);

				component.set('v.routes', routes);
				if (routes && routes[0] && routes[0].Id) {
					component.set('v.routeId', routes[0].Id);
				}
			});

			$A.enqueueAction(action);
		}
	}
})
