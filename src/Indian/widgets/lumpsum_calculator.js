// Lumpsum Calculator Widget
(function(){
    
    // Lumpsum Calculator
    window.calculateLumpsum = function() {
        try {
            const principal = parseFloat(
                document.getElementById('lumpsumAmount').value.replace(/,/g, '')
            );
            const annualRate = parseFloat(
                document.getElementById('lumpsumReturnRate').value
            ) / 100;
            const years = parseInt(
                document.getElementById('lumpsumTimePeriod').value,
                10
            );

            // Using annual compounding for lumpsum:
            // Amount = P * (1 + r)^n
            const compoundingFreq = 1;

            if (
                isNaN(principal) ||
                isNaN(annualRate) ||
                isNaN(years) ||
                principal <= 0 ||
                annualRate < 0 ||
                years <= 0
            ) {
                throw new Error('Please enter valid positive values');
            }

            // Calculate year-wise compound growth
            const yearlyData = [];
            
            for (let year = 1; year <= years; year++) {
                const amount = principal * Math.pow(
                    1 + annualRate / compoundingFreq,
                    compoundingFreq * year
                );
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
            document.getElementById('lumpsumInvestedAmount').textContent =
                formatINRReadable(principal);
            document.getElementById('lumpsumExpectedReturns').textContent =
                formatINRReadable(totalReturns);
            document.getElementById('lumpsumTotalValue').textContent =
                formatINRReadable(finalAmount);

            // Generate table
            generateLumpsumTable(yearlyData);

            // Show results
            document.getElementById('lumpsumResults').style.display = 'block';

            // Add copy buttons to the results
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateLumpsumTable(data) {
        const tableHtml = `
            <div class="table-container ${data.length > 6 ? 'has-scroll' : ''}">
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

})();