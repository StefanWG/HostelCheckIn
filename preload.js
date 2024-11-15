// const { contextBridge } = require('electron')
// const fs = require('fs');

// contextBridge.exposeInMainWorld(
//     // 'hostel', readHostelLayoutFile('assets/hostel.json'),
//     "utils", {
//         "readHostelLayoutFile": (fp) => {
//             console.log("reading file");
//             let e = null;
//             fs.readFile(fp, "utf-8", (error, data) => {
//                 if (error){
//                     console.error("error: " + error);
//                     e = error;
//                 } else {
//                     console.log("success");
//                     let json = JSON.parse(data);
//                     // console.log(data);
//                     // console.log(json);
//                     // let hostel = createHostelFromJson(json);
//                     // console.log(hostel);
//                     // return json;
//                     return data;
//                 }
//             })
//             console.log(e);
//     }
//     }
// )
const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["toMain", "loadCheckin", "loadIndex", "updateHostel"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["fromMain", "checkinArgs"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);
