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

package com.financialforce.routesolver;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Test;

import com.rabbitmq.client.Channel;

import com.financialforce.orizuru.transport.rabbitmq.exception.MessagingException;
import com.financialforce.orizuru.transport.rabbitmq.interfaces.IMessageQueue;
import com.financialforce.routesolver.problem.avro.Question;

public class RouteSolverTest {

	@Test
	public void run_startsConsumingTheMessageQueue() throws Exception {

		// given
		IMessageQueue messageQueue = mock(IMessageQueue.class);
		Channel channel = mock(Channel.class);
		when(messageQueue.createChannel()).thenReturn(channel);

		RouteSolver routeSolver = new RouteSolver(messageQueue);

		// when
		routeSolver.run();

		// then
		verify(messageQueue, times(1)).createChannel();
		verify(channel, times(1)).queueDeclare(Question.class.getName(), true, false, false, null);
		verify(messageQueue, times(1)).consume(any(), any(), any());

	}

	@Test
	public void run_catchesMessagingExceptions() throws Exception {

		// given
		IMessageQueue messageQueue = mock(IMessageQueue.class);
		when(messageQueue.createChannel()).thenThrow(MessagingException.class);

		RouteSolver routeSolver = new RouteSolver(messageQueue);

		// when
		routeSolver.run();

		// then
		verify(messageQueue, times(1)).createChannel();
		verify(messageQueue, never()).consume(any(), any(), any());

	}

}
