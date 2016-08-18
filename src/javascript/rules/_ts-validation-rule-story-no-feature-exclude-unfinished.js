Ext.define('CA.techservices.validation.StoryNoFeatureExcludeUnfinished',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstorynofeatureexcludeunfinished',
    
   
    config: {
        model: 'HierarchicalRequirement',
        label: 'No Feature (Story Excl Unfinish)'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Stories without Features, but excluding those with [UNFINISHED] in the Name."
        );
    },
    
    getFetchFields: function() {
        return ['Feature','Name'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        var missingFields = [];

        if ( Ext.isEmpty(record.get('Feature') ) && (!/^\[Unfinished\]/.test(record.get('Name') ) ) ) {
            var msg = "Stories must have Features, unless they have [Unfinished] in the name.";
            return msg;   
        }
        
        return null; // no rule violation
    },
    
    getFilters: function() {        
        var today = Rally.util.DateTime.toIsoString(new Date());

        return Rally.data.wsapi.Filter.and([
            {property:'Feature',operator:'=',value:null},
            {property:'Name',operator: 'contains', value: "[Unfinished]" }
        ]);
    }
});