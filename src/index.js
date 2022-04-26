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

let all_data = [];

var list_dsid_eid = [];
var table_cols_mapping = {};
var graph = {};

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
    ExtractInfo();
    ExtractGraph();
    PopulateDatabase();
}

function ExtractInfo(){
    for (var i = 0; i < global_schema.length; i++) {
        var dsid = global_schema[i].getElementsByTagName("global_schema_id")[0].textContent;
        var entities = global_schema[i].getElementsByTagName("entity");

        for(var j = 0;j < entities.length;j++){
            var eid = entities[j].getElementsByTagName("eid")[0].textContent;

            list_dsid_eid.push([dsid,eid]);
            table_cols_mapping[dsid + '_' + eid] = [];

            var attribute = entities[j].getElementsByTagName("attribute");
            for(var k = 0;k < attribute.length;k++){
                var attName = attribute[k].getElementsByTagName("name")[0].textContent;
                var attType = attribute[k].getElementsByTagName("type")[0].textContent;
                var temp = dsid + "_" + eid + "_" + attName;
                attributeType[temp] = attType;
                table_cols_mapping[dsid + '_' + eid].push(temp);
            }
        }
    }
}

function ExtractGraph(){
    for (var i = 0; i < global_schema.length; i++) {
        var entities = global_schema[i].getElementsByTagName("entity");
        for(var j = 0;j < entities.length;j++){
            var relations = entities[j].getElementsByTagName("relation");
            for(var k = 0;k < relations.length;k++){
                var u = relations[k].getElementsByTagName('ds_1')[0].textContent + "_" + relations[k].getElementsByTagName('ent_1')[0].textContent + '_' + relations[k].getElementsByTagName('att_1')[0].textContent;
                var v = relations[k].getElementsByTagName('ds_2')[0].textContent + "_" + relations[k].getElementsByTagName('ent_2')[0].textContent + '_' + relations[k].getElementsByTagName('att_2')[0].textContent;
                if(u in graph){
                    graph[u].push(v);
                }
                else{
                    graph[u] = [v];
                }
            }
        }
    }
    console.log(graph);
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

    PopulateEntities();
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

    PopulateAttributes();
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

    PopulatePredicate();
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
}

function PopulatePredicate(){
    removeOptions(ddlPredicate);
    let sel = ddlDB.value + "_" + ddlEntities.value;
    let selAtt = table_cols_mapping[sel];
    
    for(var i=0; i < selAtt.length; i++){
        var option = document.createElement("option");
        option.text = selAtt[i];
        option.value = selAtt[i]
        ddlPredicate.options.add(option);
    }
}


function AddPredicate(){
    var pred = ddlPredicate.value;
    var predValue, type;
    
    if(attributeType[pred] == "string"){
        predValue = document.getElementById("ddlPredicateValue").value;
        type = "string";
    }
    else if(attributeType[pred] == "integer" || attributeType[pred] == "decimal"){
        predValue = parseInt(document.getElementById("ddlPredicateValue").value);
        type = "number";
    }

    var select = document.getElementById("ddlPredicate-relational");
    var relOp = select.options[select.selectedIndex].value;

    select = document.getElementById("ddlPredicate-boolOperator");
    var boolOp = select.options[select.selectedIndex].value;

    if(pred in predicateConstraint){
        let constraint = predicateConstraint[pred];
        constraint[relOp].boolOp = boolOp;
        constraint[relOp].value = predValue;
        predicateConstraint[pred] = constraint;
    }
    else{
        let constraint = {type:type, lessThan: {boolOp:null, value:null}, greaterThan: {boolOp:null, value:null}, equalTo: {boolOp:null, value:null}};
        constraint[relOp].boolOp = boolOp;
        constraint[relOp].value = predValue;
        predicateConstraint[pred] = constraint;
    }
    selectedEntities.add((ddlDB.value + '-' + ddlEntities.value));
    console.log(predicateConstraint);
}

async function get_tables(dsID, eID){
    var lsText = await get_local_schema(dsID,eID);
    var ls = get_XML_Dom_object(lsText);

    let obj = {};
    if(ls.getElementsByTagName("manifest")[0].getElementsByTagName("type")[0].textContent == "CSV_data"){
        const data = await ProcessCSV(ls, eID);
        obj = {dsID : dsID, eID : eID, data : data};
    }
    else if(ls.getElementsByTagName("manifest")[0].getElementsByTagName("type")[0].textContent == "SQL_data"){
        const data = await ProcessSQL(ls, eID);
        obj = {dsID : dsID, eID : eID, data : data};
    }
    console.log(obj);
    return obj;
}

