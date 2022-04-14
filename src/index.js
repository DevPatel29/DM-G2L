fetch('http://localhost:3000/xmldata-api')
    .then(response => {return response.json()})
    .then(data => {
        var temp = document.getElementById("gs_xmlDoc");
        temp.innerHTML += data.text;
        setup();
    })
    .catch(err => console.log(err));


var ddlDB = document.getElementById("ddlDatabase");
var ddlEntities = document.getElementById('ddlEntities');
var ddlAttributesCheckBox = document.getElementById('ddlAttributesCheckBox');
var ddlPredicate = document.getElementById('ddlPredicate');
var global_schema;

var selectedAttributes = new Set();
var selectedEntities = new Set();

var graph = {
    'dsid2_eid2_route_no' : ['dsid2_eid3_route_no'],
    'dsid2_eid3_route_no' : ['dsid2_eid2_route_no']
};

var attributeType = {};
var predicateConstraint = {};


function get_XML_Dom_object(xml_data){
    var xmlDom;
    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDom = parser.parseFromString(xml_data, "text/xml");
    }
    else{
        xmlDom = new ActiveXObject("Microsoft.XMLDOM");
        xmlDom.async = false;
        xmlDom.loadXML(xml_data);
    }

    return xmlDom;
}

function setup(){
    var xml_data = document.getElementById("gs_xmlDoc").textContent;
    global_schema = get_XML_Dom_object(xml_data).getElementsByTagName("global_schema");
    ExtractAttributeType();
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
    btn.onclick = function() {addAttributesToList()};
    container.appendChild(btn);
}

function addAttributesToList(){
    var childCB = document.getElementById('rightColumnDiv').getElementsByTagName('input');

    for( i=0; i< childCB.length; i++ ){
        if(childCB[i].checked){
            var temp = ddlDB.value + '_' + ddlEntities.value + '_' + childCB[i].name;
            selectedEntities.add((ddlDB.value + '-' + ddlEntities.value));
            if(!selectedAttributes.has(temp)){
                selectedAttributes.add(temp);
                document.getElementById('attributesDisplayDiv').innerHTML += childCB[i].name + " ";
            }
        }
    }
    // Temp();
}

function PopulatePredicate(){
    removeOptions(ddlPredicate);
    for (var it = selectedAttributes.values(), val= null; val=it.next().value; ) {
        var option = document.createElement("option");
        option.text = val;
        option.value = val;
        ddlPredicate.options.add(option);
    }
}

function PredicateSelected(){
    console.log(ddlPredicate.value, attributeType[ddlPredicate.value]);

    if(attributeType[ddlPredicate.value] == "string"){
        document.getElementById('predicateLogicDisplayDiv').innerHTML = "";

        $('#predicateLogicDisplayDiv').append(`<input id="predicateValue" size="50"></input>
                                               <br /> <br />
                                               <input type="button" value="Add Predicate" onclick="AddPredicate()" />`);

    }
    else if(attributeType[ddlPredicate.value] == "integer" || attributeType[ddlPredicate.value] == "decimal"){
        document.getElementById('predicateLogicDisplayDiv').innerHTML = "";

        $('#predicateLogicDisplayDiv').append(` <input id="predicateValueFrom" size="15"></input> 
                                                <p>To</p>
                                                <input id="predicateValueTo" size="15"></input> <br /> <br />
                                                <input type="button" value="Add Predicate" onclick="AddPredicate()" />`);
    }
}

function ExtractAttributeType(){
    for (var i = 0; i < global_schema.length; i++) {
        var dsid = global_schema[i].getElementsByTagName("global_schema_id")[0].textContent;
        var entities = global_schema[i].getElementsByTagName("entity");

        for(var j = 0;j < entities.length;j++){
            var eid = entities[j].getElementsByTagName("eid")[0].textContent;
            var attribute = entities[j].getElementsByTagName("attribute");
            for(var k = 0;k < attribute.length;k++){
                var attName = attribute[k].getElementsByTagName("name")[0].textContent;
                var attType = attribute[k].getElementsByTagName("type")[0].textContent;
                var temp = dsid + "_" + eid + "_" + attName;
                attributeType[temp] = attType;
            }
        }
    }
}

