({
	doInit: function (component) {

		var action = component.get('c.getTaskStatus'),
			objectId = component.get('v.recordId');

		action.setParams({
			id: objectId
		});

		action.setCallback(this, function (data) {
			var taskStatus = data.getReturnValue();

			if (taskStatus === 'CREATED_ORDERS') {
				component.set('v.taskComplete', true);
			}
			if (taskStatus !== 'NOT STARTED') {
				component.set('v.show', true);
				component.set('v.progress', taskStatus);
			}
		});

		$A.enqueueAction(action);

	},

	handleStepEvent: function (component, event, helper) {

		var status = event.getParam('status'),
			eventId = event.getParam('id'),
			objectId = component.get('v.recordId'),
			taskComplete = component.get('v.taskComplete');

		if (!taskComplete && eventId != null && eventId === objectId) {
			component.set('v.show', true);
			component.set('v.progress', status);

			if (status == 'CREATED_ORDERS') {
				window.setTimeout(() => {
					$A.get('e.force:refreshView').fire();
				}, 1000);
			}
		}

	}

});
