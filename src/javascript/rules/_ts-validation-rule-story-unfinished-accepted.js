Ext.define('CA.techservices.validation.StoryUnfinishedAcceptedRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstoryunfinishedacceptedrule',
    
    config: {
        model: 'HierarchicalRequirement',
        label: '[Unfinished] Story >= Accepted'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "[Unfinished] Stories should be set to Completed, not Accepted."
        );
    },
    
    getFetchFields: function() {
        return ['ScheduleState','Name','DirectChildrenCount','AcceptedDate'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        //console.log("applyRuleToRecord",record);

        if (( record.get('AcceptedDate') != null ) && (/^\[Unfinished\]/.test(record.get('Name') ) ) && (record.get('DirectChildrenCount') < 1)) {
            var msg = "[Unfinished] Stories should be set to 'Completed', not 'Accepted'.";
            return msg;   
        }
        return null; // no rule violation
    },
    
    getFilters: function() {        
        return Rally.data.wsapi.Filter.and([
            {property:'AcceptedDate',operator:'!=',value: null },
            {property:'Name',operator: 'contains', value: '[Unfinished]' },
            {property:'DirectChildrenCount',operator: '<', value: 1 }            
        ]);
    }
});