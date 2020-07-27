class FilterBreadCrumbsControl {
    //Filter Breadcrumbs Config
    constructor(filtercontrol) {
        this._fc = filtercontrol;
    }
    /**
     * @description Get all Indices of val in string
     * @param {string} str - String to search in
     * @param {string|RegExp} val - Value to be found
     * @returns {Array}
    */
    static getIndicesOf(str, val) {
        let indices = []; let i = -1;
        while ((i = str.indexOf(val, i + 1)) != -1) {
            indices.push(i);
        }
        return indices;
    }

    /**
     * @description Converts string query to breadcrumbs when available and appends to _fc.config.breadcrumbs
     * @param {string} query
     */
    createBreadCrumbs(query = $(this._fc.config.searchHidInput).val()) {
        let newline = /\^/g;
        let connectors = /([\&\|])/g;
        let operands = /(%%|!%%|_%|!_%|%_|!%_|!_|>=|<=|=|!|>|<|_)/g;
        let substituteOperandName = {
            "%%": "contains",
            "!%%": "doesn't contain",
            "_%": "begins with",
            "!_%": "doesn't begin with",
            "%_": "ends with",
            "!%_": "doesn't end with",
            "_": "is empty",
            "!_": "is not empty",
            "!": "!="
        };
        let lines = query.split(newline); //["", line1, ...]
        let cindices = FilterBreadCrumbsControl.getIndicesOf(query, "^");
        cindices.push(query.length);
        for (let line in lines) {
            if (lines[line].length == 0) {
                $(this._fc.config.breadcrumbs).append($("<li><a class='" + ((line == (lines.length - 1)) ? "active" : "") + "' data-query=''>All</a></li>"));
                continue;
            }
            let fstring = "";
            let filters = lines[line].split(connectors); //[filter0, connector1, filter1, ...]
            for (let f of filters) {
                if (connectors.test(f))
                    fstring = fstring + (f == "|" ? " or " : " and ");
                else if (f.length) {
                    let filter = f.split(operands); //[col, operand, value]
                    fstring = fstring + this._fc.config.columns(filter[0]).text + " " + ((filter[1] in substituteOperandName) ? substituteOperandName[filter[1]] : filter[1]) + (filter[2].length ? " '" + filter[2] + "'" : "");
                }
            }
            $(this._fc.config.breadcrumbs).append($("<li><a class='" + ((line == (lines.length - 1)) ? "active" : "") + "' data-query='" + query.substring(0, cindices[line]) + "'>" + fstring + "</a></li>"));
        }

        $(this._fc.config.breadcrumbs).on('click', 'li > a', function (e) {
            e.preventDefault();
            $(this._fc.config.searchHidInput).val(e.currentTarget.getAttribute('data-query'));
            $(this._fc.config.searchForm)[0].submit();
        }.bind(this));
    }
    
}