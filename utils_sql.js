function SQLInsert(table, columns, values) {
    let sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`;
    return sql;
}
  
function SQLCheckIn(db, args, room, bed) {
    let sql = 
    `UPDATE beds 
    SET available = 0,
    checkInDate = "${args.checkInDate.getFullYear()}-${args.checkInDate.getMonth()+1}-${args.checkInDate.getDate()}", 
    numDays = ${args.numDays}, 
    checkOutDate = "${args.checkOutDate.getFullYear()}-${args.checkOutDate.getMonth()+1}-${args.checkOutDate.getDate()}"
    WHERE bed = "${bed}" AND room = "${room}";`;
    console.log(sql)
    db.run(sql);
}

function createRoomsTable(db) {
    db.run(
        `CREATE TABLE IF NOT EXISTS rooms (
            roomID INTEGER PRIMARY KEY,
            name TEXT,
            numBeds INTEGER
        )`
    );
}

function createBedsTable(db) {
    db.run(
        `CREATE TABLE IF NOT EXISTS beds (
            bedID INTEGER PRIMARY KEY,
            roomID INTEGER, 
            room TEXT,
            bed TEXT, 
            available BOOLEAN, 
            checkInDate TEXT, 
            numDays INTEGER, 
            checkOutDate TEXT, 
            type TEXT,
            guestID INTEGER
        )`
    );
}

function createGuestsTable(db) {
    db.run(
        `CREATE TABLE IF NOT EXISTS guests (
            guestID INTEGER PRIMARY KEY, 
            date INTEGER, fname TEXT, 
            lname TEXT, 
            numppl INTEGER, 
            numDays INTEGER, 
            country TEXT, 
            passport TEXT, 
            checkOutDate INTEGER, 
            paid BOOLEAN, 
            paymentMethod TEXT, 
            amountPaid INTEGER, 
            currency TEXT, 
            notes TEXT
        )`
    );
}
module.exports = {
    SQLInsert, 
    SQLCheckIn,
    createRoomsTable,
    createBedsTable,
    createGuestsTable
};