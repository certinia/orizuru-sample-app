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
 */

package com.financialforce.routesolver.solver;

import static org.junit.Assert.assertEquals;

import org.hamcrest.core.IsInstanceOf;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.financialforce.routesolver.exception.SolverException;
import com.financialforce.routesolver.problem.jsprit.Problem;
import com.financialforce.routesolver.problem.jsprit.Problem.ProblemType;

public class DefaultConverterTest {

	@Rule
	public final ExpectedException exception = ExpectedException.none();

	@Test
	public void transform_shouldConvertAProblemToXml() throws Exception {

		// Given
		ProblemType problemType = new ProblemType();
		problemType.setFleetComposition("FINITE");

		Problem problem = new Problem();
		problem.setProblemType(problemType);

		DefaultConverter converter = new DefaultConverter();

		// When
		String xml = converter.transform(problem);

		// Then
		assertEquals(
				"<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><problem><problemType><fleetComposition>FINITE</fleetComposition></problemType></problem>",
				xml);

	}

	@Test
	public void transform_shouldThrowAnExceptionForNullXml() throws Exception {

		// Given
		DefaultConverter converter = new DefaultConverter();

		// expect
		exception.expect(SolverException.class);
		exception.expectMessage("Failed to handle message: Failed to convert problem to xml");
		exception.expectCause(IsInstanceOf.<Throwable>instanceOf(IllegalArgumentException.class));

		// When
		converter.transform(null);

	}

}
