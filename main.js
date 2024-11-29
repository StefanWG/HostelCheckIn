// TODO: Language thing (esp, eng)

const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const path = require("path");
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const { dialog } = require('electron');


const { BedCheckIn, BedCheckOut, SQLInsert, createBedsTable, createRoomsTable, createGuestsTable, GuestsCheckIn } = require("./utils_sql.js")
const { createExcel, getWorkSheet, addEntry, writeExcel } = require("./utils_excel.js");
let { Room } = require("./src/room.js");
let { Hostel } = require("./src/hostel.js");
let { Bed } = require("./src/bed.js");


const EXCEL_FP = "hostel.xlsx";
const EXCEL = createExcel(EXCEL_FP, false);
const CHECKOUTLIST_FP = "checkoutlist.xlsx";
const EXCEL_CHECKOUTLIST = createExcel(CHECKOUTLIST_FP, false);
const DB = new sqlite3.Database('hostel.db');

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
  createRoomsTable(DB);
  createBedsTable(DB);
  createGuestsTable(DB);
  let data = [];
  DB.all(`SELECT * FROM beds;`, (err, rows) => {
    if (err) { console.error(err); } else {
      for (let row of rows) { data.push(row); }
      for (let i = 0; i < data.length; i++) {
        let bed = data[i];
        let room = hostel.rooms.find(room => room.name === bed.room);
        if (room == undefined) {
            room = new Room(hostel, bed.room);
            hostel.rooms.push(room);
            hostel.numRooms++;
        }
        let newBed = new Bed(hostel, room, 'Single', bed.bed);
        newBed.available = bed.available;
        if (bed.checkInDate != null) {
            newBed.checkInDate = new Date(bed.checkInDate);
        }
        newBed.numDays = bed.numDays;
        if (bed.checkOutDate != null) {
            newBed.checkOutDate = new Date(bed.checkOutDate);
        }
        room.addBed(newBed);
      }
      hostel.rooms.sort((a, b) => a.name - b.name);
      for (let room of hostel.rooms) {
          room.beds.sort((a, b) => a.number - b.number);
      }
    }
  });
  win.loadFile(path.join(__dirname, "src/html/index.html"));
  // win.loadFile(path.join(__dirname, "hostelGen.html"));

}

app.on("ready", createWindow);


let curData = null;
let bedsClicked = [];
let numBedsClicked = 0;

ipcMain.on("toMain", (event, args) => {
  if (args === "guests") {
    let data = [];
    DB.all(`SELECT * FROM guests;`, (err, rows) => {
      if (err) { console.error(err); } else {
        for (let row of rows) { data.push(row); }
        win.webContents.send("fromMain", { "data": data });
      }
    });
    return;
  } else if (args === "checkoutlist") {
    DB.all(`SELECT * FROM beds;`, (err, rows) => {
      if (err) { console.error(err); } else {
        let data = [];
        for (let row of rows) { data.push(row); }
        win.webContents.send("fromMain", { "data": data });
      }
    });
  } else if (args === "update") {
    DB.all(`SELECT guestID FROM beds WHERE bed = "${curBed}" AND room = "${curRoom}";`, (err, rows) => {
     let guestID = rows[rows.length-1].guestID;
     DB.all(`SELECT * FROM guests WHERE guestID = ${guestID};`, (err, rows) => {
        if (err) { console.error(err); } else {
          win.webContents.send("fromMain", { "data": rows[0] });
        }
      });
    });
  } else {
    DB.all(`SELECT * FROM beds`, (err, rows) => {
      if (err) { console.error(err); } else {
        let data = [];
        for (let row of rows) { data.push(row); }
        if (curData != null) {
          win.webContents.send("fromMain", { "data": data, "numppl": curData.numppl });
        } else {
          win.webContents.send("fromMain", { "data": data });
        }
      }
    });
  }

});

