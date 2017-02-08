Ext.define('CA.techservices.validation.StoryProductNotEqFeatureProductExcludeUnfinishedRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstoryproductnoteqfeatureproductexcludeunfinishedrule',
     
    config: {
        model: 'HierarchicalRequirement',
        label: 'Story Product Not Equal Feature Product (Excl [Unfinished])',
        story_product_field: 'c_Product',
        feature_product_field: 'c_Product'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Story Product should be the same as its Feature's Product, excluding stories with [Unfinished] in the Name or unscheduled Features."
        );
    },
    
    getFetchFields: function() {
        return ['Feature','Name', this.story_product_field, this.feature_product_field];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        // the statement below - short-circuits if the story does not have a release or the feature does not have a release. 
        if (Ext.isEmpty(record.get('Feature'))) {
            return null; // either it's a placeholder feature or the story doesn't have a product
        }
        
        console.log('--', record.get('FormattedID'), record.get('Feature')[this.feature_product_field], record.get(this.story_product_field));
        
        if ( record.get('Feature')[this.feature_product_field] == record.get(this.story_product_field)) {
            return null; // no rule violation
        }
        
        if ( Ext.isEmpty(record.get('Feature')[this.feature_product_field]) && Ext.isEmpty(record.get(this.story_product_field)) ) {
            return null;  // they're both blank
        }
        
        var us_product = record.get(this.story_product_field) || "No Product";
        var fe_msg = "No Feature Product";
        if (!Ext.isEmpty( record.get('Feature')[this.feature_product_field] ) ) {
            fe_msg = record.get('Feature')[this.feature_product_field];
        }
    
        return Ext.String.format("Story Product ({0}) != Feature Product ({1})!",us_product,fe_msg);
    },
    
    getFilters: function() {        
        var today = Rally.util.DateTime.toIsoString(new Date());

        return Rally.data.wsapi.Filter.and([
        {property:'Feature',operator:'!=',value:null},
        {property:'Name',operator: '!contains', value: "[Unfinished]" },
        // without this filter, the number of stories that must be downloaded to
        // evaluate this check would grow without bound; if a user wants to do a
        // one-time review of past stories where Release doesn't match the Feature's
        // release, they should do a manual review with a custom list
        {property:'Release.ReleaseDate',operator:'>=',value: today}
    ]);
    }
});