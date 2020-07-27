class FilterControl {

    static defaultConfig = {
        searchHidInput: '#filter', //searchFilter query is converted and stored here
        searchColSelect: 'select.searchCol',
        searchInput: '.searchInput',
        queryOperand: 'select.query-operand',
        repeatableArea: '.repeatable',
        addButton: 'button.add',
        deleteButton: 'button.delete',
        orButton: 'button.or',
        templateID: '#repeatable-template',
        connector: 'input.connectorOp',
        searchForm: '#searchParams',
        minItems: 0,
        maxItems: null,
        checkAddAction: function (maxreached = false) {
            if (maxreached)
                $(this.addButton).attr('disabled', 'disabled');
            else
                $(this.addButton).removeAttr('disabled');
        },
        checkDeleteAction: function (minreached = false) {
            if (minreached)
                $(this.deleteButton).attr('disabled', 'disabled');
            else
                $(this.deleteButton).removeAttr('disabled');
        },
        beforeAddAction: function (e) { },
        afterAddAction: function (e, item) {
            let el = item.find(this.config.searchColSelect).first();
            this.getColFilterOptions(el, this.config.columns());
            let prevel;
            if (e.currentTarget.classList.contains('or')) {
                prevel = this.getItem(e.currentTarget.getAttribute('data-tid'));
                item.find(this.config.connector).first().val('|');
            }
            else if (e.currentTarget.classList.contains('and')) {
                prevel = this.getItem(e.currentTarget.getAttribute('data-tid'));
                item.find(this.config.connector).first().val('&');
            }
            else {
                prevel = this.getItem(this.repeatedIndex - 2);
                item.find(this.config.connector).first().val('^');
            }
            this.config.updateFilterUI(item);
            //el.change(function () {
            //    this.colFilterChange.call(this, prevel.find(this.searchInput).first().val(), prevel.find(this.queryOperand).first().val())
            //});
            //el.on('change', this.searchColSelect, this.colFilterChange);
            el.val(prevel.find(this.config.searchColSelect).first().val());
            el.change();
            item.find(this.config.searchInput).first().val(prevel.find(this.config.searchInput).first().val());
            item.find(this.config.queryOperand).first().val(prevel.find(this.config.queryOperand).first().val());
            item.find(this.config.queryOperand).first().change();
        },
        beforeDeleteAction: function (e, item) { },
        afterDeleteAction: function (e) { },
        updateFilterUI: function (item) {
            if (isNullOrUndefined(item)) {
                let repeatable_items = $(this.repeatableArea).children('.repeatable-item');
                for (let i = 0; i < repeatable_items.length; i++) {
                    this.updateFilterUI($(repeatable_items[i]));
                }
            }
            else {
                let c = item.find(this.connector).first().val();
                switch (c) {
                    case "|":
                        $("#connectorDisplay_" + item.data('tid')).html('&nbsp;or');
                        //item.find('.and').first().hide();
                        item.find('.and').first().remove();
                        break;
                    case "&":
                        $("#connectorDisplay_" + item.data('tid')).html('and');
                        //item.find('.or').first().hide();
                        item.find('.or').first().remove();
                        break;
                    default:
                        $("#connectorDisplay_" + item.data('tid')).html('');
                        break;
                }
            }
        },
        //"col": {
        //    text: "Display Text",
        //    type: "bool|enum|text|numeric|date|datetime|custom",
        //    validationRegex: "regex expression for validation",
        //    excludedOperands: ["=", "!", "%%", "!%%", "_%", "!_%", "%_", "!%_", "_", "!_", ">", "<", ">=", "<="] operand to exclude,
        //    options:
        //      *bool,*enum,*multiple
        //        [
        //            {
        //                text: "Yes",
        //                value: "1"
        //            },
        //            {
        //                text: "No",
        //                value: "0"
        //            }
        //        ]
        //      *numeric
        //        {
        //            max_value: Maximum value,
        //            min_value: Minimmum value,
        //            def_value: Default Value
        //        }
        //      *date
        //        {
        //            max_value: Maximum value,
        //            min_value: Minimmum value,
        //            def_value: Default Value
        //        }
        //      *datetime
        //        {
        //            max_value: Maximum value,
        //            min_value: Minimmum value,
        //            def_value: Default Value
        //        }
        //      *custom
        //        {
        //            custom_element: "html text based element with {/id} and {/class} replacement tag"
        //            options: [{text, value},...],    
        //            max_value: Maximum value,
        //            min_value: Minimmum value,
        //            custom_UI_action: function(){ this.do_something; },
        //            def_value: Default Value
        //        }
        //      *text
        //        "Default Text Value"
        //          
        //},
        /**
         * 
         * @param {string} [c] - Column value get JSON object for this column. If not defined will return all JSON array of column JSON object
         * @returns {JSON|Array} return selected column JSON object or array of JSON objects
         */
        columns: function (c = null) { },
        //Filter Breadcrumbs Config
        breadcrumbs: 'ul.breadcrumbs'
    };
    constructor(userconfig) {
        //Filter Config
        this._config = $.extend({}, FilterControl.defaultConfig, userconfig);
        this._operands = {
            "=": "Equals",
            "!": "Not Equal",
            "%%": "Contains",
            "!%%": "Doesn't Contain",
            "_%": "Begins with",
            "!_%": "Doesn't Begin with",
            "%_": "Ends with",
            "!%_": "Doesn't End with",
            "_": "Empty",
            "!_": "Not Empty",
            ">": "Greater than",
            "<": "Less than",
            ">=": "Greater than equal to",
            "<=": "Less than equal to"
        };
        this.repeatedIndex = 0;
        this.totalRItem = 0;
        /**
        * @description Add button click action. Can add custom before and after Add button click functions
        * @param {object} e - Event
        */
        this.addAction = function (e) {
            e.preventDefault();
            if ((this.totalRItem > this._config.maxItems) && this._config.maxItems != null) return;
            this._config.beforeAddAction.call(this, e);
            let afterid = (e.currentTarget.classList.contains('and') || e.currentTarget.classList.contains('or')) ? e.currentTarget.parentElement : null;
            let item = this.createItem(afterid);
            this.totalRItem++;
            this.updateButtons();
            this._config.afterAddAction.call(this, e, item);
        };
        /**
        * @description Delete button click action. Can add custom before and after Delete button click functions
        * @param {object} e - Event
        */
        this.deleteAction = function (e) {
            e.preventDefault();
            if (this.totalRItem <= this._config.minItems) return;
            let item = this.getItem($(e.currentTarget).data('tid'));
            this._config.beforeDeleteAction.call(this, e, item);
            item.remove();
            this.totalRItem--;
            this.updateButtons();
            this._config.afterDeleteAction.call(this, e);
        };
        /**
         * @description columns select change function
         */
        this.colFilterChange = function (e) {
            let val = $(e.currentTarget).val();
            let el = $(e.currentTarget).parent().find(this._config.searchInput);
            if (val == "") {
                this.switchInput(el);
                this.switchInput(el.parent().find(this._config.queryOperand));
            }
            else {
                el = this.switchInput(el, this._config.columns(val).type, this._config.columns(val).options);
                el.data('selected-col', val); //add selected column value to this._config.searchInput so that it can be accessed for other functions like AJAX autofill
                this.addOptions(el.parent().find(this._config.queryOperand), 'select', this.getOperandOptions(this._config.columns(val).excludedOperands));
                el.parent().find(this._config.queryOperand).show();
            }
        };
    }
    get config() {
        return this._config;
    }

    set config(userconfig) {
        $.extend(this._config, userconfig);
    }
    /**
     * @description Get Operands
     * @param {Array} excludedOperands - Operands which are not required
     * @param {string} [selected] - Selected  Operand
     */
    getOperandOptions(excludedOperands, selected = null) {
        let options = new Array();
        for (let val in this._operands) {
            if (!excludedOperands.includes(val))
                options.push({ text: this._operands[val], value: val, selected: selected == val });
        }
        return options;
    }

    /**
     * @description Used to switch input to another type or remove it
     * @param {JQuery} inputElement - The input element which needs to be converted
     * @param {string} [type] - Type of new input element 'text'|'select'. Null makes it hidden and disabled
     * @param {string|Array} [options] - Column filter Values
     * @param {string} [newElementId] - ID for new input element. Default will be initial element id.
     * @param {string} [newElementClass] - Class for new input element. Default will be initial element class.
     */
     switchInput(inputElement, type = null, options = null, newElementId = null, newElementClass = null) {
        newElementId = newElementId ?? inputElement.attr('id');
        newElementClass = newElementClass ?? inputElement.attr('class');

        switch (type) {
            case null:
                inputElement.hide();
                inputElement.val("");
                break;
            case 'bool':
            case 'select':
            case 'enum':
                inputElement.replaceWith($('<select id="' + newElementId + '" class="' + newElementClass + '"></select>'));
                inputElement = $('#' + newElementId);
                if (options != null) {
                    this.addOptions(inputElement, type, options);
                }
                break;
            case 'multiple':
                inputElement.replaceWith($('<select id="' + newElementId + '" class="' + newElementClass + '" multiple></select>'));
                inputElement = $('#' + newElementId);
                if (options != null) {
                    this.addOptions(inputElement, type, options);
                }
                break;
            case 'numeric':
            case 'number':
                inputElement.replaceWith($('<input type="number" id="' + newElementId + '" class="' + newElementClass + '" />'));
                inputElement = $('#' + newElementId);
                if (options != null) {
                    this.addOptions(inputElement, type, options);
                }
                break;
            case 'date':
                inputElement.replaceWith($('<input type="date" id="' + newElementId + '" class="' + newElementClass + '" />'));
                inputElement = $('#' + newElementId);
                if (options != null) {
                    this.addOptions(inputElement, type, options);
                }
                break;
            case 'datetime':
                inputElement.replaceWith($('<input type="datetime-local" id="' + newElementId + '" class="' + newElementClass + '" />'));
                inputElement = $('#' + newElementId);
                if (options != null) {
                    this.addOptions(inputElement, type, options);
                }
                break;
            case 'custom':
                if (options != null) {
                    let e = $(options.custom_element.replace(/{\/id}/g, newElementId).replace(/{\/id}/g, newElementClass));
                    inputElement.replaceWith(e);
                    inputElement = $('#' + newElementId);
                    this.addOptions(inputElement, type, options);
                }
                break;
            case 'text':
            default:
                inputElement.replaceWith($('<input type="text" id="' + newElementId + '" class="' + newElementClass + '" />'));
                inputElement = $('#' + newElementId);
                if (options != null && !Array.isArray(options))
                    this.addOptions(inputElement, type, options);
                break;
        }
        return inputElement;
    }
    /**
     * @description Add options to element based on type
     * @param {JQuery} element - JQuery element
     * @param {string} type - bool|enum|text|numeric|date|datetime type
     * @param {object|string|Array} options - Values to add in Array format
     */
     addOptions(element, type, options) {
        switch (type) {
            case 'bool':
            case 'select':
            case 'enum':
            case 'multiple':
                if (Array.isArray(options)) {
                    element.empty();
                    options.forEach(option =>
                        element.append(new Option(option.text, option.value, option.selected))
                    );
                    if (!isNullOrUndefined(options.def_value))
                        element.val(options.def_value);
                }
                break;
            case 'numeric':
            case 'number':
            case 'date':
            case 'datetime':
                if (typeof (options) == "object") {
                    if (!isNullOrUndefined(options.def_value))
                        element.val(options.def_value);
                    element.attr('min', options.min_value);
                    element.attr('max', options.max_value);
                }
                break;
            case 'custom':
                if (isNullOrUndefined(options.custom_UI_action)) {
                    options.custom_UI_action.call(this);
                }
                else {
                    if (Array.isArray(options.options)) {
                        element.empty();
                        options.options.forEach(option =>
                            element.append(new Option(option.text, option.value, option.selected))
                        );
                    }
                    if (!isNullOrUndefined(options.attributes)) {
                        for (let attribute in options.attributes)
                            element.attr(attribute, options.attributes[attribute]);
                    }
                    if (!isNullOrUndefined(options.def_value))
                        element.val(options.def_value);
                }
                break;
            case 'text':
            default:
                if (typeof (options) == "string") {
                    element.val(options);
                }
                break;
        }
    }
    /**
     * @description  Generated columns in select
     * @param {JQuery} selectElement - Select Element to populate
     * @param {object} columns - columns object
     * @param {string} [selected] - Selected column value
     * @param {string} [placeholder] - Placeholder Text
     */
     getColFilterOptions(selectElement, columns, selected = null, placeholder = "--Select Column--") {
        selectElement.empty();
        if (!isNullOrUndefined(placeholder))
            selectElement.append(new Option(placeholder, "", true, selected == null));
        for (let col in columns) {
            if (isNullOrUndefined(columns[col].filterDisabled))
                selectElement.append(new Option(columns[col].text, col, null, selected == col));
        }
    }

    /**
     * @description Create repeatable template and add to repeatable area
     * @param {string} [afterid] - Add new template after this Element ID
     * @return {JQuery}
    */
    createItem(afterid = null) {
        let template = $(this._config.templateID).html();
        template = $(template.replace(/{\/id}/g, this.repeatedIndex++));
        if (afterid)
            template.insertAfter(afterid);
        else
            template.appendTo(this._config.repeatableArea);
        return template;
    }
    /**
     * @description Retrieve repeatable template from repeatable area
     * @param {string|number} id - Id of repeatable-item
     * @return {JQuery}
    */
     getItem(id) {
        let template = $(this._config.repeatableArea).find("#repeatable-item_" + id);
        return template;
    }
    /**
     * @description Update Add and Delete button after creating/removing repeated item if it needs to be disabled
     */
    updateButtons() {
        if (this.totalRItem <= (this._config.minItems ?? 0)) {
            //$(this._config.deleteButton).attr('disabled', 'disabled');
            this._config.checkDeleteAction(true);
        }
        else if (this.totalRItem > this._config.minItems) {
            //$(this._config.deleteButton).removeAttr('disabled');
            this._config.checkDeleteAction(false);
        }
        if (isNullOrUndefined(this._config.maxItems))
            return;
        if (this.totalRItem >= this._config.maxItems) {
            //$(this._config.addButton).attr('disabled', 'disabled');
            this._config.checkAddAction(true);
        }
        else if (this.totalRItem < this._config.maxItems) {
            //$(this._config.addButton).removeAttr('disabled');
            this._config.checkAddAction(false);
        }
    }

    /**
     * @description Converts the repeatable template items to filter query string
     */
     convertRepeatableTItemsToString() {
        let repeatable_items = $(this._config.repeatableArea).children('.repeatable-item');
        let query = "";
        for (let i = 0; i < repeatable_items.length; i++) {
            let val = $(repeatable_items[i]).children(this._config.searchInput).val();
            if (isNullOrUndefined(val) || val == "") {
                let c = $(repeatable_items[i]).children(this._config.queryOperand).val();
                if (c != "_" && c != "!_") continue;
            }
            val = Array.isArray(val) ? val.join(',') : val;
            query = query + $(repeatable_items[i]).children(this._config.connector).val() + $(repeatable_items[i]).children(this._config.searchColSelect).val() + $(repeatable_items[i]).children(this._config.queryOperand).val() + val;
        }
        return query;
    }
    /**
     * @description Converts the string query to the Repeated Template items
     * @param {string} query - Query string
     */
     convertStringToRepeatableTItems(query) {
        let connectors = /([\^\&\|])/g;
        let operands = /(%%|!%%|_%|!_%|%_|!%_|!_|>=|<=|=|!|>|<|_)/g;
        let lines = query.split(connectors); //[""; this._config.connector1, filter1, ...]
        var item;
        for (let line of lines) {
            if (connectors.test(line)) {
                item = this.createItem();
                this.totalRItem++;
                item.find(this._config.connector).first().val(line);
            }
            else if (line.length > 0) {
                let filter = line.split(operands); //[column, operand, value]
                let el = item.find(this._config.searchColSelect).first();
                this.getColFilterOptions(el, this._config.columns());
                el.val(filter[0]);
                el.change();
                item.find(this._config.queryOperand).first().val(filter[1]);
                item.find(this._config.searchInput).first().val(filter[2].indexOf(',') == -1 ? filter[2] : filter[2].split(','));
            }
        }
        this._config.updateFilterUI();
    }

    /**
     * @description Run this before submitting or updating to apply filter query
     */
     filterSubmit() {
         $(this._config.searchHidInput).val(this.convertRepeatableTItemsToString());
    }
}