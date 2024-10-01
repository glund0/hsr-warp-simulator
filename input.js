var items_arr = [];

function get_input_data() {
    let input_data = {}
    try {
        input_data["tickets"] = get_num_val("input_tickets", "Number of tickets", true);
        input_data["charGuarantee"] = get_checkbox_val("char_guarantee");
        input_data["charPity"] = get_num_val("input_char_pity", "Character pity");
        input_data["lcGuarantee"] = get_checkbox_val("lc_guarantee");
        input_data["lcPity"] = get_num_val("input_lc_pity", "Light Cone pity");
        input_data["numSims"] = 100000;

        if (items_arr.length < 1) {
            throw new Error("Please add at least one Character or Light Cone");
        }

        let pullTypes = []
        for(var i = 0; i < items_arr.length; i++) {
            pullTypes.push(items_arr[i]["type"]);
        }
        input_data["pullTypes"] = pullTypes;
    }
    catch (error) {
        alert(error.message);
        return null;
    }

    return input_data;
}

function get_num_val(inputId, prettyFieldName="", errorOnEmpty=false) {
    inputNode = document.getElementById(inputId);
    let inputVal = inputNode.value;
    console.log(inputId + ": " + inputVal);
    if (inputVal === undefined || inputVal === null || inputVal === "") {
        if (errorOnEmpty) {
            throw new Error(prettyFieldName + " is a required field");
        }
        else {
            return 0;
        }
    }
    else {
        let numVal = parseInt(inputVal, 10);
        if (errorOnEmpty) {
            if (numVal < 1) {
                throw new Error(prettyFieldName + " cannot be less tha 1");
            }
            else {
                return numVal;
            }
        }
        else {
            if (numVal < 0) {
                throw new Error(prettyFieldName + " cannot be negative");
            }
            else {
                return numVal;
            }
        }
    }
}

function get_checkbox_val(checkboxId) {
    checkboxNode = document.getElementById(checkboxId);
    return checkboxNode.checked;
}

function add_char() {
    var types_div = document.getElementById("input_types");
    item_count = items_arr.length;
    char_item = create_new_item(item_count, "C");
    types_div.appendChild(char_item);
}

function add_lc() {
    var types_div = document.getElementById("input_types");
    item_count = items_arr.length;
    lc_item = create_new_item(item_count, "L");
    types_div.appendChild(lc_item);
}

function create_new_item(item_num, type_str) {
    newItemDiv = document.createElement("div");
    newItemDiv.className = "added-item character-item";

    let imgSrc = "character_icon.png";
    let altText = "Character";
    if (type_str === "L") {
        imgSrc = "lightcone_icon.png";
        altText = "Light Cone";
    }
    newItemImg = document.createElement("img");
    newItemImg.src = imgSrc;
    newItemImg.alt = altText;
    newItemImg.className = "item-icon";
    updateRemoveButton(newItemImg, item_num);

    newItemDiv.appendChild(newItemImg);

    items_arr.push({"type":type_str, "node": newItemDiv, "remove":newItemImg})
    return newItemDiv;
}

function updateRemoveButton(removeButton, item_num) {
    removeButton.onclick = () => { let removeIndex = item_num; remove_node(removeIndex); };
}

function remove_node(node_index) {
    console.log("Remove index: " + node_index);
    node_data = items_arr[node_index];
    items_arr.splice(node_index, 1);
    var types_div = document.getElementById("input_types");
    types_div.removeChild(node_data["node"]);
    for(i = node_index; i < items_arr.length; i++) {
        node_data = items_arr[i];
        updateRemoveButton(node_data["remove"], i);
    }
}

function reset_input() {
    while(items_arr.length > 0) {
        remove_node(0, false);
    }
    clear_input("input_tickets");
    clear_input("input_char_pity");
    clear_input("input_lc_pity");
    clear_checkbox("char_guarantee");
    clear_checkbox("lc_guarantee");

    headerDiv = document.getElementById("results_header");
    headerDiv.style["display"] = "none";

    outputDiv = document.getElementById("results");
    while(outputDiv.firstChild) {
        outputDiv.removeChild(outputDiv.lastChild);
    }
}

function clear_input(input_id)  {
    input_node = document.getElementById(input_id);
    input_node.value = "";
}

function clear_checkbox(checkbox_id) {
    checkbox_node = document.getElementById(checkbox_id);
    checkbox_node.checked = false;
}