/**
 * @class Ext.ux.egen.Printer
 * @author EkoJs
 * Helper class to easily print the contents of a grid. Will open a new window with a table where the first row
 * contains the headings from your column model, and with a row for each item in your grid's store. When formatted
 * with appropriate CSS it should look very similar to a default grid. If renderers are specified in your column
 * model, they will be used in creating the table. Override headerTpl and bodyTpl to change how the markup is generated
 * 
 * Usage:
 * 
 * 1 - Add Ext.Require Before the Grid code
 * Ext.require([
 *   'Ext.ux.egen.Printer',
 * ]);
 * 
 * 2 - Declare the Grid 
 * var grid = Ext.create('Ext.grid.Panel', {
 *   columns: //some column model,
 *   store   : //some store
 * });
 * 
 * 3 - Print!
 * Ext.ux.egen.Printer.mainTitle = 'Your Title here'; //optional
 * Ext.ux.egen.Printer.print(grid);
 * 
 * Original url: http://edspencer.net/2009/07/printing-grids-with-ext-js.html
 */
Ext.define("Ext.ux.egen.Printer", {    
    requires: 'Ext.XTemplate',
    statics: {
        /**
         * Prints the passed grid. Reflects on the grid's column model to build a table, and fills it using the store
         * @param {Ext.grid.Panel} grid The grid to print
         */
        print: function(grid) {
			var kelompok = this.getGroupedData(grid);
			
			//kelompok.groupField
			//kelompok.columns
			//kelompok.groups
			//kelompok.groupData
			//kelompok.fitur
			//kelompok.groupRecords	
			
			//remove columns that do not contains dataIndex or dataIndex is empty. for example: columns filter or columns button
            var clearColumns = [];
            Ext.each(kelompok.columns, function (column) {
                if ((column) && (!Ext.isEmpty(column.dataIndex) && !column.hidden)) {
                   if(column.width > 0)
					{
						clearColumns.push(column);
					}
					else
					{
						column.width = 100;
						clearColumns.push(column);
					}
                } else	if (column && column.xtype === 'rownumberer'){
					column.text = 'Row';
					clearColumns.push(column);
				}
            });
            kelompok.columns = clearColumns;
			console.info(kelompok);
			//console.info(grid);
			
			//get Styles file relative location, if not supplied
            if (this.cssPath === null) {
                var scriptPath = Ext.Loader.getPath('Ext.ux.egen.Printer');
                this.cssPath = scriptPath.substring(0, scriptPath.indexOf('Printer.js')) + 'css/Ext.ux.Printer.css';
            }
			
			var html;
			if (kelompok.fitur.groupingsummary || kelompok.fitur.grouping)
			{
				var dataku = [];
				for(var i = 0,cnt=0;i < kelompok.groupData.length;i++){
					var gData = [];
					for(var j = 0;j < kelompok.groupData[i].records.length;j++){
						kelompok.groupData[i].records[j].raw['Row'] = cnt+1;
						gData.push(kelompok.groupData[i].records[j].raw);cnt++;
					}
					dataku.push({filter:kelompok.filter,gname:kelompok.groupField,name:kelompok.groupData[i].name,groupRecords:gData});
				}
				//console.info(gData);
				
				var htmlMarkup = [
					'<!DOCTYPE html>',
					'<html>',
					'<head>',
						'<link href="' + this.cssPath + '" rel="stylesheet" type="text/css" media="screen,print" />',
						'<title>' + this.mainTitle + '</title>',
					'</head>',
					'<body class="' + Ext.baseCSSPrefix + 'ux-grid-printer-body">',
					'<table class=\'table-parent\'><th colspan=\'10\' style=\'text-align:center\'><h1>YAMAHA ABSENCE REPORT</h1></th></table>',
					/*'<table class="table-logo">',
						'<tr>',
							'<td>',
								'YAMAHA ABSENCE REPORT',								
							'</td>',
							'<td class="border-center">CHECK BY.</td>',
						'</tr>',
						'<tr>',
							'<td><div class="img-logo"></td>',
							'<td class="border-center">&nbsp;</td>',
						'</tr>',
						'<tr>',
							'<td>&nbsp;</td>',
							'<td class="border-center">&nbsp;</td>',
						'</tr>',
						'<tr>',
							'<td>&nbsp;</td>',
							'<td class="border-center">HR Manager</td>',
						'</tr>',
					'</table>',
					'<div class="x-ux-grid-printer">',
						'<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkprint" href="javascript:void(0);" onclick="window.print();">' + this.printLinkText + '</a>',
						'<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkclose" href="javascript:void(0);" onclick="window.close();">' + this.closeLinkText + '</a>',
					'</div>',*/
						this.generateBody(grid),
					'</body>',
					'</html>'
				];
				
				html = Ext.create('Ext.XTemplate', htmlMarkup).apply(dataku);
				//console.info(dataku);
				//console.info(this.generateBody(grid));
				console.info(htmlMarkup);
			}
			else
			{
				var data = [];
				grid.store.data.each(function(item, row) {
					var convertedData = {};
					convertedData['groupText'] = grid.store.groupField;
					//apply renderers from column model
					for (var key in item.data) {
						var value = item.data[key];
						
						Ext.each(kelompok.columns, function(column, col) {
							if (column && column.dataIndex == key) {
								var meta = {item: '', tdAttr: '', style: ''};
								value = column.renderer ? column.renderer.call(grid, value, meta, item, row, col, grid.store, grid.view) : value;
								convertedData[column.dataIndex] = value;
								//console.info(convertedData);
							} else if (column && column.xtype === 'rownumberer'){
								convertedData['Row'] = row + 1;
							}
						}, this);
					}

					data.push(convertedData);
				});
				
				//console.info(data);
				html = Ext.create('Ext.XTemplate', this.generateBody(grid)).apply(data);
			}
			
			//console.info(html);

            //open up a new printing window, write to it, print it and close
            var win = window.open('', 'printgrid');
            
            //document must be open and closed
            win.document.open();
            win.document.write(html);
            win.document.close();
            
            if (this.printAuto){
                win.print();
            }
            
            //Another way to set the closing of the main
            if (this.closeAfterPrint){
                if(Ext.isIE){
                    window.close();
                } else {
                    win.close();
                }                
            }
        },
		
		getGroupedData: function(grid) {
			var xtypes = grid.getXType();
			var columns = grid.columns;
			var rs = grid.store.getRange();
			var ds = grid.store;
			var view = grid.view;
			var dfilter = grid.filters.filters.items;
			var kelompok = new Object();
			
			var tgl = '';
			var filter = [];
			for(var i = 0;i<dfilter.length;i++)
			{
				if(dfilter[i] != 'undefined')
				{
					Ext.each(dfilter[i],function(f){
						if(f.active == true && f.type == 'auto')
						{
							console.info(f.dataIndex + ' : ' + f.inputItem.value);
							filter.push(f.dataIndex + ' : ' + f.inputItem.value);
						}
						else if(f.active == true && f.type == 'date')
						{
							if(f.values.before || f.values.after)
							{
								tgl = Ext.Date.format(f.values.after,'d/M/Y') + ' - ' + Ext.Date.format(f.values.before,'d/M/Y')
								console.info(f.dataIndex + ' : ' + tgl);
								filter.push(f.dataIndex + ' : ' + tgl);
							}
							else if(f.values.on)
							{
								console.info(f.dataIndex + ' : ' + Ext.Date.format(f.values.on,'d/M/Y'));
								filter.push(f.dataIndex + ' : ' + Ext.Date.format(f.values.on,'d/M/Y'));
							}
						}
					});
				}
			}
			
			var text = '';
			for(var i = 0;i<filter.length;i++)
			{
				text = text + filter[i] + ' ';
			}
			
			kelompok.filter = text;
			
			
			var features = grid.features;
			var lsfitur = new Array();
			var fitur = new Object();
				fitur.grouping = false;
				fitur.groupingsummary = false;
				fitur.grid = (xtypes == 'gridpanel' ? true : false);
			
			for (var i = features.length - 1; i >= 0; i--) {
                var feature = features[i].ftype;
				lsfitur[i] = feature;
				if(feature == 'grouping')
				{
					fitur.grouping = true;
				}
				else if(feature == 'groupingsummary')
				{
					fitur.groupingsummary = true;
				}
            }
			
			//console.info(rs);
			//console.info(ds);
			//console.info(view);
			//console.info(columns);
			
			kelompok.fitur = fitur;
			kelompok.columns = columns;
			
			if (fitur.groupingsummary || fitur.grouping)
			{
				var groupField = ds.getGroupField();
				var groups = ds.getGroups();
				var groupData = ds.getGroupData();
				
				kelompok.groupField = groupField;
				kelompok.groups = groups;
				kelompok.groupData = groupData;
				
				console.info(groupField);
				
				var gRecords = []
			
				Ext.each(groupData, function(group) {
					var groupRecords = [];				
					//console.info(group.name);

					Ext.each(group.records, function(item) {
						var convertedData = {};
						
						//Cek GroupData.dataIndex dengan kolom.dataIndex
						Ext.iterate(item.data, function(key, value) {
							Ext.each(columns, function(column) {
								if (column.dataIndex == key) {
									convertedData[key] = column.renderer ? column.renderer(value, null, item) : value;
									return false;
								}
							}, this);
						});

						//groupRecords.push(convertedData);
						gRecords.push(convertedData);
					});
					
					/*var summaryRenderer = grid.getPluginByType(Ext.grid.GroupSummary);
                    if (!Ext.isEmpty(summaryRenderer)) {
                        //Summary calculation for column in each group.
                        var cs = view.getColumnData();
                        group.summaries = {};
                        var data = summaryRenderer.calculate(group.rs, cs);

                        Ext.each(columns, function(col) {
                            var rendered = '';
                            if (col.summaryType || col.summaryRenderer) {
                                rendered = (col.summaryRenderer || col.renderer)(data[col.name], {}, { data: data }, 0, col.actualIndex, grid.store);
                            }
                            if (rendered == undefined || rendered === "") rendered = "&#160;";

                            group.summaries[col.dataIndex] = rendered;
                        });
                    }*/
					
				});
				
				kelompok.groupRecords = gRecords;
				//console.info(kelompok);
			}
			
			return kelompok;
		},
		
		generateBody: function(grid) {
			
			//kelompok.groupField
			//kelompok.columns
			//kelompok.groups
			//kelompok.groupData
			//kelompok.fitur
			//kelompok.groupRecords
			
			var kelompok = this.getGroupedData(grid),hasil;
			//console.info(kelompok);
			
			var view = grid.view;

			if (kelompok.fitur.groupingsummary || kelompok.fitur.grouping)
			{
				//this.bodyTpl.groupName = Ext.String.format('\{{0}\}', kelompok.groupField);
				this.bodyTpl.numColumns = kelompok.columns.length;
				var cells = this.bodyTpl.cellTpl.apply(kelompok.columns);
				this.bodyTpl.innerTemplate = Ext.String.format('<tpl for="groupRecords"><tr>{0}</tr></tpl>', cells);

				if (kelompok.fitur.groupingsummary) {
					var summaryCells = this.bodyTpl.groupSummaryCellTemplate.apply(kelompok.columns);
					this.bodyTpl.groupSummaryTemplate = Ext.String.format('<table class=\'group-summary\'><tpl for="summaries"><tr>{0}</tr></tpl></table>', summaryCells);
				} else {
					this.bodyTpl.groupSummaryTemplate = '';
				}

				var headings = Ext.create('Ext.XTemplate', this.headerTpl).apply(kelompok.columns);
				var body = this.bodyTpl.apply({});

				hasil = (Ext.String.format('<table class=\'table-parent\'>{0}<tpl for=".">{1}</tpl></table>', headings, body));
				//console.info(hasil);
				return hasil;
			}
			else
			{
				//No grouping, use base class logic.
				var headings = Ext.create('Ext.XTemplate', [ 
					'<tpl for=".">',
						'<th>{text}</th>',
					'</tpl>'
				]).apply(kelompok.columns);
				var body     = Ext.create('Ext.XTemplate', [
					'<tpl for=".">',
						'<td>\{{dataIndex}\}</td>',
					'</tpl>'
				]).apply(kelompok.columns);
				var pluginsBody = '',
					pluginsBodyMarkup = [];
				
				//add relevant plugins
				Ext.each(grid.plugins, function(p) {
					if (p.ptype == 'rowexpander') {
						pluginsBody += p.rowBodyTpl.join('');
					}
				});
				
				if (pluginsBody != '') {
					pluginsBodyMarkup = [
						'<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}"><td colspan="' + kelompok.columns.length + '">',
						  pluginsBody,
						'</td></tr>'
					];
				}
				
				//Here because inline styles using CSS, the browser did not show the correct formatting of the data the first time that loaded
				
				var htmlMarkup = [
					'<!DOCTYPE html>',
					'<html class="' + Ext.baseCSSPrefix + 'ux-grid-printer">',
					  '<head>',
						'<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
						'<link href="' + this.cssPath + '" rel="stylesheet" type="text/css" />',
						'<title>' + grid.title + '</title>',
					  '</head>',
					  '<body class="' + Ext.baseCSSPrefix + 'ux-grid-printer-body">',
					  /*'<div class="x-ux-grid-printer">',
						  '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkprint" href="javascript:void(0);" onclick="window.print();">' + this.printLinkText + '</a>',
						  '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkclose" href="javascript:void(0);" onclick="window.close();">' + this.closeLinkText + '</a>',
					  '</div>',*/
					  '<h1>' + this.mainTitle + '</h1>',
						'<table>',
						  '<tr>',
							headings,
						  '</tr>',
						  '<tpl for=".">',
							'<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}">',
							  body,
							'</tr>',
							pluginsBodyMarkup.join(''),
						  '</tpl>',
						'</table>',
					  '</body>',
					'</html>'           
				];
				//console.info(htmlMarkup);
				return htmlMarkup;
			}
			//return hasil;
			//console.info(hasil);
		},
		
		printLaporan: function(grid){
			var kelompok = this.getGroupedData(grid);
			//console.info(kelompok);
			if (this.cssPath === null) {
                var scriptPath = Ext.Loader.getPath('Ext.ux.egen.Printer');
                this.cssPath = scriptPath.substring(0, scriptPath.indexOf('Printer.js')) + 'css/laporan.css';
            }
			
			var data = [];
			grid.store.data.each(function(item, row) {
				var convertedData = {};
				//apply renderers from column model
				for (var key in item.data) {
					var value = item.data[key];
					
					Ext.each(kelompok.columns, function(column, col) {
						if (column && column.dataIndex == key) {
							var meta = {item: '', tdAttr: '', style: ''};
							value = column.renderer ? column.renderer.call(grid, value, meta, item, row, col, grid.store, grid.view) : value;
							convertedData[column.dataIndex] = value;
						} else if (column && column.xtype === 'rownumberer'){
							convertedData['Row'] = row + 1;
						}
					}, this);
				}

				data.push(convertedData);
			});
			
			var headings = Ext.create('Ext.XTemplate', [ 
					'<tpl for=".">',
						'<th>{text}</th>',
					'</tpl>'
				]).apply(kelompok.columns);
			var body     = Ext.create('Ext.XTemplate', [
					'<tpl for=".">',
						'<td>\{{dataIndex}\}</td>',
					'</tpl>'
				]).apply(kelompok.columns);
			var htmlMarkup = [
				'<!DOCTYPE html>',
				'<html>',
				'<head>',
					'<link href="' + this.cssPath + '" rel="stylesheet" type="text/css" media="screen,print" />',
					'<title>' + this.mainTitle + '</title>',
				'</head>',
				'<body>',
					'<table id="mytable" cellspacing="0" summary="' + this.mainTitle + '">',
						'<tr>',
						'<tpl for=".">',
							'<th>{text}</th>',
						'</tpl>',
						'</tr>',
						'<tpl for=".">',
						  '<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}">',
							body,
						  '</tr>',
						'</tpl>',
					'</table>',
				'<div style="page-break-after: always;"></div>',
				'</body>',
				'</html>'
			];
			//console.info(htmlMarkup);
			var html = Ext.create('Ext.XTemplate', htmlMarkup).apply(kelompok.columns);
			var win = window.open('', 'printgrid');
            
			//console.info(html);
			console.info(kelompok);
            //document must be open and closed
            win.document.open();
            win.document.write(html);
            win.document.close();
			//return htmlMarkup;
		},
		
        /**
         * @property cssPath
         * @type String
         * The path at which the print stylesheet can be found (defaults to 'ux/egen/css/Ext.ux.Printer.css')
         */
        cssPath: null,
        
        /**
         * @property desainLaporan
         * @type Array
         * Berisi Array dengan kode HTML untuk desain Laporan
         */
        desainLaporan: null,
        
        /**
         * @property printAuto
         * @type Boolean
         * True to open the print dialog automatically and close the window after printing. False to simply open the print version
         * of the grid (defaults to false)
         */
        printAuto: false,
        
        /**
         * @property closeAfterPrint
         * @type Boolean
         * True to close the window automatically after printing.
         * (defaults to false)
         */
        closeAfterPrint: false,        
        
        /**
         * @property mainTitle
         * @type String
         * Title to be used on top of the table
         * (defaults to empty)
         */
        mainTitle: '',
        
        /**
         * Text show on print link
         * @type String
         */
        printLinkText: 'Print',
        
        /**
         * Text show on close link
         * @type String
         */
        closeLinkText: 'Close',
        
        /*
         * @property headerTpl
         * @type {Object/Array} values
         * The markup used to create the headings row. By default this just uses <th> elements, override to provide your own
         *
        headerTpl: [ 
            '<tpl for=".">',
                '<th>{text}</th>',
            '</tpl>'
        ],

        /**
         * @property bodyTpl
         * @type {Object/Array} values
         * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
         * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
         *
        bodyTpl: [
            '<tpl for=".">',
                '<td>\{{dataIndex}\}</td>',
            '</tpl>'
        ]*/
		headerTpl: [
			'<tr>',
			  '<tpl for=".">',
				'<th style=\'width:{width}px\'>{text}</th>',
			  '</tpl>',
			'</tr>'
		],

		bodyTpl: new Ext.XTemplate(
			'<tr>',
			  '<td colspan=\'{[this.getColumnCount()]}\'>',
				'<div class=\'group-header\'>{[this.getGroupTextTemplate()]}</div>',
				'<table class=\'group-body\'>',
				  '{[this.getInnerTemplate()]}',
				'</table>',
				'{[this.getGroupSummaryTemplate()]}',
			  '</td>',
			'</tr>',

			{
				numColumns: 0,
				cellTpl: new Ext.XTemplate('<tpl for="."><td style=\'width:{width}px\'>\{{dataIndex}\}</td></tpl>'),
				groupSummaryCellTemplate: new Ext.XTemplate('<tpl for="."><td style=\'width:{width}px\'>\{{dataIndex}\}</td></tpl>'),
				innerTemplate: null,
				groupSummaryTemplate: null,
				groupName: null,

				getColumnCount: function() {
					return (this.numColumns);
				},

				getGroupTextTemplate: function() {
					//return (this.groupName);
					return ('{gname} : {name}  {filter}');
				},

				getInnerTemplate: function() {
					return (this.innerTemplate);
				},

				getGroupSummaryTemplate: function() {
					return (this.groupSummaryTemplate);
				}
			})
    }
});
