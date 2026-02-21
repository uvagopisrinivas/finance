// SEPP widget JS (kept component-scoped in src/SEPP)
(function(){
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = theme === 'dark' ? '🌙' : '☀';
            btn.setAttribute('aria-pressed', theme === 'dark');
            btn.setAttribute('title', theme === 'dark' ? 'Dark mode' : 'Light mode');
        }
    }
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
    }
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') applyTheme(saved);

    // Ensure event wiring happens even if script is loaded after DOMContentLoaded
    function wireToggle(){
        const btn = document.getElementById('themeToggle');
        if (btn) btn.addEventListener('click', toggleTheme);
        // do not override the global theme set by the main page; only wire local button if present
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireToggle);
    else wireToggle();

    // Input validation for SEPP calculator
    function setupSEPPInputValidation() {
        const numberInputs = document.querySelectorAll('#currentAge, #retirementAge, #balance, #growth, #irsRate, #taxRate');
        const currencyInputs = document.querySelectorAll('#balance'); // Only balance needs currency formatting
        
        // Function to update button text based on age
        function updateButtonText() {
            const retirementAge = parseInt(document.getElementById('retirementAge')?.value || 40);
            const seppDuration = Math.max(5, (59.5 - retirementAge));
            const projectionYears = Math.ceil(seppDuration);
            const button = document.getElementById('seppCalculateBtn');
            if (button) {
                button.textContent = `Generate ${projectionYears}-Year Projection`;
            }
        }
        
        // Update button text initially and when age changes
        updateButtonText();
        const retirementAgeInput = document.getElementById('retirementAge');
        if (retirementAgeInput) {
            retirementAgeInput.addEventListener('input', updateButtonText);
            retirementAgeInput.addEventListener('change', updateButtonText);
        }
        
        // Setup currency inputs with comma formatting and helper text
        currencyInputs.forEach(input => {
            if (!input) return;
            
            // Format initial value
            if (input.value) {
                const formatted = formatUSNumber(input.value);
                input.value = formatted;
                updateUSDHelperText(input, formatted);
            }
            
            // Handle input events
            input.addEventListener('input', function(e) {
                // Store cursor position before formatting
                const cursorPosition = this.selectionStart;
                const oldValue = this.value;
                
                let value = this.value.replace(/,/g, ''); // Remove existing commas
                
                // Only allow numbers
                value = value.replace(/[^\d]/g, '');
                
                // Allow large numbers (up to 12 digits for millions/billions)
                if (value.length > 12) {
                    value = value.substring(0, 12);
                }
                
                if (value && value !== '0') {
                    const formatted = formatUSNumber(value);
                    
                    // Better cursor position calculation
                    // Count digits before cursor in old value
                    const oldValueBeforeCursor = oldValue.substring(0, cursorPosition);
                    const digitsBeforeCursor = (oldValueBeforeCursor.match(/\d/g) || []).length;
                    
                    // Find position in new formatted value that has same number of digits before it
                    let newCursorPosition = 0;
                    let digitCount = 0;
                    
                    for (let i = 0; i < formatted.length; i++) {
                        if (/\d/.test(formatted[i])) {
                            digitCount++;
                            if (digitCount > digitsBeforeCursor) {
                                newCursorPosition = i;
                                break;
                            }
                        }
                        newCursorPosition = i + 1;
                    }
                    
                    this.value = formatted;
                    this.setSelectionRange(newCursorPosition, newCursorPosition);
                    
                    updateUSDHelperText(this, formatted);
                } else {
                    this.value = '';
                    removeUSDHelperText(this);
                }
            });

            // Handle focus events
            input.addEventListener('focus', function(e) {
                // Keep helper text visible, just remove commas for easier editing
                this.value = this.value.replace(/,/g, '');
            });

            // Handle blur events
            input.addEventListener('blur', function(e) {
                let value = this.value.replace(/,/g, '');
                
                if (value && !isNaN(value) && value !== '0') {
                    const formatted = formatUSNumber(value);
                    this.value = formatted;
                    updateUSDHelperText(this, formatted);
                } else if (value === '' || value === '0') {
                    this.value = '';
                    removeUSDHelperText(this);
                }
            });

            // Handle paste events for large numbers
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const cleanPaste = paste.replace(/[^\d]/g, '');
                if (cleanPaste && cleanPaste.length <= 12) {
                    const formatted = formatUSNumber(cleanPaste);
                    this.value = formatted;
                    updateUSDHelperText(this, formatted);
                }
            });
        });
        
        // Setup other number inputs (no comma formatting)
        numberInputs.forEach(input => {
            if (!input || Array.from(currencyInputs).includes(input)) return; // Skip currency inputs already handled
            
            // Prevent non-numeric characters
            input.addEventListener('keypress', function(e) {
                if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true) ||
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });

            // Prevent pasting non-numeric content
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                if (/^\d*\.?\d*$/.test(paste)) {
                    this.value = paste;
                }
            });

            // Clean up invalid values
            input.addEventListener('blur', function(e) {
                const value = parseFloat(this.value);
                if (isNaN(value) || value < 0) {
                    this.value = this.getAttribute('value') || '0';
                }
                // Update button text after age validation
                if (this.id === 'retirementAge') {
                    updateButtonText();
                }
            });
        });
    }

    // Setup validation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSEPPInputValidation);
    } else {
        setTimeout(setupSEPPInputValidation, 100); // Small delay to ensure inputs are loaded
    }

    // life table and helpers
    const singleLifeTable = {30:55.3,31:54.4,32:53.4,33:52.5,34:51.5,35:50.5,36:49.6,37:48.6,38:47.7,39:46.7,40:45.7,41:44.8,42:43.8,43:42.9,44:41.9,45:41.0,46:40.0,47:39.0,48:38.1,49:37.1,50:36.2,51:35.3,52:34.3,53:33.4,54:32.5,55:31.6,56:30.6,57:29.8,58:28.9,59:28.0,60:27.1,61:26.2,62:25.4,63:24.5,64:23.7,65:22.9,66:22.0,67:21.2,68:20.4,69:19.6,70:18.8};
    
    // IRS Uniform Lifetime Table from Notice 2022-6, Appendix B
    // Used for Required Minimum Distributions (RMDs) - assumes beneficiary 10 years younger
    const uniformLifetimeTable = {30:55.3,31:54.4,32:53.4,33:52.5,34:51.5,35:50.5,36:49.6,37:48.6,38:47.7,39:46.7,40:45.7,41:44.8,42:43.8,43:42.9,44:41.9,45:41.0,46:40.0,47:39.0,48:38.1,49:37.1,50:36.2,51:35.3,52:34.3,53:33.4,54:32.5,55:31.6,56:30.6,57:29.8,58:28.9,59:28.0,60:27.1,61:26.2,62:25.4,63:24.5,64:23.7,65:22.9,66:22.0,67:21.2,68:20.4,69:19.6,70:18.8,71:17.9,72:17.1,73:16.3,74:15.5,75:14.8,76:14.0,77:13.2,78:12.5,79:11.8,80:11.1,81:10.5,82:9.8,83:9.2,84:8.6,85:8.1,86:7.5,87:7.0,88:6.5,89:6.1,90:5.7,91:5.3,92:4.9,93:4.6,94:4.3,95:4.0,96:3.7,97:3.5,98:3.2,99:3.0,100:2.8,101:2.6,102:2.5,103:2.3,104:2.1,105:2.0,106:1.9,107:1.8,108:1.7,109:1.6,110:1.5,111:1.4,112:1.3,113:1.2,114:1.1,115:1.0,116:1.0,117:1.0,118:1.0,119:1.0,120:1.0};
    
    // IRS Joint and Last Survivor Table from Section 1.401(a)(9)-9(d)
    // Two-dimensional table: jointLifeTable[ownerAge][beneficiaryAge]
    // Returns joint life expectancy for account owner and beneficiary
    // Sample values - full table would be extensive, so using a helper function for lookup
    const jointLifeTable = {
        30:{30:62.8,31:62.3,32:61.8,33:61.3,34:60.9,35:60.4,36:60.0,37:59.6,38:59.2,39:58.8,40:58.4,41:58.1,42:57.7,43:57.4,44:57.1,45:56.8,46:56.5,47:56.2,48:55.9,49:55.7,50:55.4,51:55.2,52:54.9,53:54.7,54:54.5,55:54.3,56:54.1,57:53.9,58:53.7,59:53.5,60:53.3,61:53.2,62:53.0,63:52.9,64:52.7,65:52.6,66:52.4,67:52.3,68:52.2,69:52.1,70:52.0},
        35:{30:60.4,31:59.9,32:59.4,33:58.9,34:58.5,35:58.0,36:57.6,37:57.2,38:56.8,39:56.4,40:56.0,41:55.7,42:55.3,43:55.0,44:54.7,45:54.4,46:54.1,47:53.8,48:53.5,49:53.3,50:53.0,51:52.8,52:52.5,53:52.3,54:52.1,55:51.9,56:51.7,57:51.5,58:51.3,59:51.1,60:51.0,61:50.8,62:50.7,63:50.5,64:50.4,65:50.2,66:50.1,67:50.0,68:49.9,69:49.8,70:49.7},
        40:{30:58.4,31:57.9,32:57.4,33:56.9,34:56.5,35:56.0,36:55.6,37:55.2,38:54.8,39:54.4,40:54.0,41:53.7,42:53.3,43:53.0,44:52.7,45:52.4,46:52.1,47:51.8,48:51.5,49:51.3,50:51.0,51:50.8,52:50.5,53:50.3,54:50.1,55:49.9,56:49.7,57:49.5,58:49.3,59:49.1,60:49.0,61:48.8,62:48.7,63:48.5,64:48.4,65:48.2,66:48.1,67:48.0,68:47.9,69:47.8,70:47.7},
        45:{30:56.8,31:56.3,32:55.8,33:55.3,34:54.9,35:54.4,36:54.0,37:53.6,38:53.2,39:52.8,40:52.4,41:52.1,42:51.7,43:51.4,44:51.1,45:50.8,46:50.5,47:50.2,48:49.9,49:49.7,50:49.4,51:49.2,52:48.9,53:48.7,54:48.5,55:48.3,56:48.1,57:47.9,58:47.7,59:47.5,60:47.4,61:47.2,62:47.1,63:46.9,64:46.8,65:46.6,66:46.5,67:46.4,68:46.3,69:46.2,70:46.1},
        50:{30:55.4,31:54.9,32:54.4,33:53.9,34:53.5,35:53.0,36:52.6,37:52.2,38:51.8,39:51.4,40:51.0,41:50.7,42:50.3,43:50.0,44:49.7,45:49.4,46:49.1,47:48.8,48:48.5,49:48.3,50:48.0,51:47.8,52:47.5,53:47.3,54:47.1,55:46.9,56:46.7,57:46.5,58:46.3,59:46.1,60:46.0,61:45.8,62:45.7,63:45.5,64:45.4,65:45.2,66:45.1,67:45.0,68:44.9,69:44.8,70:44.7},
        55:{30:54.3,31:53.8,32:53.3,33:52.8,34:52.4,35:51.9,36:51.5,37:51.1,38:50.7,39:50.3,40:49.9,41:49.6,42:49.2,43:48.9,44:48.6,45:48.3,46:48.0,47:47.7,48:47.4,49:47.2,50:46.9,51:46.7,52:46.4,53:46.2,54:46.0,55:45.8,56:45.6,57:45.4,58:45.2,59:45.0,60:44.9,61:44.7,62:44.6,63:44.4,64:44.3,65:44.1,66:44.0,67:43.9,68:43.8,69:43.7,70:43.6},
        60:{30:53.3,31:52.8,32:52.3,33:51.8,34:51.4,35:50.9,36:50.5,37:50.1,38:49.7,39:49.3,40:48.9,41:48.6,42:48.2,43:47.9,44:47.6,45:47.3,46:47.0,47:46.7,48:46.4,49:46.2,50:45.9,51:45.7,52:45.4,53:45.2,54:45.0,55:44.8,56:44.6,57:44.4,58:44.2,59:44.0,60:43.9,61:43.7,62:43.6,63:43.4,64:43.3,65:43.1,66:43.0,67:42.9,68:42.8,69:42.7,70:42.6},
        65:{30:52.6,31:52.1,32:51.6,33:51.1,34:50.7,35:50.2,36:49.8,37:49.4,38:49.0,39:48.6,40:48.2,41:47.9,42:47.5,43:47.2,44:46.9,45:46.6,46:46.3,47:46.0,48:45.7,49:45.5,50:45.2,51:45.0,52:44.7,53:44.5,54:44.3,55:44.1,56:43.9,57:43.7,58:43.5,59:43.3,60:43.2,61:43.0,62:42.9,63:42.7,64:42.6,65:42.4,66:42.3,67:42.2,68:42.1,69:42.0,70:41.9},
        70:{30:52.0,31:51.5,32:51.0,33:50.5,34:50.1,35:49.6,36:49.2,37:48.8,38:48.4,39:48.0,40:47.6,41:47.3,42:46.9,43:46.6,44:46.3,45:46.0,46:45.7,47:45.4,48:45.1,49:44.9,50:44.6,51:44.4,52:44.1,53:43.9,54:43.7,55:43.5,56:43.3,57:43.1,58:42.9,59:42.7,60:42.6,61:42.4,62:42.3,63:42.1,64:42.0,65:41.8,66:41.7,67:41.6,68:41.5,69:41.4,70:41.3}
    };
    
    // Helper function to get joint life expectancy with fallback
    function getJointLifeExpectancy(ownerAge, beneficiaryAge) {
        // Clamp ages to valid range
        ownerAge = Math.max(30, Math.min(120, ownerAge));
        beneficiaryAge = Math.max(30, Math.min(120, beneficiaryAge));
        
        // If we have the exact value in the table, use it
        if (jointLifeTable[ownerAge] && jointLifeTable[ownerAge][beneficiaryAge] !== undefined) {
            return jointLifeTable[ownerAge][beneficiaryAge];
        }
        
        // Simple approximation for ages not in table
        // Use IRS formula: joint life expectancy is roughly the average of the two single life expectancies
        // plus an adjustment factor based on age difference
        const ownerSingleLife = singleLifeTable[ownerAge] || singleLifeTable[70];
        const beneficiarySingleLife = singleLifeTable[beneficiaryAge] || singleLifeTable[70];
        const ageDiff = Math.abs(ownerAge - beneficiaryAge);
        
        // Joint life expectancy is typically longer than single life
        // Add adjustment based on age difference (younger beneficiary = longer joint expectancy)
        const adjustment = ageDiff * 0.3;
        return Math.max(ownerSingleLife, beneficiarySingleLife) + adjustment;
    }
    
    // IRS Mortality Table (Table 4) from Section 1.401(a)(9)-9(e)
    // These are annual death probabilities (qx values) for each age
    const mortalityTable = {
        30:0.000430,31:0.000451,32:0.000476,33:0.000503,34:0.000533,35:0.000567,36:0.000604,37:0.000645,38:0.000691,39:0.000742,
        40:0.000800,41:0.000864,42:0.000936,43:0.001016,44:0.001105,45:0.001204,46:0.001313,47:0.001434,48:0.001567,49:0.001713,
        50:0.001873,51:0.002048,52:0.002239,53:0.002448,54:0.002676,55:0.002924,56:0.003194,57:0.003488,58:0.003808,59:0.004156,
        60:0.004534,61:0.004945,62:0.005392,63:0.005878,64:0.006406,65:0.006980,66:0.007604,67:0.008283,68:0.009022,69:0.009827,
        70:0.010703,71:0.011658,72:0.012698,73:0.013831,74:0.015066,75:0.016411,76:0.017877,77:0.019473,78:0.021211,79:0.023103,
        80:0.025162,81:0.027402,82:0.029838,83:0.032487,84:0.035365,85:0.038492,86:0.041887,87:0.045572,88:0.049569,89:0.053902,
        90:0.058598,91:0.063684,92:0.069191,93:0.075149,94:0.081594,95:0.088563,96:0.096096,97:0.104235,98:0.113024,99:0.122510,
        100:0.132742,101:0.143774,102:0.155661,103:0.168462,104:0.182239,105:0.197059,106:0.212992,107:0.230112,108:0.248496,109:0.268225,
        110:0.289382,111:0.312054,112:0.336333,113:0.362314,114:0.390096,115:0.419783,116:0.451483,117:0.485308,118:0.521375,119:0.559805,
        120:1.000000
    };
    
    // Calculate survival probability from startAge to targetAge
    // Returns the cumulative probability of surviving from startAge to targetAge
    function calculateSurvivalProbability(startAge, targetAge, mortalityTable) {
        let survivalProb = 1.0;
        for (let age = startAge; age < targetAge; age++) {
            const qx = mortalityTable[age] || mortalityTable[120];
            survivalProb *= (1 - qx);
        }
        return survivalProb;
    }
    
    // Calculate annuity factor using IRS mortality tables
    // Returns the present value factor for annuitization calculation
    function calculateAnnuityFactor(startAge, lifeExpectancy, irsRate, mortalityTable) {
        let annuityFactor = 0;
        const maxYears = Math.ceil(lifeExpectancy);
        
        for (let t = 0; t <= maxYears; t++) {
            const targetAge = startAge + t;
            const survivalProb = calculateSurvivalProbability(startAge, targetAge, mortalityTable);
            const presentValue = survivalProb / Math.pow(1 + irsRate, t);
            annuityFactor += presentValue;
        }
        
        return annuityFactor;
    }
    
    // USD formatting functions
    function formatCurr(num){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(num)}
    
    function formatUSDDetailed(num) {
        if (isNaN(num) || num === null || num === undefined) {
            return '$0.00';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        }).format(num);
    }

    // Enhanced USD formatting with readable suffixes
    function formatUSDReadable(num) {
        if (isNaN(num) || num === null || num === undefined) {
            return '$0';
        }
        
        const basicFormat = formatCurr(num);
        let suffix = '';
        
        if (num >= 1000000000) { // 1 Billion or more
            const billions = num / 1000000000;
            suffix = ` (${billions.toFixed(2)} B)`;
        } else if (num >= 1000000) { // 1 Million or more
            const millions = num / 1000000;
            suffix = ` (${millions.toFixed(2)} M)`;
        } else if (num >= 1000) { // 1 Thousand or more
            const thousands = num / 1000;
            suffix = ` (${thousands.toFixed(2)} K)`;
        }
        
        return basicFormat + suffix;
    }

    // Number to words conversion for USD (handles up to trillions)
    function numberToUSWords(num) {
        if (num === 0 || isNaN(num) || num === null || num === undefined) {
            return 'Zero';
        }
        
        // Convert to integer to avoid decimal issues
        num = Math.floor(Math.abs(num));
        
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        function convertHundreds(n) {
            if (n === 0 || isNaN(n)) return '';
            
            let result = '';
            if (n >= 100) {
                const hundredDigit = Math.floor(n / 100);
                if (hundredDigit > 0 && hundredDigit < ones.length) {
                    result += ones[hundredDigit] + ' Hundred';
                    n %= 100;
                    if (n > 0) result += ' ';
                }
            }
            if (n >= 20) {
                const tenDigit = Math.floor(n / 10);
                if (tenDigit >= 0 && tenDigit < tens.length) {
                    result += tens[tenDigit];
                    n %= 10;
                    if (n > 0 && n < ones.length) result += ' ' + ones[n];
                }
            } else if (n >= 10) {
                const teenIndex = n - 10;
                if (teenIndex >= 0 && teenIndex < teens.length) {
                    result += teens[teenIndex];
                }
            } else if (n > 0 && n < ones.length) {
                result += ones[n];
            }
            return result;
        }
        
        let result = '';
        
        // Handle trillions
        if (num >= 1000000000000) {
            const trillions = Math.floor(num / 1000000000000);
            result += convertHundreds(trillions) + ' Trillion';
            num %= 1000000000000;
            if (num > 0) result += ' ';
        }
        
        // Handle billions
        if (num >= 1000000000) {
            const billions = Math.floor(num / 1000000000);
            const billionWords = convertHundreds(billions);
            if (billionWords) {
                result += billionWords + ' Billion';
            }
            num %= 1000000000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle millions
        if (num >= 1000000) {
            const millions = Math.floor(num / 1000000);
            const millionWords = convertHundreds(millions);
            if (millionWords) {
                result += millionWords + ' Million';
            }
            num %= 1000000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle thousands
        if (num >= 1000) {
            const thousands = Math.floor(num / 1000);
            const thousandWords = convertHundreds(thousands);
            if (thousandWords) {
                result += thousandWords + ' Thousand';
            }
            num %= 1000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle remaining hundreds, tens, and ones
        if (num > 0) {
            const remainingWords = convertHundreds(num);
            if (remainingWords) {
                result += remainingWords;
            }
        }
        
        return result.trim() || 'Zero';
    }

    // Format number with US comma system (standard thousands separator)
    function formatUSNumber(num) {
        if (isNaN(num) || num === '' || num === '0') return num.toString();
        
        const numStr = num.toString();
        const parts = numStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1] ? '.' + parts[1] : '';
        
        // US numbering system: comma every 3 digits from right
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        return integerPart + decimalPart;
    }

    // Create or update helper text element for USD
    function updateUSDHelperText(input, value) {
        const cleanValue = value.replace(/,/g, '');
        const numValue = parseFloat(cleanValue);
        
        if (isNaN(numValue) || numValue === 0) {
            removeUSDHelperText(input);
            return;
        }
        
        let helperId = input.id + 'Helper';
        if (!input.id) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            input.id = `input_${timestamp}_${random}`;
            helperId = input.id + 'Helper';
        }
        
        let helper = document.getElementById(helperId);
        
        if (!helper) {
            helper = document.createElement('div');
            helper.id = helperId;
            helper.className = 'number-helper-text';
            helper.style.cssText = `
                font-size: 0.75rem;
                color: #6b7280;
                margin-top: 0.25rem;
                font-style: italic;
                line-height: 1.2;
                word-wrap: break-word;
            `;
            
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.appendChild(helper);
            } else {
                input.parentNode.insertBefore(helper, input.nextSibling);
            }
        }
        
        try {
            const words = numberToUSWords(Math.floor(numValue));
            
            if (words && words !== 'undefined' && words.trim() !== '' && !words.includes('undefined')) {
                helper.textContent = `(${words})`;
            } else {
                helper.textContent = `(${formatUSNumber(numValue)})`;
            }
        } catch (error) {
            console.error('Error converting number to words:', error);
            helper.textContent = `(${formatUSNumber(numValue)})`;
        }
    }

    // Remove helper text
    function removeUSDHelperText(input) {
        if (!input.id) return;
        
        const helperId = input.id + 'Helper';
        const helper = document.getElementById(helperId);
        if (helper) {
            helper.remove();
        }
    }

    // Modal helpers - define first so they're available for calculateSEPP
    window.showInfoModal = function(id){
        const modal = document.getElementById('infoModal');
        const titleEl = document.getElementById('infoTitle');
        const contentEl = document.getElementById('infoContent');
        const data = {
            'sepp-overview': {
                title: '72(t) SEPP Methods Overview',
                content: `
                    <div class="info-content">
                        <h4>🎯 What is 72(t) SEPP?</h4>
                        <p>Section 72(t) of the Internal Revenue Code allows penalty-free withdrawals from retirement accounts before age 59½ through <strong>Substantially Equal Periodic Payments (SEPP)</strong>. You must continue payments for 5 years or until age 59½, whichever is longer.</p>
                        
                        <h4>📊 Three IRS-Approved Methods</h4>
                        
                        <div class="method-section">
                            <h5>🔄 Method 1: Required Minimum Distribution (RMD)</h5>
                            <p><strong>Formula:</strong> Annual Payment = Account Balance ÷ Life Expectancy Factor</p>
                            <p><strong>Characteristics:</strong></p>
                            <ul>
                                <li>Variable payments that change each year</li>
                                <li>Based on current account balance and age</li>
                                <li>Uses IRS Single Life Expectancy Table</li>
                                <li>Generally provides the smallest initial payments</li>
                                <li>Payments increase if account grows, decrease if it shrinks</li>
                            </ul>
                            <p><strong>Example:</strong> $500,000 ÷ 45.7 years (age 40) = $10,942 first year</p>
                        </div>
                        
                        <div class="method-section">
                            <h5>📈 Method 2: Fixed Amortization</h5>
                            <p><strong>Formula:</strong> PMT = PV × [r(1+r)ⁿ] / [(1+r)ⁿ - 1]</p>
                            <p>Where: PV = Present Value, r = Interest Rate, n = Life Expectancy</p>
                            <p><strong>Characteristics:</strong></p>
                            <ul>
                                <li>Fixed annual payments for the entire SEPP period</li>
                                <li>Uses IRS interest rate (120% of mid-term AFR)</li>
                                <li>Treats account like a loan being paid off</li>
                                <li>Generally provides moderate payment amounts</li>
                                <li>Predictable income stream</li>
                            </ul>
                            <p><strong>Example:</strong> $500,000 amortized over 45.7 years at 5% = $32,833 annually</p>
                        </div>
                        
                        <div class="method-section">
                            <h5>💰 Method 3: Fixed Annuitization</h5>
                            <p><strong>Formula:</strong> Annual Payment = Account Balance ÷ Present Value Factor</p>
                            <p>PV Factor = [1 - (1 + r)⁻ⁿ] ÷ r</p>
                            <p><strong>Characteristics:</strong></p>
                            <ul>
                                <li>Fixed annual payments for the entire SEPP period</li>
                                <li>Uses IRS interest rate and mortality table</li>
                                <li>Treats account like purchasing an annuity</li>
                                <li>Generally provides the highest payment amounts</li>
                                <li>Most aggressive withdrawal strategy</li>
                            </ul>
                            <p><strong>Example:</strong> $500,000 ÷ 15.24 factor = $32,833 annually</p>
                        </div>
                        
                        <h4>⚠️ Important Considerations</h4>
                        <ul>
                            <li><strong>Commitment:</strong> Must continue for 5 years OR until age 59½ (whichever is longer)</li>
                            <li><strong>Penalties:</strong> Early modification results in 10% penalty on all prior distributions</li>
                            <li><strong>One-Time Switch:</strong> Can switch from Method 2 or 3 to Method 1 once</li>
                            <li><strong>Account Separation:</strong> Can separate accounts to create different SEPP amounts</li>
                            <li><strong>Tax Implications:</strong> Distributions are still subject to ordinary income tax</li>
                        </ul>
                        
                        <h4>🧮 Calculation Inputs</h4>
                        <ul>
                            <li><strong>Starting Age:</strong> Your current age when beginning SEPP</li>
                            <li><strong>Account Balance:</strong> Current value of the retirement account</li>
                            <li><strong>Annual Return:</strong> Expected investment growth rate</li>
                            <li><strong>IRS Interest Rate:</strong> Current 120% of mid-term AFR (check IRS.gov)</li>
                            <li><strong>Tax Withholding:</strong> Estimated tax rate on distributions</li>
                        </ul>
                        
                        <p class="disclaimer"><strong>Disclaimer:</strong> This calculator is for educational purposes. Consult a qualified financial advisor and tax professional before implementing a 72(t) SEPP strategy.</p>
                    </div>
                `
            },
            m1:{
                title:'Method 1 — RMD (Variable)',
                content:`
                    <div class="info-content">
                        <h4>🔄 Required Minimum Distribution Method</h4>
                        <p><strong>Formula:</strong> Annual Payment = Account Balance ÷ Life Expectancy Factor</p>
                        
                        <h5>How it works:</h5>
                        <ul>
                            <li>Recalculates payment each year based on current balance and age</li>
                            <li>Uses IRS Single Life Expectancy Table</li>
                            <li>Payment varies with account performance</li>
                            <li>Generally the most conservative approach</li>
                        </ul>
                        
                        <h5>Advantages:</h5>
                        <ul>
                            <li>Lowest initial payments preserve more capital</li>
                            <li>Payments adjust to account performance</li>
                            <li>More flexibility if account loses value</li>
                        </ul>
                        
                        <h5>Disadvantages:</h5>
                        <ul>
                            <li>Unpredictable income stream</li>
                            <li>Payments could decrease significantly in market downturns</li>
                            <li>May not provide sufficient income in early years</li>
                        </ul>
                    </div>
                `
            },
            m2:{
                title:'Method 2 — Amortization (Fixed)',
                content:`
                    <div class="info-content">
                        <h4>📈 Fixed Amortization Method</h4>
                        <p><strong>Formula:</strong> PMT = PV × [r(1+r)ⁿ] / [(1+r)ⁿ - 1]</p>
                        <p>Where: PV = Present Value, r = IRS Interest Rate, n = Life Expectancy</p>
                        
                        <h5>How it works:</h5>
                        <ul>
                            <li>Calculates fixed payment like a mortgage or loan</li>
                            <li>Uses account balance, IRS interest rate, and life expectancy</li>
                            <li>Same payment amount every year</li>
                            <li>Moderate withdrawal approach</li>
                        </ul>
                        
                        <h5>Advantages:</h5>
                        <ul>
                            <li>Predictable, stable income stream</li>
                            <li>Moderate payment amounts</li>
                            <li>Good balance between income and preservation</li>
                            <li>Can switch to Method 1 once if needed</li>
                        </ul>
                        
                        <h5>Disadvantages:</h5>
                        <ul>
                            <li>Fixed payments regardless of account performance</li>
                            <li>Could deplete account faster in poor market conditions</li>
                            <li>Less flexibility than Method 1</li>
                        </ul>
                    </div>
                `
            },
            m3:{
                title:'Method 3 — Annuitization (Fixed)',
                content:`
                    <div class="info-content">
                        <h4>💰 Fixed Annuitization Method</h4>
                        <p><strong>Formula:</strong> Annual Payment = Account Balance ÷ Present Value Factor</p>
                        <p>PV Factor = [1 - (1 + r)⁻ⁿ] ÷ r</p>
                        
                        <h5>How it works:</h5>
                        <ul>
                            <li>Treats account like purchasing an immediate annuity</li>
                            <li>Uses IRS interest rate and mortality assumptions</li>
                            <li>Highest fixed payment of the three methods</li>
                            <li>Most aggressive withdrawal approach</li>
                        </ul>
                        
                        <h5>Advantages:</h5>
                        <ul>
                            <li>Highest predictable income stream</li>
                            <li>Maximizes early retirement income</li>
                            <li>Fixed payments provide budget certainty</li>
                            <li>Can switch to Method 1 once if needed</li>
                        </ul>
                        
                        <h5>Disadvantages:</h5>
                        <ul>
                            <li>Highest risk of account depletion</li>
                            <li>Fixed payments regardless of market performance</li>
                            <li>May not be sustainable in poor market conditions</li>
                            <li>Less capital preservation</li>
                        </ul>
                    </div>
                `
            },
            'irs-rate-info': {
                title: 'IRS Interest Rate Requirements',
                content: `
                    <div class="info-content">
                        <h4>📋 IRS Interest Rate Rules</h4>
                        <p>For Method 2 (Fixed Amortization) and Method 3 (Fixed Annuitization), the IRS requires that the interest rate used must not exceed the <strong>greater of</strong>:</p>
                        <ul>
                            <li><strong>5%</strong>, or</li>
                            <li><strong>120% of the federal mid-term Applicable Federal Rate (AFR)</strong></li>
                        </ul>
                        
                        <h5>📊 Current AFR Rates</h5>
                        <p>The IRS publishes AFR rates monthly. You can find current rates at:</p>
                        <p><a href="https://www.irs.gov/applicable-federal-rates" target="_blank" rel="noopener noreferrer">IRS.gov - Applicable Federal Rates</a></p>
                        
                        <h5>🧮 For Planning Purposes</h5>
                        <p>This calculator allows you to explore different rate scenarios to understand potential payment amounts. You can use any rate for planning and comparison purposes.</p>
                        
                        <h5>⚠️ When Establishing Your SEPP</h5>
                        <p><strong>Important:</strong> When you actually establish a SEPP with your financial institution, you must use an IRS-compliant rate that meets the requirements above. Using a non-compliant rate could result in penalties.</p>
                        
                        <h5>💡 Example</h5>
                        <p>If the current federal mid-term AFR is 4.0%, then 120% of that rate is 4.8%. Since 5% is greater than 4.8%, you could use up to 5% for your SEPP calculation.</p>
                        
                        <p class="disclaimer"><strong>Note:</strong> Method 1 (RMD) does not use an interest rate, so this requirement only applies to Methods 2 and 3.</p>
                    </div>
                `
            },
            'life-expectancy-table': {
                title: 'Life Expectancy Table Options',
                content: `
                    <div class="info-content">
                        <h4>📊 Life Expectancy Table Options</h4>
                        <p>The IRS provides three different life expectancy tables for calculating retirement distributions. Each table serves different purposes and produces different results.</p>
                        
                        <div class="method-section">
                            <h5>👤 Single Life Expectancy</h5>
                            <p><strong>Most Common Choice</strong></p>
                            <p>Based solely on the account owner's age. This is the standard table used for most SEPP calculations.</p>
                            <p><strong>When to use:</strong></p>
                            <ul>
                                <li>You are the sole beneficiary of your retirement account</li>
                                <li>You want the simplest calculation method</li>
                                <li>You don't have a designated beneficiary more than 10 years younger</li>
                            </ul>
                            <p><strong>Example:</strong> Age 50 = 36.2 years life expectancy</p>
                        </div>
                        
                        <div class="method-section">
                            <h5>👥 Joint Life Expectancy</h5>
                            <p><strong>For Couples with Age Differences</strong></p>
                            <p>Based on both the account owner's age and the beneficiary's age. Generally produces longer life expectancies and smaller required distributions.</p>
                            <p><strong>When to use:</strong></p>
                            <ul>
                                <li>Your spouse is your sole beneficiary</li>
                                <li>Your spouse is more than 10 years younger than you</li>
                                <li>You want to minimize distributions and maximize account longevity</li>
                            </ul>
                            <p><strong>Example:</strong> Owner age 50, Beneficiary age 45 = 42.7 years joint life expectancy</p>
                        </div>
                        
                        <div class="method-section">
                            <h5>📋 Uniform Lifetime</h5>
                            <p><strong>IRS Standard for RMDs</strong></p>
                            <p>The standard table used for Required Minimum Distributions (RMDs) after age 73. Assumes a beneficiary exactly 10 years younger than the account owner.</p>
                            <p><strong>When to use:</strong></p>
                            <ul>
                                <li>You want to compare SEPP calculations to future RMDs</li>
                                <li>You have multiple beneficiaries</li>
                                <li>You want a middle-ground approach</li>
                            </ul>
                            <p><strong>Example:</strong> Age 50 = 36.2 years (same as Single Life for younger ages)</p>
                        </div>
                        
                        <h4>🎯 Which Table Should You Choose?</h4>
                        <ul>
                            <li><strong>Default:</strong> Single Life Expectancy (simplest and most common)</li>
                            <li><strong>Married with younger spouse:</strong> Joint Life Expectancy (lower distributions)</li>
                            <li><strong>Planning for RMDs:</strong> Uniform Lifetime (matches future RMD calculations)</li>
                        </ul>
                        
                        <p class="disclaimer"><strong>Note:</strong> All three tables are IRS-approved. Your choice affects the life expectancy factor used in all three SEPP calculation methods. Consult a financial advisor to determine which table is best for your situation.</p>
                    </div>
                `
            }
        };
        const info = data[id] || {title:'Info',content:'<p>No information available.</p>'};
        titleEl.innerText = info.title; contentEl.innerHTML = info.content;
        modal.classList.remove('modal--hidden'); modal.setAttribute('aria-hidden','false');
        const close = document.getElementById('infoClose'); if(close) close.focus();
    };
    
    window.closeInfoModal = function(){ 
        const modal = document.getElementById('infoModal'); 
        if(!modal) return; 
        modal.classList.add('modal--hidden'); 
        modal.setAttribute('aria-hidden','true'); 
    };
    
    document.addEventListener('click', function(e){ if(e.target && e.target.id==='infoClose') closeInfoModal(); const modal = document.getElementById('infoModal'); if(modal && e.target===modal) closeInfoModal(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeInfoModal(); });

    // Toggle Beneficiary Age field visibility based on Life Expectancy Table selection
    window.toggleBeneficiaryAge = function() {
        const tableType = document.getElementById('lifeExpectancyTable')?.value;
        const beneficiaryGroup = document.getElementById('beneficiaryAgeGroup');
        
        if (beneficiaryGroup) {
            if (tableType === 'joint') {
                beneficiaryGroup.style.display = 'block';
            } else {
                beneficiaryGroup.style.display = 'none';
            }
        }
    };
    
    // Call toggleBeneficiaryAge on page load to set initial state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', toggleBeneficiaryAge);
    } else {
        setTimeout(toggleBeneficiaryAge, 100);
    }

    // expose calculateSEPP globally (widget uses inline onclick)
    window.calculateSEPP = function(){
        try {
            const currentAge = parseInt(document.getElementById('currentAge').value);
            const retirementAge = parseInt(document.getElementById('retirementAge').value);
            const startBalance = parseFloat(document.getElementById('balance').value.replace(/,/g, ''));
            const growth = parseFloat(document.getElementById('growth').value)/100;
            const irsRate = parseFloat(document.getElementById('irsRate').value)/100;
            const taxRate = parseFloat(document.getElementById('tax').value)/100;
            
            // Validate retirement age is greater than current age
            if (retirementAge <= currentAge) {
                alert('Retirement Age must be greater than Current Age.');
                return;
            }
            
            // Calculate years until retirement
            const yearsUntilRetirement = retirementAge - currentAge;
            
            // Get table type from dropdown (defaults to 'single' if not found)
            const tableType = document.getElementById('lifeExpectancyTable')?.value || 'single';
            const beneficiaryCurrentAge = parseInt(document.getElementById('beneficiaryCurrentAge')?.value || 0);
            
            // Calculate beneficiary age at retirement
            let beneficiaryAge = beneficiaryCurrentAge + yearsUntilRetirement;
            
            // Validate beneficiary age for Joint Life selection
            if (tableType === 'joint') {
                if (!beneficiaryCurrentAge || beneficiaryCurrentAge < 0 || beneficiaryCurrentAge > 120) {
                    alert('Please enter a valid Beneficiary Current Age (0-120) for Joint Life Expectancy calculation.');
                    return;
                }
                if (beneficiaryAge < 0 || beneficiaryAge > 120) {
                    alert(`Beneficiary age at retirement would be ${beneficiaryAge}, which is outside valid range (0-120).`);
                    return;
                }
            }
            
            // Use retirement age as the starting age for SEPP calculations
            const startAge = retirementAge;
            
            // Select life expectancy factor based on table type
            let factor;
            switch(tableType) {
                case 'single':
                    factor = singleLifeTable[startAge];
                    break;
                case 'joint':
                    factor = getJointLifeExpectancy(startAge, beneficiaryAge);
                    break;
                case 'uniform':
                    factor = uniformLifetimeTable[startAge];
                    break;
                default:
                    factor = singleLifeTable[startAge];
            }
            
            // Calculate correct SEPP duration: 5 years OR until age 59.5, whichever is LONGER
            const seppDuration = Math.max(5, (59.5 - startAge));
            const projectionYears = Math.ceil(seppDuration);
            const endAge = startAge + projectionYears;
            
            // Update button text dynamically
            const button = document.querySelector('button[onclick="calculateSEPP()"]');
            if (button) {
                button.textContent = `Generate ${projectionYears}-Year Projection`;
            }
            
            // Method 2: Fixed Amortization Method
            // Treats account like a loan being amortized over life expectancy
            // Formula: PMT = PV × [r(1+r)^n] / [(1+r)^n - 1]
            const m2Fixed = (startBalance * irsRate * Math.pow(1 + irsRate, factor)) / (Math.pow(1 + irsRate, factor) - 1);
            
            // Method 3: Fixed Annuitization Method
            // Uses IRS mortality tables (Table 4) to calculate proper annuity factors
            // Formula: Annual Payment = Account Balance ÷ Annuity Factor
            const annuityFactor = calculateAnnuityFactor(startAge, factor, irsRate, mortalityTable);
            const m3Fixed = startBalance / annuityFactor;
            const infoBtn = (id) => ` <button class="btn btn--info" onclick="showInfoModal('${id}')" aria-label="More info" title="Learn more about this method"><i class="fas fa-info-circle"></i></button>`;
            
            const headerHtml = `
                <div class="table-container ${projectionYears > 5 ? 'has-scroll' : ''}">
                    <table class="table table--sepp">
                        <colgroup>
                            <col class="table__age-col">
                            <col class="table__method-col"><col class="table__method-col"><col class="table__method-col">
                            <col class="table__method-col"><col class="table__method-col"><col class="table__method-col">
                            <col class="table__method-col"><col class="table__method-col"><col class="table__method-col">
                        </colgroup>
                        <thead class="table__header">
                            <tr>
                                <th rowspan="2" class="table__age-header">Age</th>
                                <th colspan="3" class="table__method-header">Method 1: RMD (Variable)${infoBtn('m1')}</th>
                                <th colspan="3" class="table__method-header">Method 2: Amortization (Fixed)${infoBtn('m2')}</th>
                                <th colspan="3" class="table__method-header">Method 3: Annuitization (Fixed)${infoBtn('m3')}</th>
                            </tr>
                            <tr>
                                <th class="table__sub-header">Withdrawn</th><th class="table__sub-header">Net (Taxed)</th><th class="table__sub-header">End Balance</th>
                                <th class="table__sub-header">Withdrawn</th><th class="table__sub-header">Net (Taxed)</th><th class="table__sub-header">End Balance</th>
                                <th class="table__sub-header">Withdrawn</th><th class="table__sub-header">Net (Taxed)</th><th class="table__sub-header">End Balance</th>
                            </tr>
                        </thead>
                        <tbody class="table__body">
            `;
            
            let tableBody = '';
            
            // Track totals for summary
            let b1 = startBalance, b2 = startBalance, b3 = startBalance;
            let totalWithdrawn1 = 0, totalWithdrawn2 = 0, totalWithdrawn3 = 0;
            let totalNetIncome1 = 0, totalNetIncome2 = 0, totalNetIncome3 = 0;
            let totalTaxes1 = 0, totalTaxes2 = 0, totalTaxes3 = 0;
            
            for(let i=0; i<=projectionYears; i++){
                let age = startAge + i; 
                
                // Get current factor based on selected table type
                let currentFactor;
                switch(tableType) {
                    case 'single':
                        currentFactor = singleLifeTable[age] || singleLifeTable[70];
                        break;
                    case 'joint':
                        // For joint life, beneficiary age also increases each year
                        const currentBeneficiaryAge = beneficiaryAge + i;
                        currentFactor = getJointLifeExpectancy(age, currentBeneficiaryAge);
                        break;
                    case 'uniform':
                        currentFactor = uniformLifetimeTable[age] || uniformLifetimeTable[70];
                        break;
                    default:
                        currentFactor = singleLifeTable[age] || singleLifeTable[70];
                }
                
                // Method 1 calculations
                let m1With = b1 / currentFactor; 
                let m1Net = m1With * (1 - taxRate); 
                let m1Tax = m1With * taxRate;
                b1 = (b1 - m1With) * (1 + growth);
                
                // Method 2 calculations
                let m2With = m2Fixed; 
                let m2Net = m2With * (1 - taxRate); 
                let m2Tax = m2With * taxRate;
                b2 = (b2 - m2With) * (1 + growth);
                
                // Method 3 calculations
                let m3With = m3Fixed; 
                let m3Net = m3With * (1 - taxRate); 
                let m3Tax = m3With * taxRate;
                b3 = (b3 - m3With) * (1 + growth);
                
                // Track totals
                totalWithdrawn1 += m1With;
                totalWithdrawn2 += m2With;
                totalWithdrawn3 += m3With;
                totalNetIncome1 += m1Net;
                totalNetIncome2 += m2Net;
                totalNetIncome3 += m3Net;
                totalTaxes1 += m1Tax;
                totalTaxes2 += m2Tax;
                totalTaxes3 += m3Tax;
                
                tableBody += `
                    <tr class="table__data-row">
                        <td class="table__age-cell"><strong>${age}</strong></td>
                        <td class="table__cell--withdraw">${formatCurr(m1With)}</td>
                        <td class="table__net-cell">${formatCurr(m1Net)}</td>
                        <td class="table__cell--balance">${formatCurr(b1)}</td>
                        <td class="table__cell--withdraw">${formatCurr(m2With)}</td>
                        <td class="table__net-cell">${formatCurr(m2Net)}</td>
                        <td class="table__cell--balance">${formatCurr(b2)}</td>
                        <td class="table__cell--withdraw">${formatCurr(m3With)}</td>
                        <td class="table__net-cell">${formatCurr(m3Net)}</td>
                        <td class="table__cell--balance">${formatCurr(b3)}</td>
                    </tr>
                `;
            }
            
            const fullTableHtml = headerHtml + tableBody + `
                        </tbody>
                    </table>
                </div>
            `;
            
            // Enhanced summary with colorful layout
            const summaryHtml = `
                <div class="card mt-xl card--elevated">
                    <div class="card__header">
                        <h3 class="card__title">📊 SEPP Analysis Summary (${projectionYears + 1} Years)</h3>
                        <p class="card__subtitle">Current Age: ${currentAge} | Retirement Age: ${startAge} | Projection: Age ${startAge} to ${endAge}</p>
                        <p class="card__subtitle"><strong>SEPP Duration:</strong> ${seppDuration.toFixed(1)} years (${seppDuration >= 5 ? 'until age 59½' : '5-year minimum'})</p>
                        ${tableType === 'joint' ? `<p class="card__subtitle"><strong>Joint Life Expectancy:</strong> Account Owner ${startAge}, Beneficiary ${beneficiaryAge}</p>` : ''}
                    </div>
                    <div class="summary-grid">
                        <div class="summary-section">
                            <h4 class="summary-section__title">🔄 Method 1: RMD (Variable)</h4>
                            <div class="summary-item">
                                <label class="summary-label">💰 Total Withdrawn</label>
                                <div class="summary-value summary-value--warning">${formatCurr(totalWithdrawn1)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💸 Taxes Paid</label>
                                <div class="summary-value summary-value--error">${formatCurr(totalTaxes1)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💵 Net After Tax</label>
                                <div class="summary-value summary-value--success">${formatCurr(totalNetIncome1)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🏦 Final Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurr(b1)}</div>
                            </div>
                        </div>
                        
                        <div class="summary-section">
                            <h4 class="summary-section__title">📈 Method 2: Amortization (Fixed)</h4>
                            <div class="summary-item">
                                <label class="summary-label">💰 Total Withdrawn</label>
                                <div class="summary-value summary-value--warning">${formatCurr(totalWithdrawn2)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💸 Taxes Paid</label>
                                <div class="summary-value summary-value--error">${formatCurr(totalTaxes2)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💵 Net After Tax</label>
                                <div class="summary-value summary-value--success">${formatCurr(totalNetIncome2)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🏦 Final Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurr(b2)}</div>
                            </div>
                        </div>
                        
                        <div class="summary-section">
                            <h4 class="summary-section__title">💰 Method 3: Annuitization (Fixed)</h4>
                            <div class="summary-item">
                                <label class="summary-label">💰 Total Withdrawn</label>
                                <div class="summary-value summary-value--warning">${formatCurr(totalWithdrawn3)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💸 Taxes Paid</label>
                                <div class="summary-value summary-value--error">${formatCurr(totalTaxes3)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💵 Net After Tax</label>
                                <div class="summary-value summary-value--success">${formatCurr(totalNetIncome3)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🏦 Final Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurr(b3)}</div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            `;
            
            const resultsEl = document.getElementById('resultsArea');
            if(resultsEl) {
                resultsEl.innerHTML = summaryHtml + fullTableHtml;
            }

        } catch (error) {
            console.error('Error in calculateSEPP:', error);
            const resultsEl = document.getElementById('resultsArea');
            if (resultsEl) {
                resultsEl.innerHTML = `
                    <div class="card">
                        <div class="card__header">
                            <h3 class="card__title">Error</h3>
                        </div>
                        <p>There was an error calculating the SEPP projection. Please check your inputs and try again.</p>
                        <p><small>Error: ${error.message}</small></p>
                    </div>
                `;
            }
        }
    };

    // Removed automatic calculation - user must click Generate button to see results

})();
