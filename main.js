// TODO: Language thing (esp, eng)


const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const path = require("path");
const fs = require("fs");

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
                checkOutDate: bed.checkOutDate
            });
        }
    }
    return JSON.stringify(data);
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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

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
  win.loadFile(path.join(__dirname, "index.html"));

  // rest of code..
}

app.on("ready", createWindow);

let curBed = null;
let curRoom = null;

ipcMain.on("toMain", (event, args) => {
  fs.readFile("assets/hostel.json", (error, data) => {
    // Do something with file contents
    let json = JSON.parse(data);
    // Send result back to renderer process
    win.webContents.send("fromMain", json);
  });
});

ipcMain.on("loadCheckin", (event, args) => {
  curBed = args.bed;
  curRoom = args.room;
  win.loadFile(path.join(__dirname, `checkin.html`));
  win.webContents.send("fromMain", args);
});

ipcMain.on("loadIndex", (event, args) => {  
  console.log("HERE");
  win.loadFile(path.join(__dirname, `index.html`));
});

ipcMain.on("updateHostel", (event, args) => {
  console.log(args);
  let hostel = new Hostel('Hostel', []);

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
      if (newBed.number == curBed && room.name == curRoom) {
        newBed.checkIn(args.numDays);
      } else {
        newBed.available = bed.available;
        newBed.checkInDate = bed.checkInDate;
        newBed.numDays = bed.numDays;
        newBed.checkOutDate = bed.checkOutDate;
      }
      room.addBed(newBed);
    }
    fs.writeFile("assets/hostel.json", hostel.getJsonString(), (err) => {
      if (error) {
        console.error("error: " + error);
        return;
      } else {
        console.log("success");
      }
    });
  });


  win.loadFile(path.join(__dirname, `index.html`));
});