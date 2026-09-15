import { useEffect, useState } from 'react';
import { bookingService } from '../services/bookingService';
import { PricingBreakdown } from '../types/booking';
export function useQuote(vehicleId:string|undefined,pickupDate:string,returnDate:string,pickupLocationId:string,returnLocationId:string) {
 const [result,setResult]=useState<{key:string; pricing:PricingBreakdown|null; error:string|null}>({key:'',pricing:null,error:null});
 const key=JSON.stringify([vehicleId,pickupDate,returnDate,pickupLocationId,returnLocationId]);
 useEffect(()=>{
  let active=true;
  if (!vehicleId) return;
  bookingService.getQuote({vehicleId,pickupDate,returnDate,pickupLocationId,returnLocationId})
   .then(pricing=>{if(active)setResult({key,pricing,error:null});})
   .catch(e=>{if(active)setResult({key,pricing:null,error:e.message});});
  return ()=>{active=false;};
 },[key]);
 return {pricing:result.key===key?result.pricing:null,error:result.key===key?result.error:null,loading:result.key!==key};
}
