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

public abstract class OrizuruTransport implements ISerializable
{

	protected OrizuruTransport() {
		// abstract class
	}

	public String serialize() {
		return Json.serialize(this);
	}

	public class com_financialforce_orizuru_problem_avro_CalculateRoutesForPlan extends OrizuruTransport // Transport extension for use when sending data to Orizuru Heroku apis
	{

		public String deliveryPlanId { get; set; }

		public com_financialforce_orizuru_problem_avro_CalculateRoutesForPlan(String deliveryPlanId) {
			
			this.deliveryPlanId = deliveryPlanId;

		}

	}

	public class com_ffdc_orizuru_problem_avro_createData extends OrizuruTransport // Transport extension for use when sending data to Orizuru Heroku apis
	{

		public String generateDataTaskId { get; set; }

		public com_ffdc_orizuru_problem_avro_createData(String generateDataTaskId) {
			
			this.generateDataTaskId = generateDataTaskId;

		}

	}

}