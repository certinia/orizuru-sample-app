'use strict';

const
	_ = require('lodash'),
	jsforce = require('jsforce'),
	shell = require('./deploy/shell'),

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

	opensslCommands = [{
		cmd: 'openssl',
		args: ['req', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'key.pem', '-x509', '-days', '365', '-out', 'certificate.pem', '-subj', '/C=UK/ST=North Yorkshire/L=Harrogate/O=FinancialForce/OU=Research Team/CN=test.com']
	}],

	readCertificateCommands = [
		{ cmd: 'cat', args: ['certificate.pem'] },
		{ cmd: 'cat', args: ['key.pem'] }
	],

	orgCreationCommands = [
		{ cmd: 'sfdx', args: ['force:org:create', '-f', 'src/apex/config/project-scratch-def.json', '-s'] },
		{ cmd: 'sfdx', args: ['force:source:push'] },
		{ cmd: 'sfdx', args: ['force:user:permset:assign', '-n', 'OrizuruAdmin'] },
		{ cmd: 'sfdx', args: ['force:apex:test:run', '-r', 'human', '--json'] },
		{ cmd: 'sfdx', args: ['force:org:display', '--json'] },
		{ cmd: 'sfdx', args: ['force:user:password:generate', '--json'] }
	],

	orgOpenCommands = [
		{ cmd: 'sfdx', args: ['force:org:open'] }
	],

	/**
	 * Functions
	 */
	readCertificateFiles = (result) => {

		console.log('Read certificate files');

		return shell.executeCommands('shell', readCertificateCommands)
			.then(certificateResults => {
				result.certificateResults = _.map(_.values(certificateResults), value => value.stdout);
				return result;
			});

	},

	createConnection = (result) => {

		const
			connectionInfo = JSON.parse(_.values(result.orgCreationCommands)[4].stdout).result,
			conn = new jsforce.Connection({
				instanceUrl: connectionInfo.instanceUrl,
				accessToken: connectionInfo.accessToken
			});

		result.conn = conn;
		return result;
	},

	createConnectedApp = (result) => {

		console.log('Create connected app');

		const
			conn = result.conn,

			connectedApp = {
				contactEmail: 'test@test.com',
				label: 'Orizuru',
				fullName: 'Orizuru',
				oauthConfig: {
					callbackUrl: 'https://login.salesforce.com/success',
					scopes: ['Api', 'RefreshToken'],
					certificate: result.certificateResults[0]
				}
			};

		return conn.metadata.create('ConnectedApp', connectedApp)
			.then(connectedApp => conn.metadata.read('ConnectedApp', 'Orizuru'))
			.then(connectedApp => {
				result.connectedApp = connectedApp;
				return result;
			});

	},

	updateClientIdOnHeroku = (result) => {

		console.log('Update Heroku with Connected App Client ID');
		const
			connectedApp = result.connectedApp,
			herokuConfigCommand = [{
				cmd: 'heroku',
				args: ['config:set', `OPENID_CLIENT_ID=${connectedApp.oauthConfig.consumerKey}`]
			}];

		return shell.executeCommands('shell', herokuConfigCommand)
			.then(() => result);

	},

	updateJwtSigningKeyOnHeroku = (result) => {

		console.log('Update JWT_SIGNING_KEY on Heroku');

		const
			herokuConfigCommand = [{
				cmd: 'heroku',
				args: ['config:set', `JWT_SIGNING_KEY=${result.certificateResults[1]}`]
			}];

		return shell.executeCommands('shell', herokuConfigCommand)
			.then(() => result);

	},

	createNamedCredential = (result) => {

		console.log('Create Named Credential');

		const
			conn = result.conn,

			app = JSON.parse(_.values(result.herokuResults)[0].stdout),

			namedCredential = {
				endpoint: app.web_url,
				label: 'Orizuru',
				fullName: 'Orizuru',
				principalType: 'Anonymous',
				protocol: 'NoAuthentication'
			};

		return conn.metadata.create('NamedCredential', namedCredential)
			.then(() => conn.metadata.read('NamedCredential', 'Orizuru'))
			.then(namedCredential => {
				result.namedCredential = namedCredential;
				return result;
			});

	},

	openOrg = (result) => {

		console.log('Open org');
		return shell.executeCommands('shell', orgOpenCommands);

	};

console.log('Beginning deploy');
console.log('Heroku deploy');
return shell.executeCommands('Heroku', deployToHerokuCommands)
	.then((result) => {
		console.log('Heroku deploy complete');
		return shell.executeCommands('OpenSSL', opensslCommands)
			.then(() => ({ herokuResults: result }));
	})
	.then(result => {
		console.log('Certificates generated');
		console.log('Deploy to Salesforce');
		return shell.executeCommands('Deployment', orgCreationCommands)
			.then(results => {
				console.log('Deploy to Salesforce complete');
				result.orgCreationCommands = results;
				return result;
			});
	})
	.then(createConnection)
	.then(readCertificateFiles)
	.then(createConnectedApp)
	.then(updateClientIdOnHeroku)
	.then(createNamedCredential)
	.then(updateJwtSigningKeyOnHeroku)
	.then(openOrg)
	.then(() => process.exit(0));
