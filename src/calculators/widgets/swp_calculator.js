// SWP Calculator Widget
(function(){
    
    // SWP Calculator
    window.calculateSWP = function() {
        try {
            const totalInvestment = parseFloat(document.getElementById('swpTotalInvestment').value.replace(/,/g, ''));
            const withdrawalAmount = parseFloat(document.getElementById('swpWithdrawal').value.replace(/,/g, ''));
            const frequency = document.getElementById('swpFrequency').value; // 'monthly', 'quarterly', 'yearly'
            const annualRate = parseFloat(document.getElementById('swpReturnRate').value) / 100;
            const taxRate = parseFloat(document.getElementById('swpTaxRate').value) / 100;
            const years = parseInt(document.getElementById('swpTimePeriod').value, 10);

            if (
                isNaN(totalInvestment) || isNaN(withdrawalAmount) ||
                isNaN(annualRate) || isNaN(taxRate) || isNaN(years) ||
                totalInvestment <= 0 || withdrawalAmount <= 0 ||
                annualRate < 0 || taxRate < 0 || years <= 0
            ) {
                throw new Error('Please enter valid positive values');
            }

            const frequencyMultiplier = getFrequencyMultiplier(frequency);
            const periodicRate = Math.pow(1 + annualRate, 1 / frequencyMultiplier) - 1;

            // Use the user's input rate for the end balance comparison column
            const displayRatePercent = parseFloat(document.getElementById('swpReturnRate').value);
            const periodicRate12 = periodicRate; // Same as the main rate

            let remainingBalance = totalInvestment;
            let remainingBalance12 = totalInvestment;
            let totalWithdrawn = 0;
            let totalTaxPaid = 0;
            let totalNetReceived = 0;

            const yearlyData = [];

            for (let year = 1; year <= years; year++) {
                let yearStartBalance = remainingBalance;
                let yearStartBalance12 = remainingBalance12;
                let yearWithdrawal = 0;
                let yearTaxPaid = 0;
                let yearNetReceived = 0;

                // SWP: periodic compounding + tax on each withdrawal
                // Gross up the withdrawal so the user receives the full requested amount after tax
                for (let period = 1; period <= frequencyMultiplier; period++) {
                    if (remainingBalance <= 0) break;

                    // Apply periodic return on remaining balance
                    const periodicReturn = remainingBalance * periodicRate;
                    remainingBalance += periodicReturn;
                    
                    // Gross up the withdrawal to cover tax so user receives full amount
                    let grossWithdrawal;
                    if (taxRate > 0 && taxRate < 1) {
                        grossWithdrawal = withdrawalAmount / (1 - taxRate);
                    } else {
                        grossWithdrawal = withdrawalAmount;
                    }
                    
                    // Cap at remaining balance
                    grossWithdrawal = Math.min(grossWithdrawal, remainingBalance);
                    
                    // Tax calculation
                    const periodicTax = grossWithdrawal * taxRate;
                    const netWithdrawal = grossWithdrawal - periodicTax;
                    
                    remainingBalance -= grossWithdrawal;
                    yearWithdrawal += grossWithdrawal;
                    yearTaxPaid += periodicTax;
                    yearNetReceived += netWithdrawal;

                    if (remainingBalance <= 0) break;

                    // 12% parallel tracking
                    if (remainingBalance12 > 0) {
                        const periodicReturn12 = remainingBalance12 * periodicRate12;
                        remainingBalance12 += periodicReturn12;
                        const gross12 = Math.min(grossWithdrawal, remainingBalance12);
                        remainingBalance12 -= gross12;
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
                    endBalance12: remainingBalance12,
                    cumulativeWithdrawal: totalWithdrawn,
                    cumulativeTax: totalTaxPaid,
                    cumulativeNetReceived: totalNetReceived
                });

                if (remainingBalance <= 0 && remainingBalance12 <= 0) break;
            }

            // Filter out rows where corpus is already fully depleted (start balance is 0)
            const filteredData = yearlyData.filter(row => row.startBalance > 0);

            // Check if money ran out before the requested period
            const moneyDepleted = remainingBalance <= 0;
            const depletionYear = moneyDepleted ? filteredData[filteredData.length - 1].year : null;

            // Update summary
            document.getElementById('swpInitialInvestment').textContent = formatCurrencyReadable(totalInvestment);
            document.getElementById('swpTotalWithdrawal').textContent = formatCurrencyReadable(totalWithdrawn);
            document.getElementById('swpTotalTax').textContent = formatCurrencyReadable(totalTaxPaid);
            document.getElementById('swpNetReceived').textContent = formatCurrencyReadable(totalNetReceived);
            document.getElementById('swpFinalValue').textContent = formatCurrencyReadable(remainingBalance);

            // Show or hide depletion warning
            const warningEl = document.getElementById('swpDepletionWarning');
            if (moneyDepleted) {
                const shortfall = years - depletionYear;
                document.getElementById('swpDepletionMessage').textContent =
                    `Your corpus got depleted in year ${depletionYear} — ${shortfall} year${shortfall !== 1 ? 's' : ''} short of your ${years}-year plan. Consider reducing withdrawals or increasing your investment.`;
                warningEl.style.display = 'flex';
            } else {
                warningEl.style.display = 'none';
            }

            // Generate table (only rows with activity)
            generateSWPTable(filteredData, displayRatePercent);

            // Show results
            document.getElementById('swpResults').style.display = 'block';

            // Add copy buttons to the results
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateSWPTable(data, ratePercent) {
        const tableHtml = `
            <div class="table-container ${data.length > 6 ? 'has-scroll' : ''}">
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-calendar-alt"></i> Year</th>
                            <th><i class="fas fa-wallet"></i> Start Balance</th>
                            <th><i class="fas fa-hand-holding-usd"></i> Gross Withdrawal</th>
                            <th><i class="fas fa-receipt"></i> Tax Paid</th>
                            <th><i class="fas fa-calendar-check"></i> Monthly Net</th>
                            <th><i class="fas fa-chart-line"></i> End Bal @${ratePercent}%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => {
                            const monthlyNet = row.yearlyNetReceived / 12;
                            return `
                            <tr>
                                <td class="table__year">${row.year}</td>
                                <td class="table__balance">${formatCurrency(row.startBalance)}</td>
                                <td class="table__withdrawal">${formatCurrency(row.yearlyWithdrawal)}</td>
                                <td class="table__tax">${formatCurrency(row.yearlyTax)}</td>
                                <td class="table__monthly-net">${formatCurrency(monthlyNet)}</td>
                                <td class="table__balance">${formatCurrency(row.endBalance12)}</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('swpTableContainer').innerHTML = tableHtml;
    }

    function getFrequencyMultiplier(freq) {
        switch (freq) {
            case 'monthly':
                return 12;
            case 'quarterly':
                return 4;
            case 'yearly':
                return 1;
            default:
                return 12;
        }
    }

})();
