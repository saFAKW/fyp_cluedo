        // Sample data for cards (max 5 items)
        const cardsData = [
            "card",
            "card",
            "card",
            "card",
            "card"
        ];

        // Generate Findings items (12 items with checkboxes)
        function generateFindings() {
            const findingsContent = document.getElementById('findingsContent');
            findingsContent.innerHTML = '';
            
            for (let i = 1; i <= 12; i++) {
                const listItem = document.createElement('div');
                listItem.className = 'list-item';
                
                listItem.innerHTML = `
                    <div class="checkbox-container">
                        <input type="checkbox" id="finding-${i}" onchange="handleCheckbox(${i})">
                        <label for="finding-${i}" class="checkbox-label">${i}</label>
                    </div>
                `;
                
                findingsContent.appendChild(listItem);
            }
        }

        // Generate Cards items
        function generateCards() {
            const cardsContent = document.getElementById('cardsContent');
            cardsContent.innerHTML = '';
            
            cardsData.forEach((card, index) => {
                const cardItem = document.createElement('div');
                cardItem.className = 'card-item';
                cardItem.textContent = card;
                cardsContent.appendChild(cardItem);
            });
        }

        // Toggle panel function
        function togglePanel(panel) {
            const panelLeft = document.getElementById('panelLeft');
            const panelRight = document.getElementById('panelRight');
            const panelBottom = document.getElementById('panelBottom');
            
            if (panel === 'left') {
                panelLeft.classList.toggle('active');
            } else if (panel === 'right') {
                panelRight.classList.toggle('active');
            } else if (panel === 'bottom') {
                panelBottom.classList.toggle('active');
            }
        }

        // Handle checkbox changes
        function handleCheckbox(number) {
            const checkbox = document.getElementById(`finding-${number}`);
            console.log(`Finding ${number} is now ${checkbox.checked ? 'checked' : 'unchecked'}`);
        }

        // Initialize the panels
        generateFindings();
        generateCards();