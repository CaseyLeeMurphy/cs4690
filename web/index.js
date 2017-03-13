// ------------------------------ Declare global variables -------------------------------
// ---------------------------------------------------------------------------------------
let listOfStudentIDs = [];
let studentData = [];
let ajaxCount = 0;
let currentStudentID;
let deletedStudents = [];
let firstTimeThrough = true;
let isEditing;
let currentIndexLoaded = 0;
let loadingAmount = 5;

// -------------- Code to be executed when page has loaded -------------------------------
// ---------------------------------------------------------------------------------------
$(document).ready(function(){
    $('.modal').modal();
    $('select').material_select();

    $('#tilesDiv').hide();

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    // // Set up tooltips
    // $('[data-toggle="tooltip"]').tooltip();
    //
    // // Get the list of students
    // $.get("/api/v1/students", function(response) {
    //     listOfStudentIDs = response;
    //     getStudentDataFromListOfIDs(listOfStudentIDs)
    //
    //     if (Cookies.get('ViewType') === 'Table') $("#studentDataTableDiv").slideDown();
    //     if (Cookies.get('ViewType') === 'Tiles') $("#studentDataTiles").slideDown();
    // });
    //
    // // Set up non-table click events
    // setUpNonTableRowClickFunctions();
});


var app = angular.module('app', []);
app.controller('studentsController', function($scope, $http){
    $scope.studentList = [];

    $http.get("/api/v1/students")
        .then(function(response) {
            listOfStudentIDs = response.data;

            for (currentIndexLoaded = 0; currentIndexLoaded < loadingAmount && currentIndexLoaded < listOfStudentIDs.length; currentIndexLoaded++){
                $http.get('/api/v1/students/' + listOfStudentIDs[currentIndexLoaded])
                    .then(function(response){
                        response.data.id = listOfStudentIDs[currentIndexLoaded];
                        $scope.studentList.push(response.data);
                    });
            }
        });

    $scope.editStudent = function(studentData) {
        $scope.firstName = studentData.fname;
        $scope.lastName = studentData.lname;
        $scope.startDate = studentData.startDate;
        $scope.street = studentData.street;
        $scope.city = studentData.city;
        $scope.state = studentData.state;
        $scope.zip = studentData.zip;
        $scope.phoneNumber = studentData.phone;
        $scope.year = studentData.year;
        currentStudentID = studentData.id;
        $('#StudentModal').modal('open');
        Materialize.updateTextFields();

        isEditing = true;
    }

    $scope.addStudent = function() {
        $scope.firstName = "";
        $scope.lastName = "";
        $scope.startDate = "";
        $scope.street = "";
        $scope.city = "";
        $scope.state = "";
        $scope.zip = "";
        $scope.phoneNumber = "";
        $scope.year = "";

        isEditing = false;
    }

    $scope.addOrEditStudent = function() {
        jsonStudentData = {
            "fname": $scope.firstName,
            "lname": $scope.lastName,
            "startDate": $scope.startDate,
            "street": $scope.street,
            "city": $scope.city,
            "state": $scope.state,
            "zip": $scope.zip,
            "phone": $scope.phoneNumber,
            "year": $scope.year
        };

        if (isEditing === true){
            $http({
                method: 'PUT',
                url: `/api/v1/students/${currentStudentID}`,
                data: jsonStudentData
            }).then(function(response) {
                // edit the view
            });
        } else {
            $http({
                method: 'POST',
                url: `/api/v1/students/`,
                data: jsonStudentData
            }).then(function(response) {
                    // Add student to list
                }
            );
        }
    }

    $scope.deleteStudent = function(studentInfo) {
        //http request to delete id
        $http({
            url: '/api/v1/students/' + studentInfo.id,
            method: 'DELETE',
        }).then(function() {
            // filter on ID
            deletedStudents.push(studentInfo);
        });
    }

    $scope.showTable = function() {
        $("#tableDiv").slideDown('slow');
        $("#tilesDiv").slideUp('slow');
        Cookies.set('ViewType', 'Table')
    }

    $scope.showTiles = function() {
        $("#tableDiv").slideUp('slow');
        $("#tilesDiv").slideDown('slow');
        Cookies.set('ViewType', 'Tiles')
    }

    $scope.getSchoolYearFromNumber = function(theYear) {
        if (theYear === 1 || theYear === '1') return "Freshman";
        if (theYear === 2 || theYear === '2') return "Sophomore";
        if (theYear === 3 || theYear === '3') return "Junior";
        if (theYear === 4 || theYear === '4') return "Senior";
    }

    $scope.loadMore = function() {
        if (currentIndexLoaded >= listOfStudentIDs.length){
            Materialize.toast('You have loaded all there is. Great job!', 5000);
            return;
        }

        for (let i = 0; i < loadingAmount && currentIndexLoaded < listOfStudentIDs.length; i++){
            $http.get('/api/v1/students/' + listOfStudentIDs[currentIndexLoaded])
                .then(function(response){
                    response.data.id = listOfStudentIDs[currentIndexLoaded];
                    $scope.studentList.push(response.data);
                });
            currentIndexLoaded++;
        }
    }

    $scope.restoreLastStudent = function() {
        if (deletedStudents.length === 0){
            Materialize.toast('Sorry, you gotta delete some before you bring \'em back', 5000)
            return;
        }

        $http({
            method: 'POST',
            url: `/api/v1/students/`,
            data: deletedStudents.pop()
        }).then(function(response) {
                // Add student to list
            }
        );
    }
});

