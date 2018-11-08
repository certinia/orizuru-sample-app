({

	onInit: function (component, event, helper) {
		helper.initPlan(component);
		helper.initRoutes(component);
	},

	viewRoute: function (component, event, helper) {
		helper.viewRoute(component);
	},

	handleStepEvent: function (component, event, helper) {

		var status = event.getParam('status'),
			eventId = event.getParam('id'),
			objectId = component.get('v.recordId'),
			planComplete = component.get('v.planComplete');

		if (eventId != null && eventId === objectId) {

			if (status == 'COMPLETED') {
				component.set('v.show', true);
				helper.initRoutes(component);
			}

		}

	}

})
