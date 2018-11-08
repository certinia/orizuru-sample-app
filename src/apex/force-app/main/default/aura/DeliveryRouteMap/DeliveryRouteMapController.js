({
	onInit: function (component, event, helper) {
		helper.initRouteId(component);
	},

	onRouteIdChanged: function (component, event, helper) {
		var routeId = event.getParam('value');
		component.set('v.routeId', routeId);

		helper.calculateRoute(component);
	}
})
