Version 1.0.0 / 2010-11-10
--------------------------

This is the first release of the jQuery tableSelect plugin.

* Allow selection of just one single row in a table's tbody section by using `$("table").tableSelectOne()`.
* Allow selection of multiple rows in a table's tbody section by using `$("table").tableSelectMany()`.

Version 1.1.0 / 2010-11-12
--------------------------

* Enhancements
 * Enable SHIFT + CTRL selection
 * usage of sectionRowIndex

Version 1.2.0 / 2010-12-15
--------------------------

* Enhancements
 * Supports listeners: `beforerowselect`, `beforerowdeselect`, `afterrowselect`, and `afterrowdeselect`
 * Prevent a change from happening by enabling `row.preventChange` in the `beforerowselect` and `beforerowdeselect` listeners.
