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

	schemas = require('../lib/boilerplate/schema/worker'),
	handlers = require('../lib/boilerplate/handler'),
	read = require('../lib/boilerplate/read'),

	orizuru = require('@financialforcedev/orizuru'),
	transport = require('@financialforcedev/orizuru-transport-rabbitmq');

chai.use(sinonChai);

describe('worker.js', () => {

	let transportStubInstance, handlerStubInstance;

	beforeEach(() => {

		transportStubInstance = sinon.createStubInstance(transport.Transport);
		sinon.stub(transport, 'Transport').returns(transportStubInstance);

		handlerStubInstance = sinon.createStubInstance(orizuru.Handler);
		handlerStubInstance.init.resolves();
		handlerStubInstance.on.returnsThis();
		handlerStubInstance.handle.returns({});
		sinon.stub(orizuru, 'Handler').returns(handlerStubInstance);

		sinon.stub(handlers, 'getHandlers');
		sinon.stub(handlers, 'publishHandler');
		sinon.stub(schemas, 'getSchemas');
		sinon.stub(read, 'readHandler');
		sinon.stub(read, 'readSchema');

	});

	afterEach(() => {
		delete process.env.CLOUDAMQP_URL;
		delete require.cache[require.resolve('../lib/worker')];
		sinon.restore();
	});

	describe('should create an orizuru handler', () => {

		beforeEach(() => {

			schemas.getSchemas.returns({
				test1: {
					incoming: 'api/test1_incoming.avsc',
					outgoing: 'api/test1_outgoing.avsc'
				},
				test2: {
					incoming: 'api/test2_incoming.avsc'
				}
			});

			read.readSchema
				.withArgs('api/test1_incoming.avsc').returns({ name: 'api.test1.incoming' })
				.withArgs('api/test1_outgoing.avsc').returns({ name: 'api.test1.outgoing' })
				.withArgs('api/test2_incoming.avsc').returns({ name: 'api.test2.incoming' });

			handlers.getHandlers.returns({
				test1: 'api/test1.js',
				test2: 'api/test2.js'
			});

			handlers.publishHandler.returns({
				name: 'api.test1.outgoing.handler.wrapped'
			});

			read.readHandler
				.withArgs('api/test1.js').returns({ name: 'api.test1.incoming.handler' })
				.withArgs('api/test2.js').returns({ name: 'api.test2.outgoing.handler' });

		});

		it('with the default options', async () => {

			// Given
			// When
			await require('../lib/worker');

			// Then
			expect(transport.Transport).to.have.been.calledOnce;
			expect(transport.Transport).to.have.been.calledWithNew;
			expect(transport.Transport).to.have.been.calledWithExactly({
				url: 'amqp://localhost'
			});

			expect(orizuru.Handler).to.have.been.calledOnce;
			expect(orizuru.Handler).to.have.been.calledWithNew;
			expect(orizuru.Handler).to.have.been.calledWith({ transport: transportStubInstance });

			expect(handlerStubInstance.handle).to.have.been.calledTwice;
			expect(handlerStubInstance.handle).to.have.been.calledWith({
				handler: { name: 'api.test1.outgoing.handler.wrapped' },
				schema: { name: 'api.test1.incoming' }
			});
			expect(handlerStubInstance.handle).to.have.been.calledWith({
				handler: { name: 'api.test2.outgoing.handler' },
				schema: { name: 'api.test2.incoming' }
			});

		});

		it('should create an orizuru handler with the specified options', async () => {

			// Given
			process.env.CLOUDAMQP_URL = 'testCloudAmqpUrl';

			// When
			await require('../lib/worker');

			// Then
			expect(transport.Transport).to.have.been.calledOnce;
			expect(transport.Transport).to.have.been.calledWithNew;
			expect(transport.Transport).to.have.been.calledWithExactly({
				url: 'testCloudAmqpUrl'
			});

			expect(orizuru.Handler).to.have.been.calledOnce;
			expect(orizuru.Handler).to.have.been.calledWithNew;
			expect(orizuru.Handler).to.have.been.calledWith({ transport: transportStubInstance });

			expect(handlerStubInstance.handle).to.have.been.calledTwice;
			expect(handlerStubInstance.handle).to.have.been.calledWith({
				handler: { name: 'api.test1.outgoing.handler.wrapped' },
				schema: { name: 'api.test1.incoming' }
			});
			expect(handlerStubInstance.handle).to.have.been.calledWith({
				handler: { name: 'api.test2.outgoing.handler' },
				schema: { name: 'api.test2.incoming' }
			});

		});

	});

	it('should not register a schema has no associated handler', async () => {

		// Given
		schemas.getSchemas.returns({
			test1: {
				incoming: 'api/test1_incoming.avsc'
			}
		});

		handlers.getHandlers.returns({});

		// When
		await require('../lib/worker');

		// Then
		expect(orizuru.Handler).to.have.been.calledOnce;
		expect(orizuru.Handler).to.have.been.calledWithNew;
		expect(orizuru.Handler).to.have.been.calledWith({ transport: transportStubInstance });

		expect(handlerStubInstance.handle).to.not.have.been.called;
		expect(read.readHandler).to.not.have.been.called;

	});

	it('should not register a handler a handler has no associated schema', async () => {

		// Given
		schemas.getSchemas.returns({});

		handlers.getHandlers.returns({
			test1: 'api/test1.js'
		});

		read.readHandler.returns({ name: 'api.test1.incoming.handler' });

		// When
		await require('../lib/worker');

		// Then
		expect(orizuru.Handler).to.have.been.calledOnce;
		expect(orizuru.Handler).to.have.been.calledWithNew;
		expect(orizuru.Handler).to.have.been.calledWith({ transport: transportStubInstance });
		expect(read.readHandler).to.have.been.calledOnce;

		expect(handlerStubInstance.handle).to.not.have.been.called;

	});

});
