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
	sinon = require('sinon'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),

	expect = chai.expect,

	questionBuilderPath = '../lib/questionBuilder',

	orizuru = require('@financialforcedev/orizuru'),
	orizuruTransportRabbitmq = require('@financialforcedev/orizuru-transport-rabbitmq'),

	requireAvsc = require('../lib/util/requireAvsc'),

	QuestionBuilderService = require('../lib/questionBuilder/service'),
	incomingSchema = requireAvsc(__dirname, '../res/schema/public/calculateRoutesForPlan'),
	outgoingSchema = requireAvsc(__dirname, '../res/schema/question');

chai.use(sinonChai);

describe('questionBuilder.js', () => {

	let handlerMock, publisherMock;

	beforeEach(() => {

		delete require.cache[require.resolve(questionBuilderPath)];

		process.env.CLOUDAMQP_URL = 'cloudAmqpUrl';

		handlerMock = {
			handle: sinon.stub().resolves()
		};

		publisherMock = {
			publish: sinon.stub().resolves()
		};

		sinon.stub(orizuru, 'Handler').callsFake(function (config) {
			this.handle = handlerMock.handle;
		});

		sinon.stub(orizuru, 'Publisher').callsFake(function (config) {
			this.publish = publisherMock.publish;
		});

	});

	afterEach(() => {
		process.env.CLOUDAMQP_URL = 'cloudAmqpUrl';
		sinon.restore();
	});

	it('should wire up handler', () => {

		// given - when
		require(questionBuilderPath);

		// then
		expect(orizuru.Handler).to.have.been.calledOnce;
		expect(orizuru.Handler).to.have.been.calledWithNew;
		expect(orizuru.Handler).to.have.been.calledWith({
			transport: orizuruTransportRabbitmq,
			transportConfig: {
				cloudamqpUrl: 'cloudAmqpUrl'
			}
		});
		expect(handlerMock.handle).to.have.been.calledOnce;
		expect(handlerMock.handle).to.have.been.calledWith({
			schema: incomingSchema,
			callback: sinon.match.func
		});
		expect(orizuru.Publisher).to.have.been.calledOnce;
		expect(orizuru.Publisher).to.have.been.calledWithNew;
		expect(orizuru.Publisher).to.have.been.calledWith({
			transport: orizuruTransportRabbitmq,
			transportConfig: {
				cloudamqpUrl: 'cloudAmqpUrl'
			}
		});

	});

	describe('internal handler', () => {

		let handler;

		beforeEach(() => {
			sinon.stub(QuestionBuilderService, 'buildQuestion').resolves('result');
			require(questionBuilderPath);
			handler = handlerMock.handle.getCall(0).args[0].callback;
		});

		it('should call service and publish result on event', () => {

			// given
			const
				context = 'contextTest',
				message = 'messageTest';

			// when
			return handler({ context, message })
				.then(() => {
					// then
					expect(QuestionBuilderService.buildQuestion).to.have.been.calledOnce;
					expect(QuestionBuilderService.buildQuestion).to.have.been.calledWith({ context, message });

					expect(publisherMock.publish).to.have.been.calledOnce;
					expect(publisherMock.publish).to.have.been.calledWith({
						message: 'result',
						schema: outgoingSchema,
						context
					});
				});

		});

	});

});
