Ext.define('CA.techservices.validation.StoryWithDocTagNoDocNameRule',{
    extend: 'CA.techservices.validation.BaseRule',
    alias:  'widget.tsstorywithdoctagnodocnamerule',
    
    config: {
        model: 'HierarchicalRequirement',
        label: 'Documentation Tag Mismatch'
    },
    
    getDescription: function() {
        return Ext.String.format("<strong>{0}</strong>: {1}",
            this.label,
            "Stories with Documentation tag should be prefixed by DOC:."
        );
    },
    
    getFetchFields: function() {
        return ['Name','Tags'];
    },
    
    isValidField: function(model, field_name) {
        var field_defn = model.getField(field_name);
        return ( !Ext.isEmpty(field_defn) );
    },
    
    applyRuleToRecord: function(record) {
        var tags = record.get('Tags');
        if ( Ext.isEmpty(tags) || tags.Count === 0 ) { return null; }
        
        var tag_names = tags._tagsNameArray;
        var has_tag = false; 
        Ext.Array.each(tag_names, function(tag) {
            if ( tag.Name == "Documentation" ) {
                has_tag = true;
            }
        });
        if ( !has_tag ) { return null; }
        
        var name = record.get('Name');

        if ( /^DOC:/.test(name) ) { 
            return null;
        }
        return "Has Documentation tag but the name does not begin with DOC:";
    },
    
    getFilters: function() {        
        return Rally.data.wsapi.Filter.and([
            {property:'Tags.Name',operator:'contains',value:'Documentation'},
            {property:'Name',operator: '!contains', value: "DOC:" }
        ]);
    }
});