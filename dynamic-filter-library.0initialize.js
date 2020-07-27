/**
 * @description Check if object is null or undefined
 * @param {any} obj
 * @returns {boolean} 
 */
function isNullOrUndefined(obj) {
    return obj == null || typeof obj === 'undefined';
}

/**
 * @description Initialize the library with default behaviour. To customize, create your own function (using this abstract) and do not call this one
 * @param {FilterControl} [fc] -  Filter Control Object
 * @param {SortControl} [sc] - Sort Control Object
 * @param {FilterBreadCrumbsControl} [bc] - Filter breadcrumbs Control Object
*/
function initializeDynamicFilterLibrary(fc = null, sc = null, bc = null) {
    //Initialize for filter settings
    if (fc) {
        $(document).ready(function () {
            $(document).on('click', fc.config.addButton, fc.addAction.bind(fc));
            $(fc.config.repeatableArea).on('click', fc.config.deleteButton, fc.deleteAction.bind(fc));

            $(fc.config.repeatableArea).on('change', fc.config.searchColSelect, fc.colFilterChange.bind(fc));

            $(fc.config.repeatableArea).on('change', fc.config.queryOperand, function () {
                let val = $(this).val();
                let si = $(this).parent().find(fc.config.searchInput).first();
                if (val == "_" || val == "!_") {
                    if (si.is(':visible')) {
                        si.val("");
                        si.hide();
                    }
                }
                else {
                    if (si.is(':hidden'))
                        si.show();
                }
            });

            if ($(fc.config.searchHidInput).val() != "") {
                fc.convertStringToRepeatableTItems($(fc.config.searchHidInput).val());
            }
            //$(searchColSelect).change();
            $(fc.config.queryOperand).change();

            //Initialize for Filter Breadcrumbs settings
            if (bc) {
                //bc.createBreadCrumbs($(fc.config.searchHidInput).val());
                bc.createBreadCrumbs();
            }
        });
    }
    //Initialize for sort settings
    if (sc) {
        $(document).ready(function () {
            $(document).on('click', sc.config.sortableLink, sc.sortAction.bind(sc));

            if ($(sc.config.sortHidInput).val().length > 0) {
                sc.convertStringToArray($(sc.config.sortHidInput).val());
                sc.updateBadgeDisplay();
            }
        });
    }
}