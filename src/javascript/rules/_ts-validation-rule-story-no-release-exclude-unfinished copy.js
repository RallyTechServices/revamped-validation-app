Ext.define('CA.techservices.validation.StoryNoReleaseExcludeUnfinished',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstorynoreleaseexcludeunfinished',
    
   
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
        var missingFields = [];

        if ( Ext.isEmpty(record.get('Release') ) && (!/^\[Unfinished\]/.test(record.get('Name') ) ) ) {
            var msg = "Stories must be assigned to a Release unless they have [Unfinished] in the name.";
            return msg;   
        }
        
        return null; // no rule violation
    },
    
    getFilters: function() {        
        var today = Rally.util.DateTime.toIsoString(new Date());

        return Rally.data.wsapi.Filter.and([
            {property:'Release',operator:'=',value:null},
            {property:'Name',operator: '!contains', value: "[Unfinished]" }
        ]);
    }
});