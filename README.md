# DYNAMIC-FILTER-LIBRARY

A JavaScript/JQuery library which can power filter and sorting queries for your data easily while you focus on design!

![Preview](others/screen-capture.gif)

All you have to do is load it up, configure to match the elements to the library and its up and running.  

## Introduction

The library includes the following features:

1. A _filter_ query generator which allows you to create complex clauses which you can use to dynamically create your SELECT statement.
2. A _sort_ query generator which allows you to select the columns you want to sort while specifying the order of the columns and direction.
3. Filter _breadcrumbs_ which gives more readability and allows you to traverse through your filter clauses.  

The library uses JQuery to find the configured elements and perform necessary actions. We can add custom methods which needs to be performed to further power it up!  

### Dynamic Columns

The columns and its properties are dynamic! You just need to pass the `columns` method, in `config`, to fetch the column (table header/collection) names and other details.  
The `columns()` function must be returned, strictly, in this object format:

```javascript
"colname": {
   text: "Display Text",
   type: "bool|enum|multiple|text|numeric|date|datetime|custom",
   validationRegex: "regex expression for validation",
   excludedOperands: ["=", "!", "%%", "!%%", "_%", "!_%", "%_", "!%_", "_", "!_", ">", "<", ">=", "<="] operands to be excluded,
   options:
     //*bool,*enum,*multiple
       [
           {
               text: "Yes",
               value: "1"
           },
           {
               text: "No",
               value: "0"
           }
       ]
     //*numeric
       {
           max_value: Maximum value,
           min_value: Minimum value,
           def_value: Default Value
       }
     //*date
       {
           max_value: Maximum value,
           min_value: Minimum value,
           def_value: Default Value
       }
     //*datetime
       {
           max_value: Maximum value,
           min_value: Minimum value,
           def_value: Default Value
       }
     //*custom
       {
           custom_element: "html text based element with {/id} and {/class} replacement tag"
           options: [{text, value},...],
           max_value: Maximum value,
           min_value: Minimum value,
           custom_UI_action: function(){ this.do_something; },
           def_value: Default Value
       }
     //*text
       "Default Text Value"

  }
```

### Filter Control

The filter query is constructed using connectors and operands. Connectors connect the clauses and operands determine the clause.  
This is how a filter query will look like: _connector_**columnname**_operator_**uservalue**...  
These are the available connectors:

- `^` : _NEW_ clause (usually denotes start of a bracket). A filter query should always begin with a `^`.
- `|` : _OR_ clause. The OR clause typically goes inside a NEW clause.
- `&` : _AND_ clause. The AND clause typically goes inside a NEW clause.

Operands supported in this library are:

- `=` : Equals  
- `!` : Not Equal  
- `%%` : Contains
- `!%%` : Doesn't Contain
- `_%` : Begins with
- `!_%` : Doesn't Begin with
- `%_` : Ends with
- `!%_` : Doesn't End with
- `_` : Empty (does not include successive column value in query string)
- `!_` : Not Empty (does not include successive column value in query string)
- `>` : Greater than
- `<` : Less than
- `>=` : Greater than equal to
- `<=` : Less than equal to

***Example filter query string:*** `^vendor_name%%test&vendor_name!_^vendor_status=true|vendor_status=false`  
The filter query is attached to a hidden field (configured in `searchHidInput` inside FilterControl `config`) which is sent by GET or POST method of the form (also configured in `searchForm` inside FilterControl `config`) on submit! The string must be traversed in the backend and it is the developer's responsibility to take care of it. This library only works in the front end and does not take of the backend. You can take a look at how the string must be traversed in the samples folder (coming soon!).  
The filter breadcrumbs link contains subparts of the original query by breaking it at the `^` clause.  
_Note_, these characters are meta-characters! So, if the user input contains these meta-characters, the library attaches `` ` `` as an escape character to handle it. We chose `` ` `` instead of `\` as it was causing a bug in firefox. So use ``/`(.)/g`` regex pattern to retrieve the escape character after the split (look at samples).  

### Sort Control

***Example sort query string:*** `1vendor_name~1~1self_delivery~2vendor_status`  
The sort query constitutes of the _order type_ and the _column_ separated by `~` as delim. `1` means ***ASCending*** and `2` means ***DESCending***. The sequence represents the order of the sorts. In SQL this translates to `ORDER BY vendor_name ASC, self_delivery ASC, vendor_status DESC`.

## Initializing

### Default HTML structure

