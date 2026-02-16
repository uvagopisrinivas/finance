// Simple simulation test - matches exactly what end user sees
// This tests the core logic without DOM dependencies

// Simulation function (simplified version)
function simulateRetirement(monthlySavings, params, goals = []) {
    const { currentCorpus, returnRate, inflationRate, yearsToRetirement, 
            yearsInRetirement, monthlyExpenses, taxRate } = params;
    
    let portfolio = currentCorpus;
    const totalYears = yearsToRetirement + yearsInRetirement;
    const futureMonthlyExpensesAtRetirement = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
    
    // Accumulation phase
    for (let year = 1; year <= yearsToRetirement; year++) {
        const monthlyRate = Math.pow(1 + returnRate, 1/12) - 1;
        
        // Add monthly savings with compounding
        for (let month = 1; month <= 12; month++) {
            portfolio = (portfolio + monthlySavings) * (1 + monthlyRate);
        }
        
        // Check for one-time goals during accumulation
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
        
        // Calculate gross withdrawal needed (including tax)
        const grossAnnualExpense = netAnnualExpense / (1 - taxRate);
        
        // Check for one-time goals during retirement
        const retirementYear = yearsToRetirement + year;
        const onetimeGoalsThisYear = goals.filter(g => g.type === 'onetime' && g.year === retirementYear);
        const onetimeGoalExpenses = onetimeGoalsThisYear.reduce((sum, g) => sum + g.amount, 0);
        const grossOnetimeGoals = onetimeGoalExpenses / (1 - taxRate);
        
        const totalGrossWithdrawal = grossAnnualExpense + grossOnetimeGoals;
        
        // Apply returns
        portfolio = portfolio * (1 + returnRate);
        
        // Check if we can cover expenses
        if (portfolio < totalGrossWithdrawal) {
            const age = params.currentAge + yearsToRetirement + year;
            return {
                success: false,
                moneyRunsOutAge: age,
                corpusAtRetirement
            };
        }
        
        // Withdraw gross amount (includes tax)
        portfolio -= totalGrossWithdrawal;
    }
    
    return {
        success: true,
        finalPortfolio: portfolio,
        corpusAtRetirement
    };
}

function formatCurrency(amount) {
    const crores = amount / 10000000;
    return `₹${crores.toFixed(2)} Cr`;
}

// Test parameters
const params = {
    currentAge: 35,
    retirementAge: 42,
    currentCorpus: 0,
    returnRate: 0.12,
    inflationRate: 0.06,
    lifeExpectancy: 90,
    monthlyExpenses: 133011,
    taxRate: 0.20, // 20% tax on withdrawals
    yearsToRetirement: 7,
    yearsInRetirement: 48
};

// One-time goals (non-recurring)
const goals = [
    {
        name: "Child's Wedding",
        type: 'onetime',
        year: 10, // Year 10 from now (age 45, 3 years into retirement)
        amount: 5000000 * Math.pow(1 + params.inflationRate, 10), // ₹50L today, inflated
        amountToday: 5000000
    },
    {
        name: "Dream House",
        type: 'onetime',
        year: 5, // Year 5 from now (age 40, 2 years before retirement)
        amount: 20000000 * Math.pow(1 + params.inflationRate, 5), // ₹2Cr today, inflated
        amountToday: 20000000
    }
];

console.log('='.repeat(80));
console.log('RETIREMENT CALCULATOR TEST - WITH ONE-TIME GOALS');
console.log('='.repeat(80));
console.log('\nTest Inputs:');
console.log(`  Current Age: ${params.currentAge} years`);
console.log(`  Target Retirement Age: ${params.retirementAge} years`);
console.log(`  Life Expectancy: ${params.lifeExpectancy} years`);
console.log(`  Expected Return Rate: ${(params.returnRate * 100)}% p.a.`);
console.log(`  Inflation Rate: ${(params.inflationRate * 100)}% p.a.`);
console.log(`  Monthly Living Expenses: ₹${params.monthlyExpenses.toLocaleString()}`);
console.log(`  Current Corpus: ₹${params.currentCorpus.toLocaleString()}`);
console.log(`  Tax Rate on Withdrawals: ${(params.taxRate * 100)}%`);

console.log('\n  One-Time Goals:');
goals.forEach(goal => {
    const age = params.currentAge + goal.year;
    const phase = goal.year <= params.yearsToRetirement ? 'Before Retirement' : 'During Retirement';
    console.log(`    - ${goal.name}: ₹${(goal.amountToday/100000).toFixed(0)}L today → ${formatCurrency(goal.amount)} at age ${age} (${phase})`);
});

// First, find the minimum required savings (this determines "Total Corpus Needed")
console.log('\n' + '='.repeat(80));
console.log('STEP 1: CALCULATE MINIMUM REQUIRED SAVINGS (via Binary Search)');
console.log('='.repeat(80));

let low = 0;
let high = 10000000;
let minRequiredSavings = high;

while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const result = simulateRetirement(mid, params, goals);
    
    if (result.success) {
        minRequiredSavings = mid;
        high = mid - 1;
    } else {
        low = mid + 1;
    }
}

// Calculate required corpus
const monthlyReturn = Math.pow(1 + params.returnRate, 1/12) - 1;
const totalMonths = params.yearsToRetirement * 12;
const requiredCorpus = minRequiredSavings * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn);

