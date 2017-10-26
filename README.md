# Orizuru Sample App

<img src="./docs/readme/logo.png" width="200" align="right"/>

For [Dreamforce '17](https://www.salesforce.com/dreamforce/), [FinancialForce](https://www.financialforce.com/) has been prototyping a Force-Heroku application with the aim of demonstrating the best features of both [Force.com](https://www.salesforce.com/products/platform/products/force/) and [Heroku](https://www.heroku.com/home).

We are part of two Dreamforce sessions in which we will share our experiences: 

* [Scale Your Business Application with Heroku](https://success.salesforce.com/sessions?eventId=a1Q3A00000stRRuUAM#/session/a2q3A000001yt8PQAQ)
* [Beat Governor Limits By Taking Your Compute Processes to Heroku](https://success.salesforce.com/Sessions#/session/a2q3A000001yuLtQAI)

The latter includes a simple application, also available on [GitHub](https://github.com/financialforcedev/df17-heroku-compute), that contains the basic principles of the Force-Heroku architecture.

__Orizuru__ aims to build upon these principles, making a more substantial step forward. This sample app implements the [Orizuru framework](https://www.npmjs.com/package/@financialforcedev/orizuru) to solve a real world business problem.

## Use Case

### The Problem
Our organization has invested in the Salesforce (Force.com) platform as it's CRM. We deliver paper products (copier paper, paper cups, gift wrapping, Orizuru Origami kits) to shops, schools, businesses and homes in the Bay area. We have multiple drivers to make deliveries. 

Our problem is that we want to create efficient delivery routes - dividing our deliveries among our drivers in the most cost effective way - and make best use of the CRM capabilities of Force.com.

In essence, this is a generalization of the well known [Travelling Salesman Problem (TSP)](https://en.wikipedia.org/wiki/Travelling_salesman_problem): the [Vehicle Routing Problem](https://en.wikipedia.org/wiki/Vehicle_routing_problem). A difficult problem to solve, which is potentially computationally demanding.

### Architecture

![Architecture](./docs/readme/Architecture.gif "Architecture")

#### Implementation
The solution uses some of the standard Salesforce objects:
* _Orders_
	- To define what we have to deliver and to whom.
* _Contacts_
	- To represent the delivery points.
	- These have delivery addresses (for which Salesforce can [automatically calculate geolocations](https://help.salesforce.com/articleView?id=data_dot_com_clean_admin_standard_clean_rules_reference.htm&type=0)).
* _Users_
	- to represent our drivers. 

To calculate the routes we have created a number of custom objects:
* _Vehicle Type_
	- The type of a vehicle, defining its attributes including the capacity.
* _Vehicle_
	- A single vehicle with a given vehicle type.
* _Delivery Route_
	- The route a driver in a vehicle needs to take, including a number of:
	* _Delivery waypoints_
		- Relating to the location and the sequence each item will be delivered; and the
	* _Warehouse_
		- the start and end point of the route.

It is assumed that we need to deliver all orders in a single delivery day, using multiple drivers, each of which is designated a warehouse contact.

Delivery routes for drivers are calculated on demand via a button click in a Lightning component. This causes a process to be kicked off on Heroku by a trivial Apex callout. 

The Apex call is "trivial" in the sense that it simply tells our Heroku application that work needs to be done - it does not send the details of the work (delivery points and drivers).

The Heroku application then queries the delivery point and driver data and construct the problem to be solved. 

The problem is passed to a Java worker which uses the [Jsprit](https://jsprit.github.io/) toolkit to solve the problem. 

The delivery routes are then saved back to Salesforce with a separate set of records being produced for each driver / route.

Task progress is visible in a Lightning page via a [progress indicator](https://www.lightningdesignsystem.com/components/progress-indicator/).

After the routes are saved in Salesforce, each driver is able to view their deliveries on a Google Maps. We have used the [Google Maps Embed API](https://developers.google.com/maps/documentation/embed/) to do this.

## Getting Started

### Deploying to Heroku

Deploy the Heroku components of the app using the button below.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Deploying to Force.com

This project is built using [Salesforce DX](https://www.salesforce.com/products/platform/products/salesforce-dx/).

1. If you don't have the SFDX CLI...
	* Download it [here](https://developer.salesforce.com/tools/sfdxcli)
	* Or alternatively, install via brew:
		* `brew cask install sfdx`
1. Sign up for a Dev Hub trial
	1. Complete the form on the [sign up page](https://developer.salesforce.com/promotions/orgs/dx-signup)
	1. Note. The org will expire in 30 days
1. Open the command line and navigate to the root folder of this project
	* Authorize the Dev Hub:
		* `sfdx force:auth:web:login`
		* Enter username and password
		* Press allow when prompted to allow access to 'Global Connected App'
1. Create a scratch org:
	* `sfdx force:org:create -f src/apex/config/project-scratch-def.json -a orizuru-sample-app`
1. Push source to scratch org:
	* `sfdx force:source:push -u orizuru-sample-app`
1. Assign yourself the Primes permission set:
	1. `sfdx force:user:permset:assign -n OrizuruAdmin -u orizuru-sample-app`
1. Launch the scratch org in a browser:
	1. `sfdx force:org:open -u orizuru-sample-app`

### Update Named Credential

When communicating between Force.com and Heroku, we use a Named Credential. The URL of this credential needs to be updated for the sample app to work.

This can be done by following these steps:

1. Log in the the Salesforce organization into which you deployed the components.
1. Go to `Setup`.
1. Select `Security` > `Named Credentials`.
1. Select `Orizuru` and then `Edit`.
1. Update the URL to your Heroku app URL e.g. _https://my-app-123.herokuapp.com_
1. Select `Save`.

### Update Connected App

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

The `Deploy to SFDX` button will have deployed a Connected App without a certificate. 

To update the app:
1. Log in the the Salesforce organization into which you deployed the components.
1. Go to `Setup`.
1. Select `Apps` > `App Manager`.
1. Select the dropdown for the `Orizuru` connected app and then `Edit`.
1. In the `API (Enable OAuth Settings)`section:
	* Select `Use digital signatures`
	* Select `Choose File` and select the `certificate.pem` file that you generated earlier.
1. Select `Save`.

The policies of the Connected app also need to be changed. This can be done by following these steps:
1. Go to `Setup`.
1. Select `Apps` > `Connected Apps` > `Manage Connected Apps`.
1. Select `Orizuru` then `Edit Policies`.
1. In the `OAuth policies` section, update the `Permitted Users` to `Admin approved users are pre-authorized`.
1. Select `Save`.

## Code Overview

This project builds upon the [Orizuru framework](https://www.npmjs.com/package/@financialforcedev/orizuru), a Node.js library that streamlines strongly typed communication between Heroku dynos, and [Force.com](https://www.salesforce.com/products/platform/products/force/).

One of our requirements was that the project should be  deployed from one GitHub repository, hence the `src` folder contains all the code.

The code has been structured in the following way:

* __src__
	* __apex__
		* contains the Force.com application code that can be deployed via SFDX.
	* __java__
		* contains the Java code used within the Route Solver dyno.
	* __node__
		* contains the Node.js code used for the web and worker dynos.
		* This is further split into:
			* _lib_
				* the Node.js code that builds upon the Orizuru framework.
				* Each file in the root folder constructs a new dyno.
				* Each sub-folder contains the service files for the associated dyno.
				* The shared folder contains shared resources.
			* _res_
				* the resources for the Node.js code.
			* _spec_
				* the test files.
