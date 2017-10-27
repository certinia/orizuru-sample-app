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
	deployFunctions = require('./deploy/deployFunctions'),

	/**
	 * Config
	 */
	config = {
		parameters: {
			connectedApp: {
				name: 'Orizuru',
				contactEmail: 'test@test.com'
			},
			namedCredential: {
				name: 'Orizuru'
			}
		}
	},

	deploy = () => {

		return Promise.resolve(config)
			.then(deployFunctions.deployToHeroku)
			.then(deployFunctions.openSsl)
			.then(deployFunctions.deployToSalesforce)
			.then(deployFunctions.createConnection)
			.then(deployFunctions.readCertificateFiles)
			.then(deployFunctions.createConnectedApp)
			.then(deployFunctions.updateClientIdOnHeroku)
			.then(deployFunctions.createNamedCredential)
			.then(deployFunctions.updateJwtSigningKeyOnHeroku)
			.then(deployFunctions.openOrg)
			.then(deployFunctions.exit)
			.catch(deployFunctions.exitWithError);

	};

module.exports = {
	deploy
};

deploy();
