// 401k Projection Calculator - Enhanced Version with Salary-Based Calculations
(function(){
    
    function formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        }).format(num);
    }

    function formatPercent(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num / 100);
    }

    // Expose calculate401k globally
    window.calculate401k = function() {
        try {
            // Get input values
            const baseSalary = parseFloat(document.getElementById('baseSalary').value);
            const salaryIncrease = parseFloat(document.getElementById('salaryIncrease').value) / 100;
            const projectionYears = parseInt(document.getElementById('projectionYears').value);
            const annualReturn = parseFloat(document.getElementById('annualReturn').value) / 100;
            const current401kBalance = parseFloat(document.getElementById('current401kBalance').value);
            
            // Get company benefit configuration
            const hasBonus = document.getElementById('hasBonus').checked;
            const bonusPercentage = hasBonus ? parseFloat(document.getElementById('bonusPercent').value) / 100 : 0;
            const bonusContributionPercent = hasBonus ? parseFloat(document.getElementById('bonusContribPercent').value) / 100 : 0;
            
            const hasEmployerMatch = document.getElementById('hasEmployerMatch').checked;
            const employerMatchPercent = hasEmployerMatch ? parseFloat(document.getElementById('employerMatchPercent').value) / 100 : 0;
            
            const has401a = document.getElementById('has401a').checked;
            const employee401aPercent = has401a ? parseFloat(document.getElementById('contrib401aPercent').value) / 100 : 0;
            const current401aBalance = has401a ? parseFloat(document.getElementById('current401aBalance').value) : 0;

            // Fixed parameters
            const annual401kLimit = 23500; // 2025 limit (employee + bonus contributions only)
            const startYear = new Date().getFullYear();

            // Create table structure - dynamic columns based on enabled features
            let tableHeaders = `
                                <th class="table__year-col">Year</th>
                                <th class="table__salary-col">Base Salary</th>`;
            
            if (hasBonus) {
                tableHeaders += `
                                <th class="table__bonus-col">Bonus (${(bonusPercentage * 100).toFixed(1)}%)</th>`;
            }
            
            tableHeaders += `
                                <th class="table__percent-col">401k %</th>
                                <th class="table__contrib-col">Employee 401k</th>`;
            
            if (hasBonus) {
                tableHeaders += `
                                <th class="table__contrib-col">Bonus Contrib (${(bonusContributionPercent * 100).toFixed(0)}%)</th>`;
            }
            
            if (hasEmployerMatch) {
                tableHeaders += `
                                <th class="table__contrib-col">Employer Match</th>`;
            }
            
            if (has401a) {
                tableHeaders += `
                                <th class="table__contrib-col">401a (${(employee401aPercent * 100).toFixed(1)}%)</th>`;
            }
            
            tableHeaders += `
                                <th class="table__total-col">Total Contrib</th>
                                <th class="table__balance-col">401k Start</th>`;
            
            if (has401a) {
                tableHeaders += `
                                <th class="table__balance-col">401a Start</th>`;
            }
            
            tableHeaders += `
                                <th class="table__return-col">401k Returns</th>`;
            
            if (has401a) {
                tableHeaders += `
                                <th class="table__return-col">401a Returns</th>`;
            }
            
            tableHeaders += `
                                <th class="table__balance-col">401k End</th>`;
            
            if (has401a) {
                tableHeaders += `
                                <th class="table__balance-col">401a End</th>`;
            }
            
            tableHeaders += `
                                <th class="table__grand-total-col">Grand Total</th>`;

            const tableHtml = `
                <div class="table-container">
                    <table class="table table--401k">
                        <thead class="table__header">
                            <tr>
                                ${tableHeaders}
                            </tr>
                        </thead>
                        <tbody class="table__body">
            `;

            let tableBody = '';
            let current401k = current401kBalance;
            let current401a = current401aBalance;
            let totalContributions = 0;
            let totalReturns = 0;

            for (let i = 0; i < projectionYears; i++) {
                const year = startYear + i;
                
                // Calculate salary for this year with annual increases
                const currentSalary = baseSalary * Math.pow(1 + salaryIncrease, i);
                
                // Calculate bonus (configurable percentage of salary)
                const bonus = currentSalary * bonusPercentage;
                
                // Calculate bonus contribution (configurable percentage of bonus)
                const bonusContrib = bonus * bonusContributionPercent;
                
                // Calculate dynamic contribution percentage for this year
                const remainingLimitThisYear = annual401kLimit - bonusContrib;
                const contributionPercentThisYear = Math.min(remainingLimitThisYear / currentSalary, 0.50); // Cap at 50%
                
                // Calculate employee 401k contribution (based on dynamic percentage)
                const employee401kContrib = currentSalary * contributionPercentThisYear;
                
                // Since we calculated dynamically, these should already be within limits
                const finalEmployee401k = employee401kContrib;
                const finalBonusContrib = bonusContrib;
                
                // Calculate employer match (configurable percentage of salary, only on regular contributions)
                const maxEmployerMatch = hasEmployerMatch ? currentSalary * employerMatchPercent : 0;
                const employerMatch = hasEmployerMatch ? Math.min(finalEmployee401k, maxEmployerMatch) : 0;
                
                // Calculate 401a contribution (configurable percentage of salary)
                const employee401aContrib = has401a ? currentSalary * employee401aPercent : 0;
                
                // Total contributions for the year
                const total401kContrib = finalEmployee401k + finalBonusContrib + employerMatch;
                const totalYearContrib = total401kContrib + employee401aContrib;
                
                // Starting balances for this year
                const start401k = current401k;
                const start401a = current401a;
                
                // Calculate returns: (starting balance + half of contributions) * return rate
                // This assumes contributions are made throughout the year
                const midYearBalance401k = start401k + (total401kContrib / 2);
                const midYearBalance401a = start401a + (employee401aContrib / 2);
                
                const returns401k = midYearBalance401k * annualReturn;
                const returns401a = midYearBalance401a * annualReturn;
                
                // End balances
                const end401k = start401k + total401kContrib + returns401k;
                const end401a = start401a + employee401aContrib + returns401a;
                
                // Grand total
                const grandTotal = end401k + end401a;
                
                // Track totals
                totalContributions += totalYearContrib;
                totalReturns += returns401k + returns401a;
                
                // Update for next iteration
                current401k = end401k;
                current401a = end401a;
                
                // Build table row with dynamic columns
                let tableRow = `
                    <tr class="table__data-row">
                        <td class="table__year-cell"><strong>${year}</strong></td>
                        <td class="table__salary-cell">${formatCurrency(currentSalary)}</td>`;
                
                if (hasBonus) {
                    tableRow += `
                        <td class="table__bonus-cell">${formatCurrency(bonus)}</td>`;
                }
                
                tableRow += `
                        <td class="table__percent-cell"><strong>${formatPercent(contributionPercentThisYear * 100)}</strong></td>
                        <td class="table__contrib-cell">${formatCurrency(finalEmployee401k)}</td>`;
                
                if (hasBonus) {
                    tableRow += `
                        <td class="table__contrib-cell">${formatCurrency(finalBonusContrib)}</td>`;
                }
                
                if (hasEmployerMatch) {
                    tableRow += `
                        <td class="table__contrib-cell">${formatCurrency(employerMatch)}</td>`;
                }
                
                if (has401a) {
                    tableRow += `
                        <td class="table__contrib-cell">${formatCurrency(employee401aContrib)}</td>`;
                }
                
                tableRow += `
                        <td class="table__total-cell"><strong>${formatCurrency(totalYearContrib)}</strong></td>
                        <td class="table__balance-cell">${formatCurrency(start401k)}</td>`;
                
                if (has401a) {
                    tableRow += `
                        <td class="table__balance-cell">${formatCurrency(start401a)}</td>`;
                }
                
                tableRow += `
                        <td class="table__return-cell">${formatCurrency(returns401k)}</td>`;
                
                if (has401a) {
                    tableRow += `
                        <td class="table__return-cell">${formatCurrency(returns401a)}</td>`;
                }
                
                tableRow += `
                        <td class="table__balance-cell"><strong>${formatCurrency(end401k)}</strong></td>`;
                
                if (has401a) {
                    tableRow += `
                        <td class="table__balance-cell"><strong>${formatCurrency(end401a)}</strong></td>`;
                }
                
                tableRow += `
                        <td class="table__grand-total-cell"><strong>${formatCurrency(grandTotal)}</strong></td>
                    </tr>
                `;
                
                tableBody += tableRow;
            }

            const fullTableHtml = tableHtml + tableBody + `
                        </tbody>
                    </table>
                </div>
            `;

            // Enhanced summary with key metrics
            const initialTotal = current401kBalance + current401aBalance;
            const finalTotal = current401k + current401a;
            const totalGrowth = finalTotal - initialTotal;
            const finalSalary = baseSalary * Math.pow(1 + salaryIncrease, projectionYears - 1);

            // Calculate effective contribution rate (average across all years)
            const avgSalary = baseSalary * (Math.pow(1 + salaryIncrease, projectionYears) - 1) / (projectionYears * salaryIncrease || 1);
            const avgTotalContrib = totalContributions / projectionYears;
            const effectiveContribRate = avgTotalContrib / avgSalary;
            
            // Calculate average 401k contribution percentage across all years
            let totalContribPercent = 0;
            for (let i = 0; i < projectionYears; i++) {
                const currentSalary = baseSalary * Math.pow(1 + salaryIncrease, i);
                const bonus = currentSalary * bonusPercentage;
                const bonusContrib = bonus * bonusContributionPercent;
                const remainingLimitThisYear = annual401kLimit - bonusContrib;
                const contributionPercentThisYear = Math.min(remainingLimitThisYear / currentSalary, 0.50);
                totalContribPercent += contributionPercentThisYear;
            }
            const avgContribPercent = totalContribPercent / projectionYears;

            // Build dynamic summary sections
            let finalBalancesSection = `
                            <div class="summary-item">
                                <label class="summary-label">💼 401k Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurrency(current401k)}</div>
                            </div>`;
            
            if (has401a) {
                finalBalancesSection += `
                            <div class="summary-item">
                                <label class="summary-label">🏦 401a Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurrency(current401a)}</div>
                            </div>`;
            }
            
            finalBalancesSection += `
                            <div class="summary-item summary-item--highlight">
                                <label class="summary-label">🎯 Total Portfolio</label>
                                <div class="summary-value summary-value--success">${formatCurrency(finalTotal)}</div>
                            </div>`;

            // Build contribution details section
            let contributionDetailsSection = `
                            <div class="summary-item">
                                <label class="summary-label">💰 Starting Salary</label>
                                <div class="summary-value summary-value--info">${formatCurrency(baseSalary)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">📊 Final Salary</label>
                                <div class="summary-value summary-value--info">${formatCurrency(finalSalary)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🎯 Avg 401k Contribution Rate</label>
                                <div class="summary-value summary-value--warning">${formatPercent(avgContribPercent * 100)}</div>
                            </div>`;
            
            if (hasBonus) {
                contributionDetailsSection += `
                            <div class="summary-item">
                                <label class="summary-label">🎁 Annual Bonus Rate</label>
                                <div class="summary-value summary-value--info">${formatPercent(bonusPercentage * 100)}</div>
                            </div>`;
            }
            
            if (hasEmployerMatch) {
                contributionDetailsSection += `
                            <div class="summary-item">
                                <label class="summary-label">🤝 Employer Match Rate</label>
                                <div class="summary-value summary-value--info">${formatPercent(employerMatchPercent * 100)}</div>
                            </div>`;
            }
            
            contributionDetailsSection += `
                            <div class="summary-item">
                                <label class="summary-label">⚡ Effective Total Rate</label>
                                <div class="summary-value summary-value--warning">${formatPercent(effectiveContribRate * 100)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🔥 Growth Multiple</label>
                                <div class="summary-value summary-value--success">${(finalTotal / initialTotal).toFixed(2)}x</div>
                            </div>`;

            // Enhanced summary with better layout
            const summaryHtml = `
                <div class="card mt-xl card--elevated">
                    <div class="card__header">
                        <h3 class="card__title">📊 Projection Summary (${projectionYears} Years)</h3>
                        <p class="card__subtitle">Retirement savings with ${formatPercent(annualReturn * 100)} annual return and ${formatPercent(salaryIncrease * 100)} salary growth</p>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-section">
                            <h4 class="summary-section__title">Final Balances</h4>
                            ${finalBalancesSection}
                        </div>
                        
                        <div class="summary-section">
                            <h4 class="summary-section__title">Growth Analysis</h4>
                            <div class="summary-item">
                                <label class="summary-label">📈 Total Growth</label>
                                <div class="summary-value summary-value--success">${formatCurrency(totalGrowth)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💵 Total Contributions</label>
                                <div class="summary-value summary-value--warning">${formatCurrency(totalContributions)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🚀 Investment Returns</label>
                                <div class="summary-value summary-value--success">${formatCurrency(totalReturns)}</div>
                            </div>
                        </div>
                        
                        <div class="summary-section">
                            <h4 class="summary-section__title">Contribution Details</h4>
                            ${contributionDetailsSection}
                        </div>
                    </div>
                </div>
            `;

            const resultsEl = document.getElementById('results401kArea');
            if (resultsEl) {
                resultsEl.innerHTML = summaryHtml + fullTableHtml;
            } else {
                console.error('Results container not found');
            }
            
        } catch (error) {
            console.error('Error in 401k calculation:', error);
            const resultsEl = document.getElementById('results401kArea');
            if (resultsEl) {
                resultsEl.innerHTML = `
                    <div class="card">
                        <div class="card__header">
                            <h3 class="card__title">Error</h3>
                        </div>
                        <p>There was an error calculating the 401k projection. Please check your inputs and try again.</p>
                        <p><small>Error: ${error.message}</small></p>
                    </div>
                `;
            }
        }
    };

    // Auto-calculate on page load if widget exists
    if (document.getElementById('results401kArea')) {
        try { 
            window.calculate401k(); 
        } catch(e) {
            // Calculator not ready yet
        }
    }

    // 401k Info Modal Functions - Use unique function name to avoid conflicts
    function show401kInfoModal(id) {
        console.log('show401kInfoModal called with id:', id); // Debug log
        const modal = document.getElementById('info401kModal');
        const titleEl = document.getElementById('info401kTitle');
        const contentEl = document.getElementById('info401kContent');
        
        if (!modal || !titleEl || !contentEl) {
            console.error('Modal elements not found:', {modal, titleEl, contentEl});
            return;
        }
        
        const data = {
            '401k-overview': {
                title: '401k Projection Calculator Overview',
                content: `
                    <div class="info-content">
                        <h4>🎯 What is 401k Projection?</h4>
                        <p>This calculator helps you plan your retirement savings by projecting the growth of your 401k and 401a accounts over time. It uses your current salary, expected salary increases, and contribution strategies to show how your retirement savings will grow.</p>
                        
                        <h4>📊 Key Features</h4>
                        
                        <div class="method-section">
                            <h5>💰 Dynamic Contribution Optimization</h5>
                            <p><strong>Formula:</strong> Contribution % = (Annual Limit - Bonus Contribution) ÷ Current Salary</p>
                            <p><strong>How it works:</strong></p>
                            <ul>
                                <li>Automatically calculates optimal contribution percentage each year</li>
                                <li>Maximizes the $23,500 annual 401k limit (2025)</li>
                                <li>Adjusts for salary increases and bonus contributions</li>
                                <li>Ensures you never exceed IRS contribution limits</li>
                            </ul>
                        </div>
                        
                        <div class="method-section">
                            <h5>🏢 Flexible Employer Benefits</h5>
                            <p><strong>Configurable Options:</strong></p>
                            <ul>
                                <li><strong>Annual Bonus:</strong> Optional - set your company's bonus percentage (0-50%)</li>
                                <li><strong>Bonus to 401k:</strong> Optional - choose what percentage of bonus goes to 401k (0-100%)</li>
                                <li><strong>Employer Match:</strong> Optional - configure your company's matching policy (0-15%)</li>
                                <li><strong>401a Contribution:</strong> Optional - only for companies that offer 401a plans (0-10%)</li>
                            </ul>
                            <p><strong>Why This Matters:</strong> Not all companies offer the same benefits. This calculator adapts to your specific employer's benefit structure for accurate projections.</p>
                        </div>
                        
                        <div class="method-section">
                            <h5>📈 Multi-Year Projections</h5>
                            <p><strong>Growth Modeling:</strong></p>
                            <ul>
                                <li>Salary increases compound annually</li>
                                <li>Investment returns calculated on mid-year balance</li>
                                <li>Separate tracking for 401k and 401a accounts</li>
                                <li>Real-time recalculation of contribution percentages</li>
                            </ul>
                        </div>
                        
                        <h4>🧮 Calculation Methodology</h4>
                        
                        <div class="method-section">
                            <h5>📋 Annual Calculation Steps</h5>
                            <ol>
                                <li><strong>Salary Growth:</strong> Current Salary × (1 + Annual Increase)^Year</li>
                                <li><strong>Bonus Calculation:</strong> Salary × 10%</li>
                                <li><strong>Bonus Contribution:</strong> Bonus × 50%</li>
                                <li><strong>Dynamic 401k %:</strong> (23,500 - Bonus Contribution) ÷ Salary</li>
                                <li><strong>Employee 401k:</strong> Salary × Dynamic %</li>
                                <li><strong>Employer Match:</strong> min(Employee 401k, Salary × 6%)</li>
                                <li><strong>401a Contribution:</strong> Salary × 4%</li>
                                <li><strong>Investment Returns:</strong> (Starting Balance + Contributions/2) × Return Rate</li>
                            </ol>
                        </div>
                        
                        <h4>💡 Key Benefits</h4>
                        <ul>
                            <li><strong>Automatic Optimization:</strong> Maximizes contributions without manual calculation</li>
                            <li><strong>Compliance:</strong> Never exceeds IRS contribution limits</li>
                            <li><strong>Comprehensive:</strong> Includes all employer benefits and matching</li>
                            <li><strong>Flexible:</strong> Adjusts to salary changes and career progression</li>
                            <li><strong>Visual Analytics:</strong> Colorful summary panels with key insights</li>
                        </ul>
                        
                        <h4>📊 Understanding the Results</h4>
                        
                        <div class="method-section">
                            <h5>🎨 Color-Coded Table</h5>
                            <ul>
                                <li><strong style="color: #3498db;">Blue:</strong> Account balances and totals</li>
                                <li><strong style="color: #e74c3c;">Red:</strong> Contributions (money going out)</li>
                                <li><strong style="color: #27ae60;">Green:</strong> Investment returns (growth)</li>
                                <li><strong style="color: #f39c12;">Orange:</strong> Contribution percentages</li>
                            </ul>
                        </div>
                        
                        <div class="method-section">
                            <h5>📈 Summary Analytics</h5>
                            <ul>
                                <li><strong>Final Balances:</strong> Your projected account values</li>
                                <li><strong>Total Growth:</strong> How much your money grew</li>
                                <li><strong>Total Contributions:</strong> How much you and your employer contributed</li>
                                <li><strong>Investment Returns:</strong> Earnings from market growth</li>
                                <li><strong>Growth Multiple:</strong> How many times your money multiplied</li>
                            </ul>
                        </div>
                        
                        <h4>⚙️ Input Parameters</h4>
                        <ul>
                            <li><strong>Current Base Salary:</strong> Your current annual salary before bonuses</li>
                            <li><strong>Salary Increase %:</strong> Expected annual salary growth rate</li>
                            <li><strong>Projection Years:</strong> How many years to project (1-30)</li>
                            <li><strong>Rate of Return:</strong> Expected annual investment return</li>
                            <li><strong>Current Balances:</strong> Starting amounts in your 401k and 401a accounts</li>
                        </ul>
                        
                        <h4>🏢 Company Benefits Configuration</h4>
                        <ul>
                            <li><strong>Annual Bonus:</strong> Check if your company offers bonuses, set percentage (0-50%)</li>
                            <li><strong>Bonus to 401k:</strong> What percentage of your bonus you want to contribute (0-100%)</li>
                            <li><strong>Employer Match:</strong> Check if your company matches 401k contributions, set match percentage (0-15%)</li>
                            <li><strong>401a Plan:</strong> Check if your company offers 401a, set contribution percentage (0-10%)</li>
                        </ul>
                        
                        <p class="text-info"><strong>💡 Pro Tip:</strong> Uncheck benefits your company doesn't offer to get accurate projections specific to your situation.</p>
                        
                        <h4>⚠️ Important Notes</h4>
                        <ul>
                            <li><strong>Company-Specific:</strong> Configure benefits to match your specific employer's offerings</li>
                            <li><strong>Projections:</strong> Based on assumptions and may not reflect actual results</li>
                            <li><strong>Market Risk:</strong> Investment returns can vary significantly</li>
                            <li><strong>Contribution Limits:</strong> IRS limits may change annually</li>
                            <li><strong>Tax Implications:</strong> Consult a tax professional for tax planning</li>
                            <li><strong>Benefit Verification:</strong> Verify your specific employer's benefit structure with HR</li>
                        </ul>
                        
                        <p class="disclaimer"><strong>Disclaimer:</strong> This calculator is for educational and planning purposes only. Consult with qualified financial advisors for personalized retirement planning advice.</p>
                    </div>
                `
            }
        };
        
        const info = data[id];
        if (!info) {
            console.error('No data found for id:', id, 'Available keys:', Object.keys(data));
            titleEl.innerText = 'Info';
            contentEl.innerHTML = '<p>No information available for this section.</p>';
        } else {
            titleEl.innerText = info.title; 
            contentEl.innerHTML = info.content;
        }
        
        modal.classList.remove('modal--hidden'); 
        modal.setAttribute('aria-hidden','false');
        const close = document.getElementById('info401kClose'); 
        if(close) close.focus();
    }
    
    // Ensure global access - use unique function name
    window.show401kInfoModal = show401kInfoModal;
    
    function close401kInfo() { 
        const modal = document.getElementById('info401kModal'); 
        if(!modal) return; 
        modal.classList.add('modal--hidden'); 
        modal.setAttribute('aria-hidden','true'); 
    }
    
    // Ensure global access
    window.close401kInfo = close401kInfo;
    
    // Event listeners for 401k modal
    document.addEventListener('click', function(e) { 
        if(e.target && e.target.id==='info401kClose') close401kInfo(); 
        const modal = document.getElementById('info401kModal'); 
        if(modal && e.target===modal) close401kInfo(); 
    });
    
    document.addEventListener('keydown', function(e) { 
        if(e.key==='Escape') {
            close401kInfo();
        }
    });

})();
    // Input validation for 401k calculator
    function setup401kInputValidation() {
        const numberInputs = document.querySelectorAll('#baseSalary, #salaryIncrease, #projectionYears, #annualReturn, #current401aBalance, #current401kBalance, #bonusPercent, #bonusContribPercent, #employerMatchPercent, #contrib401aPercent');
        
        numberInputs.forEach(input => {
            if (!input) return;
            
            // Prevent non-numeric characters
            input.addEventListener('keypress', function(e) {
                if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true) ||
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
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

            // Clean up invalid values
            input.addEventListener('blur', function(e) {
                const value = parseFloat(this.value);
                if (isNaN(value) || value < 0) {
                    this.value = this.getAttribute('value') || '0';
                }
            });
        });
    }

    // Setup validation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup401kInputValidation);
    } else {
        setTimeout(setup401kInputValidation, 100);
    }