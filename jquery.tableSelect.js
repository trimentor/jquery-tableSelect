/*
 * jQuery tableSelect plugin 1.1.0
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
            var options   = $.extend({multiSelect: false}, options);
            tableSelector = new $.tableSelector(options, this)
            return tableSelector;
        }
    });

    $.extend($.fn, {
        tableSelectMany: function(options) {
            var options   = $.extend({multiSelect: true}, options);
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
            multiSelect:    false
        },

        prototype: {
            init: function() {
                this.selections = [];
                this.collectRows();
                this.initRowEvents();

                $(this.currentTable).addClass(this.options.tableClass);
            },

            allSelected: function() {
                return (this.selections.length == this.rows.length);
            },

            getSelections: function() {
                return this.selections;  
            },

            getFocusedRow: function() {
                return this.rows[this.lastActiveRow];
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
                var table = this.parentThis;
                if(table.options.multiSelect) {
                    table.handleKeyDown(event, this);
                }
                else {
                    table.handleSingleSelect(this);
                }
            },

            handleKeyDown: function(event, row) {
                var rowIndex = row.rowIndex-1;
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

            handleSingleSelect: function(row) {
                var rowIndex = row.rowIndex-1;
                if(this.isSelected(row)) {
                    this.deselectRow(rowIndex);
                }
                else {
                    this.selectRow(rowIndex, this.options.multiSelect);
                }
            },

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
                if(this.options.multiSelect) {
                    this.clearSelections();
                    $(this.rows).each(function() {
                        this.parentThis.selectRow(this.rowIndex-1, true);
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
