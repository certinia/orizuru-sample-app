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
	sinon = require('sinon'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),

	{ expect } = chai,

	sfWriter = require(root + '/src/node/lib/shared/sfWriter'),

	sandbox = sinon.sandbox.create(),
	restore = sandbox.restore.bind(sandbox);

chai.use(sinonChai);

describe('shared/sfWriter.js', () => {

	let conn, connSobjectCreate;

	beforeEach(() => {
		connSobjectCreate = sandbox.stub().returns('conn.sobject');
		conn = {
			sobject: sandbox.stub().returns({
				create: connSobjectCreate
			}),
			bulk: {
				load: sandbox.stub().returns('conn.bulk.load')
			}
		};
	});

	afterEach(restore);

	describe('createObject', () => {

		it('should return the result of conn.sobject called with the correct arguments', () => {

			// given - when - then
			expect(sfWriter.createObject(conn, 'a', 'b')).to.eql('conn.sobject');

		});

	});

	describe('bulkCreateObject', () => {

		it('should return the result of conn.bulk.load called with the correct arguments', () => {

			// given - when - then
			expect(sfWriter.bulkCreateObject(conn, 'a', 'b')).to.eql('conn.bulk.load');
			expect(conn.bulk.load).to.have.been.calledOnce;
			expect(conn.bulk.load).to.have.been.calledWith('a', 'insert', 'b');

		});

	});

	describe('sendPlatformEvent', () => {

		it('should return the result of conn.sobject called with the correct arguments', () => {

			expect(sfWriter.sendPlatformEvent('RouteCalculationStep__e', conn, 'test', 'test')).to.eql('conn.sobject');
			expect(conn.sobject).to.have.been.calledOnce;
			expect(conn.sobject).to.have.been.calledWith('RouteCalculationStep__e');
			expect(connSobjectCreate).to.have.been.calledOnce;
			expect(connSobjectCreate).to.have.been.calledWith({
				['Severity__c']: 'Info',
				['Messages__c']: 'test',
				['Status__c']: 'test'
			});

		});

	});

});
