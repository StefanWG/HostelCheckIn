// TODO: Language thing (esp, eng)
// TODO: USE A DB INSTEAD OF JSON AND SPREADSHEET - STILL WRITE TO SPREADSHEET

const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const path = require("path");
const fs = require("fs");
const ExcelJS = require('exceljs');
const sqlite3 = require('sqlite3').verbose();


const EXCEL_FP = "hostel.xlsx";
const EXCEL = createExcel(EXCEL_FP, false);
const CHECKOUTLIST_FP = "checkoutlist.xlsx";
const EXCEL_CHECKOUTLIST = createExcel(CHECKOUTLIST_FP, false);
const DB = new sqlite3.Database('hostel.db');

class Hostel {
  constructor(name, rooms) {
      this.name = name;
      this.numRooms = rooms.length;
      this.rooms = [];
      for (let i = 0; i < rooms.length; i++) {
          this.rooms.push(new Room(this, rooms[i]));
      }
  }

  displayRooms() {
      let rooms = document.createElement('div');
      rooms.classList.add("hostel");
      for (let i = 0; i < this.rooms.length; i++) {
          let room = this.rooms[i].displayRoom();
          rooms.appendChild(room);
      }
      return rooms;
      // main.appendChild(rooms);
  }

  getJsonString () {
    let data = [];
    for (let i = 0; i < this.rooms.length; i++) {
        let room = this.rooms[i];
        for (let j = 0; j < room.beds.length; j++) {
            let bed = room.beds[j];
            data.push({
                room: room.name,
                bed: bed.number,
                available: bed.available,
                checkInDate: bed.checkInDate,
                numDays: bed.numDays,
                checkOutDate: bed.checkOutDate,
                type: bed.type
            });
        }
    }
    return JSON.stringify(data);
  }

  getBed(room, bed) {
    let roomObj = this.rooms.find(r => r.name === room);
    return roomObj.beds.find(b => b.number === bed);
}
}

class Room {
  constructor(hostel, name) {
      this.name = name;
      this.beds = [];
      this.hostel = hostel;
  }

  addBed(bed) {
      this.beds.push(bed);
  }

  displayRoom() {
      let room = document.createElement('div');
      let roomName = document.createElement('h2');
      roomName.textContent = this.name;
      room.classList.add('room');
      room.appendChild(roomName);
      let beds = document.createElement('div');
      beds.classList.add('beds');
      for (let i = 0; i < this.beds.length; i++) {
          let bedItem = this.beds[i].displayBed();
          beds.appendChild(bedItem);
      }
      room.appendChild(beds);
      return room;
  }
}

class Bed {
  constructor(hostel, room, type, number) {
      this.hostel = hostel;
      this.room = room;
      this.type = type;
      this.number = number;
      this.available = true;
      this.checkInDate = null;
      this.numDays = null;
      this.checkOutDate = null;
  }

  displayBed() {

      let bed = document.createElement('div');
      bed.textContent = this.number;
      bed.classList.add('bed');
      bed.classList.add(this.type);
      if (this.available) {
          bed.classList.add('available');
      } 

      bed.onclick = () => {
          window.api.send("loadCheckin", {bed: this.number, room: this.room.name});
      };
      return bed;
  }

  checkIn(numDays) {
      //TODO: USE CHEKC IN DATE
      let d = new Date();
      this.numDays = parseInt(numDays);
      this.available = false;
      this.checkInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()); // TODO: Get from page
      let temp = new Date()
      temp.setDate(temp.getDate() + this.numDays); 
      this.checkOutDate = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
  }

  checkOut() {
    let d = new Date();
    let today = new Date(d.getFullYear(), d.getMonth(), d.getDate())

    if (this.available) {
      return false;
    } else {
      if (this.checkOutDate.getTime() <= today.getTime()) {

        this.available = true;
        this.checkInDate = null;
        this.numDays = null;
        this.checkOutDate = null;
        return true;
      }
    }
  }
}

function createExcel(fp,override) {
  if (override) {
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.writeFile(`assets/${fp}`);
    return workbook;
  } else {
    if (fs.existsSync(`assets/${fp}`)) {
      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.readFile(`assets/${fp}`);
      return workbook;
    } else {
      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.writeFile(`assets/${fp}`);
      return workbook;
    }
  }
}


