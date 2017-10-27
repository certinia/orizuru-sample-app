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

function createMocks() {

	const
		execa = sandbox.stub(),
		childProcess = {
			spawn: sandbox.stub()
		},
		execaStdout = {
			stdout: {
				pipe: sandbox.stub()
			},
			on: sandbox.stub()
		},
		onComplete = sandbox.stub(),
		onFailure = sandbox.stub(),
		logging = sandbox.stub();

	execaStdout.stdout.pipe.resume = sandbox.stub();
	execaStdout.stdout.pipe.returns(execaStdout.stdout.pipe);

	return { childProcess, execa, execaStdout, logging, onComplete, onFailure };

}

describe('deploy/shell.js', () => {

	let mocks, shell;

	beforeEach(() => {

		mocks = createMocks();

		const spawn = mocks.childProcess.spawn;
		spawn.returns(spawn);
		spawn.stdout = sandbox.stub();
		spawn.stdout.on = sandbox.stub();

		spawn.stderr = sandbox.stub();
		spawn.stderr.on = sandbox.stub();

		shell = proxyquire(root + '/src/node/lib/deploy/shell.js', {
			['child_process']: mocks.childProcess
		});

	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('executeCommand', () => {

		describe('should handle exit codes', () => {

			afterEach(() => {
				expect(mocks.childProcess.spawn).to.have.been.calledOnce;
				expect(mocks.childProcess.spawn.stdout.on).to.have.been.calledOnce;
				expect(mocks.childProcess.spawn.stderr.on).to.have.been.calledOnce;
				expect(mocks.childProcess.spawn.on).to.have.been.calledOnce;
			});

			it('an error code', () => {

				// given
				const
					expectedCommand = 'command',
					expectedArgs = ['args'],
					expectedOptions = {},
					expectedResult = {
						exitCode: 1,
						formattedCommand: 'command args',
						stderr: '',
						stdout: ''
					};

				mocks.childProcess.spawn.on = sandbox.stub().yields(1);

				// when/then
				return expect(shell.executeCommand(expectedCommand, expectedArgs, expectedOptions))
					.to.eventually.eql(expectedResult)
					.then(() => {
						expect(mocks.childProcess.spawn).to.have.been.calledWithExactly(expectedCommand, expectedArgs);
					});

			});

			it('an error code with the exitOnError option', () => {

				// given
				const
					expectedCommand = 'command',
					expectedArgs = ['args'],
					expectedOptions = { exitOnError: true };

				mocks.childProcess.spawn.on = sandbox.stub().yields(1);

				// when/then
				return expect(shell.executeCommand(expectedCommand, expectedArgs, expectedOptions))
					.to.eventually.be.rejectedWith('Command failed')
					.then(() => {
						expect(mocks.childProcess.spawn).to.have.been.calledWithExactly(expectedCommand, expectedArgs);
					});

			});

			it('a success code', () => {

				// given
				const
					expectedCommand = 'command',
					expectedArgs = ['args'],
					expectedOptions = {},
					expectedResult = {
						exitCode: 0,
						formattedCommand: 'command args',
						stderr: '',
						stdout: ''
					};

				mocks.childProcess.spawn.on = sandbox.stub().yields(0);

				// when/then
				return expect(shell.executeCommand(expectedCommand, expectedArgs, expectedOptions))
					.to.eventually.eql(expectedResult)
					.then(() => {
						expect(mocks.childProcess.spawn).to.have.been.calledWithExactly(expectedCommand, expectedArgs);
					});

			});

		});

		describe('should handle logging', () => {

			it('and capture stdout', () => {

				// given
				const
					expectedCommand = 'command',
					expectedArgs = ['args'],
					expectedOptions = {},
					expectedResult = {
						exitCode: 0,
						formattedCommand: 'command args',
						stderr: '',
						stdout: 'test'
					};

				mocks.childProcess.spawn.on = sandbox.stub().yields(0);
				mocks.childProcess.spawn.stdout.on.withArgs('data').yields('test');

				// when/then
				return expect(shell.executeCommand(expectedCommand, expectedArgs, expectedOptions))
					.to.eventually.eql(expectedResult);

			});

			it('and capture stderr', () => {

				// given
				const
					expectedCommand = 'command',
					expectedArgs = ['args'],
					expectedOptions = {},
					expectedResult = {
						exitCode: 0,
						formattedCommand: 'command args',
						stderr: 'test',
						stdout: ''
					};

				mocks.childProcess.spawn.on = sandbox.stub().yields(0);
				mocks.childProcess.spawn.stderr.on.withArgs('data').yields('test');

				// when/then
				return expect(shell.executeCommand(expectedCommand, expectedArgs, expectedOptions))
					.to.eventually.eql(expectedResult);

			});

		});

	});

	describe('executeCommands', () => {

		it('should execute each command in turn', () => {

			// given
			const
				expectedCommands = [{
					cmd: 'ls',
					args: ['-a']
				}, {
					cmd: 'ls'
				}],
				expectedOptions = {},
				expectedResults = {
					'ls -a': {
						exitCode: 0,
						formattedCommand: 'ls -a',
						stderr: '',
						stdout: ''
					},
					ls: {
						exitCode: 1,
						formattedCommand: 'ls',
						stderr: '',
						stdout: ''
					}
				};

			mocks.childProcess.spawn.on = sandbox.stub()
				.onFirstCall().yields(0)
				.onSecondCall().yields(1);

			// when/then
			return expect(shell.executeCommands(expectedCommands, expectedOptions))
				.to.eventually.eql(expectedResults);

		});

	});

});
