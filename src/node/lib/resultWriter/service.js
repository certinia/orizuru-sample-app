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
	connection = require('../salesforce/connection'),
	writer = require('../salesforce/writer'),

	sendEvent = event => config => {

		event.eventType = 'RouteCalculationStep__e';
		event.id = config.incomingMessage.question.deliveryPlanId;

		return writer.sendPlatformEvent(config.conn, event)
			.then(() => config);

	},

	createRoutes = (results) => {

		const routes = results.incomingMessage.solution.routes;

		results.routes = _.map(routes, (route, i) => {
			return {
				Name: 'Route ' + (i + 1),
				['DeliveryPlan__c']: results.incomingMessage.question.deliveryPlanId,
				['Vehicle__c']: route.vehicleId
			};
		});

		return results;

	},

	writeRoutes = (results) => {

		const
			conn = results.conn,
			routes = results.routes;

		return writer.bulkCreateObject(conn, 'DeliveryRoute__c', routes)
			.then(sobjects => {
				results.savedRoutes = sobjects;
				return results;
			});

	},

	createAWayPoint = (deliveryRouteId, deliveryId, waypointNumber) => {
		return {
			Name: 'Waypoint ' + waypointNumber,
			['DeliveryRoute__c']: deliveryRouteId,
			['Order__c']: deliveryId,
			['WaypointNumber__c']: waypointNumber
		};
	},

	createWaypoints = (results) => {

		const
			solution = results.incomingMessage.solution,
			savedRoutes = results.savedRoutes;

		results.waypoints = _.flatten(_.map(solution.routes, (solutionRoute, index) => {
			return _.map(solutionRoute.actions, (action, i) => {
				return createAWayPoint(savedRoutes[index].id, action.serviceId, i + 1);
			});
		}));

		return results;

	},

	writeWaypoints = (results) => {

		const
			conn = results.conn,
			waypoints = results.waypoints;

		return writer.bulkCreateObject(conn, 'DeliveryWaypoint__c', waypoints)
			.then(sobjects => {
				results.savedWaypoints = sobjects;
				return results;
			});

	},

	writeResults = ({ context, message }) => {

		return connection.fromContext(context)
			.then(conn => ({ conn, incomingMessage: message }))
			.then(sendEvent({ message: 'Delivery Route(s) calculated', status: 'WRITING_DATA' }))
			.then(createRoutes)
			.then(writeRoutes)
			.then(createWaypoints)
			.then(writeWaypoints)
			.then(sendEvent({ message: 'Route(s) created', status: 'COMPLETED' }));
	};

module.exports = {
	writeResults
};
