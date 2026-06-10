let selectedRating = 0;
let selectedCategory = -1;
let consentGiven = false;

function showError(id, message) {
    const field = document.getElementById(id).closest('.field');
    let err = field.querySelector('.field-error');
    if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        field.appendChild(err);
    }
    err.textContent = message;
    document.getElementById(id).classList.add('input-error');
}

function clearError(id) {
    const field = document.getElementById(id).closest('.field');
    const err = field.querySelector('.field-error');
    if (err) err.remove();
    document.getElementById(id).classList.remove('input-error');
}

function showCategoryError(message) {
    const field = document.querySelector('.category-list').closest('.field');
    let err = field.querySelector('.field-error');
    if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        field.appendChild(err);
    }
    err.textContent = message;
}

function clearCategoryError() {
    const field = document.querySelector('.category-list').closest('.field');
    const err = field.querySelector('.field-error');
    if (err) err.remove();
}

function showRatingError(message) {
    const field = document.querySelector('.stars').closest('.field');
    let err = field.querySelector('.field-error');
    if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        field.appendChild(err);
    }
    err.textContent = message;
}

function clearRatingError() {
    const field = document.querySelector('.stars').closest('.field');
    const err = field.querySelector('.field-error');
    if (err) err.remove();
}

function validateName(value) {
    if (!value) return 'Jméno je povinné.';
    if (value.trim().length < 3) return 'Jméno musí mít alespoň 3 znaky.';
    if (!/^[\p{L}\s]+$/u.test(value)) return 'Jméno smí obsahovat pouze písmena.';
    return null;
}

function validateContact(value) {
    if (!value) return 'E-mail nebo telefon je povinný.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
    if (!emailRegex.test(value) && !phoneRegex.test(value)) return 'Zadejte platný e-mail nebo telefonní číslo.';
    return null;
}

function setStars(n) {
    selectedRating = n;
    document.querySelectorAll('.star').forEach((s, i) => {
        s.classList.toggle('active', i < n);
    });
    clearRatingError();
}

function selectCategory(el) {
    document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedCategory = [...el.parentElement.children].indexOf(el);
    clearCategoryError();
}

function toggleConsent() {
    consentGiven = !consentGiven;
    document.getElementById('consent-check').classList.toggle('checked', consentGiven);
}

function submitFeedback() {
    const name = document.getElementById('name').value.trim();
    const contact = document.getElementById('contact').value.trim();

    const nameError = validateName(name);
    const contactError = validateContact(contact);

    nameError ? showError('name', nameError) : clearError('name');
    contactError ? showError('contact', contactError) : clearError('contact');

    if (selectedCategory === -1) {
        showCategoryError('Vyberte prosím kategorii.');
    } else {
        clearCategoryError();
    }

    if (selectedRating === 0) {
        showRatingError('Vyberte prosím hodnocení.');
    } else {
        clearRatingError();
    }

    // Evaluate all conditions independently before blocking — avoids short-circuit skipping
    const hasErrors =
        Boolean(nameError) ||
        Boolean(contactError) ||
        selectedCategory === -1 ||
        selectedRating === 0;

    if (hasErrors) return;

    document.querySelector('.form-body').style.display = 'none';
    const card = document.getElementById('success-card');
    card.style.display = 'flex';
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

    clearError('name');
    clearError('contact');
    clearCategoryError();
    clearRatingError();

    document.querySelector('.form-body').style.display = 'block';
    document.getElementById('success-card').style.display = 'none';
}

document.getElementById('name').addEventListener('input', function () {
    const error = validateName(this.value.trim());
    error ? showError('name', error) : clearError('name');
});

document.getElementById('contact').addEventListener('input', function () {
    const error = validateContact(this.value.trim());
    error ? showError('contact', error) : clearError('contact');
});