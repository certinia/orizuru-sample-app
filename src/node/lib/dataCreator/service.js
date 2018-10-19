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
 **/

'use strict';

const
	_ = require('lodash'),
	fs = require('fs'),
	path = require('path'),

	connection = require('../salesforce/connection'),
	writer = require('../salesforce/writer'),

	CREATED_ACCOUNTS = { message: 'Created Accounts', status: 'CREATED_ACCOUNTS' },
	CREATED_CONTACTS = { message: 'Created Contacts', status: 'CREATED_CONTACTS' },
	CREATED_WAREHOUSE_CONTACTS = { message: 'Created Warehouse Contacts', status: 'CREATED_WAREHOUSE_CONTACTS' },
	CREATED_VEHICLE_TYPE = { message: 'Created Vehicle Types', status: 'CREATED_VEHICLE_TYPE' },
	CREATED_WAREHOUSES = { message: 'Created Warehouses', status: 'CREATED_WAREHOUSES' },
	CREATED_VEHICLES = { message: 'Created Vehicles', status: 'CREATED_VEHICLES' },
	CREATED_ORDERS = { message: 'Created Orders', status: 'CREATED_ORDERS' },

	readRecords = (relativePath) => {
		const
			filePath = path.resolve(__dirname, relativePath),
			buffer = fs.readFileSync(filePath),
			contents = buffer.toString(),
			json = JSON.parse(contents);
		return json.records;
	},

	getDataToCreate = (result) => {

		result.dataToCreate = {
			accounts: readRecords('../../res/dataCreator/Account.json'),
			contacts: readRecords('../../res/dataCreator/Contact.json'),
			orders: readRecords('../../res/dataCreator/Order.json'),
			vehicles: readRecords('../../res/dataCreator/Vehicle__c.json'),
			vehicleTypes: readRecords('../../res/dataCreator/VehicleType__c.json'),
			warehouses: readRecords('../../res/dataCreator/Warehouse__c.json'),
			warehouseContacts: readRecords('../../res/dataCreator/WarehouseContacts.json')
		};

		return result;

	},

	getConnection = ({ context, incomingMessage }) => {
		return connection.fromContext(context)
			.then(conn => ({ incomingMessage, conn }));
	},

	createObjects = ({ conn, objName, data }) => {
		return writer.bulkCreateObject(conn, objName, data);
	},

	sendDataGeneratorStepEvent = ({ conn, status, incomingMessage }) => {
		return writer.sendPlatformEvent(conn, { eventType: 'DataGeneratorStep__e', message: status.message, status: status.status, id: incomingMessage.generateDataTaskId });
	},

	createAccounts = (result) => {

		const conn = result.conn;

		return createObjects({ conn, objName: 'Account', data: result.dataToCreate.accounts })
			.then(accounts => {
				return sendDataGeneratorStepEvent({ conn, status: CREATED_ACCOUNTS, incomingMessage: result.incomingMessage })
					.then(() => {
						result.Accounts = accounts;
						return result;
					});
			});

	},

	createContacts = (result) => {

		const
			conn = result.conn,

			contactsToCreate = _.map(result.dataToCreate.contacts, (record, count) => {
				record.AccountId = result.Accounts[count].id;
				return record;
			});

		return createObjects({ conn, objName: 'Contact', data: contactsToCreate })
			.then(contacts => {
				return sendDataGeneratorStepEvent({ conn, status: CREATED_CONTACTS, incomingMessage: result.incomingMessage })
					.then(() => {
						result.Contacts = contacts;
						return result;
					});
			});

	},

	createWarehouseContacts = (result) => {

		const
			conn = result.conn,

			contactsToCreate = _.map(result.dataToCreate.warehouseContacts, (record, count) => {
				record.AccountId = result.Accounts[count].id;
				return record;
			});

		return createObjects({ conn, objName: 'Contact', data: contactsToCreate })
			.then(contacts => {
				return sendDataGeneratorStepEvent({ conn, status: CREATED_WAREHOUSE_CONTACTS, incomingMessage: result.incomingMessage })
					.then(() => {
						result.WarehouseContacts = contacts;
						return result;
					});
			});

	},

	createVehicleTypes = (result) => {

		const conn = result.conn;

		return createObjects({ conn, objName: 'VehicleType__c', data: result.dataToCreate.vehicleTypes })
			.then(vehicleTypes => {
				return sendDataGeneratorStepEvent({ conn, status: CREATED_VEHICLE_TYPE, incomingMessage: result.incomingMessage })
					.then(() => {
						result.VehicleTypes__c = vehicleTypes;
						return result;
					});
			});

	},

	createWarehouses = (result) => {

		const
			conn = result.conn,
			WarehouseContacts = result.WarehouseContacts,

			warehousesToCreate = _.map(result.dataToCreate.warehouses, (record, count) => {
				record.Contact__c = WarehouseContacts[count].id;
				return record;
			});

		return createObjects({ conn, objName: 'Warehouse__c', data: warehousesToCreate })
			.then(warehouses => {
				return sendDataGeneratorStepEvent({ conn, status: CREATED_WAREHOUSES, incomingMessage: result.incomingMessage })
					.then(() => {
						result.Warehouses__c = warehouses;
						return result;
					});
			});

	},

	createVehicles = (result) => {

		const
			conn = result.conn,
			VehicleTypes__c = result.VehicleTypes__c,
			Warehouses__c = result.Warehouses__c,
			WarehouseContacts = result.WarehouseContacts,

			vehiclesToCreate = _.map(result.dataToCreate.vehicles, (record, count) => {
				record.VehicleType__c = VehicleTypes__c[0].id;
				record.Warehouse__c = Warehouses__c[count % _.size(WarehouseContacts)].id;

				return record;
			});

		return createObjects({ conn, objName: 'Vehicle__c', data: vehiclesToCreate })
			.then(vehicles => {
				return sendDataGeneratorStepEvent({ conn, status: CREATED_VEHICLES, incomingMessage: result.incomingMessage })
					.then(() => {
						result.Vehicles__c = vehicles;
						return result;
					});
			});

	},

	createOrders = (result) => {
		const
			conn = result.conn,
			Accounts = result.Accounts,
			Contacts = result.Contacts,

			vehiclesToCreate = _.map(result.dataToCreate.orders, (record, count) => {
				record.AccountId = Accounts[count].id;
				record.ShipToContactId = Contacts[count].id;

				return record;
			});

		return createObjects({ conn, objName: 'Order', data: vehiclesToCreate })
			.then(orders => {
				return sendDataGeneratorStepEvent({ conn: result.conn, status: CREATED_ORDERS, incomingMessage: result.incomingMessage })
					.then(() => {
						result.orders = orders;
						return result;
					});
			});
	},

	createAllData = ({ message, context }) => {
		return getConnection({ context, incomingMessage: message })
			.then(getDataToCreate)
			.then(createAccounts)
			.then(createContacts)
			.then(createWarehouseContacts)
			.then(createVehicleTypes)
			.then(createWarehouses)
			.then(createVehicles)
			.then(createOrders);
	};

module.exports = {
	createData: createAllData
};
