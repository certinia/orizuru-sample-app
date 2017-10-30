({
	doInit: function (component) {
		var action = component.get('c.getPlanStatus'),
			objectId = component.get('v.recordId');

		action.setParams({
			id: objectId
		});

		action.setCallback(this, function (data) {
			var planStatus = data.getReturnValue()
			if (planStatus === 'NOT STARTED') {
				component.set('v.show', true);
			}
		});

		$A.enqueueAction(action);
	},

	handleClick: function (component, event, handler) {
		var action = component.get('c.calculateRoute'),
			stepEvent = component.get('c.sendInitialPlatformEvent'),
			objectId = component.get('v.recordId');

		console.log('ObjectId: ' + objectId);

		action.setParams({
			id: objectId
		});
		stepEvent.setParams({
			id: objectId
		});
		action.setCallback(this, function (data) {
			console.log('called calculateRoute: ' + data.getReturnValue());
		});
		$A.enqueueAction(action);
		$A.enqueueAction(stepEvent);
	},

	handleStepEvent: function (component, event, handler) {

		var status = event.getParam('status'),
			eventId = event.getParam('id'),
			objectId = component.get('v.recordId');

		if (eventId != null && eventId === objectId) {
			component.set('v.show', false);
		}
	}
})
