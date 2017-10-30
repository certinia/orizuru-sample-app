({
	doInit: function (component) {
		var action = component.get('c.getPlanComplete'),
			objectId = component.get('v.recordId');

		action.setParams({
			id: objectId
		});

		action.setCallback(this, function (data) {
			var planComplete = data.getReturnValue()
			component.set('v.planComplete', planComplete);
			if (planComplete) {
				component.set('v.show', false);
			} else {
				component.set('v.show', true);
			}
		});

		$A.enqueueAction(action);
	},

	handleClick: function (component, event, handler) {

		var action = component.get('c.calculateRoute'),
			objectId = component.get('v.recordId'),
			stepEvent = $A.get('e.c:RouteCalculationStepEvent');

		stepEvent.setParams({
			id: objectId,
			messages: '',
			severity: '',
			status: 'STARTED'
		});
		stepEvent.fire();

		console.log('ObjectId: ' + objectId);

		component.set('v.show', false);

		action.setParams({
			id: objectId
		});
		action.setCallback(this, function (data) {
			console.log('called calculateRoute: ' + data.getReturnValue());
		});
		$A.enqueueAction(action);

	},

	handleStepEvent: function (component, event, handler) {

		var status = event.getParam('status'),
			eventId = event.getParam('id'),
			objectId = component.get('v.recordId'),
			planComplete = component.get('v.planComplete');

		if (!planComplete && eventId != null && eventId === objectId && status !== 'STARTED') {
			component.set('v.show', false);
		}
	}
})
