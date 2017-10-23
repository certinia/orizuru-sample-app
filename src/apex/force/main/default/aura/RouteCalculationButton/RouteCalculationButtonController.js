({
	handleClick: function (component, event, handler) {
		var action = component.get('c.calculateRoute'),
			routeCalculationStepEvent = $A.get("e.c:RouteCalculationStepEvent");

		component.set('v.show', false);

		routeCalculationStepEvent.setParams({
			messages: '',
			severity: '',
			status: 'STARTED'
		});
		routeCalculationStepEvent.fire();

		action.setCallback(this, function (data) {
			console.log('called calculateRoute: ' + data.getReturnValue());
		});
		$A.enqueueAction(action);
	}
})
