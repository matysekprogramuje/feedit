/* design.js – Feed It interactions */
(function () {
    'use strict';

    /* ── Scroll-reveal ─────────────────────────────── */
    const revealEls = document.querySelectorAll('[data-reveal]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const delay = parseInt(el.dataset.revealDelay || '0', 10);
                    setTimeout(() => el.classList.add('is-visible'), delay);
                    observer.unobserve(el);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        // Fallback: show everything immediately
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    /* ── Sticky header shadow ──────────────────────── */
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

    /* ── Primary button ripple ─────────────────────── */
    document.querySelectorAll('.btn--primary').forEach((btn) => {
        btn.addEventListener('click', function (e) {
            // Skip ripple if we're navigating away immediately
            const ripple = document.createElement('span');
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.6;
            ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        background: rgba(255,255,255,0.22);
        pointer-events: none;
        transform: scale(0);
        animation: ripple-anim 0.48s ease-out forwards;
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


    /* ── "Jak to funguje?" smooth scroll placeholder ── */
    document.querySelectorAll('.btn--ghost').forEach((btn) => {
        btn.addEventListener('click', () => {
            // Placeholder: scroll to first section below hero, or show modal
            const target = document.querySelector('.trust-bar');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

})();