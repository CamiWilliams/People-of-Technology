/**
 * @author Cami Williams
 */

var myDataRef;
var path = "https://humansofcs.firebaseio.com/";
var uploadFileCode = "<div id = 'upload_file'><input id='file-upload' type='file' accept='image/*' onchange='fileSelected = true;'>"
				   + "<div class='input-group'>" + "<textarea id='descr-input' type='text' placeholder='Insert description here' rows='4' cols='50' onchange='descriptionAdded = true;'></textarea>" 
				   + "<p><input id='first-input' type='text' placeholder='First Name' onchange='firstAdded = true;'> <input id='last-input' type='text' placeholder='Last Name' onchange='lastAdded = true;'></p>" 
				   + "<p><input id='email-input' type='email' placeholder='Email'></p></div>" + "<button class='btn btn-default btn-sm' type='button' onclick='send()'>Submit</button>" 
				   + "<button class='btn btn-default btn-sm' type='button' onclick='cancelUpload()'>Cancel</button>" 
				   + "<div id='error' style='visibility: hidden'>*Fill out all fields*</div></div>";
var uploadButtonCode = "<button class='btn btn-default btn-lg' type='button' onclick='getReady()'> Upload Your Own! </button>" + "<div id='thanks' style='visibility: hidden'>Thanks for submitting! You will receive email confirmation soon.</div>";

var fileSelected = false;
var descriptionAdded = false;
var firstAdded = false;
var lastAdded = false;

var uploadFileNameDisplay = document.getElementById("filename");
var uploadFilePath = "";

function loadContent() {
	var toFill = document.getElementById("upload");
	toFill.innerHTML = " ";
	toFill.innerHTML = uploadButtonCode;

	toFill = document.getElementById("content");
	
	myDataRef = new Firebase(path + "submitted/");
	myDataRef.once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			if(childSnapshot.val() != null) {		
				toFill.innerHTML += fill(childSnapshot.val().name, childSnapshot.val().description, childSnapshot.val().imageSource);	
			}
		});
	});
}

function fill(name, description, image) {
	return "<div class='row'> <div class='col-sm-6 col-md-4'> <div class='thumbnail'>"
 			+ "<img src='" + image + "'> <div class='caption'> <h3>" + name + "</h3>"
			+ "<p>" + description + "</p></div></div></div></div>";
}

function getReady() {
	var toFill = document.getElementById("upload");
	toFill.innerHTML = " ";
	toFill.innerHTML = uploadFileCode;
}

function cancelUpload() {
	var toFill = document.getElementById("upload");
	toFill.innerHTML = " ";
	toFill.innerHTML = uploadButtonCode;
	toFill.innerHTML += "Thanks for uploading! You will receive email confirmation on your submission."
}

function send() {
	var toShow = document.getElementById("error");

	if (fileSelected && descriptionAdded && firstAdded && lastAdded) {
		toShow.style.visibility = "hidden";

		var filePath = document.getElementById("file-upload");

		handleFileSelect(filePath);

		var toFill = document.getElementById("upload");
		toFill.innerHTML = uploadButtonCode;
		toShow = document.getElementById("thanks");
		toShow.style.visibility = "visible";
	} else {
		toShow.style.visibility = "visible";
	}
}

function handleFileSelect(evt) {
	var name = document.getElementById("first-input").value + " " + document.getElementById("last-input").value;
	var email = document.getElementById("email-input").value;
	var descr = document.getElementById("first-input").value;
	
	var f = evt.files[0];
	var reader = new FileReader();

	reader.onload = (function(theFile) {
		return function(e) {
			var filePayload = e.target.result;
	        var hash = CryptoJS.SHA256(Math.random() + CryptoJS.SHA256(filePayload));
			myDataRef = new Firebase(path + "to_review/");
			myDataRef.once('value', function(snapshot) {
				var dataRef = new Firebase(path + "to_review/");
				dataRef.child(hash.words[0]).set({name: name, email: email, description: descr, imageSource: e.target.result});
			});
		};
	})(f);
	reader.readAsDataURL(f);
}

function toReviewBoard() {
	var toFill = document.getElementById("manager-container");
	toFill.innerHTML = " ";
	
	myDataRef = new Firebase(path + "to_review/");
	myDataRef.once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			if(childSnapshot.val() != null) {		
				toFill.innerHTML += fillReviewManager(childSnapshot.val().name, childSnapshot.val().description, childSnapshot.val().imageSource, childSnapshot.name());	
			}
		});
	});
}

