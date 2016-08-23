Ext.define('CA.techservices.validation.StoryReleaseNotEqFeatureReleaseExcludeUnfinishedRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstoryreleasenoteqfeaturereleaseexcludeunfinishedrule',
     
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
        // the statement below - short-circuits if the story does not have a release or the feature does not have a release. 
        if (((record.get('Release') && record.get('Feature')) && record.get('Feature').Release) && ((record.get('Release').Name) == (record.get('Feature').Release.Name)))  {
            return null; // no rule violation
        } else {
            var us_release = "No Release";
            if (record.get('Release') != null) {
                us_release = record.get('Release').Name;
            }
            var fe_msg = "No Release";
            if (record.get('Feature') && (record.get('Feature').Release != null)) {
                fe_msg = record.get('Feature').Release.Name;
            } else {
                fe_msg = "No Feature at all!";
            }
        
            return Ext.String.format("Story.Release({0}) != Feature.Release ({1})!",us_release,fe_msg);
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