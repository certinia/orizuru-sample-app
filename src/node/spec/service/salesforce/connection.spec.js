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

	jsForce = require('jsforce'),
	orizuruAuth = require('@financialforcedev/orizuru-auth'),

	connection = require('../../../lib/service/salesforce/connection');

chai.use(sinonChai);

describe('service/salesforce/connection.js', () => {

	beforeEach(() => {

		process.env.JWT_SIGNING_KEY = 'jwtSigningKeyTest';
		process.env.OPENID_CLIENT_ID = 'openidClientIdTest';
		process.env.OPENID_HTTP_TIMEOUT = '4001';
		process.env.OPENID_ISSUER_URI = 'openidIssuerURITest';

		sinon.stub(orizuruAuth.grant, 'getToken').returns(() => Promise.resolve('credentialsTest'));
		sinon.stub(jsForce, 'Connection').callsFake(function () {
			this.test = 'test';
		});

	});

	afterEach(() => {
		process.env.JWT_SIGNING_KEY = null;
		process.env.OPENID_CLIENT_ID = null;
		process.env.OPENID_HTTP_TIMEOUT = null;
		process.env.OPENID_ISSUER_URI = null;
		sinon.restore();
	});

	describe('fromContext', () => {

		it('should return a correctly configured connection from context', async () => {

			// Given
			const
				context = {
					user: 'userTest'
				},

				// When
				result = await connection.fromContext(context);

			// Then
			expect(result).to.eql({ test: 'test' });
			expect(orizuruAuth.grant.getToken).to.have.been.calledOnce;
			expect(orizuruAuth.grant.getToken).to.have.been.calledWithExactly({
				jwtSigningKey: 'jwtSigningKeyTest',
				openidClientId: 'openidClientIdTest',
				openidHTTPTimeout: 4001,
				openidIssuerURI: 'openidIssuerURITest'
			});
			expect(jsForce.Connection).to.have.been.calledOnce;
			expect(jsForce.Connection).to.have.been.calledWithNew;
			expect(jsForce.Connection).to.have.been.calledWithExactly('credentialsTest');

		});

		it('should cache validated tokenGranter for future use', async () => {

			// Given
			delete require.cache[require.resolve('../../../lib/service/salesforce/connection')];

			const
				context = {
					user: 'userTest'
				},
				connectionAfterCacheClear = require('../../../lib/service/salesforce/connection');

			// When
			let result = await connectionAfterCacheClear.fromContext(context);

			// Then
			expect(result).to.eql({ test: 'test' });
			expect(orizuruAuth.grant.getToken).to.have.been.calledOnce;
			expect(orizuruAuth.grant.getToken).to.have.been.calledWithExactly({
				jwtSigningKey: 'jwtSigningKeyTest',
				openidClientId: 'openidClientIdTest',
				openidHTTPTimeout: 4001,
				openidIssuerURI: 'openidIssuerURITest'
			});
			expect(jsForce.Connection).to.have.been.calledOnce;
			expect(jsForce.Connection).to.have.been.calledWithNew;
			expect(jsForce.Connection).to.have.been.calledWithExactly('credentialsTest');

			result = await connectionAfterCacheClear.fromContext(context);

			expect(result).to.eql({ test: 'test' });
			expect(orizuruAuth.grant.getToken).to.have.been.calledOnce; // check not called again
			expect(jsForce.Connection).to.have.been.calledTwice;
			expect(jsForce.Connection).to.have.been.calledWithNew;
			expect(jsForce.Connection).to.have.been.calledWithExactly('credentialsTest');
			expect(jsForce.Connection).to.have.been.calledWithExactly('credentialsTest');

		});

	});

});
