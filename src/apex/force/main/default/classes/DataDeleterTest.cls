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

@isTest(SeeAllData=false)
private class DataDeleterTest
{
    @isTest
    static void deleteData_deletesData()
    {
        //Given
		insertData();
        
        //When
        DataDeleter.deleteData();
        
        //Then
        assertNoCreatedDataInOrg();
    }
    
    private static void insertData()
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
		
		DeliveryRoute__c route = new DeliveryRoute__c(DeliveryPlan__c = plan.Id, Vehicle__c = vehicle.Id);
        insert route;

		DeliveryWaypoint__c waypoint = new DeliveryWaypoint__c(DeliveryRoute__c = route.Id, Order__c = order.Id, WaypointNumber__c = 1);
        insert waypoint;

		GenerateDataTask__c task = new GenerateDataTask__c();
		insert task;
    }
    
    private static void assertNoCreatedDataInOrg()
    {
        List<Vehicle__c> vehicles = (List<Vehicle__c>)[SELECT Id FROM Vehicle__c];
        List<VehicleType__c> types = (List<VehicleType__c>)[SELECT Id FROM VehicleType__c];
		List<DeliveryWaypoint__c> waypoints = (List<DeliveryWaypoint__c>)[SELECT Id FROM DeliveryWaypoint__c];
		List<DeliveryRoute__c> routes = (List<DeliveryRoute__c>)[SELECT Id FROM DeliveryRoute__c];
        List<DeliveryPlan__c> plans = (List<DeliveryPlan__c>)[SELECT Id FROM DeliveryPlan__c];
		List<Order> orders = (List<Order>)[SELECT Id FROM Order];
        List<Warehouse__c> warehouses = (List<Warehouse__c>)[SELECT Id FROM Warehouse__c];
        List<Contact> contact = (List<Contact>)[SELECT Id FROM Contact];
        List<Account> accounts = (List<Account>)[SELECT Id FROM Account];
		List<GenerateDataTask__c> tasks = (List<GenerateDataTask__c>)[SELECT Id FROM GenerateDataTask__c];

        System.assertEquals(0, vehicles.size());
        System.assertEquals(0, types.size());
		System.assertEquals(0, waypoints.size());
        System.assertEquals(0, routes.size());
		System.assertEquals(0, plans.size());
        System.assertEquals(0, orders.size());
        System.assertEquals(0, warehouses.size());
        System.assertEquals(0, contact.size());
		System.assertEquals(0, accounts.size());
		System.assertEquals(0, tasks.size());
    }
}