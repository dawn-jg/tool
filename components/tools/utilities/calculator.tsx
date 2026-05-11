'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [resetOnNext, setResetOnNext] = useState(false);

  const handleDigit = (d: string) => {
    if (resetOnNext) {
      setDisplay(d);
      setResetOnNext(false);
    } else {
      setDisplay((prev) => (prev === '0' ? d : prev + d));
    }
  };

  const handleOp = (op: string) => {
    setExpression((prev) => prev + display + ' ' + op + ' ');
    setResetOnNext(true);
  };

  const handleEqual = () => {
    try {
      const full = expression + display;
      // Replace × ÷ with * /
      const sanitized = full.replace(/×/g, '*').replace(/÷/g, '/');
      const result = Function('"use strict"; return (' + sanitized + ')')();
      setDisplay(String(result));
      setExpression('');
      setResetOnNext(true);
    } catch {
      setDisplay('Error');
      setExpression('');
      setResetOnNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setResetOnNext(false);
  };

  const handleBack = () => {
    setDisplay((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  };

  const handleDot = () => {
    if (resetOnNext) {
      setDisplay('0.');
      setResetOnNext(false);
    } else if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  };

  const buttons = [
    ['C', '(', ')', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['⌫', '0', '.', '='],
  ];

  const handleClick = (btn: string) => {
    switch (btn) {
      case 'C': handleClear(); break;
      case '⌫': handleBack(); break;
      case '=': handleEqual(); break;
      case '+': case '-': case '×': case '÷': handleOp(btn); break;
      case '(': case ')':
        setExpression((prev) => prev + btn);
        break;
      case '.': handleDot(); break;
      default: handleDigit(btn);
    }
  };

  return (
    <ToolLayout
      title="计算器"
      description="在线科学计算器"
      instructions="点击按钮或使用鼠标操作。支持基本四则运算和小括号。计算使用JavaScript引擎，支持浮点数运算。结果可复制到剪贴板。"
      output={display !== '0' && display !== 'Error' ? display : undefined}
    >
      <div className="max-w-xs mx-auto">
        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 mb-4">
          <div className="text-right text-sm text-gray-500 dark:text-gray-400 font-mono h-6 overflow-hidden">
            {expression}
          </div>
          <div className="text-right text-3xl font-mono font-bold text-gray-900 dark:text-white overflow-hidden">
            {display}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {buttons.flat().map((btn) => (
            <button
              key={btn}
              onClick={() => handleClick(btn)}
              className={`p-4 rounded-xl text-lg font-medium transition-colors ${
                btn === '='
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : ['+', '-', '×', '÷'].includes(btn)
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  : ['C', '⌫'].includes(btn)
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
        {display !== '0' && display !== 'Error' && (
          <div className="mt-3 text-center">
            <CopyButton text={display} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
