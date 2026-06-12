(function () {
    'use strict';

    /* ─────────────────────────────
       USER LOGIN UI STATE
    ───────────────────────────── */

    function initUserState() {
        const username = sessionStorage.getItem("username");
        const role = sessionStorage.getItem("role");

        const authLinks = document.getElementById("auth-links");
        const userBox = document.getElementById("user-box");
        const userName = document.getElementById("user-name");

        if (username) {
            if (authLinks) authLinks.style.display = "none";
            if (userBox) userBox.style.display = "flex";
            if (userName) {
                userName.textContent = role === "ADMIN"
                    ? `👑 ${username}`
                    : username;
            }
        } else {
            if (authLinks) authLinks.style.display = "flex";
            if (userBox) userBox.style.display = "none";
        }
    }

    window.logout = function () {
        sessionStorage.clear();
        window.location.reload();
    };

    /* ─────────────────────────────
       INIT ON LOAD
    ───────────────────────────── */

    document.addEventListener("DOMContentLoaded", () => {
        initUserState();
    });

    /* ─────────────────────────────
       Scroll-reveal
    ───────────────────────────── */

    const revealEls = document.querySelectorAll('[data-reveal]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const el = entry.target;
                const delay = parseInt(el.dataset.revealDelay || '0', 10);

                setTimeout(() => el.classList.add('is-visible'), delay);
                observer.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    /* ─────────────────────────────
       Sticky header shadow
    ───────────────────────────── */

    const header = document.querySelector('.header');

    if (header) {
        const onScroll = () => {
            header.style.boxShadow = window.scrollY > 4
                ? '0 2px 16px rgba(0,0,0,0.18)'
                : 'none';
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ─────────────────────────────
       Buttons ripple
    ───────────────────────────── */

    document.querySelectorAll('.btn--primary').forEach((btn) => {
        btn.addEventListener('click', function (e) {

            const ripple = document.createElement('span');
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.6;

            ripple.style.cssText = `
                position:absolute;
                border-radius:50%;
                width:${size}px;
                height:${size}px;
                left:${e.clientX - rect.left - size / 2}px;
                top:${e.clientY - rect.top - size / 2}px;
                background:rgba(255,255,255,0.22);
                pointer-events:none;
                transform:scale(0);
                animation:ripple-anim 0.48s ease-out forwards;
            `;

            if (!document.getElementById('ripple-style')) {
                const style = document.createElement('style');
                style.id = 'ripple-style';
                style.textContent = `
                    @keyframes ripple-anim {
                        to { transform: scale(1); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);

            setTimeout(() => ripple.remove(), 500);
        });
    });

    /* ─────────────────────────────
       Smooth scroll
    ───────────────────────────── */

    document.querySelectorAll('.btn--ghost').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = document.querySelector('.trust-bar');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

})();