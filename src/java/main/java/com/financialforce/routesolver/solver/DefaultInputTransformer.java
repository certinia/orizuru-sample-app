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

import java.math.BigInteger;

import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.modelmapper.spi.MappingContext;

import com.financialforce.routesolver.exception.SolverException;
import com.financialforce.routesolver.interfaces.ITransform;
import com.financialforce.routesolver.problem.avro.Delivery;
import com.financialforce.routesolver.problem.avro.Question;
import com.financialforce.routesolver.problem.avro.Vehicle;
import com.financialforce.routesolver.problem.avro.VehicleType;
import com.financialforce.routesolver.problem.jsprit.Problem;
import com.financialforce.routesolver.problem.jsprit.TimeWindowType;

/**
 * Converts a {@link Question} to a {@link Problem}.
 * <p>
 * Uses {@link ModelMapper} to do the mapping (http://modelmapper.org/)
 */
public class DefaultInputTransformer implements ITransform<Question, Problem> {

	private ModelMapper mapper = null;

	public DefaultInputTransformer() {

		mapper = new ModelMapper();
		mapper.addMappings(deliveryMap);
		mapper.addMappings(vehicleMap);
		mapper.createTypeMap(Question.class, Problem.class).setConverter(questionConverter);

	}

	@Override
	public Problem transform(Question input) throws SolverException {

		try {
			return mapper.map(input, Problem.class);
		} catch (Exception ex) {
			throw new SolverException("Failed to transform input", ex);
		}

	}

	public void setMapper(ModelMapper mapper) {
		this.mapper = mapper;
	}

	/**
	* Inner class to convert a {@link Vehicle} to a {@link Problem.Vehicles.Vehicle}.
	*/
	private PropertyMap<Vehicle, Problem.Vehicles.Vehicle> vehicleMap = new PropertyMap<Vehicle, Problem.Vehicles.Vehicle>() {
		protected void configure() {
			map().getLocation().getCoord().setX(source.getLocation().getLat());
			map().getLocation().getCoord().setY(source.getLocation().getLng());
		}
	};

	/**
	* Inner class to convert a {@link Delivery} to a {@link Problem.Services.Service}.
	*/
	private PropertyMap<Delivery, Problem.Services.Service> deliveryMap = new PropertyMap<Delivery, Problem.Services.Service>() {
		protected void configure() {
			map().setCapacityDemand(BigInteger.valueOf(source.getCapacity()));
			map().getLocation().getCoord().setX(source.getLocation().getLat());
			map().getLocation().getCoord().setY(source.getLocation().getLng());
		}
	};

	/**
	* Inner class to convert a {@link Question} to a {@link Problem}.
	*/
	private Converter<Question, Problem> questionConverter = new Converter<Question, Problem>() {

		@Override
		public Problem convert(MappingContext<Question, Problem> context) {

			Problem destination = new Problem();
			destination.setVehicleTypes(new Problem.VehicleTypes());
			destination.setVehicles(new Problem.Vehicles());
			destination.setServices(new Problem.Services());

			Question source = context.getSource();
			for (VehicleType vehicleType : source.getVehicleTypes()) {
				destination.getVehicleTypes().getType().add(mapper.map(vehicleType, Problem.VehicleTypes.Type.class));
			}

			for (Vehicle vehicle : source.getVehicles()) {

				Problem.Vehicles.Vehicle mappedVehicle = mapper.map(vehicle, Problem.Vehicles.Vehicle.class);
				TimeWindowType twt = new TimeWindowType();
				twt.setStart(0);
				twt.setEnd(999999.0);
				mappedVehicle.setTimeSchedule(twt);

				destination.getVehicles().getVehicle().add(mappedVehicle);
			}

			for (Delivery delivery : source.getDeliveries()) {
				destination.getServices().getService().add(mapper.map(delivery, Problem.Services.Service.class));
			}

			return destination;

		}
	};

}
