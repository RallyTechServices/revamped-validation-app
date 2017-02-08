Ext.define('CA.techservices.validation.DefectReleaseNotEqDefectSuiteReleaseRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsdefectreleasenoteqdefectsuitereleaserule',
     
    config: {
        model: 'Defect',
        label: 'Defect Release Not Equal DS Release'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Defect Release Should be the same as Defect Suite Release (if the DS has a Release)."
        );
    },
    
    getFetchFields: function() {
        return ['Name','DefectSuites','Release'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {

        // ~~~~~~~~~~ DOES NOT WORK.... ~~~~~~~
console.log("applyRuleToRecord:", record);
var defectSuites = record.get('DefectSuites');
console.log('applyRuleToRecord:DS-', defectSuites);
if (defectSuites != null){
    console.log('applyRuleToRecord:DS-', defectSuites[0]);
}
return null;
// ~~~~~~~~~~~~~~~~~~~
// following does not work ... but SHOULD!!!
        // the statement below - short-circuits if the defect does not have a release or the defect suite does not have a release.
        // we have another test that requires that a Defect be linked to at most one defectSuite. A defectSuite may have multiple defects.
        // return null if the test is not directly violated...
        if (((record.get('Release') && record.get('DefectSuites').ObjectID)  // defect is scheduled and there IS a defectsuite (ds)
        && (record.get('DefectSuites')[0].Release))                             // and the ds has been scheduled
        && ((record.get('Release').Name) == (record.get('DefectSuites')[0].Release.Name))) // check for equivalence in the names
        {
            return null; // no rule violation
        } else {
            var de_release = "No Release";
            if (record.get('Release') != null) {
                de_release = record.get('Release').Name;
            }
            var ds_msg = "No Release";
            if (record.get('DefectSuites')[0].ObjectID && (record.get('DefectSuites')[0].Release != null)) {
                ds_msg = record.get('DefectSuites')[0].Release.Name;
            } else {
                ds_msg = "No Feature at all!";
            }
        
            return Ext.String.format("Defect.Release({0}) != DefectSuite.Release ({1})!",de_release,ds_msg);
        }        
    },
    
    getFilters: function() {        
        return Ext.create('Rally.data.wsapi.Filter',{
            property:'DefectSuites.ObjectID',
            operator: '!=',
            value: null
        });
        // return Rally.data.wsapi.Filter.and([
        //     {property:'Feature',operator:'!=',value:null},
        //     {property:'Name',operator: '!contains', value: "[Unfinished]" }
        // ]);
    }
});