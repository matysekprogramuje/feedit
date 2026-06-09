let selectedRating = 0;
let selectedCategory = -1;
let consentGiven = false;

function setStars(n) {
    selectedRating = n;
    document.querySelectorAll('.star').forEach((s, i) => {
        s.classList.toggle('active', i < n);
    });
}

function selectCat(el) {
    document.querySelectorAll('.cat-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedCategory = [...el.parentElement.children].indexOf(el);
}

function toggleConsent() {
    consentGiven = !consentGiven;
    document.getElementById('consent-check').classList.toggle('checked', consentGiven);
}

async function submitFeedback() {
    const name    = document.getElementById('f-name').value.trim();
    const contact = document.getElementById('f-contact').value.trim();
    const comment = document.getElementById('f-comment').value.trim();

    // Rozlišení email vs telefon
    const isEmail  = contact.includes('@');
    const email    = isEmail ? contact : '';
    const number   = isEmail ? '' : contact;

    if (!name || !contact || selectedCategory === -1 || selectedRating === 0) {
        alert('Vyplňte prosím jméno, kontakt, kategorii a hodnocení.');
        return;
    }

    await sendDataSet(name, email, number, comment, selectedCategory, consentGiven);

    // Zobrazení success karty
    document.getElementById('form-wrap').style.display = 'none';
    document.getElementById('success-card').style.display = 'flex';
}

async function sendDataSet(name, gmail, number, coment, category, wantsContact) {
    const feedback = {
        name: name,
        email: gmail,
        number: number,
        comment: coment,
        rating: selectedRating,   // opravená proměnná
        category: category,
        date: new Date(),
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
    }
}