```html
<html>
  <head>
    <style>
      ul.breadcrumbs {
        padding: 10px 16px;
        list-style: none;
        background-color: #eee;
        border-radius: 4px;
      }
        ul.breadcrumbs li {
          display: inline;
          font-size: 13px;
        }
          ul.breadcrumbs li + li:before {
            padding-right: 4px;
            padding-left: 1px;
            color: black;
            font-size: 15px;
            content: ">";
          }
          ul.breadcrumbs li a {
            color: #0275d8;
            text-decoration: none;
            cursor: pointer;
            font-weight:bold;
          }
            ul.breadcrumbs li a:hover {
              color: #01447e;
              text-decoration: underline;
            }
            ul.breadcrumbs li a.active {
              color: #01447e;
            }

      .col-badge {
        display: inline-block;
        min-width: 7px;
        padding: 3px 7px;
        font-size: 11px;
        font-weight: bold;
        line-height: 1;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        background-color: #777777;
        border-radius: 11px;
      }
        .col-badge:empty {
          display: none;
        }
        .col-badge.col-badge-blue {
          background-color: #337ab7;
        }

      .sortable-link {
        cursor: pointer;
      }

      .repeatable-item {
        display: block !important;
        margin: 2px 0px 3px 0px !important;
        margin-top: 2px;
        margin-right: 0px;
        margin-bottom: 3px;
        margin-left: 0px;
      }
        .repeatable-item > span.connectorDisplay {
          color: #2e6da4;
          font-family: monospace;
        }
    </style>
  </head>
  <body>
    <div>
      <div style="display:flex;">
          <div style="min-width:40px; min-height:40px;"><button class="btn btn-info" data-toggle="collapse" data-target="#filterContainer"><span class="glyphicon glyphicon-filter"></span></button></div>
          <ul class="breadcrumbs"> <!-- Breadcrumbs Control element -->
          </ul>
      </div>
      <div id="filterContainer" class="collapse in">
          <form asp-action="Index" id="searchParams" class="form-inline" method="get">
              <div class="repeatable"> <!-- This element is mandatory! -->
                 <!-- Filter Control element -->
              </div>
              <button class="btn btn-success add">+</button>
              <div class="form-group">
                  <input type="hidden" id="sortOrder" name="sortOrder" value=""/>
                  <input type="hidden" id="filter" name="filter" value="" />
                  <input type="submit" id="filterSubmit" value="Apply" class="btn btn-primary" onclick="beforeSubmitFilters()" />
              </div>
          </form>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-hover sortable-table">
        <thead>
          <tr>
            <th>
              <a data-col="c1" class="sortable-link">Vendor Name <span class="glyphicon"></span><span class="col-badge"></span></a> <!-- Sort Control element -->
            </th>
            <th>
                Phone Number <!--- To disable sort for a particular column do not include .sortable-link -->
            </th>
            <th>
              <a data-col="c6" class="sortable-link">Region <span class="glyphicon"></span><span class="col-badge"></span></a>
            </th>
            <th>
              <a data-col="c9" class="sortable-link">Vendor Status <span class="glyphicon"></span><span class="col-badge"></span></a>
            </th>
            <th>
              <a data-col="c12" class="sortable-link">Created On <span class="glyphicon"></span><span class="col-badge"></span></a>
            </th>
            <!--- ... -->
          </tr>
        </thead>
        <tbody>
          <!--- ... -->
        <tbody>
      </table>
    </div>
    <script type="text/template" id="repeatable-template"> <!-- Filter Control element -->
      <div class="form-group repeatable-item" data-tid="{/id}" id="repeatable-item_{/id}">
        <span id="connectorDisplay_{/id}" class="connectorDisplay"></span><input type="hidden" id="connectorOp_{/id}" class="connectorOp" value="" />
        <select id="searchCol_{/id}" class="searchCol form-control"></select>
        :
        <select id="query-operand_{/id}" class="query-operand form-control"></select>
        <input type="text" id="searchInput_{/id}" class="searchInput form-control" />
        <button id="and_{/id}" data-tid="{/id}" class="btn btn-success add and">AND</button>
        <button id="or_{/id}" data-tid="{/id}" class="btn btn-success add or">OR</button>
        <button id="delete_{/id}" data-tid="{/id}" class="btn btn-danger delete">-</button>
      </div>
    </script>
    <script src="~/js/dynamic-filter-library.0initialize.js"></script>
    <script src="~/js/dynamic-filter-library.filter.js"></script>
    <script src="~/js/dynamic-filter-library.breadcrumbs.js"></script>
    <script src="~/js/dynamic-filter-library.sort.js"></script>
    <script type="text/javascript">
      //Filter Config
      var fc = new FilterControl();
      var example_col =
      {
        "c1": {
          text: "Vendor Name",
          type: "text",
          validationRegex: null,
          excludedOperands: [">", "<", ">=", "<="],
          sortable: true,
          options: null
        },
        "c2": {
          text: "Vendor Phone number",
          type: "text",
          validationRegex: null,
          excludedOperands: [">", "<", ">=", "<="],
          options: null
        },
        "c6": {
          text: "Vendor Region",
          type: "text",
          validationRegex: null,
          excludedOperands: [">", "<", ">=", "<="],
          sortable: true,
          options: null
        },
        "c9": {
          text: "Vendor Active",
          type: "bool",
          validationRegex: null,
          excludedOperands: ["%%", "!%%", "_%", "!_%", "%_", "!%_", "_", "!_", ">", "<", ">=", "<="],
          sortable: true,
          options:
          [
            {
              text: "Active",
              value: "true"
            },
            {
              text: "Inactive",
              value: "false"
            }
          ]
        },
        "c12": {
          text: "Created On",
          filterDisabled: true,
          sortable: true
        }
        fc.config = {
          columns: function (c = null) {
            if (isNullOrUndefined(c)) return example_col;
            else return example_col[c];
          },
          breadcrumbs: 'ul.breadcrumbs'
      };
      //Filter Breadcrumbs Config
      var bc = new FilterBreadCrumbsControl(fc);
      //Sort Config
      config = {
        sortColCount: 6, //number of columns where sort is enabled
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
      var sc = new SortControl(config);
      //script body
      initializeDynamicFilterLibrary(fc, sc, bc);
    </script>
  </body>
</html>
```

