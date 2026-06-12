var consentOn = false;

function toggleConsent() {
    consentOn = !consentOn;
    document.getElementById('chk').classList.toggle('on', consentOn);
}

function togglePw(id, btn) {
    var inp = document.getElementById(id);
    var showing = inp.type === 'text';
    inp.type = showing ? 'password' : 'text';
    btn.innerHTML = showing
        ? '<i class="ti ti-eye"></i>'
        : '<i class="ti ti-eye-off"></i>';
}

function updateStrength(val) {
    var score = 0;
    if (val.length >= 8)          score++;
    if (/[A-Z]/.test(val))        score++;
    if (/[0-9]/.test(val))        score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    var colors = ['#eee', '#e24b4a', '#f4a623', '#63c36a', '#1d9e75'];
    var active = val.length > 0 ? colors[score] : '#eee';

    for (var i = 1; i <= 4; i++) {
        document.getElementById('b' + i).style.background = i <= score ? active : '#eee';
    }
}

async function submitForm() {
    var name  = document.getElementById('f-name').value.trim();
    var email = document.getElementById('f-email').value.trim();
    var number = document.getElementById('f-phone').value.trim();
    var pw    = document.getElementById('f-pw').value;
    var pw2   = document.getElementById('f-pw2').value;

    if (!name || !email || !pw) {
        alert('Vyplňte prosím všechna povinná pole.');
        return;
    }
    if (pw !== pw2) {
        alert('Hesla se neshodují.');
        return;
    }
    if (!consentOn) {
        alert('Pro registraci je nutný souhlas s podmínkami.');
        return;
    }

    var btn = document.querySelector('.vf-btn');
    btn.disabled = true;
    btn.textContent = 'Registruji...';

    try {
        var response = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: name, email: email, number: number, password: pw })
        });

        var result = await response.text();

        if (result === 'REGISTER OK') {
            document.getElementById('form-section').style.display = 'none';
            document.getElementById('success-section').style.display = 'flex';
        } else if (result === 'USER EXISTS') {
            alert('Uživatel s tímto jménem již existuje.');
        } else {
            alert('Chyba při registraci: ' + result);
        }

    } catch (e) {
        alert('Nepodařilo se spojit se serverem. Zkuste to znovu.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ti ti-user-plus"></i> Registrovat se';
    }
}

function resetForm() {
    document.getElementById('f-name').value  = '';
    document.getElementById('f-email').value = '';
    document.getElementById('f-phone').value = '';
    document.getElementById('f-pw').value    = '';
    document.getElementById('f-pw2').value   = '';
    consentOn = false;
    document.getElementById('chk').classList.remove('on');
    updateStrength('');
    document.getElementById('success-section').style.display = 'none';
    document.getElementById('form-section').style.display    = 'block';
}