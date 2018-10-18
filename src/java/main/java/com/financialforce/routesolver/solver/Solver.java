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

package com.financialforce.routesolver.solver;

import com.graphhopper.jsprit.core.problem.solution.VehicleRoutingProblemSolution;

import com.financialforce.routesolver.exception.SolverException;
import com.financialforce.routesolver.interfaces.ISolver;
import com.financialforce.routesolver.interfaces.ITransform;
import com.financialforce.routesolver.problem.avro.Answer;
import com.financialforce.routesolver.problem.avro.Question;
import com.financialforce.routesolver.problem.jsprit.Problem;

/**
 * The main class to solve Vehicle Routing Questions.
 * <p>
 * This class defines the algorithm and allows components to be switched out if required.
 * <p>
 * The main flow is:
 * <p>
 * <ul>
 * <li>Transform the {@link Question} (Avro) to a {@link Problem} (JAXB)
 * <li>Convert the {@link Problem} to XML
 * <li>Use the Jsprit toolkit (https://jsprit.github.io/) to solve the problem
 * <li>Transform the {@link VehicleRoutingProblemSolution} to an {@link Answer}
 * </ul>
 */
public class Solver implements ISolver<Question, Answer> {

	private ITransform<Question, Problem> inputTransform = null;
	private ITransform<Problem, String> xmlTransform = null;
	private ITransform<String, VehicleRoutingProblemSolution> solutionFinder = null;
	private ITransform<VehicleRoutingProblemSolution, Answer> outputTransform = null;

	public Solver() {

		this.inputTransform = new DefaultInputTransformer();
		this.xmlTransform = new DefaultConverter();
		this.solutionFinder = new DefaultSolutionFinder();
		this.outputTransform = new DefaultOutputTransformer();

	}

	/**
	 * Solve the given problem using the strategy provided.
	 */
	@Override
	public Answer solve(Question input) throws SolverException {

		// Transform the input
		Problem xmlInput = inputTransform.transform(input);

		// Convert the input to XML
		String xml = xmlTransform.transform(xmlInput);

		// Find the solution
		VehicleRoutingProblemSolution solution = solutionFinder.transform(xml);

		// Transform to the output
		return outputTransform.transform(solution);

	}

	public void setInputTransform(ITransform<Question, Problem> inputTransform) {
		this.inputTransform = inputTransform;
	}

	public void setXmlTransform(ITransform<Problem, String> xmlTransform) {
		this.xmlTransform = xmlTransform;
	}

	public void setSolutionFinder(ITransform<String, VehicleRoutingProblemSolution> solutionFinder) {
		this.solutionFinder = solutionFinder;
	}

	public void setOutputTransform(ITransform<VehicleRoutingProblemSolution, Answer> outputTransform) {
		this.outputTransform = outputTransform;
	}

}