function setUpNonTableRowClickFunctions() {
    
    $('#btnRestoreStudent').click(function() {
        if (deletedStudents.length === 0) {
            alert('You need to delete a student before you can restore one');
            return;
        }
        
        // Do an ajax request to recreate the student in the deletedStudent array
        $.ajax({
                type: 'POST',
                url: `/api/v1/students/`,
                data: deletedStudents[0],
                success: function (responseID) {
                    deletedStudents[0].id = responseID;
                    
                    // Add deleted student back into data, and remove them from deletedstudent array
                    studentData.unshift(deletedStudents[0]);
                    deletedStudents.shift();
                    
                    // Refresh the view
                    fillTableWithData(studentData);
                    fillStudentTiles(studentData);
                    setUpRowButtonEventHandlers();
                }
        });
    });
    
    $('.btnLoadMore').click(function() {
        loadMoreStudents();
    });
    
    // ----------------- Table Header Sort Click Even Handlers -------------------------------
    // ---------------------------------------------------------------------------------------
    // For all table header sort functions:
    // 1. See if this row is the currently sorted row.
    // 2a. if it is, reverse the sorting, change the glyphicon, and set the cookie
    // 2b. if not, set the glyphicon, make it visible, sort ascending, and  set the cookie
    
    $("#fnameAndlname").click(function() {
        studentData = _.sortBy(studentData, 'fname');
        studentData = _.sortBy(studentData, 'lname');
        
       if ($("#fnameSort").css("visibility") === "hidden"){
            hideAllSortButtons();
            $("#fnameSort").css("visibility","visible");
            $("#fnameSort").attr("class","glyphicon glyphicon-sort-by-alphabet");
            Cookies.set('SortType', 'fnameAsc');
       } else {
            if ($("#fnameSort").attr("class") === "glyphicon glyphicon-sort-by-alphabet"){
                $("#fnameSort").attr("class","glyphicon glyphicon-sort-by-alphabet-alt");
                studentData.reverse();
                Cookies.set('SortType', 'fnameDesc');
            }
            else {
                $("#fnameSort").attr("class","glyphicon glyphicon-sort-by-alphabet");
                Cookies.set('SortType', 'fnameAsc');
            }
       }
       fillTableWithData(studentData);
    });
    
    $("#startDate").click(function() {
        if ($("#startDateSort").css("visibility") === "hidden"){
            hideAllSortButtons();
            $("#startDateSort").css("visibility","visible");
            $("#startDateSort").attr("class","glyphicon glyphicon-sort-by-order-alt");
            studentData.sort(sortstartDateAsc);
            Cookies.set('SortType', 'startDateAsc');
        } else {
           if ($("#startDateSort").attr("class") === "glyphicon glyphicon-sort-by-order-alt"){
                $("#startDateSort").attr("class","glyphicon glyphicon-sort-by-order");
                studentData.sort(sortstartDateDesc);
                Cookies.set('SortType', 'startDateDesc');
           }
           else {
                $("#startDateSort").attr("class","glyphicon glyphicon-sort-by-order-alt");
                studentData.sort(sortstartDateAsc);
                Cookies.set('SortType', 'startDateAsc');
           }
        }
        fillTableWithData(studentData);
    });
    
    $("#street").click(function() {
        if ($("#streetSort").css("visibility") === "hidden"){
            hideAllSortButtons();
            $("#streetSort").css("visibility","visible");
            $("#streetSort").attr("class","glyphicon glyphicon-sort-by-alphabet");
            studentData.sort(sortByStreetAsc);
            Cookies.set('SortType', 'streetAsc');
        } else {
           if ($("#streetSort").attr("class") === "glyphicon glyphicon-sort-by-alphabet"){
               $("#streetSort").attr("class","glyphicon glyphicon-sort-by-alphabet-alt");
               studentData.sort(sortByStreetDesc);
               Cookies.set('SortType', 'streetDesc');
           }
           else {
               $("#streetSort").attr("class","glyphicon glyphicon-sort-by-alphabet");
               studentData.sort(sortByStreetAsc);
               Cookies.set('SortType', 'streetAsc');
           }
        }
        fillTableWithData(studentData);
    });
    
    $("#city").click(function() {
        if ($("#citySort").css("visibility") === "hidden"){
            hideAllSortButtons();
            $("#citySort").css("visibility","visible");
            $("#citySort").attr("class","glyphicon glyphicon-sort-by-alphabet");
            studentData.sort(sortByCityAsc);
            Cookies.set('SortType', 'cityAsc');
        } else {
            if ($("#citySort").attr("class") === "glyphicon glyphicon-sort-by-alphabet"){
                $("#citySort").attr("class","glyphicon glyphicon-sort-by-alphabet-alt");
                studentData.sort(sortByCityDesc);
                Cookies.set('SortType', 'cityDesc');
            }
            else {
                $("#citySort").attr("class","glyphicon glyphicon-sort-by-alphabet");
                studentData.sort(sortByCityAsc);
                Cookies.set('SortType', 'cityAsc');
            }
        }
        fillTableWithData(studentData);
    });
    
    $("#state").click(function() {
       if ($("#stateSort").css("visibility") === "hidden"){
            hideAllSortButtons();
            $("#stateSort").css("visibility","visible");
            $("#stateSort").attr("class","glyphicon glyphicon-sort-by-alphabet");
            studentData.sort(sortByStateAsc);
            Cookies.set('SortType', 'stateAsc');
       } else {
            if ($("#stateSort").attr("class") === "glyphicon glyphicon-sort-by-alphabet"){
                $("#stateSort").attr("class","glyphicon glyphicon-sort-by-alphabet-alt");
                studentData.sort(sortByStateDesc);
                Cookies.set('SortType', 'stateDesc');
            }
            else {
                $("#stateSort").attr("class","glyphicon glyphicon-sort-by-alphabet");
                studentData.sort(sortByStateAsc);
                Cookies.set('SortType', 'stateAsc');
            }
       }
       fillTableWithData(studentData);
    });
    
    $("#zip").click(function() {
       if ($("#zipSort").css("visibility") === "hidden"){
            hideAllSortButtons();
            $("#zipSort").css("visibility","visible");
            $("#zipSort").attr("class","glyphicon glyphicon-sort-by-order-alt");
            studentData.sort((x,y) => x.zip - y.zip);
            Cookies.set('SortType', 'zipAsc');
       } else {
           if ($("#zipSort").attr("class") === "glyphicon glyphicon-sort-by-order-alt"){
                $("#zipSort").attr("class","glyphicon glyphicon-sort-by-order");
                studentData.sort((x,y) => y.zip - x.zip);
                Cookies.set('SortType', 'zipDesc');
           }
           else {
                $("#zipSort").attr("class","glyphicon glyphicon-sort-by-order-alt");
                studentData.sort((x,y) => x.zip - y.zip);
                Cookies.set('SortType', 'zipAsc');
           }
       }
       fillTableWithData(studentData);
    });
    
    $("#phone").click(function() {
       if ($("#phoneSort").css("visibility") === "hidden"){
            hideAllSortButtons();
            $("#phoneSort").css("visibility","visible");
            $("#phoneSort").attr("class","glyphicon glyphicon-sort-by-order-alt");
            studentData.sort(sortByPhoneAsc);
            Cookies.set('SortType', 'phoneAsc');
       } else {
            if ($("#phoneSort").attr("class") === "glyphicon glyphicon-sort-by-order-alt"){
               $("#phoneSort").attr("class","glyphicon glyphicon-sort-by-order");
               studentData.sort(sortByPhoneDesc);
               Cookies.set('SortType', 'phoneDesc');
            }
            else {
               $("#phoneSort").attr("class","glyphicon glyphicon-sort-by-order-alt");
               studentData.sort(sortByPhoneAsc);
               Cookies.set('SortType', 'phoneAsc');
            }
       }
       fillTableWithData(studentData);
    });
    
    $("#year").click(function() {
       if ($("#yearSort").css("visibility") === "hidden"){
            hideAllSortButtons();
            $("#yearSort").css("visibility","visible");
            $("#yearSort").attr("class","glyphicon glyphicon-sort-by-attributes");
            studentData.sort((x,y) => x.year - y.year);
            Cookies.set('SortType', 'yearAsc');
       } else {
            if ($("#yearSort").attr("class") === "glyphicon glyphicon-sort-by-attributes"){
               $("#yearSort").attr("class","glyphicon glyphicon-sort-by-attributes-alt");
               studentData.sort((x,y) => y.year - x.year);
               Cookies.set('SortType', 'yearDesc');
            }
            else {
               $("#yearSort").attr("class","glyphicon glyphicon-sort-by-attributes");
               studentData.sort((x,y) => x.year - y.year);
               Cookies.set('SortType', 'yearAsc');
            }
       }
       fillTableWithData(studentData);
    });
    
    // ---------------------- Model button click even handlers -------------------------------
    // ---------------------------------------------------------------------------------------
    $('.btnStudentModalSubmit').click(function() {
        let JSONStudentData = JSON.parse(getStringOfStudentDataFromModal());
        
        if ($(this).attr('id') === "btnSaveEdit") {
            // Do an ajax put request to push the changes to the file system.
            $.ajax({
                type: 'PUT',
                url: `/api/v1/students/${currentStudentID}`,
                data: JSONStudentData
            });
            
            // Edit the model & Update the view
            editStudentDataAtID(currentStudentID, JSONStudentData);
            fillTableWithData(studentData);
            fillStudentTiles(studentData);
            setUpRowButtonEventHandlers();
            
        }
        else {
            // Do an ajax post request, get id from server, and add it to JSON object
            $.ajax({
                type: 'POST',
                url: `/api/v1/students/`,
                data: JSONStudentData,
                success: function (responseID) {
                    // Add new student to data and refresh the view
                    JSONStudentData.id = responseID;
                    studentData.unshift(JSONStudentData);
                    fillTableWithData(studentData);
                    fillStudentTiles(studentData);
                    setUpRowButtonEventHandlers();
                }
            });
        }
    });
}

