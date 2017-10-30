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
	chaiAsPromised = require('chai-as-promised'),
	root = require('app-root-path'),
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),

	expect = chai.expect,

	sandbox = sinon.sandbox.create(),

	jsForceConnection = require(root + '/src/node/lib/shared/jsForceConnection'),
	sfWriter = require(root + '/src/node/lib/shared/sfWriter'),
	service = require(root + '/src/node/lib/questionBuilder/service'),
	vehicleQuery = require(root + '/src/node/res/spec/questionBuilder/vehicleQuery.json'),
	vehicleTypeQuery = require(root + '/src/node/res/spec/questionBuilder/vehicleTypeQuery.json'),
	orderQuery = require(root + '/src/node/res/spec/questionBuilder/orderQuery.json'),
	convertedResult = require(root + '/src/node/res/spec/questionBuilder/result.json');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('questionBuilder/service.js', () => {

	afterEach(() => {
		sandbox.restore();
	});

	describe('executeQuery', () => {

		const context = {},
			queries = [
				'SELECT Id, VehicleType__c, Warehouse__r.Contact__r.MailingLatitude, Warehouse__r.Contact__r.MailingLongitude FROM Vehicle__c',
				'SELECT Id, MaximumPayloadCapacity__c, Distance__c, Fixed__c, Time__c from VehicleType__c',
				'SELECT Id, Weight__c, ShipToContact.MailingLatitude, ShipToContact.MailingLongitude FROM Order'
			],
			queryResult = {},
			expectedResult = {
				deliveryPlanId: 'testPlanId',
				vehicles: [],
				vehicleTypes: [],
				deliveries: []
			};

		beforeEach(() => {
			context.conn = sandbox.stub();
			context.conn.query = sandbox.stub();

			sandbox.stub(jsForceConnection, 'fromContext').resolves(context.conn);
			sandbox.stub(sfWriter, 'createObject').resolves(sandbox.stub());
			sandbox.stub(sfWriter, 'sendPlatformEvent').resolves(sandbox.stub());
		});

		describe('resolve', () => {

			it('should return a question', () => {

				// given
				const expectedInput = {
					message: {
						deliveryPlanId: 'testPlanId'
					}
				};

				context.conn.query.resolves(queryResult);

				// when - then
				return expect(service.buildQuestion(expectedInput))
					.to.eventually.eql(expectedResult)
					.then(() => {
						expect(sfWriter.sendPlatformEvent).to.be.calledTwice;
						expect(context.conn.query).to.be.calledThrice;
					});

			});

			it('should convert the query result correctly', () => {

				// given
				const
					query = context.conn.query,
					expectedInput = {
						message: {
							deliveryPlanId: 'testPlanId'
						}
					},
					expectedReadPlatformEvent = {
						eventType: 'RouteCalculationStep__e',
						id: 'testPlanId',
						message: 'Retrieving delivery records',
						status: 'READING_DATA'
					},
					expectedCalculatePlatformEvent = {
						eventType: 'RouteCalculationStep__e',
						id: 'testPlanId',
						message: 'Delivery records retrieved',
						status: 'CALCULATING_ROUTES'
					};

				query.withArgs(queries[0]).resolves(vehicleQuery);
				query.withArgs(queries[1]).resolves(vehicleTypeQuery);
				query.withArgs(queries[2]).resolves(orderQuery);

				// when - then
				return expect(service.buildQuestion(expectedInput))
					.to.eventually.eql(convertedResult)
					.then(() => {
						expect(query).to.be.calledWith(queries[0]);
						expect(query).to.be.calledWith(queries[1]);
						expect(query).to.be.calledWith(queries[2]);
						expect(sfWriter.sendPlatformEvent).to.have.been.calledTwice;
						expect(sfWriter.sendPlatformEvent).to.have.been.calledWith(context.conn, expectedReadPlatformEvent);
						expect(sfWriter.sendPlatformEvent).to.have.been.calledWith(context.conn, expectedCalculatePlatformEvent);
					});

			});
		});

	});
});
