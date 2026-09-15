import { api } from '../api';
export interface ParsedImportRow {
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  engineNumber: string;
  category: string;
  mileage: number;
  dailyRate: number;
  ownerName: string;
  purchaseValue?: number;
  purchaseDate?: string;
  isValid: boolean;
  errors: string[];
}

export const adminImportService = {
 async parseFile(file:File):Promise<ParsedImportRow[]> {
  if(file.size>700000) throw new Error('Import files must be smaller than 700 KB (up to 500 rows).');
  const content = await new Promise<string>((resolve,reject)=>{ const reader=new FileReader(); reader.onload=()=>resolve(String(reader.result).split(',')[1]); reader.onerror=()=>reject(new Error('Unable to read file')); reader.readAsDataURL(file); });
  return api<ParsedImportRow[]>('/admin/import/parse',{name:file.name,content});
 },
 getTemplateCSV: () => 'Registration No,Brand,Model,Year,Color,VIN,Engine No,Category,Daily Rate,Mileage,Owner,Purchase Value,Purchase Date\n',
 commitImport: (rows:ParsedImportRow[]) => api<{importedCount:number}>('/admin/import/vehicles',{rows:rows.filter(r=>r.isValid).map(({isValid,errors,...r})=>r)}),
};
