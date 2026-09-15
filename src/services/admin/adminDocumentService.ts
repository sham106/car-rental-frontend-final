import { VehicleDocument } from '../../types/admin';
import { api, list, create } from '../api';
export const adminDocumentService = {
 getDocuments: () => list<VehicleDocument>('documents'),
 getDocumentsForVehicle: async (vehicleId: string) => (await list<VehicleDocument>('documents')).filter(v=>v.vehicleId===vehicleId),
 createDocument: (data: Omit<VehicleDocument,'id'|'uploadedAt'|'fileUrl'|'fileSize'> & {fileId:string}) => create<VehicleDocument>('documents',data),
 deleteDocument: async (id: string): Promise<void> => { await api(`/admin/records/documents/${id}`,{},'DELETE'); },
};
