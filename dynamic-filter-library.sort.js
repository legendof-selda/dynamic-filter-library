class SortControl {
    //Sort Config
    static defaultConfig = {
        //sortColCount: 6, //number of columns where sort is enabled
        sortHidInput: '#sortOrder', //sortOrder query is converted and stored here
        sortableLink: 'a.sortable-link',
        sortOrderBadge: 'span.col-badge',
        sortTypeBadge: 'span.glyphicon',
        searchForm: '#searchParams',
        updateTypeBadgeUI: function (orderBadge, ordertype = 0) {
            orderBadge.removeClass('glyphicon-circle-arrow-up');
            orderBadge.removeClass('glyphicon-circle-arrow-down');
            switch (ordertype) {
                case 1:
                    orderBadge.addClass('glyphicon-circle-arrow-up');
                    break;
                case 2:
                    orderBadge.addClass('glyphicon-circle-arrow-down');
                    break;
                default:
                    break;
            }
        },
        beforeSortAction: function () { },
        afterSortAction: function () { }
    };
    /**
     * @deprecated not used anymore
     * @description Created Dynamic MultiDimensional Array
     * @param {number} length - N Dimensions for array
    */
    static MArray(length) {
        let arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            let args = Array.prototype.slice.call(arguments, 1);
            while (i--) arr[length - 1 - i] = SortControl.MArray.apply(this, args);
        }

        return arr;
    }

    constructor(userconfig) {
        this._config = $.extend({}, SortControl.defaultConfig, userconfig);
        this._currentColIndex = -1;
        this._currentSortIndex = 0;
        //this._sortColIndex = SortControl.MArray(this._config.sortColCount, 2);
        this._sortColIndex = {};
    }

    get config() {
        return this._config;
    }
    set config(userconfig) {
        $.extend(this._config, userconfig);
    }
    get currentColIndex(){
        return this._currentColIndex;
    }
    get currentSortIndex(){
        return this._currentSortIndex;
    }
    get sortColIndex(){
        return this._sortColIndex;
    }
    /**
     * @description Perform Sort button action. Can add custom before and after Sort button click functions
     * @param {object} e - Event
     */
    sortAction = function (e) {
        e.preventDefault();
        this._config.beforeSortAction.call(this);
        this.addSort($(e.currentTarget).data('col'));
        this.updateBadgeDisplay();
        this._config.afterSortAction.call(this);
    }
    /**
     *@description update Sort UI
    */
    updateBadgeDisplay() {
        for (let i in this._sortColIndex) {
            let sl = $(this._config.sortableLink + '[data-col=' + i + ']');

            sl.find(this._config.sortOrderBadge).text(isNullOrUndefined(this._sortColIndex[i][0]) ? "" : this._sortColIndex[i][0]);
            this._config.updateTypeBadgeUI(sl.find(this._config.sortTypeBadge), this._sortColIndex[i][1]);
        }
    }

    /**
     * @description Update this._sortColIndex array
     * @param {number} colIndex
     */
    insertIntoSort(colIndex) {
        if (isNullOrUndefined(this._sortColIndex[colIndex]) || isNullOrUndefined(this._sortColIndex[colIndex][0])) {
            this._sortColIndex[colIndex] = [++this._currentSortIndex, null];
        }
        else {
            var index = this._sortColIndex[colIndex][0];
            if (index != this._currentSortIndex) {
                for (let i in this._sortColIndex) {
                    if (!isNullOrUndefined(this._sortColIndex[i][0])) {
                        if (this._sortColIndex[i][0] >= index) {
                            this._sortColIndex[i][0]--;
                        }
                    }
                }
                this._sortColIndex[colIndex][0] = this._currentSortIndex;
            }
        }
    }
    /**
     * @description Updates this._sortColIndex and this._currentColIndex
     * @param {number} colIndex - colIndex where update needs to be occured
     * @returns {Array} - Returns the current updated sort value
     */
    addSort(colIndex) {
        if (this._currentColIndex == colIndex) {
            this._sortColIndex[colIndex][1] = (this._sortColIndex[colIndex][1] + 1) % 3;
        }
        else {
            this.insertIntoSort(colIndex);
            this._sortColIndex[colIndex][1] = isNullOrUndefined(this._sortColIndex[colIndex][1]) ? 1 : (this._sortColIndex[colIndex][1] + 1) % 3;
            this._currentColIndex = colIndex;
        }
        if (this._sortColIndex[colIndex][1] == 0) {
            this._currentColIndex = null;
            this._sortColIndex[colIndex][0] = null;
            this._currentSortIndex--;
        }
        return this._sortColIndex[colIndex];
    }
    /**
     * @deprecated not used anymore
     * @description Sort function for sorting indices
     * @param {boolean} asc
     */
    getSort(asc = true) {
        let position = asc ? 1 : -1;
        return function (a, b) {
            if (isNullOrUndefined(a)) return position;
            if (isNullOrUndefined(b)) return -position;
            if (a < b) return -position;
            if (a > b) return position;
            return 0;
        }
    }
    /**
     * @description Converts this._sortColIndex to string format for sort param
     * @param {Array} arr
     * @param {string} delim
     * @returns {string}
     */
    convertArrayToString(arr, delim = '~') {
        //let indices = [...arr.keys()];
        let indices = Object.keys(arr);
        indices.sort(function (a, b) {
            if (isNullOrUndefined(arr[a][0])) return 1;
            if (isNullOrUndefined(arr[b][0])) return -1;
            if (arr[a][0] < arr[b][0]) return -1;
            if (arr[a][0] > arr[b][0]) return 1;
            return 0;
        });

        let str = "";
        for (let i of indices) {
            if (isNullOrUndefined(arr[i][0])) break;
            //let sortableLink = $('.sortable-link[data-colindex=' + indices[i] + ']');
            //str = str + arr[indices[i]][1] + sortableLink.data('col') + delim;
            str = str + arr[i][1] + i + delim;
        }
        return str.slice(0, -1);
    }
    /**
     * @description Converts sort param string format to this._sortColIndex
     * @param {string} sortString
     * @param {string} delim
     */
    convertStringToArray(sortString, delim = '~') {
        let s = sortString.split(delim);
        for (let i = 0; i < s.length; i++) {
            //let sortableLink = $('.sortable-link[data-col=' + s[i].substring(1) + ']');
            //let ind = sortableLink.data('colindex');
            let ind = s[i].substring(1);
            this._sortColIndex[ind] = [i + 1, parseInt(s[i].substring(0, 1))];
            //this._sortColIndex[ind][1] = parseInt(s[i].substring(0, 1));
        }
        this._currentSortIndex = s.length;
    }

    /**
     * @description Run this before submitting or updating to apply sort query
     */
    sortSubmit() {
        $(this._config.sortHidInput).val(this.convertArrayToString(this._sortColIndex));
    }
}