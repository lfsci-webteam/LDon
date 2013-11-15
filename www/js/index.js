var records = new Array();

var width = screen.width
var height = screen.height

var debugMode = true;

function Record(inTime, inPrice, inName) {
	this.purchaseTime = inTime;
	this.purchasePrice = inPrice;
	this.name = inName;
	this.fees = 0;
	this.saleTime = null;
	this.salePrice = null;
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
	db.transaction(function (tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS Records (id Integer PRIMARY KEY AUTOINCREMENT, purchaseTime datetime, purchasePrice int, name varchar(255), fees int, saleTime datetime, salePrice int)');
		UpdateTable(tx);
	}, errorCB, successCB);
}

// Transaction error callback
//
function errorCB(tx, err) {
	debug("Error processing SQL: " + err.code + "\t" + err.message);
}

// Transaction success callback
//
function successCB() {
	//debug("Success!");
}

function addRecord(purchasePrice, name) {
	window.openDatabase("test", "1.0", "Test DB", 1000000).transaction(function (tx) {
		debug("Adding Record [" + purchasePrice + ", " + name + "]");
		var query = 'INSERT INTO Records (purchaseTime, purchasePrice, name, fees, saleTime, salePrice) VALUES (?, ?, ?, 0, 0, 0)';
		tx.executeSql(query, [(new Date()).toString(), purchasePrice, name.toString()]);
		UpdateTable(tx);
	}, errorCB, successCB);
}

function editRecord(id, purchasePrice, name) {
	window.openDatabase("test", "1.0", "Test DB", 1000000).transaction(function (tx) {
		debug("Updating Record " + id + " [" + purchasePrice + ", " + name + "]");
		var query = 'UPDATE Records SET purchaseTime = ?, purchasePrice = ?, name = ? WHERE id = ?';
		tx.executeSql(query, [(new Date()).toString(), purchasePrice, name.toString(), id]);
		UpdateTable(tx);
	}, errorCB, successCB);
}

function UpdateTable(tx) {
	debug("Refreshing Table");
	$("#tblRecords").empty();
	tx.executeSql('SELECT * FROM Records', [], updateSuccess, errorCB);
}

function updateSuccess(tx, results) {
	var len = results.rows.length;
	debug("Table Updated. " + len + " rows found. Updating button events...");
	for (var i = 0; i < len; i++) {
		$("#tblRecords").append("<tr><td class=\"IDCell\">" + results.rows.item(i).id + "</td><td width=\"70%\">" + results.rows.item(i).name + "</td><td width=\"30%\">" +
								results.rows.item(i).purchasePrice + "</td><td><a class=\"btnEdit\">Edit</a></td><td><a class=\"btnDelete\">Delete</a></tr>")
	}

	$(".btnDelete").click(function () {
		var id = $(this).closest('tr').find(".IDCell").text();
		window.openDatabase("test", "1.0", "Test DB", 1000000).transaction(function (tx) {
			var query = 'DELETE FROM Records WHERE id = ?;';

			tx.executeSql(query, [id]);
			UpdateTable(tx);
		}, errorCB, successCB);
	});

	$(".btnEdit").click(function () {
		var id = $(this).closest('tr').find(".IDCell").text();
		if (id == $("#hidUpdateID").val()) {
			$("#btnAddRecord .ui-btn-text").text("Add New Record");
			$("#divDetails").slideUp();
		}
		else {
			window.openDatabase("test", "1.0", "Test DB", 1000000).transaction(function (tx) {
				var query = 'SELECT * FROM Records WHERE id = ?';
				tx.executeSql(query, [id], function (tx, results) {
					debug("Editing row " + id);
					item = results.rows.item(0);

					$("#inPrice").val(item['purchasePrice']);
					$("#inName").val(item['name']);
					$("#hidUpdateID").val(id);

					$("#btnAddRecord .ui-btn-text").text("Submit");
					$("#divDetails").slideDown();
				}, errorCB);
			}, errorCB, successCB);
		}
	});
}

$(document).ready(function () {
	$("#btnAddRecord").click(function () {
		switch ($("#btnAddRecord").text()) {
			case "Add New Record":
				$("#hidUpdateID").val("");
				$("#inPrice").val("");
				$("#inName").val("");

				$("#btnAddRecord .ui-btn-text").text("Submit");
				$("#divDetails").slideDown();
				break;
			case "Submit":
				if ($("#inName").val() != "")
					if ($("#hidUpdateID").val() != "")
						editRecord($("#hidUpdateID").val(), parseInt($("#inPrice").val()), $("#inName").val());
					else
						addRecord(parseInt($("#inPrice").val()), $("#inName").val());
				$("#btnAddRecord .ui-btn-text").text("Add New Record");
				$("#divDetails").slideUp();
				break;
		}
	});
});

function debug(text) {
	if (debugMode) {
		var curDate = new Date();
		console.log(curDate.getHours() + ":" + padstr(curDate.getMinutes(), 2, '0') + ":" + padstr(curDate.getSeconds(), 2, '0') + " : " + text);
	}
}

function padstr(instr, length, padchar) {
	str = instr.toString();
	while (str.length < length)
		str = padchar + str;
	
	return str;
}