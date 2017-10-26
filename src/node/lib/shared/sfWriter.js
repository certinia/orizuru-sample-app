'use strict';

const
	createObject = (conn, objName, obj) => {
		return conn.sobject(objName).create(obj);
	},

	bulkCreateObject = (conn, objName, data) => {
		conn.bulk.pollInterval = 1000;
		conn.bulk.pollTimeout = 120000;
		return conn.bulk.load(objName, 'insert', data);
	},

	sendPlatformEvent = (eventType, conn, message, status) => {
		return createObject(conn, eventType, {
			['Severity__c']: 'Info',
			['Messages__c']: message,
			['Status__c']: status
		});
	};

module.exports = {
	bulkCreateObject,
	createObject,
	sendPlatformEvent
};
