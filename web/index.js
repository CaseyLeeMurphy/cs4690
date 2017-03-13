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
let loadingAmount = 7;
let randomInterval = 750;

// -------------- Code to be executed when page has loaded -------------------------------
// ---------------------------------------------------------------------------------------
$(document).ready(function(){
    $('.modal').modal();
    $('select').material_select();

    $('#tilesDiv').hide();

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 50 // Creates a dropdown of 15 years to control year
    });

    // show the loading modal
    $('#loadingModal').modal('open');

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
            let currentPercentage = 0;

            for (let i = 0; i < loadingAmount && i < listOfStudentIDs.length; i++){
                setTimeout(function() {
                    $http.get('/api/v1/students/' + listOfStudentIDs[i])
                        .then(function (response) {
                            response.data.id = listOfStudentIDs[currentIndexLoaded];
                            $scope.studentList.push(response.data);

                            currentPercentage += 1/loadingAmount*100;
                            updateLoadingModal(currentPercentage, currentIndexLoaded - (listOfStudentIDs.length-1));
                            currentIndexLoaded++;
                        });
                }, Math.random()*randomInterval);
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
        let currentPercentage = 0;
        let initialIndex = currentIndexLoaded
        $('#loadingModal').modal('open');

        for (let i = initialIndex; i < initialIndex + loadingAmount && i < listOfStudentIDs.length; i++){
            setTimeout(function(){
                $http.get('/api/v1/students/' + listOfStudentIDs[i])
                    .then(function(response){
                        response.data.id = listOfStudentIDs[i];
                        $scope.studentList.push(response.data);

                        currentPercentage += 1/loadingAmount*100;
                        updateLoadingModal(currentPercentage, currentIndexLoaded - (listOfStudentIDs.length-1));
                        currentIndexLoaded++;
                    });
            }, Math.random()*randomInterval);
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

    $scope.AdjustSort = function(sortName){
        if ($scope.sortType === sortName){
            if ($scope.sortReverse === true) {
                $scope.sortReverse = false;
            } else {
                $scope.sortReverse = true;
            }
        } else {
            $scope.sortReverse = false;
        }

        // Hide all other sort icons
        $scope.showFullNameAsc = false;
        $scope.showStartDateAsc = false;
        $scope.showStreetAsc = false;
        $scope.showCityAsc = false;
        $scope.showStateAsc = false;
        $scope.showZipCodeAsc = false;
        $scope.showPhoneNumberAsc = false;
        $scope.showYearAsc = false;
        $scope.showFullNameDesc = false;
        $scope.showStartDateDesc = false;
        $scope.showStreetDesc = false;
        $scope.showCityDesc = false;
        $scope.showStateDesc = false;
        $scope.showZipCodeDesc = false;
        $scope.showPhoneNumberDesc = false;
        $scope.showYearDesc = false;

        // Switch on sortName and show that icon
        switch(sortName) {
            case 'fname':
                $scope.showFullNameAsc = $scope.sortReverse;
                $scope.showFullNameDesc = !$scope.sortReverse;
                break;
            case 'startDate':
                $scope.showStartDateAsc = $scope.sortReverse;
                $scope.showStartDateDesc = !$scope.sortReverse;
                break;
            case 'street':
                $scope.showStreetAsc = $scope.sortReverse;
                $scope.showStreetDesc = !$scope.sortReverse;
                break;
            case 'city':
                $scope.showCityAsc = $scope.sortReverse;
                $scope.showCityDesc = !$scope.sortReverse;
                break;
            case 'state':
                $scope.showStateAsc = $scope.sortReverse;
                $scope.showStateDesc = !$scope.sortReverse;
                break;
            case 'zip':
                $scope.showZipCodeAsc = $scope.sortReverse;
                $scope.showZipCodeDesc = !$scope.sortReverse;
                break;
            case 'phone':
                $scope.showPhoneNumberAsc = $scope.sortReverse;
                $scope.showPhoneNumberDesc = !$scope.sortReverse;
                break;
            case 'year':
                $scope.showYearAsc = $scope.sortReverse;
                $scope.showYearDesc = !$scope.sortReverse;
                break;
        }

        $scope.sortType = sortName;
    }
});

function updateLoadingModal(percentage, reachedEnd) {
    $('#progressBar').attr('style', `width: ${percentage}%`);

    setTimeout(function() {
        if (percentage >= 99 || reachedEnd === 0) {
            $('#progressBar').attr('style', `width: 0%`);
            $('#loadingModal').modal('close');
        }
    },750);


}