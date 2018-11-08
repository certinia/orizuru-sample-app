trigger RouteCalculationStepTrigger on RouteCalculationStep__e (after insert) {

	List<DeliveryPlan__c> plans = new List<DeliveryPlan__c>();
	for (RouteCalculationStep__e event : Trigger.New) {
		DeliveryPlan__c plan = [SELECT Id, PlanStatus__c FROM DeliveryPlan__c WHERE Id=:event.SObjectId__c LIMIT 1];
		
		if (plan.PlanStatus__c != 'COMPLETED') {
			plan.PlanStatus__c = event.Status__c;
			plans.add(plan);
		}
   	}

	update plans;
}