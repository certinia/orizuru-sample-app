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

package com.financialforce.routesolver;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.financialforce.routesolver.exception.NoSolverException;
import com.financialforce.routesolver.exception.SolverException;
import com.financialforce.routesolver.interfaces.ISolver;
import com.financialforce.routesolver.problem.avro.Answer;
import com.financialforce.routesolver.problem.avro.Question;
import com.rabbitmq.client.Channel;

public class QuestionConsumerTest {

	@Rule
	public final ExpectedException exception = ExpectedException.none();

	@Test
	public void getQueueName_shouldReturnTheQueueName() {

		// given
		Channel channel = mock(Channel.class);
		QuestionConsumer consumer = new QuestionConsumer(channel);

		// when
		String queueName = consumer.getQueueName();

		// then
		assertTrue(queueName.equals(Question.class.getName()));
	}

	@Test
	public void handleMessage_shouldReturnTheAnswer() throws Exception {

		// given
		Question expectedQuestion = new Question();
		Answer expectedAnswer = new Answer();

		ISolver<Question, Answer> solver = mock(ISolver.class);
		when(solver.solve(any())).thenReturn(expectedAnswer);

		Channel channel = mock(Channel.class);
		QuestionConsumer consumer = new QuestionConsumer(channel);
		consumer.setSolver(solver);

		// when
		Answer answer = consumer.handleMessage(null, expectedQuestion);

		// then
		assertEquals(expectedAnswer, answer);
		verify(solver, times(1)).solve(expectedQuestion);

	}

	@Test
	public void handleMessage_shouldThrowANoSolverExceptionForNoSolver() throws Exception {

		// given
		Question expectedQuestion = new Question();

		Channel channel = mock(Channel.class);
		QuestionConsumer consumer = new QuestionConsumer(channel);
		consumer.setSolver(null);

		exception.expect(NoSolverException.class);

		// when
		consumer.handleMessage(null, expectedQuestion);

	}

	@Test
	public void handleMessage_shouldThrowASolverExceptionForSolverExceptions() throws Exception {

		// given
		Question expectedQuestion = new Question();

		ISolver<Question, Answer> solver = mock(ISolver.class);
		when(solver.solve(any())).thenThrow(SolverException.class);

		Channel channel = mock(Channel.class);
		QuestionConsumer consumer = new QuestionConsumer(channel);
		consumer.setSolver(solver);

		exception.expect(SolverException.class);

		// when
		consumer.handleMessage(null, expectedQuestion);

	}

}