function AddPredicate(){
    var selectAtt = ddlPredicate.value;
    if(attributeType[ddlPredicate.value] == "string"){
        var pred = document.getElementById("predicateValue");
        if(pred.value != ""){
            var values = pred.value.split(",");
            predicateConstraint[selectAtt] = {type: "string", values : values};
        }
    }
    else if(attributeType[ddlPredicate.value] == "integer" || attributeType[ddlPredicate.value] == "decimal"){
        var predTo = document.getElementById("predicateValueTo");
        var predFrom = document.getElementById("predicateValueFrom");
        console.log(predTo,predFrom);
        if(predTo.value != "" && predFrom.value != ""){
            predicateConstraint[selectAtt] = {type: "number", from : parseFloat(predFrom.value), to: parseFloat(predTo.value)};
        }
    }
    console.log(predicateConstraint);
}

async function showTable(){
    document.getElementById('tableDisplayDiv').innerHTML = "";

    const arrayTable = [];
    console.log(selectedEntities);
    for(let ele of selectedEntities){
        const dsID = ele.split("-")[0];
        const eID = ele.split("-")[1];

        var lsText = await get_local_schema(dsID,eID);
        var ls = get_XML_Dom_object(lsText);

        if(ls.getElementsByTagName("manifest")[0].getElementsByTagName("type")[0].textContent == "CSV_data"){
            const data = await ProcessCSV(ls, eID);
            arrayTable.push(data);
        }
        else if(ls.getElementsByTagName("manifest")[0].getElementsByTagName("type")[0].textContent == "SQL_data"){
            const data = await ProcessSQL(ls, eID);
            arrayTable.push(data);
        }
    }

    // console.log(arrayTable);
    ProcessArrayTable(arrayTable);
}

// return array of lsText;
async function get_local_schema(dsID, eID){
    var ls_path;
    for (var i = 0; i < global_schema.length; i++) {
        if(global_schema[i].getElementsByTagName("global_schema_id")[0].textContent == dsID){
            var entities = global_schema[i].getElementsByTagName("entity");

            for(var j = 0;j < entities.length;j++){
                if(entities[j].getElementsByTagName("eid")[0].textContent == eID){
                    ls_path = entities[j].getElementsByTagName("ls_path")[0].textContent;    
                }
            }
        }
    }

    var data = await fetch(ls_path)
                        .then(response => {return response.json()});
    var lsText = data.text;

    return lsText;
}

//return the data but first change coloumn name to db.entitiy.column name
async function ProcessCSV(ls, eID){
    var path = ls.getElementsByTagName("manifest")[0].getElementsByTagName("description")[0].getElementsByTagName("static")[0].getElementsByTagName("source_api")[0].textContent;
    var entity = ls.getElementsByTagName("metadata")[0].getElementsByTagName("entity");
    for(var i=0;i<entity.length;i++){
        if(entity[i].getElementsByTagName("eid")[0].textContent == eID){
            path += entity[i].getElementsByTagName("data_source")[0].textContent;
        }
    }

    const options = {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({path})
    };

    let data = await fetch('/csvdata-api',options)
                       .then(response => {return response.json()})

    // CreateTableFromJson(data);

    let pref = ls.getElementsByTagName("manifest")[0].getElementsByTagName("data_source_id")[0].textContent + '_' + eID + '_';
    data = data.map((elm) => {
        var res = {};
        for(k in elm){
            var temp = pref + k;
            res[temp] = elm[k];
        }
        return res;
    });

    return data;
}

async function  ProcessSQL(ls, eID){
    var id = ls.getElementsByTagName("manifest")[0].getElementsByTagName("description")[0].getElementsByTagName("static")[0].getElementsByTagName("id")[0].textContent;
    var password = ls.getElementsByTagName("manifest")[0].getElementsByTagName("description")[0].getElementsByTagName("static")[0].getElementsByTagName("password")[0].textContent;
    var dbName = ls.getElementsByTagName("manifest")[0].getElementsByTagName("description")[0].getElementsByTagName("static")[0].getElementsByTagName("source_api")[0].textContent;
    var tableName;
    var entites = ls.getElementsByTagName("metadata")[0].getElementsByTagName("entity");

    for(var i=0;i<entites.length;i++){
        if(entites[i].getElementsByTagName("eid")[0].textContent == eID){
            tableName = entites[i].getElementsByTagName("ename")[0].textContent;
            break;
        }
    }
    
    const login = {"id":id, "password":password, "dbName":dbName, "tableName":tableName};

    const options = {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(login)
    };

    let data = await fetch('/sqldata-api',options)
                       .then(response => {return response.json()});


    let pref = ls.getElementsByTagName("manifest")[0].getElementsByTagName("data_source_id")[0].textContent + '_' + eID + '_';
    data = data.map((elm) => {
        var res = {};
        for(k in elm){
            var temp = pref + k;
            res[temp] = elm[k];
        }
        return res;
    });

    return data;
}

