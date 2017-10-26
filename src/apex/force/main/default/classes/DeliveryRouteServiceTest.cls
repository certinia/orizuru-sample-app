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
private class DeliveryRouteServiceTest
{
	@IsTest
	private static void generateUrl_shouldReturnTheUrl_whenThereIsADeliveryWaypoint()
	{
		//Given
		OrizuruSettings__c settings = new OrizuruSettings__c(GoogleMapsApiKey__c='testingApiKey');
		insert settings;

		String expected = 'https://www.google.com/maps/embed/v1/directions?key=' + settings.GoogleMapsApiKey__c + '&origin=5.000000000000000,5.000000000000000&destination=5.000000000000000,5.000000000000000&waypoints=1.000000000000000,1.000000000000000';
		
		Account account = new Account(Name = 'Account One');
		insert account;

		Contact[] contacts = new Contact[]{
			new Contact(FirstName = 'Contact', LastName = 'One', MailingLatitude = 1, MailingLongitude = 1),
			new Contact(FirstName = 'Contact', LastName = 'Two', MailingLatitude = 5, MailingLongitude = 5)
		};
		insert contacts;

		Warehouse__c warehouse = new Warehouse__c(Contact__c = contacts[1].Id);
		insert warehouse;

		VehicleType__c vehicleType = new VehicleType__c();
		insert vehicleType;

		Vehicle__c vehicle = new Vehicle__c(VehicleType__c = vehicleType.Id, Warehouse__c = warehouse.Id);
		insert vehicle;

		Order order = new Order(AccountId = account.Id, ShipToContactId = contacts[0].Id, EffectiveDate = Date.newInstance(2017, 10, 1), Status = 'Draft');
		insert order;

		DeliveryRoute__c deliveryRoute = new DeliveryRoute__c(Vehicle__c = vehicle.Id);
        insert deliveryRoute;

		DeliveryWaypoint__c waypoint = new DeliveryWaypoint__c(DeliveryRoute__c = deliveryRoute.Id, Order__c = order.Id, WaypointNumber__c = 1);
        insert waypoint;

		DeliveryRouteService service = DeliveryRouteService.newInstance();

		//When
		String actual = DeliveryRouteService.newInstance().generateUrl(deliveryRoute.Id);

		//Then
		System.assertEquals(expected, actual);
	}

	@IsTest
	private static void generateUrl_ShouldReturnTheUrl_WithMultipleDeliveries()
	{
		//Given
		OrizuruSettings__c settings = new OrizuruSettings__c(GoogleMapsApiKey__c='testingApiKey');
		insert settings;

		String expected = 'https://www.google.com/maps/embed/v1/directions?key=' + settings.GoogleMapsApiKey__c + '&origin=5.000000000000000,5.000000000000000&destination=5.000000000000000,5.000000000000000&waypoints=1.000000000000000,1.000000000000000|2.000000000000000,2.000000000000000|3.000000000000000,3.000000000000000';
		
		Account[] accounts = new Account[]{
			new Account(Name = 'Account One'),
			new Account(Name = 'Account Two'),
			new Account(Name = 'Account Three')
		};
		insert accounts;
		
		Contact[] contacts = new Contact[]{
			new Contact(FirstName = 'Contact', LastName = 'One', MailingLatitude = 1, MailingLongitude = 1),
			new Contact(FirstName = 'Contact', LastName = 'Two', MailingLatitude = 2, MailingLongitude = 2),
			new Contact(FirstName = 'Contact', LastName = 'Three', MailingLatitude = 3, MailingLongitude = 3),
			new Contact(FirstName = 'Contact', LastName = 'Four', MailingLatitude = 5, MailingLongitude = 5)
		};
		insert contacts;

		Warehouse__c warehouse = new Warehouse__c(Contact__c = contacts[3].Id);
		insert warehouse;

		VehicleType__c vehicleType = new VehicleType__c();
		insert vehicleType;

		Vehicle__c vehicle = new Vehicle__c(VehicleType__c = vehicleType.Id, Warehouse__c = warehouse.Id);
		insert vehicle;

		Order[] orders = new Order[]{
			new Order(AccountId = accounts[0].Id, ShipToContactId = contacts[0].Id, EffectiveDate = Date.newInstance(2017, 10, 1), Status = 'Draft'),
			new Order(AccountId = accounts[1].Id, ShipToContactId = contacts[1].Id, EffectiveDate = Date.newInstance(2017, 10, 1), Status = 'Draft'),
			new Order(AccountId = accounts[2].Id, ShipToContactId = contacts[2].Id, EffectiveDate = Date.newInstance(2017, 10, 1), Status = 'Draft')
		};
		insert orders;

		DeliveryRoute__c deliveryRoute = new DeliveryRoute__c(Vehicle__c = vehicle.Id);
        insert deliveryRoute;
		
		DeliveryWaypoint__c[] waypoints = new DeliveryWaypoint__c[]{
            new DeliveryWaypoint__c(DeliveryRoute__c = deliveryRoute.Id, Order__c = orders[0].Id, WaypointNumber__c = 1),
            new DeliveryWaypoint__c(DeliveryRoute__c = deliveryRoute.Id, Order__c = orders[1].Id, WaypointNumber__c = 2),
			new DeliveryWaypoint__c(DeliveryRoute__c = deliveryRoute.Id, Order__c = orders[2].Id, WaypointNumber__c = 3)
        };
        insert waypoints;

		DeliveryRouteService service = DeliveryRouteService.newInstance();

		//When
		String actual = DeliveryRouteService.newInstance().generateUrl(deliveryRoute.Id);

		//Then
		System.assertEquals(expected, actual);
	}
}