import { Assignment } from '../../types/admin';
import { INITIAL_ADMIN_ASSIGNMENTS } from '../../mocks/adminFleet';
import { adminVehicleService } from './adminVehicleService';
import { adminAuditService } from './adminAuditService';

const STORAGE_KEY = 'oceane_admin_assignments_v2';

class AdminAssignmentService {
  private getStored(): Assignment[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_ASSIGNMENTS));
        return INITIAL_ADMIN_ASSIGNMENTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_ASSIGNMENTS;
    }
  }

  private save(list: Assignment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('oceane_assignments_updated'));
  }

  async getAssignments(): Promise<Assignment[]> {
    return this.getStored();
  }

  async getAssignment(id: string): Promise<Assignment | null> {
    const list = this.getStored();
    return list.find((a) => a.id === id) || null;
  }

  async createAssignment(data: Omit<Assignment, 'id' | 'createdAt' | 'status'>): Promise<Assignment> {
    const list = this.getStored();
    const id = `asg-${Date.now().toString().slice(-6)}`;
    const newAssignment: Assignment = {
      ...data,
      id,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newAssignment);
    this.save(list);

    // Update vehicle operational status to 'assigned' and currentAssignmentId
    await adminVehicleService.updateVehicle(data.vehicleId, {
      operationalStatus: 'assigned',
      currentAssignmentId: id,
      statusChangeReason: `Assigned to ${data.assignedTo} (${data.assignmentType}): ${data.reason}`,
      statusChangedAt: new Date().toISOString(),
    });

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Vehicle Assigned',
      targetType: 'Assignment',
      targetId: id,
      targetLabel: `${data.vehicleReg} (${data.vehicleName})`,
      details: `Assigned to ${data.assignedTo} for ${data.reason} from ${data.startDate} to ${data.expectedReturnDate}. Mileage out: ${data.mileageOut} km.`,
      reason: data.reason,
    });

    return newAssignment;
  }

  async endAssignment(id: string, mileageIn: number, notes?: string): Promise<Assignment> {
    const list = this.getStored();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Assignment not found');

    const assignment = list[idx];
    assignment.status = 'Completed';
    assignment.actualReturnDate = new Date().toISOString().split('T')[0];
    assignment.mileageIn = mileageIn;
    if (notes) assignment.notes = (assignment.notes ? assignment.notes + ' | ' : '') + notes;
    list[idx] = assignment;
    this.save(list);

    // Update vehicle status back to 'available' and update vehicle odometer
    await adminVehicleService.updateVehicle(assignment.vehicleId, {
      operationalStatus: 'available',
      currentAssignmentId: undefined,
      mileage: Math.max(mileageIn, assignment.mileageOut),
      statusChangeReason: `Assignment to ${assignment.assignedTo} ended and returned to available fleet.`,
      statusChangedAt: new Date().toISOString(),
    });

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Assignment Completed',
      targetType: 'Assignment',
      targetId: id,
      targetLabel: `${assignment.vehicleReg}`,
      details: `Vehicle returned by ${assignment.assignedTo}. Return mileage: ${mileageIn} km. Status set to Available.`,
    });

    return assignment;
  }

  async cancelAssignment(id: string, reason: string): Promise<Assignment> {
    const list = this.getStored();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Assignment not found');

    const assignment = list[idx];
    assignment.status = 'Cancelled';
    assignment.notes = (assignment.notes ? assignment.notes + ' | ' : '') + `Cancelled: ${reason}`;
    list[idx] = assignment;
    this.save(list);

    await adminVehicleService.updateVehicle(assignment.vehicleId, {
      operationalStatus: 'available',
      currentAssignmentId: undefined,
    });

    return assignment;
  }
}

export const adminAssignmentService = new AdminAssignmentService();
