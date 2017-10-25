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
	root = require('app-root-path'),
	sinon = require('sinon'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),

	{ expect } = chai,

	resultWriterPath = root + '/src/node/lib/resultWriter',

	orizuru = require('@financialforcedev/orizuru'),
	orizuruTransportRabbitmq = require('@financialforcedev/orizuru-transport-rabbitmq'),

	incomingSchema = require(root + '/src/node/res/schema/answer'),

	service = require(root + '/src/node/lib/resultWriter/service'),

	sandbox = sinon.sandbox.create(),
	restore = sandbox.restore.bind(sandbox);

chai.use(sinonChai);

describe('resultWriter.js', () => {

	let handlerMock;

	beforeEach(() => {

		delete require.cache[require.resolve(resultWriterPath)];

		process.env.CLOUDAMQP_URL = 'cloudAmqpUrl';

		handlerMock = {
			handle: sandbox.stub().resolves()
		};

		sandbox.stub(orizuru, 'Handler').callsFake(function (config) {
			this.handle = handlerMock.handle;
		});

	});

	afterEach(() => {
		process.env.CLOUDAMQP_URL = 'cloudAmqpUrl';
		restore();
	});

	it('should wire up handler', () => {

		// given - when
		require(resultWriterPath);

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

	});

	describe('internal handler', () => {

		it('should call service', () => {

			// given
			sandbox.stub(service, 'writeResults').resolves('result');

			require(resultWriterPath);

			const
				handler = handlerMock.handle.getCall(0).args[0].callback,
				message = 'messageTest',
				context = 'contextTest';

			// when/then
			return handler({ message, context })
				.then(() => {
					expect(service.writeResults).to.have.been.calledOnce;
					expect(service.writeResults).to.have.been.calledWith(message, context);
				});

		});

	});

});
