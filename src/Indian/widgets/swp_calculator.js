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
            const isActiveTrading = document.getElementById('swpActiveTrading').checked;

            if (
                isNaN(totalInvestment) || isNaN(withdrawalAmount) ||
                isNaN(annualRate) || isNaN(taxRate) || isNaN(years) ||
                totalInvestment <= 0 || withdrawalAmount <= 0 ||
                annualRate < 0 || taxRate < 0 || years <= 0
            ) {
                throw new Error('Please enter valid positive values');
            }

            const frequencyMultiplier = getFrequencyMultiplier(frequency);
            // Use effective rate per period, similar to SIP calculators:
            // r_period = (1 + r_annual)^(1/frequency) - 1
            const periodicRate = Math.pow(1 + annualRate, 1 / frequencyMultiplier) - 1;

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
                    const annualGains = yearStartBalance * annualRate;
                    yearGains = annualGains;
                    
                    // Tax on all gains
                    const annualTax = annualGains * taxRate;
                    yearTaxPaid = annualTax;
                    
                    // Net gains after tax
                    const netGains = annualGains - annualTax;
                    
                    // Update balance with net gains
                    remainingBalance = yearStartBalance + netGains;
                    
                    // Now handle withdrawals (no additional tax since already paid on gains)
                    const annualWithdrawal = Math.min(withdrawalAmount * frequencyMultiplier, remainingBalance);
                    yearWithdrawal = annualWithdrawal;
                    yearNetReceived = annualWithdrawal; // No additional tax on withdrawal
                    
                    remainingBalance -= annualWithdrawal;

                } else {
                    // Regular SWP: periodic compounding + tax on each withdrawal
                    for (let period = 1; period <= frequencyMultiplier; period++) {
                        if (remainingBalance <= 0) break;

                        // Apply periodic return on remaining balance
                        const periodicReturn = remainingBalance * periodicRate;
                        remainingBalance += periodicReturn;
                        yearGains += periodicReturn;
                        
                        // Withdraw amount (but not more than remaining balance)
                        const grossWithdrawal = Math.min(withdrawalAmount, remainingBalance);
                        
                        // Tax calculation: apply tax rate to the withdrawal amount
                        const periodicTax = grossWithdrawal * taxRate;
                        const netWithdrawal = grossWithdrawal - periodicTax;
                        
                        remainingBalance -= grossWithdrawal;
                        yearWithdrawal += grossWithdrawal;
                        yearTaxPaid += periodicTax;
                        yearNetReceived += netWithdrawal;

                        if (remainingBalance <= 0) break;
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

            // Add copy buttons to the results
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateSWPTable(data) {
        const tableHtml = `
            <div class="table-container ${data.length > 6 ? 'has-scroll' : ''}">
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-calendar-alt"></i> Year</th>
                            <th><i class="fas fa-wallet"></i> Start Balance</th>
                            <th><i class="fas fa-hand-holding-usd"></i> Gross Withdrawal</th>
                            <th><i class="fas fa-receipt"></i> Tax Paid</th>
                            <th><i class="fas fa-hand-holding-heart"></i> Net Received</th>
                            <th><i class="fas fa-calendar-check"></i> Monthly Net</th>
                            <th><i class="fas fa-piggy-bank"></i> End Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => {
                            const monthlyNet = row.yearlyNetReceived / 12;
                            return `
                            <tr>
                                <td class="table__year">${row.year}</td>
                                <td class="table__balance">${formatINR(row.startBalance)}</td>
                                <td class="table__withdrawal">${formatINR(row.yearlyWithdrawal)}</td>
                                <td class="table__tax">${formatINR(row.yearlyTax)}</td>
                                <td class="table__net">${formatINR(row.yearlyNetReceived)}</td>
                                <td class="table__monthly-net">${formatINR(monthlyNet)}</td>
                                <td class="table__balance">${formatINR(row.endBalance)}</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('swpTableContainer').innerHTML = tableHtml;
    }

    // Ensure this helper exists and matches your SIP widget
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
