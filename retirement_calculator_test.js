// Comprehensive Retirement Calculator Test Suite
// Tests all possible combinations of user inputs

// Simulation function (same as test_retirement_simple.js)
function simulateRetirement(monthlySavings, params, goals = []) {
    const { currentCorpus, returnRate, inflationRate, yearsToRetirement, 
            yearsInRetirement, monthlyExpenses, taxRate } = params;
    
    let portfolio = currentCorpus;
    const futureMonthlyExpensesAtRetirement = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
    
    // Accumulation phase
    for (let year = 1; year <= yearsToRetirement; year++) {
        const monthlyRate = Math.pow(1 + returnRate, 1/12) - 1;
        
        for (let month = 1; month <= 12; month++) {
            portfolio = (portfolio + monthlySavings) * (1 + monthlyRate);
        }
        
        const onetimeGoalsThisYear = goals.filter(g => g.type === 'onetime' && g.year === year);
        onetimeGoalsThisYear.forEach(goal => {
            const grossAmount = goal.amount / (1 - taxRate);
            portfolio -= grossAmount;
        });
    }
    
    const corpusAtRetirement = portfolio;
    
    // Retirement phase
    for (let year = 1; year <= yearsInRetirement; year++) {
        const yearsIntoRetirement = year - 1;
        const netMonthlyExpense = futureMonthlyExpensesAtRetirement * Math.pow(1 + inflationRate, yearsIntoRetirement);
        const netAnnualExpense = netMonthlyExpense * 12;
        const grossAnnualExpense = netAnnualExpense / (1 - taxRate);
        
        const retirementYear = yearsToRetirement + year;
        const onetimeGoalsThisYear = goals.filter(g => g.type === 'onetime' && g.year === retirementYear);
        const onetimeGoalExpenses = onetimeGoalsThisYear.reduce((sum, g) => sum + g.amount, 0);
        const grossOnetimeGoals = onetimeGoalExpenses / (1 - taxRate);
        
        const totalGrossWithdrawal = grossAnnualExpense + grossOnetimeGoals;
        
        portfolio = portfolio * (1 + returnRate);
        
        if (portfolio < totalGrossWithdrawal) {
            const age = params.currentAge + yearsToRetirement + year;
            return {
                success: false,
                moneyRunsOutAge: age,
                corpusAtRetirement
            };
        }
        
        portfolio -= totalGrossWithdrawal;
    }
    
    return {
        success: true,
        finalPortfolio: portfolio,
        corpusAtRetirement
    };
}

function findRequiredMonthlySavings(goals, params) {
    let low = 0;
    let high = 10000000;
    let bestSavings = high;

    const maxResult = simulateRetirement(high, params, goals);
    if (!maxResult.success) {
        return high;
    }

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const result = simulateRetirement(mid, params, goals);

        if (result.success) {
            bestSavings = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }

    return bestSavings;
}

function formatCurrency(amount) {
    const crores = amount / 10000000;
    return `₹${crores.toFixed(2)} Cr`;
}

function formatLacs(amount) {
    const lacs = amount / 100000;
    return `₹${lacs.toFixed(2)} L`;
}

