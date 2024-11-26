try {
    let checkInBUtton = document.getElementById('checkin');
    checkInBUtton.addEventListener('click', () => {
        window.api.send("load", {"page": "checkin"});
    });
} catch {
    let homeButton = document.getElementById('home');
    homeButton.addEventListener('click', () => {
        window.api.send("load", {"page": "index"});
    });
}

let updateButton = document.getElementById('update');
updateButton.addEventListener('click', () => {
    window.api.send("reload", {});
});

let checkoutButtom = document.getElementById('checkout');
checkoutButtom.addEventListener('click', () => {
    window.api.send("load", {"page": "checkout"});
});

let guestsButton = document.getElementById('guests');
guestsButton.addEventListener('click', () => {
    window.api.send("load", {"page": "guests"});
});