async function showTable(){
    document.getElementById('tableDisplayDiv').innerHTML = "";

    const arrayTable = [];
    console.log(selectedEntities);
    for(let ele of selectedEntities){
        const dsID = ele.split("-")[0];
        const eID = ele.split("-")[1];
        arrayTable.push(await get_tables(dsID, eID));
    }
    console.log(arrayTable);
    let res = await ProcessArrayTable(arrayTable);
    console.log(res);
    if(!res){
        window.alert("Join table not possible");
    }
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
    // console.log(data);
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
    let andRes = true;
    let orRes = false; 
    for(k in row){
        if(k in predicateConstraint){
            if(predicateConstraint[k].lessThan.boolOp != null){
                if(predicateConstraint[k].lessThan.boolOp == 'And'){
                    andRes = andRes & (row[k] < predicateConstraint[k].lessThan.value);
                }
                else if(predicateConstraint[k].lessThan.boolOp == 'Or'){
                    orRes = orRes | (row[k] < predicateConstraint[k].lessThan.value);
                }
            }
            if(predicateConstraint[k].greaterThan.boolOp != null){
                if(predicateConstraint[k].greaterThan.boolOp == 'And'){
                    andRes = andRes & (row[k] > predicateConstraint[k].greaterThan.value);
                }
                else if(predicateConstraint[k].greaterThan.boolOp == 'Or'){
                    orRes = orRes | (row[k] > predicateConstraint[k].greaterThan.value);
                }
            }
            if(predicateConstraint[k].equalTo.boolOp != null){
                if(predicateConstraint[k].equalTo.boolOp == 'And'){
                    andRes = andRes & (row[k] == predicateConstraint[k].equalTo.value);
                }
                else if(predicateConstraint[k].equalTo.boolOp == 'Or'){
                    orRes = orRes | (row[k] == predicateConstraint[k].equalTo.value);
                }
            }
        }
    }
    return andRes | orRes;
}


function dfs(node, graphObject)
{
    // console.log(graphObject.visited, node);
    graphObject.visited[node] = true;
    for(let i = 0; i < graphObject.graph[node].length; i++)
    {
        let x = graphObject.graph[node][i];
        if(!graphObject.visited[x])
        {
            dfs(x, graphObject);
        }
    }
}

function Check_Connectivity(graphObject, arrayTable)
{
    // Step 1 : Find the index in list_dsid_eid which corresponds to first element in arrayTable.
    // Step 2 : Call DFS function from that index to update the visited array in graphObject. 
    // Step 3 : check if all the dsid_eid in arrayTable are visited in the dfs call from previous step. 
    // console.log(arrayTable);
    let start_node = -1;
    for(let i = 0; i < list_dsid_eid.length; i++)
    {
        // console.log(list_dsid_eid[i]);
        // console.log([arrayTable[0].dsID, arrayTable[0].eID]);
        if(list_dsid_eid[i][0] == arrayTable[0].dsID && list_dsid_eid[i][1] == arrayTable[0].eID)
        {
            start_node = i;
            break;
        }
    }
    // console.log(start_node);    
    dfs(start_node, graphObject);
    // console.log(graphObject.visited); 
    let flag = true;
    for(let i = 0; i < arrayTable.length; i++)
    {
        let find_index = -1;
        for(let j = 0; j < list_dsid_eid.length; j++)
        {
            if(arrayTable[i].dsID == list_dsid_eid[j][0] && arrayTable[i].eID == list_dsid_eid[j][1])
            {
                find_index = j;
                break;
            }
        }
        // console.log(i, find_index);
        if(graphObject.visited[find_index] == false)
            return false;
        
    }
    return true;
}

function CreateGraphObject()
{
    let graph = [];
    for(let i = 0; i < list_dsid_eid.length ; i++)
    {
        let tmp = [];
        graph.push(tmp);
    }
    for(let i = 0; i < list_dsid_eid.length; i++)
    {
        for(let j = i + 1; j < list_dsid_eid.length; j++)
        {
            let tmp = GetCommonAtt(list_dsid_eid[i],list_dsid_eid[j]);
            // console.log(tmp);
            if(tmp[0].length > 0)
            {
                graph[i].push(j);
                graph[j].push(i);
            }
        }
    }
    // console.log(graph);
    graphObject = {"graph" : graph};  
    graphObject.visited = new Array(graphObject.graph.length).fill(false);
    // console.log(graphObject);
    return graphObject;  
}

