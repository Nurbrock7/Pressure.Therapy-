export const SERVICES = {
  "Deep tissue massage": { duration: 60, price: 650, deposit: 150 },
  "Sports rehab": { duration: 45, price: 500, deposit: 100 },
  "Initial assessment": { duration: 30, price: 0, deposit: 0 },
} as const;

export type ServiceName = keyof typeof SERVICES;

export const SERVICE_LIST = Object.entries(SERVICES).map(([name, info]) => ({
  name: name as ServiceName,
  ...info,
}));
