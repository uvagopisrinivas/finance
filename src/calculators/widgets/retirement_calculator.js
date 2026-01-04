// Retirement Planning Calculator Widget
(function(){
    
    let goalCounter = 0;
    
    // Get currency-aware default goals
    function getDefaultGoals() {
        const currentCurrency = window.currentCurrency || 'INR';
        
        if (currentCurrency === 'USD') {
            return [
                { type: 'marriage', name: "Child's Wedding", amount: 50000, years: 25 },
                { type: 'education', name: "Child's Education", amount: 100000, years: 20 },
                { type: 'house', name: "Dream House", amount: 500000, years: 10 },
                { type: 'emergency', name: "Emergency Fund", amount: 50000, years: 6 }
            ];
        } else {
            return [
                { type: 'marriage', name: "Child's Wedding", amount: 20000000, years: 25 },
                { type: 'education', name: "Child's Education", amount: 4000000, years: 20 },
                { type: 'house', name: "Dream House", amount: 20000000, years: 10 },
                { type: 'emergency', name: "Emergency Fund", amount: 2500000, years: 6 }
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
            addGoalItem(goal.type, goal.name, goal.amount, goal.years);
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
        addGoalItem('other', '', defaultAmount, 10);
    };

    function addGoalItem(type = 'other', name = '', amount = 500000, years = 10) {
        goalCounter++;
        const container = document.getElementById('goalsContainer');
        
        // Get current currency symbol
        const currentCurrency = window.currentCurrency || 'INR';
        const symbol = currentCurrency === 'USD' ? '$' : '₹';
        
        const goalHtml = `
            <div class="goal-item" data-goal-type="${type}" id="goal-${goalCounter}">
                <button type="button" class="goal-remove-btn" onclick="removeGoal(${goalCounter})" title="Remove Goal">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="form-group">
                    <label class="form-label">Goal Type</label>
                    <select class="form-input goal-type-select" onchange="updateGoalType(${goalCounter}, this.value)">
                        <option value="marriage" ${type === 'marriage' ? 'selected' : ''}>Marriage</option>
                        <option value="education" ${type === 'education' ? 'selected' : ''}>Education</option>
                        <option value="house" ${type === 'house' ? 'selected' : ''}>House Purchase</option>
                        <option value="vehicle" ${type === 'vehicle' ? 'selected' : ''}>Vehicle</option>
                        <option value="vacation" ${type === 'vacation' ? 'selected' : ''}>Vacation/Travel</option>
                        <option value="business" ${type === 'business' ? 'selected' : ''}>Business Investment</option>
                        <option value="emergency" ${type === 'emergency' ? 'selected' : ''}>Emergency Fund</option>
                        <option value="other" ${type === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Goal Name</label>
                    <input type="text" class="form-input goal-name-input" value="${name}" placeholder="Enter goal name">
                </div>
                <div class="form-group">
                    <label class="form-label">Amount (${symbol})</label>
                    <input type="text" class="form-input goal-amount-input" value="${formatNumber(amount)}" placeholder="Target amount" inputmode="numeric">
                </div>
                <div class="form-group">
                    <label class="form-label">Years from now</label>
                    <input type="number" class="form-input goal-years-input" value="${years}" min="1" max="50" placeholder="Years">
                </div>
            </div>
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
                console.log(`Setting up helper text for goal ${goalCounter}:`, amountInput.value);
                updateHelperText(amountInput, amountInput.value);
            }
        };
        
        // Try multiple times with different delays
        setTimeout(initializeHelper, 10);
        setTimeout(initializeHelper, 50);
        setTimeout(initializeHelper, 100);
    }

    window.updateGoalType = function(goalId, type) {
        const goalElement = document.getElementById(`goal-${goalId}`);
        goalElement.setAttribute('data-goal-type', type);
    };

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
            const monthlySavingsInput = document.getElementById('retirementMonthlySavings').value.replace(/,/g, '');
            const monthlySavings = parseFloat(monthlySavingsInput);
            const currentCorpusInput = document.getElementById('retirementCurrentCorpus').value.replace(/,/g, '');
            const currentCorpus = parseFloat(currentCorpusInput) || 0;
            const returnRate = parseFloat(document.getElementById('retirementReturnRate').value) / 100;
            const inflationRate = parseFloat(document.getElementById('retirementInflationRate').value) / 100;
            const monthlyExpensesInput = document.getElementById('retirementMonthlyExpenses').value.replace(/,/g, '');
            const monthlyExpenses = parseFloat(monthlyExpensesInput);
            const lifeExpectancy = parseInt(document.getElementById('retirementLifeExpectancy').value);
            const taxRate = parseFloat(document.getElementById('retirementTaxRate').value) / 100;

            // Enhanced validation
            if (isNaN(currentAge) || currentAge < 18 || currentAge > 65) {
                throw new Error('Please enter a valid current age between 18 and 65');
            }
            if (isNaN(monthlySavings) || monthlySavings <= 0) {
                throw new Error('Please enter a valid monthly savings amount');
            }
            if (isNaN(monthlyExpenses) || monthlyExpenses <= 0) {
                throw new Error('Please enter a valid monthly expenses amount');
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
            const goalElements = document.querySelectorAll('.goal-item');
            
            goalElements.forEach(goalElement => {
                const type = goalElement.querySelector('.goal-type-select').value;
                const name = goalElement.querySelector('.goal-name-input').value;
                const amount = parseFloat(goalElement.querySelector('.goal-amount-input').value.replace(/,/g, ''));
                const years = parseInt(goalElement.querySelector('.goal-years-input').value);
                
                if (name && amount > 0 && years > 0) {
                    // Adjust for inflation
                    const futureValue = amount * Math.pow(1 + inflationRate, years);
                    goals.push({
                        type,
                        name,
                        currentAmount: amount,
                        futureAmount: futureValue,
                        years
                    });
                }
            });

            // Calculate goals corpus (we only need corpus for the actual goal amounts)
            const totalGoalsCurrentValue = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
            const totalGoalsFutureValue = goals.reduce((sum, goal) => sum + goal.futureAmount, 0);
            
            // We only need corpus for the actual goal amounts, not the tax
            const totalGoalsFutureValueWithTax = totalGoalsFutureValue;

            // Calculate retirement age by finding when we can accumulate enough corpus
            let retirementAge = currentAge + 5; // Start checking from 5 years from now
            let canRetire = false;
            let calculationResults = null;

            // Try different retirement ages until we find one that works
            for (let testAge = currentAge + 5; testAge <= Math.min(lifeExpectancy - 5, 75); testAge++) {
                const yearsToRetirement = testAge - currentAge;
                const yearsInRetirement = lifeExpectancy - testAge;
                
                if (yearsInRetirement < 5) continue; // Need at least 5 years of retirement
                
                // Calculate retirement corpus needed for this age
                const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
                const annualExpensesInRetirement = futureMonthlyExpenses * 12;
                
                // Simple present value calculation for retirement corpus
                // We need to account for taxes on withdrawals
                const grossAnnualExpenses = annualExpensesInRetirement / (1 - taxRate);
                
                // Using present value of annuity formula with post-retirement return
                const postRetirementReturn = Math.max(returnRate - 0.02, 0.06); // Conservative return in retirement
                const pvFactor = (1 - Math.pow(1 + postRetirementReturn, -yearsInRetirement)) / postRetirementReturn;
                const retirementCorpus = grossAnnualExpenses * pvFactor;

                // Total corpus needed (goals + retirement) - goals already include tax consideration
                const totalCorpusNeeded = totalGoalsFutureValue + retirementCorpus;

                // Effective monthly rate from annual rate, aligned with SIP/SWP
                const monthlyReturn = Math.pow(1 + returnRate, 1 / 12) - 1;
                const totalMonths = yearsToRetirement * 12;

                // Future value of current corpus (annual compounding is fine here)
                const futureValueOfCurrentCorpus =
                    currentCorpus * Math.pow(1 + returnRate, yearsToRetirement);

                // Future value of monthly savings (SIP-style)
                const futureValueOfSavings =
                    monthlySavings * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

                // Total accumulated corpus
                const totalAccumulatedCorpus =
                    futureValueOfCurrentCorpus + futureValueOfSavings;


                // Check if this is feasible (we can accumulate enough)
                if (totalAccumulatedCorpus >= totalCorpusNeeded) {
                    retirementAge = testAge;
                    canRetire = true;
                    calculationResults = {
                        yearsToRetirement,
                        yearsInRetirement,
                        totalCorpusNeeded,
                        totalAccumulatedCorpus,
                        futureMonthlyExpenses,
                        retirementCorpus,
                        futureValueOfCurrentCorpus,
                        futureValueOfSavings,
                        surplus: totalAccumulatedCorpus - totalCorpusNeeded
                    };
                    break;
                }
            }

            if (!canRetire) {
                throw new Error('Based on your current savings capacity, you may need to increase monthly savings or reduce goals to retire within a reasonable timeframe.');
            }
            // Conservative return in retirement (same as used in corpus formula)
            const postRetirementReturn = Math.max(returnRate - 0.02, 0.06);

            const tableResults = generateRetirementTable(goals, {
                currentAge,
                retirementAge,
                monthlySavings,
                currentCorpus,
                returnRate,
                postRetirementReturn, // NEW: pass post-retirement return to table
                inflationRate,
                monthlyExpenses,
                lifeExpectancy,
                taxRate,
                ...calculationResults
            });


            // Adjust surplus based on whether money runs out
            let actualSurplus = calculationResults.surplus;
            if (tableResults && tableResults.moneyRunsOut) {
                actualSurplus = 0; // No surplus if money runs out
            }

            // Update results
            document.getElementById('retirementTotalGoals').textContent = goals.length;
            document.getElementById('retirementGoalsCorpus').textContent = formatCurrencyReadable(totalGoalsCurrentValue);
            document.getElementById('retirementGoalsCorpusFuture').textContent = formatCurrencyReadable(totalGoalsFutureValue);
            document.getElementById('retirementCalculatedAge').textContent = retirementAge + ' years';
            document.getElementById('retirementYearsLeft').textContent = calculationResults.yearsToRetirement;
            document.getElementById('retirementCorpusNeeded').textContent = formatCurrencyReadable(calculationResults.retirementCorpus);
            document.getElementById('retirementTotalCorpus').textContent = formatCurrencyReadable(calculationResults.totalCorpusNeeded);
            document.getElementById('retirementMonthlySIP').textContent = formatCurrencyReadable(monthlySavings);
            document.getElementById('retirementIncomeAllocation').textContent = formatCurrencyReadable(actualSurplus);

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
                            <th><i class="fas fa-calendar-alt"></i> Age</th>
                            <th><i class="fas fa-rupee-sign"></i> Current Value</th>
                            <th><i class="fas fa-chart-line"></i> Future Value</th>
                            <th><i class="fas fa-percentage"></i> Inflation Impact</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${goals.map(goal => {
                            const inflationImpact = ((goal.futureAmount - goal.currentAmount) / goal.currentAmount) * 100;
                            const goalAge = currentAge + goal.years;
                            return `
                            <tr>
                                <td class="table__year">${goal.name}</td>
                                <td class="table__year">${goalAge}</td>
                                <td class="table__investment">${formatCurrency(goal.currentAmount)}</td>
                                <td class="table__balance">${formatCurrency(goal.futureAmount)}</td>
                                <td class="table__percent">${inflationImpact.toFixed(1)}%</td>
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
            
            // Check if any goals are due this year
            const goalsThisYear = goals.filter(goal => {
                const goalYear = goal.years;
                return goalYear === year;
            });
            const totalGoalExpenses = goalsThisYear.reduce((sum, goal) => sum + goal.futureAmount, 0);
            
            if (!isRetired) {
                // Accumulation phase - still working and investing
                const yearlyInvestment = params.monthlySavings * 12;
                cumulativeInvestment += yearlyInvestment;
                
                // Apply returns to existing portfolio + add new investment
                portfolioValue = (portfolioValue * (1 + params.returnRate)) + yearlyInvestment;
                
                // Deduct goal expenses if any goals are due this year (including taxes)
                const grossGoalExpenses = totalGoalExpenses / (1 - params.taxRate);
                portfolioValue -= grossGoalExpenses;
                
                // Tax is calculated for display purposes
                const taxOnGoals = grossGoalExpenses * params.taxRate;
                
                const shortfallOrSurplus = params.totalCorpusNeeded - portfolioValue;
                
                yearlyData.push({
                    year: year,
                    age: currentAgeInYear,
                    yearlyInvestment: yearlyInvestment,
                    cumulativeInvestment: cumulativeInvestment,
                    portfolioValue: portfolioValue,
                    monthlyExpenses: 0, // No monthly expenses during accumulation
                    goalExpenses: totalGoalExpenses, // Net goal expenses (what you actually get)
                    grossGoalWithdrawal: grossGoalExpenses, // Gross withdrawal (including tax)
                    taxOnGoals: taxOnGoals, // Tax paid on goals
                    goalsThisYear: goalsThisYear, // Track which goals
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
                        monthlyExpenses: 0, // Cannot withdraw if no money
                        grossMonthlyWithdrawal: 0,
                        taxOnExpenses: 0,
                        monthlyTaxOnExpenses: 0,
                        goalExpenses: 0, // Cannot fund goals if no money
                        grossGoalWithdrawal: 0,
                        taxOnGoals: 0,
                        goalsThisYear: [], // No goals can be funded
                        shortfallOrSurplus: 0,
                        isShortfall: true,
                        phase: 'retirement',
                        moneyDepleted: true // Flag to indicate money has run out
                    });
                    continue; // Skip to next year
                }
                
                // Calculate monthly expenses for this retirement year (with inflation from retirement start)
                const netMonthlyExpensesThisYear = futureMonthlyExpensesAtRetirement * Math.pow(1 + params.inflationRate, yearsIntoRetirement);
                const netAnnualExpensesThisYear = netMonthlyExpensesThisYear * 12;
                
                // Calculate gross withdrawal needed (including taxes)
                const grossAnnualExpenses = netAnnualExpensesThisYear / (1 - params.taxRate);
                const grossGoalExpenses = totalGoalExpenses / (1 - params.taxRate);
                
                // Calculate what we can actually withdraw (limited by available funds)
                const totalNeededWithdrawal = grossAnnualExpenses + grossGoalExpenses;
                const maxAvailableAfterReturns = portfolioValue * (1 + postRetirementReturn);

                
                // If we don't have enough money for full withdrawal, reduce proportionally
                let actualGrossAnnualExpenses = grossAnnualExpenses;
                let actualGrossGoalExpenses = grossGoalExpenses;
                
                if (totalNeededWithdrawal > maxAvailableAfterReturns) {
                    // Not enough money - reduce withdrawals proportionally
                    const reductionFactor = maxAvailableAfterReturns / totalNeededWithdrawal;
                    actualGrossAnnualExpenses = grossAnnualExpenses * reductionFactor;
                    actualGrossGoalExpenses = grossGoalExpenses * reductionFactor;
                }
                
                const actualTotalWithdrawal = actualGrossAnnualExpenses + actualGrossGoalExpenses;
                
                // Calculate net amounts (after tax)
                const actualNetAnnualExpenses = actualGrossAnnualExpenses * (1 - params.taxRate);
                const actualNetGoalExpenses = actualGrossGoalExpenses * (1 - params.taxRate);
                const actualMonthlyExpenses = actualNetAnnualExpenses / 12;
                
                // Tax calculations
                const taxOnExpenses = actualGrossAnnualExpenses * params.taxRate;
                const monthlyTaxOnExpenses = taxOnExpenses / 12;
                const taxOnGoals = actualGrossGoalExpenses * params.taxRate;
                
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
                    portfolioValue: Math.max(0, portfolioValue), // Don't show negative portfolio
                    monthlyExpenses: actualMonthlyExpenses, // Net monthly expenses (after tax)
                    grossMonthlyWithdrawal: actualGrossAnnualExpenses / 12, // Gross monthly withdrawal
                    taxOnExpenses: taxOnExpenses, // Annual tax paid on expenses
                    monthlyTaxOnExpenses: monthlyTaxOnExpenses, // Monthly tax amount
                    goalExpenses: actualNetGoalExpenses, // Net goal expenses (after tax)
                    grossGoalWithdrawal: actualGrossGoalExpenses, // Gross goal withdrawal
                    taxOnGoals: taxOnGoals, // Tax paid on goals
                    goalsThisYear: actualNetGoalExpenses > 0 ? goalsThisYear : [], // Only show goals if they can be funded
                    shortfallOrSurplus: shortfallOrSurplus,
                    isShortfall: isShortfall,
                    phase: 'retirement',
                    moneyDepleted: portfolioValue <= 0 // Flag if money runs out this year
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
                            // Step-by-step calculation for clarity
                            let portfolioStart, totalWithdrawals, totalTax, portfolioAfterWithdrawals, investmentGains, portfolioEnd;
                            
                            if (index === 0) {
                                portfolioStart = params.currentCorpus;
                            } else {
                                portfolioStart = yearlyData[index - 1].portfolioValue;
                            }
                            
                            // Calculate withdrawals and tax
                            const livingExpenses = row.monthlyExpenses * 12;
                            const goalExpenses = row.goalExpenses || 0;
                            totalWithdrawals = livingExpenses + goalExpenses;
                            totalTax = totalWithdrawals * params.taxRate;
                            
                            // Step 1: Start with portfolio
                            // Step 2: Add annual investment (if accumulation phase)
                            let portfolioAfterInvestment = portfolioStart;
                            if (row.phase === 'accumulation') {
                                portfolioAfterInvestment += row.yearlyInvestment;
                            }
                            
                            // Use post-retirement return only during retirement years
                            const effectiveRate =
                                row.phase === 'retirement'
                                    ? postRetirementReturn
                                    : returnRate;

                            // Step 3: Apply investment returns
                            const portfolioAfterReturns = portfolioAfterInvestment * (1 + effectiveRate);

                            // Step 4: Subtract withdrawals and tax
                            portfolioEnd = portfolioAfterReturns - totalWithdrawals - totalTax;

                            // Format withdrawals display with monthly breakdown
                            let withdrawalsDisplay = '-';
                            
                            // Check if money has run out
                            if (row.moneyDepleted || portfolioStart <= 0) {
                                withdrawalsDisplay = '<span style="color: var(--color-error);">⚠️ No funds available</span>';
                            } else if (livingExpenses > 0 && goalExpenses > 0) {
                                const monthlyLiving = livingExpenses / 12;
                                const goalNames = row.goalsThisYear.map(goal => goal.name).join(', ');
                                withdrawalsDisplay = `${formatCurrency(livingExpenses)} living<br><small style="color: var(--color-text-secondary);">(${formatCurrency(monthlyLiving)}/mo)</small><br>+ ${formatCurrency(goalExpenses)}<br><small style="color: var(--color-text-secondary);">(${goalNames})</small>`;
                            } else if (livingExpenses > 0) {
                                const monthlyLiving = livingExpenses / 12;
                                withdrawalsDisplay = `${formatCurrency(livingExpenses)} living<br><small style="color: var(--color-text-secondary);">(${formatCurrency(monthlyLiving)}/month)</small>`;
                            } else if (goalExpenses > 0) {
                                const goalNames = row.goalsThisYear.map(goal => goal.name).join(', ');
                                withdrawalsDisplay = `${formatCurrency(goalExpenses)}<br><small style="color: var(--color-text-secondary);">(${goalNames})</small>`;
                            }
                            
                            return `
                            <tr class="${row.phase === 'retirement' ? 'retirement-phase' : 'accumulation-phase'} ${row.goalExpenses > 0 ? 'goal-expense-year' : ''} ${row.moneyDepleted ? 'money-depleted' : ''}">
                                <td class="table__age">${row.age}</td>
                                <td class="table__balance">${formatCurrency(portfolioStart)}</td>
                                <td class="table__withdrawals">${withdrawalsDisplay}</td>
                                <td class="table__tax">${formatCurrency(totalTax)}</td>
                                <td class="table__balance">${formatCurrency(Math.max(0, portfolioEnd))}</td>
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
    const originalSwitchFunction = window.switchIndianCalculator;
    window.switchIndianCalculator = function(calculatorType) {
        originalSwitchFunction(calculatorType);
        
        if (calculatorType === 'retirement') {
            setTimeout(() => {
                initializeDefaultGoals();
                setupRetirementInputValidation();
                
                // Force update helper text for all goal inputs after initialization
                setTimeout(() => {
                    const allGoalInputs = document.querySelectorAll('.goal-amount-input');
                    allGoalInputs.forEach((input, index) => {
                        if (input.value && input.value.trim() !== '') {
                            console.log(`Initializing helper text for goal ${index + 1}:`, input.value);
                            updateHelperText(input, input.value);
                        }
                    });
                }, 200);
            }, 100);
        }
    };

    function setupRetirementInputValidation() {
        // Setup validation for retirement-specific inputs
        const currencyInputs = document.querySelectorAll('#retirementMonthlySavings, #retirementCurrentCorpus, #retirementMonthlyExpenses');
        
        currencyInputs.forEach(input => {
            input.removeAttribute('maxlength');
            
            if (input.value) {
                const formatted = formatNumber(input.value);
                input.value = formatted;
                updateHelperText(input, formatted);
            }
            
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
        });
    }

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