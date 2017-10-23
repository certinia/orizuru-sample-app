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

import java.util.ArrayList;
import java.util.List;

import com.graphhopper.jsprit.core.problem.solution.VehicleRoutingProblemSolution;
import com.graphhopper.jsprit.core.problem.solution.route.VehicleRoute;
import com.graphhopper.jsprit.core.problem.solution.route.activity.TourActivity;
import com.graphhopper.jsprit.core.problem.solution.route.activity.TourActivity.JobActivity;

import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.spi.MappingContext;

import com.financialforce.routesolver.exception.SolverException;
import com.financialforce.routesolver.interfaces.ITransform;
import com.financialforce.routesolver.problem.avro.Action;
import com.financialforce.routesolver.problem.avro.Answer;
import com.financialforce.routesolver.problem.avro.Route;
import com.financialforce.routesolver.problem.avro.Solution;

/**
 * Converts a {@link VehicleRoutingProblemSolution} to an {@link Answer}.
 * <p>
 * Uses {@link ModelMapper} to do the mapping (http://modelmapper.org/)
 */
public class DefaultOutputTransformer implements ITransform<VehicleRoutingProblemSolution, Answer> {

	private ModelMapper mapper = null;

	public DefaultOutputTransformer() {

		mapper = new ModelMapper();
		mapper.createTypeMap(VehicleRoute.class, Route.class).setConverter(routeConverter);
		mapper.createTypeMap(VehicleRoutingProblemSolution.class, Answer.class).setConverter(problemConverter);

	}

	@Override
	public Answer transform(VehicleRoutingProblemSolution input) throws SolverException {

		try {
			return mapper.map(input, Answer.class);
		} catch (Exception ex) {
			throw new SolverException("Failed to transform to output", ex);
		}

	}

	public void setMapper(ModelMapper mapper) {
		this.mapper = mapper;
	}

	/**
	 * Inner class to convert a {@link VehicleRoute} to a {@link Route}.
	 */
	private Converter<VehicleRoute, Route> routeConverter = new Converter<VehicleRoute, Route>() {

		@Override
		public Route convert(MappingContext<VehicleRoute, Route> context) {

			VehicleRoute source = context.getSource();

			List<Action> actions = new ArrayList<Action>();

			Route destination = new Route();
			destination.setActions(actions);
			destination.setVehicleId(source.getVehicle().getId());
			destination.setDriverId(source.getDriver().getId());

			for (TourActivity activity : source.getActivities()) {
				JobActivity jobActivity = (JobActivity) activity;
				Action action = mapper.map(activity, Action.class);
				action.setServiceId(jobActivity.getJob().getId());
				action.setType(jobActivity.getName());
				action.setArrivalTime(jobActivity.getEndTime());
				action.setEndTime(jobActivity.getEndTime());
				actions.add(action);
			}

			return destination;

		}
	};

	/**
	 * Inner class to convert a {@link VehicleRoutingProblemSolution} to an {@link Answer}.
	 */
	private Converter<VehicleRoutingProblemSolution, Answer> problemConverter = new Converter<VehicleRoutingProblemSolution, Answer>() {

		@Override
		public Answer convert(MappingContext<VehicleRoutingProblemSolution, Answer> context) {

			VehicleRoutingProblemSolution source = context.getSource();

			Answer destination = new Answer();

			Solution solution = new Solution();
			solution.setCost(source.getCost());

			solution.setRoutes(new ArrayList<Route>());
			destination.setSolution(solution);

			for (VehicleRoute route : source.getRoutes()) {
				destination.getSolution().getRoutes().add(mapper.map(route, Route.class));
			}

			return destination;

		}
	};

}
