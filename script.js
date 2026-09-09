(function() {
        // Login
        const loginScreen = document.getElementById('loginScreen');
        const protectedContent = document.getElementById('protectedContent');
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('usernameInput');
        const passwordInput = document.getElementById('passwordInput');
        const passwordToggle = document.getElementById('passwordToggle');
        const loginButton = document.getElementById('loginButton');
        const loginError = document.getElementById('loginError');

        async function authenticate(username, password) {
            const response = await fetch('src/users/users.json', {
                method: 'GET',
                cache: 'no-store',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('users.json tidak dapat diakses.');
            }

            const users = await response.json();
            const userList = Array.isArray(users) ? users : (users.users || []);

            return userList.some(user =>
                user &&
                user.username === username &&
                user.password === password
            );
        }

        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            passwordToggle.textContent = isPassword ? '🙈' : '👁️';
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.classList.remove('show');

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                loginError.textContent = 'Username dan password wajib diisi.';
                loginError.classList.add('show');
                return;
            }

            loginButton.classList.add('loading');
            loginButton.disabled = true;

            try {
                const valid = await authenticate(username, password);

                if (!valid) {
                    loginError.textContent = 'Username atau password salah.';
                    loginError.classList.add('show');
                    passwordInput.focus();
                    return;
                }

                loginScreen.classList.add('hidden');
                protectedContent.classList.add('authenticated');
                emailInput.focus();
            } catch (error) {
                console.error('Error login:', error);
                loginError.textContent = 'Gagal membaca users.json. Pastikan file tersedia.';
                loginError.classList.add('show');
            } finally {
                loginButton.classList.remove('loading');
                loginButton.disabled = false;
            }
        });

        // DOM Elements
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        const toast = document.getElementById('toast');

        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        const emailInput = document.getElementById('emailInput');
        const magicLinkInput = document.getElementById('magicLinkInput');
        const btnMagicLink = document.getElementById('btnMagicLink');
        const btnApplyPremium = document.getElementById('btnApplyPremium');
        const btnBackStep1 = document.getElementById('btnBackStep1');

        const dot1 = document.getElementById('dot1');
        const dot2 = document.getElementById('dot2');
        const dot3 = document.getElementById('dot3');
        const line1 = document.getElementById('line1');
        const line2 = document.getElementById('line2');

        const successModal = document.getElementById('successModal');
        const closeModalBtn = document.getElementById('closeModalBtn');

        // State
        let userEmail = '';
        let isDarkMode = true;
        let toastTimeout = null;

        // Theme Toggle
        function toggleTheme() {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                body.setAttribute('data-theme', 'dark');
                themeIcon.textContent = '🌙';
                themeText.textContent = 'Dark';
            } else {
                body.setAttribute('data-theme', 'light');
                themeIcon.textContent = '☀️';
                themeText.textContent = 'Light';
            }
        }
        themeToggle.addEventListener('click', toggleTheme);

        // Set default dark
        body.setAttribute('data-theme', 'dark');

        // Toast function
        function showToast(message, type = 'error') {
            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }
            toast.textContent = message;
            toast.className = 'toast';
            if (type === 'success') {
                toast.classList.add('success');
            }
            // Force reflow
            void toast.offsetWidth;
            toast.classList.add('show');
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        }

        // Loading state
        function setLoading(button, isLoading) {
            if (isLoading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }

        // Update step indicators
        function updateSteps(step) {
            if (step === 1) {
                dot1.className = 'step-dot active';
                dot2.className = 'step-dot';
                dot3.className = 'step-dot';
                line1.className = 'step-line';
                line2.className = 'step-line';
                step1.classList.add('active');
                step2.classList.remove('active');
            } else if (step === 2) {
                dot1.className = 'step-dot done';
                dot2.className = 'step-dot active';
                dot3.className = 'step-dot';
                line1.className = 'step-line done';
                line2.className = 'step-line';
                step1.classList.remove('active');
                step2.classList.add('active');
            } else if (step === 3) {
                dot1.className = 'step-dot done';
                dot2.className = 'step-dot done';
                dot3.className = 'step-dot done';
                line1.className = 'step-line done';
                line2.className = 'step-line done';
            }
        }

        // Initial
        updateSteps(1);

        // Email validation
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // Step 1: Request Magic Link
        btnMagicLink.addEventListener('click', async () => {
            const email = emailInput.value.trim();
            if (!email) {
                showToast('⚠️ Masukkan email terlebih dahulu!', 'error');
                emailInput.focus();
                return;
            }
            if (!isValidEmail(email)) {
                showToast('⚠️ Format email tidak valid!', 'error');
                emailInput.focus();
                return;
            }

            userEmail = email;
            setLoading(btnMagicLink, true);

            const apiUrl = `https://api.kyzznekoo.my.id/api/alightmotion/v3/magic-link?email=${encodeURIComponent(email)}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                // Coba parse JSON untuk memastikan valid
                const data = await response.json();

                // Sukses - tidak menampilkan JSON
                updateSteps(2);
                magicLinkInput.value = '';
                magicLinkInput.focus();
                showToast('✅ Magic link terkirim! Cek email kamu.', 'success');
            } catch (error) {
                console.error('Error magic link:', error);
                showToast('❌ Gagal mengirim magic link. Coba lagi ya!', 'error');
            } finally {
                setLoading(btnMagicLink, false);
            }
        });

        // Step 2: Apply Premium
        btnApplyPremium.addEventListener('click', async () => {
            const magicLink = magicLinkInput.value.trim();
            if (!magicLink) {
                showToast('⚠️ Masukkan magic link terlebih dahulu!', 'error');
                magicLinkInput.focus();
                return;
            }
            if (!userEmail) {
                showToast('⚠️ Email tidak ditemukan. Ulangi dari awal!', 'error');
                updateSteps(1);
                return;
            }

            setLoading(btnApplyPremium, true);

            const apiUrl =
                `https://api.kyzznekoo.my.id/api/alightmotion/v3/applyPremium?email=${encodeURIComponent(userEmail)}&link=${encodeURIComponent(magicLink)}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                // Coba parse JSON untuk memastikan valid
                const data = await response.json();

                // Sukses - tampilkan popup
                updateSteps(3);
                successModal.classList.add('show');
                showToast('🎉 Premium berhasil diaktifkan!', 'success');
            } catch (error) {
                console.error('Error apply premium:', error);
                showToast('❌ Gagal mengaktifkan premium. Periksa magic link kamu!', 'error');
            } finally {
                setLoading(btnApplyPremium, false);
            }
        });

        // Back to step 1
        btnBackStep1.addEventListener('click', () => {
            updateSteps(1);
            emailInput.focus();
        });

        // Enter key support
        emailInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnMagicLink.click();
            }
        });
        magicLinkInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnApplyPremium.click();
            }
        });

        // Close modal
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('show');
            // Reset ke step 1 setelah sukses
            setTimeout(() => {
                updateSteps(1);
                emailInput.value = '';
                magicLinkInput.value = '';
                userEmail = '';
            }, 400);
        });

        // Close modal on overlay click
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('show');
                setTimeout(() => {
                    updateSteps(1);
                    emailInput.value = '';
                    magicLinkInput.value = '';
                    userEmail = '';
                }, 400);
            }
        });

        // Auto focus email on load
        window.addEventListener('load', () => {
            usernameInput.focus();
        });

        console.log('%c🎬 Alight Motion Premium Generator',
            'font-size:20px; font-weight:bold; color:#3b82f6; text-shadow: 0 0 15px rgba(59,130,246,0.6);');
        console.log('%c👤 Creator: HANZZ', 'font-size:14px; color:#8b5cf6;');
        console.log('%c🎵 TikTok: @hanzzxbug', 'font-size:14px; color:#ec4899;');
        console.log('%c💙 Nikmati premium nya!', 'font-size:12px; color:#22c55e;');
    })();
