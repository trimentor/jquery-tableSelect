/*
 * jQuery tableSelect plugin 1.0.0
 *
 * Copyright (c) 2010 Kjel Delaey
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
*/

(function($) {
    $.extend($.fn, {
        tableSelect: function(options) {
            tableSelector = new $.tableSelector(options, this)
            return tableSelector;
        }
    });

    $.extend($.fn, {
        tableSelectOne: function(options) {
            var options   = $.extend({keepSelections: false}, options);
            tableSelector = new $.tableSelector(options, this)
            return tableSelector;
        }
    });

    $.extend($.fn, {
        tableSelectMany: function(options) {
            var options   = $.extend({keepSelections: true}, options);
            tableSelector = new $.tableSelector(options, this)
            return tableSelector;
        }
    });

    $.tableSelector = function(options, table) {
        this.options      = $.extend({}, $.tableSelector.defaults, options);
        this.currentTable = table;
        this.init();
    };

    $.extend($.tableSelector, {
        defaults: {
            tableClass:     "tableselect",
            rowSelectClass: "selected",
            keepSelections: false
        },

        prototype: {
            init: function() {
                this.selections = [];
                this.collectRows();
                this.initRowEvents();

                $(this.currentTable).addClass(this.options.tableClass);
            },

            lastActive: function() {
                return this.rows[this.lastActiveRow];
            },

            allSelected: function() {
              return (this.selections.length == this.rows.length);
            },

            selectedRows: function() {
              return this.selections;  
            },

            collectRows: function() {
                var table = this;
                this.rows = this.currentTable[0].tBodies[0].rows;
                $(this.rows).each(function() {
                    this.parentThis = table;
                });
            },

            initRowEvents: function() {
                var table = this;
                $(this.rows).each(function() {
                    $(this).bind('click', table.handleMouseDown);
                    $(this).bind('rowselect', table.rowSelectClass);
                    $(this).bind('rowdeselect', table.rowSelectClass);
                });
            },

            handleMouseDown: function(event) {
                var table    = this.parentThis;
                var rowIndex = this.rowIndex-1;
                if(table.isSelected(this) == false) {
                    table.selectRow(rowIndex, table.options.keepSelections);
                }
                else {
                    table.deselectRow(rowIndex, table.options.keepSelections);
                }
            },

            /*handleKeyDown: function(event) {
                var table    = event.data.row.parentThis;
                var rowIndex = event.data.row.rowIndex-1;

                if(event.ctrlKey) {
                    if(table.isSelected(event.data.row) == false) {
                        table.selectRow(rowIndex, true);
                    }
                    else {
                        table.deselectRow(rowIndex, true);
                    }
                }

                if(event.shiftKey) {
                    table.selectRange(table.lastActiveRow, rowIndex, true);
                }
            },*/

            selectRow: function(rowIndex, keepSelections) {
                var row = this.rows[rowIndex];
                if(keepSelections == false) this.clearSelections();
                if(row && this.isSelected(row) == false) {
                    this.selections.push(row);
                    this.focusRow(rowIndex);
                    $(row).trigger('rowselect');
                    $(document).trigger('rowchange', this);
                }
            },

            deselectRow: function(rowIndex) {
                var row = this.rows[rowIndex];
                if(row && this.isSelected(row)) {
                    var index = $.inArray(row, this.selections);
                    if(-1 != index) {
                        this.selections.splice(index, 1);
                        this.focusRow(rowIndex);
                        $(row).trigger('rowdeselect');
                        $(document).trigger('rowchange', this);
                    }
                }
            },

            isSelected: function(row) {
                var bool = false
                for(var i=0; i<this.selections.length; i++) {
                    if(this.selections[i] == row) {
                        bool = true;
                        break;
                    }
                }
                return bool;
            },

            focusRow: function(rowIndex) {
                this.lastActiveRow = rowIndex;
            },

            rowSelectClass: function(event) {
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

            selectAll: function() {
                if(this.options.keepSelections) {
                    this.clearSelections();
                    $(this.rows).each(function() {
                        this.parentThis.selectRow(this.rowIndex-1, this.parentThis.options.keepSelections);
                    });
                }
            },

            clearSelections: function() {
                $(this.rows).each(function() {
                    this.parentThis.deselectRow(this.rowIndex-1);
                });
            },

            selectRange: function(startIndex, endIndex, keepSelections) {
                if(keepSelections == false) this.clearSelections();
                if(startIndex <= endIndex) {
                    for(var i=startIndex; i<=endIndex; i++) {
                        this.selectRow(i, true);
                    }
                }
                else {
                    for(var i=startIndex; i>=endIndex; i--) {
                        this.selectRow(i, true);
                    }
                }
            }
        }
    });
})(jQuery);
