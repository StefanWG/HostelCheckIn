// function readHostelLayoutFile (fp) {
//     fs.readFile(fp, "utf-8", (error, data) => {
//         if (error){
//             console.error("error: " + error);
//         } else {
//             let json = JSON.parse(data);
//             let hostel = createHostelFromJson(json);
//             console.log(hostel);
//             return hostel;
//         }
//     })
// }