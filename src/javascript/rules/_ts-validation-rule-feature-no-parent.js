Ext.define('CA.techservices.validation.FeatureNoParentRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsfeaturenoparentrule',
    
    config: {
        /*
        * [{Rally.wsapi.data.Model}] portfolioItemTypes the list of PIs available
        * we're going to use the first level ones (different workspaces name their portfolio item levels differently)
        */
        portfolioItemTypes:[],
        label: 'Feature needs Parent' 
    },
    getModel:function(){
        return this.portfolioItemTypes[0];  // 0-feature,1-initiative, etc..
    },
    getDescription: function() {
        var msg = Ext.String.format(
            "{0} must be linked to a {1}",
            /[^\/]*$/.exec(this.getModel()),
            this.portfolioItemTypes[1]
        );
        return msg;
    },
    
    getFetchFields: function() {
        return ['Name','Parent'];
    },
    getLabel: function(){
        this.label = Ext.String.format(
            "{0} without {1}",
            /[^\/]*$/.exec(this.getModel()), //regex retrieves string after 'PortfolioItem/'
            /[^\/]*$/.exec(this.portfolioItemTypes[1])
            );
        return this.label;
    },
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {

        if ( Ext.isEmpty(record.get('Parent') ) ) {
            return this.getDescription();   
        } else {
            return null; // no rule violation
        }
    },
    
    getFilters: function() {        
        return Ext.create('Rally.data.wsapi.Filter',{
            property:'Parent',
            operator: '=',
            value: null
        });
    }
});