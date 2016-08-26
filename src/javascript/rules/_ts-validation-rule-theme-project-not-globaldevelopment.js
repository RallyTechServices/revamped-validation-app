Ext.define('CA.techservices.validation.ThemeProjectNotGlobalDevelopmentRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsthemeprojectnotglobaldevelopmentrule',
    
    
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
        label: Ext.String.format("Theme Project != 'Global Development'")
    },
    
    getModel: function(){
        return this.portfolioItemTypes[2]; // 0-feature, 1-initiative
    },
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1} should be in the *{2}* project.",
            this.label,
            this.getModel(),
            this.projectPortfolioRoot
        );
    },
    
    getFetchFields: function() {
        return ['Name','Project'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        //var missingFields = [];

        if ( record.get('Project').Name != this.projectPortfolioRoot )  {
            var msg = Ext.String.format("{0} must be saved into *{1}*, not *{2}*.",this.getModel(),this.projectPortfolioRoot,record.get('Project').Name);
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