({
	handleStepEvent: function (component, event, helper) {
		var status = event.getParam('status');

		component.set('v.show', true);
		component.set('v.progress', status);
	}
});
