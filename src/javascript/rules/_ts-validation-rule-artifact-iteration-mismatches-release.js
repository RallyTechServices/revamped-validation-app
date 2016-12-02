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
            return "Has an iteration but does not have a release";
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
        return Rally.data.wsapi.Filter.and([
            {property:'Iteration.ObjectID',operator:'>',value:1}
        ]);
    },
    
    getUserFriendlyRuleLabel: function() {
        var model_map = { 'HierarchicalRequirement' : 'Story', 'Defect' : 'Defect' };
        return Ext.String.format("{0} ({1})", this.label, model_map[this.model]);
    }
});