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
	_ = require('lodash'),
	express = require('express'),
	sinon = require('sinon'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),

	expect = chai.expect,

	orizuru = require('@financialforcedev/orizuru'),
	transport = require('@financialforcedev/orizuru-transport-rabbitmq'),
	orizuruAuth = require('@financialforcedev/orizuru-auth'),

	webPath = '../lib/web';

chai.use(sinonChai);

describe('web', () => {

	let serverStubInstance, transportStubInstance;

	beforeEach(() => {

		process.env.CLOUDAMQP_URL = 'cloudamqpUrl';
		process.env.JWT_SIGNING_KEY = 'jwtSigningKeyTest';
		process.env.OPENID_CLIENT_ID = 'openidClientIdTest';
		process.env.OPENID_HTTP_TIMEOUT = '4001';
		process.env.OPENID_ISSUER_URI = 'openidIssuerURITest';
		process.env.PORT = '5555';

		sinon.stub(express, 'static');

		transportStubInstance = sinon.createStubInstance(transport.Transport);
		sinon.stub(transport, 'Transport').returns(transportStubInstance);

		serverStubInstance = sinon.createStubInstance(orizuru.Server);
		serverStubInstance.addRoute.returnsThis();
		serverStubInstance.listen.returnsThis();
		serverStubInstance.on.returnsThis();
		serverStubInstance.use.returnsThis();
		sinon.stub(orizuru, 'Server').returns(serverStubInstance);

		sinon.stub(orizuruAuth.middleware, 'tokenValidator').returns(_.noop);
		sinon.stub(orizuruAuth.middleware, 'grantChecker').returns(_.noop);

	});

	afterEach(() => {
		delete process.env.CLOUDAMQP_URL;
		delete process.env.JWT_SIGNING_KEY;
		delete process.env.OPENID_CLIENT_ID;
		delete process.env.OPENID_HTTP_TIMEOUT;
		delete process.env.OPENID_ISSUER_URI;
		delete process.env.PORT;
		sinon.restore();
	});

	it('should build a orizuru web server correctly', () => {

		// Given
		express.static.returns('defaultRoute');

		// When
		require(webPath);

		// Then
		expect(transport.Transport).to.have.been.calledOnce;
		expect(transport.Transport).to.have.been.calledWithNew;
		expect(transport.Transport).to.have.been.calledWithExactly({
			url: 'cloudamqpUrl'
		});

		expect(orizuru.Server).to.have.been.calledOnce;
		expect(orizuru.Server).to.have.been.calledWithNew;
		expect(orizuru.Server).to.have.been.calledWithExactly({
			port: 5555,
			transport: transportStubInstance
		});

		expect(orizuruAuth.middleware.tokenValidator).to.have.been.calledOnce;
		expect(orizuruAuth.middleware.tokenValidator).to.have.been.calledWithExactly({
			jwtSigningKey: 'jwtSigningKeyTest',
			openidClientId: 'openidClientIdTest',
			openidHTTPTimeout: 4001,
			openidIssuerURI: 'openidIssuerURITest'
		});
		expect(orizuruAuth.middleware.grantChecker).to.have.been.calledOnce;
		expect(orizuruAuth.middleware.grantChecker).to.have.been.calledWithExactly({
			jwtSigningKey: 'jwtSigningKeyTest',
			openidClientId: 'openidClientIdTest',
			openidHTTPTimeout: 4001,
			openidIssuerURI: 'openidIssuerURITest'
		});

		expect(serverStubInstance.addRoute).to.have.been.calledTwice;
		expect(serverStubInstance.addRoute).to.have.been.calledWithExactly({
			endpoint: '/api/',
			middleware: [sinon.match.func, sinon.match.func, sinon.match.func],
			schema: {
				fields: [{ name: 'deliveryPlanId', type: 'string' }],
				name: 'calculateRoutesForPlan',
				namespace: 'com.financialforce.orizuru.problem.avro',
				type: 'record'
			}
		});
		expect(serverStubInstance.addRoute).to.have.been.calledWithExactly({
			endpoint: '/api/',
			middleware: [sinon.match.func, sinon.match.func, sinon.match.func],
			schema: {
				fields: [{ name: 'generateDataTaskId', type: 'string' }],
				name: 'createData',
				namespace: 'com.financialforce.orizuru.problem.avro',
				type: 'record'
			}
		});

		expect(serverStubInstance.use).to.have.been.calledOnce;
		expect(serverStubInstance.use).to.have.been.calledWithExactly('/', 'defaultRoute');

		expect(express.static).to.have.been.calledOnce;
		expect(express.static).to.have.been.calledWithExactly(sinon.match(/web\/static$/gi));

		expect(serverStubInstance.listen).to.have.been.calledOnce;
		expect(serverStubInstance.listen).to.have.been.calledWithExactly();

	});

});
