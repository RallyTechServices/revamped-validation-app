Ext.define('CA.techservices.validation.ArtifactIterationMismatchesReleaseRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsartifactiterationmismatchesreleaserule',
     
    config: {
        model: 'HierarchicalRequirement',
        label: 'Release Does Not Match Iteration'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0} ({1})</strong>: {2}",
            this.label,
            "If there is an iteration, there should be a release with the same timeframe."
        );
    },
    
    getFetchFields: function() {
        return ['Iteration','StartDate','EndDate','Release','ReleaseStartDate','ReleaseDate'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        if ( Ext.isEmpty(record.get('Iteration')) ) {
            return null;
        }
        
        if ( Ext.isEmpty(record.get('Release')) ) {
            return null; // this will be checked via custom list
        }
        
        var iteration = record.get('Iteration');
        var release = record.get('Release');
        
        if ( iteration.EndDate < release.ReleaseStartDate ) {
            return "Iteration ends before release begins";
        }
        
        if ( iteration.StartDate > release.ReleaseDate ) {
            return "Iteration starts after release ends";
        }
        
    },
    
    getFilters: function() {        
        // without this filter, the number of items that must be downloaded to evaluate
        // this check would grow without bound; if a user wants to do a one-time review of
        // past items where Release and Iteration are mismatched, they should do a manual
        // review with a custom list
        var today = Rally.util.DateTime.toIsoString(new Date());
        return Rally.data.wsapi.Filter.or([
            {property:'Release.ReleaseDate',operator:'>=',value: today},
            {property:'Iteration.EndDate',operator:'>=',value: today}
        ]);
    },
    
    getUserFriendlyRuleLabel: function() {
        var model_map = { 'HierarchicalRequirement' : 'Story', 'Defect' : 'Defect' };
        return Ext.String.format("{0} ({1})", this.label, model_map[this.model]);
    }
});