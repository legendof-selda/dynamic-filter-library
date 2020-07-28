# DYNAMIC-FILTER-LIBRARY
A JavaScript/JQuery library which can power filter and sorting queries for your data easily while you focus on design!

![Preview](others/screen-capture.gif)

All you have to do is load it up, configure to match the elements to the library and its up and running.  

### Introduction
The library includes the following features:  
1. A _filter_ query generator which allows you to create complex clauses which you can use to dynamically create your SELECT statement.
2. A _sort_ query generator which allows you to select the columns you want to sort while specifying the order of the columns and direction.
3. Filter _breadcrumbs_ which gives more readability and allows you to traverse through your filter clauses.  

The library uses JQuery to find the configured elements and perform necessary actions. We can add custom methods which needs to be performed to further power it up!  

### Dynamic Columns
The columns and its properties are dynamic! You just need to pass the `columns` method, in `config`, to fetch the column (table header/collection) names and other details.  
The `columns()` function must be returned, strictly, in this object format:
```
"colname": {
   text: "Display Text",
   type: "bool|enum|text|numeric|date|datetime|custom",
   validationRegex: "regex expression for validation",
   excludedOperands: ["=", "!", "%%", "!%%", "_%", "!_%", "%_", "!%_", "_", "!_", ">", "<", ">=", "<="] operand to exclude,
   options:
     *bool,*enum,*multiple
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
     *numeric
       {
           max_value: Maximum value,
           min_value: Minimmum value,
           def_value: Default Value
       }
     *date
       {
           max_value: Maximum value,
           min_value: Minimmum value,
           def_value: Default Value
       }
     *datetime
       {
           max_value: Maximum value,
           min_value: Minimmum value,
           def_value: Default Value
       }
     *custom
       {
           custom_element: "html text based element with {/id} and {/class} replacement tag"
           options: [{text, value},...],    
           max_value: Maximum value,
           min_value: Minimmum value,
           custom_UI_action: function(){ this.do_something; },
           def_value: Default Value
       }
     *text
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

***Example fitler query string:*** `^vendor_name%%test&vendor_name!_^vendor_status=true|vendor_status=false`  
The filter query is attached to a hidden field (configured in `searchHidInput` inside FilterControl `config`) which is sent by GET or POST method of the form (also configured in `searchForm` inside FilterControl `config`) on submit! The string must be traversed in the backend and it is the developer's responsibility to take care of it. This library only works in the front end and does not take of the backend. You can take a look at how the string must be traversed in the samples folder (coming soon!).  
The filter breadcrumbs link contains subparts of the original query by breaking it at the `^` clause.  
_Note_, these characters are metacharacters! So, if the user input contains these metacharacters, the library attaches `` ` `` as an escape character to handle it. We chose `` ` `` instead of `\` as it was causing a bug in firefox. So use ``/`(.)/g`` regex pattern to retrieve the escape character after the split (look at samples).  

### Sort Control
***Example sort query string:*** `1vendor_name~1~1self_delivery~2vendor_status`  
The sort query constitutes of the _order type_ and the column seperated by `~` as delim. `1` means ***ASCending*** and `2` means ***DESCending***. The sequence represents the order of the sorts. In SQL this translates to `ORDER BY vendor_name ASC, self_delivery ASC, vendor_status DESC`.