// Test scenarios covering all possible combinations
const testScenarios = [
    {
        name: "Scenario 1: Young Professional - No Corpus, No Tax, Default Goals",
        params: {
            currentAge: 25,
            retirementAge: 60,
            currentCorpus: 0,
            returnRate: 0.12,
            inflationRate: 0.06,
            lifeExpectancy: 85,
            monthlyExpenses: 50000,
            taxRate: 0,
            yearsToRetirement: 35,
            yearsInRetirement: 25
        },
        goals: [
            { name: "Child's Education", type: 'onetime', year: 20, amount: 5000000 * Math.pow(1.06, 20), amountToday: 5000000 }
        ],
        testSavings: [50000, 100000, 150000]
    },
    {
        name: "Scenario 2: Mid-Career - With Corpus, With Tax, Multiple Goals",
        params: {
            currentAge: 35,
            retirementAge: 42,
            currentCorpus: 40000000,
            returnRate: 0.12,
            inflationRate: 0.06,
            lifeExpectancy: 90,
            monthlyExpenses: 133011,
            taxRate: 0.20,
            yearsToRetirement: 7,
            yearsInRetirement: 48
        },
        goals: [
            { name: "Child's Wedding", type: 'onetime', year: 25, amount: 10000000 * Math.pow(1.06, 25), amountToday: 10000000 }
        ],
        testSavings: [200000, 290000, 400000]
    },
    {
        name: "Scenario 3: Near Retirement - Large Corpus, No Tax, High Expenses",
        params: {
            currentAge: 55,
            retirementAge: 60,
            currentCorpus: 100000000,
            returnRate: 0.10,
            inflationRate: 0.05,
            lifeExpectancy: 85,
            monthlyExpenses: 200000,
            taxRate: 0,
            yearsToRetirement: 5,
            yearsInRetirement: 25
        },
        goals: [],
        testSavings: [100000, 200000, 300000]
    },
    {
        name: "Scenario 4: Early Retirement - No Corpus, High Tax, Aggressive Goals",
        params: {
            currentAge: 30,
            retirementAge: 45,
            currentCorpus: 0,
            returnRate: 0.15,
            inflationRate: 0.07,
            lifeExpectancy: 90,
            monthlyExpenses: 100000,
            taxRate: 0.30,
            yearsToRetirement: 15,
            yearsInRetirement: 45
        },
        goals: [
            { name: "Dream House", type: 'onetime', year: 10, amount: 50000000 * Math.pow(1.07, 10), amountToday: 50000000 },
            { name: "World Tour", type: 'onetime', year: 20, amount: 5000000 * Math.pow(1.07, 20), amountToday: 5000000 }
        ],
        testSavings: [200000, 400000, 600000]
    },
    {
        name: "Scenario 5: Conservative - Small Corpus, Low Returns, Low Inflation",
        params: {
            currentAge: 40,
            retirementAge: 60,
            currentCorpus: 5000000,
            returnRate: 0.08,
            inflationRate: 0.04,
            lifeExpectancy: 80,
            monthlyExpenses: 40000,
            taxRate: 0.10,
            yearsToRetirement: 20,
            yearsInRetirement: 20
        },
        goals: [],
        testSavings: [30000, 50000, 70000]
    },
    {
        name: "Scenario 6: Aggressive - No Corpus, High Returns, Multiple Goals",
        params: {
            currentAge: 28,
            retirementAge: 50,
            currentCorpus: 0,
            returnRate: 0.18,
            inflationRate: 0.08,
            lifeExpectancy: 85,
            monthlyExpenses: 80000,
            taxRate: 0.25,
            yearsToRetirement: 22,
            yearsInRetirement: 35
        },
        goals: [
            { name: "Child 1 Education", type: 'onetime', year: 15, amount: 10000000 * Math.pow(1.08, 15), amountToday: 10000000 },
            { name: "Child 2 Education", type: 'onetime', year: 18, amount: 10000000 * Math.pow(1.08, 18), amountToday: 10000000 },
            { name: "Child 1 Wedding", type: 'onetime', year: 25, amount: 15000000 * Math.pow(1.08, 25), amountToday: 15000000 }
        ],
        testSavings: [150000, 300000, 450000]
    },
    {
        name: "Scenario 7: Late Start - No Corpus, Short Timeline, High Savings Needed",
        params: {
            currentAge: 50,
            retirementAge: 60,
            currentCorpus: 0,
            returnRate: 0.12,
            inflationRate: 0.06,
            lifeExpectancy: 85,
            monthlyExpenses: 150000,
            taxRate: 0.15,
            yearsToRetirement: 10,
            yearsInRetirement: 25
        },
        goals: [
            { name: "Daughter's Wedding", type: 'onetime', year: 5, amount: 20000000 * Math.pow(1.06, 5), amountToday: 20000000 }
        ],
        testSavings: [300000, 500000, 700000]
    },
    {
        name: "Scenario 8: Minimal - Young, No Corpus, No Tax, Minimal Expenses",
        params: {
            currentAge: 22,
            retirementAge: 60,
            currentCorpus: 0,
            returnRate: 0.12,
            inflationRate: 0.06,
            lifeExpectancy: 80,
            monthlyExpenses: 25000,
            taxRate: 0,
            yearsToRetirement: 38,
            yearsInRetirement: 20
        },
        goals: [],
        testSavings: [20000, 40000, 60000]
    }
];

