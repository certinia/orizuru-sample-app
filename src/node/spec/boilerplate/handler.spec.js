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

	path = require('path'),

	walk = require('../../lib/boilerplate/walk'),

	handlers = require('../../lib/boilerplate/handler'),

	expect = chai.expect;

chai.use(sinonChai);

describe('boilerplate/handler.js', () => {

	beforeEach(() => {
		sinon.stub(path, 'resolve');
		sinon.stub(walk, 'walk');
	});

	afterEach(() => {
		sinon.restore();
	});

	describe('get', () => {

		it('should return all handlers in the handler folder', () => {

			// Given
			walk.walk.returns([]);

			// When
			const result = handlers.getHandlers();

			// Then
			expect(result).to.eql([]);
			expect(path.resolve).to.have.been.calledOnce;
			expect(path.resolve).to.have.been.calledWithExactly(sinon.match.string, '../handler');

		});

	});

	describe('publishHandler', () => {

		it('should return a function', () => {

			// Given
			const
				schemasAndHandler = sinon.stub(),
				publisherInstance = sinon.stub();

			// When
			// Then
			expect(handlers.publishHandler({
				schemasAndHandler,
				publisherInstance
			})).to.be.a('function');

		});

		it('should publish an ongoing message', async () => {

			// Given
			const
				expectedEvent = {
					context: sinon.stub()
				},
				expectedResult = sinon.stub(),
				schemasAndHandler = {
					handler: sinon.stub().resolves(expectedResult),
					schema: {
						outgoing: sinon.stub()
					}
				},
				publisherInstance = {
					publish: sinon.stub()
				},
				config = {
					schemasAndHandler,
					publisherInstance
				};

			// When
			await handlers.publishHandler(config)(expectedEvent);

			// Then
			expect(schemasAndHandler.handler).to.have.been.calledOnce;
			expect(publisherInstance.publish).to.have.been.calledOnce;
			expect(schemasAndHandler.handler).to.have.been.calledWithExactly(expectedEvent);
			expect(publisherInstance.publish).to.have.been.calledWithExactly({
				message: {
					context: expectedEvent.context,
					message: expectedResult
				},
				schema: schemasAndHandler.schema.outgoing
			});

		});

	});

});
