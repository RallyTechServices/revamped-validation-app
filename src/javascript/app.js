Ext.define("TSValidationApp", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    
    MAX_LIMITS:{CATEGORIES: 30},

    items: [
        { //filter box
            xtype:'container',
            itemId:'filters_box',
            layout: {
                type: 'hbox',
                columnWidth: '100%'
            }
        },    // end of filter box

        { // main chart display  
            xtype:'container',
            itemId:'display_box'
        }
    ], // end of app containers

    integrationHeaders : {
        name : "TSValidationApp"
    },
    getSettingsFields: function() {
         return [
         {  
            name: 'rootPortfolioProject',
            xtype: 'rallytextfield',
            fieldLabel: 'Name of root Portfolio Item project:'
         },
         { 
            name: 'showSchedulable',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: '0 0 25 200',
            boxLabel: 'Show only schedulable artifacts: User Stories, Defects and Tasks.'
         }
         ];
    },
    config: {
        defaultSettings: {
            rootPortfolioProject: 'Global Development',
            showSchedulable: false            
        }
    },
    rulesByType: {
        PortfolioItemTimeboxNo: [ // Initiatives and higher          
            {xtype:'tsthemenoproductgoalrule'},
            {xtype:'tsinitiativenothemerule'},
            {xtype:'tsthemeprojectnotglobaldevelopmentrule'},
            {xtype:'tsinitiativeprojectnotglobaldevelopmentrule'}
        ],
        // PortfolioItemTimeboxYes: [ // Features into Releases
        // ],
        HierarchicalRequirement: [
            {xtype:'tsstoryrequiredfieldrule', requiredFields: ['Owner','Description']},
            {xtype:'tsstorynofeatureexcludeunfinishedrule' },
            {xtype:'tsstoryunfinishedwithfeaturerule' },    
            {xtype:'tsstorynoreleaseexcludeunfinishedrule' },
            {xtype:'tsstorynonullplanestimaterule' },
            {xtype:'tsstoryreleasenoteqfeaturereleaseexcludeunfinishedrule'}
            //{xtype:'tsstoryunfinishedacceptedrule'}
        ],
        Defect: [
            {xtype:'tsdefectclosednoresolutionrule'},
            {xtype:'tsdefectacceptednotclosedrule'}
        ],
        Task: [
            {xtype:'tstaskrequiredfieldrule',  requiredFields: ['Owner']},
            {xtype:'tstasktodonoestimaterule'}
          //  {xtype:'tstaskactivenotodorule'}
        ]
    },                    
    launch: function() {
        this.logger.log("launch:", this);
        //setup the page
        this._doLayout();

        // get any data model customizations ... then get the data and render the chart
        
        this._fetchPortfolioItemTypes().then({
            success: this._initializeApp, 
            failure: this._showErrorMsg,
            scope: this
        });        
    },

    showDrillDown: function(records, title) {
        var me = this;

        var store = Ext.create('Rally.data.custom.Store', {
            data: records,
            pageSize: 2000
        });
        
        Ext.create('Rally.ui.dialog.Dialog', {
            id        : 'detailPopup',
            title     : title,
            width     : 500,
            height    : 400,
            closable  : true,
            layout    : 'border',
            items     : [
            {
                xtype                : 'rallygrid',
                region               : 'center',
                layout               : 'fit',
                sortableColumns      : true,
                showRowActionsColumn : false,
                showPagingToolbar    : false,
                columnCfgs           : [
                    {
                        dataIndex : 'FormattedID',
                        text: "id",
                        renderer: function(value,meta,record){
                            return Ext.String.format("<a href='{0}' target='_top'>{1}</a>",Rally.nav.Manager.getDetailUrl(record.get('_ref')),value);
                        }
                    },
                    {
                        dataIndex : 'Name',
                        text: "Name",
                        flex: 1
                    },
                    {
                        dataIndex: '__ruleText',
                        text: 'Violations',
                        flex: 2,
                        renderer: function(value, meta, record) {
                            if ( Ext.isEmpty(value) ) { return ""; }
                            var display_value = "";
                            Ext.Array.each(value, function(violation){
                                display_value = display_value + Ext.String.format("<li>{0}</li>", violation);
                            });

                            return Ext.String.format("<ul>{0}</ul>", display_value);
                        }
                    }
                ],
                store : store
            }]
        }).show();
    },
    _initializeApp: function(portfolioItemTypes){
        var me = this;
        
        me.logger.log('InitializeApp',portfolioItemTypes);

        // add the array of portfolioItem Type names to each portfolio rule as we instantiate it
        // also grab appSetting for a target folder to hold high-level portfolio items
        Ext.Array.each(me.rulesByType.PortfolioItemTimeboxNo, function(rule){
            // get the collection of workspace specific portfolio item names per level
            rule.portfolioItemTypes = portfolioItemTypes;
            // for rules that need to have a specific project folder for portfolio items
            rule.projectPortfolioRoot = me.getSetting('rootPortfolioProject');
        });
        Ext.Array.each(me.rulesByType.PortfolioItemTimeboxYes, function(rule){
            // get the collection of workspace specific portfolio item names per level
            rule.portfolioItemTypes = portfolioItemTypes;
            // for rules that need to have a specific project folder for portfolio items
            rule.projectPortfolioRoot = me.getSetting('rootPortfolioProject');
        });
        
        // add the array to the app as well.
        me.portfolioItemTypes = portfolioItemTypes;

        console.log("_initializeApp after assign:",me.rulesByType);
        
        me._loadData();
    },
    _showErrorMsg: function(msg){
        Rally.ui.notify.Notifier.showError({message:msg});
    },
    _fetchPortfolioItemTypes: function(){
        var deferred = Ext.create('Deft.Deferred');
        Ext.create('Rally.data.wsapi.Store',{
            model: 'typedefinition',
            fetch:['TypePath','Ordinal'],
            filters: [{property:'TypePath',operator:'contains',value:'PortfolioItem/'}],
            sorters: [{property:'Ordinal',direction:'ASC'}]
        }).load({
            callback: function(records,operation){
                if (operation.wasSuccessful()){
                    var portfolioItemArray = [];
                    Ext.Array.each(records,function(rec){
                        portfolioItemArray.push(rec.get('TypePath'));
                    });
                    deferred.resolve(portfolioItemArray);
                } else {
                    var message = 'failed to load Portfolio Item Types ' + (operation.error && operation.error.errors.join(','));
                    deferred.reject(message);
                }
            }
        })
        
        return deferred;
    },

    _doLayout: function(){
        var me = this;
        // add checkbox panel to select rules
        this.down('#filters_box').add([
            {
                xtype: 'panel',
                title: 'Rule(s)',
                itemId: 'selectRulesPanel',
                layout:{
                    type: 'hbox',
                    align: 'left'
                },
                height: 80,
            },
        ]);
        if (!this.getSetting('showSchedulable')){
            // update the filters-box title (no selection offered)
            this.down('#selectRulesPanel').setTitle('Rule');

            // only show high-level portfolio rules
            this.down('#selectRulesPanel').add([
                {
                    xtype: 'rallycheckboxfield',
                    columnWidth: '25%',
                    margin: 10,
                    labelSeparator: " ",
                    boxLabel: 'Portfolio',
                    boxLabelAlign: 'after',
                    name: 'portfolioRules',
                    itemId: 'portfolioRuleCheckBox',
                    stateful: true,
                    stateId: 'portfolioRuleCheckBox',
                    //disabled: true,
                    readOnly: true, // a little nicer display than disabled.
                    value: true
                },
            ]);
        } else {
            // update the selectRulesPanel title ('Select Rules')
            this.down('#selectRulesPanel').setTitle('Select Rules to Display');

            // show Stories/Defects/Tasks (no Feature Rules so far)
            this.down('#selectRulesPanel').add([
                {
                    xtype: 'rallycheckboxfield',
                    columnWidth: '25%',
                    margin: 10,
                    boxLabel: 'User Story',
                    boxLabelAlign: 'after',
                    name: 'storyRules',
                    itemId: 'storyRuleCheckBox',
                    stateful: true,
                    stateId: 'userStoryRuleCheckBox',
                    value: true
                },
                {
                    xtype: 'rallycheckboxfield',
                    columnWidth: '25%',
                    margin: 10,
                    boxLabel: 'Defect',
                    boxLabelAlign: 'after',
                    name: 'defectRules',
                    itemId: 'defectRuleCheckBox',
                    stateful: true,
                    stateId: 'defectRuleCheckBox',
                    value: true
                },    
                {
                    xtype: 'rallycheckboxfield',
                    columnWidth: '25%',
                    margin: 10,   
                    boxLabel: 'Task',
                    boxLabelAlign: 'after',
                    name: 'taskRules',
                    itemId: 'taskRuleCheckBox',
                    stateful: true,
                    stateId: 'taskRuleCheckBox',
                    value: true
                }
            ]);
            // add the spacer panel after the rule-selector panel
            this.down('#filters_box').add([
                {
                    xtype: 'panel',
                    //title: 'Spacer',
                    width: 10,
                    height: 80,
                    border: 0
                },
                {
                    xtype: 'panel',
                    title: 'Select Timeboxes',
                    itemId: 'selectTimeboxes',
                    height: 80,                
                    layout:{type:'hbox',align:'right'},
                    items:[
                        {
                        xtype: 'rallyiterationcombobox',
                        itemId: 'iterationSelector',
                        allowNoEntry: true,
                        defaultToCurrentTimebox: true,  // client use-case: easier clean-up for sprint
                        autoSelectCurrentItem: true,    // should have defaulted
                        //defaultSelectionPosition: 'first',
                        stateful: true,
                        stateId: 'iterationSelectorState',
                        margin: 10,        
                        fieldLabel: 'Iteration',
                        labelAlign: 'right',
                        width: 340,
                        },
                        {   
                        xtype: 'rallyreleasecombobox',
                        itemId: 'releaseSelector',
                        defaultToCurrentTimebox: true,
                        autoSelectCurrentItem: true,    // should have defaulted
                        //defaultSelectionPosition: 'first',
                        stateful: true,
                        stateId: 'releaseSelectorState',
                        allowNoEntry: true, 
                        margin: 10,
                        fieldLabel: 'Release',
                        labelAlign: 'right',
                        width: 340,                        
                        }] 
                }, // end of the TimeBox Selectors
                {
                    xtype: 'panel',
                    height: 80,
                    width: '30%',
                    border: 0,
                    layout:{type:'hbox',align: 'right',margin: 10},
                    items:[
                        {
                            xtype: 'rallybutton',
                            scope: me,
                            margin: '40 0 0 10', //top right bottom left
                            text: 'Apply Selections',
                            handler: function() {
                                //Ext.Msg.alert('Button', 'You clicked me');
                                console.log("In the button:",
                                    this.getSetting('showSchedulable'),
                                    this.getSetting('rootPortfolioProject')
                                );
                                me._loadData();    
                            }
                        }
                    ]
                }
            ]);
        }
    },
    
    _loadData: function(){
        this.validator = this._instantiateValidator();
        
        this.validator.getPrecheckResults().then({
            scope: this,
            success: function(issues) {
                
                var messages = Ext.Array.filter(issues, function(issue){
                    return !Ext.isEmpty(issue);
                });
                
                if ( messages.length > 0 ) {
                    var append_text = "<br/><b>Precheck Issues:</b><br/><ul>";
                    Ext.Array.each(messages, function(message){
                        append_text += '<li>' + message + '</li>';
                    });
                    append_text += "</ul>";
                    
                    this.logger.log(append_text);
                }
                
                this._updateData();
            },
            failure: function(msg) {
                Ext.Msg.alert('Problem with precheck', msg);
            }
        });
    },

    _updateData: function() {
        var me = this;
        this.setLoading("Loading data...");
        
        Deft.Chain.pipeline([
            function() { 
                me.setLoading("Gathering data...");
                return me.validator.gatherData(); 
            },
            function() { 
                me.setLoading("Analyzing data...");
                return me.validator.getChartData(); 
            }
        ]).then({
            scope: this,
            success: function(results) {
                
                if ( results.categories && results.categories.length === 0 ) {
                    // if no results - erase the underlying, previously rendered chart
                    this.down('#display_box').removeAll();
                    Ext.Msg.alert('','No violations found with current selections.');
                    return;
                }
                
                this.display_rows = Ext.Object.getValues( this.validator.recordsByModel );

                this._makeChart(results);  
            },
            failure: function(msg) {
                Ext.Msg.alert('Problem loading data', msg);
            }
        }).always(function() { me.setLoading(false); });    
    }, 
    
    _instantiateValidator: function() {
        var me = this;

        var rules = [];
        
        me.logger.log('_instantiateValidator');

        // ************************
        // Initiatives and Higher are not schedule-able.
        if ( me.getSetting('showSchedulable')) {
            me.logger.log("_instantiateValidator:Timebox: ", me, me.down('#iterationSelector').value,me.down('#releaseSelector').value);

            //this.getSetting('showSchedulable')
                // ** we don't have any Feature Rules so far ***
                //if ( me.down('#portfolioRuleCheckBox').value) {
                //    rules = Ext.Array.push(rules, me.rulesByType['PortfolioItemTimeboxYes']);
                //}    
            
            if ( me.down('#storyRuleCheckBox').value ) {
                rules = Ext.Array.push(rules, me.rulesByType['HierarchicalRequirement']);
            }
            if ( me.down('#defectRuleCheckBox').value ) {
                rules = Ext.Array.push(rules, me.rulesByType['Defect']);
            }
            if ( me.down('#taskRuleCheckBox').value ) {
                rules = Ext.Array.push(rules, me.rulesByType['Task']);
            }       
        } else { // only show high level Portfolio Item rules
            if ( me.down('#portfolioRuleCheckBox').value) {
                rules = Ext.Array.push(rules, me.rulesByType['PortfolioItemTimeboxNo']);
            }
        } // end of rulesByType filtering

        // create two different versions ... one for Timebox filtered, one without
        var validator = {};
        
        if (this.getSetting('showSchedulable')){
            // setup base timebox filters
            var story_base_timebox_filter = Rally.data.wsapi.Filter.and([
                {property:'Iteration', operator: '=', value: me.down('#iterationSelector').value },
                {property:'Release', operator: '=', value: me.down('#releaseSelector').value}
                ]);
            var defect_base_timebox_filter = Rally.data.wsapi.Filter.and([
                {property:'Iteration', operator: '=', value: me.down('#iterationSelector').value },
                {property:'Release', operator: '=', value: me.down('#releaseSelector').value}
                ]);    
            var task_base_timebox_filter = Rally.data.wsapi.Filter.and([
                {property:'Iteration', operator: '=', value: me.down('#iterationSelector').value },
                {property:'Release', operator: '=', value: me.down('#releaseSelector').value}
                ]); 

            // create the validator object 
            validator = Ext.create('CA.techservices.validator.Validator',{
                rules: rules,
                fetchFields: ['FormattedID','ObjectID'],
                // get any settings from the timebox selectors
                baseFilters:{ 
                    HierarchicalRequirement: story_base_timebox_filter,
                    Defect: defect_base_timebox_filter,
                    Task: task_base_timebox_filter
                },
                pointEvents: {
                    click: function() {
                    me.showDrillDown(this._records,this._name);
                    }
                }
            });
        } else {
            validator = Ext.create('CA.techservices.validator.Validator',{
                rules: rules,
                fetchFields: ['FormattedID','ObjectID'],
                // get any settings from the timebox selectors
                // baseFilters:{ 
                //     PortfolioItemTimeboxNo:{},
                //     PortfolioItemTimeboxYes:{},
                //      HierarchicalRequirement: {},
                //     Defect: {},
                //     Task: {}
                // },
                pointEvents: {
                    click: function() {
                    me.showDrillDown(this._records,this._name);
                    }
                }
            });
        }

        return validator;        
    },

    _makeChart: function(data) {
        // data is the collection of series and categories (projects)
        this.logger.log('_makeChart', data);

        //  var colors = CA.apps.charts.Colors.getConsistentBarColors();
        
        // destroy any existing version of the chart before creating a new one
        this.down('#display_box').removeAll();

        this.logger.log('_makeChart Project Count Test: ',this.MAX_LIMITS.CATEGORIES,data.categories.length);

        if (data.categories.length > this.MAX_LIMITS.CATEGORIES){
            // if there are too many projects in scope (i.e. categories) the chart is unreadable.
            var msg = Ext.String.format ("You've selected a project too high in the project hierarchy. With {0} ",data.categories.length);
            msg += "[child] projects in scope, the chart will be unusable. Please select a project ";
            msg += "further down the project hierarchy.";

            Ext.Msg.alert('Too Many Projects In Selection',msg);
            return;
        } else {
            // Go ahead and create the new chart.
            this.down("#display_box").add({
                chartData: data,
                xtype:'rallychart',
                itemId: 'validationChart',
                loadMask: false,
                chartConfig: this._getChartConfig(data)  //,
                //    chartColors: colors
            });
        }
    },

    _getChartConfig: function(data) {

        this.logger.log("_getChartConfig: ",data.series,data.categories,data.categories.length);
        this.logger.log("_getChartConfig2: ",this,this.down('#portfolioRuleCheckBox'));
        var title_prefix = "";
        if ( this.down('#portfolioRuleCheckBox') ) {
            if (title_prefix.length > 0){
                title_prefix += ", ";
            }
            title_prefix = "Portfolio";
        }
        if ( this.down('#storyRuleCheckBox') ) {
            if (title_prefix.length > 0){
                title_prefix += ", ";
            }
            title_prefix += "Story";
        }
        // if the last item, use 'and' as separator, else use a comma
        if ( this.down('#defectRuleCheckBox') ) {
            if ((title_prefix.length > 0) && ( this.down('#taskRuleCheckBox')))  {
                title_prefix += ", ";
            } else {
                title_prefix += ' and ';
            }
            title_prefix += "Defect";
        }            
           
        // should be last item
        if ( this.down('#taskRuleCheckBox') ) {
            if (title_prefix.length > 0){
                title_prefix += " and ";
            }
            title_prefix += "Task";
        }
        
        return {
            chart: { type:'column' },
            title: { text: title_prefix + ' Validation Results' },
            xAxis: this._rotateProjectLabels(data.categories.length),
            yAxis: { 
                min: 0,
                title: { text: 'Count' }
            },
            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            }
        }
    },
    
    _loadAStoreWithAPromise: function(model_name, model_fields){
        var deferred = Ext.create('Deft.Deferred');
        var me = this;
        this.logger.log("Starting load:",model_name,model_fields);
          
        Ext.create('Rally.data.wsapi.Store', {
            model: model_name,
            fetch: model_fields
        }).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(this);
                } else {
                    me.logger.log("Failed: ", operation);
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    },
    
    _displayGrid: function(store,field_names){
        this.down('#display_box').add({
            xtype: 'rallygrid',
            store: store,
            columnCfgs: field_names
        });
    },
    
    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },
    
    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },
    _rotateProjectLabels: function(project_count){
        this.logger.log("_rotateProjectLabels: ",project_count);
        // horizontal labels for up to 5 items
        if (project_count <= 10) {
            return {labels:{rotation:0}};
        } else if (project_count <= 20){
            return {labels:{rotation:45}};
        } else { // full vertical rotation for more than 10 items (good for up-to about 20)
            return {labels:{rotation:90}};
        }
    },

    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }
    
});
