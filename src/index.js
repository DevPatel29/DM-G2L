fetch('http://localhost:3000/xmldata-api')
    .then(response => {return response.json()})
    .then(data => {
        var temp = document.getElementById("xmlDoc");
        temp.innerHTML += data.text;
        setup();
    })
    .catch(err => console.log(err));

var xml_data;
var xmlDom;

function setup(){
    xml_data = document.getElementById("xmlDoc").textContent;

    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDom = parser.parseFromString(xml_data, "text/xml");
    }
    else{
        xmlDom = new ActiveXObject("Microsoft.XMLDOM");
        xmlDom.async = false;
        xmlDom.loadXML(xml_data);
    }
}

var ddlDB = document.getElementById("ddlDatabase");
var ddlEntities = document.getElementById('ddlEntities');
var ddlAttributes = document.getElementById('ddlAttributes');

function removeOptions(select){
    var length = select.options.length;
    for (i = length-1; i >= 0; i--) {
        select.options[i] = null;
    }
}

function PopulateDatabase() {
    removeOptions(ddlDB);
    removeOptions(ddlEntities);
    removeOptions(ddlAttributes);
    var global_schema = xmlDom.getElementsByTagName("global_schema");

    for (var i = 0; i < global_schema.length; i++) {
        var option = document.createElement("option");

        option.text = global_schema[i].getElementsByTagName("global_schema_name")[0].textContent;

        option.value = global_schema[i].getElementsByTagName("global_schema_id")[0].textContent;

        ddlDB.options.add(option);
    }
}

function PopulateEntities(){
    removeOptions(ddlEntities);
    removeOptions(ddlAttributes);
    var global_schema = xmlDom.getElementsByTagName("global_schema");

    for (var i = 0; i < global_schema.length; i++) {
        if(global_schema[i].getElementsByTagName("global_schema_id")[0].textContent == ddlDB.value){
            var entities = global_schema[i].getElementsByTagName("entity");

            for(var j=0; j < entities.length; j++){
                var option = document.createElement("option");
                option.text = entities[j].getElementsByTagName("ename")[0].textContent;
                option.value = entities[j].getElementsByTagName("eid")[0].textContent;
                ddlEntities.options.add(option);
            }
        }
    }
}

function PopulateAttributes(){
    removeOptions(ddlAttributes);
    var global_schema = xmlDom.getElementsByTagName("global_schema");

    for (var i = 0; i < global_schema.length; i++) {
        if(global_schema[i].getElementsByTagName("global_schema_id")[0].textContent == ddlDB.value){
            var entities = global_schema[i].getElementsByTagName("entity");

            for(var j = 0;j < entities.length;j++){
                if(entities[j].getElementsByTagName("eid")[0].textContent == ddlEntities.value){
                    var attribute = entities[j].getElementsByTagName("attribute");

                    for(var k = 0;k < attribute.length;k++){
                        var option = document.createElement("option");
                        option.text = attribute[k].getElementsByTagName("name")[0].textContent;
                        option.value = attribute[k].getElementsByTagName("name")[0].textContent;
                        ddlAttributes.options.add(option);
                    }
                }
            }
        }
    }
}