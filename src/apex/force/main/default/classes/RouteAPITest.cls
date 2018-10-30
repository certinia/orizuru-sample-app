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
 */

@isTest(seeAllData=false)
public class RouteAPITest {

	@isTest
	private static void saveRoutes_null_exception()
   	{
		// Given
		List<DeliveryRoute__c> routesToSave = null;

		// When
		try
		{
			List<DeliveryRoute__c> response = RouteAPI.saveRoutes(routesToSave);
			System.assert(false, 'Expected exception');
		}
		catch(Exception ex)
		{
		}
   	}

	@isTest
	private static void saveRoutes_inValidRoutes_exception()
    {   
		// Given
		List<DeliveryRoute__c> routesToSave = ceateRoutesToSave();

		routesToSave.get(1).DeliveryPlan__c = null;

		// When
		try
		{
			List<DeliveryRoute__c> response = RouteAPI.saveRoutes(routesToSave);
			System.assert(false, 'Expected exception');
		}
		catch(Exception ex)
		{
		}
    }

	@isTest
	private static void saveRoutes_validRoutes_Saves()
    {
	   	//Given
		List<DeliveryRoute__c> routesToSave = ceateRoutesToSave();

		//when
		List<DeliveryRoute__c> response = RouteAPI.saveRoutes(routesToSave);

		//Then
		assertEquals(routesToSave, response);
    }

	private static void assertEquals(List<DeliveryRoute__c> expected, List<DeliveryRoute__c> actual)
	{
		System.assertEquals(expected.size(), actual.size());

		for(Integer count = 0; count< expected.size(); count++)
		{
			assertEquals(expected.get(count), actual.get(count));
		}
	}

	private static void assertEquals(DeliveryRoute__c expected, DeliveryRoute__c actual)
	{
		System.assertEquals(expected.DeliveryPlan__c, actual.DeliveryPlan__c);
		System.assertEquals(expected.Driver__c, actual.Driver__c);
		System.assertEquals(expected.URL__c, actual.URL__c);
		System.assertEquals(expected.Vehicle__c, actual.Vehicle__c);
	}

	private static List<DeliveryRoute__c> ceateRoutesToSave()
	{
		Account account = new Account(Name='Account One');
		insert account;

        Contact contact = new Contact(FirstName = 'Contact', LastName = 'One', MailingLatitude = 1, MailingLongitude = 1);
		insert contact;
        
        Warehouse__c warehouse = new Warehouse__c(Contact__c = contact.Id);
		insert warehouse;
        
        VehicleType__c vtype = new VehicleType__c(name ='test');
		insert vtype;
        
        Vehicle__c vehicle = new Vehicle__c(VehicleType__c = vtype.id, Warehouse__c = warehouse.id);
        insert vehicle;

		DeliveryPlan__c plan = new DeliveryPlan__c();
		insert plan;
		
		List<DeliveryRoute__c> routes = new List<DeliveryRoute__c>();
		routes.add(new DeliveryRoute__c(DeliveryPlan__c = plan.Id, URL__c ='Test', Vehicle__c = vehicle.Id));
		routes.add(new DeliveryRoute__c(DeliveryPlan__c = plan.Id, URL__c ='Test', Vehicle__c = vehicle.Id));
		routes.add(new DeliveryRoute__c(DeliveryPlan__c = plan.Id, URL__c ='Test', Vehicle__c = vehicle.Id));

		return routes;

	/*	List<DeliveryWaypoint__c> waypoints = new List<DeliveryWaypoint__c>();
		for(Integer count = 0; count < 5; count++)
		{
			waypoints.add(new DeliveryWaypoint__c(DeliveryRoute__c = route.Id, Order__c = order.Id, WaypointNumber__c = count));
		}
		insert waypoints;*/
	}
}
