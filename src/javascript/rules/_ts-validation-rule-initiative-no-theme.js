Ext.define('CA.techservices.validation.InitiativeNoThemeRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsinitiativenothemerule',
    
   
    config: {
        /*
        * [{Rally.wsapi.data.Model}] portfolioItemTypes the list of PIs available
        * we're going to use the first level ones (different workspaces name their portfolio item levels differently)
        */
        portfolioItemTypes:[],
        //model: 'PortfolioItem/Initiative',
        label: 'Initiative w/o Theme'
    },
    getModel:function(){
        return this.portfolioItemTypes[1];  // 0-feature,1-initiative, etc..
    },
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Initiative without Theme."
        );
    },
    
    getFetchFields: function() {
        return ['Name','Parent'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        //var missingFields = [];

        //console.log("applyRuleToRecord",record);

        if ( Ext.isEmpty(record.get('Parent') ) ) {
            var msg = "Portfolio Initiatives must be linked to a Theme.";
            return msg;   
        } else {
            return null; // no rule violation
        }
    },
    
    getFilters: function() {        

        return Rally.data.wsapi.Filter.and([
            {property:'Parent',operator:'=',value:null}
        ]);
    }
});