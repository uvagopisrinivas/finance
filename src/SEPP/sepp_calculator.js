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
        const numberInputs = document.querySelectorAll('#startAge, #balance, #growth, #irsRate, #taxRate');
        const currencyInputs = document.querySelectorAll('#balance'); // Only balance needs currency formatting
        
        // Function to update button text based on age
        function updateButtonText() {
            const startAge = parseInt(document.getElementById('startAge')?.value || 40);
            const seppDuration = Math.max(5, (59.5 - startAge));
            const projectionYears = Math.ceil(seppDuration);
            const button = document.getElementById('seppCalculateBtn');
            if (button) {
                button.textContent = `Generate ${projectionYears}-Year Projection`;
            }
        }
        
        // Update button text initially and when age changes
        updateButtonText();
        const ageInput = document.getElementById('startAge');
        if (ageInput) {
            ageInput.addEventListener('input', updateButtonText);
            ageInput.addEventListener('change', updateButtonText);
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
                    
                    // Calculate new cursor position
                    const oldCommas = (oldValue.match(/,/g) || []).length;
                    const newCommas = (formatted.match(/,/g) || []).length;
                    const commasDiff = newCommas - oldCommas;
                    
                    this.value = formatted;
                    
                    // Restore cursor position, adjusting for added/removed commas
                    const newCursorPosition = Math.min(cursorPosition + commasDiff, formatted.length);
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
            if (!input || currencyInputs.includes(input)) return; // Skip currency inputs already handled
            
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
                if (this.id === 'startAge') {
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
    const lifeTable = {30:55.3,31:54.4,32:53.4,33:52.5,34:51.5,35:50.5,36:49.6,37:48.6,38:47.7,39:46.7,40:45.7,41:44.8,42:43.8,43:42.9,44:41.9,45:41.0,46:40.0,47:39.0,48:38.1,49:37.1,50:36.2,51:35.3,52:34.3,53:33.4,54:32.5,55:31.6,56:30.6,57:29.8,58:28.9,59:28.0,60:27.1,61:26.2,62:25.4,63:24.5,64:23.7,65:22.9,66:22.0,67:21.2,68:20.4,69:19.6,70:18.8};
    
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

    // expose calculateSEPP globally (widget uses inline onclick)
    window.calculateSEPP = function(){
        try {
            const startAge = parseInt(document.getElementById('startAge').value);
            const startBalance = parseFloat(document.getElementById('balance').value.replace(/,/g, ''));
            const growth = parseFloat(document.getElementById('growth').value)/100;
            const irsRate = parseFloat(document.getElementById('irsRate').value)/100;
            const taxRate = parseFloat(document.getElementById('tax').value)/100;
            const factor = lifeTable[startAge];
            
            // Calculate correct SEPP duration: 5 years OR until age 59.5, whichever is LONGER
            const seppDuration = Math.max(5, (59.5 - startAge));
            const projectionYears = Math.ceil(seppDuration);
            const endAge = startAge + projectionYears;
            
            // Update button text dynamically
            const button = document.querySelector('button[onclick="calculateSEPP()"]');
            if (button) {
                button.textContent = `Generate ${projectionYears}-Year Projection`;
            }
            
            const m2Fixed = (startBalance * irsRate) / (1 - Math.pow(1 + irsRate, -factor));
            const m3Fixed = startBalance / ( (1 - Math.pow(1 + irsRate, -factor)) / irsRate );
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
                                <th class="table__sub-header">Withdrawn</th><th class="table__sub-header">Net (Tax)</th><th class="table__sub-header">End Balance</th>
                                <th class="table__sub-header">Withdrawn</th><th class="table__sub-header">Net (Tax)</th><th class="table__sub-header">End Balance</th>
                                <th class="table__sub-header">Withdrawn</th><th class="table__sub-header">Net (Tax)</th><th class="table__sub-header">End Balance</th>
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
                let currentFactor = lifeTable[age] || lifeTable[70];
                
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
                        <p class="card__subtitle">Comparison of three IRS-approved withdrawal methods from age ${startAge} to ${endAge}</p>
                        <p class="card__subtitle"><strong>SEPP Duration:</strong> ${seppDuration.toFixed(1)} years (${seppDuration >= 5 ? 'until age 59½' : '5-year minimum'})</p>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-section">
                            <h4 class="summary-section__title">🔄 Method 1: RMD (Variable)</h4>
                            <div class="summary-item">
                                <label class="summary-label">💰 Total Withdrawn</label>
                                <div class="summary-value summary-value--warning">${formatCurr(totalWithdrawn1)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💵 Net After Tax</label>
                                <div class="summary-value summary-value--success">${formatCurr(totalNetIncome1)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🏦 Final Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurr(b1)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">📈 Total Value</label>
                                <div class="summary-value summary-value--info">${formatCurr(totalNetIncome1 + b1)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💸 Taxes Paid</label>
                                <div class="summary-value summary-value--error">${formatCurr(totalTaxes1)}</div>
                            </div>
                        </div>
                        
                        <div class="summary-section">
                            <h4 class="summary-section__title">📈 Method 2: Amortization (Fixed)</h4>
                            <div class="summary-item">
                                <label class="summary-label">💰 Total Withdrawn</label>
                                <div class="summary-value summary-value--warning">${formatCurr(totalWithdrawn2)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💵 Net After Tax</label>
                                <div class="summary-value summary-value--success">${formatCurr(totalNetIncome2)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🏦 Final Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurr(b2)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">📈 Total Value</label>
                                <div class="summary-value summary-value--info">${formatCurr(totalNetIncome2 + b2)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💸 Taxes Paid</label>
                                <div class="summary-value summary-value--error">${formatCurr(totalTaxes2)}</div>
                            </div>
                        </div>
                        
                        <div class="summary-section">
                            <h4 class="summary-section__title">💰 Method 3: Annuitization (Fixed)</h4>
                            <div class="summary-item">
                                <label class="summary-label">💰 Total Withdrawn</label>
                                <div class="summary-value summary-value--warning">${formatCurr(totalWithdrawn3)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💵 Net After Tax</label>
                                <div class="summary-value summary-value--success">${formatCurr(totalNetIncome3)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🏦 Final Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurr(b3)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">📈 Total Value</label>
                                <div class="summary-value summary-value--info">${formatCurr(totalNetIncome3 + b3)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💸 Taxes Paid</label>
                                <div class="summary-value summary-value--error">${formatCurr(totalTaxes3)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-grid mt-xl">
                        <div class="summary-section">
                            <h4 class="summary-section__title">🎯 Key Insights</h4>
                            <div class="summary-item">
                                <label class="summary-label">🏆 Highest Income</label>
                                <div class="summary-value summary-value--success">${
                                    totalNetIncome3 > totalNetIncome2 && totalNetIncome3 > totalNetIncome1 ? 'Method 3 (Annuitization)' :
                                    totalNetIncome2 > totalNetIncome1 ? 'Method 2 (Amortization)' : 'Method 1 (RMD)'
                                }</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🛡️ Best Preservation</label>
                                <div class="summary-value summary-value--primary">${
                                    b1 > b2 && b1 > b3 ? 'Method 1 (RMD)' :
                                    b2 > b3 ? 'Method 2 (Amortization)' : 'Method 3 (Annuitization)'
                                }</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">⚖️ Best Balance</label>
                                <div class="summary-value summary-value--info">${
                                    (totalNetIncome2 + b2) > (totalNetIncome1 + b1) && (totalNetIncome2 + b2) > (totalNetIncome3 + b3) ? 'Method 2 (Amortization)' :
                                    (totalNetIncome3 + b3) > (totalNetIncome1 + b1) ? 'Method 3 (Annuitization)' : 'Method 1 (RMD)'
                                }</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">📅 SEPP Duration</label>
                                <div class="summary-value summary-value--warning">${seppDuration.toFixed(1)} years</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🎂 End Age</label>
                                <div class="summary-value summary-value--info">${endAge} years</div>
                            </div>
                        </div>
                        
                        <div class="summary-section">
                            <h4 class="summary-section__title">📊 Annual Averages</h4>
                            <div class="summary-item">
                                <label class="summary-label">Method 1 Avg</label>
                                <div class="summary-value summary-value--warning">${formatCurr(totalNetIncome1 / (projectionYears + 1))}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">Method 2 Avg</label>
                                <div class="summary-value summary-value--warning">${formatCurr(totalNetIncome2 / (projectionYears + 1))}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">Method 3 Avg</label>
                                <div class="summary-value summary-value--warning">${formatCurr(totalNetIncome3 / (projectionYears + 1))}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💼 Starting Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurr(startBalance)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">📈 Growth Rate</label>
                                <div class="summary-value summary-value--success">${(growth * 100).toFixed(1)}%</div>
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
