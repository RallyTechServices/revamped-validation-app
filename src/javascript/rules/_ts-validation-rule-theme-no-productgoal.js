Ext.define('CA.techservices.validation.ThemeNoProductGoalRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsthemenoproductgoalrule',
    
   
    config: {
        /*
        * [{Rally.wsapi.data.Model}] portfolioItemTypes the list of PIs available
        * we're going to use the first level ones (different workspaces name their portfolio item levels differently)
        */
        portfolioItemTypes:[],
        //model: 'PortfolioItem/Theme',
        label: 'Theme w/o Product Goal'
    },
    getModel: function(){
        return this.portfolioItemTypes[2];  // 0-feature, 1-initiative, etc...
    },
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Themes without Product Goals."
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

        if ( Ext.isEmpty(record.get('Parent') ) ) {
            var msg = "Portfolio Themes must be linked to a Product Goal.";
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