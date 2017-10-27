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
	_ = require('lodash'),
	debug = require('debug-plus')('financialforcedev:orizuru:deploy:shell'),
	debugOutput = require('debug-plus')('financialforcedev:orizuru:deploy:shell:output'),

	childProcess = require('child_process'),
	spawn = childProcess.spawn,

	Promise = require('bluebird'),

	EVENT_CLOSE = 'close',
	EVENT_DATA = 'data',

	shellDebug = (cmd, args) => {
		const formattedCommand = cmd + (args ? ' ' + args.join(' ') : '');
		debug('Executing: ' + formattedCommand);
		return formattedCommand;
	},

	executeCommand = (cmd, args, opts) => {

		return new Promise((resolve, reject) => {

			const
				formattedCommand = shellDebug(cmd, args),
				child = spawn(cmd, args);

			let stdout = '',
				stderr = '';

			child.stdout.on(EVENT_DATA, (data) => {
				stdout += data;
			});

			child.stderr.on(EVENT_DATA, (data) => {
				stderr += data;
			});

			child.on(EVENT_CLOSE, (exitCode) => {
				if (exitCode !== 0 && opts && opts.exitOnError) {
					return reject(new Error('Command failed'));
				}
				const retval = { formattedCommand, exitCode, stdout: _.trim(stdout), stderr: _.trim(stderr) };
				debugOutput(retval);
				return resolve(retval);
			});

		});

	},

	executeCommands = (commands, opts) => {

		return Promise.reduce(commands, (results, command) => {

			return executeCommand(command.cmd, command.args)
				.then((result) => {
					results[result.formattedCommand] = result;
					return results;
				});

		}, {});

	};

module.exports = {
	executeCommand,
	executeCommands
};
