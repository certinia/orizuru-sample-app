/**
 * Copyright (c) 2017-2018, FinancialForce.com, inc
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

@isTest(seeAllData=false)
public class WaypointAPITest {

	@isTest
	private static void saveWaypoints_null_exception()
   	{
		// Given
		List<DeliveryWaypoint__c> routesToSave = null;

		// When
		try
		{
			List<DeliveryWaypoint__c> response = WaypointAPI.saveWaypoints(routesToSave);
			System.assert(false, 'Expected exception');
		}
		catch(Exception ex)
		{
		}
   	}

	@isTest
	private static void saveWaypoints_validWaypoints_Saves()
    {
	   	//Given
		List<DeliveryWaypoint__c> routesToSave = ceateWaypointsToSave();

		//when
		List<DeliveryWaypoint__c> response = WaypointAPI.saveWaypoints(routesToSave);

		//Then
		assertEquals(routesToSave, response);
    }

	private static void assertEquals(List<DeliveryWaypoint__c> expected, List<DeliveryWaypoint__c> actual)
	{
		System.assertEquals(expected.size(), actual.size());

		for(Integer count = 0; count< expected.size(); count++)
		{
			assertEquals(expected.get(count), actual.get(count));
		}
	}

	private static void assertEquals(DeliveryWaypoint__c expected, DeliveryWaypoint__c actual)
	{
		System.assertEquals(expected.DeliveryRoute__c, actual.DeliveryRoute__c);
		System.assertEquals(expected.ContactName__c, actual.ContactName__c);
		System.assertEquals(expected.Order__c, actual.Order__c);
		System.assertEquals(expected.WaypointNumber__c, actual.WaypointNumber__c);
	}

	private static List<DeliveryWaypoint__c> ceateWaypointsToSave()
	{
		Account account = new Account(Name='Account One');
		insert account;

        Contact contact = new Contact(FirstName = 'Contact', LastName = 'One', MailingLatitude = 1, MailingLongitude = 1);
		insert contact;
        
        Warehouse__c warehouse = new Warehouse__c(Contact__c = contact.Id);
		insert warehouse;     
    
        Order order = new Order(AccountId = account.Id, ShipToContactId = contact.Id, EffectiveDate = Date.newInstance(2017, 10, 1), Status = 'Draft');
        insert order;  

        VehicleType__c vtype = new VehicleType__c(name ='test');
		insert vtype;
        
        Vehicle__c vehicle = new Vehicle__c(VehicleType__c = vtype.id, Warehouse__c = warehouse.id);
        insert vehicle;

		DeliveryPlan__c plan = new DeliveryPlan__c();
		insert plan;
		
		DeliveryRoute__c route = new DeliveryRoute__c(DeliveryPlan__c = plan.Id, URL__c ='Test', Vehicle__c = vehicle.Id);
		insert route;

		List<DeliveryWaypoint__c> waypoints = new List<DeliveryWaypoint__c>();
		for(Integer count = 0; count < 5; count++)
		{
			waypoints.add(new DeliveryWaypoint__c(DeliveryRoute__c = route.Id, Order__c = order.Id, WaypointNumber__c = count));
		}
		return waypoints;
	}
}

