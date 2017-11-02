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
private class DeliveryRouteMapChooserControllerTest
{
    @isTest
    static void getRoutes_withPlanId_callsSelector()
    {
        // Given
		Id planId = 'a009E000006Fi28';
		Set<Id> planIds = new Set<Id>{ planId };
		DeliveryRoute__c[] routes = new DeliveryRoute__c[]{
			new DeliveryRoute__c(Name = 'Route1', DeliveryPlan__c = planId),
			new DeliveryRoute__c(Name = 'Route2', DeliveryPlan__c = planId)
		};

		StubProvider mocks = new StubProvider();
        DeliveryRouteSelector mockSelector = (DeliveryRouteSelector) mocks.mock(DeliveryRouteSelector.class);
        DeliveryRouteSelector.instance = mockSelector;

        mocks.stub(mockSelector, 'selectByPlanIds', new Type[]{ Set<Id>.class }, new Object[]{ planIds }, routes);
        
        // When
        DeliveryRoute__c[] actual = DeliveryRouteMapChooserController.getRoutes(new List<Id>{ planId });
        
        // Then
        System.assertEquals(actual, routes);
    }  
}