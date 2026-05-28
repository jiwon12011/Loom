document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('waitlistForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            form.innerHTML = `
                <div style="text-align: center; padding: 24px;">
                    <div style="font-size: 28px; margin-bottom: 12px; color: #8B7EA8;">&#10003;</div>
                    <p style="font-size: 16px; color: #2D2A33; font-weight: 600;">등록 완료!</p>
                    <p style="font-size: 14px; color: #6B6574; margin-top: 8px;">출시 시 ${email}로 알려드리겠습니다.</p>
                </div>
            `;
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
            nav.style.boxShadow = '0 1px 8px rgba(45, 42, 51, 0.06)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });

    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', function() {
            const isOpen = navLinks.style.display === 'flex';
            navLinks.style.display = isOpen ? 'none' : 'flex';
            if (!isOpen) {
                navLinks.style.position = 'absolute';
                navLinks.style.top = '56px';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.flexDirection = 'column';
                navLinks.style.alignItems = 'center';
                navLinks.style.padding = '24px';
                navLinks.style.background = 'rgba(255, 255, 255, 0.97)';
                navLinks.style.backdropFilter = 'blur(20px)';
                navLinks.style.borderBottom = '1px solid #E8E4EE';
                navLinks.style.gap = '20px';
            }
        });
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .problem-card, .user-card, .step, .pricing-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    const searchText = document.querySelector('.mockup-search span');
    if (searchText) {
        const queries = [
            '감성적인 광고 문구...',
            '릴스 훅 아이디어...',
            '뷰티 브랜드 무드...',
            '마케팅 전략 메모...'
        ];
        let queryIndex = 0;

        setInterval(() => {
            queryIndex = (queryIndex + 1) % queries.length;
            searchText.style.opacity = '0';
            setTimeout(() => {
                searchText.textContent = queries[queryIndex];
                searchText.style.opacity = '1';
            }, 300);
        }, 3000);
    }
});
