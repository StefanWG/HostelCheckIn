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

        if (!this.available) { 
            let d = new Date();
            console.log(d);
            let daysLeft = Math.ceil((this.checkOutDate - d) / (1000 * 60 * 60 * 24));
            console.log(this.checkOutDate)
            let daysLeftElement = document.createElement('div');
            daysLeftElement.textContent = daysLeft + ' days';
            bed.appendChild(daysLeftElement);
        }

        bed.onclick = () => {
            console.log('clicked');
            // window.open(`checkin.html?bed=${this.number}&room=${this.room.name}`, '_blank');
            window.api.send("loadCheckin", {bed: this.number, room: this.room.name});
        };
        return bed;
    }

    checkIn(numDays) {
        this.numDays = numDays;
        this.available = false;
        let dateString = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
        this.checkInDate = new Date(dateString);
        this.checkOutDate = addDays(dateString, this.numDays);
    }
}