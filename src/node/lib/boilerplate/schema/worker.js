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
	path = require('path'),
	walk = require('../walk'),

	EMPTY = '',
	INCOMING = '_incoming',
	OUTGOING = '_outgoing';

/**
 * @typedef Schema
 * @property {string} incoming
 * @property {string} outgoing
 */

/**
 * @typedef {Object.<string, Schema>} WorkerSchema
 */

/**
 * Gets all the schemas for a worker dyno.
 *
 * Worker dyno schemas are identified via the file name suffixes `_incoming` and `_outgoing`.
 *
 * An `_incoming` schema is always required.
 *
 * An `_outgoing` schema is optional. It is used for publishing onward messages to other worker dynos.
 *
 * @returns {WorkerSchema} - The map of names to schemas.
 */
function getSchemas() {

	const
		schemaDirectory = path.resolve(__dirname, '../../schema'),
		schemas = walk.walk(schemaDirectory, '.avsc');

	return Object.entries(schemas).reduce((results, entry) => {

		const
			schemaName = entry.shift(),
			filePath = entry.shift();

		if (schemaName.endsWith(INCOMING)) {
			const incomingFileName = schemaName.replace(INCOMING, EMPTY);
			results[incomingFileName] = results[incomingFileName] || {};
			results[incomingFileName].incoming = filePath;
		} else if (schemaName.endsWith(OUTGOING)) {
			const outgoingFileName = schemaName.replace(OUTGOING, EMPTY);
			results[outgoingFileName] = results[outgoingFileName] || {};
			results[outgoingFileName].outgoing = filePath;
		}

		return results;

	}, {});

}

module.exports = {
	getSchemas
};
