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

	path = require('path'),

	walk = require('../../../lib/boilerplate/walk'),

	schemas = require('../../../lib/boilerplate/schema/worker'),

	expect = chai.expect;

describe('boilerplate/schema.js', () => {

	beforeEach(() => {
		sinon.stub(path, 'resolve');
	});

	afterEach(() => {
		sinon.restore();
	});

	describe('getWorkerSchemas', () => {

		it('should handle incoming and outgoing schemas', () => {

			// Given
			const
				expectedOutput = {
					createData: {
						incoming: '/Users/Guest/GIT/test/src/node/lib/schema/createData_incoming.avsc'
					},
					questionBuilder: {
						incoming: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_incoming.avsc',
						outgoing: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_outgoing.avsc'
					},
					resultWriter: {
						incoming: '/Users/Guest/GIT/test/src/node/lib/schema/resultWriter_incoming.avsc'
					}
				},
				testSchemas = {
					calculateRoutesForPlan: '/Users/Guest/GIT/test/src/node/lib/schema/api/calculateRoutesForPlan.avsc',
					createData: '/Users/Guest/GIT/test/src/node/lib/schema/api/createData.avsc',
					createData_incoming: '/Users/Guest/GIT/test/src/node/lib/schema/createData_incoming.avsc',
					questionBuilder_incoming: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_incoming.avsc',
					questionBuilder_outgoing: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_outgoing.avsc',
					resultWriter_incoming: '/Users/Guest/GIT/test/src/node/lib/schema/resultWriter_incoming.avsc'
				};

			sinon.stub(walk, 'walk').returns(testSchemas);

			// When
			// Then
			expect(schemas.getSchemas()).to.eql(expectedOutput);
			expect(path.resolve).to.have.been.calledOnce;
			expect(path.resolve).to.have.been.calledWithExactly(sinon.match.string, '../../schema');

		});

		it('should handle only incoming schemas', () => {

			// Given
			const
				expectedOutput = {
					createData: {
						incoming: '/Users/Guest/GIT/test/src/node/lib/schema/createData_incoming.avsc'
					},
					questionBuilder: {
						incoming: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_incoming.avsc'
					},
					resultWriter: {
						incoming: '/Users/Guest/GIT/test/src/node/lib/schema/resultWriter_incoming.avsc'
					}
				},
				testSchemas = {
					createData_incoming: '/Users/Guest/GIT/test/src/node/lib/schema/createData_incoming.avsc',
					questionBuilder_incoming: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_incoming.avsc',
					resultWriter_incoming: '/Users/Guest/GIT/test/src/node/lib/schema/resultWriter_incoming.avsc'
				};

			sinon.stub(walk, 'walk').returns(testSchemas);

			// When
			// Then
			expect(schemas.getSchemas()).to.eql(expectedOutput);
			expect(path.resolve).to.have.been.calledOnce;
			expect(path.resolve).to.have.been.calledWithExactly(sinon.match.string, '../../schema');

		});

		it('should handle outgoing schemas coming first in the file list', () => {

			// Given
			const
				expectedOutput = {
					createData: {
						incoming: '/Users/Guest/GIT/test/src/node/lib/schema/createData_incoming.avsc'
					},
					questionBuilder: {
						incoming: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_incoming.avsc',
						outgoing: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_outgoing.avsc'
					},
					resultWriter: {
						incoming: '/Users/Guest/GIT/test/src/node/lib/schema/resultWriter_incoming.avsc'
					}
				},
				testSchemas = {
					calculateRoutesForPlan: '/Users/Guest/GIT/test/src/node/lib/schema/api/calculateRoutesForPlan.avsc',
					createData: '/Users/Guest/GIT/test/src/node/lib/schema/api/createData.avsc',
					createData_incoming: '/Users/Guest/GIT/test/src/node/lib/schema/createData_incoming.avsc',
					questionBuilder_outgoing: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_outgoing.avsc',
					questionBuilder_incoming: '/Users/Guest/GIT/test/src/node/lib/schema/questionBuilder_incoming.avsc',
					resultWriter_incoming: '/Users/Guest/GIT/test/src/node/lib/schema/resultWriter_incoming.avsc'
				};

			sinon.stub(walk, 'walk').returns(testSchemas);

			// Then
			expect(schemas.getSchemas()).to.eql(expectedOutput);
			expect(path.resolve).to.have.been.calledOnce;
			expect(path.resolve).to.have.been.calledWithExactly(sinon.match.string, '../../schema');

		});

	});

});
