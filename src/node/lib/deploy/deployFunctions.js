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
	debug = require('debug-plus')('financialforcedev:orizuru:deploy'),

	_ = require('lodash'),
	jsforce = require('jsforce'),
	shell = require('./shell'),

	/**
	 * Utility
	 */
	createConnection = (result) => {

		const
			conn = new jsforce.Connection({
				instanceUrl: result.connectionInfo.instanceUrl,
				accessToken: result.connectionInfo.accessToken
			});

		result.conn = conn;
		return result;

	},

	/**
	 * OpenSSL
	 */
	opensslCommands = [{
		cmd: 'openssl',
		args: ['req', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'key.pem', '-x509', '-days', '365', '-out', 'certificate.pem', '-subj', '/C=UK/ST=North Yorkshire/L=Harrogate/O=FinancialForce/OU=Research Team/CN=test.com']
	}],

	readCertificateCommands = [
		{ cmd: 'cat', args: ['certificate.pem'] },
		{ cmd: 'cat', args: ['key.pem'] }
	],

	openSsl = (result) => {

		debug.log('Generating certificates');
		return shell.executeCommands(opensslCommands, { exitOnError: true })
			.then(() => {
				debug.log('Generated certificate');
				return result;
			});
	},

	readCertificateFiles = (result) => {

		debug.log('Read certificate files');

		return shell.executeCommands(readCertificateCommands, { exitOnError: true })
			.then(openSslResults => {
				const certificateResults = _.map(_.values(openSslResults), value => value.stdout);
				result.certificateResults = {};
				result.certificateResults.publicKey = certificateResults[0];
				result.certificateResults.privateKey = certificateResults[1];
				return result;
			});

	},

	/**
	 * ConnectedApp
	 */
	createConnectedApp = (result) => {

		debug.log('Create connected app');

		const
			conn = result.conn,
			name = result.parameters.connectedApp.name,
			contactEmail = result.parameters.connectedApp.contactEmail,
			certificate = result.certificateResults.publicKey,

			connectedApp = {
				contactEmail,
				label: name,
				fullName: name,
				oauthConfig: {
					callbackUrl: 'https://login.salesforce.com/success',
					scopes: ['Api', 'RefreshToken'],
					certificate
				}
			};

		return conn.metadata.create('ConnectedApp', connectedApp)
			.then(connectedApp => conn.metadata.read('ConnectedApp', name))
			.then(connectedApp => {
				debug.log('Created connected app');
				result.connectedApp = connectedApp;
				return result;
			});

	},

	updateClientIdOnHeroku = (result) => {

		debug.log('Update Heroku with Connected App Client ID');

		const
			connectedApp = result.connectedApp,
			herokuConfigCommand = [{
				cmd: 'heroku',
				args: ['config:set', `OPENID_CLIENT_ID=${connectedApp.oauthConfig.consumerKey}`]
			}];

		return shell.executeCommands(herokuConfigCommand, { exitOnError: true })
			.then(() => {
				debug.log('Updated Heroku with Connected App Client ID');
				return result;
			});

	},

	updateJwtSigningKeyOnHeroku = (result) => {

		debug.log('Update JWT_SIGNING_KEY on Heroku');

		const
			herokuConfigCommand = [{
				cmd: 'heroku',
				args: ['config:set', `JWT_SIGNING_KEY=${result.certificateResults.privateKey}`]
			}];

		return shell.executeCommands(herokuConfigCommand, { exitOnError: true })
			.then(() => {
				debug.log('Updated JWT_SIGNING_KEY on Heroku');
				return result;
			});

	},

	/**
	 * NamedCredential
	 */
	createNamedCredential = (result) => {

		debug.log('Create Named Credential');

		const
			conn = result.conn,
			herokuApp = result.herokuApp,
			name = result.parameters.namedCredential.name,

			namedCredential = {
				endpoint: herokuApp.web_url,
				label: name,
				fullName: name,
				principalType: 'Anonymous',
				protocol: 'NoAuthentication'
			};

		return conn.metadata.create('NamedCredential', namedCredential)
			.then(() => conn.metadata.read('NamedCredential', name))
			.then(namedCredential => {
				debug.log('Created Named Credential');
				result.namedCredential = namedCredential;
				return result;
			});

	},

	/**
	 * Open org in browser
	 */

	orgOpenCommands = [
		{ cmd: 'sfdx', args: ['force:org:open'] }
	],

	openOrg = (result) => {

		debug.log('Open org');
		return shell.executeCommands(orgOpenCommands, { exitOnError: true });

	},

	/**
	 * Deploy to Heroku
	 */
	deployToHerokuCommands = [
		{ cmd: 'heroku', args: ['create', '-t', 'research', '--json'] },
		{ cmd: 'heroku', args: ['buildpacks:add', '--index', '1', 'heroku/nodejs'] },
		{ cmd: 'heroku', args: ['buildpacks:add', '--index', '2', 'heroku/java'] },
		{ cmd: 'heroku', args: ['addons:create', 'cloudamqp:lemur'] },
		{ cmd: 'heroku', args: ['config:set', 'MAVEN_CUSTOM_OPTS=-DskipTests=false;maven.javadoc.skip=true'] },
		{ cmd: 'heroku', args: ['config:set', 'NODE_MODULES_CACHE=false'] },
		{ cmd: 'heroku', args: ['config:set', 'OPENID_HTTP_TIMEOUT=4000'] },
		{ cmd: 'heroku', args: ['config:set', 'OPENID_ISSUER_URI=https://test.salesforce.com/'] },
		{ cmd: 'git', args: ['push', 'heroku', 'master:master'] },
		{ cmd: 'heroku', args: ['ps:scale', 'dataCreator=1'] },
		{ cmd: 'heroku', args: ['ps:scale', 'questionBuilder=1'] },
		{ cmd: 'heroku', args: ['ps:scale', 'resultWriter=1'] },
		{ cmd: 'heroku', args: ['ps:scale', 'routeSolver=1'] }
	],

	deployToHeroku = (result) => {

		debug.log('Heroku deploy');
		return shell.executeCommands(deployToHerokuCommands, { exitOnError: true })
			.then((deployToHerokuResults) => {
				result.herokuResults = deployToHerokuResults;
				result.herokuApp = JSON.parse(_.values(result.herokuResults)[0].stdout);
				debug.log('Heroku deploy complete');
				return result;
			});

	},

	/**
	 * Deploy to Salesforce
	 */
	deployToSalesforceCommands = [
		{ cmd: 'sfdx', args: ['force:org:create', '-f', 'src/apex/config/project-scratch-def.json', '-s'] },
		{ cmd: 'sfdx', args: ['force:source:push'] },
		{ cmd: 'sfdx', args: ['force:user:permset:assign', '-n', 'OrizuruAdmin'] },
		{ cmd: 'sfdx', args: ['force:apex:test:run', '-r', 'human', '--json'] },
		{ cmd: 'sfdx', args: ['force:org:display', '--json'] },
		{ cmd: 'sfdx', args: ['force:user:password:generate', '--json'] }
	],

	deployToSalesforce = (result) => {

		debug.log('Deploy to Salesforce');
		return shell.executeCommands(deployToSalesforceCommands, { exitOnError: true })
			.then(results => {
				debug.log('Deployed to Salesforce');
				result.sfdxResults = results;
				result.connectionInfo = JSON.parse(_.values(result.sfdxResults)[4].stdout).result;
				return result;
			});

	},

	/**
	 * Exit functions
	 */
	exit = () => {
		process.exit(0);
	},

	exitWithError = (error) => {
		debug.error(error);
		process.exit(1);
	};

module.exports = {
	deployToHeroku,
	openSsl,
	deployToSalesforce,
	createConnection,
	readCertificateFiles,
	createConnectedApp,
	updateClientIdOnHeroku,
	createNamedCredential,
	updateJwtSigningKeyOnHeroku,
	openOrg,
	exit,
	exitWithError
};
