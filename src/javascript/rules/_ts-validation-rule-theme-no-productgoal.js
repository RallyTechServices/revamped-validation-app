Ext.define('CA.techservices.validation.ThemeNoProductGoalRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsthemenoproductgoalrule',
    
   
    config: {
        model: 'PortfolioItem/Theme',
        label: 'Theme w/o Product Goal'
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