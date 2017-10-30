/**
 * Copyright (c) 2017, FinancialForce.com, inc
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 *   are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 * - Neither the name of the FinancialForce.com, inc nor the names of its contributors
 *      may be used to endorse or promote products derived from this software without
 *      specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
 *  THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 *  OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 *  OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/

@isTest(SeeAllData=false)
private class DataGeneratorStepTriggerTest 
{
    @isTest static void dataGeneratorStepTrigger_shouldUpdateGenerateDataTask() 
	{
        GenerateDataTask__c task = new GenerateDataTask__c();
		insert task;
        DataGeneratorStep__e stepEvent = new DataGeneratorStep__e(SObjectId__c = task.Id, 
                                             Severity__c = 'Info', 
                                             Messages__c = 'Created Orders',
											 Status__c = 'CREATED_ORDERS');
        
        Test.startTest();
        
        Database.SaveResult sr = EventBus.publish(stepEvent);
            
        Test.stopTest();

        System.assertEquals(true, sr.isSuccess());
        
        GenerateDataTask__c updatedTask = [SELECT Id, TaskComplete__c FROM GenerateDataTask__c WHERE Id=:task.Id LIMIT 1];

        System.assertEquals(true, updatedTask.TaskComplete__c);
    }
    
    @isTest static void dataGeneratorStepTrigger_shouldNotUpdateGenerateDataTask() 
	{
        GenerateDataTask__c task = new GenerateDataTask__c();
		insert task;
        DataGeneratorStep__e stepEvent = new DataGeneratorStep__e(SObjectId__c = task.Id, 
                                             Severity__c = 'Info', 
                                             Messages__c = 'Start',
											 Status__c = 'STARTED');
        
        Test.startTest();
        
        Database.SaveResult sr = EventBus.publish(stepEvent);
            
        Test.stopTest();

        System.assertEquals(true, sr.isSuccess());
        
        GenerateDataTask__c updatedTask = [SELECT Id, TaskComplete__c FROM GenerateDataTask__c WHERE Id=:task.Id LIMIT 1];

        System.assertEquals(false, updatedTask.TaskComplete__c);
    }
}