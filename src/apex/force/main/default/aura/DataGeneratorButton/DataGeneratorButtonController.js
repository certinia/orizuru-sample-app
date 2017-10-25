({
	handleClick: function (component, event, handler) {
		var action = component.get('c.generateData');

		component.set('v.show', false);

		$A.enqueueAction(action);
	},

	handleStepEvent: function (component, event, handler) {
		var status = event.getParam('status');
		if (status != 'STARTED') {
			component.set('v.show', false);
		}
	}
})
