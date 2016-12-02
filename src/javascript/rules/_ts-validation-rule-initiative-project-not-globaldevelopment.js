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
        
        var msg = Ext.String.format(
            "{0} must be saved into *{1}* or a direct child project.",
            /[^\/]*$/.exec(this.getModel()),
            this.projectPortfolioRoot
            );
        return msg;
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
        console.log("ApplyRuleToRecord:",record); 
        //  RULE: Initiative not assigned to �Global Development� or one-level below       
        if ( record.get('Project').Name == this.projectPortfolioRoot ) {
            return null; // no rule violation   
        } else if ((record.get('Project').Parent != null) && (record.get('Project').Parent.Name == this.projectPortfolioRoot)) {
            return null; // no rule violation (one-level below Global)
        } else {         // doesn't look like the Initiative is in the right place!
            return this.getDescription();
        }
    },
    
    getFilters: function() {        

       // return Rally.data.wsapi.Filter.and([
       //     {property:'Parent',operator:'=',value:null}
       // ]);
       return [];
    }
});