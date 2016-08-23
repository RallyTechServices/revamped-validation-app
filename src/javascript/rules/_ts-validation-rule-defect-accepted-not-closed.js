Ext.define('CA.techservices.validation.DefectAcceptedNotClosed',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsdefectacceptednotclosedrule',
    
    config: {
        model: 'Defect',
        label: 'Accepted Defect Not Closed'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Accepted Defects should additionally be Closed."
        );
    },
    
    getFetchFields: function() {
        return ['Name','ScheduleState','State','AcceptedDate'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        //var missingFields = [];

console.log("applyRuleToRecord",record);
        // using fact that the system populates the AcceptedDate... for Accepted and higher ScheduleStates...
        if (( record.get('AcceptedDate') != null ) && (record.get('State') != "Closed") ) {
        // if (( record.get('ScheduleState') == "Accepted" ) && (record.get('State') != "Closed") ) {
            var msg = Ext.String.format("Accepted Defects should additionally be Closed.(SchedState={0}: State={1})",record.get('ScheduleState'),record.get('State'));
            return msg;   
        } 
        return null; // no rule violation
    },
    
    getFilters: function() {        
        return Rally.data.wsapi.Filter.and([
            {property:'State',operator:'!=',value:'Closed'},
            {property:'AcceptedDate',operator:'!=',value:null}
            //{property:'ScheduleState',operator:'=',value:'Accepted'}
        ]);
    }
});