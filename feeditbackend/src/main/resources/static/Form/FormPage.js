let selectedRating = 0;
let selectedCategory = -1;
let consentGiven = false;

function isValidContact(contact) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{9,15}$/;
    return emailRegex.test(contact) || phoneRegex.test(contact);
}

function setStars(n) {
    selectedRating = n;
    document.querySelectorAll('.star').forEach((s, i) => {
        s.classList.toggle('active', i < n);
    });
}

function selectCategory(el) {
    document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedCategory = [...el.parentElement.children].indexOf(el);
}

function toggleConsent() {
    consentGiven = !consentGiven;
    document.getElementById('consent-check').classList.toggle('checked', consentGiven);
}

function resetForm() {
    selectedRating = 0;
    selectedCategory = -1;
    consentGiven = false;

    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
    document.getElementById('consent-check').classList.remove('checked');

    document.getElementById('name').value = '';
    document.getElementById('contact').value = '';
    document.getElementById('comment').value = '';

    document.getElementById('contact').style.borderColor = '';

    document.querySelector('.form-body').style.display = 'block';
    document.getElementById('success-card').style.display = 'none';
}

document.getElementById('contact').addEventListener('blur', function () {
    const val = this.value.trim();
    if (val && !isValidContact(val)) {
        this.style.borderColor = 'red';
    } else {
        this.style.borderColor = '';
    }
});

async function submitFeedback() {
    const name    = document.getElementById('name').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const comment = document.getElementById('comment').value.trim();

    if (!name || !contact || selectedCategory === -1 || selectedRating === 0) {
        alert('Vyplňte prosím jméno, kontakt, kategorii a hodnocení.');
        return;
    }

    if (!isValidContact(contact)) {
        alert('Zadejte platný e-mail nebo telefonní číslo.');
        document.getElementById('contact').style.borderColor = 'red';
        return;
    }

    const isEmail = contact.includes('@');
    const email   = isEmail ? contact : '';
    const number  = isEmail ? '' : contact;

    const result = await sendDataSet(name, email, number, comment, selectedCategory, consentGiven);

    if (!result) {
        alert('Odeslání se nezdařilo. Zkuste to prosím znovu.');
        return;
    }

    document.querySelector('.form-body').style.display = 'none';
    document.getElementById('success-card').style.display = 'flex';
}

async function sendDataSet(name, email, number, comment, category, wantsContact) {
    const categories = [
        "Zákaznická podpora", "Mobilní služby", "Internetové připojení",
        "TV a zábava", "Prodejna Vodafone", "Fakturace a platby",
        "Aplikace Můj Vodafone", "Jiné"
    ];

    const feedback = {
        name:         name,
        email:        email,
        number:       number,
        comment:      comment,
        rating:       selectedRating,
        category:     categories[category],
        date:         new Date(),
        wantsContact: wantsContact
    };

    try {
        const response = await fetch("http://localhost:8080/api/user/sendFeedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(feedback)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("Odpověď serveru:", data);
        return data;

    } catch (error) {
        console.error("Chyba při odesílání:", error);
        return null;
    }
}