console.log('='.repeat(100));
console.log('COMPREHENSIVE RETIREMENT CALCULATOR TEST SUITE');
console.log('Testing all possible combinations of user inputs');
console.log('='.repeat(100));

testScenarios.forEach((scenario, scenarioIndex) => {
    console.log('\n\n' + '='.repeat(100));
    console.log(`${scenario.name}`);
    console.log('='.repeat(100));
    
    console.log('\nInput Parameters:');
    console.log(`  Age: ${scenario.params.currentAge} → Retirement: ${scenario.params.retirementAge} → Life: ${scenario.params.lifeExpectancy}`);
    console.log(`  Current Corpus: ${formatCurrency(scenario.params.currentCorpus)}`);
    console.log(`  Return Rate: ${(scenario.params.returnRate * 100).toFixed(0)}% | Inflation: ${(scenario.params.inflationRate * 100).toFixed(0)}% | Tax: ${(scenario.params.taxRate * 100).toFixed(0)}%`);
    console.log(`  Monthly Expenses: ${formatLacs(scenario.params.monthlyExpenses)}`);
    console.log(`  Goals: ${scenario.goals.length} goal(s)`);
    
    if (scenario.goals.length > 0) {
        scenario.goals.forEach(goal => {
            console.log(`    - ${goal.name}: ${formatCurrency(goal.amountToday)} (today) at year ${goal.year}`);
        });
    }
    
    // Find minimum required savings (starting from zero corpus)
    const paramsZeroCorpus = { ...scenario.params, currentCorpus: 0 };
    const minRequiredSavings = findRequiredMonthlySavings(scenario.goals, paramsZeroCorpus);
    
    const monthlyReturn = Math.pow(1 + scenario.params.returnRate, 1/12) - 1;
    const totalMonths = scenario.params.yearsToRetirement * 12;
    const totalCorpusNeeded = minRequiredSavings * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn);
    
    console.log('\n📊 BASELINE (Starting from ₹0):');
    console.log(`  Total Corpus Needed by ${scenario.params.retirementAge}: ${formatCurrency(totalCorpusNeeded)}`);
    console.log(`  Minimum Required Monthly Savings: ${formatLacs(minRequiredSavings)}`);
    
    // If user has existing corpus, calculate adjusted requirements
    if (scenario.params.currentCorpus > 0) {
        const minRequiredWithCorpus = findRequiredMonthlySavings(scenario.goals, scenario.params);
        const futureCorpus = scenario.params.currentCorpus * Math.pow(1 + scenario.params.returnRate, scenario.params.yearsToRetirement);
        
        console.log('\n💰 WITH EXISTING CORPUS:');
        console.log(`  Current Corpus grows to: ${formatCurrency(futureCorpus)} by age ${scenario.params.retirementAge}`);
        console.log(`  Adjusted Required Monthly Savings: ${formatLacs(minRequiredWithCorpus)}`);
        console.log(`  Savings Reduction: ${formatLacs(minRequiredSavings - minRequiredWithCorpus)}/month`);
        console.log(`  ⚠️  Note: "Total Corpus Needed" stays CONSTANT at ${formatCurrency(totalCorpusNeeded)}`);
    }
    
    // Test with different savings amounts
    console.log('\n' + '-'.repeat(100));
    console.log('TESTING WITH DIFFERENT MONTHLY SAVINGS:');
    console.log('-'.repeat(100));
    
    scenario.testSavings.forEach((savings, index) => {
        const result = simulateRetirement(savings, scenario.params, scenario.goals);
        const accumulatedCorpus = result.corpusAtRetirement;
        const surplus = accumulatedCorpus - totalCorpusNeeded;
        
        console.log(`\n${index + 1}. Monthly Savings: ${formatLacs(savings)}`);
        console.log(`   Total Corpus Needed: ${formatCurrency(totalCorpusNeeded)} (constant)`);
        console.log(`   Accumulated Corpus: ${formatCurrency(accumulatedCorpus)}`);
        
        if (surplus >= 0) {
            console.log(`   ✅ Surplus: ${formatCurrency(surplus)}`);
            if (result.success) {
                console.log(`   💰 Legacy at ${scenario.params.lifeExpectancy}: ${formatCurrency(result.finalPortfolio)}`);
                console.log(`   ✅ Money lasts until age ${scenario.params.lifeExpectancy}`);
            }
        } else {
            console.log(`   ❌ Shortfall: ${formatCurrency(Math.abs(surplus))}`);
            if (!result.success) {
                const yearsShort = scenario.params.lifeExpectancy - result.moneyRunsOutAge;
                console.log(`   ⚠️  Money runs out at age ${result.moneyRunsOutAge} (${yearsShort} years short)`);
            }
        }
    });
    
    // Key insights for this scenario
    console.log('\n' + '-'.repeat(100));
    console.log('KEY INSIGHTS:');
    console.log('-'.repeat(100));
    
    const yearsToRetirement = scenario.params.yearsToRetirement;
    const yearsInRetirement = scenario.params.yearsInRetirement;
    const totalYears = yearsToRetirement + yearsInRetirement;
    
    console.log(`  • Timeline: ${yearsToRetirement} years to save, ${yearsInRetirement} years in retirement (${totalYears} total)`);
    console.log(`  • "Total Corpus Needed" is CONSTANT: ${formatCurrency(totalCorpusNeeded)}`);
    console.log(`  • This value does NOT change based on current corpus or monthly savings`);
    console.log(`  • Only "Accumulated Corpus" and "Surplus/Shortfall" change with different inputs`);
    
    if (scenario.params.taxRate > 0) {
        const netExpense = scenario.params.monthlyExpenses;
        const grossExpense = netExpense / (1 - scenario.params.taxRate);
        console.log(`  • Tax Impact: Need to withdraw ${formatLacs(grossExpense)}/mo to get ${formatLacs(netExpense)}/mo after ${(scenario.params.taxRate * 100).toFixed(0)}% tax`);
    }
    
    if (scenario.goals.length > 0) {
        const totalGoalsToday = scenario.goals.reduce((sum, g) => sum + g.amountToday, 0);
        console.log(`  • Goals: ${scenario.goals.length} goal(s) totaling ${formatCurrency(totalGoalsToday)} in today's money`);
    }
});

console.log('\n\n' + '='.repeat(100));
console.log('TEST SUITE COMPLETE');
console.log('='.repeat(100));
console.log('\nKEY TAKEAWAYS:');
console.log('1. "Total Corpus Needed" is ALWAYS constant for a given set of goals/expenses/age');
console.log('2. It does NOT change based on current corpus or monthly savings input');
console.log('3. Only "Accumulated Corpus" and "Surplus/Shortfall" change with different inputs');
console.log('4. Tax rate significantly impacts the corpus needed (higher tax = more corpus needed)');
console.log('5. Inflation compounds over time, making future goals much more expensive');
console.log('6. Starting early gives more time for compounding, reducing monthly savings needed');
console.log('7. Existing corpus reduces monthly savings burden but doesn\'t change total needed');
console.log('='.repeat(100));
