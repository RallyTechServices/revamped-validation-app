Ext.define('CA.techservices.validation.StoryAcceptedButNoIteration',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstoryacceptednoiterationrule',
    
   
    config: {
        model: 'HierarchicalRequirement',
        label: 'No Iteration (Acc Story)'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Accepted stories without an Iteration."
        );
    },
    
    getFetchFields: function() {
        return ['Iteration','ScheduleState'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        //var missingFields = [];

        //console.log("applyRuleToRecord",record);

        if ( Ext.isEmpty(record.get('Iteration')) &&
             record.get('ScheduleState') == 'Accepted') {
            var msg = "Accepted stories must be assigned to the Iteration where they were fixed.";
            return msg;   
        }
        
        return null; // no rule violation
    },
    
    getFilters: function() {        
        return Rally.data.wsapi.Filter.and([
            {property:'Iteration',operator: '=', value: null },
            {property:'ScheduleState',operator:'=',value:'Accepted'}           
        ]);
    }
});