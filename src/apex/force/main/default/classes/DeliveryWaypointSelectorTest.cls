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
private class DeliveryWaypointSelectorTest
{
	@IsTest
	private static void selectByDeliveryRouteIds_null_emptyList()
	{
		//Given
		DeliveryWaypoint__c[] expected = new DeliveryWaypoint__c[]{};
		DeliveryWaypointSelector selector = DeliveryWaypointSelector.newInstance();
		
		//When
		DeliveryWaypoint__c[] actual = selector.selectByDeliveryRouteIds(null);

		//Then
		System.assertEquals(expected, actual);
	}
    
    @IsTest
	private static void selectByDeliveryRouteIds_emptySet_emptyList()
	{
		//Given
		DeliveryWaypoint__c[] expected = new DeliveryWaypoint__c[]{};
		DeliveryWaypointSelector selector = DeliveryWaypointSelector.newInstance();
		
		//When
		DeliveryWaypoint__c[] actual = selector.selectByDeliveryRouteIds(new Set<Id>());

		//Then
		System.assertEquals(expected, actual);
	}
    
    @IsTest
	private static void selectByDeliveryRouteIds_setWithIdButNoResults_emptyList()
	{
		//Given
		DeliveryPlan__c plan = new DeliveryPlan__c();
		insert plan;
		DeliveryRoute__c parent = new DeliveryRoute__c(DeliveryPlan__c = plan.Id);
        insert parent;
		DeliveryWaypoint__c[] expected = new DeliveryWaypoint__c[]{};
		DeliveryWaypointSelector selector = DeliveryWaypointSelector.newInstance();
		
		//When
        DeliveryWaypoint__c[] actual = selector.selectByDeliveryRouteIds(new Set<Id>{
            parent.Id
        });

		//Then
		System.assertEquals(expected, actual);
	}
    
    @IsTest
	private static void selectByDeliveryRouteIds_setWithIdAndResults_resultsReturnedOrdered()
	{
		//Given
		Account[] accounts = new Account[]{
			new Account(Name = 'Account One'),
			new Account(Name = 'Account Two')
		};
		insert accounts;

		Contact[] contacts = new Contact[]{
			new Contact(FirstName = 'Contact', LastName = 'One', MailingLatitude = 1, MailingLongitude = 1),
			new Contact(FirstName = 'Contact', LastName = 'Two', MailingLatitude = 2, MailingLongitude = 2)
		};
		insert contacts;

		Order[] orders = new Order[]{
			new Order(AccountId = accounts[0].Id, ShipToContactId = contacts[0].Id, EffectiveDate = Date.newInstance(2017, 10, 1), Status = 'Draft'),
			new Order(AccountId = accounts[1].Id, ShipToContactId = contacts[1].Id, EffectiveDate = Date.newInstance(2017, 10, 1), Status = 'Draft')
		};
		insert orders;

		DeliveryPlan__c plan = new DeliveryPlan__c();
		insert plan;
		
		DeliveryRoute__c parent = new DeliveryRoute__c(DeliveryPlan__c = plan.Id);
        insert parent;

		DeliveryWaypoint__c[] expected = new DeliveryWaypoint__c[]{
            new DeliveryWaypoint__c(DeliveryRoute__c = parent.Id, Order__c = orders[0].Id, WaypointNumber__c = 0),
            new DeliveryWaypoint__c(DeliveryRoute__c = parent.Id, Order__c = orders[1].Id, WaypointNumber__c = 1)
        };
        insert expected;

		DeliveryWaypointSelector selector = DeliveryWaypointSelector.newInstance();
		
		//When
        DeliveryWaypoint__c[] actual = selector.selectByDeliveryRouteIds(new Set<Id>{
            parent.Id
        });

		//Then
		System.assertEquals(expected[0].DeliveryRoute__c, actual[0].DeliveryRoute__c);
		System.assertEquals(expected[1].DeliveryRoute__c, actual[1].DeliveryRoute__c);
	}
    
}