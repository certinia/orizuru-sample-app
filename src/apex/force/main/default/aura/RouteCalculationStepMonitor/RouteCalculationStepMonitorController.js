({
	doInit: function (component) {
		var action = component.get('c.getPlanStatus'),
			objectId = component.get('v.recordId');

		action.setParams({
			id: objectId
		});

		action.setCallback(this, function (data) {
			var planStatus = data.getReturnValue();


			if (planStatus === 'COMPLETED') {
				component.set('v.planComplete', true);
			}

			if (planStatus !== 'NOT STARTED') {
				component.set('v.show', true);
				component.set('v.progress', planStatus);
			}
		});

		$A.enqueueAction(action);
	},

	handleStepEvent: function (component, event, helper) {

		var status = event.getParam('status'),
			eventId = event.getParam('id'),
			objectId = component.get('v.recordId'),
			planComplete = component.get('v.planComplete');

		if (!planComplete && eventId != null && eventId === objectId) {
			console.log('Status: ' + status);
			component.set('v.show', true);
			component.set('v.progress', status);

			if (status == 'COMPLETED') {
				window.setTimeout(() => {
					$A.get('e.force:refreshView').fire();
				}, 1000);
			}
		}

	}
});
