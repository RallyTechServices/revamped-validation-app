Ext.define('CA.techservices.validation.ArtifactActiveButNoIteration',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsartifactactivenoiterationrule',
    
   
    config: {
        model: 'HierarchicalRequirement',
        label: 'No Iteration for Active Item'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Active items without an Iteration."
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
            return Ext.String.format("An accepted {0} must be assigned to an Iteration.",
                this.getNoun()
            );
        }
        
        if ( Ext.Array.contains(['In-Progress','Completed'], record.get('ScheduleState')) ) {
            return Ext.String.format("An active {0} must be assigned to an Iteration.  This {1} is in {2}.",
                this.getNoun(),
                this.getNoun(),
                record.get('ScheduleState')
            );
        }
        
        return null; // no rule violation
    },
    
    getNoun: function() {
        var model_map = { 'HierarchicalRequirement' : 'Story', 'Defect' : 'Defect' };
        return model_map[this.model];
    },
    
    getUserFriendlyRuleLabel: function() {
        return Ext.String.format("{0} ({1})", this.label, this.getNoun());
    },
    
    getFilters: function() {        
        var filters = [
            {property:'Iteration',operator: '=', value: null },
            {property:'ScheduleState',operator:'>',value:'Defined'}
        ];
        if ( this.model == "HierarchicalRequirement" ) {
            filters.push({property:'DirectChildrenCount',value: 0});
        }

        return Rally.data.wsapi.Filter.and(filters);
    }
});