function DecidePermutation(arrayTable, graphObject)
{
    // according to current implementation, it will give the order [0, 1, 2, 3, ...]
    let ar = new Array(arrayTable.length);
    for(let i = 0; i < arrayTable.length; i++)
    {
        let idx = -1;
        for(let j = 0; j < list_dsid_eid.length; j++)
        {
            if(list_dsid_eid[j][0] == arrayTable[i].dsID && list_dsid_eid[j][1] == arrayTable[i].eID)
            {
                idx = j;
                break;
            }
        }
        // console.assert(idx != -1, "Assertion failed");
        ar[i] = idx;
    }
    // console.log(ar);
    return ar;
}

async function JoinTable(tbl1, tbl2, commonAbb1, commonAbb2){
    var qry = 'SELECT * FROM ? a, ? b where (';

    for(let i=0;i<commonAbb1.length;i++){
        if(i != 0){
            qry += ' AND ';
        }
        qry += '(a.' + commonAbb1[i] + ' = b.' + commonAbb2[i] + ')';
    }
    qry += ')';

    // console.log(qry, tbl1, tbl2);
    var res = alasql(qry,[tbl1,tbl2]);
    // console.log(res);
    return res;
}


//Given tbl1 = [dsid, eid], tbl2 = [dsid, eid], find the pk-fk relationship in this 2 tables. 
function GetCommonAtt(tbl1, tbl2){
    //TODO : parse from an XML file. 
    //Currently it is hardcoded.

    
    
    var com1 = [];
    var com2 = [];
    let t1 = tbl1[0]+"_"+tbl1[1];
    let t2 = tbl2[0]+"_"+tbl2[1];
    for(const i of  table_cols_mapping[t1])
    {
        for(const j of table_cols_mapping[t2])
        { 
            if((i in graph) && (graph[i].includes(j)))
            {
                com1.push(i);
                com2.push(j);
            }
        }
    }
    return [com1, com2];
}

async function Load_Data()
{
    all_data = [];
    for(let i = 0; i < list_dsid_eid.length; i++)
    {

        let tmp = await get_tables(list_dsid_eid[i][0], list_dsid_eid[i][1]);
        all_data.push(tmp);
    }
    // console.log(all_data);
}


function dfs2(node, dest, pathObject, graphObject)
{
    pathObject.path.push(node);
    pathObject.visited[node] = true;
    if(node == dest)
    {
        return true;
    }
    // console.log(node, graphObject);
    for(let i = 0; i < graphObject.graph[node].length; i++)
    {
        let v = graphObject.graph[node][i];
        if(!pathObject.visited[v])
        {
            let flag = dfs2(v, dest, pathObject, graphObject);
            if(flag)
            {
                return true;
            }
        }
    }
    pathObject.path.pop(node);
    return false;
}
function find_path(u, v, graphObject)
{
    let pathObject = {};
    pathObject.path = [];
    pathObject.visited = new Array(list_dsid_eid.length).fill(false);
    dfs2(u, v, pathObject, graphObject);
    return pathObject.path;
}

async function performJoinAll(permutation, graphObject)
{
    let res = all_data[permutation[0]].data;
    for(let i = 1; i < permutation.length; i++)
    {
        let path = find_path(permutation[i-1], permutation[i], graphObject);
        // console.log(permutation[i-1], permutation[i], path);
        for(let j = 0; j + 1 < path.length; j++)
        {
            let common_attributes = GetCommonAtt(list_dsid_eid[path[j]], list_dsid_eid[path[j+1]]);
            res = await JoinTable(res, all_data[path[j+1]].data, common_attributes[0], common_attributes[1]);
        }
    }
    
    return res;
}


async function ProcessArrayTable(arrayTable){
    
    /*
    Functionality : 
    1) call CreateGraphObject function to create graph structure
    2) check if all the nodes are in a single connected component using Check_connectivity function.
    3) Decide permutation in which tables must be joined. 
    4) Load all data in the global variable. 
    5) Join all

    According to current implementation : The order of joins will happen in this order : 
    res = ArrayTable[0]
    res = res Path_join ArrayTable[1]
    res = res Path_join ArrayTable[2]
    and so on.
    */
    
    // console.log(arrayTable);
    let graphObject = CreateGraphObject(arrayTable); // step 1
    
    // console.log(graphObject);
    if(!(Check_Connectivity(graphObject, arrayTable))){ //  step 2
        // console.log("the current selection of tables is not possible");
        return false;
    }
    
    let permutation = DecidePermutation(arrayTable, graphObject); // step 3
    
    await Load_Data(); // step 4


    let res = await performJoinAll(permutation, graphObject); // step 5

    console.log(res.length);

    CreateTableFromJson(res);

    return true;
}