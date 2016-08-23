Ext.define('CA.techservices.validation.ThemeProjectNotGlobalDevelopmentRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsthemeprojectnotglobaldevelopmentrule',
    
   
    config: {
        model: 'PortfolioItem/Theme',
        label: 'Theme Project Not Global Development'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Themes must be in the Global Development Project."
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

        if ( record.get('Project').Name != 'A' )  {
            var msg = Ext.String.format("Portfolio Themes must be saved into the Global Development project, not {0}.",record.get('Project').Name);
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