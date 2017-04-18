var connectionString = "mssql://defaultUser:thisisAS3cret@[127.0.0.1,1601]/SchoolData"
var sql = require('mssql');

exports.read = function(id, callbackFunc) {
  sql.connect(connectionString).then((pool) => {
        let queryString = `
            SELECT * 
            FROM studentData
            WHERE id = @ID
		 `;

        return pool.request()
            .input("ID", id)
            .query(queryString)
    }).then((recordset, err) => {
        callbackFunc(err, recordset);
    });  
}

exports.post = function(data, callbackFunc) {
  sql.connect(connectionString).then((pool) => {
        let queryString = `
            INSERT INTO studentData 
            (
                lname,
                fname,
                startDate,
                street,
                city,
                state,
                zip,
                phone,
                year
            )
            VALUES (@fname,
                @lname,
                @startDate,
                @street,
                @city,
                @state,
                @zip,
                @phone,
                @year)

            SELECT @@IDENTITY
		 `;

        return pool.request()
            .input("ID", id)
            .input("fname", data.fname)
            .input("lname", data.lname)
            .input("startDate", data.startDate)
            .input("street", data.street)
            .input("city", data.city)
            .input("state", data.state)
            .input("zip", data.zip)
            .input("phone", data.phone)
            .input("year", data.year)
            .query(queryString)
    }).then((recordset, err) => {
        callbackFunc(err, recordset);
    });   
}

exports.update = function(id, data, callbackFunc) {
  sql.connect(connectionString).then((pool) => {
        let queryString = `
            UPDATE studentData
            SET "fname": @fname,
                "lname": @lname,
                "startDate": @startDate,
                "street": @street,
                "city": @city,
                "state": @state,
                "zip": @zip,
                "phone": @phone,
                "year": @year,
            WHERE id = @ID
		 `;

        return pool.request()
            .input("ID", id)
            .input("fname", data.fname)
            .input("lname", data.lname)
            .input("startDate", data.startDate)
            .input("street", data.street)
            .input("city", data.city)
            .input("state", data.state)
            .input("zip", data.zip)
            .input("phone", data.phone)
            .input("year", data.year)
            .query(queryString)
    }).then((recordset, err) => {
        callbackFunc(err, recordset);
    });  
}

exports.delete = function(id, callbackFunc) {
  sql.connect(connectionString).then((pool) => {
        let queryString = `
            DELETE FROM studentData
            WHERE id = @ID
		 `;

        return pool.request()
            .input("ID", id)
            .query(queryString)
    }).then((recordset, err) => {
        callbackFunc(err, recordset);
    });  
}

exports.list = function(callbackFunc) {
    sql.connect(connectionString).then((pool) => {
        let queryString = `
            SELECT * 
            FROM studentData
		 `;

        return pool.request()
            .query(queryString)
    }).then((recordset, err) => {
        callbackFunc(err, recordset);
    });
}
