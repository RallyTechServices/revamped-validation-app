Ext.define("TSValidationApp", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
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
    config: {
        defaultSettings: {
            rootPortfolioProject: 'Global Development',
            showSchedulable: false            
        }
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
            boxLabel: 'Show only schedulable artifacts: Features, User Stories, Defects and Tasks.'
         }
         ];
    },
    rulesByType: {
        PortfolioItemTimeboxNo: [ // Initiatives and higher          
            {xtype:'tsthemenoproductgoalrule'},
            {xtype:'tsinitiativenothemerule'},
            {xtype:'tsthemeprojectnotglobaldevelopmentrule'},
            {xtype:'tsinitiativeprojectnotglobaldevelopmentrule'}
        ],
//        PortfolioItemTimeboxYes: [ // Features into Releases
//
//        ],
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
            {xtype:'tstasktodonoestimaterule'},
          //  {xtype:'tstaskactivenotodorule'}
        ]
    },                    
    launch: function() {
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
        
        this.logger.log('InitializeApp',portfolioItemTypes);

        // add the array of portfolioItem Type names to each rule as we instantiate it
        Ext.Array.each(this.rulesByType.PortfolioItemTimeboxNo, function(rule){
            rule.portfolioItemTypes = portfolioItemTypes;
        })
        // add the array to the app as well.
        this.portfolioItemTypes = portfolioItemTypes;

        console.log("_initializeApp after assign:",this.rulesByType);
        
        this._doLayout();
        this._loadData();
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
        
        this.down('#filters_box').add([
            {
                xtype: 'panel',
                title: 'Select Rules',
                layout:{type: 'hbox',align: 'left'},
                height: 80,
                items:[
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
                    value: true
                },
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
                ]
            },
            {
                xtype: 'panel',
                //title: 'Spacer',
                width: 40,
                height: 80,
                border: 0
            },
            {
                xtype: 'panel',
                title: 'Select Timeboxes',
                itemId: 'selectTimeboxes',
                height: 80,                
                layout:{type:'hbox',align:'right'},
                items:[{
                    xtype: 'rallyiterationcombobox',
                    itemId: 'iterationSelector',
                    allowNoEntry: true,
                    margin: 10,        
                    fieldLabel: 'Iteration',
                    labelAlign: 'right',
                    width: 340
                    },
                    {   
                    xtype: 'rallyreleasecombobox',
                    itemId: 'releaseSelector',
                    allowNoEntry: true, 
                    margin: 10,
                    fieldLabel: 'Release',
                    labelAlign: 'right',
                    width: 340
                    }], 
              }, // end of the TimeBox Selectors
              {
                xtype: 'panel',
                height: 80,
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
            },
        ]); // end of items in filter-box)
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
                    Ext.Msg.alert('','No violations found');
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
        
        me.logger.log('_instantiateValidator',me);

        // ************************
        // Initiatives and Higher are not schedule-able.
        if ( me.getSetting('showSchedulable')) {
            // ** we don't have any Feature Rules ***
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

        var validator = Ext.create('CA.techservices.validator.Validator',{
            rules: rules,
            fetchFields: ['FormattedID','ObjectID'],
// **           baseFilters:{ 
// **                HierarchicalRequirement: {},
// **                Task: {}
// **            },
            pointEvents: {
                click: function() {
                   me.showDrillDown(this._records,this._name);
                }
            }
        });
        return validator;        
    },

    _makeChart: function(data) {
        var me = this;
        
        this.logger.log('_makeChart', data);
      //  var colors = CA.apps.charts.Colors.getConsistentBarColors();
        
        // destroy any existing version of the chart before creating a new one
        this.down('#display_box').removeAll();

        // now go ahead and create the new chart.
        this.down("#display_box").add({
            chartData: data,
            xtype:'rallychart',
            itemId: 'validationChart',
            loadMask: false,
            chartConfig: this._getChartConfig()  //,
        //    chartColors: colors
        });
    },

    _getChartConfig: function() {
        var me = this;
        
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
        if ( this.down('#defectRuleCheckBox') ) {
            if (title_prefix.length > 0){
                title_prefix += ", ";
            }
            title_prefix += "Defect";
        }
        if ( this.down('#taskRuleCheckBox') ) {
            if (title_prefix.length > 0){
                title_prefix += " and ";
            }
            title_prefix += "Task";
        }
        
        return {
            chart: { type:'column' },
            title: { text: title_prefix + ' Validation Results' },
            //xAxis: {labels:{rotation:60}},
            xAxis: {},
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
    
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }
    
});
