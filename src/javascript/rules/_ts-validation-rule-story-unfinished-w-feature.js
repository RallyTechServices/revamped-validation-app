Ext.define('CA.techservices.validation.StoryUnfinishedWithFeatureRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstoryunfinishedwithfeaturerule',
    
   
    config: {
        model: 'HierarchicalRequirement',
        label: 'Unfinished Story w Feature'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Unfinished Stories should be disconnected from their Features."
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

        //console.log('applyRuleToRecord',record);

        if (( record.get('Feature') != null ) && (/^\[Unfinished\]/.test(record.get('Name') ) ) ) {
            var msg = "Unfinished Stories should be disconnected from their features after splitting.";
            return msg;   
        }        
        return null; // no rule violation
    },
    
    getFilters: function() {        
        var today = Rally.util.DateTime.toIsoString(new Date());

        return Rally.data.wsapi.Filter.and([
            {property:'Feature',operator:'!=',value:null},
            {property:'Name',operator: '!contains', value: "[Unfinished]" }
        ]);
    }
});