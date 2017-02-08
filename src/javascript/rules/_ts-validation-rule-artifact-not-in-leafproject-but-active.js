Ext.define('CA.techservices.validation.ArtifactActiveNotInLeafProject',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsartifactactivenotinleafproject',
    cutoff: '2016-12-01T00:00:00.000Z',
    
    config: {
        model: 'HierarchicalRequirement',
        label: 'Work Started but Not in Leaf Project'
    },
   
    getDescription: function() {
        return Ext.String.format("{0} ({1})",
            this.label,
            "Items can be in higher-level projects before they're started, but should move to a specific pod once started."
        );
    },
   
    getFetchFields: function() {
        return ['FormattedID', 'Parent', 'ScheduleState', 'LastUpdateDate'];
    },
   
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
   
    applyRuleToRecord: function(record) {
        if (record.get("Project")._ref in this.nonLeafProjectRefs) {
            if (record.get("ScheduleState") == "In-Progress"  ||
                record.get("ScheduleState") == "Completed"  ||
                (record.get("ScheduleState") == "Accepted" &&
                    Rally.util.DateTime.getDifference(record.get('LastUpdateDate'),new Date(this.cutoff),'hour') > 0)) {
                return this.getDescription();
            }
        }
        return null;
    },
   
    getFilters: function() {
        var filters = [];
        Ext.Array.each(Object.keys(this.nonLeafProjectRefs), function(ref) {
            filters.push({property:'Project',operator:'=',value:ref});
        });
 
        return Rally.data.wsapi.Filter.and([
            Rally.data.wsapi.Filter.or([
                {property:'ScheduleState',operator:'=',value: 'In-Progress'},
                {property:'ScheduleState',operator:'=',value: 'Completed'},
                Rally.data.wsapi.Filter.and([
                    {property:'ScheduleState',operator:'>=',value: 'Accepted'},
                    {property:'LastUpdateDate',operator:'>=',value: this.cutoff}
                ])
            ]),
            Rally.data.wsapi.Filter.or(filters)
        ]);
    },
   
    getUserFriendlyRuleLabel: function() {
        var model_map = { 'HierarchicalRequirement' : 'Story', 'Defect' : 'Defect' };
        return Ext.String.format("{0} ({1})", this.label, model_map[this.model]);
    }
});