console.log(`\nMinimum Required Monthly Savings: ₹${minRequiredSavings.toLocaleString()}`);
console.log(`Total Corpus Needed by ${params.retirementAge}: ${formatCurrency(requiredCorpus)}`);
console.log('\n⚠️  This "Total Corpus Needed" should be CONSTANT for all test cases below!');
console.log(`\nNote: With ${(params.taxRate * 100)}% tax, you need to withdraw more to cover expenses.`);
console.log(`      Net expense ₹${params.monthlyExpenses.toLocaleString()}/mo requires gross withdrawal of ₹${Math.round(params.monthlyExpenses / (1 - params.taxRate)).toLocaleString()}/mo`);

// Test cases - matching what user would input
const testCases = [
    { name: 'Test 1: Under-saving', savings: 170000 },
    { name: 'Test 2: Moderate savings', savings: 400000 },
    { name: 'Test 3: Higher savings', savings: 500000 }
];

testCases.forEach((test, index) => {
    console.log('\n' + '='.repeat(80));
    console.log(`${test.name.toUpperCase()}`);
    console.log(`Monthly Savings Input: ₹${test.savings.toLocaleString()} (₹${(test.savings/100000).toFixed(2)} Lacs)`);
    console.log('='.repeat(80));
    
    const result = simulateRetirement(test.savings, params, goals);
    const accumulatedCorpus = result.corpusAtRetirement;
    const surplus = accumulatedCorpus - requiredCorpus;
    
    console.log('\n📊 WHAT END USER SHOULD SEE:');
    console.log('-'.repeat(80));
    console.log(`  📊 Total Corpus Needed by ${params.retirementAge}:     ${formatCurrency(requiredCorpus)}`);
    console.log(`  📈 Accumulated Corpus by ${params.retirementAge}:       ${formatCurrency(accumulatedCorpus)}`);
    
    if (surplus >= 0) {
        console.log(`  ✅ Surplus by ${params.retirementAge}:                  ${formatCurrency(surplus)}`);
        console.log(`  💳 Required Monthly Savings by ${params.retirementAge}: ₹0 (goal met!)`);
    } else {
        console.log(`  ❌ Shortfall by ${params.retirementAge}:                ${formatCurrency(Math.abs(surplus))}`);
        console.log(`  💳 Required Monthly Savings by ${params.retirementAge}: ₹${minRequiredSavings.toLocaleString()}`);
    }
    
    if (result.success) {
        console.log(`  💰 Legacy by ${params.lifeExpectancy}:                      ${formatCurrency(result.finalPortfolio)}`);
        console.log(`\n  ✅ Money lasts until age ${params.lifeExpectancy}`);
    } else {
        console.log(`  ⚠️  Money Runs Out:                      Age ${result.moneyRunsOutAge}`);
        console.log(`\n  ❌ Money runs out at age ${result.moneyRunsOutAge} (${params.lifeExpectancy - result.moneyRunsOutAge} years short)`);
    }
});

console.log('\n' + '='.repeat(80));
console.log('KEY INSIGHT:');
console.log('='.repeat(80));
console.log(`"Total Corpus Needed" should ALWAYS show ${formatCurrency(requiredCorpus)}`);
console.log('regardless of the "Monthly Savings" input value.');
console.log('Only "Accumulated Corpus" and "Surplus/Shortfall" should change.');
console.log(`\nWith ${(params.taxRate * 100)}% tax and one-time goals, the required corpus is MUCH HIGHER`);
console.log('because you need to fund both living expenses AND major life goals.');

// Verification: How close is the binary search result to exact breakeven?
console.log('\n' + '='.repeat(80));
console.log('BINARY SEARCH ACCURACY VERIFICATION');
console.log('='.repeat(80));

const exactResult = simulateRetirement(minRequiredSavings, params, goals);
console.log(`\nWith minimum required savings (₹${minRequiredSavings.toLocaleString()}):`);
console.log(`  Corpus at retirement: ${formatCurrency(exactResult.corpusAtRetirement)}`);
if (exactResult.success) {
    console.log(`  ✅ Money lasts until age ${params.lifeExpectancy}`);
    console.log(`  Final portfolio: ${formatCurrency(exactResult.finalPortfolio)}`);
    console.log(`  → This is the MINIMUM that works (breakeven or small surplus)`);
} else {
    console.log(`  ❌ Money runs out at age ${exactResult.moneyRunsOutAge}`);
    console.log(`  → Binary search error (should not happen)`);
}

// Try ₹1 less to confirm it's truly the minimum
const oneLessResult = simulateRetirement(minRequiredSavings - 1, params, goals);
console.log(`\nWith ₹1 less (₹${(minRequiredSavings - 1).toLocaleString()}):`);
if (oneLessResult.success) {
    console.log(`  ✅ Still works! Money lasts until ${params.lifeExpectancy}`);
    console.log(`  → Binary search could be tighter (but difference is negligible)`);
} else {
    console.log(`  ❌ Money runs out at age ${oneLessResult.moneyRunsOutAge}`);
    console.log(`  → Confirmed: ₹${minRequiredSavings.toLocaleString()} is the TRUE minimum`);
}

console.log('\n' + '='.repeat(80));
console.log('CONCLUSION:');
console.log('='.repeat(80));
console.log('The binary search finds the NEAREST POSSIBLE monthly savings (within ₹1)');
console.log('that makes money last until life expectancy.');
console.log('\nIt aims for BREAKEVEN (money lasts exactly until life expectancy),');
console.log('but may have a small surplus due to:');
console.log('  1. Discrete monthly savings amounts (can\'t save fractional rupees)');
console.log('  2. Compounding effects over 48 years');
console.log('  3. Annual (not continuous) withdrawals in the simulation');
console.log('='.repeat(80));

