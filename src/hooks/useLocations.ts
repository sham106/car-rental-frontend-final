import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RentalLocation } from '../types/booking';
export function useLocations() {
 const [locations,setLocations]=useState<RentalLocation[]>([]);
 useEffect(()=>{let active=true; api<RentalLocation[]>('/public/locations').then(x=>{if(active)setLocations(x);}).catch(()=>{}); return()=>{active=false;};},[]);
 return locations;
}
