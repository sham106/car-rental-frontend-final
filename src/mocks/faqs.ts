export interface FaqItem {
  id: string;
  category: 'Booking' | 'Documents Required' | 'Payment' | 'Insurance' | 'Fuel' | 'Mileage' | 'Vehicle Collection' | 'Cancellations';
  question: string;
  answer: string;
}

export const MOCK_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Booking',
    question: 'How does the booking request process work?',
    answer: 'Once you submit your booking request online, our operations team verifies fleet schedule in real time and contacts you via email or WhatsApp within 2 hours with formal confirmation and reservation vouchers. No upfront payment is charged during the initial request.',
  },
  {
    id: 'faq-2',
    category: 'Booking',
    question: 'How far in advance should I reserve?',
    answer: 'We recommend reserving at least 1–2 weeks in advance, especially during peak holiday periods (October through January), to secure your preferred vehicle category.',
  },
  {
    id: 'faq-3',
    category: 'Documents Required',
    question: 'What documents do I need to present upon vehicle collection?',
    answer: 'The primary driver must present a valid national driving licence (held for at least 1 year), an International Driving Permit (if your licence is not in English or French), and a valid passport for identity verification.',
  },
  {
    id: 'faq-4',
    category: 'Payment',
    question: 'When and how do I pay for my rental?',
    answer: 'Payment is finalized upon vehicle handover. We accept major credit and debit cards (Visa, Mastercard), bank transfers, or Mauritian Rupees (MUR), Euros (EUR), and US Dollars (USD) at prevailing official exchange rates.',
  },
  {
    id: 'faq-5',
    category: 'Insurance',
    question: 'What insurance is included in the daily rental rate?',
    answer: 'All vehicle rentals include standard Third-Party Liability and Collision Damage Waiver (CDW) with a standard excess deductible. Optional Super Collision Damage Waiver (SCDW) reducing excess to zero is available upon request.',
  },
  {
    id: 'faq-6',
    category: 'Fuel',
    question: 'What is your fuel policy?',
    answer: 'We operate on a fair "Same-to-Same" fuel policy. If you receive the vehicle with a full tank or 3/4 tank, simply return it with the identical fuel level. Petrol stations are conveniently located near the airport and along all main coastal roads.',
  },
  {
    id: 'faq-7',
    category: 'Mileage',
    question: 'Is there a limit on kilometers traveled?',
    answer: 'Every rental includes unlimited mileage across the entire island of Mauritius. Explore from northern coral lagoons to southern cliffs without worrying about distance charges.',
  },
  {
    id: 'faq-8',
    category: 'Vehicle Collection',
    question: 'Where do I meet your representative at SSR Airport?',
    answer: 'Our airport concierge will meet you directly at the International Arrivals Hall holding a personalized name sign. We assist with your luggage and escort you directly to the car in dedicated parking bay P2.',
  },
  {
    id: 'faq-9',
    category: 'Vehicle Collection',
    question: 'Can you deliver the vehicle directly to my hotel or villa?',
    answer: 'Yes! We provide island-wide drop-off and collection directly to your resort, boutique hotel, or private villa concierge anywhere in Mauritius.',
  },
  {
    id: 'faq-10',
    category: 'Cancellations',
    question: 'What is your cancellation policy?',
    answer: 'Cancellations made up to 48 hours prior to the scheduled pickup time incur no cancellation fee. Please notify us as early as possible so we can release the vehicle to other travelers.',
  },
];
