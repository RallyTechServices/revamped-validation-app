Ext.define('CA.techservices.validation.ArtifactReleaseNoteButNoProductOrMilestoneRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsartifactreleasenotebutnoproductmilestonerule',
     
    config: {
        model: 'HierarchicalRequirement',
        label: 'Missing Product or Milestone'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0} ({1})</strong>: {2}",
            this.label,
            "When Release Notes Needed=Yes and Release Notes Complete=No there should be a Milestone or Product."
        );
    },
    
    getFetchFields: function() {
        return ['Milestones','c_ReleaseNotesComplete','c_ReleaseNotesNeeded','c_Product'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        if ( !record.get('c_ReleaseNotesNeeded') || ( record.get('c_ReleaseNotesComplete')) ) {
            return null;
        }
        
        console.log('-->', record.get('Milestones'), record.get('Product'));
        
        if ( ( Ext.isEmpty(record.get('Milestones')) || record.get('Milestones').Count == 0 ) && Ext.isEmpty(record.get('Product')) ) {
            return "Should have either milestone or product if Release Notes Complete = No and Release Notes Needed = Yes.";
        }
        
        return null;
    },
    
    getFilters: function() {        
        return Rally.data.wsapi.Filter.and([
        {property:'c_ReleaseNotesNeeded',value:true},
        {property:'c_ReleaseNotesComplete',value:false}
        
        ]);
    },
    
    getUserFriendlyRuleLabel: function() {
        var model_map = { 'HierarchicalRequirement' : 'Story', 'Defect' : 'Defect' };
        return Ext.String.format("{0} ({1})", this.label, model_map[this.model]);
    }
});