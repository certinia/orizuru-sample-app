({
	handleStepEvent: function (component, event, helper) {
		var status = event.getParam('status');
		if (status == 'CREATED_ORDERS') {
			window.setTimeout(
				$A.getCallback(function () {
					$A.get('e.force:refreshView').fire();
				}), 500
			);
		}
	}
});