function CreateTableFromJson(data){
    var tableHeader = [];
    for(var k in data[0]){
        tableHeader.push(k);
    }

    var table = document.createElement('table');
    table.id = "displayTable";
    var tableBody = document.createElement('tbody');

    var anyBoxesChecked = new Array(tableHeader.length).fill(false);

    {
        var row = document.createElement('tr');

        for(var i=0;i<tableHeader.length;i++){
            var temp = tableHeader[i];
            if(selectedAttributes.has(temp)){
                anyBoxesChecked[i] = true;
            }

            if(anyBoxesChecked[i]){
                var cell = document.createElement('th');
                cell.appendChild(document.createTextNode(tableHeader[i]));
                row.appendChild(cell);
            }
        }

        tableBody.appendChild(row);
    }

    data.forEach(function(rowData) {
        if(validRow(rowData)){
            var row = document.createElement('tr');
            var i = 0;
            for(var k in rowData){
                if(anyBoxesChecked[i]){
                    var cell = document.createElement('td');
                    cell.appendChild(document.createTextNode(rowData[k]));
                    row.appendChild(cell);
                }
                i+=1;
            }

            tableBody.appendChild(row);
        }
    });

    table.appendChild(tableBody);
    document.getElementById('tableDisplayDiv').appendChild(table);
}

function validRow(row){
    for(k in row){
        if( (k in predicateConstraint) && predicateConstraint[k].type == "string"){
            if(! predicateConstraint[k].values.includes(row[k])){
                return false;
            }
        }
        else if( (k in predicateConstraint) && predicateConstraint[k].type == "number"){
            if(! (predicateConstraint[k].from <= row[k] && row[k] <= predicateConstraint[k].to)){
                return false;
            }
        }
    }
    return true;
}

// change GetCommonAtt function to dfs function to check if their is any direct or indirect relation between the tables
function ProcessArrayTable(arrayTable){
    var res = arrayTable[0];

    for(let i=1;i<arrayTable.length;i++){
        var commonAtt = GetCommonAtt(res, arrayTable[i]);
        res = JoinTable(res, arrayTable[i], commonAtt[0], commonAtt[1]);
    }
    
    // console.log(res);
    CreateTableFromJson(res);
}

function JoinTable(tbl1, tbl2, commonAbb1, commonAbb2){
    var qry = 'SELECT * FROM ? a, ? b where (';

    for(let i=0;i<commonAbb1.length;i++){
        if(i != 0){
            qry += ' AND ';
        }
        qry += '(a.' + commonAbb1[i] + ' = b.' + commonAbb2[i] + ')';
    }
    qry += ')';

    console.log(qry);
    var res = alasql(qry,[tbl1,tbl2]);
    console.log(res);
    return res;
}

async function Temp(){
    document.getElementById('tableDisplayDiv').innerHTML = "";
    var lsText = await get_local_schema("dsid2","eid1");
    var ls = get_XML_Dom_object(lsText);

    var tb1 = await ProcessCSV(ls, "eid2");
    var tb2 = await ProcessCSV(ls, "eid3");

    var commonAtt = GetCommonAtt(tb1,tb2);
    JoinTable(tb1, tb2, commonAtt[0], commonAtt[1]);

    // var res = alasql('SELECT * FROM ? a, ? b where a.route_no = b.rt_no',[tb1,tb2]);
    
    // JoinTable(tb1, tb2, ['route_no'], ['route_no']);
}

function GetCommonAtt(tbl1, tbl2){
    console.log(tbl1);
    var com1 = [];
    var com2 = [];

    for(k in tbl1[0]){
        for(l in tbl2[0]){
            if(k in graph){
                if(graph[k].includes(l)){
                    com1.push(k);
                    com2.push(l);
                }
            }
        }
    }

    return [com1,com2];
}