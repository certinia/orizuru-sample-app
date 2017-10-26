/*
 * Copyright (c) 2017 FinancialForce.com, inc.  All rights reserved.
 *
 * This is a proof of concept.
 * It forms the basis of recommendations for architecture, patterns, dependencies, and has
 * some of the characteristics which will eventually be present in FF hybrid apps.
 *
 * However, it lacks important functionality and checks.
 * It does not conform to SOC1 or any other auditable process.
 *
 * We do not endorse any attempt to use this codebase as the blueprint for production code.
 */
'use strict';

module.exports = {
	'extends': '@financialforcedev',
	overrides: {
		files: [
			//This is data setup scripts hence does not need to be complient with product standards.
			"lib/dataCreator/service.js",
			"spec/dataCreator/service.spec.js"
		],
		rules: {
			camelcase: true
		}
	}
};
