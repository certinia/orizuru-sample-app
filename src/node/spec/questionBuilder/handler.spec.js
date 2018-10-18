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
 **/

'use strict';

const
	sinon = require('sinon'),
	chai = require('chai'),
	sinonChai = require('sinon-chai'),

	expect = chai.expect,

	orizuru = require('@financialforcedev/orizuru'),

	requireAvsc = require('../../lib/util/requireAvsc'),

	QuestionBuilderService = require('../../lib/questionBuilder/service'),
	outgoingSchema = requireAvsc(__dirname, '../../res/schema/question'),

	{ onHandleIncomingEvent } = require('../../lib/questionBuilder/handler');

chai.use(sinonChai);

describe('questionBuilder/handler', () => {

	let publisherStubInstance;

	beforeEach(() => {

		publisherStubInstance = sinon.createStubInstance(orizuru.Publisher);
		publisherStubInstance.publish.returnsThis();
		sinon.stub(orizuru, 'Publisher').returns(publisherStubInstance);

		sinon.stub(QuestionBuilderService, 'buildQuestion').resolves('result');

	});

	afterEach(() => {
		sinon.restore();
	});

	it('should call service and publish result on event', async () => {

		// Given
		const
			context = 'contextTest',
			message = 'messageTest';

		// When
		await onHandleIncomingEvent(publisherStubInstance)({ context, message });

		// Then
		expect(QuestionBuilderService.buildQuestion).to.have.been.calledOnce;
		expect(QuestionBuilderService.buildQuestion).to.have.been.calledWithExactly({ context, message });

		expect(publisherStubInstance.publish).to.have.been.calledOnce;
		expect(publisherStubInstance.publish).to.have.been.calledWithExactly({
			message: {
				context,
				message: 'result'
			},
			schema: outgoingSchema
		});

	});

});
