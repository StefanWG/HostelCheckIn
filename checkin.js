window.api.receive("fromMain", (data) => {
    console.log(`Received ${data} from main process`);
    let title = document.getElementById('title');
    title.textContent = `Check in to bed ${data.bed} in room ${data.room}`;
});

let dateInput = document.getElementById('checkindate');
dateInput.valueAsDate = new Date();

let cancelButton = document.getElementById('cancel');
let pickroomsButton = document.getElementById('pickrooms');

cancelButton.onclick =  () => {
    window.api.send("load", {"page":"index"});
};

pickroomsButton.onclick = () => { 
    let ids = ["numdays","numppl", "fname", "lname", "country", "passport"];
    for (let id of ids) {
        if (document.getElementById(id).value === "") {
            return;
        }
    }

    let numDays = parseInt(document.getElementById('numdays').value);
    let checkInDate = new Date(dateInput.value)
    let checkOutDate = new Date(dateInput.value);
    checkOutDate.setDate(checkInDate.getDate() + numDays);

    window.api.send("load", {
        "page": "roompicker",
        "numDays": numDays, 
        "numppl": document.getElementById('numppl').value,
        "checkInDate": checkInDate, 
        "checkOutDate": checkOutDate,
        "fname": document.getElementById('fname').value,
        "lname": document.getElementById('lname').value,
        "country": document.getElementById('country').value,
        "passport": document.getElementById('passport').value});
        //TODO: add payment stuff
}

document.addEventListener('DOMContentLoaded', function() {
    // Get references to the payment radio buttons and input fields
    const cashRadio = document.getElementById('cash');
    const creditRadio = document.getElementById('credit');
    const noPayRadio = document.getElementById('no-payment');
    const ccPayment = document.getElementById('ccPayment');
    const cashNotes = document.getElementById('cashNotes');
    const noPayNotes = document.getElementById('npNotes');
    const cashLabel = document.querySelector('label[for="cash"]');
    const creditLabel = document.querySelector('label[for="credit"]');
    const noPayLabel = document.querySelector('label[for="no-payment"]');

    // Function to toggle visibility of payment inputs and active tab
    function togglePaymentInputs() {
        if (cashRadio.checked) {
            ccPayment.style.display = 'none'; // Hide credit card input
            cashNotes.style.display = 'block'; // Show cash notes input
            noPayNotes.style.display = 'none'; // Show no payment notes input
            cashLabel.classList.add('active'); // Highlight cash tab
            creditLabel.classList.remove('active'); // Remove highlight from credit tab
            noPayLabel.classList.remove('active'); // Highlight no payment tab

        } else if (creditRadio.checked) {
            ccPayment.style.display = 'block'; // Show credit card input
            cashNotes.style.display = 'none'; // Hide cash notes input
            noPayNotes.style.display = 'none'; // Show no payment notes input

            creditLabel.classList.add('active'); // Highlight credit tab
            cashLabel.classList.remove('active'); // Remove highlight from cash tab
            noPayLabel.classList.remove('active'); // Highlight no payment tab

        } else if (noPayRadio.checked) {
            ccPayment.style.display = 'none'; // Hide credit card input
            cashNotes.style.display = 'none'; // Hide cash notes input
            noPayNotes.style.display = 'block'; // Show no payment notes input
            noPayLabel.classList.add('active'); // Highlight no payment tab
            cashLabel.classList.remove('active'); // Remove highlight from cash tab
            creditLabel.classList.remove('active'); // Remove highlight from credit tab
        }
    }

    // Attach event listeners to the radio buttons
    cashRadio.addEventListener('change', togglePaymentInputs);
    creditRadio.addEventListener('change', togglePaymentInputs);
    noPayRadio.addEventListener('change', togglePaymentInputs);


    // Initial toggle to set correct visibility on page load
    togglePaymentInputs();
});


