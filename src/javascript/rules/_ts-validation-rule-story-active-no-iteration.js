Ext.define('CA.techservices.validation.StoryActiveButNoIteration',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstoryactivenoiterationrule',
    
   
    config: {
        model: 'HierarchicalRequirement',
        label: 'No Iteration (Active Story)'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Active stories without an Iteration."
        );
    },
    
    getFetchFields: function() {
        return ['Iteration','ScheduleState','AcceptedDate','DirectChildrenCount'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        if ( record.get('DirectChildrenCount') > 0 ) {
            return null;
        }
        
        if ( !Ext.isEmpty(record.get('Iteration')) ) {
            return null;
        }
        
        if ( record.get('AcceptedDate') ) {
            return "Accepted stories must be assigned to an Iteration.";
        }
        
        if ( Ext.Array.contains(['In-Progress','Completed'], record.get('ScheduleState')) ) {
            return "Active stories must be assigned to an Iteration.";
        }
        
        return null; // no rule violation
    },
    
    getFilters: function() {        
        return Rally.data.wsapi.Filter.and([
            {property:'Iteration',operator: '=', value: null },
            {property:'ScheduleState',operator:'>',value:'Defined'},
            {property:'DirectChildrenCount',value: 0}
        ]);
    }
});