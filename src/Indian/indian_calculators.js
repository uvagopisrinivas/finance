// Indian Investment Calculators - Main File with Shared Utilities
(function(){
    
    // Utility functions for Indian Rupee formatting
    function formatINR(num) {
        // Handle NaN, null, undefined values
        if (isNaN(num) || num === null || num === undefined) {
            return '₹0';
        }
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    }

    function formatINRDetailed(num) {
        // Handle NaN, null, undefined values
        if (isNaN(num) || num === null || num === undefined) {
            return '₹0.00';
        }
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(num);
    }

    // Enhanced INR formatting with readable suffixes
    function formatINRReadable(num) {
        // Handle NaN, null, undefined values
        if (isNaN(num) || num === null || num === undefined) {
            return '₹0';
        }
        
        const basicFormat = formatINR(num);
        let suffix = '';
        
        if (num >= 10000000) { // 1 Crore or more
            const crores = num / 10000000;
            suffix = ` (${crores.toFixed(2)} Cr)`;
        } else if (num >= 100000) { // 1 Lac or more
            const lacs = num / 100000;
            suffix = ` (${lacs.toFixed(2)} Lacs)`;
        } else if (num >= 1000) { // 1 Thousand or more
            const thousands = num / 1000;
            suffix = ` (${thousands.toFixed(2)} K)`;
        }
        
        return basicFormat + suffix;
    }

    function formatPercent(num) {
        return new Intl.NumberFormat('en-IN', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num / 100);
    }

    // Calculator switching functionality
    window.switchIndianCalculator = function(calculatorType) {
        console.log('Switching to calculator:', calculatorType);
        
        // Update tab states
        document.querySelectorAll('.calculator-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-calculator="${calculatorType}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log('Active tab set for:', calculatorType);
        } else {
            console.error('Tab not found for:', calculatorType);
        }

        // Update calculator sections
        document.querySelectorAll('.calculator-section').forEach(section => {
            section.classList.remove('active');
        });
        const activeSection = document.getElementById(`${calculatorType}Calculator`);
        if (activeSection) {
            activeSection.classList.add('active');
            console.log('Active section set for:', calculatorType);
        } else {
            console.error('Section not found for:', calculatorType + 'Calculator');
        }
    };

    // Number to words conversion for Indian numbering system (handles up to thousands of crores)
    function numberToIndianWords(num) {
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
        
        // Handle very large numbers (Lakh Crore and above)
        if (num >= 1000000000000) {
            const lakhCrores = Math.floor(num / 1000000000000);
            result += convertHundreds(lakhCrores) + ' Lakh Crore';
            num %= 1000000000000;
            if (num > 0) result += ' ';
        }
        
        // Handle Crore (1,00,00,000 and above)
        if (num >= 10000000) {
            const crores = Math.floor(num / 10000000);
            const croreWords = convertHundreds(crores);
            if (croreWords) {
                result += croreWords + ' Crore';
            }
            num %= 10000000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle Lac (1,00,000 and above)
        if (num >= 100000) {
            const lacs = Math.floor(num / 100000);
            const lacWords = convertHundreds(lacs);
            if (lacWords) {
                result += lacWords + ' Lac';
            }
            num %= 100000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle Thousand (1,000 and above)
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

    // Format number with Indian comma system (handles up to 15 digits)
    function formatIndianNumber(num) {
        if (isNaN(num) || num === '' || num === '0') return num.toString();
        
        const numStr = num.toString();
        const parts = numStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1] ? '.' + parts[1] : '';
        
        // Indian numbering system: first comma after 3 digits from right, then every 2 digits
        if (integerPart.length > 3) {
            // Start from the right
            const lastThree = integerPart.slice(-3);
            let remaining = integerPart.slice(0, -3);
            
            // Add commas every 2 digits for the remaining part
            let formatted = '';
            while (remaining.length > 0) {
                if (remaining.length > 2) {
                    const lastTwo = remaining.slice(-2);
                    formatted = ',' + lastTwo + formatted;
                    remaining = remaining.slice(0, -2);
                } else {
                    formatted = remaining + formatted;
                    remaining = '';
                }
            }
            
            integerPart = formatted + ',' + lastThree;
        }
        
        return integerPart + decimalPart;
    }

    // Create or update helper text element
    function updateHelperText(input, value) {
        const cleanValue = value.replace(/,/g, '');
        const numValue = parseFloat(cleanValue);
        
        if (isNaN(numValue) || numValue === 0) {
            removeHelperText(input);
            return;
        }
        
        let helperId = input.id + 'Helper';
        // If input doesn't have an ID, create one based on its position
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
            
            // Insert after the input's parent form-group or directly after input
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.appendChild(helper);
            } else {
                input.parentNode.insertBefore(helper, input.nextSibling);
            }
        }
        
        try {
            const words = numberToIndianWords(Math.floor(numValue));
            
            if (words && words !== 'undefined' && words.trim() !== '' && !words.includes('undefined')) {
                helper.textContent = `(${words})`;
            } else {
                // Fallback to just showing the formatted number
                helper.textContent = `(${formatIndianNumber(numValue)})`;
            }
        } catch (error) {
            console.error('Error converting number to words:', error);
            helper.textContent = `(${formatIndianNumber(numValue)})`;
        }
    }

    // Remove helper text
    function removeHelperText(input) {
        if (!input.id) return; // Can't remove if no ID
        
        const helperId = input.id + 'Helper';
        const helper = document.getElementById(helperId);
        if (helper) {
            helper.remove();
        }
    }

    // Frequency handling functions
    function updateFrequencyLabels() {
        // Update SIP labels
        const sipFrequency = document.getElementById('sipFrequency');
        const sipAmountLabel = document.getElementById('sipAmountLabel');
        
        if (sipFrequency && sipAmountLabel) {
            const frequency = sipFrequency.value;
            const frequencyLabels = {
                'monthly': 'Monthly Investment (₹)',
                'quarterly': 'Quarterly Investment (₹)',
                'halfyearly': 'Half-yearly Investment (₹)',
                'yearly': 'Yearly Investment (₹)'
            };
            sipAmountLabel.textContent = frequencyLabels[frequency];
        }
        
        // Update SWP labels
        const swpFrequency = document.getElementById('swpFrequency');
        const swpWithdrawalLabel = document.getElementById('swpWithdrawalLabel');
        
        if (swpFrequency && swpWithdrawalLabel) {
            const frequency = swpFrequency.value;
            const frequencyLabels = {
                'monthly': 'Monthly Withdrawal (₹)',
                'quarterly': 'Quarterly Withdrawal (₹)',
                'halfyearly': 'Half-yearly Withdrawal (₹)',
                'yearly': 'Yearly Withdrawal (₹)'
            };
            swpWithdrawalLabel.textContent = frequencyLabels[frequency];
        }
    }

    function getFrequencyMultiplier(frequency) {
        const multipliers = {
            'monthly': 12,
            'quarterly': 4,
            'halfyearly': 2,
            'yearly': 1
        };
        return multipliers[frequency] || 12;
    }

    // Copy to clipboard functionality
    function copyToClipboard(text, element) {
        // Extract only the number part, remove currency symbol, commas, and everything in parentheses
        let cleanText = text.replace(/₹/g, '').trim(); // Remove currency symbol
        
        // If there are parentheses, take only the part before them
        if (cleanText.includes('(')) {
            cleanText = cleanText.split('(')[0].trim();
        }
        
        // Remove all commas to get plain number
        cleanText = cleanText.replace(/,/g, '');
        
        if (navigator.clipboard && window.isSecureContext) {
            // Modern clipboard API
            navigator.clipboard.writeText(cleanText).then(() => {
                showCopyFeedback(element, 'Copied!');
            }).catch(() => {
                fallbackCopyToClipboard(cleanText, element);
            });
        } else {
            // Fallback for older browsers
            fallbackCopyToClipboard(cleanText, element);
        }
    }

    function fallbackCopyToClipboard(text, element) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopyFeedback(element, 'Copied!');
        } catch (err) {
            showCopyFeedback(element, 'Copy failed');
        }
        
        document.body.removeChild(textArea);
    }

    function showCopyFeedback(element, message) {
        const originalTitle = element.title;
        const originalIcon = element.innerHTML;
        
        element.innerHTML = '<i class="fas fa-check"></i>';
        element.title = message;
        element.style.color = '#27ae60';
        
        setTimeout(() => {
            element.innerHTML = originalIcon;
            element.title = originalTitle;
            element.style.color = '';
        }, 1500);
    }

    // Add copy buttons to result values
    function addCopyButtons() {
        const resultElements = document.querySelectorAll('.summary-value');
        
        resultElements.forEach(element => {
            // Skip if copy button already exists
            if (element.parentElement.querySelector('.copy-btn')) return;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy to clipboard';
            copyBtn.setAttribute('aria-label', 'Copy value to clipboard');
            
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                copyToClipboard(element.textContent, copyBtn);
            });
            
            // Insert the copy button after the summary value
            element.parentElement.style.position = 'relative';
            element.parentElement.appendChild(copyBtn);
        });
    }

    // Input validation and formatting
    function setupInputValidation() {
        // Get currency inputs (now text inputs with inputmode="numeric")
        const currencyInputs = document.querySelectorAll('#sipAmount, #swpTotalInvestment, #swpWithdrawal, #lumpsumAmount');
        const percentageInputs = document.querySelectorAll('#sipReturnRate, #sipStepUp, #swpReturnRate, #swpTaxRate');
        const yearInputs = document.querySelectorAll('#sipTimePeriod, #swpTimePeriod, #lumpsumTimePeriod');
        
        // Setup frequency change listeners
        const sipFrequency = document.getElementById('sipFrequency');
        const swpFrequency = document.getElementById('swpFrequency');
        
        if (sipFrequency) {
            sipFrequency.addEventListener('change', updateFrequencyLabels);
        }
        
        if (swpFrequency) {
            swpFrequency.addEventListener('change', updateFrequencyLabels);
        }
        
        // Initialize labels
        updateFrequencyLabels();
        
        // Setup currency inputs with comma formatting and helper text
        currencyInputs.forEach(input => {
            // Remove any max length restrictions
            input.removeAttribute('maxlength');
            
            // Format initial value
            if (input.value) {
                const formatted = formatIndianNumber(input.value);
                input.value = formatted;
                updateHelperText(input, formatted);
            }
            
            // Handle input events - more permissive for large numbers
            input.addEventListener('input', function(e) {
                // Store cursor position before formatting
                const cursorPosition = this.selectionStart;
                const oldValue = this.value;
                
                let value = this.value.replace(/,/g, ''); // Remove existing commas
                
                // Only allow numbers (no length restriction)
                value = value.replace(/[^\d]/g, '');
                
                // Allow very large numbers (up to 15 digits for thousands of crores)
                if (value.length > 15) {
                    value = value.substring(0, 15);
                }

                if (value && value !== '0') {
                    const formatted = formatIndianNumber(value);
                    
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
                    
                    // Restore cursor position
                    this.setSelectionRange(newCursorPosition, newCursorPosition);
                    
                    updateHelperText(this, formatted);
                } else {
                    this.value = '';
                    removeHelperText(this);
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
                    const formatted = formatIndianNumber(value);
                    this.value = formatted;
                    updateHelperText(this, formatted);
                } else if (value === '' || value === '0') {
                    // Allow empty or zero values
                    this.value = '';
                    removeHelperText(this);
                }
            });

            // More permissive keypress handling
            input.addEventListener('keypress', function(e) {
                // Allow: backspace, delete, tab, escape, enter
                if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
                    (e.ctrlKey && [65, 67, 86, 88, 90].indexOf(e.keyCode) !== -1) ||
                    // Allow: home, end, left, right, up, down
                    (e.keyCode >= 35 && e.keyCode <= 40)) {
                    return;
                }
                // Only prevent if it's definitely not a number
                if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });

            // Handle paste events for large numbers
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const cleanPaste = paste.replace(/[^\d]/g, '');
                if (cleanPaste && cleanPaste.length <= 15) {
                    const formatted = formatIndianNumber(cleanPaste);
                    this.value = formatted;
                    updateHelperText(this, formatted);
                }
            });
        });

        // Setup percentage and year inputs (no comma formatting)
        [...percentageInputs, ...yearInputs].forEach(input => {
            input.addEventListener('keypress', function(e) {
                // Allow: backspace, delete, tab, escape, enter, decimal point
                if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });

            input.addEventListener('input', function(e) {
                if (this.value < 0) {
                    this.value = 0;
                }
                
                // Enforce return rate ranges (10-15%)
                if (this.id.includes('ReturnRate')) {
                    if (this.value > 15) {
                        this.value = 15;
                    } else if (this.value < 10 && this.value !== '') {
                        this.value = 10;
                    }
                }
                
                // Tax rate validation (max 50%)
                if (this.id === 'swpTaxRate' && this.value > 50) {
                    this.value = 50;
                }
            });

            input.addEventListener('blur', function(e) {
                const value = parseFloat(this.value);
                if (isNaN(value) || value < 0) {
                    // Set default values based on input type
                    if (this.id.includes('ReturnRate')) {
                        this.value = '12';
                    } else {
                        this.value = this.getAttribute('value') || '0';
                    }
                }
                
                // Enforce return rate ranges on blur
                if (this.id.includes('ReturnRate')) {
                    if (value > 15) {
                        this.value = '15';
                    } else if (value < 10) {
                        this.value = '10';
                    }
                }
                
                if (this.id === 'swpTaxRate' && value > 50) {
                    this.value = '50';
                }
            });
        });

        // Auto-recalculate when active trading checkbox changes
        const activeTrading = document.getElementById('swpActiveTrading');
        if (activeTrading) {
            activeTrading.addEventListener('change', function() {
                setTimeout(() => {
                    if (typeof window.calculateSWP === 'function') {
                        window.calculateSWP();
                    }
                }, 100);
            });
        }
    }

    // Make utility functions globally available
    window.formatINR = formatINR;
    window.formatINRDetailed = formatINRDetailed;
    window.formatINRReadable = formatINRReadable;
    window.formatPercent = formatPercent;
    window.numberToIndianWords = numberToIndianWords;
    window.formatIndianNumber = formatIndianNumber;
    window.updateHelperText = updateHelperText;
    window.removeHelperText = removeHelperText;
    window.updateFrequencyLabels = updateFrequencyLabels;
    window.getFrequencyMultiplier = getFrequencyMultiplier;
    window.copyToClipboard = copyToClipboard;
    window.addCopyButtons = addCopyButtons;

    // Setup input validation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupInputValidation);
    } else {
        setupInputValidation();
    }

})();