export interface RentalTermSection {
  id: string;
  title: string;
  summary: string;
  details: string[];
}

export const MOCK_RENTAL_TERMS: RentalTermSection[] = [
  {
    id: 'minimum-age',
    title: 'Minimum Age Requirements',
    summary: 'Clear age thresholds calibrated to vehicle category for safety and insurance compliance.',
    details: [
      'Drivers must be at least 20 years of age for Economy and Compact category vehicles.',
      'Drivers must be at least 21 years of age for Sedan, Crossover, and Midsize SUVs.',
      'Drivers must be at least 25 years of age for Premium German Saloons and 10-seater Passenger Vans.',
      'All drivers must hold an active driving license for a minimum of 1 continuous year.',
    ],
  },
  {
    id: 'driving-licence',
    title: 'Driving Licence Validation',
    summary: 'Licences printed in English or French are recognized immediately by Mauritian transport authorities.',
    details: [
      'A full, valid national driving license from your home country must be produced.',
      'An International Driving Permit (IDP) is required if the original licence is not in English or French characters.',
      'Driving in Mauritius is on the LEFT side of the road, in accordance with British commonwealth road standards.',
    ],
  },
  {
    id: 'security-deposit',
    title: 'Security Deposit & Excess',
    summary: 'Transparent pre-authorization hold on major credit cards released upon clean return.',
    details: [
      'A refundable security pre-authorization of Rs 15,000 to Rs 35,000 (depending on category) is blocked on credit card.',
      'The pre-authorization is cancelled immediately upon inspection at return.',
      'Zero-excess SCDW add-on waivers eliminate the deposit requirement for qualified drivers.',
    ],
  },
  {
    id: 'fuel-policy',
    title: 'Fuel Policy (Same-to-Same)',
    summary: 'Fair, transparent fuel accounting without inflated refueling surcharge penalties.',
    details: [
      'Vehicles are supplied with a documented level (typically Full or 3/4) and must be returned with the same level.',
      'Fuel receipts are provided at handover noting the correct octane or low-sulfur diesel standard.',
      'Refueling stations are operational 24/7 adjacent to SSR International Airport.',
    ],
  },
  {
    id: 'mileage-limits',
    title: 'Mileage & Territory',
    summary: 'Unlimited mileage island-wide for comprehensive freedom.',
    details: [
      '100% unlimited mileage is included in every standard rental agreement.',
      'Vehicles must remain strictly on paved public highways and gazetted secondary roads. Off-road beach driving or unpaved private tracks are prohibited.',
    ],
  },
  {
    id: 'additional-drivers',
    title: 'Additional Drivers',
    summary: 'Share driving responsibilities across your party with easy authorization.',
    details: [
      'One secondary driver may be registered at no additional charge when listed on the rental agreement.',
      'All additional drivers must present the same required licensing and passport documentation.',
    ],
  },
  {
    id: 'late-returns',
    title: 'Late Return Grace Period',
    summary: 'We understand island traffic and flight adjustments.',
    details: [
      'A complimentary 60-minute grace period is granted beyond the agreed drop-off time.',
      'Extensions beyond 60 minutes are billed at standard pro-rated hourly rates with prior telephone notice.',
    ],
  },
  {
    id: 'damage-procedure',
    title: 'Incident & Damage Reporting',
    summary: '24/7 roadside assistance and clear incident protocols.',
    details: [
      'In the rare event of an incident or breakdown, contact our 24/7 dedicated dispatch line immediately.',
      'Complete joint handover inspection checklists are conducted and countersigned at both pickup and return with high-resolution photo logs.',
    ],
  },
];
