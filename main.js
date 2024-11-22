// TODO: Language thing (esp, eng)


const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const path = require("path");
const fs = require("fs");
const ExcelJS = require('exceljs');


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
      let d = new Date();
      this.numDays = parseInt(numDays);
      this.available = false;
      this.checkInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()); // TODO: Get from page
      let temp = new Date()
      temp.setDate(temp.getDate() + this.numDays); 
      this.checkOutDate = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
  }
}

function createExcel(fp) {
  const workbook = new ExcelJS.Workbook();
  workbook.xlsx.writeFile(`assets/${fp}`);
  return workbook;
}

function addMonth(workbook, month, fp) {
  let sheet = workbook.addWorksheet(month);
  sheet.columns = [
    {header: "Date", key: "date", width: 10},
    {header: "First Name", key: "fname", width: 32},
    {header: "Last Name", key: "lname", width: 32},
    {header: "Country", key: "country", width: 15},
    {header: "Passport #", key:"passport", width: 15},
  ]

  workbook.xlsx.writeFile(`assets/${fp}`);
  return sheet;

}

function checkHostelMatchesSpreadsheet(hostel, sheet) {
  //TODO: call this periodically to make sure everything is synced.
  return;
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
      newBed.checkInDate = bed.checkInDate;
      newBed.numDays = bed.numDays;
      newBed.checkOutDate = bed.checkOutDate;
      room.addBed(newBed);
    }
  });

  let wb = createExcel("hostel.xlsx");
  addMonth(wb, "January", "hostel.xlsx");


  win.loadFile(path.join(__dirname, "index.html"));

}

app.on("ready", createWindow);


let curData = null;
let bedsClicked = [];
let numBedsClicked = 0;


ipcMain.on("toMain", (event, args) => {
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

ipcMain.on("loadCheckin", (event, args) => {

  win.loadFile(path.join(__dirname, `checkin.html`));
  win.webContents.send("fromMain", args);

})
ipcMain.on("bedClicked", (event, args) => {
  let curUrl = win.webContents.getURL().split("/")[win.webContents.getURL().split("/").length - 1];
  if (curUrl === "roompicker.html") {
    bedsClicked.push(args);
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
  win.webContents.reload();
});

ipcMain.on("loadIndex", (event, args) => {  
  win.loadFile(path.join(__dirname, `index.html`));
});

ipcMain.on("goToRoomPicker", (event, args) => {
  curData = args;
  win.loadFile(path.join(__dirname, `roompicker.html`));
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
          curData = null;
        }
      });
      win.loadFile(path.join(__dirname, `index.html`));
    } else {
      
    }
});

ipcMain.on("loadCheckout", (event, args) => {
  win.loadFile(path.join(__dirname, `checkoutlist.html`));

});