function setUpRowButtonEventHandlers() {
    $('.editButton').unbind('click').click(function() {
        handleEdit($(this).attr('id'));
    });
    
    $('.deleteButton').unbind('click').click(function() {
        handleDelete($(this).attr('id'));
    });
}

// -------------- Get Related Methods (not including click methods) ----------------------
// ---------------------------------------------------------------------------------------
function getStudentDataFromListOfIDs(listOfIDs) {
    // Alert the user if there are no more students to load
    if (listOfIDs.length === 0) {
        alert('Sorry, it looks like there\'s nothing else to load');
        return;
    }
    
    // Show the modal, reset the count, and start ajax get requests up to 10 times
    $('#loadingModal').modal('open');
    ajaxCount = 0;

    for (let i = 0; (i < listOfIDs.length) && i < 10 ; i++) {
        ajaxStudentDataFromID(listOfIDs[i]);
    }
}

function ajaxStudentDataFromID(id) {
    // Do Ajax get request for that specific student
    $.get("/api/v1/students/" + id, function(responseData) {
        setTimeout(function(){
            // Increment the count
            ajaxCount++;
            let percentageComplete = 0;
            
            // Calculate percentage of completed ajax calls 
            if (listOfStudentIDs.length < 10) {
                percentageComplete = Math.round((ajaxCount / listOfStudentIDs.length)  * 100);
            }
            else {
                percentageComplete = ajaxCount * 10;
            }
            
            // Add ID to data
            responseData['id'] = id;
            studentData.push(responseData);
            
            // Update progress bar
            $('#progressBar').attr('style', `width: ${percentageComplete}%`);
            
            
            // If we just completed the last ajax call, load the data into html table, and finish the progress bar. 
            if (ajaxCount === 10 || ajaxCount === listOfStudentIDs.length) {
                setTimeout(function() {
                    if (firstTimeThrough === true){
                        sortAndDisplayBasedOnSortDescString(Cookies.get('SortType'));
                        firstTimeThrough = false;
                    }

                    fillTableWithData(studentData);
                    fillStudentTiles(studentData);
                    $('#loadingModal').modal('close');
                    $('#progressBar').attr('style', 'width: 0%');
                }, 1000);
            }
        }, 1000);
    });
}