function getWorkSheet(wb) {

  let date = new Date();
  let month = date.toLocaleString('default', { month: 'long' });

  for (let sheet of wb.worksheets) {
    if (sheet.name === month) {
      sheet.columns = sheet.columns = [
        {header: "Date", key: "checkInDate", width: 10},
        {header: "First Name", key: "fname", width: 32},
        {header: "Last Name", key: "lname", width: 32},
        {header: "People", key: "numppl", width: 10},
        {header: "Nights", key: "numDays", width: 10},
        {header: "Country", key: "country", width: 15},
        {header: "Passport #", key:"passport", width: 15},
        {header: "Check Out Date", key: "checkOutDate", width: 10},
        {header: "Paid", key: "paid", width: 10},
        {header: "Payment Method", key: "paymentMethod", width: 15},
        {header: "Amount Paid", key: "amountPaid", width: 10},
        {header: "Currency", key: "currency", width: 10},
        {header: "Rooms", key: "room", width: 10},
        {header: "Beds", key: "bed", width: 10},
        {header: "Person", key: "person", width: 10},
        {header: "Notes", key: "notes", width: 10}
      ]
      return sheet;
    }
  }
  return addMonth(wb, month);
}

function addMonth(workbook, month,) {
  let sheet = workbook.addWorksheet(month);
  sheet.columns = [
    {header: "Date", key: "checkInDate", width: 10},
      {header: "First Name", key: "fname", width: 32},
      {header: "Last Name", key: "lname", width: 32},
      {header: "People", key: "numppl", width: 10},
      {header: "Nights", key: "numDays", width: 10},
      {header: "Country", key: "country", width: 15},
      {header: "Passport #", key:"passport", width: 15},
      {header: "Check Out Date", key: "checkOutDate", width: 10},
      {header: "Paid", key: "paid", width: 10},
      {header: "Payment Method", key: "paymentMethod", width: 15},
      {header: "Amount Paid", key: "amountPaid", width: 10},
      {header: "Currency", key: "currency", width: 10},
      {header: "Rooms", key: "room", width: 10},
      {header: "Beds", key: "bed", width: 10},
      {header: "Person", key: "person", width: 10},
      {header: "Notes", key: "notes", width: 10}
  ]

  workbook.xlsx.writeFile(`assets/${EXCEL_FP}`);
  return sheet;
}

function addEntry(wb, args) {
  console.log(args);
  let sheet = getWorkSheet(wb); 

  let row = {};
  for (let key in args) {
    row[key] = args[key];
  }

  sheet.addRow(row);
  wb.xlsx.writeFile(`assets/${EXCEL_FP}`);

}

function checkHostelMatchesSpreadsheet(hostel, sheet) {
  //TODO: call this periodically to make sure everything is synced.
  return;
}

function SQLInsert(table, columns, values) {
  let sql = `INSERT INTO ${table} (${columns.join(",")}) VALUES (${values.join(",")})`;
  return sql;
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let hostel = new Hostel('Hostel', []);  
let curBed;
let curRoom;

async function createWindow() {

  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    }
  });

  DB.run(
    `CREATE TABLE IF NOT EXISTS rooms (
      roomID INTEGER PRIMARY KEY,
      name TEXT,
      numBeds INTEGER
    )`
  );
  DB.run(
    `CREATE TABLE IF NOT EXISTS beds (
      bedID INTEGER PRIMARY KEY,
      roomID INTEGER, 
      bed TEXT, 
      available BOOLEAN, 
      checkInDate TEXT, 
      numDays INTEGER, 
      checkOutDate INTEGER, 
      type TEXT,
      guestID INTEGER
    )`
  );
  DB.run(
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

  



  // Load app
  fs.readFile("assets/hostel.json", (error, data) => {
    if (error) {
      console.error("error: " + error);
      return;
    } else {
      console.log("success");
    }
    let json = JSON.parse(data);
    for (let i = 0; i < json.length; i++) {
      let bed = json[i];
      let room = hostel.rooms.find(room => room.name === bed.room);
      if (room == undefined) {
          room = new Room(hostel, bed.room);
          hostel.rooms.push(room);
          hostel.numRooms++;
      }
      let newBed = new Bed(hostel, room, 'Single', bed.bed);
      newBed.available = bed.available;
      newBed.checkInDate = new Date(bed.checkInDate);
      newBed.numDays = bed.numDays;
      newBed.checkOutDate = new Date(bed.checkOutDate);
      room.addBed(newBed);
    }
  });
  win.loadFile(path.join(__dirname, "index.html"));

}

app.on("ready", createWindow);


let curData = null;
let bedsClicked = [];
let numBedsClicked = 0;


