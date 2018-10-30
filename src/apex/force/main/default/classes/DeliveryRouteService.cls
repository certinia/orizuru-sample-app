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

public with sharing class DeliveryRouteService
{
	private static final String GOOGLE_API = 'https://www.google.com/maps/embed/v1/directions?key=';
    
    private static final String START_TOKEN= '&origin=';
    private static final String WAYPOINT_TOKEN = '&waypoints=';
    private static final String END_TOKEN ='&destination=';

	@testVisible
	private static DeliveryRouteService instance = null;

	public static DeliveryRouteService newInstance()
	{
		if (instance == null)
		{
			instance = new DeliveryRouteService();
		}
		return instance;
	}

	public String generateUrl(Id routeId)
    {
		Waypoint warehouseWaypoint = getStartLocation(routeId);
		List<Waypoint> waypoints = getWaypointsForRouteId(routeId);
		
		Route route = new Route(warehouseWaypoint, waypoints, warehouseWaypoint);
        return route.generateUrl();
    }

	private Waypoint getStartLocation(Id routeId)
	{
		DeliveryRouteSelector selector = DeliveryRouteSelector.newInstance();
		List<DeliveryRoute__c> route = selector.selectByIds(new Set<Id>{routeId});
		return new Waypoint(route[0]);
	}

	private List<Waypoint> getWaypointsForRouteId(Id routeId)
    {
		List<Waypoint> waypointDtos = new List<Waypoint>();

		DeliveryWaypointSelector selector = DeliveryWaypointSelector.newInstance();
		List<DeliveryWaypoint__c> waypoints = (List<DeliveryWaypoint__c>) selector.selectByDeliveryRouteIds(new Set<Id>{routeId});                                                                                        
		for (DeliveryWaypoint__c waypoint : waypoints)
		{
			waypointDtos.add(new Waypoint(waypoint));
		}

		return waypointDtos;
    }
    
	private class Route 
	{
		private Waypoint startPoint;
		private List<Waypoint> waypoints;
		private Waypoint endPoint;

		public Route(Waypoint startPoint, List<Waypoint> waypoints, Waypoint endPoint) 
		{
			this.startPoint = startPoint;
			this.waypoints = waypoints;
			this.endPoint = endPoint;
		}

		public String generateUrl() 
		{
			String waypointStr = waypointsAsGeolocationsString();

			List<String> components = new List<String>();
			components.add(GOOGLE_API);
			components.add(OrizuruSettings__c.getInstance().GoogleMapsApiKey__c);
			components.add(START_TOKEN);
			components.add(startPoint.asGeolocation());
			components.add(END_TOKEN);
			components.add(endPoint.asGeolocation());

			if (!String.isEmpty(waypointStr)) {
				components.add(WAYPOINT_TOKEN);
				components.add(waypointStr);
			}

			return String.join(components, '');
		}

		private String waypointsAsGeolocationsString() 
		{
			return String.join(waypointsAsGeolocations(), '|');
		}

		private List<String> waypointsAsGeolocations() 
		{
			List<String> retval = new List<String>();

			for (Waypoint waypoint : waypoints) 
			{
				retval.add(waypoint.asGeolocation());
			}

			return retval;
		} 

	}

    private class Waypoint
    {
    	private String lat;
		private String lng;

		public Waypoint(DeliveryRoute__c dr)
        {
            this.lat = String.valueOf(dr.Vehicle__r.Warehouse__r.Contact__r.MailingLatitude);
			this.lng = String.valueOf(dr.Vehicle__r.Warehouse__r.Contact__r.MailingLongitude); 
        }

	    public Waypoint(DeliveryWaypoint__c wp)
        {
            this.lat = String.valueOf(wp.Order__r.ShipToContact.MailingLatitude);
			this.lng = String.valueOf(wp.Order__r.ShipToContact.MailingLongitude); 
        }

        public String asGeolocation()
        {
            return this.lat + ',' + this.lng;
        }

    }
	
}
