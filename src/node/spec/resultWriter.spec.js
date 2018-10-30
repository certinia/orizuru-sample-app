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
	sinon = require('sinon'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),

	expect = chai.expect,

	resultWriterPath = '../lib/resultWriter',

	orizuru = require('@financialforcedev/orizuru'),
	transport = require('@financialforcedev/orizuru-transport-rabbitmq'),

	requireAvsc = require('../lib/util/requireAvsc'),

	incomingSchema = requireAvsc(__dirname, '../res/schema/answer');

chai.use(sinonChai);

describe('resultWriter', () => {

	let handlerStubInstance, transportStubInstance;

	beforeEach(() => {

		delete require.cache[require.resolve(resultWriterPath)];

		process.env.CLOUDAMQP_URL = 'cloudAmqpUrl';

		transportStubInstance = sinon.createStubInstance(transport.Transport);
		sinon.stub(transport, 'Transport').returns(transportStubInstance);

		handlerStubInstance = sinon.createStubInstance(orizuru.Handler);
		handlerStubInstance.on.returnsThis();
		handlerStubInstance.init.resolves(handlerStubInstance);
		sinon.stub(orizuru, 'Handler').returns(handlerStubInstance);

	});

	afterEach(() => {
		process.env.CLOUDAMQP_URL = 'cloudAmqpUrl';
		sinon.restore();
	});

	it('should wire up handler', async () => {

		// Given
		// When
		await require(resultWriterPath);

		// Then
		expect(transport.Transport).to.have.been.calledOnce;
		expect(transport.Transport).to.have.been.calledWithNew;
		expect(transport.Transport).to.have.been.calledWithExactly({
			url: 'cloudAmqpUrl'
		});
		expect(orizuru.Handler).to.have.been.calledOnce;
		expect(orizuru.Handler).to.have.been.calledWithNew;
		expect(orizuru.Handler).to.have.been.calledWithExactly({
			transport: transportStubInstance
		});
		expect(handlerStubInstance.init).to.have.been.calledOnce;
		expect(handlerStubInstance.init).to.have.been.calledWithExactly();
		expect(handlerStubInstance.handle).to.have.been.calledOnce;
		expect(handlerStubInstance.handle).to.have.been.calledWithExactly({
			schema: incomingSchema,
			handler: sinon.match.func
		});

	});

});
