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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigInteger;
import java.util.Arrays;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.modelmapper.ModelMapper;

import com.financialforce.routesolver.exception.SolverException;
import com.financialforce.routesolver.problem.avro.Delivery;
import com.financialforce.routesolver.problem.avro.Location;
import com.financialforce.routesolver.problem.avro.Question;
import com.financialforce.routesolver.problem.avro.Vehicle;
import com.financialforce.routesolver.problem.avro.VehicleType;
import com.financialforce.routesolver.problem.jsprit.Problem;

public class DefaultInputTransformerTest {

	@Rule
	public final ExpectedException exception = ExpectedException.none();

	@Test
	public void transform_shouldConvertTheQuestionToAProblem() throws Exception {

		// Given
		VehicleType vehicleType = new VehicleType();
		vehicleType.setId("VT1");
		vehicleType.setCapacity(80);

		Vehicle vehicle = new Vehicle();
		vehicle.setId("V1");
		vehicle.setTypeId("VT1");
		vehicle.setLocation(new Location(-5d, 4d));

		Delivery delivery = new Delivery();
		delivery.setId("D1");
		delivery.setCapacity(1);
		delivery.setLocation(new Location(-6d, 3d));
		delivery.setType("Service");

		Question question = new Question();
		question.setVehicleTypes(Arrays.asList(vehicleType));
		question.setVehicles(Arrays.asList(vehicle));
		question.setDeliveries(Arrays.asList(delivery));

		DefaultInputTransformer converter = new DefaultInputTransformer();

		// When
		Problem problem = converter.transform(question);

		// Then
		Problem.VehicleTypes.Type problemVehicleType = problem.getVehicleTypes().getType().get(0);
		assertEquals(problemVehicleType.getId(), "VT1");
		assertEquals(problemVehicleType.getCapacity(), BigInteger.valueOf(80));

		Problem.Vehicles.Vehicle problemVehicle = problem.getVehicles().getVehicle().get(0);
		assertEquals(problemVehicle.getId(), "V1");
		assertEquals(problemVehicle.getTypeId(), "VT1");
		assertEquals(problemVehicle.getLocation().getCoord().getX(), -5d, 0d);
		assertEquals(problemVehicle.getLocation().getCoord().getY(), 4d, 0d);

		Problem.Services.Service problemService = problem.getServices().getService().get(0);
		assertEquals(problemService.getId(), "D1");
		assertEquals(problemService.getCapacityDemand(), BigInteger.valueOf(1));
		assertEquals(problemService.getLocation().getCoord().getX(), -6d, 0d);
		assertEquals(problemService.getLocation().getCoord().getY(), 3d, 0d);

	}

	@Test
	public void transform_shouldThrowASolverExceptionIfTheMappingFails() throws Exception {

		// Given
		ModelMapper mapper = mock(ModelMapper.class);
		when(mapper.map(any(), any())).thenThrow(NullPointerException.class);

		DefaultInputTransformer converter = new DefaultInputTransformer();
		converter.setMapper(mapper);

		// expect
		exception.expect(SolverException.class);

		// When
		converter.transform(null);

	}

}
