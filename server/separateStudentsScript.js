// Set up requirements
var fs = require('fs');

// Get the studentsNoID json object
var students = JSON.parse(fs.readFileSync('students.json', 'utf8'));

// Loop through all students, remove the id's and write the file. 
for (var i = 0; i < students.length; i++){
    var fileName = ('0000' + i).substr(-4, 4);
    //delete students[i].id;
    students[i].id = students[i].id + '.json';
    fs.writeFileSync(`${__dirname}/students/${fileName}.json`, JSON.stringify(students[i], null, 3), 'utf8');
}

console.log('done');