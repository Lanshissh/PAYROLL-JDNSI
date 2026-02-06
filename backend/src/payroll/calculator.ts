import {
  PayrollInput,
  PayrollOutput,
  PayrollItem,
  EmployeePayrollSummary
} from './types';
import { getEmployeeRate } from './rateResolver';
import { applyRounding } from './rulesResolver';

export function calculatePayroll(input: PayrollInput): PayrollOutput {
  const items: PayrollItem[] = [];
  const summariesMap: Record<string, EmployeePayrollSummary> = {};

  for (const day of input.attendance) {
    const rate = getEmployeeRate(day.employee_id, input.rates);

    const regularHours = day.regular_minutes / 60;
    const overtimeHours = day.overtime_minutes / 60;
    const nightDiffHours = day.night_diff_minutes / 60;
    const holidayHours = day.holiday_minutes / 60;
    const restDayHours = day.rest_day_minutes / 60;

    const regularPay = applyRounding(
      regularHours * rate.hourly_rate,
      input.ruleSet
    );

    const overtimePay = applyRounding(
      overtimeHours * rate.hourly_rate * rate.overtime_multiplier,
      input.ruleSet
    );

    const nightDiffPay = applyRounding(
      nightDiffHours * rate.hourly_rate * rate.night_diff_multiplier,
      input.ruleSet
    );

    const holidayPay = applyRounding(
      holidayHours * rate.hourly_rate * rate.holiday_multiplier,
      input.ruleSet
    );

    const restDayPay = applyRounding(
      restDayHours * rate.hourly_rate * rate.rest_day_multiplier,
      input.ruleSet
    );

    const grossPay = applyRounding(
      regularPay +
        overtimePay +
        nightDiffPay +
        holidayPay +
        restDayPay,
      input.ruleSet
    );

    const item: PayrollItem = {
      employee_id: day.employee_id,
      work_date: day.work_date,
      regular_pay: regularPay,
      overtime_pay: overtimePay,
      night_diff_pay: nightDiffPay,
      holiday_pay: holidayPay,
      rest_day_pay: restDayPay,
      gross_pay: grossPay
    };

    items.push(item);

    if (!summariesMap[day.employee_id]) {
      summariesMap[day.employee_id] = {
        employee_id: day.employee_id,
        gross_pay: 0,
        net_pay: 0,
        breakdown: {
          regular: 0,
          overtime: 0,
          night_diff: 0,
          holiday: 0,
          rest_day: 0,
          adjustments: 0
        }
      };
    }

    const summary = summariesMap[day.employee_id];

    summary.breakdown.regular += regularPay;
    summary.breakdown.overtime += overtimePay;
    summary.breakdown.night_diff += nightDiffPay;
    summary.breakdown.holiday += holidayPay;
    summary.breakdown.rest_day += restDayPay;
    summary.gross_pay += grossPay;
  }

  for (const summary of Object.values(summariesMap)) {
    const adjustment =
      input.mode === 'real'
        ? input.adjustments?.[summary.employee_id] ?? 0
        : 0;

    summary.breakdown.adjustments = adjustment;
    summary.net_pay = applyRounding(
      summary.gross_pay + adjustment,
      input.ruleSet
    );
  }

  return {
    items,
    summaries: Object.values(summariesMap)
  };
}