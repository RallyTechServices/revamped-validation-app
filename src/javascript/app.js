Ext.define("TSValidationApp", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    items: [
        {xtype:'container',itemId:'display_box'}
    ],

    integrationHeaders : {
        name : "TSValidationApp"
    },
    config: {
        defaultSettings: {
            showStoryRules: true,
            showTaskRules: false,
            showPortfolioItemRules: false
        }
    },
    getSettingsFields: function() {
        return [
        { 
            name: 'showPortfolioItemRules',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: '0 0 25 200',
            boxLabel: 'Show Portfolio Item Rules<br/><span style="color:#999999;"><i>Tick to apply rules for Portfolio Items.</i></span>'
        },
        { 
            name: 'showStoryRules',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: '0 0 25 200',
            boxLabel: 'Show Story Rules<br/><span style="color:#999999;"><i>Tick to apply rules for Stories.</i></span>'
        },
        { 
            name: 'showTaskRules',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: '0 0 25 200',
            boxLabel: 'Show Task Rules<br/><span style="color:#999999;"><i>Tick to apply rules for Tasks.</i></span>'
        }
        ];
    },
    rulesByType: {
        PortfolioItem: [           
            {xtype:'tsthemenoproductgoalrule'},
            {xtype:'tsinitiativenothemerule'},
            {xtype:'tsthemeprojectnotglobaldevelopmentrule'}
        ],
        HierarchicalRequirement: [
            {xtype:'tsstoryrequiredfieldrule', requiredFields: ['Owner','Description']},
            {xtype:'tsstorynofeatureexcludeunfinishedrule' },    
            {xtype:'tsstorynoreleaseexcludeunfinishedrule' },
            {xtype:'tsstorynonullplanestimaterule' },
            {xtype:'tsstoryreleasenoteqfeaturereleaseexcludeunfinishedrule'}
        ],
        Defect: [
          //  {xtype:'tstaskactivenotodo'}
        ],
        Task: [
            {xtype:'tstaskrequiredfieldrule',  requiredFields: ['Owner']},
            {xtype:'tstasktodonoestimaterule'},
          //  {xtype:'tstaskactivenotodorule'}
        ]
    },                    
    launch: function() {
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
                        text: "id"
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
        if ( this.getSetting('showPortfolioItemRules') ) {
            rules = Ext.Array.push(rules, this.rulesByType['PortfolioItem']);
        }
        if ( this.getSetting('showStoryRules') ) {
            rules = Ext.Array.push(rules, this.rulesByType['HierarchicalRequirement']);
        }
        if ( this.getSetting('showTaskRules') ) {
            rules = Ext.Array.push(rules, this.rulesByType['Task']);
        }
        
        var validator = Ext.create('CA.techservices.validator.Validator',{
            rules: rules,
            fetchFields: ['FormattedID','ObjectID'],
//            baseFilters:{ 
//                 HierarchicalRequirement: {},
//                 Task: {}
//             },
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
        
        this.down("#display_box").add({
            chartData: data,
            xtype:'rallychart',
            loadMask: false,
            chartConfig: this._getChartConfig()  //,
        //    chartColors: colors
        });
    },
    
    _getChartConfig: function() {
        var me = this;
        
        var title_prefix = "";
        if ( this.getSetting('showPortfolioItemRules') ) {
            if (title_prefix.length > 0){
                title_prefix += ", ";
            }
            title_prefix = "Portfolio";
        }
        if ( this.getSetting('showStoryRules') ) {
            if (title_prefix.length > 0){
                title_prefix += ", ";
            }
            title_prefix += "Story";
        }
        if ( this.getSetting('showTaskRules')) {
            if (title_prefix.length > 0){
                title_prefix += " and ";
            }
            title_prefix += "Task";
        }
        
        return {
            chart: { type:'column' },
            title: { text: title_prefix + ' Validation Results' },
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
