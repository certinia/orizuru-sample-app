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

	uuid = require('uuid'),

	id = require('../../lib/boilerplate/id'),

	expect = chai.expect;

chai.use(sinonChai);

describe('boilerplate/id.js', () => {

	beforeEach(() => {
		sinon.stub(uuid, 'v4').returns('aaa123');
	});

	afterEach(() => {
		sinon.restore();
	});

	describe('middleware', () => {

		it('should return single function that sets id on the orizuru object', () => {

			// Given
			const middleware = id.middleware;

			// When
			// Then
			expect(middleware).to.be.a('function');

		});

		it('function should set orizuru object and set id on it', () => {

			// Given
			const
				middleware = id.middleware,
				next = sinon.stub(),
				req = {},
				res = {};

			// When
			middleware(req, res, next);

			// Then
			expect(req.orizuru.id).to.eql('aaa123');
			expect(uuid.v4).to.have.been.calledOnce;

		});

		it('function should set id on it', () => {

			// Given
			const
				middleware = id.middleware,
				next = sinon.stub(),
				req = { orizuru: {} },
				res = {};

			// When
			middleware(req, res, next);

			// Then
			expect(req.orizuru.id).to.eql('aaa123');
			expect(uuid.v4).to.have.been.calledOnce;

		});

	});

	describe('responseWriter', () => {

		it('should write a happy result to the response', () => {

			// Given
			const
				jsonStub = sinon.stub(),
				responseWriter = id.responseWriter,
				res = {
					json: jsonStub
				},
				orizuru = { id: '123' };

			// When
			responseWriter(null, res, orizuru);

			// Then
			expect(jsonStub).to.have.been.calledOnce;
			expect(jsonStub).to.have.been.calledWithExactly({
				id: '123'
			});

		});

		it('should write an error result to the response', () => {

			// Given
			const
				statusStub = sinon.stub(),
				sendStub = sinon.stub(),
				responseWriter = id.responseWriter,
				res = {
					status: statusStub,
					send: sendStub
				},
				orizuru = { id: '123' };

			statusStub.returns(res);

			// When
			responseWriter(new Error('Test error.'), res, orizuru);

			// Then
			expect(statusStub).to.have.been.calledOnce;
			expect(sendStub).to.have.been.calledOnce;
			expect(statusStub).to.have.been.calledWithExactly(400);
			expect(sendStub).to.have.been.calledWithExactly('Test error.');

		});

	});

});
