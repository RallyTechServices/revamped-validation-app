Ext.define('CA.techservices.validation.StoryNoNullPlanEstimateRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstorynonullplanestimaterule',
    
   
    config: {
        model: 'HierarchicalRequirement',
        label: 'Null Plan Estimate (Story)'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Stories in a current or past iteration should not be in progress or later and missing a plan estimate."
        );
    },
    
    getFetchFields: function() {
        return ['PlanEstimate','Iteration','ScheduleState'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        var missingFields = [];

        if ( !Ext.isEmpty(record.get('PlanEstimate') ) ) {
            return null;
        }

        var today = Rally.util.DateTime.toIsoString(new Date());
        
        if ( (record.get('ScheduleState') == "Defined" ||
              record.get('ScheduleState') == "To Be Defined") &&
             (Ext.isEmpty(record.get('Iteration') ) ||
              record.get('Iteration').StartDate > today) ) {
            // it hasn't been started yet and hasn't been scheduled for the current or past iteration
            return null;
        }
        
        return Ext.String.format('Has null for plan estimate');
    },
    
    getFilters: function() {        
        var today = Rally.util.DateTime.toIsoString(new Date());

        return Rally.data.wsapi.Filter.and([
            {property:'PlanEstimate',operator:'=',value:0},
            {property:'Iteration.StartDate',operator: '<=', value: today },
            {property:'ScheduleState',operator: '>', value: 'Defined' }
        ]);
    }
});