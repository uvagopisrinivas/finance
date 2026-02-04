// Retirement Planning Calculator Widget
(function(){
    
    let goalCounter = 0;
    
    // Get currency-aware default goals
    function getDefaultGoals() {
        const currentCurrency = window.currentCurrency || 'INR';
        
        // Get current values from inputs
        const currentAge = parseInt(document.getElementById('retirementCurrentAge')?.value) || 34;
        const targetRetirementAge = parseInt(document.getElementById('retirementTargetAge')?.value) || 41;
        const lifeExpectancy = parseInt(document.getElementById('retirementLifeExpectancy')?.value) || 70;
        
        const yearsToRetirement = Math.max(0, targetRetirementAge - currentAge);
        const yearsInRetirement = Math.max(0, lifeExpectancy - targetRetirementAge);
        
        if (currentCurrency === 'USD') {
            return [
                { name: "Monthly Living Expenses", amount: 3000, years: yearsToRetirement, duration: yearsInRetirement, annualIncrease: 3, goalType: 'recurring', isLivingExpense: true },
                { name: "Child's Wedding", amount: 50000, years: 25, goalType: 'onetime' },
                { name: "Child's Education", amount: 2000, years: 5, duration: 20, annualIncrease: 10, goalType: 'recurring' },
                { name: "Dream House", amount: 500000, years: 10, goalType: 'onetime' }
            ];
        } else {
            return [
                { name: "Monthly Living Expenses", amount: 90000, years: yearsToRetirement, duration: yearsInRetirement, annualIncrease: 3, goalType: 'recurring', isLivingExpense: true },
                { name: "Child's Wedding", amount: 10000000, years: 25, goalType: 'onetime' },
                { name: "Child's Education", amount: 8000, years: 5, duration: 20, annualIncrease: 10, goalType: 'recurring' },
                { name: "Dream House", amount: 20000000, years: 10, goalType: 'onetime' }
            ];
        }
    }

    // Initialize default goals
    function initializeDefaultGoals() {
        const container = document.getElementById('goalsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        goalCounter = 0;
        
        const defaultGoals = getDefaultGoals();
        defaultGoals.forEach(goal => {
            addGoalItem(goal.name, goal.amount, goal.years, goal.goalType, goal.duration, goal.annualIncrease);
        });
        
        // Initialize helper text for all goal amount inputs after a short delay
        setTimeout(() => {
            const goalAmountInputs = document.querySelectorAll('.goal-amount-input');
            goalAmountInputs.forEach(input => {
                if (input.value) {
                    updateHelperText(input, input.value);
                }
            });
        }, 100);
    }

    // Add new goal functionality
    window.addNewGoal = function() {
        const currentCurrency = window.currentCurrency || 'INR';
        const defaultAmount = currentCurrency === 'USD' ? 20000 : 500000;
        addGoalItem('', defaultAmount, 10, 'onetime', 10, 5);
    };

    function addGoalItem(name = '', amount = 500000, years = 10, goalType = 'onetime', duration = 10, annualIncrease = 5) {
        goalCounter++;
        const container = document.getElementById('goalsContainer');
        
        // Get current currency symbol
        const currentCurrency = window.currentCurrency || 'INR';
        const symbol = currentCurrency === 'USD' ? '$' : '₹';
        
        const goalHtml = `
            <tr class="goal-row" data-goal-timing="${goalType}" id="goal-${goalCounter}">
                <td class="goal-cell goal-cell--action">
                    <button type="button" class="goal-remove-btn" onclick="removeGoal(${goalCounter})" title="Remove Goal">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
                <td class="goal-cell">
                    <input type="text" class="form-input goal-name-input" value="${name}" placeholder="e.g., Child's Education">
                </td>
                <td class="goal-cell">
                    <select class="form-input goal-timing-select" onchange="updateGoalTiming(${goalCounter}, this.value)">
                        <option value="onetime" ${goalType === 'onetime' ? 'selected' : ''}>One-Time</option>
                        <option value="recurring" ${goalType === 'recurring' ? 'selected' : ''}>Recurring (Monthly)</option>
                    </select>
                </td>
                <td class="goal-cell">
                    <input type="text" class="form-input goal-amount-input" value="${formatNumber(amount)}" placeholder="Amount" inputmode="numeric">
                </td>
                <td class="goal-cell">
                    <input type="number" class="form-input goal-years-input" value="${years}" min="0" max="50" placeholder="Years">
                </td>
                <td class="goal-cell recurring-only" style="display: ${goalType === 'recurring' ? 'table-cell' : 'none'};">
                    <input type="number" class="form-input goal-duration-input" value="${duration}" min="1" max="50" placeholder="Duration">
                </td>
                <td class="goal-cell recurring-only" style="display: ${goalType === 'recurring' ? 'table-cell' : 'none'};">
                    <input type="number" class="form-input goal-increase-input" value="${annualIncrease}" min="0" max="20" step="0.5" placeholder="Increase %">
                </td>
            </tr>
        `;
        
        container.insertAdjacentHTML('beforeend', goalHtml);
        
        // Setup input validation for the new goal
        const goalElement = document.getElementById(`goal-${goalCounter}`);
        const amountInput = goalElement.querySelector('.goal-amount-input');
        
        // Setup the input validation first
        setupGoalAmountInput(amountInput);
        
        // Force initialize helper text multiple times to ensure it works
        const initializeHelper = () => {
            if (amountInput.value && amountInput.value.trim() !== '') {
                updateHelperText(amountInput, amountInput.value);
            }
        };
        
        // Try multiple times with different delays
        setTimeout(initializeHelper, 10);
        setTimeout(initializeHelper, 50);
        setTimeout(initializeHelper, 100);
    }

    window.updateGoalTiming = function(goalId, timing) {
        const goalElement = document.getElementById(`goal-${goalId}`);
        goalElement.setAttribute('data-goal-timing', timing);
        
        // Show/hide recurring fields
        const recurringFields = goalElement.querySelectorAll('.recurring-only');
        recurringFields.forEach(field => {
            field.style.display = timing === 'recurring' ? 'table-cell' : 'none';
        });
    };
    
    // Function to update living expense fields when age inputs change
    window.updateLivingExpenseFields = function() {
        const currentAge = parseInt(document.getElementById('retirementCurrentAge')?.value) || 34;
        const targetRetirementAge = parseInt(document.getElementById('retirementTargetAge')?.value) || 50;
        const lifeExpectancy = parseInt(document.getElementById('retirementLifeExpectancy')?.value) || 70;
        
        const yearsToRetirement = Math.max(0, targetRetirementAge - currentAge);
        const yearsInRetirement = Math.max(0, lifeExpectancy - targetRetirementAge);
        
        // Update all living expense goals
        document.querySelectorAll('.goal-row').forEach(row => {
            const nameInput = row.querySelector('.goal-name-input');
            const name = nameInput?.value || '';
            
            if (name.toLowerCase().includes('living') || name.toLowerCase().includes('expense')) {
                const startsInput = row.querySelector('.goal-years-input');
                const durationInput = row.querySelector('.goal-duration-input');
                const increaseInput = row.querySelector('.goal-increase-input');
                
                if (startsInput) startsInput.value = yearsToRetirement;
                if (durationInput) durationInput.value = yearsInRetirement;
                // Keep the user's increase percentage - don't override it
            }
        });
    };
    
    // Attach event listeners to age inputs
    setTimeout(() => {
        const ageInputs = ['retirementCurrentAge', 'retirementTargetAge', 'retirementLifeExpectancy'];
        ageInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', updateLivingExpenseFields);
                input.addEventListener('input', updateLivingExpenseFields);
            }
        });
    }, 1000);

    window.removeGoal = function(goalId) {
        const goalElement = document.getElementById(`goal-${goalId}`);
        if (goalElement) {
            goalElement.remove();
        }
    };

    function setupGoalAmountInput(input) {
        // Format initial value and show helper text
        if (input.value) {
            const formatted = formatNumber(input.value.replace(/,/g, ''));
            input.value = formatted;
            updateHelperText(input, formatted);
        }
        
        // Handle input events
        input.addEventListener('input', function(e) {
            // Store cursor position before formatting
            const cursorPosition = this.selectionStart;
            const oldValue = this.value;
            
            let value = this.value.replace(/,/g, '');
            value = value.replace(/[^\d]/g, '');
            
            if (value.length > 15) {
                value = value.substring(0, 15);
            }
            
            if (value && value !== '0') {
                const formatted = formatNumber(value);
                
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
                
                updateHelperText(this, formatted);
            } else {
                this.value = '';
                removeHelperText(this);
            }
        });

        input.addEventListener('focus', function(e) {
            // Keep helper text visible, just remove commas for easier editing
            this.value = this.value.replace(/,/g, '');
        });

        input.addEventListener('blur', function(e) {
            let value = this.value.replace(/,/g, '');
            if (value && !isNaN(value) && value !== '0') {
                const formatted = formatNumber(value);
                this.value = formatted;
                updateHelperText(this, formatted);
            } else if (value === '' || value === '0') {
                this.value = '';
                removeHelperText(this);
            }
        });
    }

    // Retirement Calculator
    window.calculateRetirement = function() {
        try {
            // Get basic inputs with better validation
            const currentAge = parseInt(document.getElementById('retirementCurrentAge').value);
            const targetRetirementAge = parseInt(document.getElementById('retirementTargetAge').value);
            const monthlySavingsInput = document.getElementById('retirementMonthlySavings').value.replace(/,/g, '');
            const monthlySavings = parseFloat(monthlySavingsInput);
            const currentCorpusInput = document.getElementById('retirementCurrentCorpus').value.replace(/,/g, '');
            const currentCorpus = parseFloat(currentCorpusInput) || 0;
            const returnRate = parseFloat(document.getElementById('retirementReturnRate').value) / 100;
            const inflationRate = parseFloat(document.getElementById('retirementInflationRate').value) / 100;
            const lifeExpectancy = parseInt(document.getElementById('retirementLifeExpectancy').value);
            const taxRate = parseFloat(document.getElementById('retirementTaxRate').value) / 100;

            // Enhanced validation
            if (isNaN(currentAge) || currentAge < 18 || currentAge > 65) {
                throw new Error('Please enter a valid current age between 18 and 65');
            }
            if (isNaN(targetRetirementAge) || targetRetirementAge <= currentAge) {
                throw new Error('Please enter a valid target retirement age greater than current age');
            }
            if (targetRetirementAge >= lifeExpectancy) {
                throw new Error('Target retirement age must be less than life expectancy');
            }
            if (isNaN(monthlySavings) || monthlySavings < 0) {
                throw new Error('Please enter a valid monthly savings amount (can be 0)');
            }
            if (isNaN(returnRate) || returnRate <= 0) {
                throw new Error('Please enter a valid return rate');
            }
            if (isNaN(inflationRate) || inflationRate < 0) {
                throw new Error('Please enter a valid inflation rate');
            }
            if (isNaN(lifeExpectancy) || lifeExpectancy <= currentAge) {
                throw new Error('Please enter a valid life expectancy greater than current age');
            }
            if (isNaN(taxRate) || taxRate < 0 || taxRate > 0.5) {
                throw new Error('Please enter a valid tax rate between 0% and 50%');
            }

            // Collect goals
            const goals = [];
            const goalElements = document.querySelectorAll('.goal-row');
            
            console.log('Found goal elements:', goalElements.length);
            
            // Calculate retirement parameters first
            const yearsToRetirement = targetRetirementAge - currentAge;
            const yearsInRetirement = lifeExpectancy - targetRetirementAge;
            
            if (yearsInRetirement < 5) {
                throw new Error('You need at least 5 years between retirement age and life expectancy');
            }
            
            goalElements.forEach(goalElement => {
                const name = goalElement.querySelector('.goal-name-input').value;
                const amount = parseFloat(goalElement.querySelector('.goal-amount-input').value.replace(/,/g, ''));
                const years = parseInt(goalElement.querySelector('.goal-years-input').value);
                const goalTiming = goalElement.getAttribute('data-goal-timing') || 'onetime';
                
                console.log('Processing goal:', { name, amount, years, goalTiming });
                
                if (name && amount > 0) {
                    if (goalTiming === 'recurring') {
                        let duration = parseInt(goalElement.querySelector('.goal-duration-input').value) || 10;
                        let annualIncrease = parseFloat(goalElement.querySelector('.goal-increase-input').value) || 0;
                        let startYear = years;
                        
                        // Special handling for living expenses - starts at retirement
                        if (name.toLowerCase().includes('living') || name.toLowerCase().includes('expense')) {
                            startYear = yearsToRetirement;
                            duration = yearsInRetirement;
                            // Keep the user's annualIncrease value - it will be applied on top of inflation
                        }
                        
                        // For recurring goals, store monthly amount and duration
                        goals.push({
                            name,
                            monthlyAmount: amount,
                            startYear: startYear,
                            endYear: startYear + duration,
                            duration: duration,
                            annualIncrease: annualIncrease / 100,
                            goalTiming: 'recurring',
                            isLivingExpense: name.toLowerCase().includes('living') || name.toLowerCase().includes('expense')
                        });
                    } else {
                        if (years > 0) {
                            // One-time goal - adjust for inflation
                            const futureValue = amount * Math.pow(1 + inflationRate, years);
                            goals.push({
                                name,
                                currentAmount: amount,
                                futureAmount: futureValue,
                                years,
                                goalTiming: 'onetime'
                            });
                        }
                    }
                }
            });
            
            console.log('Total goals collected:', goals.length, goals);

            // Calculate goals corpus (we only need corpus for the actual goal amounts)
            const totalGoalsCurrentValue = goals
                .filter(g => g.goalTiming === 'onetime')
                .reduce((sum, goal) => sum + goal.currentAmount, 0);
            const totalGoalsFutureValue = goals
                .filter(g => g.goalTiming === 'onetime')
                .reduce((sum, goal) => sum + goal.futureAmount, 0);
            
            // Using present value of annuity formula with post-retirement return
            const postRetirementReturn = Math.max(returnRate - 0.02, 0.06); // Conservative return in retirement
            
            // Calculate corpus needed for recurring goals (including living expenses)
            let recurringGoalsCorpus = 0;
            goals.filter(g => g.goalTiming === 'recurring').forEach(goal => {
                const goalStartYear = goal.startYear;
                const goalEndYear = goal.endYear;
                const activeYears = goalEndYear - goalStartYear;
                
                if (activeYears > 0) {
                    // Calculate the monthly amount at goal start (with inflation to that point)
                    const monthlyAmountAtStart = goal.monthlyAmount * Math.pow(1 + inflationRate, goalStartYear);
                    
                    // Calculate PV of this recurring expense stream with annual increases
                    let goalPV = 0;
                    let currentMonthly = monthlyAmountAtStart;
                    
                    for (let y = 0; y < activeYears; y++) {
                        const annualAmount = currentMonthly * 12;
                        const grossAnnual = annualAmount / (1 - taxRate);
                        const discountFactor = Math.pow(1 + postRetirementReturn, -(goalStartYear + y + 1));
                        goalPV += grossAnnual * discountFactor;
                        currentMonthly *= (1 + goal.annualIncrease); // Apply annual increase
                    }
                    
                    recurringGoalsCorpus += goalPV;
                }
            });

            // Total corpus needed (one-time goals + recurring goals including living expenses)
            const totalCorpusNeeded = totalGoalsFutureValue + recurringGoalsCorpus;
            
            // For display purposes, separate living expenses from other goals
            const livingExpenseGoal = goals.find(g => g.isLivingExpense);
            const monthlyExpenses = livingExpenseGoal ? livingExpenseGoal.monthlyAmount : 0;
            const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
            
            // Calculate retirement corpus (just for display - already included in recurringGoalsCorpus)
            const retirementCorpus = livingExpenseGoal ? recurringGoalsCorpus * (livingExpenseGoal.duration / (yearsInRetirement || 1)) : 0;
            
            // Calculate future value of current corpus
            const futureValueOfCurrentCorpus = currentCorpus * Math.pow(1 + returnRate, yearsToRetirement);
            
            // Calculate future value of monthly savings (what they're actually saving)
            const monthlyReturn = Math.pow(1 + returnRate, 1 / 12) - 1;
            const totalMonths = yearsToRetirement * 12;
            const futureValueOfSavings = monthlySavings > 0 
                ? monthlySavings * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn)
                : 0;
            
            // Total accumulated corpus with current savings plan
            const totalAccumulatedCorpus = futureValueOfCurrentCorpus + futureValueOfSavings;
            
            // Calculate shortfall or surplus
            const shortfall = totalCorpusNeeded - totalAccumulatedCorpus;
            const hasShortfall = shortfall > 0;
            
            // Calculate required monthly savings to meet the goal
            const additionalCorpusNeeded = Math.max(0, totalCorpusNeeded - futureValueOfCurrentCorpus);
            let requiredMonthlySavings = 0;
            if (additionalCorpusNeeded > 0 && totalMonths > 0 && monthlyReturn > 0) {
                // SIP formula: FV = P * [(1 + r)^n - 1] / r
                // Solving for P: P = FV * r / [(1 + r)^n - 1]
                const sipFactor = (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn;
                if (sipFactor > 0) {
                    requiredMonthlySavings = additionalCorpusNeeded / sipFactor;
                }
            }
            
            // Calculate surplus/deficit
            const surplus = totalAccumulatedCorpus - totalCorpusNeeded;

            const tableResults = generateRetirementTable(goals, {
                currentAge,
                retirementAge: targetRetirementAge,
                monthlySavings: monthlySavings,
                currentCorpus,
                returnRate,
                postRetirementReturn,
                inflationRate,
                monthlyExpenses,
                lifeExpectancy,
                taxRate,
                yearsToRetirement,
                yearsInRetirement,
                totalCorpusNeeded,
                totalAccumulatedCorpus,
                futureMonthlyExpenses,
                retirementCorpus,
                futureValueOfCurrentCorpus,
                futureValueOfSavings,
                surplus,
                requiredMonthlySavings,
                hasShortfall,
                shortfall
            });

            // Adjust surplus and required savings based on whether money runs out
            let actualSurplus = surplus;
            let actualRequiredSavings = requiredMonthlySavings;
            
            if (tableResults && tableResults.moneyRunsOut) {
                actualSurplus = 0; // No surplus if money runs out
                
                // Calculate how much more corpus is needed to last until life expectancy
                // The shortfall is the negative portfolio value when money runs out
                const yearsShort = lifeExpectancy - tableResults.moneyRunsOutAge;
                
                // Estimate additional corpus needed (rough calculation)
                // We need enough to cover the remaining years with similar withdrawal patterns
                const avgAnnualWithdrawal = totalCorpusNeeded / yearsInRetirement; // Average annual need
                const additionalCorpusForShortfall = avgAnnualWithdrawal * yearsShort * 1.2; // 20% buffer
                
                // Recalculate required monthly savings with the additional corpus
                const totalCorpusNeededAdjusted = totalCorpusNeeded + additionalCorpusForShortfall;
                const additionalCorpusNeededAdjusted = Math.max(0, totalCorpusNeededAdjusted - futureValueOfCurrentCorpus);
                
                if (additionalCorpusNeededAdjusted > 0 && totalMonths > 0 && monthlyReturn > 0) {
                    const sipFactor = (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn;
                    if (sipFactor > 0) {
                        actualRequiredSavings = additionalCorpusNeededAdjusted / sipFactor;
                    }
                }
            }

            // Update results
            document.getElementById('retirementCalculatedAge').textContent = targetRetirementAge + ' years';
            document.getElementById('retirementYearsLeft').textContent = yearsToRetirement;
            document.getElementById('retirementTotalCorpus').textContent = formatCurrencyReadable(totalCorpusNeeded);
            document.getElementById('retirementCurrentSavings').textContent = formatCurrencyReadable(monthlySavings);
            
            // Show required savings with helpful message when there's a surplus
            const requiredSavingsElement = document.getElementById('retirementRequiredSavings');
            if (tableResults && tableResults.moneyRunsOut) {
                requiredSavingsElement.textContent = formatCurrencyReadable(actualRequiredSavings);
                requiredSavingsElement.style.color = 'var(--color-error)';
                requiredSavingsElement.style.fontSize = '';
                requiredSavingsElement.title = `Money runs out at age ${tableResults.moneyRunsOutAge}. This is the monthly savings needed to last until age ${lifeExpectancy}`;
            } else if (actualRequiredSavings === 0 || surplus > 0) {
                requiredSavingsElement.textContent = '₹0 (Goal Already Met!)';
                requiredSavingsElement.style.color = 'var(--color-success)';
                requiredSavingsElement.style.fontSize = '';
            } else {
                requiredSavingsElement.textContent = formatCurrencyReadable(actualRequiredSavings);
                requiredSavingsElement.style.color = '';
                requiredSavingsElement.style.fontSize = '';
            }
            
            document.getElementById('retirementAccumulatedCorpus').textContent = formatCurrencyReadable(totalAccumulatedCorpus);
            
            // Show shortfall or surplus (use actualSurplus which accounts for money running out)
            const shortfallElement = document.getElementById('retirementShortfall');
            if (tableResults && tableResults.moneyRunsOut) {
                shortfallElement.textContent = `⚠️ Runs out at age ${tableResults.moneyRunsOutAge}`;
                shortfallElement.style.color = 'var(--color-error)';
                shortfallElement.parentElement.querySelector('.detail-label').textContent = '⚠️ Money Runs Out';
            } else if (hasShortfall || actualSurplus <= 0) {
                shortfallElement.textContent = formatCurrencyReadable(Math.abs(actualSurplus));
                shortfallElement.style.color = 'var(--color-error)';
                shortfallElement.parentElement.querySelector('.detail-label').textContent = '⚠️ Shortfall';
            } else {
                shortfallElement.textContent = formatCurrencyReadable(actualSurplus);
                shortfallElement.style.color = 'var(--color-success)';
                shortfallElement.parentElement.querySelector('.detail-label').textContent = '✅ Surplus';
            }

            // Show results
            document.getElementById('retirementResults').style.display = 'block';

            // Add copy buttons
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateRetirementTable(goals, params) {
        // Debug logging
        console.log('generateRetirementTable params:', params);
        
        // Validate parameters to prevent NaN values
        const monthlySavings = parseFloat(params.monthlySavings) || 0;
        const currentCorpus = parseFloat(params.currentCorpus) || 0; 
        const returnRate = parseFloat(params.returnRate) || 0.12;
        // Use conservative post-retirement return if provided, else fall back
        const postRetirementReturn =
            typeof params.postRetirementReturn === 'number'
                ? params.postRetirementReturn
                : returnRate;
        const currentAge = parseInt(params.currentAge) || 30;
        const totalCorpusNeeded = parseFloat(params.totalCorpusNeeded) || 0;
        
        console.log('Parsed values:', {
            monthlySavings,
            currentCorpus,
            returnRate,
            currentAge,
            totalCorpusNeeded,
            monthlyExpenses: params.monthlyExpenses,
            retirementAge: params.retirementAge,
            lifeExpectancy: params.lifeExpectancy,
            inflationRate: params.inflationRate
        });
        
        // Separate one-time and recurring goals
        const onetimeGoals = goals.filter(g => g.goalTiming === 'onetime');
        const recurringGoals = goals.filter(g => g.goalTiming === 'recurring');
        
        // Create goals breakdown table
        const goalsTableHtml = `
            <div class="table-container">
                <h4 style="margin: var(--space-lg) 0 var(--space-md) 0; color: var(--color-text-primary);">
                    <i class="fas fa-bullseye"></i> Goals Breakdown
                </h4>
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-tag"></i> Goal</th>
                            <th><i class="fas fa-clock"></i> Type</th>
                            <th><i class="fas fa-calendar-alt"></i> Timeline</th>
                            <th><i class="fas fa-rupee-sign"></i> Amount</th>
                            <th><i class="fas fa-chart-line"></i> Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${onetimeGoals.map(goal => {
                            const inflationImpact = ((goal.futureAmount - goal.currentAmount) / goal.currentAmount) * 100;
                            const goalAge = currentAge + goal.years;
                            return `
                            <tr>
                                <td class="table__year">${goal.name}</td>
                                <td class="table__year"><span class="badge badge--info">One-Time</span></td>
                                <td class="table__year">Age ${goalAge} (Year ${goal.years})</td>
                                <td class="table__balance">${formatCurrency(goal.futureAmount)}</td>
                                <td class="table__percent">Today: ${formatCurrency(goal.currentAmount)}<br><small>Inflation: ${inflationImpact.toFixed(1)}%</small></td>
                            </tr>
                        `}).join('')}
                        ${recurringGoals.map(goal => {
                            const startAge = currentAge + goal.startYear;
                            const endAge = currentAge + goal.endYear;
                            const futureMonthlyStart = goal.monthlyAmount * Math.pow(1 + params.inflationRate, goal.startYear);
                            const yearsOfIncrease = goal.duration - 1;
                            const futureMonthlyEnd = futureMonthlyStart * Math.pow(1 + goal.annualIncrease, yearsOfIncrease);
                            return `
                            <tr>
                                <td class="table__year">${goal.name}</td>
                                <td class="table__year"><span class="badge badge--warning">Recurring</span></td>
                                <td class="table__year">Age ${startAge}-${endAge}<br><small>(${goal.duration} years)</small></td>
                                <td class="table__balance">${formatCurrency(futureMonthlyStart)}/mo<br><small>to ${formatCurrency(futureMonthlyEnd)}/mo</small></td>
                                <td class="table__percent">Today: ${formatCurrency(goal.monthlyAmount)}/mo<br><small>+${(goal.annualIncrease * 100).toFixed(1)}% yearly</small></td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Create year-wise investment projection
        const yearlyData = [];
        let cumulativeInvestment = 0;
        let portfolioValue = currentCorpus; // Start with current corpus
        
        // Calculate retirement parameters
        const yearsToRetirement = params.retirementAge - params.currentAge;
        const yearsInRetirement = params.lifeExpectancy - params.retirementAge;
        const totalYears = yearsToRetirement + yearsInRetirement;
        
        console.log('Retirement calculation:', {
            yearsToRetirement,
            yearsInRetirement,
            totalYears,
            retirementAge: params.retirementAge,
            lifeExpectancy: params.lifeExpectancy,
            currentAge: params.currentAge
        });
        
        // Calculate future monthly expenses at retirement (adjusted for inflation until retirement)
        const futureMonthlyExpensesAtRetirement = params.monthlyExpenses * Math.pow(1 + params.inflationRate, yearsToRetirement);
        
        console.log('Monthly expenses calculation:', {
            currentMonthlyExpenses: params.monthlyExpenses,
            inflationRate: params.inflationRate,
            yearsToRetirement,
            futureMonthlyExpensesAtRetirement
        });
        
        for (let year = 1; year <= totalYears; year++) {
            const currentAgeInYear = params.currentAge + year;
            const isRetired = currentAgeInYear >= params.retirementAge;
            const yearsIntoRetirement = Math.max(0, currentAgeInYear - params.retirementAge);
            
            // Check if any one-time goals are due this year
            const onetimeGoalsThisYear = onetimeGoals.filter(goal => {
                const goalYear = goal.years;
                return goalYear === year;
            });
            const totalOnetimeGoalExpenses = onetimeGoalsThisYear.reduce((sum, goal) => sum + goal.futureAmount, 0);
            
            // Calculate recurring goal expenses for this year
            let totalRecurringGoalExpenses = 0;
            const activeRecurringGoals = [];
            
            recurringGoals.forEach(goal => {
                // Check if this goal is active this year
                if (year >= goal.startYear && year < goal.endYear) {
                    // Calculate monthly amount for this year
                    const yearsIntoGoal = year - goal.startYear;
                    
                    // Apply inflation to get to start year, then apply annual increases
                    const monthlyAmountAtStart = goal.monthlyAmount * Math.pow(1 + params.inflationRate, goal.startYear);
                    const monthlyAmountThisYear = monthlyAmountAtStart * Math.pow(1 + goal.annualIncrease, yearsIntoGoal);
                    const annualAmount = monthlyAmountThisYear * 12;
                    
                    totalRecurringGoalExpenses += annualAmount;
                    activeRecurringGoals.push({
                        ...goal,
                        monthlyAmountThisYear: monthlyAmountThisYear,
                        annualAmountThisYear: annualAmount
                    });
                }
            });
            
            if (!isRetired) {
                // Accumulation phase - still working and investing
                const yearlyInvestment = params.monthlySavings * 12;
                cumulativeInvestment += yearlyInvestment;
                
                // Apply returns to existing portfolio + add new investment
                portfolioValue = (portfolioValue * (1 + params.returnRate)) + yearlyInvestment;
                
                // Deduct one-time goal expenses if any goals are due this year (including taxes)
                const grossOnetimeGoalExpenses = totalOnetimeGoalExpenses / (1 - params.taxRate);
                portfolioValue -= grossOnetimeGoalExpenses;
                
                // Deduct recurring goal expenses (including taxes)
                const grossRecurringGoalExpenses = totalRecurringGoalExpenses / (1 - params.taxRate);
                portfolioValue -= grossRecurringGoalExpenses;
                
                // Tax is calculated for display purposes
                const taxOnOnetimeGoals = grossOnetimeGoalExpenses * params.taxRate;
                const taxOnRecurringGoals = grossRecurringGoalExpenses * params.taxRate;
                
                const shortfallOrSurplus = params.totalCorpusNeeded - portfolioValue;
                
                yearlyData.push({
                    year: year,
                    age: currentAgeInYear,
                    yearlyInvestment: yearlyInvestment,
                    cumulativeInvestment: cumulativeInvestment,
                    portfolioValue: portfolioValue,
                    monthlyExpenses: 0, // No monthly expenses during accumulation
                    onetimeGoalExpenses: totalOnetimeGoalExpenses,
                    recurringGoalExpenses: totalRecurringGoalExpenses,
                    grossOnetimeGoalWithdrawal: grossOnetimeGoalExpenses,
                    grossRecurringGoalWithdrawal: grossRecurringGoalExpenses,
                    taxOnOnetimeGoals: taxOnOnetimeGoals,
                    taxOnRecurringGoals: taxOnRecurringGoals,
                    onetimeGoalsThisYear: onetimeGoalsThisYear,
                    activeRecurringGoals: activeRecurringGoals,
                    shortfallOrSurplus: shortfallOrSurplus,
                    isShortfall: shortfallOrSurplus > 0,
                    phase: 'accumulation'
                });
            } else {
                // Retirement phase - withdrawing for expenses
                const yearlyInvestment = 0; // No more investments
                
                // Check if we have any money left at the start of the year
                if (portfolioValue <= 0) {
                    // No money left - cannot make any withdrawals
                    yearlyData.push({
                        year: year,
                        age: currentAgeInYear,
                        yearlyInvestment: 0,
                        cumulativeInvestment: cumulativeInvestment,
                        portfolioValue: 0,
                        monthlyExpenses: 0,
                        grossMonthlyWithdrawal: 0,
                        taxOnExpenses: 0,
                        monthlyTaxOnExpenses: 0,
                        onetimeGoalExpenses: 0,
                        recurringGoalExpenses: 0,
                        grossOnetimeGoalWithdrawal: 0,
                        grossRecurringGoalWithdrawal: 0,
                        taxOnOnetimeGoals: 0,
                        taxOnRecurringGoals: 0,
                        onetimeGoalsThisYear: [],
                        activeRecurringGoals: [],
                        shortfallOrSurplus: 0,
                        isShortfall: true,
                        phase: 'retirement',
                        moneyDepleted: true
                    });
                    continue;
                }
                
                // Calculate monthly expenses for this retirement year (with inflation from retirement start)
                const netMonthlyExpensesThisYear = futureMonthlyExpensesAtRetirement * Math.pow(1 + params.inflationRate, yearsIntoRetirement);
                const netAnnualExpensesThisYear = netMonthlyExpensesThisYear * 12;
                
                // Calculate gross withdrawal needed (including taxes)
                const grossAnnualExpenses = netAnnualExpensesThisYear / (1 - params.taxRate);
                const grossOnetimeGoalExpenses = totalOnetimeGoalExpenses / (1 - params.taxRate);
                const grossRecurringGoalExpenses = totalRecurringGoalExpenses / (1 - params.taxRate);
                
                // Calculate what we can actually withdraw (limited by available funds)
                const totalNeededWithdrawal = grossAnnualExpenses + grossOnetimeGoalExpenses + grossRecurringGoalExpenses;
                const maxAvailableAfterReturns = portfolioValue * (1 + postRetirementReturn);
                
                // If we don't have enough money for full withdrawal, reduce proportionally
                let actualGrossAnnualExpenses = grossAnnualExpenses;
                let actualGrossOnetimeGoalExpenses = grossOnetimeGoalExpenses;
                let actualGrossRecurringGoalExpenses = grossRecurringGoalExpenses;
                
                if (totalNeededWithdrawal > maxAvailableAfterReturns) {
                    const reductionFactor = maxAvailableAfterReturns / totalNeededWithdrawal;
                    actualGrossAnnualExpenses = grossAnnualExpenses * reductionFactor;
                    actualGrossOnetimeGoalExpenses = grossOnetimeGoalExpenses * reductionFactor;
                    actualGrossRecurringGoalExpenses = grossRecurringGoalExpenses * reductionFactor;
                }
                
                const actualTotalWithdrawal = actualGrossAnnualExpenses + actualGrossOnetimeGoalExpenses + actualGrossRecurringGoalExpenses;
                
                // Calculate net amounts (after tax)
                const actualNetAnnualExpenses = actualGrossAnnualExpenses * (1 - params.taxRate);
                const actualNetOnetimeGoalExpenses = actualGrossOnetimeGoalExpenses * (1 - params.taxRate);
                const actualNetRecurringGoalExpenses = actualGrossRecurringGoalExpenses * (1 - params.taxRate);
                const actualMonthlyExpenses = actualNetAnnualExpenses / 12;
                
                // Tax calculations
                const taxOnExpenses = actualGrossAnnualExpenses * params.taxRate;
                const monthlyTaxOnExpenses = taxOnExpenses / 12;
                const taxOnOnetimeGoals = actualGrossOnetimeGoalExpenses * params.taxRate;
                const taxOnRecurringGoals = actualGrossRecurringGoalExpenses * params.taxRate;
                
                // Apply returns and subtract actual withdrawals
                portfolioValue = (portfolioValue * (1 + postRetirementReturn)) - actualTotalWithdrawal;
                
                // During retirement, surplus is remaining portfolio value, deficit is negative portfolio
                const remainingAfterExpenses = portfolioValue;
                const shortfallOrSurplus = remainingAfterExpenses < 0 ? Math.abs(remainingAfterExpenses) : remainingAfterExpenses;
                const isShortfall = remainingAfterExpenses < 0;
                
                yearlyData.push({
                    year: year,
                    age: currentAgeInYear,
                    yearlyInvestment: yearlyInvestment,
                    cumulativeInvestment: cumulativeInvestment,
                    portfolioValue: Math.max(0, portfolioValue),
                    monthlyExpenses: actualMonthlyExpenses,
                    grossMonthlyWithdrawal: actualGrossAnnualExpenses / 12,
                    taxOnExpenses: taxOnExpenses,
                    monthlyTaxOnExpenses: monthlyTaxOnExpenses,
                    onetimeGoalExpenses: actualNetOnetimeGoalExpenses,
                    recurringGoalExpenses: actualNetRecurringGoalExpenses,
                    grossOnetimeGoalWithdrawal: actualGrossOnetimeGoalExpenses,
                    grossRecurringGoalWithdrawal: actualGrossRecurringGoalExpenses,
                    taxOnOnetimeGoals: taxOnOnetimeGoals,
                    taxOnRecurringGoals: taxOnRecurringGoals,
                    onetimeGoalsThisYear: actualNetOnetimeGoalExpenses > 0 ? onetimeGoalsThisYear : [],
                    activeRecurringGoals: actualNetRecurringGoalExpenses > 0 ? activeRecurringGoals : [],
                    shortfallOrSurplus: shortfallOrSurplus,
                    isShortfall: isShortfall,
                    phase: 'retirement',
                    moneyDepleted: portfolioValue <= 0
                });
            }
        }

        // Calculate legacy amount and money depletion info
        const legacyAmount = yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].portfolioValue : 0;
        
        // Find when money runs out (if it does)
        let moneyRunsOutAge = null;
        let moneyRunsOutYear = null;
        for (let i = 0; i < yearlyData.length; i++) {
            if (yearlyData[i].portfolioValue <= 0) {
                moneyRunsOutAge = yearlyData[i].age;
                moneyRunsOutYear = yearlyData[i].year;
                break;
            }
        }
        
        // Add legacy amount and depletion info to the retirement details section
        setTimeout(() => {
            const retirementDetails = document.querySelector('.retirement-details');
            if (retirementDetails) {
                // Remove existing legacy elements
                const existingLegacy = document.querySelectorAll('.legacy-info');
                existingLegacy.forEach(el => el.remove());
                
                if (moneyRunsOutAge) {
                    // Money runs out - show warning
                    const depletionDiv = document.createElement('div');
                    depletionDiv.className = 'retirement-detail-item legacy-info depletion-warning';
                    depletionDiv.innerHTML = `
                        <span class="detail-label">⚠️ Money Runs Out At Age</span>
                        <span class="detail-value">${moneyRunsOutAge} years</span>
                    `;
                    retirementDetails.appendChild(depletionDiv);
                } else {
                    // Money lasts - show legacy amount
                    const legacyDiv = document.createElement('div');
                    legacyDiv.className = 'retirement-detail-item legacy-info legacy-success';
                    legacyDiv.innerHTML = `
                        <span class="detail-label">💰 Legacy Amount (At Age ${params.lifeExpectancy})</span>
                        <span class="detail-value">${formatCurrencyReadable(legacyAmount)}</span>
                    `;
                    retirementDetails.appendChild(legacyDiv);
                }
            }
        }, 100);

        const projectionTableHtml = `
            <div class="table-container ${yearlyData.length > 6 ? 'has-scroll' : ''}">
                <h4 style="margin: var(--space-xl) 0 var(--space-md) 0; color: var(--color-text-primary);">
                    <i class="fas fa-chart-area"></i> Year-wise Cash Flow Analysis
                </h4>
                <table class="table table--indian table--cashflow">
                    <thead class="table__header">
                        <tr>
                            <th>AGE</th>
                            <th>PORTFOLIO START</th>
                            <th>WITHDRAWALS</th>
                            <th>TAX ON WITHDRAWALS</th>
                            <th>PORTFOLIO END</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${yearlyData.map((row, index) => {
                            // Use pre-calculated values from row data
                            let portfolioStart, totalWithdrawals, totalTax, portfolioEnd;
                            
                            if (index === 0) {
                                portfolioStart = params.currentCorpus;
                            } else {
                                portfolioStart = yearlyData[index - 1].portfolioValue;
                            }
                            
                            // Calculate withdrawals and tax from row data
                            const livingExpenses = row.monthlyExpenses * 12;
                            const onetimeGoalExpenses = row.onetimeGoalExpenses || 0;
                            const recurringGoalExpenses = row.recurringGoalExpenses || 0;
                            totalWithdrawals = livingExpenses + onetimeGoalExpenses + recurringGoalExpenses;
                            totalTax = (row.taxOnExpenses || 0) + (row.taxOnOnetimeGoals || 0) + (row.taxOnRecurringGoals || 0);
                            
                            // Use the pre-calculated portfolio end value from row data
                            portfolioEnd = row.portfolioValue;

                            // Format withdrawals display with monthly breakdown
                            let withdrawalsDisplay = '-';
                            
                            // Check if money has run out - still show the numbers to explain the shortfall
                            if (row.moneyDepleted) {
                                // Show what was needed even though funds aren't available
                                const parts = [];
                                
                                // Living expenses
                                if (livingExpenses > 0) {
                                    const monthlyLiving = livingExpenses / 12;
                                    parts.push(`${formatCurrency(livingExpenses)} living<br><small style="color: var(--color-text-secondary);">(${formatCurrency(monthlyLiving)}/mo)</small>`);
                                }
                                
                                // Show what was needed for goals
                                if (recurringGoalExpenses > 0 && row.activeRecurringGoals && row.activeRecurringGoals.length > 0) {
                                    const nonLivingGoals = row.activeRecurringGoals.filter(g => !g.isLivingExpense);
                                    
                                    if (nonLivingGoals.length > 0) {
                                        const goalsByType = nonLivingGoals.map(g => {
                                            let icon = '💰';
                                            const nameLower = g.name.toLowerCase();
                                            if (nameLower.includes('education')) icon = '📚';
                                            else if (nameLower.includes('health')) icon = '🏥';
                                            else if (nameLower.includes('travel')) icon = '✈️';
                                            else if (nameLower.includes('car')) icon = '🚗';
                                            else if (nameLower.includes('insurance')) icon = '🛡️';
                                            
                                            return `${icon} ${g.name}: ${formatCurrency(g.monthlyAmountThisYear)}/mo`;
                                        }).join('<br>');
                                        
                                        const nonLivingTotal = nonLivingGoals.reduce((sum, g) => sum + (g.annualAmountThisYear || 0), 0);
                                        parts.push(`<span style="color: var(--color-warning);">${formatCurrency(nonLivingTotal)} recurring</span><br><small style="color: var(--color-text-secondary);">${goalsByType}</small>`);
                                    }
                                }
                                
                                if (onetimeGoalExpenses > 0 && row.onetimeGoalsThisYear && row.onetimeGoalsThisYear.length > 0) {
                                    const onetimeGoalsWithIcons = row.onetimeGoalsThisYear.map(goal => {
                                        let icon = '🎯';
                                        const nameLower = goal.name.toLowerCase();
                                        if (nameLower.includes('wedding')) icon = '💍';
                                        else if (nameLower.includes('house')) icon = '🏡';
                                        else if (nameLower.includes('car')) icon = '🚗';
                                        else if (nameLower.includes('business')) icon = '💼';
                                        else if (nameLower.includes('travel')) icon = '✈️';
                                        else if (nameLower.includes('education')) icon = '🎓';
                                        
                                        return `${icon} ${goal.name}`;
                                    }).join(', ');
                                    
                                    parts.push(`<span style="color: var(--color-info);">${formatCurrency(onetimeGoalExpenses)}</span><br><small style="color: var(--color-text-secondary);">(${onetimeGoalsWithIcons})</small>`);
                                }
                                
                                if (parts.length > 0) {
                                    withdrawalsDisplay = parts.join('<br>+ ') + '<br><span style="color: var(--color-error); font-size: 0.85em; margin-top: 4px; display: block;">⚠️ Insufficient funds</span>';
                                } else {
                                    withdrawalsDisplay = '<span style="color: var(--color-error);">⚠️ No funds available</span>';
                                }
                            } else {
                                const parts = [];
                                
                                // Living expenses
                                if (livingExpenses > 0) {
                                    const monthlyLiving = livingExpenses / 12;
                                    parts.push(`${formatCurrency(livingExpenses)} living<br><small style="color: var(--color-text-secondary);">(${formatCurrency(monthlyLiving)}/mo)</small>`);
                                }
                                
                                // Recurring goals (excluding living expenses which are shown separately)
                                if (recurringGoalExpenses > 0 && row.activeRecurringGoals && row.activeRecurringGoals.length > 0) {
                                    // Filter out living expenses from recurring goals display
                                    const nonLivingGoals = row.activeRecurringGoals.filter(g => !g.isLivingExpense);
                                    
                                    if (nonLivingGoals.length > 0) {
                                        // Group goals by type and show with appropriate icons
                                        const goalsByType = nonLivingGoals.map(g => {
                                            // Determine icon based on goal name
                                            let icon = '📚'; // default for education
                                            const nameLower = g.name.toLowerCase();
                                            
                                            if (nameLower.includes('education') || nameLower.includes('school') || nameLower.includes('college')) {
                                                icon = '📚';
                                            } else if (nameLower.includes('health') || nameLower.includes('medical')) {
                                                icon = '🏥';
                                            } else if (nameLower.includes('travel') || nameLower.includes('vacation')) {
                                                icon = '✈️';
                                            } else if (nameLower.includes('car') || nameLower.includes('vehicle')) {
                                                icon = '�';
                                            } else if (nameLower.includes('insurance')) {
                                                icon = '�️';
                                            } else {
                                                icon = '💰';
                                            }
                                            
                                            return `${icon} ${g.name}: ${formatCurrency(g.monthlyAmountThisYear)}/mo`;
                                        }).join('<br>');
                                        
                                        // Calculate total for non-living recurring goals
                                        const nonLivingTotal = nonLivingGoals.reduce((sum, g) => sum + (g.annualAmountThisYear || 0), 0);
                                        
                                        parts.push(`<span style="color: var(--color-warning);">${formatCurrency(nonLivingTotal)} recurring</span><br><small style="color: var(--color-text-secondary);">${goalsByType}</small>`);
                                    }
                                }
                                
                                // One-time goals
                                if (onetimeGoalExpenses > 0 && row.onetimeGoalsThisYear && row.onetimeGoalsThisYear.length > 0) {
                                    const onetimeGoalsWithIcons = row.onetimeGoalsThisYear.map(goal => {
                                        // Determine icon based on goal name
                                        let icon = '🎯'; // default
                                        const nameLower = goal.name.toLowerCase();
                                        
                                        if (nameLower.includes('wedding') || nameLower.includes('marriage')) {
                                            icon = '💍';
                                        } else if (nameLower.includes('house') || nameLower.includes('home') || nameLower.includes('property')) {
                                            icon = '🏡';
                                        } else if (nameLower.includes('car') || nameLower.includes('vehicle')) {
                                            icon = '🚗';
                                        } else if (nameLower.includes('business') || nameLower.includes('startup')) {
                                            icon = '💼';
                                        } else if (nameLower.includes('vacation') || nameLower.includes('travel') || nameLower.includes('trip')) {
                                            icon = '✈️';
                                        } else if (nameLower.includes('education') || nameLower.includes('college')) {
                                            icon = '🎓';
                                        } else {
                                            icon = '🎯';
                                        }
                                        
                                        return `${icon} ${goal.name}`;
                                    }).join(', ');
                                    
                                    parts.push(`<span style="color: var(--color-info);">${formatCurrency(onetimeGoalExpenses)}</span><br><small style="color: var(--color-text-secondary);">(${onetimeGoalsWithIcons})</small>`);
                                }
                                
                                withdrawalsDisplay = parts.length > 0 ? parts.join('<br>+ ') : '-';
                            }
                            
                            // Reformat for better readability
                            if (withdrawalsDisplay !== '-' && !withdrawalsDisplay.includes('No funds')) {
                                const withdrawalItems = [];
                                
                                // Parse living expenses
                                if (livingExpenses > 0) {
                                    withdrawalItems.push({
                                        label: '🏠 Living',
                                        annual: livingExpenses,
                                        monthly: livingExpenses / 12
                                    });
                                }
                                
                                // Parse recurring goals (non-living)
                                if (row.activeRecurringGoals) {
                                    row.activeRecurringGoals.filter(g => !g.isLivingExpense).forEach(g => {
                                        let icon = '💰';
                                        const nameLower = g.name.toLowerCase();
                                        if (nameLower.includes('education')) icon = '📚';
                                        else if (nameLower.includes('health')) icon = '🏥';
                                        else if (nameLower.includes('travel')) icon = '✈️';
                                        else if (nameLower.includes('car')) icon = '🚗';
                                        else if (nameLower.includes('insurance')) icon = '🛡️';
                                        
                                        withdrawalItems.push({
                                            label: `${icon} ${g.name}`,
                                            annual: g.annualAmountThisYear,
                                            monthly: g.monthlyAmountThisYear
                                        });
                                    });
                                }
                                
                                // Parse one-time goals
                                if (row.onetimeGoalsThisYear && row.onetimeGoalsThisYear.length > 0) {
                                    row.onetimeGoalsThisYear.forEach(goal => {
                                        let icon = '🎯';
                                        const nameLower = goal.name.toLowerCase();
                                        if (nameLower.includes('wedding')) icon = '💍';
                                        else if (nameLower.includes('house')) icon = '🏡';
                                        else if (nameLower.includes('car')) icon = '🚗';
                                        else if (nameLower.includes('business')) icon = '💼';
                                        else if (nameLower.includes('travel')) icon = '✈️';
                                        else if (nameLower.includes('education')) icon = '🎓';
                                        
                                        withdrawalItems.push({
                                            label: `${icon} ${goal.name}`,
                                            annual: goal.futureAmount,
                                            monthly: null
                                        });
                                    });
                                }
                                
                                // Build clean display
                                if (withdrawalItems.length > 0) {
                                    const itemsHtml = withdrawalItems.map(item => {
                                        if (item.monthly) {
                                            return `<div style="margin-bottom: 4px;"><strong>${item.label}:</strong> ${formatCurrency(item.annual)} <small style="color: var(--color-text-secondary);">(${formatCurrency(item.monthly)}/mo)</small></div>`;
                                        } else {
                                            return `<div style="margin-bottom: 4px;"><strong>${item.label}:</strong> ${formatCurrency(item.annual)}</div>`;
                                        }
                                    }).join('');
                                    
                                    // Calculate total from the actual items being displayed
                                    const displayTotal = withdrawalItems.reduce((sum, item) => sum + item.annual, 0);
                                    
                                    if (withdrawalItems.length > 1) {
                                        withdrawalsDisplay = `${itemsHtml}<div style="border-top: 2px dashed rgba(255,255,255,0.4); margin-top: 8px; padding-top: 8px;"><strong>Total:</strong> ${formatCurrency(displayTotal)}</div>`;
                                    } else {
                                        withdrawalsDisplay = itemsHtml;
                                    }
                                }
                            }
                            
                            // Build portfolio end breakdown
                            let portfolioEndDisplay = formatCurrency(Math.max(0, portfolioEnd));
                            
                            // Don't show breakdown if money has run out, but show the shortfall
                            if (row.moneyDepleted) {
                                const shortfall = Math.abs(portfolioEnd);
                                portfolioEndDisplay = `<span style="color: var(--color-error);">-${formatCurrency(shortfall)}<br><small>(Shortfall - Funds Depleted)</small></span>`;
                            }
                            // Add breakdown details for portfolio growth
                            else if (row.phase === 'accumulation' && row.yearlyInvestment > 0) {
                                // Calculate returns separately for portfolio and savings
                                const portfolioReturns = portfolioStart * returnRate;
                                const savingsReturns = row.yearlyInvestment * returnRate;
                                
                                const breakdownItems = [];
                                if (portfolioStart > 0) {
                                    breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Start:</strong> ${formatCurrency(portfolioStart)}</div>`);
                                    breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Returns on Portfolio:</strong> ${formatCurrency(portfolioReturns)} <small style="color: var(--color-text-secondary);">(@${(returnRate * 100).toFixed(0)}%)</small></div>`);
                                }
                                breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Savings:</strong> ${formatCurrency(row.yearlyInvestment)}</div>`);
                                breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Returns on Savings:</strong> ${formatCurrency(savingsReturns)} <small style="color: var(--color-text-secondary);">(@${(returnRate * 100).toFixed(0)}%)</small></div>`);
                                
                                if (totalWithdrawals > 0) {
                                    breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Withdrawals:</strong> -${formatCurrency(totalWithdrawals)}</div>`);
                                }
                                if (totalTax > 0) {
                                    breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Tax:</strong> -${formatCurrency(totalTax)}</div>`);
                                }
                                
                                portfolioEndDisplay = `
                                    ${breakdownItems.join('')}
                                    <div style="border-top: 2px dashed rgba(255,255,255,0.4); margin-top: 8px; padding-top: 8px;"><strong>Total:</strong> ${formatCurrency(Math.max(0, portfolioEnd))}</div>
                                `;
                            } else if (row.phase === 'retirement') {
                                const returns = portfolioStart * postRetirementReturn;
                                
                                const breakdownItems = [];
                                if (portfolioStart > 0) {
                                    breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Start:</strong> ${formatCurrency(portfolioStart)}</div>`);
                                    breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Returns:</strong> ${formatCurrency(returns)} <small style="color: var(--color-text-secondary);">(@${(postRetirementReturn * 100).toFixed(0)}%)</small></div>`);
                                }
                                
                                if (totalWithdrawals > 0) {
                                    breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Withdrawals:</strong> -${formatCurrency(totalWithdrawals)}</div>`);
                                }
                                if (totalTax > 0) {
                                    breakdownItems.push(`<div style="margin-bottom: 4px;"><strong>Tax:</strong> -${formatCurrency(totalTax)}</div>`);
                                }
                                
                                if (breakdownItems.length > 0) {
                                    portfolioEndDisplay = `
                                        ${breakdownItems.join('')}
                                        <div style="border-top: 2px dashed rgba(255,255,255,0.4); margin-top: 8px; padding-top: 8px;"><strong>Total:</strong> ${formatCurrency(Math.max(0, portfolioEnd))}</div>
                                    `;
                                }
                            }
                            
                            return `
                            <tr class="${row.phase === 'retirement' ? 'retirement-phase' : 'accumulation-phase'} ${(onetimeGoalExpenses > 0 || recurringGoalExpenses > 0) ? 'goal-expense-year' : ''} ${row.moneyDepleted ? 'money-depleted' : ''}">
                                <td class="table__age">${row.age}</td>
                                <td class="table__balance">${formatCurrency(portfolioStart)}</td>
                                <td class="table__withdrawals">${withdrawalsDisplay}</td>
                                <td class="table__tax">${formatCurrency(totalTax)}</td>
                                <td class="table__balance">${portfolioEndDisplay}</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('retirementTableContainer').innerHTML = goalsTableHtml + projectionTableHtml;
        
        // Return information about money depletion
        return {
            moneyRunsOut: moneyRunsOutAge !== null,
            moneyRunsOutAge: moneyRunsOutAge,
            legacyAmount: legacyAmount
        };
    }

    // Manual function to refresh all helper texts
    window.refreshGoalHelperTexts = function() {
        const allGoalInputs = document.querySelectorAll('.goal-amount-input');
        console.log(`Found ${allGoalInputs.length} goal inputs to refresh`);
        
        allGoalInputs.forEach((input, index) => {
            if (input.value && input.value.trim() !== '') {
                console.log(`Refreshing helper text for input ${index + 1}:`, input.value);
                updateHelperText(input, input.value);
            }
        });
        
        // Also refresh main currency inputs
        const mainInputs = document.querySelectorAll('#retirementCurrentIncome, #retirementMonthlyExpenses');
        mainInputs.forEach((input, index) => {
            if (input.value && input.value.trim() !== '') {
                console.log(`Refreshing main input ${index + 1}:`, input.value);
                updateHelperText(input, input.value);
            }
        });
    };

    // Function to reinitialize goals when currency changes
    window.reinitializeGoals = function() {
        initializeDefaultGoals();
    };
    
    // Override switchCalculator to initialize goals when switching to retirement
    const originalSwitchFunction = window.switchCalculator;
    window.switchCalculator = function(calculatorType) {
        originalSwitchFunction(calculatorType);
        
        if (calculatorType === 'retirement') {
            setTimeout(() => {
                initializeDefaultGoals();
                
                // Format and show helper text for retirement inputs (don't re-attach listeners)
                setTimeout(() => {
                    const retirementInputs = document.querySelectorAll('#retirementMonthlySavings, #retirementCurrentCorpus');
                    retirementInputs.forEach(input => {
                        if (input.value && input.value.trim() !== '' && input.value !== '0') {
                            const cleanValue = input.value.replace(/,/g, '');
                            const formatted = formatNumber(cleanValue);
                            input.value = formatted;
                            updateHelperText(input, formatted);
                        }
                    });
                }, 50);
                
                // Force update helper text for all goal inputs after initialization
                setTimeout(() => {
                    const allGoalInputs = document.querySelectorAll('.goal-amount-input');
                    allGoalInputs.forEach(input => {
                        if (input.value && input.value.trim() !== '') {
                            updateHelperText(input, input.value);
                        }
                    });
                }, 150);
            }, 50);
        }
    };
    
    // Also override the legacy name
    window.switchIndianCalculator = window.switchCalculator;

    // Initialize default goals when the retirement calculator loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Delay initialization to ensure all scripts are loaded
            setTimeout(initializeDefaultGoals, 500);
        });
    } else {
        // Delay initialization to ensure all scripts are loaded
        setTimeout(initializeDefaultGoals, 500);
    }

})();