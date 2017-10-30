trigger DataGeneratorStepTrigger on DataGeneratorStep__e (after insert) {

	List<GenerateDataTask__c> tasks = new List<GenerateDataTask__c>();
	for (DataGeneratorStep__e event : Trigger.New) {

        if (event.Status__c == 'CREATED_ORDERS') {
            GenerateDataTask__c task = [SELECT Id, TaskComplete__c FROM GenerateDataTask__c WHERE Id=:event.SObjectId__c LIMIT 1];
            task.TaskComplete__c = true;
			tasks.add(task);
        }
   	}

	update tasks;
}