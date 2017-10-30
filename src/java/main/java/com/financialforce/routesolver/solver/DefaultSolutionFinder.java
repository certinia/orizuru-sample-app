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

package com.financialforce.routesolver.solver;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Collection;

import com.graphhopper.jsprit.core.algorithm.VehicleRoutingAlgorithm;
import com.graphhopper.jsprit.core.algorithm.box.Jsprit;
import com.graphhopper.jsprit.core.algorithm.termination.IterationWithoutImprovementTermination;
import com.graphhopper.jsprit.core.problem.VehicleRoutingProblem;
import com.graphhopper.jsprit.core.problem.VehicleRoutingProblem.FleetSize;
import com.graphhopper.jsprit.core.problem.solution.VehicleRoutingProblemSolution;
import com.graphhopper.jsprit.core.util.Solutions;
import com.graphhopper.jsprit.io.problem.VrpXMLReader;

import com.financialforce.routesolver.exception.SolverException;
import com.financialforce.routesolver.interfaces.ITransform;

/**
 * Finds the solution to the Vehicle Routing Problem provided.
 * <p>
 * The input must be in XML form.
 */
public class DefaultSolutionFinder implements ITransform<String, VehicleRoutingProblemSolution> {

	@Override
	public VehicleRoutingProblemSolution transform(String inputXml) throws SolverException {

		VehicleRoutingProblemSolution solution = null;

		try {

			/*
			* Define the problem builder
			*/
			VehicleRoutingProblem.Builder vrpBuilder = VehicleRoutingProblem.Builder.newInstance();

			/*
			* Use the XMLReader to read in the problem
			*/
			InputStream is = new ByteArrayInputStream(inputXml.getBytes());
			VrpXMLReader reader = new VrpXMLReader(vrpBuilder);
			reader.setSchemaValidation(false);
			reader.read(is);

			vrpBuilder.setFleetSize(FleetSize.FINITE);

			/*
			* Build the problem. 
			* By default, transportCosts are crowFlyDistances (as usually used for vrp-instances).
			*/
			VehicleRoutingProblem problem = vrpBuilder.build();

			/*
			* Create the Schrimpf algorithm
			*/
			int radialShare = (int) (problem.getJobs().size() * 0.3);
			int randomShare = (int) (problem.getJobs().size() * 0.5);
			Jsprit.Builder builder = Jsprit.Builder.newInstance(problem);
			builder.setProperty(Jsprit.Parameter.THRESHOLD_ALPHA, "0.0");
			builder.setProperty(Jsprit.Strategy.RADIAL_BEST, "0.5");
			builder.setProperty(Jsprit.Strategy.RADIAL_REGRET, "0.0");
			builder.setProperty(Jsprit.Strategy.RANDOM_BEST, "0.5");
			builder.setProperty(Jsprit.Strategy.RANDOM_REGRET, "0.0");
			builder.setProperty(Jsprit.Strategy.WORST_BEST, "0.0");
			builder.setProperty(Jsprit.Strategy.WORST_REGRET, "0.0");
			builder.setProperty(Jsprit.Strategy.CLUSTER_BEST, "0.0");
			builder.setProperty(Jsprit.Strategy.CLUSTER_REGRET, "0.0");
			builder.setProperty(Jsprit.Parameter.RADIAL_MIN_SHARE, String.valueOf(radialShare));
			builder.setProperty(Jsprit.Parameter.RADIAL_MAX_SHARE, String.valueOf(radialShare));
			builder.setProperty(Jsprit.Parameter.RANDOM_BEST_MIN_SHARE, String.valueOf(randomShare));
			builder.setProperty(Jsprit.Parameter.RANDOM_BEST_MAX_SHARE, String.valueOf(randomShare));
			builder.setProperty(Jsprit.Parameter.THREADS, "10");

			VehicleRoutingAlgorithm algorithm = builder.buildAlgorithm();
			algorithm.setPrematureAlgorithmTermination(new IterationWithoutImprovementTermination(50));

			/*
			* Find the best solution
			*/
			Collection<VehicleRoutingProblemSolution> solutions = algorithm.searchSolutions();
			solution = Solutions.bestOf(solutions);

		} catch (Exception ex) {
			throw new SolverException("Failed to find solution", ex);
		}

		return solution;

	}

}