### Using the library

1. Add the following libraries:

  ```html
  <script src="~/js/dynamic-filter-library.0initialize.js"></script>
  <script src="~/js/dynamic-filter-library.filter.js"></script>
  <script src="~/js/dynamic-filter-library.breadcrumbs.js"></script>
  <script src="~/js/dynamic-filter-library.sort.js"></script>
  ```

2. Create a repeatable template where you enter the search parameters:

  ```html
  <script type="text/template" id="repeatable-template">
    <div class="form-group repeatable-item" data-tid="{/id}" id="repeatable-item_{/id}">
      <span id="connectorDisplay_{/id}" class="connectorDisplay"></span><input type="hidden" id="connectorOp_{/id}" class="connectorOp" value="" />
      <select id="searchCol_{/id}" class="searchCol form-control"></select>
      :
      <select id="query-operand_{/id}" class="query-operand form-control"></select>
      <input type="text" id="searchInput_{/id}" class="searchInput form-control" />
      <button id="and_{/id}" data-tid="{/id}" class="btn btn-success add and">AND</button>
      <button id="or_{/id}" data-tid="{/id}" class="btn btn-success add or">OR</button>
      <button id="delete_{/id}" data-tid="{/id}" class="btn btn-danger delete">-</button>
    </div>
  </script>
  ```

  ***Note:*** `{/id}` is used as a placeholder to update the DOM id for each element. There are 3 button connector classes available
   1. `.add` to add _NEW_ clause `^`
   2. `.add.and` to add  _OR_ clause `|`
   3. `.add.or` to add _AND_ clause `&`
   4. `.delete` to remove a clause
   _Make sure they are created properly like the example above._
  
  The classes and id's can be set to your choice but they must be mentioned in the `config` object for reference or use the default class names and id's provided in the default `config` object. This will be populated inside `div.repeatable` element. A `div.repeatable` element is mandatory inside `searchParams` form!

3. Creating `config` object
  This is the default `config` object:

```javascript
//Filter and breadcrumbs Config
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
  //Filter Breadcrumbs Config
  breadcrumbs: 'ul.breadcrumbs'
};
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
```

Create your own `config` object **OR** just add the required `columns` function which takes a `columnname` parameter and returns a JSON object containing the column details as mentioned above. ***Make sure the JQuery DOM selection configuration is correct!***

4. Create Filter, Sort and Breadcrumbs objects:

```javascript
//Filter Config
//Use this if you want to use default configurations for your custom config
  var fc = new FilterControl();
  fc.config = filter_config
//Else just use
  var fc = new FilterControl(filter_config);

//Filter Breadcrumbs Config
var bc = new FilterBreadCrumbsControl(fc);
//Sort Config
var sc = new SortControl(sort_config);
//Initialize the filter controls
initializeDynamicFilterLibrary(fc, sc, bc);

//Apply these functions before submitting searchParams form
function beforeSubmitFilters() {
  //do something
  fc.filterSubmit();
  sc.sortSubmit();
  //do something
}
```

***Note:*** `FilterBreadCrumbsControl` and `SortControl` are optional!