function loadMoreStudents() {
    // Remove 10 items from the list of ids 
    for (var i = 0; i < 10; i++){
        listOfStudentIDs.shift();
    }
    
    getStudentDataFromListOfIDs(listOfStudentIDs);
}

// ------------- Post/Put Related Methods (not including click methods) ------------------
// ---------------------------------------------------------------------------------------
function handleEdit(id){
    // Set variables, and clear out modal
    currentStudentID = id;
    $('#studentDataForm').trigger('reset');
    $('.btnStudentModalSubmit').attr('id','btnSaveEdit'); 
    let specificStudentData = getStudentDataFromID(id);
    
    // fill modal with current values
    $('#editStudentModal .modal-body #stuFname').val(specificStudentData.fname);
    $('#editStudentModal .modal-body #stuLname').val(specificStudentData.lname);
    $('#editStudentModal .modal-body #stuStartDate').val(specificStudentData.startDate);
    $('#editStudentModal .modal-body #stuStreet').val(specificStudentData.street);
    $('#editStudentModal .modal-body #stuCity').val(specificStudentData.city);
    $('#editStudentModal .modal-body #stuState').val(specificStudentData.state);
    $('#editStudentModal .modal-body #stuZip').val(specificStudentData.zip);
    $('#editStudentModal .modal-body #stuPhone').val(specificStudentData.phone);
    $('#editStudentModal .modal-body #stuYear').val(specificStudentData.year);
    
    // show the modal
    $('#editStudentModal').modal('show');
}

