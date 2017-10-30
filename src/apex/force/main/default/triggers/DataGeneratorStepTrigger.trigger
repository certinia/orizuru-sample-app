trigger DataGeneratorStepTrigger on DataGeneratorStep__e (after insert) {

	List<GenerateDataTask__c> tasks = new List<GenerateDataTask__c>();
	for (DataGeneratorStep__e event : Trigger.New) {
		GenerateDataTask__c task = [SELECT Id, TaskStatus__c FROM GenerateDataTask__c WHERE Id=:event.SObjectId__c LIMIT 1];
		
		if (task.TaskStatus__c != 'CREATED_ORDERS') {
			task.TaskStatus__c = event.Status__c;
			tasks.add(task);
		}
   	}

	update tasks;
}