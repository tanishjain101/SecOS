document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 40,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": ["#06b6d4", "#8b5cf6"]
                },
                "shape": {
                    "type": "circle",
                },
                "opacity": {
                    "value": 0.3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.1,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1.5,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.3
                        }
                    },
                    "push": {
                        "particles_nb": 3
                    }
                }
            },
            "retina_detect": true
        });
    }

    // 2. Terminal Typing Animation
    const texts = [
        "> Securing system perimeter...",
        "> Initializing firewall rules...",
        "> Enforcing least privilege...",
        "> Scanning for vulnerabilities...",
        "> System integrity verified.",
    ];
    
    let count = 0;
    let index = 0;
    let currentText = "";
    let letter = "";
    let isDeleting = false;
    let typingSpeed = 100;

    const typingElement = document.getElementById('typing-text');

    function typeCode() {
        if (!typingElement) return;

        if (count === texts.length) {
            count = 0;
        }
        
        currentText = texts[count];

        if (isDeleting) {
            letter = currentText.slice(0, --index);
            typingSpeed = 50;
        } else {
            letter = currentText.slice(0, ++index);
            typingSpeed = 100;
        }

        typingElement.innerHTML = letter + `<span style="animation: blink 1s infinite;">_</span>`;

        if (!isDeleting && letter.length === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end of sentence
        } else if (isDeleting && letter.length === 0) {
            isDeleting = false;
            count++;
            typingSpeed = 500; // Pause before typing new sentence
        }

        setTimeout(typeCode, typingSpeed);
    }

    setTimeout(typeCode, 1000);

    // Add blink keyframe to document dynamically for caret
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // 3. Scroll Reveal Animation
    function reveal() {
        var reveals = document.querySelectorAll(".reveal");
        
        for (var i = 0; i < reveals.length; i++) {
            var windowHeight = window.innerHeight;
            var elementTop = reveals[i].getBoundingClientRect().top;
            var elementVisible = 100; // when to trigger reveal
            
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add("active");
            }
        }
    }

    window.addEventListener("scroll", reveal);
    reveal(); // Trigger on load

    // 4. Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Mock Backend Integration (LocalStorage fallback)
    const serverSelect = document.getElementById('server-select');
    const addServerBtn = document.getElementById('add-server-btn');
    const taskToggles = document.querySelectorAll('.task-toggle');

    // Initialize local storage if empty
    if (!localStorage.getItem('secos_servers')) {
        localStorage.setItem('secos_servers', JSON.stringify([{ id: '1', name: 'Local Environment' }]));
    }
    if (!localStorage.getItem('secos_progress')) {
        localStorage.setItem('secos_progress', JSON.stringify({ '1': {} }));
    }

    // Fetch and populate servers dropdown
    async function loadServers() {
        const servers = JSON.parse(localStorage.getItem('secos_servers')) || [];
        serverSelect.innerHTML = '';
        
        if (servers.length === 0) {
            serverSelect.innerHTML = '<option value="" disabled selected>No servers found</option>';
            return;
        }

        servers.forEach((s) => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            serverSelect.appendChild(opt);
        });

        // Load progress for the first server by default
        if (serverSelect.options.length > 0) {
            serverSelect.value = servers[0].id;
            loadProgress(servers[0].id);
        }
    }

    // Fetch progress for selected server
    async function loadProgress(serverId) {
        if (!serverId) return;
        const allProgress = JSON.parse(localStorage.getItem('secos_progress')) || {};
        const serverProgress = allProgress[serverId] || {};

        // Reset UI first
        document.querySelectorAll('.card').forEach(card => card.classList.remove('completed'));
        taskToggles.forEach(toggle => toggle.checked = false);

        // Apply progress
        Object.keys(serverProgress).forEach(taskId => {
            if (serverProgress[taskId]) {
                const card = document.querySelector(`.card[data-task-id="${taskId}"]`);
                if (card) {
                    const checkbox = card.querySelector('.task-toggle');
                    checkbox.checked = true;
                    card.classList.add('completed');
                }
            }
        });
    }

    // Handle server selection change
    if (serverSelect) {
        serverSelect.addEventListener('change', (e) => {
            loadProgress(e.target.value);
        });
    }

    // Handle new server creation
    if (addServerBtn) {
        addServerBtn.addEventListener('click', async () => {
            const name = prompt("Enter new server name:");
            if (!name) return;

            const servers = JSON.parse(localStorage.getItem('secos_servers')) || [];
            
            if (servers.find(s => s.name.toLowerCase() === name.toLowerCase())) {
                alert('Server name already exists');
                return;
            }

            const newId = Date.now().toString();
            servers.push({ id: newId, name });
            localStorage.setItem('secos_servers', JSON.stringify(servers));

            const allProgress = JSON.parse(localStorage.getItem('secos_progress')) || {};
            allProgress[newId] = {};
            localStorage.setItem('secos_progress', JSON.stringify(allProgress));

            await loadServers();
            serverSelect.value = newId;
            loadProgress(newId);
        });
    }

    // Handle task toggle clicks
    taskToggles.forEach(toggle => {
        toggle.addEventListener('change', async function() {
            const serverId = serverSelect.value;
            if (!serverId) {
                alert("Please select a server first.");
                this.checked = !this.checked; // Revert visually
                return;
            }

            const card = this.closest('.card');
            const taskId = card.getAttribute('data-task-id');
            const isCompleted = this.checked;

            // Optimistic UI update
            if (isCompleted) {
                card.classList.add('completed');
            } else {
                card.classList.remove('completed');
            }

            // Save to localStorage
            const allProgress = JSON.parse(localStorage.getItem('secos_progress')) || {};
            if (!allProgress[serverId]) allProgress[serverId] = {};
            allProgress[serverId][taskId] = isCompleted;
            localStorage.setItem('secos_progress', JSON.stringify(allProgress));
        });
    });

    // 6. Expandable Guideline Cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Ignore if clicking the checkbox
            if (e.target.closest('.custom-checkbox')) return;
            this.classList.toggle('expanded');
        });
    });

    // Initialize
    loadServers();
});
