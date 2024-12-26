const OPENAI_KEY = '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'; // Replace with your actual OpenAI key
        let currentCreature = null;
        let selectedCreatures = [];
        let isInsectMode = false;
        let isGenerating = false;

        document.addEventListener('DOMContentLoaded', function () {
            updateSavedCreaturesList();
            const savedMode = localStorage.getItem('isInsectMode') === 'true';
            document.getElementById('modeToggle').checked = savedMode;
            isInsectMode = savedMode;
            updateMode();
        });

        function updateMode() {
            if (isGenerating) {
                const modeToggle = document.getElementById('modeToggle');
                modeToggle.checked = !modeToggle.checked;
                showPopup('Please wait for creature generation to complete before switching modes');
                return;
            }

            isInsectMode = document.getElementById('modeToggle').checked;
            localStorage.setItem('isInsectMode', isInsectMode);
            const creatureDescription = document.getElementById('creatureDescription');
            const generateButton = document.getElementById('generateButton');
            const heading = document.querySelector('h1');
            const descriptionText = document.getElementById('description-text');
            const creatureInfo = document.getElementById('creatureInfo');
            const saveButton = document.getElementById('saveButton');
            creatureInfo.style.display = 'none';
            saveButton.style.display = 'none';
            creatureDescription.value = '';
            currentCreature = null;
            if (isInsectMode) {
                creatureDescription.placeholder = "Describe your dream insect... (e.g., 'A shimmering dragonfly that speaks in whispers')";
                generateButton.innerHTML = "&#x1F41E; Generate Insect Description";
                heading.innerHTML = "&#x1F41E; AI Insect Creator";
                descriptionText.innerHTML = "Describe the kind of insect you'd like to create, and the AI will describe it in detail!";
                updateColorScheme(true);
            } else {
                creatureDescription.placeholder = "Describe your dream animal... (e.g., 'A rainbow-colored dolphin that can sing melodious tunes')";
                generateButton.innerHTML = "&#x1F981; Generate Creature Description";
                heading.innerHTML = "&#x1F98A; AI Animal Creator";
                descriptionText.innerHTML = "Describe the kind of animal you'd like to create, and the AI will describe it in detail!";
                updateColorScheme(false);
            }
            selectedCreatures = [];
            updateSavedCreaturesList();
        }

        function updateColorScheme(isInsectMode) {
            const root = document.documentElement;
            if (isInsectMode) {
                root.style.setProperty('--primary-animal', '#ff7597');
                root.style.setProperty('--secondary-animal', '#ff7597');
            } else {
                root.style.setProperty('--primary-animal', '#BB86FC');
                root.style.setProperty('--secondary-animal', '#3700B3');
            }
        }

        async function generateCreature() {
            const description = document.getElementById('creatureDescription').value;
            const isInsectMode = document.getElementById('modeToggle').checked;
            const loading = document.getElementById('loading');
            const creatureInfo = document.getElementById('creatureInfo');
            const saveButton = document.getElementById('saveButton');
        
            if (!description.trim()) {
                alert('Please enter a description first!');
                return;
            }
        
            isGenerating = true;
            loading.style.display = 'block';
            loading.innerHTML = `Imagining your creature... ${isInsectMode ? '🐞' : '🦁'}`;
            saveButton.style.display = 'none';
            creatureInfo.style.display = 'none';
        
            try {
                const response = await fetch('/api/generateCreature', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description, isInsectMode })
                });
        
                const data = await response.json();
                if (data.error) throw new Error(data.error);
        
                currentCreature = data;
                displayCreatureInfo(data, creatureInfo);
                saveButton.style.display = 'inline-block';
            } catch (error) {
                console.error('Error:', error);
                creatureInfo.style.display = 'block';
                creatureInfo.innerHTML = `<div class="error-message">
                    Failed to generate ${isInsectMode ? 'insect' : 'animal'} description. Please try again.
                    <br><small>Error: ${error.message}</small>
                </div>`;
            } finally {
                isGenerating = false;
                loading.style.display = 'none';
            }
        }        

        async function combineCreatures() {
            if (selectedCreatures.length !== 2) {
                showPopup('Please select exactly two creatures to combine!');
                return;
            }
        
            const loading = document.getElementById('loading');
            const creatureInfo = document.getElementById('creatureInfo');
            const saveButton = document.getElementById('saveButton');
        
            loading.style.display = 'block';
            creatureInfo.style.display = 'none';
            saveButton.style.display = 'none';
        
            try {
                const response = await fetch('/api/combineCreatures', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        creature1: selectedCreatures[0],
                        creature2: selectedCreatures[1],
                        isInsectMode: isInsectMode
                    })
                });
        
                const data = await response.json();
                if (data.error) throw new Error(data.error);
        
                currentCreature = data;
                displayCreatureInfo(data, creatureInfo);
                saveButton.style.display = 'inline-block';
                selectedCreatures = [];
                document.getElementById('combineSection').style.display = 'none';
                showPopup('Creatures combined successfully!');
                updateSavedCreaturesList();
            } catch (error) {
                console.error('Error:', error);
                creatureInfo.style.display = 'block';
                creatureInfo.innerHTML = `<div class="error-message">
                    Failed to combine creatures. Please try again.
                    <br><small>Error: ${error.message}</small>
                </div>`;
            } finally {
                loading.style.display = 'none';
            }
        }        

        function displayCreatureInfo(creature, container) {
            if (!creature || !container) return;
            container.className = `animal-info ${isInsectMode ? 'insect-mode' : ''}`;

            const processText = text => {
                return text.replace(/(magnificent|stunning|extraordinary|remarkable|powerful|telepathic|transparent|translucent|iridescent|bioluminescent|crystalline|metamorphic|camouflaged|amphibious|subterranean|nocturnal|diurnal|aquatic|terrestrial|arboreal|aerial|predatory|symbiotic|hibernates|migrates|ambushes|forages|hunts|communicates|navigates|defends|adapts|senses|emits|absorbs|generates|manipulates|transforms)/gi, '<span class="highlight-primary">$1</span>');
            };

            container.style.display = 'block';
            container.innerHTML = `
                <h2 class="creature-name">${creature.name}</h2>
                <p class="scientific-name">${creature.scientificName}</p>
                
                <div class="info-section">
                    <span class="info-label">Description:</span>
                    ${processText(creature.description)}
                </div>

                ${isInsectMode ? 
                    `<div class="info-section">
                        <span class="info-label">Quirks:</span>
                        ${processText(creature.quirks)}
                    </div>` : 
                    `<div class="info-section">
                        <span class="info-label">Natural Habitat:</span>
                        ${processText(creature.habitat)}
                    </div>`
                }

                <div class="info-section">
                    <span class="info-label">Behavior:</span>
                    ${processText(creature.behavior)}
                </div>

                <div class="info-section">
                    <span class="info-label">Abilities:</span>
                    ${processText(creature.abilities)}
                </div>

                <div class="info-section">
                    <span class="info-label">Special Properties:</span>
                    ${processText(creature.specialProperties)}
                </div>
            `;
        }

        function saveCreature() {
            if (!currentCreature) return;
            
            const storageKey = isInsectMode ? 'savedInsects' : 'savedAnimals';
            let savedCreatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const existingIndex = savedCreatures.findIndex(creature => creature.name === currentCreature.name);
            if (existingIndex !== -1) {
                savedCreatures[existingIndex] = currentCreature;
                showPopup("Creature updated successfully!");
            } else {
                savedCreatures.push(currentCreature);
                showPopup("Creature saved successfully!");
            }
            
            localStorage.setItem(storageKey, JSON.stringify(savedCreatures));
            updateSavedCreaturesList();
        }

        function updateSavedCreaturesList() {
            const savedCreaturesList = document.getElementById('savedCreaturesList');
            const searchTerm = document.getElementById('searchCreatures')?.value || '';
            const filteredCreatures = searchCreatures(searchTerm);
            const savedCreaturesHeading = document.querySelector('.saved-creatures h3');
            savedCreaturesHeading.textContent = `Your Saved ${isInsectMode ? 'Insects' : 'Animals'}`;
            if (filteredCreatures.length === 0) {
                savedCreaturesList.innerHTML = '<div class="no-results">No ' + (isInsectMode ? 'insects' : 'animals') + ' found matching your search</div>';
                return;
            }
            const processText = text => {
                return text.replace(/(magnificent|stunning|extraordinary|remarkable|powerful|telepathic|transparent|translucent|iridescent|bioluminescent|crystalline|metamorphic|camouflaged|amphibious|subterranean|nocturnal|diurnal|aquatic|terrestrial|arboreal|aerial|predatory|symbiotic|hibernates|migrates|ambushes|forages|hunts|communicates|navigates|defends|adapts|senses|emits|absorbs|generates|manipulates|transforms)/gi, '<span class="highlight-primary">$1</span>');
            };
            savedCreaturesList.innerHTML = filteredCreatures.map((creature, index) => `
                <div class="saved-creature-item ${selectedCreatures.find(c => c.name === creature.name) ? 'selected-for-combine' : ''} ${isInsectMode ? 'insect-mode' : ''}" id="creature-${index}">
                    <div class="header">
                        <h4 class="creature-name" onclick="toggleCreatureSelection(${index})">${creature.name}</h4>
                        <button class="expand-button" onclick="toggleCreatureDetails(event, ${index})">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <p class="scientific-name">${creature.scientificName}</p>
                    <div class="details">
                        <div class="info-section">
                            <span class="info-label">Description:</span>
                            ${processText(creature.description)}
                        </div>
                        ${isInsectMode ? `<div class="info-section">
                                <span class="info-label">Quirks:</span>
                                ${processText(creature.quirks)}
                            </div>` : `<div class="info-section">
                                <span class="info-label">Natural Habitat:</span>
                                ${processText(creature.habitat)}
                            </div>`}
                        <div class="info-section">
                            <span class="info-label">Behavior:</span>
                            ${processText(creature.behavior)}
                        </div>
                        <div class="info-section">
                            <span class="info-label">Abilities:</span>
                            ${processText(creature.abilities)}
                        </div>
                        <div class="info-section">
                            <span class="info-label">Special Properties:</span>
                            ${processText(creature.specialProperties)}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function toggleCreatureDetails(event, index) {
            event.stopPropagation();
            const creatureElement = document.getElementById(`creature-${index}`);
            creatureElement.classList.toggle('expanded');
        }

        function clearSavedCreatures() {
            if (confirm(`Are you sure you want to clear all saved ${isInsectMode ? 'insects' : 'animals'}?`)) {
                const storageKey = isInsectMode ? 'savedInsects' : 'savedAnimals';
                localStorage.removeItem(storageKey);
                selectedCreatures = [];
                document.getElementById('combineSection').style.display = 'none';
                updateSavedCreaturesList();
            }
        }

        function showPopup(message) {
            const popup = document.getElementById('popup');
            popup.textContent = message;
            popup.classList.add('show');
            setTimeout(() => {
                popup.classList.remove('show');
            }, 3000);
        }

        function searchCreatures(searchTerm) {
            const storageKey = isInsectMode ? 'savedInsects' : 'savedAnimals';
            const savedCreatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (!searchTerm) return savedCreatures;
            searchTerm = searchTerm.toLowerCase();
            return savedCreatures.filter(creature => {
                const searchFields = [creature.name.toLowerCase(), creature.scientificName.toLowerCase(), creature.description.toLowerCase(), creature.specialProperties.toLowerCase(), isInsectMode ? creature.quirks?.toLowerCase() || '' : creature.habitat?.toLowerCase() || '', creature.behavior.toLowerCase(), creature.abilities.toLowerCase()].join(' ');
                return searchTerm.split(' ').every(term => searchFields.includes(term));
            });
        }

        function toggleCreatureSelection(index) {
            const storageKey = isInsectMode ? 'savedInsects' : 'savedAnimals';
            const creature = JSON.parse(localStorage.getItem(storageKey))[index];
            const creatureElement = document.getElementById(`creature-${index}`);
            const existingIndex = selectedCreatures.findIndex(c => c.name === creature.name);
            if (existingIndex !== -1) {
                selectedCreatures.splice(existingIndex, 1);
                creatureElement.classList.remove('selected-for-combine');
            } else if (selectedCreatures.length < 2) {
                selectedCreatures.push(creature);
                creatureElement.classList.add('selected-for-combine');
            } else {
                showPopup("Please deselect a creature first!");
                return;
            }
            const combineSection = document.getElementById('combineSection');
            combineSection.style.display = selectedCreatures.length === 2 ? 'block' : 'none';
        }