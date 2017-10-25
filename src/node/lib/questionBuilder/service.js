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

'use strict';

const
	_ = require('lodash'),
	jsForceConnection = require('../shared/jsForceConnection'),
	sfWriter = require('../shared/sfWriter'),

	vehicleQuery = 'SELECT Id, VehicleType__c, Warehouse__r.Contact__r.MailingLatitude, Warehouse__r.Contact__r.MailingLongitude FROM Vehicle__c',
	typeQuery = 'SELECT Id, MaximumPayloadCapacity__c, Distance__c, Fixed__c, Time__c from VehicleType__c',
	orderQuery = 'SELECT Id, Weight__c, ShipToContact.MailingLatitude, ShipToContact.MailingLongitude FROM Order',

	sendEvent = event => config => {

		event.eventType = 'RouteCalculationStep__e';
		event.id = config.incomingMessage.deliveryPlanId;

		return sfWriter.sendPlatformEvent(config.conn, event)
			.then(() => config);

	},

	runQueries = (results) => {

		const
			conn = results.conn,
			incomingMessage = results.incomingMessage,
			queries = [
				conn.query(vehicleQuery),
				conn.query(typeQuery),
				conn.query(orderQuery)
			];

		return Promise.all(queries)
			.then(([vehicles, types, orders]) => {
				results.vehicles = vehicles;
				results.types = types;
				results.orders = orders;
				results.question = { deliveryPlanId: incomingMessage.deliveryPlanId };
				return results;
			});

	},

	mapVehicles = (results) => {

		results.question.vehicles = _.map(results.vehicles.records, vehicle => {
			return {
				id: vehicle.Id,
				typeId: vehicle.VehicleType__c,
				location: {
					lat: vehicle.Warehouse__r.Contact__r.MailingLatitude,
					lng: vehicle.Warehouse__r.Contact__r.MailingLongitude
				}
			};
		});

		return results;

	},

	mapVehicleTypes = (results) => {

		results.question.vehicleTypes = _.map(results.types.records, type => {
			return {
				id: type.Id,
				capacity: type.MaximumPayloadCapacity__c,
				costs: {
					fixed: type.Fixed__c,
					distance: type.Distance__c,
					time: type.Time__c
				}
			};
		});

		return results;

	},

	mapOrders = (results) => {

		results.question.deliveries = _.map(results.orders.records, order => {
			return {
				id: order.Id,
				type: 'Delivery', //delivery.Type__c,
				location: {
					lat: order.ShipToContact.MailingLatitude,
					lng: order.ShipToContact.MailingLongitude
				},
				capacity: 1 //order.Weight__c
			};
		});

		return results;

	},

	returnQuestion = ({ question }) => question,

	buildQuestion = ({ context, incomingMessage }) => {
		return jsForceConnection.fromContext(context)
			.then(conn => ({ conn, incomingMessage }))
			.then(sendEvent({ message: 'Retrieving delivery records', status: 'READING_DATA' }))
			.then(runQueries)
			.then(mapVehicles)
			.then(mapVehicleTypes)
			.then(mapOrders)
			.then(sendEvent({ message: 'Delivery records retrieved', status: 'CALCULATING_ROUTES' }))
			.then(returnQuestion);
	};

module.exports = {
	buildQuestion
};
