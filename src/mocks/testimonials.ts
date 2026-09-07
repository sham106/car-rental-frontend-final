export interface TestimonialItem {
  id: string;
  customerName: string;
  location: string;
  vehicleRented: string;
  rentalDuration: string;
  rating: number; // out of 5
  review: string;
  date: string;
}

export const MOCK_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    customerName: 'Marcus & Claire Vance',
    location: 'Surrey, United Kingdom',
    vehicleRented: 'Toyota RAV4 Hybrid AWD',
    rentalDuration: '10 Days',
    rating: 5,
    review: 'The airport handover was seamless — met us right outside arrivals, walked us through the hybrid features, and the car was immaculate. The RAV4 was sensational for exploring the mountain views around Chamarel and Le Morne.',
    date: 'August 2026',
  },
  {
    id: 't-2',
    customerName: 'Jean-Philippe Moreau',
    location: 'Lyon, France',
    vehicleRented: 'Toyota Corolla Prestige',
    rentalDuration: '7 Days',
    rating: 5,
    review: 'Transparent pricing with zero hidden insurance surprises at pickup. The car was comfortable with great air conditioning and responsive customer care on WhatsApp whenever we asked for local route advice.',
    date: 'July 2026',
  },
  {
    id: 't-3',
    customerName: 'Elena Rostova',
    location: 'Cape Town, South Africa',
    vehicleRented: 'Suzuki Swift GLX',
    rentalDuration: '14 Days',
    rating: 5,
    review: 'Perfect little runaround for parking along Grand Baie and Pereybere beaches. Remarkably fuel-efficient and the drop-off directly at our villa concierge saved us so much time on departure morning.',
    date: 'August 2026',
  },
  {
    id: 't-4',
    customerName: 'David & Anja Weber',
    location: 'Munich, Germany',
    vehicleRented: 'BMW 320i M Sport',
    rentalDuration: '5 Days',
    rating: 5,
    review: 'A true executive rental experience. Vehicle arrived spotless with bottle of chilled spring water and thorough documentation. Will book with Oceane every time we visit the island.',
    date: 'June 2026',
  },
];
