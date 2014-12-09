/**
 * @author Cami Williams
 */

var myDataRef;
var path = "https://humansofcs.firebaseio.com/";
var uploadFileCode = "<div id = 'upload_file'><input id='file-upload' type='file' accept='image/*' onchange='fileSelected = true;'>" + "<div class='input-group'>" + "<textarea id='descr-input' type='text' placeholder='Insert description here' rows='4' cols='50' onchange='descriptionAdded = true;'></textarea>" + "<p><input id='first-input' type='text' placeholder='First Name' onchange='firstAdded = true;'> <input id='last-input' type='text' placeholder='Last Name' onchange='lastAdded = true;'></p>" + "<p><input id='email-input' type='email' placeholder='Email'></p></div>" + "<button class='btn btn-default btn-sm' type='button' onclick='send()'>Submit</button>" + "<button class='btn btn-default btn-sm' type='button' onclick='cancelUpload()'>Cancel</button>" + "<div id='error' style='visibility: hidden'>*Fill out all fields*</div></div>";
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
		var x = snapshot.numChildren();	
		for(var i = 1; i <= x; i++) {
			var dataRef = new Firebase(path + "submitted/" + i + "/");
			dataRef.once('value', function(snapshot) {
				if(snapshot.val() != null) {		
					toFill.innerHTML += fill(snapshot.val().name, snapshot.val().description, snapshot.val().imageSource);	
				}
			});
		}
	});
}

function fill(name, description, image) {
	return "<div class='row'> <div class='col-sm-6 col-md-4'> <div class='thumbnail'>"
 			+ "<img src=" + image + "> <div class='caption'> <h3>" + name + "</h3>"
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
			myDataRef = new Firebase(path + "to_review/");
			myDataRef.once('value', function(snapshot) {
				var x = snapshot.numChildren() + 1;	
	
				var dataRef = new Firebase(path + "to_review/");
				dataRef.child(x).set({name: name, email: email, description: descr, imageSource: e.target.result});
			});
		};
	})(f);
	reader.readAsDataURL(f);
}