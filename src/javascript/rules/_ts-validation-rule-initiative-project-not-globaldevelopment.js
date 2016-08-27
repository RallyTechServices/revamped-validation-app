Ext.define('CA.techservices.validation.InitiativeProjectNotGlobalDevelopmentRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsinitiativeprojectnotglobaldevelopmentrule',
    
    // Set Name of the Top-Level container where teams *must* put their Initiatives (and higher)
    projectPortfolioRoot: null,
   
    config: {
        /*
        * [{Rally.wsapi.data.Model}] portfolioItemTypes the list of PIs available
        * we're going to use the first level ones (different workspaces name their portfolio item levels differently)
        */
        portfolioItemTypes:[],
        //model: 'PortfolioItem/Initiative - types loaded in base class.',
        model: null,
        label: 'Initiative Wrong Project'
    },
    
    getDescription: function() {

        console.log("InitiativeWrongProject:",this);

        return Ext.String.format("<strong>{0}</strong>: Should be in *{1}* or a direct child project.",
            this.getLabel(),
            this.projectPortfolioRoot
        );
    },
    
    getFetchFields: function() {
        return ['Name','Project','Parent'];
    },
    getLabel: function(){
        this.label = Ext.String.format(
            "{0} Wrong Project",
            /[^\/]*$/.exec(this.getModel())
        );
        return this.label;
    },
    getModel: function(){
        return this.portfolioItemTypes[1]; // 0:Feature, 1:Initiative, 2:Theme, 3...
    },
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        //var missingFields = [];

        console.log("ApplyRuleToRecord:",record);        

        if (( record.get('Project').Name == this.project_PortfolioRoot ) || (record.get('Project').Parent.Name == this.project_PortfolioRoot)) {
            return null; // no rule violation   
        } else {
            var msg = Ext.String.format(
                "<strong>{0} must be saved into *{1}*</strong> or a direct child project, not *{2}*.",
                /[^\/]*$/.exec(this.getModel()),
                this.projectPortfolioRoot,
                record.get('Project').Name);
            return msg;
        }
    },
    
    getFilters: function() {        

       // return Rally.data.wsapi.Filter.and([
       //     {property:'Parent',operator:'=',value:null}
       // ]);
    }
});