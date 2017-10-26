({
	handleClick: function (component, event, handler) {
		var action = component.get('c.generateData'),
			dataGeneratorStepEvent = $A.get("e.c:DataGeneratorStepEvent");

		component.set('v.show', false);

		dataGeneratorStepEvent.setParams({
			messages: '',
			severity: '',
			status: 'STARTED'
		});
		dataGeneratorStepEvent.fire();
		$A.enqueueAction(action);
	}
})
