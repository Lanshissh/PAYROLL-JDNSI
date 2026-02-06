import { EmployeeRate } from './types';

export function getEmployeeRate(
  employeeId: string,
  rates: Record<string, EmployeeRate>
): EmployeeRate {
  const rate = rates[employeeId];

  if (!rate) {
    throw new Error(`Missing rate for employee ${employeeId}`);
  }

  return rate;
}