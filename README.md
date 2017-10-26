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

To get started, follow the [Getting Started](https://github.com/financialforcedev/orizuru-sample-app/wiki/Getting-Started) steps in the Wiki.

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
