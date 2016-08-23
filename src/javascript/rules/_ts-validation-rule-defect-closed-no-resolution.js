Ext.define('CA.techservices.validation.DefectClosedNoResolution',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsdefectclosednoresolutionrule',
    
    config: {
        model: 'Defect',
        label: 'Closed Defect w/No Resolution'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Closed Defects must have a Resolution."
        );
    },
    
    getFetchFields: function() {
        return ['Name','State','Resolution'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        //var missingFields = [];

console.log("applyRuleToRecord",record);

        if (( record.get('State') == "Closed" ) && ((record.get('Resolution') == null) || (record.get('Resolution') == "None")))  {
            var msg = "Closed Defects must have a Resolution.";
            return msg;   
        } 
        return null; // no rule violation
    },
    
    getFilters: function() {        
        return Rally.data.wsapi.Filter.and([
            {property:'State',operator:'=',value:"Closed"},
            {property:'Resolution',operator:'=',value:"None"}
        ]);
    }
});