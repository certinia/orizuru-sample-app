({
	doInit: function (component) {
		var action = component.get('c.getPlanStatus'),
			objectId = component.get('v.recordId');

		action.setParams({
			id: objectId
		});

		action.setCallback(this, function (data) {
			var planStatus = data.getReturnValue();

			if (planStatus !== 'NOT STARTED') {
				component.set('v.show', true);
				component.set('v.progress', planStatus);
			}

			if (planStatus === 'COMPLETED') {
				component.set('v.show', false);
				component.set('v.planComplete', true);
			}

		});

		$A.enqueueAction(action);
	},

	handleStepEvent: function (component, event, helper) {

		var status = event.getParam('status'),
			eventId = event.getParam('id'),
			objectId = component.get('v.recordId');

		if (eventId != null && eventId === objectId) {
			component.set('v.show', true);
			component.set('v.progress', status);

			if (status == 'COMPLETED') {
				component.set('v.show', false);
				component.set('v.planComplete', true);
			}
		}

	}
});
