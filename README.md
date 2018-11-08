# Orizuru Sample App

[![Build Status](https://travis-ci.org/financialforcedev/orizuru-sample-app.svg?branch=master)](https://travis-ci.org/financialforcedev/orizuru-sample-app)

<img src="./docs/readme/logo.svg" width="200" align="right"/>

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
Full details of the implementation can be found in the [Implementation](https://github.com/financialforcedev/orizuru-sample-app/wiki/Implementation) section of the Wiki.

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