function editStudentDataAtID(id, newStudentInfo) {
    // loop over student data array. When ids match, edit the values
    for (let i = 0; i < studentData.length; i++) {
        if (studentData[i].id === id) {
            studentData[i].fname = newStudentInfo.fname;
            studentData[i].lname = newStudentInfo.lname;
            studentData[i].startDate = newStudentInfo.startDate;
            studentData[i].street = newStudentInfo.street;
            studentData[i].city = newStudentInfo.city;
            studentData[i].state = newStudentInfo.state;
            studentData[i].zip = newStudentInfo.zip;
            studentData[i].phone = newStudentInfo.phone;
            studentData[i].year = newStudentInfo.year;
            return;
        }
    }
}

// ------------------ Delete Related Methods (not including click methods) ---------------
// ---------------------------------------------------------------------------------------
function removeStudentAtID(id) {
    // loop over studentData array
    for (let i = 0; i < studentData.length; i++) {
        // on match, store the data in deletedStudents and then remove it
        if (studentData[i].id === id) {
            deletedStudents.push(studentData[i]);
            studentData.splice(i,1);
            return;
        }
    }
}

function handleDelete(id){
    // Do the Ajax delete request
    $.ajax({
        url: '/api/v1/students/' + id,
        type: 'DELETE',
    });
    
    //Update the data and view
    removeStudentAtID(id);
    fillTableWithData(studentData);
    fillStudentTiles(studentData);
    setUpRowButtonEventHandlers();
}