ipcMain.on("bedClicked", (event, args) => {
  let curUrl = win.webContents.getURL().split("/")[win.webContents.getURL().split("/").length - 1];
  if (curUrl === "roompicker.html") {
    let alreadyClicked = false;
    // Check if bed has been clibked
    for (let bed of bedsClicked) {
      if (bed.bed === args.bed && bed.room === args.room) {
        alreadyClicked = true;
        bedsClicked = bedsClicked.filter(b => b.bed !== args.bed && b.room !== args.room);
      }
    }

    // Check if bed is taken
    let room = hostel.rooms.find(room => room.name === args.room);
    let bed = room.beds.find(bed => bed.number === args.bed);
    if (!alreadyClicked && bed.available == 1) {
      bedsClicked.push(args);
    }

    win.webContents.send("bedClickedFromMain", args);
  } else if (curUrl === "index.html") {
    curBed = args.bed;
    curRoom = args.room;
    win.loadFile(path.join(__dirname, `src/html/update.html`));
  }
});

ipcMain.on("reload", (event, args) => {
  for (let room of hostel.rooms) {

    for (let bed of room.beds) { 
      let d = new Date();
      let today = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      if (!bed.available&& bed.checkOutDate.getTime() <= today.getTime()) {
            bed.available = true;
            bed.checkInDate = null;
            bed.numDays = null;
            bed.checkOutDate = null;
            BedCheckOut(DB, bed.room.name, bed.number);
      }
    }
  }
  curData = null;
  win.webContents.reload();
});


ipcMain.on("updateHostel", (event, args) => {
  curData["bedsClicked"] = bedsClicked
  GuestsCheckIn(DB, curData)

  curData = null;
  win.loadFile(path.join(__dirname, `src/html/index.html`));
});

ipcMain.on("load", (event, args) => {
  if (args["page"] === "index") {
    win.loadFile(path.join(__dirname, `src/html/index.html`));
  } else if (args["page"] === "checkout") {
    win.loadFile(path.join(__dirname, `src/html/checkoutlist.html`));
  } else if (args["page"] === "guests") {
    win.loadFile(path.join(__dirname, `src/html/guests.html`));
  } else if (args["page"] === "checkin") {
    win.loadFile(path.join(__dirname, `src/html/checkin.html`));
    delete args["page"];
    win.webContents.send("fromMain", args);
  } else if (args["page"] === "roompicker") {
    bedsClicked = [];
    delete args["page"];
    curData = args;
    win.loadFile(path.join(__dirname, `src/html/roompicker.html`));
  }
});

ipcMain.on("saveGuests", (event, args) => {
    const filePath = dialog.showSaveDialog({
        title: 'Save Guests',
        defaultPath: 'guests.xlsx',
        properties: ['openDirectory'],
    }).then(result => {
      DB.all(`SELECT * FROM guests;`, (err, rows) => {
        let data = [];
        if (err) { console.error(err); } else {
          for (let row of rows) { data.push(row); }
          writeExcel(result.filePath, data);
        }
      });
    }).catch(err => {
      console.error(err);
    });
});

ipcMain.on("createDB", (event, args) => {
  console.log(args);
  DB = new sqlite3.Database(`${args.name}.db`);
  createRoomsTable(DB);
  createBedsTable(DB);
  createGuestsTable(DB);

  let curId = 1;

  // for (let room of args.rooms) {
  //     let sql = SQLInsert("rooms", ["name", "numBeds"], [`"${room.roomName}"`, room.beds]);
  //     try {
  //         DB.run(sql);
  //     } catch {
  //       DB.run(sql)
  //     }
  //     for (let i = 0; i < room.beds; i++) {
  //         let bedType = room.beds > 1 ? "Single" : "Double";
  //         let sql = SQLInsert("beds", 
  //             ["roomID", "room", "bed", "available", "type"], 
  //             [curId, `"${room.roomName}"`, i + 1, "TRUE", `${bedType}`]
  //         );
  //         DB.run(sql);
  //     }
  //     curId++;
  // }
});