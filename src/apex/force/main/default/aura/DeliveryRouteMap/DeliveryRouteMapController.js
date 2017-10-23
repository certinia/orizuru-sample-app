({
    doInit : function(component, event, handler)
    {
        var action = component.get('c.calculateRoute');
		action.setParams({ anId : component.get("v.recordId") });

        action.setCallback(this, function(data){
            console.log(data.getReturnValue());
            component.set('v.url', data.getReturnValue());
        });
        $A.enqueueAction(action);
    }
})