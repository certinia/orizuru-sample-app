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
	jsForceConnection = require('../shared/jsForceConnection'),
	sfWriter = require('../shared/sfWriter'),

	dataToCreate = {
		accounts: require('../../res/dataCreator/Account.json').records,
		contacts: require('../../res/dataCreator/Contact.json').records,
		orders: require('../../res/dataCreator/Order.json').records,
		vehicles: require('../../res/dataCreator/Vehicle__c.json').records,
		vehicleTypes: require('../../res/dataCreator/VehicleType__c.json').records,
		warehouses: require('../../res/dataCreator/Warehouse__c.json').records,
		warehouseContacts: require('../../res/dataCreator/WarehouseContacts.json').records
	},

	CREATED_ACCOUNTS = { message: 'Created Accounts', status: 'CREATED_ACCOUNTS' },
	CREATED_CONTACTS = { message: 'Created Contacts', status: 'CREATED_CONTACTS' },
	CREATED_WAREHOUSE_CONTACTS = { message: 'Created Warehouse Contacts', status: 'CREATED_WAREHOUSE_CONTACTS' },
	CREATED_VEHICLE_TYPE = { message: 'Created Vehicle Types', status: 'CREATED_VEHICLE_TYPE' },
	CREATED_WAREHOUSES = { message: 'Created Warehouses', status: 'CREATED_WAREHOUSES' },
	CREATED_VEHICLES = { message: 'Created Vehicles', status: 'CREATED_VEHICLES' },
	CREATED_ORDERS = { message: 'Created Orders', status: 'CREATED_ORDERS' },

	getConnection = ({ context, incomingMessage }) => {
		return jsForceConnection.fromContext(context)
			.then(conn => ({ incomingMessage, Conn: conn }));
	},

	createObjects = (Conn, objName, data) => {
		return sfWriter.bulkCreateObject(Conn, objName, data);
	},

	sendDataGeneratorStepEvent = ({ conn, status, incomingMessage }) => {
		return sfWriter.sendPlatformEvent(conn, { eventType: 'DataGeneratorStep__e', message: status.message, status: status.status, id: incomingMessage.generateDataTaskId });
	},

	createAccounts = (result) => {
		return createObjects(result.Conn, 'Account', dataToCreate.accounts)
			.then(accounts => {
				return sendDataGeneratorStepEvent({ conn: result.Conn, status: CREATED_ACCOUNTS, incomingMessage: result.incomingMessage })
					.then(() => {
						result.Accounts = accounts;
						return result;
					});
			});
	},

	createContacts = (result) => {
		const
			Conn = result.Conn,

			contactsToCreate = _.map(dataToCreate.contacts, (record, count) => {
				record.AccountId = result.Accounts[count].id;
				return record;
			});

		return createObjects(Conn, 'Contact', contactsToCreate).then(contacts => {
			return sendDataGeneratorStepEvent({ conn: result.Conn, status: CREATED_CONTACTS, incomingMessage: result.incomingMessage })
				.then(() => {
					result.Contacts = contacts;
					return result;
				});
		});
	},

	createWarehouseContacts = (result) => {
		const
			Conn = result.Conn,

			contactsToCreate = _.map(dataToCreate.warehouseContacts, (record, count) => {
				record.AccountId = result.Accounts[count].id;
				return record;
			});

		return createObjects(Conn, 'Contact', contactsToCreate).then(contacts => {
			return sendDataGeneratorStepEvent({ conn: result.Conn, status: CREATED_WAREHOUSE_CONTACTS, incomingMessage: result.incomingMessage })
				.then(() => {
					result.WarehouseContacts = contacts;
					return result;
				});
		});
	},

	createVehicleTypes = (result) => {
		const
			Conn = result.Conn;

		return createObjects(Conn, 'VehicleType__c', dataToCreate.vehicleTypes).then(vehicleTypes => {
			return sendDataGeneratorStepEvent({ conn: result.Conn, status: CREATED_VEHICLE_TYPE, incomingMessage: result.incomingMessage })
				.then(() => {
					result.VehicleTypes__c = vehicleTypes;
					return result;
				});
		});
	},

	createWarehouses = (result) => {
		const
			Conn = result.Conn,
			WarehouseContacts = result.WarehouseContacts,

			warehousesToCreate = _.map(dataToCreate.warehouses, (record, count) => {
				record.Contact__c = WarehouseContacts[count].id;
				return record;
			});

		return createObjects(Conn, 'Warehouse__c', warehousesToCreate).then(warehouses => {
			return sendDataGeneratorStepEvent({ conn: result.Conn, status: CREATED_WAREHOUSES, incomingMessage: result.incomingMessage })
				.then(() => {
					result.Warehouses__c = warehouses;
					return result;
				});
		});
	},

	createVehicles = (result) => {
		const
			Conn = result.Conn,
			VehicleTypes__c = result.VehicleTypes__c,
			Warehouses__c = result.Warehouses__c,
			WarehouseContacts = result.WarehouseContacts,

			vehiclesToCreate = _.map(dataToCreate.vehicles, (record, count) => {
				record.VehicleType__c = VehicleTypes__c[0].id;
				record.Warehouse__c = Warehouses__c[count % _.size(WarehouseContacts)].id;

				return record;
			});

		return createObjects(Conn, 'Vehicle__c', vehiclesToCreate).then(vehicles => {
			return sendDataGeneratorStepEvent({ conn: result.Conn, status: CREATED_VEHICLES, incomingMessage: result.incomingMessage })
				.then(() => {
					result.Vehicles__c = vehicles;
					return result;
				});
		});
	},

	createOrders = (result) => {
		const
			Conn = result.Conn,
			Accounts = result.Accounts,
			Contacts = result.Contacts,

			vehiclesToCreate = _.map(dataToCreate.orders, (record, count) => {
				record.AccountId = Accounts[count].id;
				record.ShipToContactId = Contacts[count].id;

				return record;
			});

		return createObjects(Conn, 'Order', vehiclesToCreate).then(orders => {
			return sendDataGeneratorStepEvent({ conn: result.Conn, status: CREATED_ORDERS, incomingMessage: result.incomingMessage })
				.then(() => {
					result.orders = orders;
					return result;
				});
		});
	},

	createAllData = ({ message, context }) => {
		return getConnection({ context, incomingMessage: message })
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
