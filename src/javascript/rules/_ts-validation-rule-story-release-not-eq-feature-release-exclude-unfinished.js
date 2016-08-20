Ext.define('CA.techservices.validation.StoryReleaseNotEqFeatureReleaseExcludeUnfinished',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstoryreleasenoteqfeaturereleaseexcludeunfinished',
     
    config: {
        model: 'HierarchicalRequirement',
        label: 'Story Release Not Equal Feature Release (Excl [Unfinished])'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Story Release Should be the same as Feature Release excluding those with [Unfinished] in the Name."
        );
    },
    
    getFetchFields: function() {
        return ['Feature','Name','Release'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        var missingFields = [];
        
        console.log("applyRuleToRecord: ",record.get('FormattedID'),record.get('Name'),record.get('Feature.FormattedID'),record.get('Feature.Release'));

//      if ( Ext.isEmpty(record.get('Feature') ) && (!/^\[Unfinished\]/.test(record.get('Name') ) ) ) {
//            var msg = "Stories must have Features unless they have [Unfinished] in the name.";
//            return msg;   
//        }
        if ((record.get('Release.Name')) === (record.get('Feature.Release.Name'))){
            return null; // no rule violation
        } else {
            var msg = "A Story and its Feature should have the same Release.";
            return msg;
        }        
    },
    
    getFilters: function() {        
        var today = Rally.util.DateTime.toIsoString(new Date());

        return Rally.data.wsapi.Filter.and([
            {property:'Feature',operator:'!=',value:null},
            {property:'Name',operator: '!contains', value: "[Unfinished]" }
        ]);
    }
});