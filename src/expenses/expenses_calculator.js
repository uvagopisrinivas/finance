// Monthly Expenses Calculator Widget
(function(){
    
    let expenseCounter = 0;
    
    // Get currency-aware default expenses
    function getDefaultExpenses() {
        const currentCurrency = window.currentCurrency || 'INR';
        
        if (currentCurrency === 'USD') {
            return [
                { name: 'Rent/Mortgage', amount: 1500, category: 'housing' },
                { name: 'Groceries', amount: 500, category: 'food' },
                { name: 'Travel', amount: 400, category: 'travel' },
                { name: 'Children Education', amount: 300, category: 'education' },
                { name: 'Health Insurance', amount: 250, category: 'health' },
                { name: 'Fuel/Gas', amount: 200, category: 'transportation' },
                { name: 'Miscellaneous', amount: 200, category: 'other' },
                { name: 'Festivals', amount: 150, category: 'festivals' },
                { name: 'House Insurance', amount: 150, category: 'insurance' },
                { name: 'Car Insurance', amount: 120, category: 'insurance' },
                { name: 'Power Bill', amount: 100, category: 'utilities' },
                { name: 'Phone Bill', amount: 80, category: 'phone' },
                { name: 'Internet Bill', amount: 60, category: 'internet' },
                { name: 'Subscriptions (Netflix, etc)', amount: 50, category: 'entertainment' }
            ];
        } else {
            return [
                { name: 'Rent/Mortgage', amount: 25000, category: 'housing' },
                { name: 'Groceries', amount: 20000, category: 'food' },
                { name: 'Travel', amount: 15000, category: 'travel' },
                { name: 'Children Education', amount: 10000, category: 'education' },
                { name: 'Health Insurance', amount: 8000, category: 'health' },
                { name: 'Fuel/Gas', amount: 6000, category: 'transportation' },
                { name: 'Miscellaneous', amount: 5000, category: 'other' },
                { name: 'Festivals', amount: 4000, category: 'festivals' },
                { name: 'Car Insurance', amount: 3000, category: 'insurance' },
                { name: 'Power Bill', amount: 3000, category: 'utilities' },
                { name: 'House Insurance', amount: 2000, category: 'insurance' },
                { name: 'Phone Bill', amount: 500, category: 'phone' },
                { name: 'Internet Bill', amount: 1000, category: 'internet' },
                { name: 'Subscriptions (Netflix, etc)', amount: 1500, category: 'entertainment' }
            ];
        }
    }

    // Initialize default expenses
    function initializeDefaultExpenses() {
        const container = document.getElementById('expensesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        expenseCounter = 0;
        
        const defaultExpenses = getDefaultExpenses();
        
        // Sort expenses by amount in descending order (highest first)
        defaultExpenses.sort((a, b) => b.amount - a.amount);
        
        defaultExpenses.forEach(expense => {
            addExpenseItem(expense.name, expense.amount, expense.category);
        });
    }

    // Add new expense functionality
    window.addNewExpense = function() {
        addExpenseItem('', 0, 'other');
    };

    function addExpenseItem(name = '', amount = 0, category = 'other') {
        expenseCounter++;
        const container = document.getElementById('expensesContainer');
        
        const currentCurrency = window.currentCurrency || 'INR';
        const symbol = currentCurrency === 'USD' ? '$' : '₹';
        
        const expenseHtml = `
            <div class="expense-item" id="expense-${expenseCounter}" data-category="${category}">
                <div class="expense-item-content">
                    <div class="expense-name-with-icon">
                        <span class="expense-category-icon" data-category="${category}">${getCategoryIcon(category)}</span>
                        <input type="text" class="expense-name-input" value="${name}" placeholder="Expense name">
                        <select class="expense-category-select-hidden" style="display: none;">
                            <option value="housing" ${category === 'housing' ? 'selected' : ''}>Housing</option>
                            <option value="food" ${category === 'food' ? 'selected' : ''}>Food</option>
                            <option value="travel" ${category === 'travel' ? 'selected' : ''}>Travel</option>
                            <option value="education" ${category === 'education' ? 'selected' : ''}>Education</option>
                            <option value="health" ${category === 'health' ? 'selected' : ''}>Health</option>
                            <option value="transportation" ${category === 'transportation' ? 'selected' : ''}>Transportation</option>
                            <option value="festivals" ${category === 'festivals' ? 'selected' : ''}>Festivals</option>
                            <option value="insurance" ${category === 'insurance' ? 'selected' : ''}>Insurance</option>
                            <option value="utilities" ${category === 'utilities' ? 'selected' : ''}>Utilities</option>
                            <option value="phone" ${category === 'phone' ? 'selected' : ''}>Phone</option>
                            <option value="internet" ${category === 'internet' ? 'selected' : ''}>Internet</option>
                            <option value="entertainment" ${category === 'entertainment' ? 'selected' : ''}>Entertainment</option>
                            <option value="other" ${category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <input type="text" class="expense-amount-input" value="${amount > 0 ? formatNumber(amount) : ''}" placeholder="Amount" inputmode="numeric">
                    <button type="button" class="expense-remove-btn" onclick="removeExpense(${expenseCounter})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', expenseHtml);
        
        // Setup input validation for the new expense
        const expenseElement = document.getElementById(`expense-${expenseCounter}`);
        const amountInput = expenseElement.querySelector('.expense-amount-input');
        setupExpenseAmountInput(amountInput);
        
        // Setup category icon click to change category
        const categoryIcon = expenseElement.querySelector('.expense-category-icon');
        const categorySelect = expenseElement.querySelector('.expense-category-select-hidden');
        
        categoryIcon.addEventListener('click', function() {
            // Cycle through categories
            const categories = ['housing', 'food', 'travel', 'education', 'health', 'transportation', 'festivals', 'insurance', 'utilities', 'phone', 'internet', 'entertainment', 'other'];
            const currentCategory = this.getAttribute('data-category');
            const currentIndex = categories.indexOf(currentCategory);
            const nextIndex = (currentIndex + 1) % categories.length;
            const nextCategory = categories[nextIndex];
            
            // Update icon and data
            this.setAttribute('data-category', nextCategory);
            this.textContent = getCategoryIcon(nextCategory);
            categorySelect.value = nextCategory;
            expenseElement.setAttribute('data-category', nextCategory);
        });
    }
    
    function getCategoryIcon(category) {
        const icons = {
            housing: '🏠',
            insurance: '🛡️',
            utilities: '💡',
            transportation: '🚗',
            food: '🍔',
            entertainment: '🎬',
            phone: '📱',
            internet: '🌐',
            travel: '✈️',
            education: '👶',
            health: '🏥',
            festivals: '🎉',
            other: '📦'
        };
        return icons[category] || '📦';
    }

    window.removeExpense = function(expenseId) {
        const expenseElement = document.getElementById(`expense-${expenseId}`);
        if (expenseElement) {
            expenseElement.remove();
        }
    };

    function setupExpenseAmountInput(input) {
        if (input.value) {
            const formatted = formatNumber(input.value.replace(/,/g, ''));
            input.value = formatted;
        }
        
        input.addEventListener('input', function(e) {
            const cursorPosition = this.selectionStart;
            const oldValue = this.value;
            
            let value = this.value.replace(/,/g, '');
            value = value.replace(/[^\d.]/g, '');
            
            // Allow only one decimal point
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            if (value.length > 15) {
                value = value.substring(0, 15);
            }
            
            if (value && value !== '0') {
                const formatted = formatNumber(value);
                
                const oldValueBeforeCursor = oldValue.substring(0, cursorPosition);
                const digitsBeforeCursor = (oldValueBeforeCursor.match(/\d/g) || []).length;
                
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
            } else if (value === '') {
                this.value = '';
            }
        });

        input.addEventListener('blur', function(e) {
            let value = this.value.replace(/,/g, '');
            if (value && !isNaN(value) && value !== '0') {
                const formatted = formatNumber(value);
                this.value = formatted;
            }
        });
    }

    // Calculate expenses
    window.calculateExpenses = function() {
        try {
            // Get income input (always monthly now)
            const incomeAmountInput = document.getElementById('expensesIncomeAmount').value.replace(/,/g, '');
            const monthlyIncome = parseFloat(incomeAmountInput);

            if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
                throw new Error('Please enter a valid monthly income amount');
            }

            // Collect all expenses
            const expenseElements = document.querySelectorAll('.expense-item');
            const expenses = [];
            const expensesWithZero = [];
            let totalExpenses = 0;
            const categoryTotals = {};

            expenseElements.forEach(expenseElement => {
                const name = expenseElement.querySelector('.expense-name-input').value;
                const category = expenseElement.querySelector('.expense-category-select-hidden').value;
                const amountStr = expenseElement.querySelector('.expense-amount-input').value.replace(/,/g, '');
                const amount = parseFloat(amountStr) || 0;

                if (name && amount > 0) {
                    expenses.push({ 
                        name, 
                        category, 
                        amount,
                        element: expenseElement 
                    });
                    totalExpenses += amount;
                    
                    if (!categoryTotals[category]) {
                        categoryTotals[category] = 0;
                    }
                    categoryTotals[category] += amount;
                } else {
                    // Keep track of zero/empty amount items to put at bottom
                    expensesWithZero.push({
                        element: expenseElement,
                        amount: amount
                    });
                }
            });

            // Sort expenses by amount in descending order (highest first)
            expenses.sort((a, b) => b.amount - a.amount);
            
            // Reorder DOM elements: sorted expenses first, then zero-amount items
            const container = document.getElementById('expensesContainer');
            expenses.forEach(expense => {
                container.appendChild(expense.element);
            });
            expensesWithZero.forEach(item => {
                container.appendChild(item.element);
            });

            const remainingAmount = monthlyIncome - totalExpenses;
            const savingsPercentage = (remainingAmount / monthlyIncome) * 100;
            
            // Check if inflation and years are provided for future calculation
            const inflationRate = parseFloat(document.getElementById('expensesInflationRate').value) || 0;
            const incomeHike = parseFloat(document.getElementById('expensesIncomeHike').value) || 0;
            const years = parseInt(document.getElementById('expensesYears').value) || 0;
            const hasFutureCalculation = (inflationRate > 0 || incomeHike > 0) && years > 0;
            
            let futureExpenses = 0;
            let futureIncome = 0;
            let futureSavings = 0;
            
            if (hasFutureCalculation) {
                // Calculate future expenses with inflation: FV = PV * (1 + r)^n
                futureExpenses = totalExpenses * Math.pow(1 + (inflationRate / 100), years);
                
                // Calculate future income with hike: FV = PV * (1 + r)^n
                futureIncome = monthlyIncome * Math.pow(1 + (incomeHike / 100), years);
                
                futureSavings = futureIncome - futureExpenses;
            }

            // Update summary
            document.getElementById('expensesMonthlyIncome').textContent = formatCurrency(monthlyIncome);
            document.getElementById('expensesMonthlyIncomeWords').textContent = numberToWords(Math.round(monthlyIncome));
            
            document.getElementById('expensesTotalExpenses').textContent = formatCurrency(totalExpenses);
            document.getElementById('expensesTotalExpensesWords').textContent = numberToWords(Math.round(totalExpenses));
            
            // Update remaining amount with raw value stored in data attribute
            const remainingElement = document.getElementById('expensesRemaining');
            remainingElement.textContent = formatCurrency(remainingAmount);
            remainingElement.setAttribute('data-raw-value', Math.round(remainingAmount));
            document.getElementById('expensesRemainingWords').textContent = numberToWords(Math.round(remainingAmount));
            
            document.getElementById('expensesSavingsPercent').textContent = savingsPercentage.toFixed(1) + '%';

            // Update remaining amount styling
            if (remainingAmount < 0) {
                remainingElement.style.color = 'var(--color-error)';
            } else if (remainingAmount < monthlyIncome * 0.1) {
                remainingElement.style.color = 'var(--color-warning)';
            } else {
                remainingElement.style.color = 'var(--color-success)';
            }
            
            // Show/hide future values section
            const futureSection = document.getElementById('expensesFutureSection');
            if (hasFutureCalculation) {
                futureSection.style.display = 'block';
                
                // Build label with inflation and/or income hike
                let labelParts = [];
                if (inflationRate > 0) labelParts.push(`${inflationRate}% inflation`);
                if (incomeHike > 0) labelParts.push(`${incomeHike}% income hike`);
                const labelText = labelParts.join(', ');
                
                // Update future section label
                document.getElementById('expensesFutureYearsLabel').textContent = `After ${years} Year${years > 1 ? 's' : ''} (${labelText})`;
                
                // Update future income
                document.getElementById('expensesFutureIncome').textContent = formatCurrency(futureIncome);
                document.getElementById('expensesFutureIncomeWords').textContent = numberToWords(Math.round(futureIncome));
                
                // Update future expenses
                document.getElementById('expensesFutureExpenses').textContent = formatCurrency(futureExpenses);
                document.getElementById('expensesFutureExpensesWords').textContent = numberToWords(Math.round(futureExpenses));
                
                // Update future savings
                const futureSavingsElement = document.getElementById('expensesFutureSavings');
                futureSavingsElement.textContent = formatCurrency(futureSavings);
                document.getElementById('expensesFutureSavingsWords').textContent = numberToWords(Math.round(futureSavings));
                
                // Style future savings based on value
                if (futureSavings < 0) {
                    futureSavingsElement.style.color = 'var(--color-error)';
                } else if (futureSavings < futureIncome * 0.1) {
                    futureSavingsElement.style.color = 'var(--color-warning)';
                } else {
                    futureSavingsElement.style.color = 'var(--color-success)';
                }
            } else {
                futureSection.style.display = 'none';
            }

            // Show results (no tables needed)
            document.getElementById('expensesResults').style.display = 'block';

            // Add copy buttons
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    // Setup income input validation
    function setupIncomeInputValidation() {
        const incomeInput = document.getElementById('expensesIncomeAmount');
        if (!incomeInput) return;

        incomeInput.removeAttribute('maxlength');

        if (incomeInput.value) {
            const formatted = formatNumber(incomeInput.value);
            incomeInput.value = formatted;
            updateHelperText(incomeInput, formatted);
        }
    }

    // Function to reinitialize expenses when currency changes
    window.reinitializeExpenses = function() {
        initializeDefaultExpenses();
    };

    // Initialize when switching to expenses calculator
    const originalSwitchFunction = window.switchIndianCalculator;
    if (originalSwitchFunction) {
        window.switchIndianCalculator = function(calculatorType) {
            originalSwitchFunction(calculatorType);
            
            if (calculatorType === 'expenses') {
                setTimeout(() => {
                    initializeDefaultExpenses();
                    setupIncomeInputValidation();
                    
                    // Set and format income input with currency-aware default
                    setTimeout(() => {
                        const incomeInput = document.getElementById('expensesIncomeAmount');
                        if (incomeInput) {
                            const currentCurrency = window.currentCurrency || 'INR';
                            const defaultIncome = currentCurrency === 'USD' ? '6000' : '200000';
                            
                            // Only set default if input is empty
                            if (!incomeInput.value || incomeInput.value.trim() === '') {
                                incomeInput.value = formatNumber(defaultIncome);
                                updateHelperText(incomeInput, formatNumber(defaultIncome));
                            } else {
                                // Format existing value
                                const cleanValue = incomeInput.value.replace(/,/g, '');
                                const formatted = formatNumber(cleanValue);
                                incomeInput.value = formatted;
                                updateHelperText(incomeInput, formatted);
                            }
                        }
                    }, 50);
                }, 50);
            }
        };
    }

    // Function to update expenses for currency change
    window.updateExpensesCurrency = function() {
        // Reinitialize expenses with new currency defaults
        initializeDefaultExpenses();
        
        // Update income input with new currency default
        const incomeInput = document.getElementById('expensesIncomeAmount');
        if (incomeInput) {
            const currentCurrency = window.currentCurrency || 'INR';
            const defaultIncome = currentCurrency === 'USD' ? '6000' : '200000';
            incomeInput.value = formatNumber(defaultIncome);
            updateHelperText(incomeInput, formatNumber(defaultIncome));
        }
        
        // Hide results since currency changed
        const resultsSection = document.getElementById('expensesResults');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
    };

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                initializeDefaultExpenses();
                
                // Set income default value
                const incomeInput = document.getElementById('expensesIncomeAmount');
                if (incomeInput && (!incomeInput.value || incomeInput.value.trim() === '')) {
                    const currentCurrency = window.currentCurrency || 'INR';
                    const defaultIncome = currentCurrency === 'USD' ? '6000' : '200000';
                    incomeInput.value = formatNumber(defaultIncome);
                    updateHelperText(incomeInput, formatNumber(defaultIncome));
                }
            }, 500);
        });
    } else {
        setTimeout(() => {
            initializeDefaultExpenses();
            
            // Set income default value
            const incomeInput = document.getElementById('expensesIncomeAmount');
            if (incomeInput && (!incomeInput.value || incomeInput.value.trim() === '')) {
                const currentCurrency = window.currentCurrency || 'INR';
                const defaultIncome = currentCurrency === 'USD' ? '6000' : '200000';
                incomeInput.value = formatNumber(defaultIncome);
                updateHelperText(incomeInput, formatNumber(defaultIncome));
            }
        }, 500);
    }

})();
