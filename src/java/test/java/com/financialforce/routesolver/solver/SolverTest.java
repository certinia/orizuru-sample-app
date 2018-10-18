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

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.graphhopper.jsprit.core.problem.solution.VehicleRoutingProblemSolution;

import org.junit.Test;

import com.financialforce.routesolver.interfaces.ITransform;
import com.financialforce.routesolver.problem.avro.Answer;
import com.financialforce.routesolver.problem.avro.Question;
import com.financialforce.routesolver.problem.jsprit.Problem;

public class SolverTest {

	@Test
	public void solve_shouldCallTheTransformationMethods() throws Exception {

		// given
		Question expectedQuestion = new Question();
		Problem expectedProblem = new Problem();
		VehicleRoutingProblemSolution expectedSolution = new VehicleRoutingProblemSolution(null, 500d);
		Answer expectedAnswer = new Answer();
		String expectedXml = "testXml";

		ITransform<Question, Problem> inputTransform = mock(ITransform.class);
		when(inputTransform.transform(expectedQuestion)).thenReturn(expectedProblem);

		ITransform<Problem, String> xmlTransform = mock(ITransform.class);
		when(xmlTransform.transform(expectedProblem)).thenReturn(expectedXml);

		ITransform<String, VehicleRoutingProblemSolution> solutionFinder = mock(ITransform.class);
		when(solutionFinder.transform(expectedXml)).thenReturn(expectedSolution);

		ITransform<VehicleRoutingProblemSolution, Answer> outputTransform = mock(ITransform.class);
		when(outputTransform.transform(expectedSolution)).thenReturn(expectedAnswer);

		Solver solver = new Solver();
		solver.setInputTransform(inputTransform);
		solver.setXmlTransform(xmlTransform);
		solver.setSolutionFinder(solutionFinder);
		solver.setOutputTransform(outputTransform);

		// when
		Answer answer = solver.solve(expectedQuestion);

		// then
		assertEquals(expectedAnswer, answer);
		verify(inputTransform, times(1)).transform(expectedQuestion);
		verify(xmlTransform, times(1)).transform(expectedProblem);
		verify(solutionFinder, times(1)).transform(expectedXml);
		verify(outputTransform, times(1)).transform(expectedSolution);

	}

}
