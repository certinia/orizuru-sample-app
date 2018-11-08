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

	pkgInfo = require('pkginfo'),

	id = require('../lib/boilerplate/id'),
	schemas = require('../lib/boilerplate/schema/web'),
	read = require('../lib/boilerplate/read'),

	orizuru = require('@financialforcedev/orizuru'),
	auth = require('@financialforcedev/orizuru-auth'),
	transport = require('@financialforcedev/orizuru-transport-rabbitmq'),
	openApi = require('@financialforcedev/orizuru-openapi'),

	expect = chai.expect;

chai.use(sinonChai);

describe('web.js', () => {

	let serverStubInstance, transportStubInstance, tokenValidatorStub, grantCheckerStub, idStub, jsonStub;

	beforeEach(() => {

		sinon.stub(pkgInfo, 'read').returns({
			['package']: {
				description: 'Test Web Server Description',
				name: 'Test Web Server',
				version: '1.0.0'
			}
		});

		sinon.stub(schemas, 'getSchemas').returns({
			test1: 'api/test1.avsc',
			test2: 'api/test2.avsc'
		});

		sinon.stub(read, 'readSchema')
			.withArgs('api/test1.avsc').returns({ namespace: 'api', name: 'test1' })
			.withArgs('api/test2.avsc').returns({ namespace: 'api', name: 'test2' });

		sinon.stub(openApi.generator, 'generateV2');

		tokenValidatorStub = sinon.stub();
		grantCheckerStub = sinon.stub();

		sinon.stub(auth.middleware, 'tokenValidator').returns(tokenValidatorStub);
		sinon.stub(auth.middleware, 'grantChecker').returns(grantCheckerStub);

		idStub = sinon.stub(id, 'middleware');

		transportStubInstance = sinon.createStubInstance(transport.Transport);
		sinon.stub(transport, 'Transport').returns(transportStubInstance);

		jsonStub = sinon.stub();
		sinon.stub(orizuru, 'json').returns(jsonStub);

		serverStubInstance = sinon.createStubInstance(orizuru.Server);
		serverStubInstance.addRoute.returnsThis();
		serverStubInstance.listen.returnsThis();
		serverStubInstance.on.returnsThis();
		serverStubInstance.use.returnsThis();
		serverStubInstance.server = sinon.stub();
		serverStubInstance.server.get = sinon.stub();
		sinon.stub(orizuru, 'Server').returns(serverStubInstance);

	});

	afterEach(() => {
		delete process.env.ADVERTISE_HOST;
		delete process.env.ADVERTISE_SCHEME;
		delete process.env.JWT_SIGNING_KEY;
		delete process.env.OPENID_CLIENT_ID;
		delete process.env.OPENID_HTTP_TIMEOUT;
		delete process.env.OPENID_ISSUER_URI;
		delete process.env.PORT;
		delete require.cache[require.resolve('../lib/web')];
		sinon.restore();
	});

	it('should create an orizuru server with the default options', () => {

		// Given
		// When
		require('../lib/web');

		// Then
		expect(transport.Transport).to.have.been.calledOnce;
		expect(transport.Transport).to.have.been.calledWithNew;
		expect(transport.Transport).to.have.been.calledWithExactly({
			url: 'amqp://localhost'
		});

		expect(orizuru.Server).to.have.been.calledOnce;
		expect(orizuru.Server).to.have.been.calledWithNew;
		expect(orizuru.Server).to.have.been.calledWithExactly({
			port: 8080,
			transport: transportStubInstance
		});

		expect(serverStubInstance.addRoute).to.have.been.calledTwice;
		expect(serverStubInstance.addRoute).to.have.calledWithExactly({
			endpoint: '/api/',
			middleware: [jsonStub, tokenValidatorStub, grantCheckerStub, idStub],
			schema: { namespace: 'api', name: 'test1' }
		});
		expect(serverStubInstance.addRoute).to.have.calledWithExactly({
			endpoint: '/api/',
			middleware: [jsonStub, tokenValidatorStub, grantCheckerStub, idStub],
			schema: { namespace: 'api', name: 'test2' }
		});

		expect(serverStubInstance.server.get).to.have.been.calledTwice;
		expect(openApi.generator.generateV2).to.have.been.calledTwice;
		expect(openApi.generator.generateV2).to.have.been.calledWithExactly({
			basePath: 'api.api',
			host: 'localhost:8080',
			info: {
				description: 'Test Web Server Description',
				title: 'Test Web Server',
				version: '1.0.0'
			},
			schemes: ['http']
		}, { test1: { name: 'test1', namespace: 'api' } });
		expect(openApi.generator.generateV2).to.have.been.calledWithExactly({
			basePath: 'api.api',
			host: 'localhost:8080',
			info: {
				description: 'Test Web Server Description',
				title: 'Test Web Server',
				version: '1.0.0'
			},
			schemes: ['http']
		}, { test2: { name: 'test2', namespace: 'api' } });

		expect(serverStubInstance.listen).to.have.been.calledOnce;
		expect(serverStubInstance.listen).to.have.been.calledWithExactly();

	});

	it('should create an orizuru server with the specified options', () => {

		// Given
		process.env.ADVERTISE_HOST = 'testHost';
		process.env.ADVERTISE_SCHEME = 'testScheme';
		process.env.CLOUDAMQP_URL = 'testCloudAmqpUrl';
		process.env.JWT_SIGNING_KEY = 'testJwtSigningKey';
		process.env.OPENID_CLIENT_ID = 'testOpenIdClientId';
		process.env.OPENID_HTTP_TIMEOUT = '4000';
		process.env.OPENID_ISSUER_URI = 'testOpenIdIssuerUri';
		process.env.PORT = '4242';

		// When
		require('../lib/web');

		// Then
		expect(transport.Transport).to.have.been.calledOnce;
		expect(transport.Transport).to.have.been.calledWithNew;
		expect(transport.Transport).to.have.been.calledWithExactly({
			url: 'testCloudAmqpUrl'
		});

		expect(orizuru.Server).to.have.been.calledOnce;
		expect(orizuru.Server).to.have.been.calledWithNew;
		expect(orizuru.Server).to.have.been.calledWithExactly({
			port: 4242,
			transport: transportStubInstance
		});

		expect(serverStubInstance.addRoute).to.have.been.calledTwice;
		expect(serverStubInstance.addRoute).to.have.calledWithExactly({
			endpoint: '/api/',
			middleware: [jsonStub, tokenValidatorStub, grantCheckerStub, idStub],
			schema: { namespace: 'api', name: 'test1' }
		});
		expect(serverStubInstance.addRoute).to.have.calledWithExactly({
			endpoint: '/api/',
			middleware: [jsonStub, tokenValidatorStub, grantCheckerStub, idStub],
			schema: { namespace: 'api', name: 'test2' }
		});

		expect(serverStubInstance.server.get).to.have.been.calledTwice;
		expect(openApi.generator.generateV2).to.have.been.calledTwice;
		expect(openApi.generator.generateV2).to.have.been.calledWithExactly({
			basePath: 'api.api',
			host: 'testHost',
			info: {
				description: 'Test Web Server Description',
				title: 'Test Web Server',
				version: '1.0.0'
			},
			schemes: ['testScheme']
		}, { test1: { name: 'test1', namespace: 'api' } });
		expect(openApi.generator.generateV2).to.have.been.calledWithExactly({
			basePath: 'api.api',
			host: 'testHost',
			info: {
				description: 'Test Web Server Description',
				title: 'Test Web Server',
				version: '1.0.0'
			},
			schemes: ['testScheme']
		}, { test2: { name: 'test2', namespace: 'api' } });

		expect(serverStubInstance.listen).to.have.been.calledOnce;
		expect(serverStubInstance.listen).to.have.been.calledWithExactly();

	});

});
