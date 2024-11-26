// TODO: Language thing (esp, eng)
// TODO: USE A DB INSTEAD OF JSON AND SPREADSHEET - STILL WRITE TO SPREADSHEET

const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const path = require("path");
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();

const { BedCheckIn, SQLInsert, createBedsTable, createRoomsTable, createGuestsTable } = require("./utils_sql.js")
const { createExcel, getWorkSheet, addEntry } = require("./utils_excel.js");
let { Room } = require("./src/room.js");
let { Hostel } = require("./src/hostel.js");
let { Bed } = require("./src/bed.js");


const EXCEL_FP = "hostel.xlsx";
const EXCEL = createExcel(EXCEL_FP, false);
const CHECKOUTLIST_FP = "checkoutlist.xlsx";
const EXCEL_CHECKOUTLIST = createExcel(CHECKOUTLIST_FP, false);
const DB = new sqlite3.Database('hostel.db');

//   constructor(hostel, room, type, number) {
//       this.hostel = hostel;
//       this.room = room;
//       this.type = type;
//       this.number = number;
//       this.available = true;
//       this.checkInDate = null;
//       this.numDays = null;
//       this.checkOutDate = null;
//   }

//   displayBed() {

//       let bed = document.createElement('div');
//       bed.textContent = this.number;
//       bed.classList.add('bed');
//       bed.classList.add(this.type);
//       if (this.available) {
//           bed.classList.add('available');
//       } 

//       bed.onclick = () => {
//           window.api.send("loadCheckin", {bed: this.number, room: this.room.name});
//       };
//       return bed;
//   }

//   checkIn(numDays) {
//       //TODO: USE CHEKC IN DATE
//       let d = new Date();
//       this.numDays = parseInt(numDays);
//       this.available = false;
//       this.checkInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()); // TODO: Get from page
//       let temp = new Date()
//       temp.setDate(temp.getDate() + this.numDays); 
//       this.checkOutDate = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
//   }

//   checkOut() {
//     let d = new Date();
//     let today = new Date(d.getFullYear(), d.getMonth(), d.getDate())

//     if (this.available) {
//       return false;
//     } else {
//       if (this.checkOutDate.getTime() <= today.getTime()) {

//         this.available = true;
//         this.checkInDate = null;
//         this.numDays = null;
//         this.checkOutDate = null;
//         return true;
//       }
//     }
//   }
// }

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
  // ONE TIME USE
  // fs.readFile("assets/hostel.json", (error, data) => {
  //   if (error) {
  //     console.error("error: " + error);
  //     return;
  //   } else {
  //     console.log("success");
  //   }
  //   let json = JSON.parse(data);
  //   let inserted = [];
  //   let curId = 1;
  //   for (let i = 0; i < json.length; i++) {
  //     if (!inserted.includes(json[i].room)) {
  //       let sql = SQLInsert("rooms", ["name", "numBeds"], [`"${json[i].room}"`, 1]);
  //       DB.run(sql);
  //       inserted[json[i].room] = curId;
  //       curId++;
  //     } else {
  //       let sql = "UPDATE rooms SET numBeds = numBeds + 1 WHERE name = " + `"${json[i].room}"`;
  //       DB.run(sql);
  //     }


  //     let roomID = inserted[json[i].room];
  //     let sql = SQLInsert("beds", 
  //       ["roomID", "room", "bed", "available", "type"], 
  //       [roomID, `"${json[i].room}"`, `"${json[i].bed}"`, "TRUE", `"Single"`]
  //     );
  //     DB.run(sql);
  //   }
  // });


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
  win.loadFile(path.join(__dirname, "src/html/index.html"));
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
        let data = [];
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
    for (let bed of bedsClicked) {
      if (bed.bed === args.bed && bed.room === args.room) {
        alreadyClicked = true;
        bedsClicked = bedsClicked.filter(b => b.bed !== args.bed && b.room !== args.room);
      }
    }
    if (!alreadyClicked) {
      bedsClicked.push(args);
    }

    win.webContents.send("bedClickedFromMain", args);
  } else if (curUrl === "index.html") {
    curBed = args.bed;
    curRoom = args.room;
    win.loadFile(path.join(__dirname, `src/html/update.html`));
  }
  // TODO: add logic to check not too many beds are clicked
  // Count private room as two beds - if beds does not equal num ppl on submit then add a warning
});

ipcMain.on("reload", (event, args) => {
  for (let room of hostel.rooms) {
    for (let bed of room.beds) { bed.checkOut(); }
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
  // let numBedsClicked = 0;
  // console.log(hostel);
  // for (let bed of bedsClicked) {
  //   let bedObj = hostel.getBed(bed.room, bed.bed);
  //   let type = bedObj.type;
  //   if (type === "Single") {
  //     numBedsClicked ++;
  //   } else {
  //     numBedsClicked += 2;
  //   } 
  // }
  //TODO: handle num beds clicked
  console.log(numBedsClicked, curData.numppl);
  for (let bed of bedsClicked) {
    BedCheckIn(DB, curData, bed.room, bed.bed);
  }

  curData = null;
  win.loadFile(path.join(__dirname, `src/html/index.html`));
  // let numppl = parseInt(curData.numppl);

  // if (numBedsClicked < numppl) { 
  //   //TODO: Handle no enough beds clicked
  //   // win.api.send("notEnoughBedsClicked", {});
  // } else if (numBedsClicked == numppl) {
  //   console.log("HERE");
  //   // Update beds with check in, save file and load index page.
  //   for (let bed of bedsClicked) {
  //     SQLCheckIn(curData);
  //   }

  //   curData = null;
  //   win.loadFile(path.join(__dirname, `index.html`));
  // } else {

  // }
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