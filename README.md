# Orizuru Sample App

<img src="./docs/readme/logo.svg" width="200" align="right"/>

## Architecture

![Architecture](./docs/readme/Architecture.gif "Architecture")

## Getting Started

Deploy the Salesforce component of the app using the button below.

[![Deploy](https://deploy-to-sfdx.com/dist/assets/images/DeployToSFDX.svg)](https://deploy-to-sfdx.com)

### Connected App

When communicating between Force.com and Heroku, we use a Connected App with a certificate to verify user identity.

A certificate can be generated using the following steps:

1. Run `openssl version` to check that you have OpenSSL installed
	* If you don't have OpenSSL then it can be installed via brew:

		* `brew install openssl`

1. Run the following OpenSSL command to generate your private key and public certificate. Answer the questions when prompted.
	
	`openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem`

1. Review the created certificate:
	
	`openssl x509 -text -noout -in certificate.pem`

This will have generated two files:

* key.pem - the private key
* certificate.pem - the public key
	
The private key is used as the `JWT_SIGNING_KEY` environment variable on Heroku and the public key is used as the certificate of the Connected App.

1. The `Deploy to SFDX` button will have deployed a Connected App without a certificate. To update the app:
	1. Log in the the Salesforce organisation into which you deployed the components.
	1. Go to `Setup`.
	1. Select `Apps` > `App Manager`.
	1. Select the dropdown for the `Orizuru` connected app and then `Edit`.
	1. In the `API (Enable OAuth Settings)`section:
		* Select `Use digital signatures`
		* Select `Choose File` and select the `certificate.pem` file that you generated earlier.
 	1. Save the connected app.

## Local Development Environment

## Deploying to Force.com
This project is built using [Salesforce DX](https://www.salesforce.com/products/platform/products/salesforce-dx/).

1. If you don't have the SFDX CLI...
	1. Download it [here](https://developer.salesforce.com/tools/sfdxcli)
	1. Alternatively, install via brew
		* `brew cask install caskroom/cask/sfdx`

1. Sign up for a Dev Hub trial.
	1. Complete the form on the [sign up page](https://developer.salesforce.com/promotions/orgs/dx-signup)
	1. Note. The org will expire in 30 days

1. Open the command line in the root folder of this project.

1. Authorize the Dev Hub.
	* `sfdx force:auth:web:login -d`
	* Enter username and password
	* Press allow when prompted to allow access to 'Global Connected App'

1. Setup a scratch org.
	1. Create a scratch org: 
		* `sfdx force:org:create -f src/apex/config/project-scratch-def.json -s`
	1. Push source to scratch org:
		* `sfdx force:source:push`
	1. Assign yourself the OrizuruAdmin permission set:
		* `sfdx force:user:permset:assign -n OrizuruAdmin`
	1. Launch the scratch org in a browser:
		* `sfdx force:org:open`

1. Set up the Connected App.
	1. Go to `Setup`.
	1. Select `Apps` > `Connected Apps` > `Manage Connected Apps`.
	1. Select `Orizuru`.
	1. Select `Edit Policies` and change the permitted users to `Admin approved users are pre-authorized`.
	1. If you are developing locally then you need to update your `local.run.properties` file with the new Connected App Consumer Key.
		* Go to `Setup`.
		* Select `Apps` > `App Manager`.
		* Select `View` from the drop down on the `Orizuru` Connected App.
		* In the `local.run.properties` file, update `OPENID_CLIENT_ID` with the `Consumer Key`.

1. Add the Connected App to the Permission Set and assign it to your user.
	1. Go to `Permission Sets`.
	1. Select `Orizuru Admin`.
	1. Select `Assigned Connected Apps`.
	1. Select `Edit`.
	1. Add `Orizuru` to the `Enabled Apps`.
	1. `Save`.
	1. Select `Manage Assignments`.
	1. Add the permission set to your user.

### RabbitMQ Setup

This project uses [RabbitMQ](https://www.rabbitmq.com/) as the messaging framework to communicate between Heroku dynos. 

To debug the project locally, RabbitMQ need to be running with the required queues, follow these steps to get up and running.

1. Install [RabbitMQ](https://www.rabbitmq.com/)
	* Download it [here](https://www.rabbitmq.com/download.html)
	* Alternatively, install via brew
		* `brew install rabbitmq`

1. After the installation is complete, start the RabbitMQ server
	* `rabbitmq-server -detached`

1. Navigate to [http://localhost:15672/#/](http://localhost:15672/#/) and login.
	* The default username is `guest` with the password `guest`.
	
		![RabbitMQ Login](./docs/readme/RabbitMQLogin.png "RabbitMQ Login")
1. Add the required queues.
	* Select the `Queues` tab.
	* Expand the `Add a new queue` section.
	* Add the queue name `/api/initialize`.
	* Select `Add queue`.
	* Repeat the last two steps for the queues `/api/calculateRoute` and `/routeWriter`.
	* You should end up with something like this:

		![RabbitMQ Queues](./docs/readme/RabbitMQQueues.png "RabbitMQ Queues")

1. Configure the project to use the local instance of RabbitMQ.
	* Open `local.run.properties`
	* Add `CLOUDAMQP_URL=amqp://localhost`
