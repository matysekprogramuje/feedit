let selectedRating = 0;
let selectedCategory = -1;
let consentGiven = false;

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

    document.querySelector('.form-body').style.display = 'block';
    document.getElementById('success-card').style.display = 'none';
}