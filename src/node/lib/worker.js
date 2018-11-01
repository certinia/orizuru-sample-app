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

	CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost',

	// get utils
	debug = require('debug')('worker'),
	{ readSchema, readHandler } = require('./boilerplate/read'),

	// define transport
	{ Transport } = require('@financialforcedev/orizuru-transport-rabbitmq'),

	transport = new Transport({
		url: CLOUDAMQP_URL
	}),

	// get orizuru classes
	{ Handler, Publisher } = require('@financialforcedev/orizuru'),
	handlerInstance = new Handler({ transport }),
	publisherInstance = new Publisher({ transport }),

	// get all files in our 'schemas' and 'handlers' directories
	schemas = require('./boilerplate/schema/worker').getSchemas(),
	handler = require('./boilerplate/handler'),
	handlers = handler.getHandlers(),

	// create an object to contain the union of schema and handler paths
	schemasAndHandlers = Object.entries(schemas).reduce((results, entry) => {

		const
			schemaName = entry.shift(),
			incomingAndOutgoingSchemas = entry.shift(),
			incomingPath = incomingAndOutgoingSchemas.incoming,
			outgoingPath = incomingAndOutgoingSchemas.outgoing;

		results[schemaName] = results[schemaName] || { schema: {} };
		results[schemaName].schema.incoming = readSchema(incomingPath);

		if (outgoingPath) {
			results[schemaName].schema.outgoing = readSchema(outgoingPath);
		}

		return results;

	}, {});

// map handlers on to the union
Object.entries(handlers).forEach((entry) => {

	const
		schemaName = entry.shift(),
		filePath = entry.shift();

	schemasAndHandlers[schemaName] = schemasAndHandlers[schemaName] || {};
	schemasAndHandlers[schemaName].handler = readHandler(filePath);

});

// debug out errors and info
handlerInstance.on(Handler.ERROR, debug);
handlerInstance.on(Handler.INFO, debug);

module.exports = handlerInstance.init()
	.then(() => Promise.all(Object.entries(schemasAndHandlers).map((entry) => {

		const
			fileName = entry.shift(),
			schemasAndHandler = entry.shift();

		if (!schemasAndHandler.schema) {
			debug('no schema found for handler \'%s\'', fileName);
			return null;
		}

		if (!schemasAndHandler.handler) {
			debug('no handler found for schema \'%s\'', fileName);
			return null;
		}

		let callback = schemasAndHandler.handler;

		if (schemasAndHandler.schema.outgoing) {

			callback = handler.publishHandler({
				schemasAndHandler,
				publisherInstance
			});

		}

		return handlerInstance.handle({
			schema: schemasAndHandler.schema.incoming,
			handler: callback
		});

	})));

