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
            "Story Release should be the same as or earlier than its Feature's Release, excluding stories with [Unfinished] in the Name or unscheduled Features."
        );
    },
    
    getFetchFields: function() {
        return ['Feature','Name','Release','ReleaseStartDate'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        // the statement below - short-circuits if the story does not have a release or the feature does not have a release. 
        if (record.get('Feature') == null ||
            record.get('Release') == null) {
            return null; // either it's a placeholder feature or the story isn't scheduled
        }
        if (record.get('Feature').Release &&
            record.get('Feature').Release.Name == record.get('Release').Name) {
            return null; // no rule violation
        }
        if (record.get('Feature').Release == null ||
            record.get('Release').ReleaseStartDate < record.get('Feature').Release.ReleaseStartDate) {
            return null; // accepted story on placeholder or story was advance work for a future feature
        }

        var us_release = record.get('Release').Name;
        var fe_msg = "No Release";
        if (record.get('Feature').Release != null) {
            fe_msg = record.get('Feature').Release.Name;
        } else {
            fe_msg = "No Feature Release";
        }
    
        return Ext.String.format("Story.Release({0}) != Feature.Release ({1})!",us_release,fe_msg);
    },
    
    getFilters: function() {        
        var today = Rally.util.DateTime.toIsoString(new Date());

        return Rally.data.wsapi.Filter.and([
            {property:'Feature',operator:'!=',value:null},
            {property:'Name',operator: '!contains', value: "[Unfinished]" }
        ]);
    }
});