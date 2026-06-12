/**
 * langSwitcher.js – sdílený jazykový přepínač s vlaječkami
 * Načti ho NA KAŽDÉ stránce PŘED page-specifickým JS.
 * Pořadí scriptů v HTML: translations.js → langSwitcher.js → stránka.js
 */

// Globální lang proměnná dostupná všem ostatním scriptům
var lang = localStorage.getItem("lang") || "cs";

const FLAG_ICONS = {
    cs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
           <rect width="900" height="600" fill="#fff"/>
           <rect width="900" height="300" y="300" fill="#d7141a"/>
           <polygon points="0,0 450,300 0,600" fill="#11457e"/>
         </svg>`,
    en: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
           <rect width="60" height="30" fill="#012169"/>
           <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
           <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="4"/>
           <path d="M30,0 V30 M0,15 H60" stroke="#fff" stroke-width="10"/>
           <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" stroke-width="6"/>
         </svg>`
};

/**
 * Vloží přepínač vlaječek do elementu s id="lang-switcher-mount"
 * Zavolej tuhle funkci v DOMContentLoaded každé stránky.
 */
function mountLangSwitcher() {
    const mount = document.getElementById("lang-switcher-mount");
    if (!mount) return;

    mount.innerHTML = `
        <div class="lang-switcher" id="lang-switcher">
            <button class="lang-btn ${lang === 'cs' ? 'active' : ''}" onclick="setLang('cs')" title="Čeština">
                <span class="flag-icon">${FLAG_ICONS.cs}</span>
                <span class="lang-label">CS</span>
            </button>
            <button class="lang-btn ${lang === 'en' ? 'active' : ''}" onclick="setLang('en')" title="English">
                <span class="flag-icon">${FLAG_ICONS.en}</span>
                <span class="lang-label">EN</span>
            </button>
        </div>
    `;
}

function setLang(newLang) {
    lang = newLang;
    localStorage.setItem("lang", lang);

    // Aktualizuj aktivní stav tlačítek
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("onclick").includes(`'${lang}'`));
    });

    // Zavolej applyLanguage() dané stránky pokud existuje
    if (typeof applyLanguage === "function") applyLanguage();
}

/** Pomocné funkce dostupné všem stránkám */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}
function setHTML(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
}
function setPlaceholder(id, value) {
    const el = document.getElementById(id);
    if (el) el.placeholder = value;
}