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
	chai = require('chai'),
	root = require('app-root-path'),
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	chaiAsPromised = require('chai-as-promised'),
	service = require(root + '/src/node/lib/resultWriter/service'),
	jsForceConnection = require(root + '/src/node/lib/shared/jsForceConnection'),
	sfWriter = require(root + '/src/node/lib/shared/sfWriter'),

	expect = chai.expect,

	sandbox = sinon.sandbox.create();

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('resultWriter/service.js', () => {

	afterEach(() => {
		sandbox.restore();
	});

	it('should call the appropriate methods when writing a successful response', () => {

		// given
		const
			conn = sandbox.stub(),
			expectedInput = {
				conn,
				incomingMessage: {
					deliveryPlanId: 'testId',
					solution: {
						routes: [{
							vehicleId: 'V1',
							actions: [{
								serviceId: 'S1'
							}, {
								serviceId: 'S2'
							}]
						}, {
							vehicleId: 'V2',
							actions: [{
								serviceId: 'S3'
							}, {
								serviceId: 'S4'
							}]
						}]
					}
				}
			},
			expectedWaypoints = [{
				Name: 'Waypoint 1',
				['DeliveryRoute__c']: 'myFakeId',
				['Order__c']: 'S1',
				['WaypointNumber__c']: 1
			}, {
				Name: 'Waypoint 2',
				['DeliveryRoute__c']: 'myFakeId',
				['Order__c']: 'S2',
				['WaypointNumber__c']: 2
			}, {
				Name: 'Waypoint 1',
				['DeliveryRoute__c']: 'anotherFakeId',
				['Order__c']: 'S3',
				['WaypointNumber__c']: 1
			}, {
				Name: 'Waypoint 2',
				['DeliveryRoute__c']: 'anotherFakeId',
				['Order__c']: 'S4',
				['WaypointNumber__c']: 2
			}],
			expectedRoutes = [{
				Name: 'Route 1',
				['Vehicle__c']: 'V1'
			}, {
				Name: 'Route 2',
				['Vehicle__c']: 'V2'
			}],
			expectedWritingPlatformEvent = {
				eventType: 'RouteCalculationStep__e',
				id: 'testId',
				message: 'Delivery Route(s) calculated',
				status: 'WRITING_DATA'
			},
			expectedCompletedPlatformEvent = {
				eventType: 'RouteCalculationStep__e',
				id: 'testId',
				message: 'Route(s) created',
				status: 'COMPLETED'
			};

		sandbox.stub(jsForceConnection, 'fromContext').resolves(conn);
		sandbox.stub(sfWriter, 'sendPlatformEvent').resolves();
		sandbox.stub(sfWriter, 'bulkCreateObject').resolves([{ id: 'myFakeId' }, { id: 'anotherFakeId' }]);

		// when / then
		return expect(service.writeResults(expectedInput))
			.to.eventually.be.fulfilled
			.then(() => {
				expect(sfWriter.bulkCreateObject).to.have.been.calledTwice;
				expect(sfWriter.bulkCreateObject).to.have.been.calledWith(conn, 'DeliveryRoute__c', expectedRoutes);
				expect(sfWriter.bulkCreateObject).to.have.been.calledWith(conn, 'DeliveryWaypoint__c', expectedWaypoints);
				expect(sfWriter.sendPlatformEvent).to.have.been.calledTwice;
				expect(sfWriter.sendPlatformEvent).to.have.been.calledWith(conn, expectedWritingPlatformEvent);
				expect(sfWriter.sendPlatformEvent).to.have.been.calledWith(conn, expectedCompletedPlatformEvent);
			});

	});

});
