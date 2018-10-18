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

@IsTest(SeeAllData=false)
private class HerokuConnectorForSampleAppTest
{
	@IsTest
	private static void requestCalculateRoute_callsHerokuConnectorWithCorrectInfo()
	{
		// given
		HTTPResponse result = new HTTPResponse();
		HerokuConnectorMock connMock = new HerokuConnectorMock(result);
		HerokuConnector.setMock((IHerokuConnector) connMock);
		HerokuConnectorForSampleApp connector = HerokuConnectorForSampleApp.newInstance();

		// when
		HTTPResponse resultFromCall = connector.calculateRoute('Test');

		// then
		System.assertEquals('callout:Orizuru/api/calculateRoutesForPlan', connMock.endpoint);
		System.assertEquals(new OrizuruTransport.com_financialforce_orizuru_problem_avro_CalculateRoutesForPlan('Test').serialize(), connMock.transport.serialize());
		System.assertEquals(result, resultFromCall);
	}

	@IsTest
	private static void requestGenerateData_callsHerokuConnectorWithCorrectInfo()
	{
		// given
		HTTPResponse result = new HTTPResponse();
		HerokuConnectorMock connMock = new HerokuConnectorMock(result);
		HerokuConnector.setMock((IHerokuConnector) connMock);
		HerokuConnectorForSampleApp connector = HerokuConnectorForSampleApp.newInstance();

		// when
		HTTPResponse resultFromCall = connector.generateData('Test');

		// then
		System.assertEquals('callout:Orizuru/api/createData', connMock.endpoint);
		System.assertEquals(new OrizuruTransport.com_ffdc_orizuru_problem_avro_createData('Test').serialize(), connMock.transport.serialize());
		System.assertEquals(result, resultFromCall);
	}

	private class HerokuConnectorMock implements IHerokuConnector
	{
		public String endpoint {get; private set;}
		public ISerializable transport {get; private set;}
		private HTTPResponse result { get; set; }

		HerokuConnectorMock(HTTPResponse result) 
		{
			this.result = result;
		}

		public HTTPResponse post(String endpoint, ISerializable transport)
		{
			this.endpoint = endpoint;
			this.transport = transport;
			return result;
		}
	}

}