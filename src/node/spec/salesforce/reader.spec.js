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

	expect = chai.expect,

	reader = require(root + '/src/node/lib/salesforce/reader'),

	sandbox = sinon.sandbox.create();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('salesforce/reader.js', () => {

	let mocks;

	beforeEach(() => {

		mocks = {};
		mocks.conn = sandbox.stub();
		mocks.conn.query = sandbox.stub();
		mocks.conn.on = sandbox.stub();
		mocks.conn.run = sandbox.stub();

	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('query', () => {

		it('should handle errors', () => {

			// given
			const
				expectedError = 'error',
				expectedQuery = 'SELECT Id FROM Account';

			mocks.conn = sandbox.stub().returnsThis();
			mocks.conn.query = sandbox.stub().returnsThis();
			mocks.conn.on = sandbox.stub();
			mocks.conn.run = sandbox.stub().returnsThis();

			// In this case, only mock out the error event
			mocks.conn.on.callsFake((event, fn) => {
				if (event === 'error') {
					fn(expectedError);
				}
				return mocks.conn;
			});

			// when - then
			return expect(reader.query({ conn: mocks.conn, query: expectedQuery }))
				.to.eventually.be.rejectedWith(expectedError)
				.then(() => {
					expect(mocks.conn.query).to.have.been.calledOnce;
					expect(mocks.conn.query).to.have.been.calledWith(expectedQuery);
				});

		});

		it('should execute the query and return no records', () => {

			// given
			const expectedQuery = 'SELECT Id FROM Account';

			mocks.conn = sandbox.stub().returnsThis();
			mocks.conn.query = sandbox.stub().returnsThis();
			mocks.conn.on = sandbox.stub();
			mocks.conn.run = sandbox.stub().returnsThis();

			// In this case, only mock out the end event to simulate no records
			mocks.conn.on.callsFake((event, fn) => {
				if (event === 'end') {
					fn();
				}
				return mocks.conn;
			});

			// when - then
			return expect(reader.query({ conn: mocks.conn, query: expectedQuery }))
				.to.eventually.eql([])
				.then(() => {
					expect(mocks.conn.query).to.have.been.calledOnce;
					expect(mocks.conn.query).to.have.been.calledWith(expectedQuery);
				});

		});

		it('should execute the query and return records', () => {

			// given
			const
				expectedQuery = 'SELECT Id FROM Account',
				expectedRecord = { name: 'Account 1' };

			mocks.conn = sandbox.stub().returnsThis();
			mocks.conn.query = sandbox.stub().returnsThis();
			mocks.conn.on = sandbox.stub();
			mocks.conn.run = sandbox.stub().returnsThis();

			// In this case, mock out the end event and the record event
			mocks.conn.on.callsFake((event, fn) => {

				if (event === 'end') {
					fn();
				} else if (event === 'record') {
					fn(expectedRecord);
				}

				return mocks.conn;

			});

			// when - then
			return expect(reader.query({ conn: mocks.conn, query: expectedQuery }))
				.to.eventually.eql([expectedRecord])
				.then(() => {
					expect(mocks.conn.query).to.have.been.calledOnce;
					expect(mocks.conn.query).to.have.been.calledWith(expectedQuery);
				});

		});

	});

});
