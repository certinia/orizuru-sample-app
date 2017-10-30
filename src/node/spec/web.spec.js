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
	root = require('app-root-path'),
	sinon = require('sinon'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),

	expect = chai.expect,

	orizuru = require('@financialforcedev/orizuru'),
	orizuruTransportRabbitmq = require('@financialforcedev/orizuru-transport-rabbitmq'),
	orizuruAuth = require('@financialforcedev/orizuru-auth'),

	webPath = root + '/src/node/lib/web',
	schemaNameToDefinition = require(root + '/src/node/lib/web/schema'),

	sandbox = sinon.sandbox.create(),
	restore = sandbox.restore.bind(sandbox);

chai.use(sinonChai);

describe('web.js', () => {

	let expressMock, serverMock;

	beforeEach(() => {

		process.env.CLOUDAMQP_URL = 'cloudamqpUrlTest';
		process.env.JWT_SIGNING_KEY = 'jwtSigningKeyTest';
		process.env.OPENID_CLIENT_ID = 'openidClientIdTest';
		process.env.OPENID_HTTP_TIMEOUT = '4001';
		process.env.OPENID_ISSUER_URI = 'openidIssuerURITest';
		process.env.PORT = '5555';

		expressMock = {
			listen: sandbox.spy()
		};

		serverMock = {
			addRoute: sandbox.stub(),
			getServer: sandbox.stub().returns(expressMock)
		};

		serverMock.addRoute.returns(serverMock);

		sandbox.stub(orizuru, 'Server').callsFake(function (config) {
			this.addRoute = serverMock.addRoute;
			this.getServer = serverMock.getServer;
		});

		sandbox.stub(orizuruAuth.middleware, 'tokenValidator').returns(_.noop);
		sandbox.stub(orizuruAuth.middleware, 'grantChecker').returns(_.noop);

	});

	afterEach(() => {
		process.env.CLOUDAMQP_URL = null;
		process.env.JWT_SIGNING_KEY = null;
		process.env.OPENID_CLIENT_ID = null;
		process.env.OPENID_HTTP_TIMEOUT = null;
		process.env.OPENID_ISSUER_URI = null;
		process.env.PORT = null;
		restore();
	});

	it('should build a orizuru web server correctly', () => {

		// given - when
		require(webPath);

		// then
		expect(orizuru.Server).to.have.been.calledOnce;
		expect(orizuru.Server).to.have.been.calledWithNew;
		expect(orizuru.Server).to.have.been.calledWith({
			transport: orizuruTransportRabbitmq,
			transportConfig: {
				cloudamqpUrl: 'cloudamqpUrlTest'
			}
		});

		expect(orizuruAuth.middleware.tokenValidator).to.have.been.calledOnce;
		expect(orizuruAuth.middleware.tokenValidator).to.have.been.calledWith({
			jwtSigningKey: 'jwtSigningKeyTest',
			openidClientId: 'openidClientIdTest',
			openidHTTPTimeout: 4001,
			openidIssuerURI: 'openidIssuerURITest'
		});
		expect(orizuruAuth.middleware.grantChecker).to.have.been.calledOnce;
		expect(orizuruAuth.middleware.grantChecker).to.have.been.calledWith({
			jwtSigningKey: 'jwtSigningKeyTest',
			openidClientId: 'openidClientIdTest',
			openidHTTPTimeout: 4001,
			openidIssuerURI: 'openidIssuerURITest'
		});

		expect(serverMock.addRoute).to.have.been.calledOnce;
		expect(serverMock.addRoute).to.have.been.calledWith({
			schemaNameToDefinition,
			apiEndpoint: '/api',
			middlewares: [_.noop, _.noop]
		});

		expect(serverMock.getServer).to.have.been.calledOnce;
		expect(serverMock.getServer).to.have.been.calledWith();

		expect(expressMock.listen).to.have.been.calledOnce;
		expect(expressMock.listen).to.have.been.calledWith('5555');

	});

});
