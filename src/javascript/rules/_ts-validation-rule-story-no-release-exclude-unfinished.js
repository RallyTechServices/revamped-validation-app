Ext.define('CA.techservices.validation.StoryNoReleaseExcludeUnfinishedRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstorynoreleaseexcludeunfinishedrule',
    
   
    config: {
        model: 'HierarchicalRequirement',
        label: 'No Release (Story Excl Unfinish)'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Stories not assigned to a Release excluding those with [Unfinished] in the Name."
        );
    },
    
    getFetchFields: function() {
        return ['Release','Name'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        //var missingFields = [];

console.log("applyRuleToRecord",record);

        if ( Ext.isEmpty(record.get('Release') ) && (!/^\[Unfinished\]/.test(record.get('Name') ) ) && (record.get('DirectChildrenCount') < 1)) {
            var msg = "Stories must be assigned to a Release unless they have [Unfinished] in the name.";
            return msg;   
        }
        
        return null; // no rule violation
    },
    
    getFilters: function() {        
        return Rally.data.wsapi.Filter.and([
            {property:'Release',operator:'=',value:null},
            {property:'Name',operator: '!contains', value: "[Unfinished]" },
            {property:'DirectChildrenCount',operator: '=', value: 0 }            
        ]);
    }
});