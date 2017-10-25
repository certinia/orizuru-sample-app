({
	handleClick: function (component, event, handler) {

		var action = component.get('c.calculateRoute'),
			objectId = component.get("v.recordId");

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
			objectId = component.get("v.recordId");

		// if status field is set completed, hide the button too

		if (eventId != null && eventId === objectId && status !== 'STARTED') {
			component.set('v.show', false);
		}

	}
})
