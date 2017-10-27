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
	chai = require('chai'),
	chaiAsPromised = require('chai-as-promised'),
	root = require('app-root-path'),
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	proxyquire = require('proxyquire'),

	expect = chai.expect,

	sandbox = sinon.sandbox.create();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('deploy/shell.js', () => {

	let mocks, deployFunctions;

	beforeEach(() => {

		mocks = {};
		mocks.shell = {};

		mocks.jsforce = {};
		mocks.jsforce.Connection = sandbox.stub();

		deployFunctions = proxyquire(root + '/src/node/lib/deploy/deployFunctions.js', {
			jsforce: mocks.jsforce,
			'./shell': mocks.shell
		});

	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('createConnection', () => {

		it('should call process.exit', () => {

			// given
			const expectedInput = {
					connectionInfo: {
						accessToken: 'testAccessToken',
						instanceUrl: 'testInstanceUrl'
					}
				},

				// when
				result = deployFunctions.createConnection(expectedInput);

			// then
			expect(result.conn).to.not.eql(undefined);

		});

	});

	describe('exit', () => {

		it('should call process.exit', () => {

			// given
			sandbox.stub(process, 'exit');

			// when
			deployFunctions.exit();

			// then
			expect(process.exit).to.have.been.calledOnce;

		});

	});

	describe('exitWithError', () => {

		it('should call process.exit', () => {

			// given
			sandbox.stub(process, 'exit');

			// when
			deployFunctions.exitWithError('test');

			// then
			expect(process.exit).to.have.been.calledOnce;

		});

	});

	describe('deployToHeroku', () => {

		it('should execute the correct commands', () => {

			// given
			const
				expectedCommands = [
					{ cmd: 'heroku', args: ['create', '-t', 'research', '--json'] },
					{ cmd: 'heroku', args: ['buildpacks:add', '--index', '1', 'heroku/nodejs'] },
					{ cmd: 'heroku', args: ['buildpacks:add', '--index', '2', 'heroku/java'] },
					{ cmd: 'heroku', args: ['addons:create', 'cloudamqp:lemur'] },
					{ cmd: 'heroku', args: ['config:set', 'MAVEN_CUSTOM_OPTS=-DskipTests=false;maven.javadoc.skip=true'] },
					{ cmd: 'heroku', args: ['config:set', 'NODE_MODULES_CACHE=false'] },
					{ cmd: 'heroku', args: ['config:set', 'OPENID_HTTP_TIMEOUT=4000'] },
					{ cmd: 'heroku', args: ['config:set', 'OPENID_ISSUER_URI=https://test.salesforce.com/'] },
					{ cmd: 'git', args: ['push', 'heroku', 'master:master'] },
					{ cmd: 'heroku', args: ['ps:scale', 'dataCreator=1'] },
					{ cmd: 'heroku', args: ['ps:scale', 'questionBuilder=1'] },
					{ cmd: 'heroku', args: ['ps:scale', 'resultWriter=1'] },
					{ cmd: 'heroku', args: ['ps:scale', 'routeSolver=1'] }
				],
				expectedOutput = {
					herokuApp: {
						command0Out: 'testing'
					},
					herokuResults: {
						command0: {
							stdout: '{"command0Out":"testing"}'
						}
					}
				};

			mocks.shell.executeCommands = sandbox.stub().resolves({
				command0: { stdout: '{"command0Out":"testing"}' }
			});

			// when/then
			return expect(deployFunctions.deployToHeroku({}))
				.to.eventually.eql(expectedOutput)
				.then(() => {
					expect(mocks.shell.executeCommands).to.have.been.calledWith(expectedCommands);
				});

		});

	});

	describe('deployToSalesforce', () => {

		it('should execute the correct commands', () => {

			// given
			const
				expectedCommands = [
					{ cmd: 'sfdx', args: ['force:org:create', '-f', 'src/apex/config/project-scratch-def.json', '-s'] },
					{ cmd: 'sfdx', args: ['force:source:push'] },
					{ cmd: 'sfdx', args: ['force:user:permset:assign', '-n', 'OrizuruAdmin'] },
					{ cmd: 'sfdx', args: ['force:apex:test:run', '-r', 'human', '--json'] },
					{ cmd: 'sfdx', args: ['force:org:display', '--json'] },
					{ cmd: 'sfdx', args: ['force:user:password:generate', '--json'] }
				],
				expectedOutput = {
					connectionInfo: undefined,
					sfdxResults: {
						command0: {
							stdout: '{"command0Out":"testing"}'
						},
						command1: {
							stdout: '{"command1Out":"testing"}'
						},
						command2: {
							stdout: '{"command2Out":"testing"}'
						},
						command3: {
							stdout: '{"command3Out":"testing"}'
						},
						command4: {
							stdout: '{"command4Out":"testing"}'
						}
					}
				};

			mocks.shell.executeCommands = sandbox.stub().resolves({
				command0: { stdout: '{"command0Out":"testing"}' },
				command1: { stdout: '{"command1Out":"testing"}' },
				command2: { stdout: '{"command2Out":"testing"}' },
				command3: { stdout: '{"command3Out":"testing"}' },
				command4: { stdout: '{"command4Out":"testing"}' }
			});

			// when/then
			return expect(deployFunctions.deployToSalesforce({}))
				.to.eventually.eql(expectedOutput)
				.then(() => {
					expect(mocks.shell.executeCommands).to.have.been.calledWith(expectedCommands);
				});

		});

	});

	describe('openSsl', () => {

		it('should execute the correct commands', () => {

			// given
			const
				expectedCommands = [{
					cmd: 'openssl',
					args: ['req', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'key.pem', '-x509', '-days', '365', '-out', 'certificate.pem', '-subj', '/C=UK/ST=North Yorkshire/L=Harrogate/O=FinancialForce/OU=Research Team/CN=test.com']
				}],
				expectedOutput = {};

			mocks.shell.executeCommands = sandbox.stub().resolves({});

			// when/then
			return expect(deployFunctions.openSsl({}))
				.to.eventually.eql(expectedOutput)
				.then(() => {
					expect(mocks.shell.executeCommands).to.have.been.calledWith(expectedCommands);
				});

		});

	});

	describe('readCertificateFiles', () => {

		it('should execute the correct commands', () => {

			// given
			const
				expectedCommands = [
					{ cmd: 'cat', args: ['certificate.pem'] },
					{ cmd: 'cat', args: ['key.pem'] }
				],
				expectedOutput = {
					certificateResults: {
						privateKey: 'privateKey',
						publicKey: 'publicKey'
					}
				};

			mocks.shell.executeCommands = sandbox.stub().resolves({
				command0: { stdout: 'publicKey' },
				command1: { stdout: 'privateKey' }
			});

			// when/then
			return expect(deployFunctions.readCertificateFiles({}))
				.to.eventually.eql(expectedOutput)
				.then(() => {
					expect(mocks.shell.executeCommands).to.have.been.calledWith(expectedCommands);
				});

		});

	});

	describe('createConnectedApp', () => {

		it('should execute the correct commands', () => {

			// given
			const
				expectedInput = {
					conn: sandbox.stub(),
					parameters: {
						connectedApp: {
							name: 'TestApp',
							contactEmail: 'contactEmail'
						}
					},
					certificateResults: {
						publicKey: 'testKey'
					}
				},
				expectedOutput = {
					conn: expectedInput.conn,
					connectedApp: undefined,
					certificateResults: {
						publicKey: 'testKey'
					},
					parameters: expectedInput.parameters
				};

			expectedInput.conn.metadata = {};
			expectedInput.conn.metadata.create = sandbox.stub().resolves();
			expectedInput.conn.metadata.read = sandbox.stub().resolves();

			// when/then
			return expect(deployFunctions.createConnectedApp(expectedInput))
				.to.eventually.eql(expectedOutput)
				.then(() => {
					expect(expectedInput.conn.metadata.create).to.have.been.calledOnce;
					expect(expectedInput.conn.metadata.read).to.have.been.calledOnce;
				});

		});

	});

	describe('updateClientIdOnHeroku', () => {

		it('should execute the correct commands', () => {

			// given
			const
				expectedInput = {
					connectedApp: {
						oauthConfig: {
							consumerKey: 'testKey'
						}
					}
				},
				expectedCommands = [{
					cmd: 'heroku',
					args: ['config:set', 'OPENID_CLIENT_ID=testKey']
				}],
				expectedOutput = expectedInput;

			mocks.shell.executeCommands = sandbox.stub().resolves({});

			// when/then
			return expect(deployFunctions.updateClientIdOnHeroku(expectedInput))
				.to.eventually.eql(expectedOutput)
				.then(() => {
					expect(mocks.shell.executeCommands).to.have.been.calledWith(expectedCommands);
				});

		});

	});

	describe('updateJwtSigningKeyOnHeroku', () => {

		it('should execute the correct commands', () => {

			// given
			const
				expectedInput = {
					certificateResults: {
						privateKey: 'testKey'
					}
				},
				expectedCommands = [{
					cmd: 'heroku',
					args: ['config:set', 'JWT_SIGNING_KEY=testKey']
				}],
				expectedOutput = expectedInput;

			mocks.shell.executeCommands = sandbox.stub().resolves({});

			// when/then
			return expect(deployFunctions.updateJwtSigningKeyOnHeroku(expectedInput))
				.to.eventually.eql(expectedOutput)
				.then(() => {
					expect(mocks.shell.executeCommands).to.have.been.calledWith(expectedCommands);
				});

		});

	});

	describe('createNamedCredential', () => {

		it('should execute the correct commands', () => {

			// given
			const
				expectedInput = {
					conn: sandbox.stub(),
					connectedApp: {
						name: 'testConnectedAppName'
					},
					herokuApp: {
						['web_url']: 'testAppUrl'
					},
					parameters: {
						namedCredential: {
							name: 'testName'
						}
					}
				},
				expectedOutput = expectedInput;

			mocks.shell.executeCommands = sandbox.stub().resolves({});

			expectedInput.conn.metadata = {};
			expectedInput.conn.metadata.create = sandbox.stub().resolves();
			expectedInput.conn.metadata.read = sandbox.stub().resolves();

			// when/then
			return expect(deployFunctions.createNamedCredential(expectedInput))
				.to.eventually.eql(expectedOutput)
				.then(() => {
					expect(expectedInput.conn.metadata.create).to.have.been.calledOnce;
					expect(expectedInput.conn.metadata.read).to.have.been.calledOnce;
				});

		});

	});

	describe('openOrg', () => {

		it('should execute the correct commands', () => {

			// given
			const
				expectedCommands = [
					{ cmd: 'sfdx', args: ['force:org:open'] }
				],
				expectedOutput = {};

			mocks.shell.executeCommands = sandbox.stub().resolves({});

			// when/then
			return expect(deployFunctions.openOrg({}))
				.to.eventually.eql(expectedOutput)
				.then(() => {
					expect(mocks.shell.executeCommands).to.have.been.calledWith(expectedCommands);
				});

		});

	});

});
