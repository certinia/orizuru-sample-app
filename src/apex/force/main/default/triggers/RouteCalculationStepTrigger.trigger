trigger RouteCalculationStepTrigger on RouteCalculationStep__e (after insert) {

	List<DeliveryPlan__c> plans = new List<DeliveryPlan__c>();
	for (RouteCalculationStep__e event : Trigger.New) {

        if (event.Status__c == 'COMPLETED') {
            DeliveryPlan__c plan = [SELECT Id, PlanComplete__c FROM DeliveryPlan__c WHERE Id=:event.SObjectId__c LIMIT 1];
            plan.PlanComplete__c = true;
			plans.add(plan);
        }
   	}

	update plans;
}