({

	initPlan: function (component) {

		var action = component.get('c.getPlanStatus'),
			objectId = component.get('v.recordId');

		action.setParams({
			id: objectId
		});

		action.setCallback(this, function (data) {

			var planStatus = data.getReturnValue();

			if (planStatus !== 'NOT STARTED') {
				component.set('v.show', false);
			}

			if (planStatus === 'COMPLETED') {
				component.set('v.show', true);
				component.set('v.planComplete', true);
			}

		});

		$A.enqueueAction(action);

	},

	initRoutes: function (component) {

		var action = component.get('c.getRoutes'),
			objectType = component.get('v.sObjectName'),
			recordId = component.get('v.recordId');

		if (recordId && objectType && objectType.includes('DeliveryPlan__c')) {
			action.setParams({ planIds: [recordId] });
			action.setCallback(this, function (data) {
				var routes = data.getReturnValue(),
					options = [],
					i;

				for (i = 0; i < routes.length; i++) {
					options.push({
						label: routes[i].Name + ' - ' + routes[i].Vehicle__r.Warehouse__r.Name + ' - ' + routes[i].Vehicle__r.Name,
						value: routes[i].Id
					});
				}

				component.set('v.routeOptions', options);
				if (routes && routes[0] && routes[0].Id) {
					component.set('v.routeId', routes[0].Id);
				}
			});

			$A.enqueueAction(action);
		}

	},

	viewRoute: function (component) {

		var action = component.get('c.getRoutes'),
			objectType = component.get('v.sObjectName'),
			routeId = component.get('v.routeId'),

			navigationEvent = $A.get("e.force:navigateToSObject");

		navigationEvent.setParams({
			"recordId": routeId
		});
		navigationEvent.fire();

	}

})
