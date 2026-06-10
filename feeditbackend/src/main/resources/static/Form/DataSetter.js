async function submitFeedback() {
    const name    = document.getElementById('name').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const comment = document.getElementById('comment').value.trim();

    const isEmail = contact.includes('@');
    const email   = isEmail ? contact : '';
    const number  = isEmail ? '' : contact;

    if (!name || !contact || selectedCategory === -1 || selectedRating === 0) {
        alert('Vyplňte prosím jméno, kontakt, kategorii a hodnocení.');
        return;
    }

    await sendDataSet(name, email, number, comment, selectedCategory, consentGiven);

    document.querySelector('.form-body').style.display = 'none';
    document.getElementById('success-card').style.display = 'flex';
}

async function sendDataSet(name, gmail, number, comment, category, wantsContact) {
    const feedback = {
        name:         name,
        email:        gmail,
        number:       number,
        comment:      comment,
        rating:       selectedRating,
        category:     category,
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
    }
}