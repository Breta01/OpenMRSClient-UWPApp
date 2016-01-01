// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;

	var server;
	var username;
	var password;

	var mySplitView = window.mySplitView = {
	    splitView: null,
	    homeClicked: WinJS.UI.eventHandler(function (ev) {
	        UIController('home');
	    }),
	    settingsClicked: WinJS.UI.eventHandler(function (ev) {
	        UIController('settings');
	    }),
	    logoutClicked: WinJS.UI.eventHandler(function (ev) {
	        UIController('login');
	    }),
	    patientClicked: WinJS.UI.eventHandler(function (ev) {
	        console.log('patient');
	        UIController('findPatient');
	        getPatientsList();
	    }),
	};

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.launch) {
			if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
				// TODO: This application has been newly launched. Initialize your application here.
			} else {
				// TODO: This application was suspended and then terminated.
				// To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
			}
			args.setPromise(WinJS.UI.processAll());
			WinJS.UI.processAll().done(function () {
			    UIController('login');
			    document.getElementById('loginButton').addEventListener('click', loginClickHandler, false);
			    document.getElementById('checkUrlButton').addEventListener('click', checkUrlClickHandler, false);
			});
		}
	};

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
	};

	function loginClickHandler() {
	    document.getElementById('server').style.borderColor = 'rgba(0, 0, 0, 0.4)';
	    document.getElementById('username').style.borderColor = 'rgba(0, 0, 0, 0.4)';
	    document.getElementById('password').style.borderColor = 'rgba(0, 0, 0, 0.4)';
	    server = document.getElementById('server').value;
	    username = document.getElementById('username').value;
	    password = document.getElementById('password').value;

	    console.log(username + ":" + password);
	    if (isNotEmpty(server) && isNotEmpty(username) && isNotEmpty(password)) {
	        var getUrl = server + "/ws/rest/v1/session";
	        $.ajax({
	            beforeSend: function(xhr) {
	                xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
	            },
	            method: "GET",
	            async: true,
	            url: getUrl,            
	            cache: false,
	            success: function (data) {
	                console.log("success")
	                console.log(data);

	                var res = data.authenticated;
	                if (res) {
	                    console.log("Login!!!")
	                    UIController('home');
	                }
	                else {
	                    console.log("bad login")
	                    document.getElementById('password').style.borderColor = '#c0392b';
	                    document.getElementById('username').style.borderColor = '#c0392b';
	                    var contentDialog = document.querySelector(".win-contentdialog").winControl;
	                    document.querySelector('.win-contentdialog-content').innerHTML = '<br />Something goes wrong check username and password.<br />';
	                    contentDialog.show();
	                }
	            },
	            error: function () {
	                document.getElementById('server').style.borderColor = '#c0392b';
	                var contentDialog = document.querySelector(".win-contentdialog").winControl;
	                document.querySelector('.win-contentdialog-content').innerHTML = '<br />Wrong server url or no internet connection.<br />';
	                contentDialog.show();
	            }
	        });	         	        	        
	    }
	    else {
	        if (!isNotEmpty(server))
	            document.getElementById('server').style.borderColor = '#c0392b';
	        if (!isNotEmpty(username))
	            document.getElementById('username').style.borderColor = '#c0392b';
	        if (!isNotEmpty(password))
	            document.getElementById('password').style.borderColor = '#c0392b';
	    }
	}

	function checkUrlClickHandler() {
	    document.getElementById('server').style.borderColor = 'rgba(0, 0, 0, 0.4)';
	    var server = document.getElementById('server').value;
	    var getUrl = server + "/ws/rest/v1/session";
	    if (!isNotEmpty(server))
	        document.getElementById('server').style.borderColor = '#c0392b';
	    else {
	        $.ajax({
	            url: getUrl,
	            success: function (data) {
	                console.log();
	                document.getElementById('server').style.borderColor = '#40d47e';
	            },
	            error: function () {
	                document.getElementById('server').style.borderColor = '#c0392b';
	                var contentDialog = document.querySelector(".win-contentdialog").winControl;
	                document.querySelector('.win-contentdialog-content').innerHTML = '<br />Wrong server url or no internet connection.<br />';
	                contentDialog.show();
	            }
	        });
	    }
	}

	function UIController(state) {
	    switch (state) {

	        case 'home':
	            $("#findPatient").hide();
	            $('.win-splitview-panewrapper').show();
	            $('#login').hide();
	            $("#homeContext").show();
	            var splitView = document.querySelector(".splitView").winControl;
	            new WinJS.UI._WinKeyboard(splitView.paneElement); // Temporary workaround: Draw keyboard focus visuals on NavBarCommands
	            WinJS.UI.Animation.slideLeftIn(document.getElementById('homeContext'));
	            break;

	        case 'login':
	            $('.win-splitview-panewrapper').hide();
	            $('.win-splitview-paneplaceholder').hide();
	            $('#homeContext').hide();
	            $('#findPatient').hide();
	            $('#login').show();	            
	            WinJS.UI.XYFocus.moveFocus("right");
	            WinJS.UI.Animation.enterPage(document.getElementById('mBody'));
	            break;

	        case 'findPatient':
	            $('#login').hide();
	            $("#homeContext").hide();
	            $('.win-splitview-panewrapper').show();
	            $("#findPatient").show();
	            WinJS.UI.Animation.slideLeftIn(document.getElementById('findPatient'));
	            break;
	    }
	}

    // Define a data set as an array of objects.
	var patients = [
        {
            bookTitle: "PA",
            author: "X",
            synopsis: "10"
        },
        {
            bookTitle: "History of the Peloponnesian War",
            author: "Thucydides",
            synopsis: "The mighty cities Sparta and Athens war for supremacy over the Hellenes."
        },
        {
            bookTitle: "Antigone",
            author: "Sophocles",
            synopsis: "A young woman defies the king of the city by giving her father a proper burial."
        }
	];

	function getPatientsList() {
	    var getUrl = server + "/ws/rest/v1/patient?lastviewed=";
	    $.ajax({
	        beforeSend: function (xhr) {
	            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
	        },
	        method: "GET",
	        async: true,
	        url: getUrl,
	        cache: false,
	        success: function (data) {
	            console.log("PatienteData")
	            console.log(data);
	        }
	    });
	}

    // Convert the array into a List object.
	var patientsList = new WinJS.Binding.List(patients);

    // Expose the list globally in the 'Books' namespace.
	WinJS.Namespace.define("Patients",
        { data: patientsList });

	function isNotEmpty(str) {
	    return !(!str || 0 === str.length);
	}

	app.start();
})();