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
            });

            // Prevent negative values
            input.addEventListener('input', function(e) {
                if (this.value < 0) {
                    this.value = 0;
                }
            });
        });
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
            document.getElementById('sipTotalInvestment').textContent = formatINR(totalInvestment);
            document.getElementById('sipExpectedReturns').textContent = formatINR(totalReturns);
            document.getElementById('sipTotalValue').textContent = formatINR(futureValue);

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
            const years = parseInt(document.getElementById('swpTimePeriod').value);

            if (isNaN(totalInvestment) || isNaN(monthlyWithdrawal) || isNaN(annualRate) || isNaN(years) || 
                totalInvestment <= 0 || monthlyWithdrawal <= 0 || annualRate < 0 || years <= 0) {
                throw new Error('Please enter valid positive values');
            }

            const monthlyRate = annualRate / 12;
            const totalMonths = years * 12;
            let remainingBalance = totalInvestment;
            let totalWithdrawn = 0;

            // Calculate year-wise data
            const yearlyData = [];

            for (let year = 1; year <= years; year++) {
                let yearStartBalance = remainingBalance;
                let yearWithdrawal = 0;

                for (let month = 1; month <= 12; month++) {
                    if (remainingBalance <= 0) break;

                    // Apply monthly return
                    remainingBalance = remainingBalance * (1 + monthlyRate);
                    
                    // Withdraw amount (but not more than remaining balance)
                    const withdrawal = Math.min(monthlyWithdrawal, remainingBalance);
                    remainingBalance -= withdrawal;
                    yearWithdrawal += withdrawal;
                    totalWithdrawn += withdrawal;
                }

                yearlyData.push({
                    year: year,
                    startBalance: yearStartBalance,
                    yearlyWithdrawal: yearWithdrawal,
                    endBalance: remainingBalance,
                    cumulativeWithdrawal: totalWithdrawn
                });

                if (remainingBalance <= 0) break;
            }

            // Update summary
            document.getElementById('swpInitialInvestment').textContent = formatINR(totalInvestment);
            document.getElementById('swpTotalWithdrawal').textContent = formatINR(totalWithdrawn);
            document.getElementById('swpFinalValue').textContent = formatINR(remainingBalance);

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
                            <th><i class="fas fa-hand-holding-usd"></i> Yearly Withdrawal</th>
                            <th><i class="fas fa-piggy-bank"></i> End Balance</th>
                            <th><i class="fas fa-money-bill-wave"></i> Cumulative Withdrawal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td class="table__year">${row.year}</td>
                                <td class="table__balance">${formatINR(row.startBalance)}</td>
                                <td class="table__withdrawal">${formatINR(row.yearlyWithdrawal)}</td>
                                <td class="table__balance">${formatINR(row.endBalance)}</td>
                                <td class="table__withdrawal">${formatINR(row.cumulativeWithdrawal)}</td>
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
            const compoundingFreq = parseInt(document.getElementById('lumpsumCompounding').value);

            if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || isNaN(compoundingFreq) || 
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
            document.getElementById('lumpsumInvestedAmount').textContent = formatINR(principal);
            document.getElementById('lumpsumExpectedReturns').textContent = formatINR(totalReturns);
            document.getElementById('lumpsumTotalValue').textContent = formatINR(finalAmount);

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

    // Modal functionality
    window.showIndianInfoModal = function(id) {
        const modal = document.getElementById('indianInfoModal');
        const titleEl = document.getElementById('indianInfoTitle');
        const contentEl = document.getElementById('indianInfoContent');
        
        const data = {
            'indian-overview': {
                title: 'Indian Investment Calculators Overview',
                content: `
                    <div class="info-content">
                        <h4>🎯 Investment Planning Tools</h4>
                        <p>These calculators help you plan your investments in Indian Rupees using three popular investment strategies.</p>
                        
                        <h4>📊 Available Calculators</h4>
                        
                        <div class="method-section">
                            <h5>📈 SIP (Systematic Investment Plan)</h5>
                            <p>Invest a fixed amount regularly (monthly) in mutual funds or other investment instruments. Features include:</p>
                            <ul>
                                <li>Monthly investment planning</li>
                                <li>Annual step-up option</li>
                                <li>Compound growth calculation</li>
                                <li>Year-wise breakdown</li>
                            </ul>
                        </div>
                        
                        <div class="method-section">
                            <h5>💰 SWP (Systematic Withdrawal Plan)</h5>
                            <p>Withdraw a fixed amount regularly from your investment corpus. Perfect for retirement planning:</p>
                            <ul>
                                <li>Regular income generation</li>
                                <li>Capital preservation analysis</li>
                                <li>Withdrawal sustainability check</li>
                                <li>Remaining corpus tracking</li>
                            </ul>
                        </div>
                        
                        <div class="method-section">
                            <h5>🏦 Lumpsum Investment</h5>
                            <p>Invest a large amount at once and let it grow with compound interest:</p>
                            <ul>
                                <li>One-time investment planning</li>
                                <li>Multiple compounding frequencies</li>
                                <li>Long-term wealth creation</li>
                                <li>Growth visualization</li>
                            </ul>
                        </div>
                        
                        <h4>💡 Key Features</h4>
                        <ul>
                            <li>All calculations in Indian Rupees (₹)</li>
                            <li>Detailed year-wise projections</li>
                            <li>Professional-grade calculations</li>
                            <li>Mobile-friendly interface</li>
                        </ul>
                        
                        <h4>⚠️ Important Notes</h4>
                        <ul>
                            <li>Returns are projected based on assumed rates</li>
                            <li>Actual returns may vary based on market conditions</li>
                            <li>Consider inflation impact on real returns</li>
                            <li>Consult financial advisors for personalized advice</li>
                        </ul>
                    </div>
                `
            }
        };

        if (data[id]) {
            titleEl.textContent = data[id].title;
            contentEl.innerHTML = data[id].content;
            modal.setAttribute('aria-hidden', 'false');
            modal.style.display = 'flex';
            
            // Focus management
            const closeBtn = modal.querySelector('.modal__close');
            if (closeBtn) closeBtn.focus();
        }
    };

    window.closeIndianInfoModal = function() {
        const modal = document.getElementById('indianInfoModal');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
    };

    // Keyboard support for modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('indianInfoModal');
            if (modal && modal.getAttribute('aria-hidden') === 'false') {
                closeIndianInfoModal();
            }
        }
    });

    // Setup input validation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupInputValidation);
    } else {
        setupInputValidation();
    }

})();