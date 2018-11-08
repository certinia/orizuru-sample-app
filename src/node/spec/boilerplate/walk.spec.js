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

	fs = require('fs'),

	{ walk } = require('../../lib/boilerplate/walk'),

	expect = chai.expect;

chai.use(sinonChai);

describe('boilerplate/walk.js', () => {

	beforeEach(() => {

		sinon.stub(fs, 'readdirSync')
			.withArgs('src/node/lib/boilerplate').returns([
				'.DS_Store',
				'handler.js',
				'id.js'
			])
			.withArgs('src/node/lib/handler').returns([])
			.withArgs('src/node/lib').returns([
				'.DS_Store',
				'web.js',
				'boilerplate',
				'handler'
			]);

		sinon.stub(fs, 'lstatSync')
			.withArgs('src/node/lib/boilerplate/.DS_Store').returns({
				isDirectory: () => false,
				isFile: () => true
			})
			.withArgs('src/node/lib/boilerplate/handler.js').returns({
				isDirectory: () => false,
				isFile: () => true
			})
			.withArgs('src/node/lib/boilerplate/id.js').returns({
				isDirectory: () => false,
				isFile: () => true
			})
			.withArgs('src/node/lib/.DS_Store').returns({
				isDirectory: () => false,
				isFile: () => true
			})
			.withArgs('src/node/lib/web.js').returns({
				isDirectory: () => false,
				isFile: () => true
			})
			.withArgs('src/node/lib/boilerplate').returns({
				isDirectory: () => true,
				isFile: () => false
			})
			.withArgs('src/node/lib/handler').returns({
				isDirectory: () => true,
				isFile: () => false
			});

	});

	afterEach(() => {
		sinon.restore();
	});

	describe('walk', () => {

		it('should return an empty object is no files of the given type are found', () => {

			// Given
			// When
			const results = walk('src/node/lib/boilerplate', '.txt');

			// Then
			expect(results).to.eql({});

		});

		it('should return only files of the given type', () => {

			// Given
			// When
			const results = walk('src/node/lib/boilerplate', '.js');

			// Then
			expect(results).to.eql({
				handler: 'src/node/lib/boilerplate/handler.js',
				id: 'src/node/lib/boilerplate/id.js'
			});

		});

		it('should return only files of the given type and recurse', () => {

			// Given
			// When
			const results = walk('src/node/lib', '.js');

			// Then
			expect(results).to.eql({
				handler: 'src/node/lib/boilerplate/handler.js',
				id: 'src/node/lib/boilerplate/id.js',
				web: 'src/node/lib/web.js'
			});

		});

	});

});
