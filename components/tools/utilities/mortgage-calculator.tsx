'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type RepaymentType = 'equal-principal-interest' | 'equal-principal';
type InterestType = 'compound' | 'simple';

interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  firstMonthPrincipal: number;
  firstMonthInterest: number;
}

interface InvestmentResult {
  totalAmount: number;
  totalInterest: number;
}

function calculateMortgage(
  principal: number,
  years: number,
  annualRate: number,
  repaymentType: RepaymentType
): MortgageResult {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  
  let monthlyPayment: number;
  let totalInterest: number;
  let firstMonthPrincipal: number;
  let firstMonthInterest: number;
  
  if (repaymentType === 'equal-principal-interest') {
    // 等额本息: Monthly payment = P * r * (1+r)^n / ((1+r)^n - 1)
    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
      totalInterest = 0;
    } else {
      const factor = Math.pow(1 + monthlyRate, months);
      monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
      totalInterest = monthlyPayment * months - principal;
    }
    firstMonthPrincipal = principal * monthlyRate;
    firstMonthInterest = monthlyPayment - firstMonthPrincipal;
  } else {
    // 等额本金: Monthly payment = P/n + remaining * r
    const monthlyPrincipal = principal / months;
    firstMonthPrincipal = monthlyPrincipal;
    firstMonthInterest = principal * monthlyRate;
    monthlyPayment = monthlyPrincipal + firstMonthInterest;
    totalInterest = (months + 1) * principal * monthlyRate / 2;
  }
  
  return {
    monthlyPayment,
    totalInterest,
    totalRepayment: principal + totalInterest,
    firstMonthPrincipal,
    firstMonthInterest,
  };
}

function calculateInvestment(
  principal: number,
  annualRate: number,
  years: number,
  interestType: InterestType
): InvestmentResult {
  const rate = annualRate / 100;
  let totalAmount: number;
  let totalInterest: number;
  
  if (interestType === 'compound') {
    // 复利: A = P * (1 + r)^n
    totalAmount = principal * Math.pow(1 + rate, years);
    totalInterest = totalAmount - principal;
  } else {
    // 单利: A = P * (1 + r*n)
    totalAmount = principal * (1 + rate * years);
    totalInterest = principal * rate * years;
  }
  
  return {
    totalAmount,
    totalInterest,
  };
}

export default function MortgageCalculator() {
  // Mortgage state
  const [loanAmount, setLoanAmount] = useState('100');
  const [loanYears, setLoanYears] = useState('30');
  const [annualRate, setAnnualRate] = useState('4.9');
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('equal-principal-interest');
  
  // Investment state
  const [investPrincipal, setInvestPrincipal] = useState('100000');
  const [investRate, setInvestRate] = useState('4');
  const [investYears, setInvestYears] = useState('5');
  const [interestType, setInterestType] = useState<InterestType>('compound');
  
  // Active tab
  const [activeTab, setActiveTab] = useState<'mortgage' | 'investment'>('mortgage');
  
  // Calculate mortgage
  const principal = parseFloat(loanAmount) || 0;
  const years = parseInt(loanYears) || 0;
  const rate = parseFloat(annualRate) || 0;
  
  const mortgageResult: MortgageResult = principal > 0 && years > 0 && rate >= 0
    ? calculateMortgage(principal, years, rate, repaymentType)
    : { monthlyPayment: 0, totalInterest: 0, totalRepayment: 0, firstMonthPrincipal: 0, firstMonthInterest: 0 };
  
  // Calculate investment
  const investPrincipalNum = parseFloat(investPrincipal) || 0;
  const investYearsNum = parseInt(investYears) || 0;
  const investRateNum = parseFloat(investRate) || 0;
  
  const investmentResult: InvestmentResult = investPrincipalNum > 0 && investYearsNum > 0 && investRateNum >= 0
    ? calculateInvestment(investPrincipalNum, investRateNum, investYearsNum, interestType)
    : { totalAmount: 0, totalInterest: 0 };
  
  return (
    <ToolLayout
      title="房贷/理财计算器"
      description="计算房贷月供和投资收益"
      instructions="输入贷款或投资参数，选择计算方式，查看结果。"
    >
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab('mortgage')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'mortgage'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          房贷计算
        </button>
        <button
          onClick={() => setActiveTab('investment')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'investment'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          理财计算
        </button>
      </div>
      
      {activeTab === 'mortgage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                贷款金额（万元）
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例如：100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                贷款年限（年）
              </label>
              <select
                value={loanYears}
                onChange={(e) => setLoanYears(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="5">5年</option>
                <option value="10">10年</option>
                <option value="15">15年</option>
                <option value="20">20年</option>
                <option value="25">25年</option>
                <option value="30">30年</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                年利率（%）
              </label>
              <input
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                step="0.01"
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例如：4.9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                还款方式
              </label>
              <select
                value={repaymentType}
                onChange={(e) => setRepaymentType(e.target.value as RepaymentType)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="equal-principal-interest">等额本息</option>
                <option value="equal-principal">等额本金</option>
              </select>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300">计算结果</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">每月月供：</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ¥{mortgageResult.monthlyPayment.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">首月本金：</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ¥{mortgageResult.firstMonthPrincipal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">首月利息：</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ¥{mortgageResult.firstMonthInterest.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">总利息：</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ¥{mortgageResult.totalInterest.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">还款总额：</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ¥{mortgageResult.totalRepayment.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <CopyButton
                text={`贷款金额：${loanAmount}万元\n贷款年限：${loanYears}年\n年利率：${annualRate}%\n每月月供：¥${mortgageResult.monthlyPayment.toFixed(2)}\n总利息：¥${mortgageResult.totalInterest.toFixed(2)}\n还款总额：¥${mortgageResult.totalRepayment.toFixed(2)}`}
              />
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'investment' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                本金（元）
              </label>
              <input
                type="number"
                value={investPrincipal}
                onChange={(e) => setInvestPrincipal(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例如：100000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                年化收益率（%）
              </label>
              <input
                type="number"
                value={investRate}
                onChange={(e) => setInvestRate(e.target.value)}
                step="0.01"
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例如：4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                投资期限（年）
              </label>
              <input
                type="number"
                value={investYears}
                onChange={(e) => setInvestYears(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例如：5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                计息方式
              </label>
              <select
                value={interestType}
                onChange={(e) => setInterestType(e.target.value as InterestType)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="compound">复利</option>
                <option value="simple">单利</option>
              </select>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-green-800 dark:text-green-300">计算结果</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">本息合计：</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ¥{investmentResult.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">收益：</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ¥{investmentResult.totalInterest.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">年化收益：</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {((investmentResult.totalInterest / investPrincipalNum / investYearsNum) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <CopyButton
                text={`本金：${investPrincipal}元\n年化收益率：${investRate}%\n投资期限：${investYears}年\n计息方式：${interestType === 'compound' ? '复利' : '单利'}\n本息合计：¥${investmentResult.totalAmount.toFixed(2)}\n收益：¥${investmentResult.totalInterest.toFixed(2)}`}
              />
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}