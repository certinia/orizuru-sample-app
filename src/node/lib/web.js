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

	// Get all the environmenr variables
	CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost',
	PORT = parseInt(process.env.PORT, 10) || 8080,
	ADVERTISE_HOST = process.env.ADVERTISE_HOST || 'localhost:8080',
	ADVERTISE_SCHEME = process.env.ADVERTISE_SCHEME || 'http',
	JWT_SIGNING_KEY = process.env.JWT_SIGNING_KEY,
	OPENID_CLIENT_ID = process.env.OPENID_CLIENT_ID,
	OPENID_HTTP_TIMEOUT = parseInt(process.env.OPENID_HTTP_TIMEOUT, 10),
	OPENID_ISSUER_URI = process.env.OPENID_ISSUER_URI,

	OPEN_API_EXT = '.json',

	// get utils
	packageInfo = require('pkginfo'),

	debug = require('debug')('web'),
	path = require('path'),

	openApi = require('@financialforcedev/orizuru-openapi'),

	{ readSchema } = require('./boilerplate/read'),

	// define transport
	{ Transport } = require('@financialforcedev/orizuru-transport-rabbitmq'),

	transport = new Transport({
		url: CLOUDAMQP_URL
	}),

	// get server
	{ addStaticRoute, json, Server } = require('@financialforcedev/orizuru'),

	// get default route
	DEFAULT_ROUTE = addStaticRoute(path.resolve(__dirname, 'web/static')),

	// get all files in our 'schemas' directory
	schemas = require('./boilerplate/schema/web').getSchemas(),

	// get auth middleware
	auth = require('@financialforcedev/orizuru-auth'),

	authEnv = {
		jwtSigningKey: JWT_SIGNING_KEY,
		openidClientId: OPENID_CLIENT_ID,
		openidHTTPTimeout: OPENID_HTTP_TIMEOUT,
		openidIssuerURI: OPENID_ISSUER_URI
	},

	id = require('./boilerplate/id'),

	middlewares = [json()].concat(
		auth.middleware.tokenValidator(authEnv),
		auth.middleware.grantChecker(authEnv)
	).concat([id.middleware]),

	// read package.json properties
	getPackageInfo = () => {
		const resolvedPackage = packageInfo.read(module, __dirname).package;

		return {
			version: resolvedPackage.version,
			title: resolvedPackage.name,
			description: resolvedPackage.description
		};
	},

	// add server routes
	addRoutes = (serverInstance) => {

		// read package.json properties
		const info = getPackageInfo();

		Object.values(schemas).map((schema) => {

			const
				fullSchema = readSchema(schema),
				openApiEndpoint = (`.api.${fullSchema.namespace}.${fullSchema.name}`).replace(/\./g, '/').replace('_', '.') + OPEN_API_EXT;

			// add the route
			serverInstance.addRoute({
				endpoint: '/api/',
				middleware: middlewares,
				schema: fullSchema
			});

			// add the Open API handler
			serverInstance.server.get(openApiEndpoint, openApi.generator.generateV2({
				info,
				basePath: 'api.' + fullSchema.namespace.replace(/\./g, '/').replace('_', '.'),
				host: ADVERTISE_HOST,
				schemes: [ADVERTISE_SCHEME]
			}, { [fullSchema.name]: fullSchema }));

		});

	},

	// start the web server and start listening for connections
	serverInstance = new Server({
		port: PORT,
		transport
	});

// debug out errors and info
serverInstance.on(Server.ERROR, debug);
serverInstance.on(Server.INFO, debug);

addRoutes(serverInstance);

serverInstance.use('/', DEFAULT_ROUTE);

// start listening to new connections
serverInstance.listen();
