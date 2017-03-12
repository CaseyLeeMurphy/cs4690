// Set up requirements
var fs = require('fs');

// Get the studentsNoID json object
var students = JSON.parse(fs.readFileSync('students.json', 'utf8'));

// Loop through all students and assign IDs
for (var i = 0; i < students.length; i++){
    students[i].id = ('0000' + i).substr(-4, 4);
}

// Save the data to a file
fs.writeFileSync('students.json', JSON.stringify(students, null, 3), 'utf8');

console.log('done');