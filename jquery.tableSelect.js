/*!
 * jQuery tableSelect plugin 1.3.0
 *
 * Copyright (c) 2010, 2014 Kjel Delaey
 * Released under the MIT license
 * https://raw.github.com/trimentor/jquery-tableSelect/master/LICENSE
*/

(function ($) {
    $.extend($.fn, {
        tableSelect: function (options) {
            tableSelector = new $.tableSelector(options, this);
            return tableSelector;
        }
    });

    $.extend($.fn, {
        tableSelectOne: function (options) {
            var newOptions = $.extend({multiSelect: false}, options);
            tableSelector = new $.tableSelector(newOptions, this);
            return tableSelector;
        }
    });

    $.extend($.fn, {
        tableSelectMany: function (options) {
            var newOptions = $.extend({multiSelect: true}, options);
            tableSelector = new $.tableSelector(newOptions, this);
            return tableSelector;
        }
    });

    $.tableSelector = function (options, table) {
        this.options      = $.extend({}, $.tableSelector.defaults, options);
        this.currentTable = table;
        this.init();
    };

    $.extend($.tableSelector, {
        defaults: {
            tableClass:     "tableselect",
            rowSelectClass: "selected",
            multiSelect:    false
        },

        prototype: {
            init: function () {
                this.selections = [];
                this.listeners  = this.options.listeners || {};
                this.collectRows();
                this.initRowEvents();

                $(this.currentTable).addClass(this.options.tableClass);
            },

            allSelected: function () {
                return (this.selections.length == this.rows.length);
            },

            getSelections: function () {
                return this.selections;
            },

            getFocusedRow: function () {
                return this.rows[this.lastActiveRow];
            },

            isSelected: function (row) {
                var bool = false;
                for(var i=0; i<this.selections.length; i++) {
                    if(this.selections[i] == row) {
                        bool = true;
                        break;
                    }
                }
                return bool;
            },

            collectRows: function () {
                var table = this;
                this.rows = this.currentTable[0].tBodies[0].rows;
                $(this.rows).each(function () {
                    this.parentThis = table;
                });
            },

            initRowEvents: function () {
                var table = this;
                $(this.rows).each(function () {
                    $(this).bind('click', table.handleMouseDown);
                    $(this).bind('rowselect', table.rowSelectClass);
                    $(this).bind('rowdeselect', table.rowSelectClass);
                    table.initListeners(table, this);
                });
            },
            
            initListeners: function (table, row) {
                if(table.listeners) {
                    var listeners = table.listeners;
                    if(listeners.beforerowselect)   $(row).bind('beforerowselect',   listeners.beforerowselect);
                    if(listeners.afterrowselect)    $(row).bind('afterrowselect',    listeners.afterrowselect);
                    if(listeners.beforerowdeselect) $(row).bind('beforerowdeselect', listeners.beforerowdeselect);
                    if(listeners.afterrowdeselect)  $(row).bind('afterrowdeselect',  listeners.afterrowdeselect);
                }
            },

            handleMouseDown: function (event) {
                var table = this.parentThis;
                table.storeEventTarget(event, this);
                
                if(table.options.multiSelect) {
                    table.handleKeyDown(event, this);
                }
                else {
                    table.handleSingleSelect(this);
                }

                table.resetEventTarget(this);
            },

            handleKeyDown: function (event, row) {
                var rowIndex = row.sectionRowIndex;

                if(event.shiftKey) {
                    if(typeof(this.lastActiveRow) == "undefined") this.focusRow(rowIndex);
                    this.lockedRow = this.lastActiveRow;
                    if(event.ctrlKey) {
                        this.selectRange(this.lastActiveRow, rowIndex, true);
                    }
                    else {
                        this.selectRange(this.lockedRow, rowIndex, false);
                        this.focusRow(this.lockedRow);
                    }
                }
                else {
                    this.handleSingleSelect(row);
                }
            },
            
            storeEventTarget: function (event, row) {
                var target = event.target && event.target.nodeName;
                row.target = target ? target.toLowerCase() : null;
            },

            resetEventTarget: function (row) {
                row.target = undefined;
            },

            handleSingleSelect: function (row) {
                var rowIndex = row.sectionRowIndex;

                if(this.isSelected(row)) {
                    this.deselectRow(rowIndex);
                }
                else {
                    this.selectRow(rowIndex, this.options.multiSelect);
                }
            },

            selectRow: function (rowIndex, keepSelections) {
                var row = this.rows[rowIndex];

                if(keepSelections === false) this.clearSelections();
                if(row && this.isSelected(row) === false && $(row).trigger('beforerowselect') !== false) {
                    if(row.preventChange !== true) {
                        this.selections.push(row);
                        this.focusRow(rowIndex);
                        $(row).trigger('rowselect');
                        $(row).trigger('afterrowselect');
                        $(document).trigger('rowchange', this);
                    }
                    row.preventChange = undefined;
                }
            },

            deselectRow: function (rowIndex) {
                var row = this.rows[rowIndex];

                if(row && this.isSelected(row) && $(row).trigger('beforerowdeselect') !== false) {
                    if(row.preventChange !== true) {
                        var index = $.inArray(row, this.selections);
                        if(-1 != index) {
                            this.selections.splice(index, 1);
                            this.focusRow(rowIndex);
                            $(row).trigger('rowdeselect');
                            $(row).trigger('afterrowdeselect');
                            $(document).trigger('rowchange', this);
                        }
                    }
                    row.preventChange = undefined;
                }
            },

            focusRow: function (rowIndex) {
                this.lastActiveRow = rowIndex;
            },

            rowSelectClass: function (event) {
                switch(event.type) {
                    case 'rowselect':
                        $(this).addClass(this.parentThis.options.rowSelectClass);
                        break;
                    case 'rowdeselect':
                        $(this).removeClass(this.parentThis.options.rowSelectClass);
                        break;
                    default: break;
                }
            },

            selectAll: function () {
                if(this.options.multiSelect) {
                    this.clearSelections();
                    $(this.rows).each(function () {
                        this.parentThis.selectRow(this.sectionRowIndex, true);
                    });
                }
            },

            clearSelections: function () {
                $(this.rows).each(function () {
                    this.parentThis.deselectRow(this.sectionRowIndex);
                });
            },

            selectRange: function (startIndex, endIndex, keepSelections) {
                var i;

                if(keepSelections === false) this.clearSelections();

                if(startIndex <= endIndex) {
                    for(i=startIndex; i<=endIndex; i++) {
                        this.selectRow(i, true);
                    }
                }
                else {
                    for(i=startIndex; i>=endIndex; i--) {
                        this.selectRow(i, true);
                    }
                }
            }
        }
    });
})(jQuery);
