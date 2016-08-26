Ext.define('CA.techservices.validation.InitiativeProjectNotGlobalDevelopmentRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsinitiativeprojectnotglobaldevelopmentrule',
    
    // Set Name of the Top-Level container where teams *must* put their Initiatives (and higher)
    project_PortfolioRoot: "Global Development",
   
    config: {
        /*
        * [{Rally.wsapi.data.Model}] portfolioItemTypes the list of PIs available
        * we're going to use the first level ones (different workspaces name their portfolio item levels differently)
        */
        portfolioItemTypes:[],
        //model: 'PortfolioItem/Initiative - types loaded in base class.',
        model: null,
        //label: Ext.String.format("Theme Project != {0}.",this.project_PortfolioRoot)
        label: Ext.String.format("Initiative Project != '{0}' or direct child project.") //,this.getSetting('rootPortfolioProject'))
    },
    
    getDescription: function() {

        console.log("rule: getDescription",this.getSetting('rootPortfolioProject'));

        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Initiatives must be in the ", this.project_PortfolioRoot," Project or a direct child project."
        );
    },
    
    getFetchFields: function() {
        return ['Name','Project','Parent'];
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
            var msg = Ext.String.format("Portfolio Initiatives must be saved into *{0}*</strong> or a direct child project, not *{1}*.",this.project_PortfolioRoot,record.get('Project').Name);
            return msg;
        }
    },
    
    getFilters: function() {        

       // return Rally.data.wsapi.Filter.and([
       //     {property:'Parent',operator:'=',value:null}
       // ]);
    }
});