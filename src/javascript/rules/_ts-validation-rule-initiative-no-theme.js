Ext.define('CA.techservices.validation.InitiativeNoThemeRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsinitiativenothemerule',
    
   
    config: {
        /*
        ** projectPortfolioRoot set in base class and on constructor
        */
        projectPortfolioRoot: null,
        /*
        * [{Rally.wsapi.data.Model}] portfolioItemTypes the list of PIs available
        * we're going to use the first level ones (different workspaces name their portfolio item levels differently)
        */
        portfolioItemTypes:[],
        //model: 'PortfolioItem/Initiative',
        label: 'Initiative needs Parent' 
    },
    getModel:function(){
        return this.portfolioItemTypes[1];  // 0-feature,1-initiative, etc..
    },
    getDescription: function() {
        var msg = Ext.String.format(
            "{0} must be linked to a {1}",
            /[^\/]*$/.exec(this.getModel()),
            this.portfolioItemTypes[2]
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
            /[^\/]*$/.exec(this.portfolioItemTypes[2])
            );
        return this.label;
    },
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        console.log("applyRuleToRecord",record);

        if ( Ext.isEmpty(record.get('Parent') ) ) {
            return this.getDescription();   
        } else {
            return null; // no rule violation
        }
    },
    
    getFilters: function() {        

        // return Rally.data.wsapi.Filter.and([
        //     {property:'Parent',operator:'=',value:null}
        // ]);
        return [];
    }
});