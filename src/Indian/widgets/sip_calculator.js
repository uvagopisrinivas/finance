// SIP Calculator Widget
(function(){
    
    // SIP Calculator
    window.calculateSIP = function() {
        try {
            const investmentAmount = parseFloat(document.getElementById('sipAmount').value.replace(/,/g, ''));
            const frequency = document.getElementById('sipFrequency').value;          // e.g. 'monthly', 'quarterly', 'yearly'
            const annualRate = parseFloat(document.getElementById('sipReturnRate').value) / 100;
            const years = parseInt(document.getElementById('sipTimePeriod').value, 10);
            const stepUpRate = parseFloat(document.getElementById('sipStepUp').value) / 100;

            if (
                isNaN(investmentAmount) ||
                isNaN(annualRate) ||
                isNaN(years) ||
                investmentAmount <= 0 ||
                annualRate < 0 ||
                years <= 0
            ) {
                throw new Error('Please enter valid positive values');
            }

            const frequencyMultiplier = getFrequencyMultiplier(frequency);
            // For correct compounding, convert annual rate to effective period rate:
            // r_period = (1 + r_annual)^(1/frequency) - 1
            const periodicRate = Math.pow(1 + annualRate, 1 / frequencyMultiplier) - 1;
            const totalPeriods = years * frequencyMultiplier;
            
            let totalInvestment = 0;
            let currentAmount = investmentAmount;
            let futureValue = 0;

            // Calculate year-wise data for table
            const yearlyData = [];
            let runningInvestment = 0;
            let runningValue = 0;

            for (let year = 1; year <= years; year++) {
                let yearInvestment = 0;
                let yearEndValue = runningValue;

                for (let period = 1; period <= frequencyMultiplier; period++) {
                    // Apply step-up annually (only at the beginning of each new year)
                    if (period === 1 && year > 1 && stepUpRate > 0) {
                        currentAmount = currentAmount * (1 + stepUpRate);
                    }

                    yearInvestment += currentAmount;
                    runningInvestment += currentAmount;

                    // Add this instalment, then grow by periodicRate
                    yearEndValue = (yearEndValue + currentAmount) * (1 + periodicRate);
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

            // Add copy buttons to the results
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateSIPTable(data) {
        const tableHtml = `
            <div class="table-container ${data.length > 6 ? 'has-scroll' : ''}">
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

    // Make sure you have this helper somewhere:
    function getFrequencyMultiplier(freq) {
        switch (freq) {
            case 'monthly':
                return 12;
            case 'quarterly':
                return 4;
            case 'yearly':
                return 1;
            default:
                return 12; // fallback to monthly
        }
    }

})();
