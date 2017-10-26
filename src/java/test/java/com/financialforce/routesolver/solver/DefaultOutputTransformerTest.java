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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Arrays;

import com.graphhopper.jsprit.core.problem.Location;
import com.graphhopper.jsprit.core.problem.job.Service;
import com.graphhopper.jsprit.core.problem.solution.VehicleRoutingProblemSolution;
import com.graphhopper.jsprit.core.problem.solution.route.VehicleRoute;
import com.graphhopper.jsprit.core.problem.solution.route.activity.ServiceActivity;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.modelmapper.ModelMapper;

import com.financialforce.routesolver.exception.SolverException;
import com.financialforce.routesolver.problem.avro.Answer;

public class DefaultOutputTransformerTest {

	@Rule
	public final ExpectedException exception = ExpectedException.none();

	@Test
	public void transform_shouldConvertTheVehicleRoutingProblemSolutionToAnAnswer() throws Exception {

		// given
		Service service = Service.Builder.newInstance("hello").addSizeDimension(0, 10)
				.setLocation(Location.newInstance("loc")).build();
		ServiceActivity activity = ServiceActivity.newInstance(service);

		VehicleRoute route = VehicleRoute.emptyRoute();
		route.getTourActivities().addActivity(activity);

		VehicleRoutingProblemSolution solution = new VehicleRoutingProblemSolution(Arrays.asList(route), 500d);

		DefaultOutputTransformer converter = new DefaultOutputTransformer();

		// when
		Answer answer = converter.transform(solution);

		// then
		assertEquals(answer.getSolution().getCost(), 500d, 0d);

	}

	@Test
	public void transform_shouldThrowASolverExceptionIfTheMappingFails() throws Exception {

		// given
		ModelMapper mapper = mock(ModelMapper.class);
		when(mapper.map(any(), any())).thenThrow(NullPointerException.class);

		DefaultOutputTransformer converter = new DefaultOutputTransformer();
		converter.setMapper(mapper);

		// expect
		exception.expect(SolverException.class);

		// when
		converter.transform(null);

	}

}