ipcMain.on("toMain", (event, args) => {
  if (args === "guests") {
    let sheet = getWorkSheet(EXCEL);
    let data = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        let obj = {
          name: row.values[2],
          numppl: row.values[4],
          numnight: row.values[5],
          date: row.values[1]
        }
        data.push(obj);
      }
    });
    win.webContents.send("fromMain", {"data": data});
    return;
  } else if (args === "checkoutlist") {
    for (let room of hostel.rooms) {
      for (let bed of room.beds) {
        if (!bed.available) {
          // TODO: RETURN ALL BEDS AND THEN IN CHECKOUTLIST.js filter them
        }
      }
    }

  }
  fs.readFile("assets/hostel.json", (error, data) => {
    // Do something with file contents
    let json = JSON.parse(data);
    // Send result back to renderer process
    if (curData != null) {
      win.webContents.send("fromMain", {"data":json, "numppl":curData.numppl});
    } else {
      win.webContents.send("fromMain", {"data":json});
    }
  });
});

ipcMain.on("bedClicked", (event, args) => {
  let curUrl = win.webContents.getURL().split("/")[win.webContents.getURL().split("/").length - 1];
  if (curUrl === "roompicker.html") {
    let alreadyClicked  = false;
    for (let bed of bedsClicked) {
      if (bed.bed === args.bed && bed.room === args.room) {
        alreadyClicked = true;
        bedsClicked = bedsClicked.filter(b => b.bed !== args.bed && b.room !== args.room);
      }
    }
    if (!alreadyClicked) {
      bedsClicked.push(args);
    }
    console.log(bedsClicked);

    win.webContents.send("bedClickedFromMain", args);
  } else if (curUrl === "index.html") {
    curBed = args.bed;
    curRoom = args.room;
    win.loadFile(path.join(__dirname, `update.html`));
  }
  // TODO: add logic to check not too many beds are clicked
  // TODO: handle already clicked?
  // Count private room as two beds - if beds does not equal num ppl on submit then add a warning
  // 

  // win.loadFile(path.join(__dirname, `checkin.html`));
  // win.webContents.send("bedClickedFromMain", args);
});

ipcMain.on("reload", (event, args) => {
  for (let room of hostel.rooms) {
    for (let bed of room.beds) {
      if (bed.checkOut()) {
        console.log("Checked out bed: " + bed.number);
      }
    }
  }

  fs.writeFile("assets/hostel.json", hostel.getJsonString(), (error) => {
    if (error) {
      console.error("error: " + error);
      return;
    } else {
      console.log("success");
      curData = null;
    }
  });
  win.webContents.reload();
});

ipcMain.on("updateHostel", (event, args) => {
    let numBedsClicked = 0;
    for (let bed of bedsClicked) {
      let bedObj = hostel.getBed(bed.room, bed.bed);
      let type = bedObj.type;
      if (type === "Single") {
        numBedsClicked ++;
      } else {
        numBedsClicked += 2;
      } 
    }
    console.log(numBedsClicked, curData.numppl);
    let numppl = parseInt(curData.numppl);

    if (numBedsClicked < numppl) { 
      //TODO: Handle no enough beds clicked
      // win.api.send("notEnoughBedsClicked", {});
    } else if (numBedsClicked == numppl) {
      console.log("HERE");
      // Update beds with check in, save file and load index page.
      for (let bed of bedsClicked) {
        let bedObj = hostel.getBed(bed.room, bed.bed);
        bedObj.checkIn(curData.numDays);
      }
      let jsonString = hostel.getJsonString();
      console.log(jsonString)
      fs.writeFile("assets/hostel.json", hostel.getJsonString(), (error) => {
        if (error) {
          console.error("error: " + error);
          return;
        } else {
          console.log("success");
        }
      });

      //Write to excel
      addEntry(EXCEL, curData);
      curData = null;
      win.loadFile(path.join(__dirname, `index.html`));
    } else {
      
    }
});

ipcMain.on("load", (event, args) => {
  if (args["page"] === "index") {
    win.loadFile(path.join(__dirname, `index.html`));
  } else if (args["page"] === "checkout") {
    win.loadFile(path.join(__dirname, `checkoutlist.html`));
  } else if (args["page"] === "guests") {
    win.loadFile(path.join(__dirname, `guests.html`));
  } else if (args["page"] === "checkin") {
    win.loadFile(path.join(__dirname, `checkin.html`));
    delete args["page"];
    win.webContents.send("fromMain", args);
  } else if (args["page"] === "roompicker") {
    bedsClicked = [];
    delete args["page"];
    curData = args;
    win.loadFile(path.join(__dirname, `roompicker.html`));
  }
});