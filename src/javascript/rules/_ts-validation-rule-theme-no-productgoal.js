Ext.define('CA.techservices.validation.ThemeNoProductGoalRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsthemenoproductgoalrule',
    
   
    config: {
       /* 
        * [{}] a Target root project for high-levelpassed in from calling routine. 
        * Retrieves from appSettings 
        * Set Name of the Top-Level container where teams *must* put their Initiatives (and higher)
        */
        projectPortfolioRoot: null,
        /*
        * [{Rally.wsapi.data.Model}] portfolioItemTypes the list of PIs available
        * we're going to use the first level ones (different workspaces name their portfolio item levels differently)
        */
        portfolioItemTypes:[],
        //model: 'PortfolioItem/Theme',
        label: 'Theme needs Parent'
    },
    getModel: function(){
        return this.portfolioItemTypes[2];  // 0-feature, 1-initiative, etc...
    },
    getDescription: function() {
        var msg = Ext.String.format(
                "{0} must be linked to a {1}.",
                /[^\/]*$/.exec(this.getModel()),
                this.portfolioItemTypes[3]
                );
        return msg;
    },
    
    getFetchFields: function() {
        return ['Name','Parent'];
    },
    getLabel: function(){
        this.label = Ext.String.format(
            "{0} needs {1}",
            /[^\/]*$/.exec(this.getModel()),
            /[^\/]*$/.exec(this.portfolioItemTypes[3])
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

        // return Rally.data.wsapi.Filter.and([
        //     {property:'Parent',operator:'=',value:null}
        // ]);
        return [];
    }
});