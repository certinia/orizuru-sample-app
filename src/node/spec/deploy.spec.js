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
	chai = require('chai'),
	chaiAsPromised = require('chai-as-promised'),
	proxyquire = require('proxyquire'),
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),

	{ expect } = chai,

	sandbox = sinon.sandbox.create();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('deploy.js', () => {

	let mocks, deploy;

	beforeEach(() => {

		mocks = {
			deployFunctions: {
				deployToHeroku: sandbox.stub().resolves(),
				openSsl: sandbox.stub().resolves(),
				deployToSalesforce: sandbox.stub().resolves(),
				createConnection: sandbox.stub().resolves(),
				readCertificateFiles: sandbox.stub().resolves(),
				createConnectedApp: sandbox.stub().resolves(),
				updateClientIdOnHeroku: sandbox.stub().resolves(),
				createNamedCredential: sandbox.stub().resolves(),
				updateJwtSigningKeyOnHeroku: sandbox.stub().resolves(),
				openOrg: sandbox.stub().resolves(),
				exit: sandbox.stub().resolves()
			}
		};

		deploy = proxyquire(root + '/src/node/lib/deploy.js', {
			'./deploy/deployFunctions': mocks.deployFunctions
		});

	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('deploy', () => {

		beforeEach(() => {
			sandbox.resetHistory();
		});

		it('should call the expected deployFunctions', () => {

			// when/then
			return expect(deploy.deploy())
				.to.eventually.be.fulfilled
				.then(() => {
					expect(mocks.deployFunctions.deployToHeroku).to.have.been.calledOnce;
					expect(mocks.deployFunctions.openSsl).to.have.been.calledOnce;
					expect(mocks.deployFunctions.deployToSalesforce).to.have.been.calledOnce;
					expect(mocks.deployFunctions.createConnection).to.have.been.calledOnce;
					expect(mocks.deployFunctions.readCertificateFiles).to.have.been.calledOnce;
					expect(mocks.deployFunctions.createConnectedApp).to.have.been.calledOnce;
					expect(mocks.deployFunctions.updateClientIdOnHeroku).to.have.been.calledOnce;
					expect(mocks.deployFunctions.createNamedCredential).to.have.been.calledOnce;
					expect(mocks.deployFunctions.updateJwtSigningKeyOnHeroku).to.have.been.calledOnce;
					expect(mocks.deployFunctions.openOrg).to.have.been.calledOnce;
					expect(mocks.deployFunctions.exit).to.have.been.calledOnce;
				});

		});

	});

});
