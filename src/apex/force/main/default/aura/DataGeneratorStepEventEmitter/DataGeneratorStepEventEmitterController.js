({
	handleIncomingStreamingMessage: function (component, event, helper) {
		var stepEvent = $A.get('e.c:DataGeneratorStepEvent'),
			payload = event.getParam('payload');

		stepEvent.setParams({
			messages: payload.Messages__c,
			severity: payload.Severity__c,
			status: payload.Status__c
		});
		stepEvent.fire();
	}
})