// -------------------------------------- Sorting functions ------------------------------
// ---------------------------------------------------------------------------------------
function sortAndDisplayBasedOnSortDescString(sortType){
    switch (sortType) {
    case "fnameAsc":
        studentData = _.sortBy(studentData, 'fname');
        studentData = _.sortBy(studentData, 'lname');
        $('#fnameSort').attr("class","glyphicon glyphicon-sort-by-alphabet");
        $("#fnameSort").css("visibility","visible");
        break;
    case "fnameDesc":
        studentData = _.sortBy(studentData, 'fname')
        studentData = _.sortBy(studentData, 'lname');
        studentData.reverse();
        $('#fnameSort').attr("class","glyphicon glyphicon-sort-by-alphabet-alt");
        $("#fnameSort").css("visibility","visible");
        break;
    case "startDateAsc":
        studentData.sort(sortstartDateAsc);
        $('#startDateSort').attr("class","glyphicon glyphicon-sort-by-order-alt");
        $("#startDateSort").css("visibility","visible");
        break;
    case "startDateDesc":
        studentData.sort(sortstartDateDesc);
        $('#startDateSort').attr("class","glyphicon glyphicon-sort-by-order");
        $("#startDateSort").css("visibility","visible");
        break;
    case "streetAsc":
        studentData.sort(sortByStreetAsc);
        $('#streetSort').attr("class","glyphicon glyphicon-sort-by-alphabet");
        $("#streetSort").css("visibility","visible");
        break;
    case "streetDesc":
        studentData.sort(sortByStreetDesc);
        $('#streetSort').attr("class","glyphicon glyphicon-sort-by-alphabet-alt");
        $("#streetSort").css("visibility","visible");
        break;
    case "cityAsc":
        studentData.sort(sortByCityAsc);
        $('#citySort').attr("class","glyphicon glyphicon-sort-by-alphabet");
        $("#citySort").css("visibility","visible");
        break;
    case "cityDesc":
        studentData.sort(sortByCityDesc);
        $('#citySort').attr("class","glyphicon glyphicon-sort-by-alphabet-alt");
        $("#citySort").css("visibility","visible");
        break;
    case "stateAsc":
        studentData.sort(sortByStateAsc);
        $('#stateSort').attr("class","glyphicon glyphicon-sort-by-alphabet");
        $("#stateSort").css("visibility","visible");
        break;
    case "stateDesc":
        studentData.sort(sortByStateDesc);
        $('#stateSort').attr("class","glyphicon glyphicon-sort-by-alphabet-alt");
        $("#stateSort").css("visibility","visible");
        break;
    case "zipAsc":
        studentData.sort((x,y) => x - y);
        $('#zipSort').attr("class","glyphicon glyphicon-sort-by-order-alt");
        $("#zipSort").css("visibility","visible");
        break;
    case "zipDesc":
        studentData.sort((x,y) => y - x);
        $('#zipSort').attr("class","glyphicon glyphicon-sort-by-order");
        $("#zipSort").css("visibility","visible");
        break;
    case "phoneAsc":
        studentData.sort(sortByPhoneAsc);
        $('#phoneSort').attr("class","glyphicon glyphicon-sort-by-order-alt");
        $("#phoneSort").css("visibility","visible");
        break;
    case "phoneDesc":
        studentData.sort(sortByPhoneDesc);
        $('#phoneSort').attr("class","glyphicon glyphicon-sort-by-order");
        $("#phoneSort").css("visibility","visible");
        break;
    case "yearAsc":
        studentData.sort((x,y) => x - y);
        $('#yearSort').attr("class","glyphicon glyphicon-sort-by-attributes");
        $("#yearSort").css("visibility","visible");
        break;
    case "yearDesc":
        studentData.sort((x,y) => y - x);
        $('#yearSort').attr("class","glyphicon glyphicon-sort-by-attributes-alt");
        $("#yearSort").css("visibility","visible");
    }
}

