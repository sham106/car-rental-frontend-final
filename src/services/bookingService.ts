import { BookingRequest, CreateBookingInput, PricingBreakdown } from '../types/booking';
import { api, ApiError, query } from './api';
const tokens = new Map<string,string>();
const pendingKeys = new Map<string,string>();
export const bookingService = {
 getQuote: (input: Omit<CreateBookingInput,'customer'>) => api<PricingBreakdown>(`/public/quote?${query(input)}`),
 async createBookingRequest(input:CreateBookingInput):Promise<BookingRequest> {
  const fingerprint = JSON.stringify(input);
  const idempotencyKey = pendingKeys.get(fingerprint) || crypto.randomUUID();
  pendingKeys.set(fingerprint,idempotencyKey);
  const result = await api<BookingRequest & {accessToken:string}>('/public/bookings',{...input,idempotencyKey});
  tokens.set(result.reference,result.accessToken);
  try { sessionStorage.setItem(`ocr_receipt_${result.reference}`,result.accessToken); } catch { /* in-memory receipt still works */ }
  const {accessToken,...booking} = result;
  return booking;
 },
 async getBookingByReference(reference:string):Promise<BookingRequest|null> {
  let accessToken=tokens.get(reference);
  try { accessToken ||= sessionStorage.getItem(`ocr_receipt_${reference}`) || undefined; } catch { /* storage disabled */ }
  if (!accessToken) return null;
  try { return await api<BookingRequest>('/public/bookings/lookup',{reference,accessToken}); }
  catch(e) { if(e instanceof ApiError && e.status===404) return null; throw e; }
 },
};
