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

package com.financialforce.routesolver;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.ConnectionFactory;

import com.financialforce.orizuru.transport.rabbitmq.DefaultConsumer;
import com.financialforce.orizuru.transport.rabbitmq.MessageQueue;
import com.financialforce.orizuru.transport.rabbitmq.interfaces.IMessageQueue;
import com.financialforce.routesolver.problem.avro.Answer;
import com.financialforce.routesolver.problem.avro.Question;

public class RouteSolver implements Runnable {

	private static final String CONSUMER_TAG = "RouteSolver";

	private IMessageQueue<Question, Answer> messageQueue;

	public RouteSolver(IMessageQueue<Question, Answer> messageQueue) {
		this.messageQueue = messageQueue;
	}

	@Override
	public void run() {

		try {

			/**
			 * Create the connection to RabbitMQ and the Question queue
			 */
			Channel channel = messageQueue.createChannel();
			channel.queueDeclare(Question.class.getName(), true, false, false, null);

			/** 
			 * Consume the RabbitMQ queue
			 */
			DefaultConsumer<Question, Answer> consumer = new QuestionConsumer(channel);
			messageQueue.consume(CONSUMER_TAG, channel, consumer);

		} catch (Exception ex) {

			// For now log out the exception
			ex.printStackTrace();
		}

	}

	public static void main(String[] args) {

		ConnectionFactory factory = new ConnectionFactory();
		IMessageQueue<Question, Answer> messageQueue = new MessageQueue<Question, Answer>(factory);
		new RouteSolver(messageQueue).run();

	}

}
