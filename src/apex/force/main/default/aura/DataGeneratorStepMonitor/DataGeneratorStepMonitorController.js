({
	handleStepEvent: function (component, event, helper) {

		var status = event.getParam('status'),
			eventId = event.getParam('id'),
			objectId = component.get('v.recordId');

		// check the status field, set progress to max and ignore
		if (eventId != null && eventId === objectId) {
			console.log('Status: ' + status);
			component.set('v.show', true);
			component.set('v.progress', status);
		} else {
			console.log('Ignoring event');
		}

	}

});
