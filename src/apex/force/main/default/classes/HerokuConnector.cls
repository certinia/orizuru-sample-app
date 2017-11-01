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

public class HerokuConnector implements IHerokuConnector
{

	@TestVisible private static final String ACCOUNT_ENDPOINT = '/api/account';
    @TestVisible private static final String POST_METHOD = 'POST';
    @TestVisible private static final String REFERER_HEADER = 'Referer';
    @TestVisible private static final String AUTHORIZATION_HEADER = 'Authorization';
    @TestVisible private static final String AUTHORIZATION_PREFIX = 'Bearer ';
    @TestVisible private static final String CONTENT_TYPE_HEADER = 'Content-Type';
    @TestVisible private static final String CONTENT_TYPE_VALUE = 'application/json';

	private static IHerokuConnector instance = new HerokuConnector();

	public static IHerokuConnector newInstance() {
		return HerokuConnector.instance;
	}

	@TestVisible
	private static void setMock(IHerokuConnector instance) {
		HerokuConnector.instance = instance;
	}

	private HerokuConnector() {}

	public HttpResponse post(String endpoint, ISerializable transport) 
    {
        HttpRequest req = new HttpRequest();
		req.setEndpoint(endpoint);
    	req.setMethod(POST_METHOD);
		req.setHeader(REFERER_HEADER, Url.getSalesforceBaseUrl().toExternalForm());
		req.setHeader(CONTENT_TYPE_HEADER, CONTENT_TYPE_VALUE);
        req.setHeader(AUTHORIZATION_HEADER, AUTHORIZATION_PREFIX + UserInfo.getSessionId());
        req.setBody(transport.serialize());
		return postRequest(req);
    }
    
    private static HttpResponse postRequest(HttpRequest req)
    {
        Http h = new Http();
        return h.send(req);
    }

}