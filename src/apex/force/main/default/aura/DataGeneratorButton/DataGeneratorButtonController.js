({
	doInit: function (component) {
		var action = component.get('c.getTaskComplete'),
			objectId = component.get('v.recordId');

		action.setParams({
			id: objectId
		});

		action.setCallback(this, function (data) {
			var taskComplete = data.getReturnValue()
			component.set('v.taskComplete', taskComplete);
			if (taskComplete) {
				component.set('v.show', false);
			} else {
				component.set('v.show', true);
			}
		});

		$A.enqueueAction(action);
	},

	handleClick: function (component, event, handler) {
		var action = component.get('c.generateData'),
			objectId = component.get('v.recordId'),
			stepEvent = $A.get('e.c:DataGeneratorStepEvent');

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
		$A.enqueueAction(action);
	},

	handleStepEvent: function (component, event, handler) {

		var status = event.getParam('status'),
			eventId = event.getParam('id'),
			objectId = component.get('v.recordId'),
			taskComplete = component.get('v.taskComplete');

		if (!taskComplete && eventId != null && eventId === objectId && status !== 'STARTED') {
			component.set('v.show', false);
		}

	}

})