function fillReviewManager(name, description, image, uniqueIdentifier) {
	return "<div class='row'> <div class='col-sm-6 col-md-4'> <div class='thumbnail'>"
 			+ "<img src='" + image + "'> <div class='caption'> <h3>" + name + "</h3>"
			+ "<p id='" + uniqueIdentifier + "'>" + description + "</p></div>"
			+ "<button onclick='editManager(1," + uniqueIdentifier +")' class='btn btn-default btn-sm'>Edit</button>"
			+ "<button onclick='acceptReviewManager("+ uniqueIdentifier +")' class='btn btn-default btn-sm'>Accept</button>"
			+ "<button onclick='removeManager(1," + uniqueIdentifier +")' class='btn btn-default btn-sm'>Deny</button></div></div></div>";
}

function acceptReviewManager(id) {
	var agree=confirm("Are you sure you want to confirm the changes you made to this submission?");
	if (agree) {
	myDataRef = new Firebase(path + "to_review/" + id);
	myDataRef.once('value', function(snapshot){
		var dataRef = new Firebase(path + "submitted/");
		dataRef.once('value', function(snapshot2) {
					
		dataRef.child(myDataRef.name()).set({name: snapshot.val().name, email: snapshot.val().email, description: snapshot.val().description, imageSource: snapshot.val().imageSource});
		});
		myDataRef.remove();
	});
	alert("Refresh page to see changes.");
	}
}

function editManager(num, id) {
	var sor = "to_review";
	if(num == 0) { sor = "submitted"; }
	myDataRef = new Firebase(path + sor + "/" + id);
	myDataRef.once('value', function(snapshot) {
		var toFill = document.getElementById(id);
		toFill.innerHTML += "<div class='input-group-"+ snapshot.name() + "'>" + "<textarea id='edit-descr-input-"+ snapshot.name() +"' type='text' rows='4' cols='50'>" + snapshot.val().description + "</textarea>" 
			+ "<button onclick='confirmEditManager(" + num + "," + snapshot.name() +")' class='btn btn-default btn-sm'>Confirm</button>"
			+ "<button onclick='cancelEditManager(" + snapshot.name() + "," + snapshot.val().description + ")' class='btn btn-default btn-sm'>Cancel</button>";
	});
}

function confirmEditManager(num, id) {
	var sor = "to_review";
	if(num == 0) { sor = "submitted"; }
	var agree=confirm("Are you sure you want to confirm the changes you made to this submission?");
	if (agree) {
		myDataRef = new Firebase(path + sor + "/" + id);
		myDataRef.child("description").set(document.getElementById("edit-descr-input-"+ id).value);
		var toFill = document.getElementById(id);
		toFill.innerHTML = document.getElementById("edit-descr-input-"+ id).value;
	}
}


function submittedBoard() {
	var toFill = document.getElementById("manager-container");
	toFill.innerHTML = " ";
	
	myDataRef = new Firebase(path + "submitted/");
	myDataRef.once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			if(childSnapshot.val() != null) {		
				toFill.innerHTML += fillSubmitManager(childSnapshot.val().name, childSnapshot.val().description, childSnapshot.val().imageSource, childSnapshot.name());	
			}
		});
	});
}

function fillSubmitManager(name, description, image, uniqueIdentifier) {
	var sor = "submitted";
	return "<div class='row'> <div class='col-sm-6 col-md-4'> <div class='thumbnail'>"
 			+ "<img src='" + image + "'> <div class='caption'> <h3>" + name + "</h3>"
			+ "<p id='" + uniqueIdentifier + "'>" + description + "</p></div>"
			+ "<button onclick='editManager(0," + uniqueIdentifier +")' class='btn btn-default btn-sm'>Edit</button>"
			+ "<button onclick='removeManager(0," + uniqueIdentifier +")' class='btn btn-default btn-sm'>Remove</button></div></div></div>";
}

function cancelEditManager(id, des) {
	var toFill = document.getElementById(id);
	toFill.innerHTML = des;
}

function removeManager(num, id) {
	var sor = "to_review";
	if(num == 0) { sor = "submitted"; }
	var agree=confirm("Are you sure you want to remove this submission?");
	if (agree) {
		myDataRef = new Firebase(path + sor + "/" + id);
		myDataRef.remove();
		alert("Refresh page to see changes.");
		//submittedBoard();
	}
}
