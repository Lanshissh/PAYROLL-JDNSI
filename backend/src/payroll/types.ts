export type PayrollMode = 'sandbox' | 'real';

export interface AttendanceDay {
  employee_id: string;
  work_date: string;

  regular_minutes: number;
  overtime_minutes: number;
  night_diff_minutes: number;
  holiday_minutes: number;
  rest_day_minutes: number;
}

export interface EmployeeRate {
  employee_id: string;
  hourly_rate: number;
  overtime_multiplier: number;
  night_diff_multiplier: number;
  holiday_multiplier: number;
  rest_day_multiplier: number;
}

export interface RuleSet {
  id: string;
  rounding: 'exact' | 'floor' | 'ceil';
}

export interface PayrollInput {
  mode: PayrollMode;
  attendance: AttendanceDay[];
  rates: Record<string, EmployeeRate>;
  ruleSet: RuleSet;
  adjustments?: Record<string, number>; // employee_id → adjustment amount
}

export interface PayrollItem {
  employee_id: string;
  work_date: string;

  regular_pay: number;
  overtime_pay: number;
  night_diff_pay: number;
  holiday_pay: number;
  rest_day_pay: number;

  gross_pay: number;
}

export interface EmployeePayrollSummary {
  employee_id: string;
  gross_pay: number;
  net_pay: number;

  breakdown: {
    regular: number;
    overtime: number;
    night_diff: number;
    holiday: number;
    rest_day: number;
    adjustments: number;
  };
}

export interface PayrollOutput {
  items: PayrollItem[];
  summaries: EmployeePayrollSummary[];
}