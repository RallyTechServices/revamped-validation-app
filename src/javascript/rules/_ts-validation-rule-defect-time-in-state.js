Ext.define('CA.techservices.validation.DefectTimeInState',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsdefecttimeinstaterule',
    
    config: {
        model: 'Defect',
        label: null,
        dayLimit: 30,
        state: 'Submitted'
    },
    
    getLabel: function() {
        return Ext.String.format("In {0} for > {1} days",
            this.getState(),
            this.getDayLimit()
        );
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            Ext.String.format("Defects should not stay in the {0} state for more than {1} days.",
                this.getState(),
                this.getDayLimit()
            )
        );
    },
    
    getState: function() {
        return this.state || "Submitted";
    },
    
    getDayLimit: function() {
        return this.dayLimit || 15;
    },
    
    getFetchFields: function() {
        return ['Name','State','LastUpdateDate'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    
    applyRuleToRecord: function(record) {
        if ( record.get('State') == this.getState() ) {
            var diff = Rally.util.DateTime.getDifference(new Date(),record.get('LastUpdateDate'),'day');
            if ( diff >= this.getDayLimit() ) {
                return Ext.String.format("Defect has been in {0} state for {1} days, which is longer than {2} days.",
                    this.getState(),
                    this.getDayLimit(),
                    diff
                );
            }
        }
            
        return null;
    },
    
    getFilters: function() {
        var x_days_ago = Rally.util.DateTime.add(new Date(),'day',-30);
        
        return Rally.data.wsapi.Filter.and([
            {property:'State',operator:'=',value:this.getState()},
            {property:'LastUpdateDate',operator:'<=',value: Rally.util.DateTime.toIsoString(x_days_ago)}
        ]);
    }
});