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
'use strict';

const
	chai = require('chai'),
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),

	expect = chai.expect,

	buildQuestion = require('../../lib/handler/questionBuilder'),

	connection = require('../../lib/service/salesforce/connection'),
	reader = require('../../lib/service/salesforce/reader'),
	writer = require('../../lib/service/salesforce/writer'),

	vehicleQuery = require('./questionBuilder/vehicleQuery.json'),
	vehicleTypeQuery = require('./questionBuilder/vehicleTypeQuery.json'),
	orderQuery = require('./questionBuilder/orderQuery.json'),
	convertedResult = require('./questionBuilder/result.json');

chai.use(sinonChai);

describe('questionBuilder/service.js', () => {

	let mocks;

	afterEach(() => {
		sinon.restore();
	});

	describe('executeQuery', () => {

		beforeEach(() => {

			mocks = {
				queries: [
					'SELECT Id, VehicleType__c, Warehouse__r.Contact__r.MailingLatitude, Warehouse__r.Contact__r.MailingLongitude FROM Vehicle__c',
					'SELECT Id, MaximumPayloadCapacity__c, Distance__c, Fixed__c, Time__c from VehicleType__c',
					'SELECT Id, Weight__c, ShipToContact.MailingLatitude, ShipToContact.MailingLongitude FROM Order'
				],
				queryResult: {},
				expectedResult: {
					deliveryPlanId: 'testPlanId',
					vehicles: [],
					vehicleTypes: [],
					deliveries: []
				}
			};

			mocks.conn = sinon.stub();

			sinon.stub(connection, 'fromContext').resolves(mocks.conn);
			sinon.stub(reader, 'query').resolves();
			sinon.stub(writer, 'createObject').resolves();
			sinon.stub(writer, 'sendPlatformEvent').resolves();

		});

		describe('resolve', () => {

			it('should return a question', async () => {

				// Given
				const expectedInput = {
					message: {
						deliveryPlanId: 'testPlanId'
					}
				};

				reader.query.resolves(mocks.queryResult);

				// When
				const result = await buildQuestion(expectedInput);

				// Then
				expect(result).to.eql(mocks.expectedResult);
				expect(writer.sendPlatformEvent).to.be.calledTwice;
				expect(reader.query).to.be.calledThrice;

			});

			it('should convert the query result correctly', async () => {

				// Given
				const
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

				reader.query.withArgs({ conn: mocks.conn, query: mocks.queries[0] }).resolves(vehicleQuery);
				reader.query.withArgs({ conn: mocks.conn, query: mocks.queries[1] }).resolves(vehicleTypeQuery);
				reader.query.withArgs({ conn: mocks.conn, query: mocks.queries[2] }).resolves(orderQuery);

				// When
				const result = await buildQuestion(expectedInput);

				// Then
				expect(result).to.eql(convertedResult);
				expect(reader.query).to.be.calledWith({ conn: mocks.conn, query: mocks.queries[0] });
				expect(reader.query).to.be.calledWith({ conn: mocks.conn, query: mocks.queries[1] });
				expect(reader.query).to.be.calledWith({ conn: mocks.conn, query: mocks.queries[2] });
				expect(writer.sendPlatformEvent).to.have.been.calledTwice;
				expect(writer.sendPlatformEvent).to.have.been.calledWith(mocks.conn, expectedReadPlatformEvent);
				expect(writer.sendPlatformEvent).to.have.been.calledWith(mocks.conn, expectedCalculatePlatformEvent);

			});

		});

	});

});
