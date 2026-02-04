// Monthly Expenses Calculator Widget
(function(){
    
    let expenseCounter = 0;
    
    // Get currency-aware default expenses
    function getDefaultExpenses() {
        const currentCurrency = window.currentCurrency || 'INR';
        
        if (currentCurrency === 'USD') {
            return [
                { name: 'Rent/Mortgage', amount: 1500, category: 'housing' },
                { name: 'House Insurance', amount: 150, category: 'insurance' },
                { name: 'Car Insurance', amount: 120, category: 'insurance' },
                { name: 'Phone Bill', amount: 80, category: 'phone' },
                { name: 'Internet Bill', amount: 60, category: 'internet' },
                { name: 'Power Bill', amount: 100, category: 'utilities' },
                { name: 'Fuel/Gas', amount: 200, category: 'transportation' },
                { name: 'Groceries', amount: 500, category: 'food' },
                { name: 'Subscriptions (Netflix, etc)', amount: 50, category: 'entertainment' },
                { name: 'Miscellaneous', amount: 200, category: 'other' }
            ];
        } else {
            return [
                { name: 'Rent/Mortgage', amount: 25000, category: 'housing' },
                { name: 'House Insurance', amount: 2000, category: 'insurance' },
                { name: 'Car Insurance', amount: 3000, category: 'insurance' },
                { name: 'Phone Bill', amount: 500, category: 'phone' },
                { name: 'Internet Bill', amount: 1000, category: 'internet' },
                { name: 'Power Bill', amount: 2000, category: 'utilities' },
                { name: 'Fuel/Gas', amount: 5000, category: 'transportation' },
                { name: 'Groceries', amount: 15000, category: 'food' },
                { name: 'Subscriptions (Netflix, etc)', amount: 1500, category: 'entertainment' },
                { name: 'Miscellaneous', amount: 5000, category: 'other' }
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
                            <option value="insurance" ${category === 'insurance' ? 'selected' : ''}>Insurance</option>
                            <option value="utilities" ${category === 'utilities' ? 'selected' : ''}>Utilities</option>
                            <option value="phone" ${category === 'phone' ? 'selected' : ''}>Phone</option>
                            <option value="internet" ${category === 'internet' ? 'selected' : ''}>Internet</option>
                            <option value="transportation" ${category === 'transportation' ? 'selected' : ''}>Transportation</option>
                            <option value="food" ${category === 'food' ? 'selected' : ''}>Food</option>
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
        
        container.insertAdjacentHTML('afterbegin', expenseHtml);
        
        // Setup input validation for the new expense
        const expenseElement = document.getElementById(`expense-${expenseCounter}`);
        const amountInput = expenseElement.querySelector('.expense-amount-input');
        setupExpenseAmountInput(amountInput);
        
        // Setup category icon click to change category
        const categoryIcon = expenseElement.querySelector('.expense-category-icon');
        const categorySelect = expenseElement.querySelector('.expense-category-select-hidden');
        
        categoryIcon.addEventListener('click', function() {
            // Cycle through categories
            const categories = ['housing', 'insurance', 'utilities', 'phone', 'internet', 'transportation', 'food', 'entertainment', 'other'];
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
            // Get income inputs
            const incomeFrequency = document.getElementById('expensesIncomeFrequency').value;
            const incomeAmountInput = document.getElementById('expensesIncomeAmount').value.replace(/,/g, '');
            const incomeAmount = parseFloat(incomeAmountInput);

            if (isNaN(incomeAmount) || incomeAmount <= 0) {
                throw new Error('Please enter a valid income amount');
            }

            // Convert to monthly income
            let monthlyIncome = incomeAmount;
            if (incomeFrequency === 'biweekly') {
                monthlyIncome = incomeAmount * 26 / 12; // 26 biweekly periods per year
            } else if (incomeFrequency === 'weekly') {
                monthlyIncome = incomeAmount * 52 / 12; // 52 weeks per year
            }

            // Collect all expenses
            const expenseElements = document.querySelectorAll('.expense-item');
            const expenses = [];
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
                }
            });

            // Sort expenses by amount in descending order (highest first)
            expenses.sort((a, b) => b.amount - a.amount);
            
            // Reorder DOM elements to match sorted order
            const container = document.getElementById('expensesContainer');
            expenses.forEach(expense => {
                container.appendChild(expense.element);
            });

            const remainingAmount = monthlyIncome - totalExpenses;
            const savingsPercentage = (remainingAmount / monthlyIncome) * 100;

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
                    
                    // Format income input
                    setTimeout(() => {
                        const incomeInput = document.getElementById('expensesIncomeAmount');
                        if (incomeInput && incomeInput.value) {
                            const cleanValue = incomeInput.value.replace(/,/g, '');
                            const formatted = formatNumber(cleanValue);
                            incomeInput.value = formatted;
                            updateHelperText(incomeInput, formatted);
                        }
                    }, 50);
                }, 50);
            }
        };
    }

    // Listen for currency changes
    const originalSetCurrency = window.setCurrency;
    if (originalSetCurrency) {
        window.setCurrency = function(currency) {
            originalSetCurrency(currency);
            
            // Check if expenses calculator is active
            const expensesCalculator = document.getElementById('expensesCalculator');
            if (expensesCalculator && expensesCalculator.classList.contains('active')) {
                // Reinitialize expenses with new currency defaults
                setTimeout(() => {
                    initializeDefaultExpenses();
                    
                    // Update income input with new currency default
                    const incomeInput = document.getElementById('expensesIncomeAmount');
                    if (incomeInput) {
                        const currentCurrency = window.currentCurrency || 'INR';
                        const defaultIncome = currentCurrency === 'USD' ? '5000' : '100000';
                        incomeInput.value = formatNumber(defaultIncome);
                        updateHelperText(incomeInput, formatNumber(defaultIncome));
                    }
                }, 100);
            }
        };
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeDefaultExpenses, 500);
        });
    } else {
        setTimeout(initializeDefaultExpenses, 500);
    }

})();
