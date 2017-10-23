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

	getConnection = (context) => {
		return jsForceConnection.fromContext(context);
	},

	createRoutes = (message) => {
		const routes = message.solution.routes;

		return _.map(routes, (route, i) => {
			return {
				Name: 'Route ' + (i + 1),
				['Vehicle__c']: route.vehicleId
			};
		});
	},

	writeRoutes = (conn, routes) => {
		return sfWriter.bulkCreateObject(conn, 'DeliveryRoute__c', routes);
	},

	createAWayPoint = (deliveryRouteId, deliveryId, waypointNumber) => {
		return {
			Name: 'Waypoint ' + waypointNumber,
			['DeliveryRoute__c']: deliveryRouteId,
			['Order__c']: deliveryId,
			['WaypointNumber__c']: waypointNumber
		};
	},

	createWaypoints = (message, deliveryRoutes) => {
		return _.flatten(_.map(message.solution.routes, (solutionRoute, sobjectCount) => {
			return _.map(solutionRoute.actions, (action, i) => {
				return createAWayPoint(deliveryRoutes[sobjectCount].id, action.serviceId, i + 1);
			});
		}));
	},

	writeWaypoints = (conn, waypoints) => {
		return sfWriter.bulkCreateObject(conn, 'DeliveryWaypoint__c', waypoints);
	},

	writeResponse = (conn, message) => {
		return sfWriter.sendPlatformEvent('RouteCalculationStep__e', conn, 'Delivery Route(s) calculated', 'WRITING_DATA')
			.then(() => createRoutes(message))
			.then(routesToBeSaved => writeRoutes(conn, routesToBeSaved))
			.then(routeSobjects => createWaypoints(message, routeSobjects))
			.then(waypoints => writeWaypoints(conn, waypoints))
			.then(() => sfWriter.sendPlatformEvent('RouteCalculationStep__e', conn, 'Route(s) created', 'COMPLETED'));
	};

class Service {

	static writeResponse(message, context) {
		return getConnection(context)
			.then(conn => writeResponse(conn, message));
	}
}

module.exports = Service;
