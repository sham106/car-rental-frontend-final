import { VehicleDocument } from '../../types/admin';
import { INITIAL_ADMIN_DOCUMENTS } from '../../mocks/adminFleet';
import { adminAuditService } from './adminAuditService';

const STORAGE_KEY = 'oceane_admin_documents_v1';

class AdminDocumentService {
  private getStored(): VehicleDocument[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_DOCUMENTS));
        return INITIAL_ADMIN_DOCUMENTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_DOCUMENTS;
    }
  }

  private save(list: VehicleDocument[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('oceane_docs_updated'));
  }

  async getDocuments(): Promise<VehicleDocument[]> {
    return this.getStored();
  }

  async getDocumentsForVehicle(vehicleId: string): Promise<VehicleDocument[]> {
    const list = this.getStored();
    return list.filter((d) => d.vehicleId === vehicleId);
  }

  async createDocument(data: Omit<VehicleDocument, 'id' | 'uploadedAt'>): Promise<VehicleDocument> {
    const list = this.getStored();
    const id = `doc-${Date.now().toString().slice(-6)}`;
    const newDoc: VehicleDocument = {
      ...data,
      id,
      uploadedAt: new Date().toISOString(),
    };
    list.unshift(newDoc);
    this.save(list);

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Document Uploaded',
      targetType: 'Document',
      targetId: id,
      targetLabel: `${data.vehicleReg} (${data.documentType})`,
      details: `Uploaded ${data.documentType}: "${data.title}" (${data.fileSize}).`,
    });

    return newDoc;
  }

  async deleteDocument(id: string): Promise<void> {
    const list = this.getStored().filter((d) => d.id !== id);
    this.save(list);
  }
}

export const adminDocumentService = new AdminDocumentService();
