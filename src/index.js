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
var ddlDB = document.getElementById("ddlDatabase");
var ddlEntities = document.getElementById('ddlEntities');
var ddlAttributesCheckBox = document.getElementById('ddlAttributesCheckBox');

var selectedAttributes = new Set();

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


function removeOptions(select){
    var length = select.options.length;
    for (i = length-1; i >= 0; i--) {
        select.options[i] = null;
    }
}

function PopulateDatabase() {
    removeOptions(ddlDB);
    removeOptions(ddlEntities);
    document.getElementById('rightColumnDiv').innerHTML = "";
    
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
    document.getElementById('rightColumnDiv').innerHTML = "";

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
    document.getElementById('rightColumnDiv').innerHTML = "";

    var global_schema = xmlDom.getElementsByTagName("global_schema");
    var container = document.getElementById('rightColumnDiv');

    for (var i = 0; i < global_schema.length; i++) {
        if(global_schema[i].getElementsByTagName("global_schema_id")[0].textContent == ddlDB.value){
            var entities = global_schema[i].getElementsByTagName("entity");

            for(var j = 0;j < entities.length;j++){
                if(entities[j].getElementsByTagName("eid")[0].textContent == ddlEntities.value){
                    var attribute = entities[j].getElementsByTagName("attribute");

                    for(var k = 0;k < attribute.length;k++){
                        var checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.name = attribute[k].getElementsByTagName("name")[0].textContent;
                        checkbox.value = attribute[k].getElementsByTagName("name")[0].textContent;
                    
                        var label = document.createElement('label')
                        label.htmlFor = attribute[k].getElementsByTagName("name")[0].textContent;
                        label.appendChild(document.createTextNode(attribute[k].getElementsByTagName("name")[0].textContent));
                    
                        var br = document.createElement('br');
                        container.appendChild(checkbox);
                        container.appendChild(label);
                        container.appendChild(br);
                    }
                }
            }
        }
    }

    let btn = document.createElement("button");
    btn.innerHTML = "Add";
    btn.style.marginTop = "30px";
    btn.onclick = function() {addAttributeToList()};
    container.appendChild(btn);
}

function addAttributeToList(){
    var childCB = document.getElementById('rightColumnDiv').getElementsByTagName('input');
    var curr

    for( i=0; i< childCB.length; i++ ){
        if(childCB[i].checked){
            var temp = ddlDB.value + '.' + ddlEntities.value + '.' + childCB[i].name;
            if(!selectedAttributes.has(temp)){
                selectedAttributes.add(temp);
                document.getElementById('attributesDisplayDiv').innerHTML += childCB[i].name + " ";
            }
        }
    }

    console.log(selectedAttributes);
}