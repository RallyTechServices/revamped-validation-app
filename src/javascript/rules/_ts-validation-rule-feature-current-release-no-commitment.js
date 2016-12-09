Ext.define('CA.techservices.validation.FeatureCurrentReleaseNoCommitmentRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsfeaturecurrentreleasenocommitmentrule',
    
    config: {
        /*
        * [{Rally.wsapi.data.Model}] portfolioItemTypes the list of PIs available
        * we're going to use the first level ones (different workspaces name their portfolio item levels differently)
        */
        portfolioItemTypes:[],
        label: 'Feature in current release has no Commitment for Release set' 
    },
    getModel:function(){
        return this.portfolioItemTypes[0];  // 0-feature,1-initiative, etc..
    },
    getDescription: function() {
        var msg = Ext.String.format(
            "When in current release, {0} must have Commitment for Release set",
            /[^\/]*$/.exec(this.getModel())
        );
        return msg;
    },
    
    getFetchFields: function() {
        return ['Name','Parent','c_CommitmentforRelease','Release','ReleaseStartDate','ReleaseDate'];
    },
    getLabel: function(){
        this.label = Ext.String.format(
            "{0} in current release has no Commitment for Release set",
            /[^\/]*$/.exec(this.getModel())
        );
        return this.label;
    },
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        var release = record.get('Release');

        if ( !Ext.isEmpty(record.get('c_CommitmentforRelease') ) ){
            return null;
        }
        if ( Ext.isEmpty(release) ) {
            return null; 
        }

        var today = Rally.util.DateTime.toIsoString(new Date());
        if ( today > release.ReleaseDate || today < release.ReleaseStartDate ) {
            return null;
        }
        
        return this.getDescription();
    },
    
    getFilters: function() {
        var today = Rally.util.DateTime.toIsoString(new Date());

        return Rally.data.wsapi.Filter.and([
            {property:'Release.ReleaseStartDate',operator:'<=',value: today},
            {property:'Release.ReleaseDate',operator:'>=',value: today}
        ]);
    }
});