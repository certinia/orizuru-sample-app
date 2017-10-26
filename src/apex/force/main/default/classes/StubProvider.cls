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

/*
 * Incredibly simplistic StubProvider.
 * Holds a single return value for a given stub method, regardless of the argument values used on invocation.
 * 
 * For more advanced mocking, see ApexMocks: https://github.com/financialforcedev/fflib-apex-mocks
 * Apex Mocks supports stubbing, verification, answering, matchers and more.
 */
@IsTest(SeeAllData=false)
public class StubProvider implements System.StubProvider
{
	private final Map<Method, Object> returnValuesByMethod = new Map<Method, Object>();
	private final Map<Method, Integer> callCountByMethod = new Map<Method, Integer>();

	public Object handleMethodCall(Object stubbedObject, String stubbedMethodName, 
		Type returnType, List<Type> listOfParamTypes, List<String> listOfParamNames, 
		List<Object> listOfArgs)
	{
		Method method = new Method(stubbedObject, stubbedMethodName, listOfParamTypes, listOfArgs);
		incrementCallCount(method);
		return returnValuesByMethod.get(method);
	}

	public Integer getCallCount(Object stubbedObject, String stubbedMethodName, List<Type> listOfParamTypes, List<Object> listOfArgs)
	{
		Integer callCount = callCountByMethod.get(new Method(stubbedObject, stubbedMethodName, listOfParamTypes, listOfArgs));
		return callCount == null ? 0 : callCount;
	}

	public Object mock(Type mockType)
	{
		return Test.createStub(mockType, this);
	}

	public void stub(Object stubbedObject, String stubbedMethodName, List<Type> listOfParamTypes, List<Object> listOfArgs, Object returnValue)
	{	
		returnValuesByMethod.put(new Method(stubbedObject, stubbedMethodName, listOfParamTypes, listOfArgs), returnValue);
	}

	private void incrementCallCount(Method method) {

		Integer callCount = callCountByMethod.get(method);
		if (callCount == null) {
			callCount = 0;
		}
		callCount++;
		callCountByMethod.put(method, callCount);
	}

	private class Method
	{
		private final Object stubbedObject;
		private final String stubbedMethodName;
		private final List<Type> listOfParamTypes;
		private final List<Object> listOfArgs;

		public Method(Object stubbedObject, String stubbedMethodName, List<Type> listOfParamTypes, List<Object> listOfArgs)
		{
			this.stubbedObject = stubbedObject;
			this.stubbedMethodName = stubbedMethodName;
			this.listOfParamTypes = listOfParamTypes;
			this.listOfArgs = listOfArgs;
		}

		public Boolean equals(Object other)
		{
			if (other instanceof Method)
			{
				Method that = (Method)other;
				return this.stubbedObject === that.stubbedObject
					&& this.stubbedMethodName == that.stubbedMethodName
					&& this.listOfParamTypes == that.listOfParamTypes
					&& this.listOfArgs == that.listOfArgs;
			}

			return false;
		}

		public Integer hashCode()
		{
			String description = ''
				+ this.stubbedMethodName
				+ this.listOfParamTypes;

			return description.hashCode();
		}
	}
}
