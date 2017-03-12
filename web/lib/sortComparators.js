function compareStringsAsc(stringA, stringB){
    if (stringA < stringB) return -1;
    if (stringA > stringB) return 1;
    return 0;
}

function compareStringsDesc(stringA, stringB){
    if (stringA < stringB) return 1;
    if (stringA > stringB) return -1;
    return 0;
}

function sortByFnameAsc(studentA, studentB){
    let strA = studentA.fname.toLowerCase();
    let strB = studentB.fname.toLowerCase();
    
    return compareStringsAsc(strA, strB)
}

function sortByFnameDesc(studentA, studentB){
    let strA = studentA.fname.toLowerCase();
    let strB = studentB.fname.toLowerCase();
    
    return compareStringsDesc(strA, strB)
}

function sortByLnameAsc(studentA, studentB){
    let strA = studentA.lname.toLowerCase();
    let strB = studentB.lname.toLowerCase();
    
    return compareStringsAsc(strA, strB)
}

function sortByLnameDesc(studentA, studentB){
    let strA = studentA.lname.toLowerCase();
    let strB = studentB.lname.toLowerCase();
    
    return compareStringsDesc(strA, strB)
}

function sortstartDateAsc(studentA, studentB){
    let strA = new Date(studentA.startDate)
    let strB = new Date(studentB.startDate)
    
    if (strA < strB) return -1;
    if (strA > strB) return 1;
    return 0;
}

function sortstartDateDesc(studentA, studentB){
    let strA = new Date(studentA.startDate)
    let strB = new Date(studentB.startDate)
    
    if (strA < strB) return 1;
    if (strA > strB) return -1;
    return 0;
}

function sortByStreetAsc(studentA, studentB){
    let strA = studentA.street.toLowerCase();
    let strB = studentB.street.toLowerCase();
    
    return compareStringsAsc(strA, strB)
}

function sortByStreetDesc(studentA, studentB){
    let strA = studentA.street.toLowerCase();
    let strB = studentB.street.toLowerCase();
    
    return compareStringsDesc(strA, strB)
}

function sortByCityAsc(studentA, studentB){
    let strA = studentA.city.toLowerCase();
    let strB = studentB.city.toLowerCase();
    
    return compareStringsAsc(strA, strB)
}

function sortByCityDesc(studentA, studentB){
    let strA = studentA.city.toLowerCase();
    let strB = studentB.city.toLowerCase();
    
    return compareStringsDesc(strA, strB)
}

function sortByStateAsc(studentA, studentB){
    let strA = studentA.state.toLowerCase();
    let strB = studentB.state.toLowerCase();
    
    return compareStringsAsc(strA, strB)
}

function sortByStateDesc(studentA, studentB){
    let strA = studentA.state.toLowerCase();
    let strB = studentB.state.toLowerCase();
    
    return compareStringsDesc(strA, strB)
}

function sortByPhoneAsc(studentA, studentB){
    return compareStringsAsc(studentA.phone, studentB.phone)
}

function sortByPhoneDesc(studentA, studentB){
    return compareStringsDesc(studentA.phone, studentB.phone)
}