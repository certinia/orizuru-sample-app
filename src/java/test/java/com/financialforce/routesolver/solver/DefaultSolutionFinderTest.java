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

import static org.junit.Assert.assertEquals;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import com.graphhopper.jsprit.core.problem.solution.VehicleRoutingProblemSolution;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.financialforce.routesolver.exception.SolverException;

public class DefaultSolutionFinderTest {

	@Rule
	public final ExpectedException exception = ExpectedException.none();

	@Test
	public void transform_shouldFindTheSolution() throws Exception {

		// given
		String inputXml = getFileContents("vehicleRoutingProblem.xml");

		DefaultSolutionFinder solutionFinder = new DefaultSolutionFinder();

		// when
		VehicleRoutingProblemSolution solution = solutionFinder.transform(inputXml);

		// then
		assertEquals(solution.getRoutes().size(), 8);

	}

	@Test
	public void transform_shouldThrowASolverExceptionForNoXml() throws Exception {

		// given
		DefaultSolutionFinder solutionFinder = new DefaultSolutionFinder();

		// expect
		exception.expect(SolverException.class);
		exception.expectMessage("Failed to handle message: Failed to find solution");

		// when
		solutionFinder.transform(null);

	}

	private String getFileContents(String fileName) throws IOException {

		ByteArrayOutputStream output = null;

		try {

			InputStream input = getClass().getResourceAsStream(fileName);

			output = new ByteArrayOutputStream();

			byte[] buffer = new byte[8192];
			int n = 0;
			while (-1 != (n = input.read(buffer))) {
				output.write(buffer, 0, n);
			}

			return new String(output.toByteArray());

		} catch (IOException ioe) {
			if (output != null) {
				output.close();
			}
		}

		return null;
	}

}
