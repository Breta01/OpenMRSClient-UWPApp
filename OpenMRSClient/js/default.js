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
			    document.getElementById('searchButton').addEventListener('click', searchClickHandler, false);
			    startTime();
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
	                var res = data.authenticated;
	                if (res) {
	                    UIController('home');
	                }
	                else {
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
	            $("#settings").hide();
	            $("#findPatient").hide();
	            $("#patientDetails").hide();
	            $('.win-splitview-panewrapper').show();
	            $('#login').hide();
	            $("#homeContext").show();
	            var splitView = document.querySelector(".splitView").winControl;
	            new WinJS.UI._WinKeyboard(splitView.paneElement); // Temporary workaround: Draw keyboard focus visuals on NavBarCommands
	            WinJS.UI.Animation.slideLeftIn(document.getElementById('homeContext'));
	            break;

	        case 'login':
	            $("#settings").hide();
	            $('.win-splitview-panewrapper').hide();
	            $('.win-splitview-paneplaceholder').hide();
	            $('#homeContext').hide();
	            $("#patientDetails").hide();
	            $('#findPatient').hide();
	            document.getElementById('username').value = '';
	            document.getElementById('password').value = '';
	            $('#login').show();	            
	            WinJS.UI.XYFocus.moveFocus("right");
	            WinJS.UI.Animation.enterPage(document.getElementById('mBody'));
	            break;

	        case 'findPatient':
	            $("#settings").hide();
	            $('#login').hide();
	            $("#homeContext").hide();
	            $("#patientDetails").hide();
	            document.getElementById('searchLable').value = '';
	            $('.win-splitview-panewrapper').show();
	            $("#findPatient").show();
	            WinJS.UI.Animation.slideLeftIn(document.getElementById('findPatient'));
	            break;

	        case 'patientDetails':
	            $("#settings").hide();
	            $('#login').hide();
	            $("#homeContext").hide();
	            $("#findPatient").hide();
	            $('.win-splitview-panewrapper').show();
	            $("#patientDetails").show();
	            WinJS.UI.Animation.slideLeftIn(document.getElementById('patientDetails'));
	            break;

	        case 'settings':
	            $('#login').hide();
	            $("#homeContext").hide();
	            $("#findPatient").hide();	            
	            $("#patientDetails").hide();
	            $('.win-splitview-panewrapper').show();
	            $("#settings").show();
	            WinJS.UI.Animation.slideLeftIn(document.getElementById('settings'));
	            WinJS.UI.Animation.slideUp(document.getElementById('settingsContent'));
	            break;
	    }
	}

	function getPatientsList() {
	    var getUrl = server + "/ws/rest/v1/patient?lastviewed&v=default";
	    $.ajax({
	        beforeSend: function (xhr) {
	            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
	        },
	        method: "GET",
	        url: getUrl,
	        success: function (data) {
	            setPatients(data);
            }
	    });
	}

	function searchClickHandler() {
	    var searchVal = document.getElementById('searchLable').value;
	    if (isNotEmpty(searchVal)) {
	        var getUrl = server + "/ws/rest/v1/patient?q=" + searchVal + "&v=default";
	        $.ajax({
	            beforeSend: function (xhr) {
	                xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
	            },
	            method: "GET",
	            url: getUrl,
	            success: function (data) {
	                setPatients(data);
	            }
	        });
	    }
	    else {
	        getPatientsList();
	    }
	}

	function setPatients(data) {
	    var newPatients = [];
	    if (data.results.length == 0) {
	        newPatients.push({
	            name: 'No Patients Found',
	            age: '',
	            genre: '',
	            birthdate: ''
	        });
	    }
	    else {
	        for (var i = 0; i < data.results.length; i++) {
	            var bdt = new Date(data.results[i].person.birthdate);
	            var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][bdt.getMonth()];
	            var birthdate = bdt.getDay() + " " + month + " " + bdt.getFullYear();
	            var gender = 'Male';
	            if (data.results[i].person.gender === 'F')
	                gender = 'Female'
	            newPatients.push({
	                name: data.results[i].display,
	                age: data.results[i].person.age,
	                gender: gender,
	                birthdate: birthdate,
	                uuid: data.results[i].uuid
	            });
	        }
	    }
	    var patientsListNew = new WinJS.Binding.List(newPatients);
	    var patRepeater = document.querySelector("#repeater");
	    patRepeater.winControl.data = patientsListNew;
	    WinJS.UI.Animation.slideUp(patRepeater);
	}

	function showPatientDetails(uuid) {
	    var getUrl = server + '/ws/rest/v1/patient/' + uuid + '?v=full';
	    $.ajax({
	        beforeSend: function (xhr) {
	            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
	        },
	        method: "GET",
	        url: getUrl,
	        success: function (data) {
	            var patientDetails = [];
	            var bdt = new Date(data.person.birthdate);
	            var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][bdt.getMonth()];
	            var birthdate = bdt.getDay() + " " + month + " " + bdt.getFullYear();
	            var gender = 'Male';
	            if (data.person.gender === 'F')
	                gender = 'Female'

	            patientDetails.push({
	                name: data.person.display,
	                id: data.identifiers[0].identifier,
	                age: data.person.age,
	                gender: gender,
	                birthdate: birthdate,
	                address: data.person.preferredAddress.address1,
	                city: data.person.preferredAddress.cityVillage,
	                postalCode: data.person.preferredAddress.postalCode,
	                state: data.person.preferredAddress.stateProvince,
	                country: data.person.preferredAddress.country
	            });

	            var patientsListNew = new WinJS.Binding.List(patientDetails);
	            var patRepeater = document.querySelector("#patientDetailsRepeater");
	            patRepeater.winControl.data = patientsListNew;
	            UIController('patientDetails');
	            WinJS.UI.Animation.slideUp(patRepeater);
	        }
	    });
	}
    
    // Define patients set as an array of objects for list.
	var patients = [];
    //Convert the array into a List object.
	var patientsList = new WinJS.Binding.List(patients);
    //Expose the list globally in the 'Patients' namespace.
	WinJS.Namespace.define("Patients",
        { data: patientsList });

	WinJS.Namespace.define("Navigation", {
	    dataBinding: WinJS.Binding.as({
	        navigations: new WinJS.Binding.List([]),
	    }),

	    NavigationItem: WinJS.Class.define(
                function (element, options) {
                    this.element = element;
                    this.element.onclick = function (event) {
                        var item = this.winControl.data;
                        // Handle onclick here
                        showPatientDetails(item.uuid)
                    };
                }
            ),
	});

	function startTime() {
	    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	    var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	    var today = new Date();
	    var h = today.getHours();
	    var m = today.getMinutes();
	    var s = today.getSeconds();
	    var d = today.getDay();
	    var pm = 'AM';
	    if (h >= 12) {
	        pm = 'PM';
	        h -= 12;
	    }
	    m = checkTime(m);
	    s = checkTime(s);
	    document.getElementById('time').innerHTML = h + ":" + m + ":" + s + ' ' + pm + ' '; 
	    document.getElementById('date').innerHTML = weekday[today.getDay()] + ', ' + month[today.getMonth()] + ' ' + today.getUTCDate() + ', ' + today.getFullYear();
	    var t = setTimeout(startTime, 500);
	}
	function checkTime(i) {
	    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
	    return i;
	}

	function isNotEmpty(str) {
	    return !(!str || 0 === str.length);
	}

	app.start();
})();