// --------------------------------------- Helper functions ------------------------------
// ---------------------------------------------------------------------------------------
function getSchoolYearFromNumber(theYear) {
    if (theYear === 1 || theYear === '1') return "Freshman";
    if (theYear === 2 || theYear === '2') return "Sophomore";
    if (theYear === 3 || theYear === '3') return "Junior";
    if (theYear === 4 || theYear === '4') return "Senior";
}

function getStudentDataFromID(id) {
    for (let i = 0; i < studentData.length; i++) {
        if (studentData[i].id === id) return studentData[i];
    }
}

function getStringOfStudentDataFromModal() {
    return `{
               "fname": "${$('#editStudentModal .modal-body #stuFname').val()}",
               "lname": "${$('#editStudentModal .modal-body #stuLname').val()}",
               "startDate": "${$('#editStudentModal .modal-body #stuStartDate').val()}",
               "street": "${$('#editStudentModal .modal-body #stuStreet').val()}",
               "city": "${$('#editStudentModal .modal-body #stuCity').val()}",
               "state": "${$('#editStudentModal .modal-body #stuState').val()}",
               "zip": ${$('#editStudentModal .modal-body #stuZip').val()},
               "phone": "${$('#editStudentModal .modal-body #stuPhone').val()}",
               "year": ${$('#editStudentModal .modal-body #stuYear').val()}
            }`;
}

function hideAllSortButtons(){
    $("#fnameSort").css("visibility", "hidden");
    $("#lnameSort").css("visibility", "hidden");
    $("#startDateSort").css("visibility", "hidden");
    $("#streetSort").css("visibility", "hidden");
    $("#citySort").css("visibility", "hidden");
    $("#stateSort").css("visibility", "hidden");
    $("#zipSort").css("visibility", "hidden");
    $("#phoneSort").css("visibility", "hidden");
    $("#yearSort").css("visibility", "hidden");
}

function fillStudentTiles(jsonObject) {
    // Clear out tiles
    $('#studentDataTiles').html("");
    
    // loop over data and fill tiles
    for (let i = 0; i < jsonObject.length; i++) {
        $("#studentDataTiles").append(`
            <div class=\"grid-item\">
                <h3>${jsonObject[i].fname} ${jsonObject[i].lname}</h3>
                <p>Start Date: ${jsonObject[i].startDate}</p>
                <p>${jsonObject[i].street}</br>${jsonObject[i].city}, ${jsonObject[i].state} ${jsonObject[i].zip}</p>
                <p>${jsonObject[i].phone}</p>
                <p>${getSchoolYearFromNumber(jsonObject[i].year)}</p>
            </div>`
        );
    }
}

function fillTableWithData(jsonObject) {
    // Clear out current table
    $("tbody").html("");
    
    // Loop over json object and fill table
    for (let i = 0; i < jsonObject.length; i++){
        $("tbody").append(`
            <tr id='row${i}'></tr>
                <td>${jsonObject[i].fname} ${jsonObject[i].lname}</td>
                <td>${jsonObject[i].startDate}</td>
                <td>${jsonObject[i].street}</td>
                <td>${jsonObject[i].city}</td>
                <td>${jsonObject[i].state}</td>
                <td>${jsonObject[i].zip}</td>
                <td>${jsonObject[i].phone}</td>
                <td>${getSchoolYearFromNumber(jsonObject[i].year)}</td>
                <td>
                    <button type="button" class="btn btn-default editButton" id="${jsonObject[i].id}" data-toggle="tooltip" title="Edit this student's info">
                        <span class="glyphicon glyphicon-edit"></span>
                    </button>
                    <button type="button" class="btn btn-default deleteButton" id="${jsonObject[i].id}" data-toggle="tooltip" title="Delete this student">
                        <span class="glyphicon glyphicon-trash"></span>
                    </button>
                </td>
            </tr>
        `);
    }
    setUpRowButtonEventHandlers();
}