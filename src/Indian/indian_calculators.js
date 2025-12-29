// Indian Investment Calculators - SIP, SWP, Lumpsum
(function(){
    
    // Utility functions for Indian Rupee formatting
    function formatINR(num) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    }

    function formatINRDetailed(num) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(num);
    }

    // Enhanced INR formatting with readable suffixes
    function formatINRReadable(num) {
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

    // Input validation to prevent text entry
    function setupInputValidation() {
        // Get all number inputs in Indian calculators
        const numberInputs = document.querySelectorAll('#sipCalculator input[type="number"], #swpCalculator input[type="number"], #lumpsumCalculator input[type="number"]');
        
        numberInputs.forEach(input => {
            // Prevent non-numeric characters
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

            // Prevent pasting non-numeric content
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                if (/^\d*\.?\d*$/.test(paste)) {
                    this.value = paste;
                }
            });

            // Clean up any non-numeric values on blur
            input.addEventListener('blur', function(e) {
                const value = parseFloat(this.value);
                if (isNaN(value) || value < 0) {
                    this.value = this.getAttribute('value') || '0'; // Reset to default
                }
                
                // Special validation for tax rate (max 50%)
                if (this.id === 'swpTaxRate' && value > 50) {
                    this.value = '50';
                }
            });

            // Prevent negative values and enforce max for tax rate
            input.addEventListener('input', function(e) {
                if (this.value < 0) {
                    this.value = 0;
                }
                if (this.id === 'swpTaxRate' && this.value > 50) {
                    this.value = 50;
                }
            });
        });

        // Auto-recalculate when active trading checkbox changes
        const activeTrading = document.getElementById('swpActiveTrading');
        if (activeTrading) {
            activeTrading.addEventListener('change', function() {
                // Small delay to allow UI updates
                setTimeout(() => {
                    if (typeof window.calculateSWP === 'function') {
                        window.calculateSWP();
                    }
                }, 100);
            });
        }
    }

    // SIP Calculator
    window.calculateSIP = function() {
        try {
            const monthlyAmount = parseFloat(document.getElementById('sipAmount').value);
            const annualRate = parseFloat(document.getElementById('sipReturnRate').value) / 100;
            const years = parseInt(document.getElementById('sipTimePeriod').value);
            const stepUpRate = parseFloat(document.getElementById('sipStepUp').value) / 100;

            if (isNaN(monthlyAmount) || isNaN(annualRate) || isNaN(years) || monthlyAmount <= 0 || annualRate < 0 || years <= 0) {
                throw new Error('Please enter valid positive values');
            }

            const monthlyRate = annualRate / 12;
            const totalMonths = years * 12;
            let totalInvestment = 0;
            let currentAmount = monthlyAmount;
            let futureValue = 0;

            // Calculate year-wise data for table
            const yearlyData = [];
            let runningInvestment = 0;
            let runningValue = 0;

            for (let year = 1; year <= years; year++) {
                let yearInvestment = 0;
                let yearEndValue = runningValue;

                for (let month = 1; month <= 12; month++) {
                    const monthIndex = (year - 1) * 12 + month;
                    
                    // Apply step-up annually
                    if (month === 1 && year > 1) {
                        currentAmount = currentAmount * (1 + stepUpRate);
                    }

                    yearInvestment += currentAmount;
                    runningInvestment += currentAmount;

                    // Calculate future value with compound interest
                    yearEndValue = (yearEndValue + currentAmount) * (1 + monthlyRate);
                }

                runningValue = yearEndValue;
                
                yearlyData.push({
                    year: year,
                    yearlyInvestment: yearInvestment,
                    cumulativeInvestment: runningInvestment,
                    yearEndValue: yearEndValue,
                    yearlyReturns: yearEndValue - runningInvestment
                });
            }

            totalInvestment = runningInvestment;
            futureValue = runningValue;
            const totalReturns = futureValue - totalInvestment;

            // Update summary
            document.getElementById('sipTotalInvestment').textContent = formatINRReadable(totalInvestment);
            document.getElementById('sipExpectedReturns').textContent = formatINRReadable(totalReturns);
            document.getElementById('sipTotalValue').textContent = formatINRReadable(futureValue);

            // Generate table
            generateSIPTable(yearlyData);

            // Show results
            document.getElementById('sipResults').style.display = 'block';

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateSIPTable(data) {
        const tableHtml = `
            <div class="table-container">
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-calendar-alt"></i> Year</th>
                            <th><i class="fas fa-money-bill-wave"></i> Yearly Investment</th>
                            <th><i class="fas fa-piggy-bank"></i> Cumulative Investment</th>
                            <th><i class="fas fa-chart-line"></i> Year End Value</th>
                            <th><i class="fas fa-trophy"></i> Total Returns</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td class="table__year">${row.year}</td>
                                <td class="table__investment">${formatINR(row.yearlyInvestment)}</td>
                                <td class="table__investment">${formatINR(row.cumulativeInvestment)}</td>
                                <td class="table__balance">${formatINR(row.yearEndValue)}</td>
                                <td class="table__returns">${formatINR(row.yearlyReturns)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('sipTableContainer').innerHTML = tableHtml;
    }

    // SWP Calculator
    window.calculateSWP = function() {
        try {
            const totalInvestment = parseFloat(document.getElementById('swpTotalInvestment').value);
            const monthlyWithdrawal = parseFloat(document.getElementById('swpWithdrawal').value);
            const annualRate = parseFloat(document.getElementById('swpReturnRate').value) / 100;
            const taxRate = parseFloat(document.getElementById('swpTaxRate').value) / 100;
            const years = parseInt(document.getElementById('swpTimePeriod').value);
            const isActiveTrading = document.getElementById('swpActiveTrading').checked;

            if (isNaN(totalInvestment) || isNaN(monthlyWithdrawal) || isNaN(annualRate) || isNaN(taxRate) || isNaN(years) || 
                totalInvestment <= 0 || monthlyWithdrawal <= 0 || annualRate < 0 || taxRate < 0 || years <= 0) {
                throw new Error('Please enter valid positive values');
            }

            const monthlyRate = annualRate / 12;
            let remainingBalance = totalInvestment;
            let totalWithdrawn = 0;
            let totalTaxPaid = 0;
            let totalNetReceived = 0;

            // Calculate year-wise data
            const yearlyData = [];

            for (let year = 1; year <= years; year++) {
                let yearStartBalance = remainingBalance;
                let yearWithdrawal = 0;
                let yearTaxPaid = 0;
                let yearNetReceived = 0;
                let yearGains = 0;

                if (isActiveTrading) {
                    // Active Trading: Tax on all capital gains for the year
                    // Calculate annual gains first
                    const annualGains = yearStartBalance * annualRate;
                    yearGains = annualGains;
                    
                    // Tax on all gains
                    const annualTax = annualGains * taxRate;
                    yearTaxPaid = annualTax;
                    
                    // Net gains after tax
                    const netGains = annualGains - annualTax;
                    
                    // Update balance with net gains
                    remainingBalance = yearStartBalance + netGains;
                    
                    // Now handle withdrawals (no additional tax since already paid)
                    const annualWithdrawal = Math.min(monthlyWithdrawal * 12, remainingBalance);
                    yearWithdrawal = annualWithdrawal;
                    yearNetReceived = annualWithdrawal; // No additional tax on withdrawal
                    
                    remainingBalance -= annualWithdrawal;
                    
                } else {
                    // Regular SWP: Tax only on gains portion of withdrawals
                    for (let month = 1; month <= 12; month++) {
                        if (remainingBalance <= 0) break;

                        // Apply monthly return
                        const monthlyReturn = remainingBalance * monthlyRate;
                        remainingBalance += monthlyReturn;
                        yearGains += monthlyReturn;
                        
                        // Withdraw amount (but not more than remaining balance)
                        const grossWithdrawal = Math.min(monthlyWithdrawal, remainingBalance);
                        
                        // Calculate tax on the gains portion of withdrawal
                        const gainsRatio = Math.max(0, (remainingBalance - totalInvestment) / remainingBalance);
                        const taxableGains = grossWithdrawal * gainsRatio;
                        const monthlyTax = taxableGains * taxRate;
                        const netWithdrawal = grossWithdrawal - monthlyTax;
                        
                        remainingBalance -= grossWithdrawal;
                        yearWithdrawal += grossWithdrawal;
                        yearTaxPaid += monthlyTax;
                        yearNetReceived += netWithdrawal;
                    }
                }

                totalWithdrawn += yearWithdrawal;
                totalTaxPaid += yearTaxPaid;
                totalNetReceived += yearNetReceived;

                yearlyData.push({
                    year: year,
                    startBalance: yearStartBalance,
                    yearlyWithdrawal: yearWithdrawal,
                    yearlyTax: yearTaxPaid,
                    yearlyNetReceived: yearNetReceived,
                    endBalance: remainingBalance,
                    cumulativeWithdrawal: totalWithdrawn,
                    cumulativeTax: totalTaxPaid,
                    cumulativeNetReceived: totalNetReceived,
                    isActiveTrading: isActiveTrading
                });

                if (remainingBalance <= 0) break;
            }

            // Update summary
            document.getElementById('swpInitialInvestment').textContent = formatINRReadable(totalInvestment);
            document.getElementById('swpTotalWithdrawal').textContent = formatINRReadable(totalWithdrawn);
            document.getElementById('swpTotalTax').textContent = formatINRReadable(totalTaxPaid);
            document.getElementById('swpNetReceived').textContent = formatINRReadable(totalNetReceived);
            document.getElementById('swpFinalValue').textContent = formatINRReadable(remainingBalance);

            // Generate table
            generateSWPTable(yearlyData);

            // Show results
            document.getElementById('swpResults').style.display = 'block';

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateSWPTable(data) {
        const tableHtml = `
            <div class="table-container">
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-calendar-alt"></i> Year</th>
                            <th><i class="fas fa-wallet"></i> Start Balance</th>
                            <th><i class="fas fa-hand-holding-usd"></i> Gross Withdrawal</th>
                            <th><i class="fas fa-receipt"></i> Tax Paid</th>
                            <th><i class="fas fa-hand-holding-heart"></i> Net Received</th>
                            <th><i class="fas fa-piggy-bank"></i> End Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td class="table__year">${row.year}</td>
                                <td class="table__balance">${formatINR(row.startBalance)}</td>
                                <td class="table__withdrawal">${formatINR(row.yearlyWithdrawal)}</td>
                                <td class="table__tax">${formatINR(row.yearlyTax)}</td>
                                <td class="table__net">${formatINR(row.yearlyNetReceived)}</td>
                                <td class="table__balance">${formatINR(row.endBalance)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('swpTableContainer').innerHTML = tableHtml;
    }

    // Lumpsum Calculator
    window.calculateLumpsum = function() {
        try {
            const principal = parseFloat(document.getElementById('lumpsumAmount').value);
            const annualRate = parseFloat(document.getElementById('lumpsumReturnRate').value) / 100;
            const years = parseInt(document.getElementById('lumpsumTimePeriod').value);
            // Use annual compounding since lumpsum is calculated annually
            const compoundingFreq = 1;

            if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || 
                principal <= 0 || annualRate < 0 || years <= 0) {
                throw new Error('Please enter valid positive values');
            }

            // Calculate year-wise compound growth
            const yearlyData = [];
            
            for (let year = 1; year <= years; year++) {
                const amount = principal * Math.pow((1 + annualRate / compoundingFreq), compoundingFreq * year);
                const returns = amount - principal;
                
                yearlyData.push({
                    year: year,
                    principal: principal,
                    amount: amount,
                    returns: returns,
                    returnPercent: (returns / principal) * 100
                });
            }

            const finalAmount = yearlyData[yearlyData.length - 1].amount;
            const totalReturns = finalAmount - principal;

            // Update summary
            document.getElementById('lumpsumInvestedAmount').textContent = formatINRReadable(principal);
            document.getElementById('lumpsumExpectedReturns').textContent = formatINRReadable(totalReturns);
            document.getElementById('lumpsumTotalValue').textContent = formatINRReadable(finalAmount);

            // Generate table
            generateLumpsumTable(yearlyData);

            // Show results
            document.getElementById('lumpsumResults').style.display = 'block';

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateLumpsumTable(data) {
        const tableHtml = `
            <div class="table-container">
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-calendar-alt"></i> Year</th>
                            <th><i class="fas fa-money-bill"></i> Principal</th>
                            <th><i class="fas fa-chart-line"></i> Amount</th>
                            <th><i class="fas fa-trophy"></i> Returns</th>
                            <th><i class="fas fa-percentage"></i> Return %</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td class="table__year">${row.year}</td>
                                <td class="table__investment">${formatINR(row.principal)}</td>
                                <td class="table__balance">${formatINR(row.amount)}</td>
                                <td class="table__returns">${formatINR(row.returns)}</td>
                                <td class="table__percent">${formatPercent(row.returnPercent)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('lumpsumTableContainer').innerHTML = tableHtml;
    }

    // Setup input validation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupInputValidation);
    } else {
        setupInputValidation();
    }

})();