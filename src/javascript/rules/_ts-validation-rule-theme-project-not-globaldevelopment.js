Ext.define('CA.techservices.validation.ThemeProjectNotGlobalDevelopmentRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsthemeprojectnotglobaldevelopmentrule',
    
    // Set Name of the Top-Level container where teams *must* put their Initiatives (and higher)
    project_PortfolioRoot: "Global Development",
   
    config: {
        model: 'PortfolioItem/Theme',
        //label: Ext.String.format("Theme Project != {0}.",this.project_PortfolioRoot) // #todo - make this work!
        label: Ext.String.format("Theme Project != 'Global Development'")
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Themes must be in the ", this.project_PortfolioRoot," Project."
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

        if ( record.get('Project').Name != this.project_PortfolioRoot )  {
            var msg = Ext.String.format("Portfolio Themes must be saved into {0}, not {1}.",this.project_PortfolioRoot,record.get('Project').Name);
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