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
        label: 'Theme Wrong Project'
    },
    
    getModel: function(){
        return this.portfolioItemTypes[2]; // 0-feature, 1-initiative
    },
    getDescription: function() {
        var msg = Ext.String.format(
            "{0} must be saved into *{1}*.",
            /[^\/]*$/.exec(this.getModel()),
            this.projectPortfolioRoot
            );
        return msg;
    },
    
    getFetchFields: function() {
        return ['Name','Project'];
    },
    
    getLabel: function(){
        this.label = Ext.String.format(
            "{0} Wrong Project",
            /[^\/]*$/.exec(this.getModel())
            );
        return this.label;
    },

    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
    
        if ( record.get('Project').Name != this.projectPortfolioRoot )  {
            return this.getDescription();   
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