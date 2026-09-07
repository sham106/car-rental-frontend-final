import { adminVehicleService } from './adminVehicleService';
import { adminAuditService } from './adminAuditService';

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

export const SAMPLE_DATA: Omit<ParsedImportRow, 'isValid' | 'errors'>[] = [
  {
    brand: 'Toyota',
    model: 'Hilux Double Cab 4x4',
    registrationNumber: '2049 MY 23',
    year: 2023,
    color: 'Polar White',
    vin: 'AHTBA3CD209182371',
    engineNumber: '1GD-FTV-882190',
    ownerName: 'Oceane Fleet Operations Ltd',
    category: 'suv',
    dailyRate: 3200,
    mileage: 19400,
    purchaseValue: 1950000,
    purchaseDate: '2023-11-10',
  },
  {
    brand: 'Mitsubishi',
    model: 'Xpander Cross 7-Seater',
    registrationNumber: '4812 JL 24',
    year: 2024,
    color: 'Graphite Metallic',
    vin: 'MMBHN01W001928471',
    engineNumber: '4A91-921820',
    ownerName: 'Chamarel Island Assets Ltd',
    category: 'van',
    dailyRate: 2300,
    mileage: 11200,
    purchaseValue: 1280000,
    purchaseDate: '2024-02-15',
  },
  {
    brand: 'Kia',
    model: 'Picanto GT-Line',
    registrationNumber: '5972 DZ 14', // Duplicate candidate with existing seed
    year: 2024,
    color: 'Honey Bee Yellow',
    vin: 'KNAB3511LNM829102',
    engineNumber: 'G3LA-881920',
    ownerName: 'Jean-Luc Ramgoolam',
    category: 'compact',
    dailyRate: 1350,
    mileage: 27800,
    purchaseValue: 680000,
    purchaseDate: '2024-03-01',
  },
  {
    brand: 'Honda',
    model: 'Fit e:HEV Hybrid',
    registrationNumber: '6102 OC 25',
    year: 2025,
    color: 'Platinum White Pearl',
    vin: 'JHMGR38300S192849',
    engineNumber: 'LEB-MF-81920',
    ownerName: 'Oceane Fleet Operations Ltd',
    category: 'compact',
    dailyRate: 1750,
    mileage: 6400,
    purchaseValue: 1180000,
    purchaseDate: '2025-01-20',
  },
  {
    brand: 'Hyundai',
    model: 'Tucson Executive 1.6T',
    registrationNumber: '3194 AG 24',
    year: 2024,
    color: 'Titan Grey',
    vin: 'KMHN841EBRU102948',
    engineNumber: 'G4FJ-291029',
    ownerName: 'Oceane Fleet Operations Ltd',
    category: 'suv',
    dailyRate: 2900,
    mileage: 14500,
    purchaseValue: 1850000,
    purchaseDate: '2024-04-12',
  },
];

class AdminImportService {
  generateSampleRows(): Omit<ParsedImportRow, 'isValid' | 'errors'>[] {
    return SAMPLE_DATA;
  }

  validateRows(
    rows: Omit<ParsedImportRow, 'isValid' | 'errors'>[],
    existingRegs: string[]
  ): ParsedImportRow[] {
    const existingNorm = new Set(
      existingRegs.map((r) => r.toUpperCase().replace(/\s+/g, ''))
    );

    return rows.map((r) => {
      const errors: string[] = [];
      const normReg = r.registrationNumber.toUpperCase().replace(/\s+/g, '');

      if (!r.registrationNumber) errors.push('Missing Registration Number');
      if (!r.brand) errors.push('Missing Brand');
      if (!r.model) errors.push('Missing Model');
      if (existingNorm.has(normReg)) {
        errors.push(`Duplicate: Vehicle ${r.registrationNumber} already exists in database.`);
      }

      return {
        ...r,
        isValid: errors.length === 0,
        errors,
      };
    });
  }

  getTemplateCSV(): string {
    const headers = [
      'Registration No',
      'Brand',
      'Model',
      'Year',
      'Color',
      'VIN',
      'Engine No',
      'Category',
      'Daily Rate',
      'Mileage',
      'Owner',
      'Purchase Value',
      'Purchase Date',
    ];
    const example = [
      '1234 MY 24',
      'Toyota',
      'Corolla Cross',
      '2024',
      'Silver',
      'AHTBA11D209182371',
      '2ZR-FE-192830',
      'suv',
      '2500',
      '15000',
      'Oceane Fleet Operations Ltd',
      '1400000',
      '2024-01-15',
    ];
    return [headers.join(','), example.join(',')].join('\n');
  }

  async commitImport(validRows: ParsedImportRow[]): Promise<{ importedCount: number }> {
    let importedCount = 0;
    const candidates = validRows.filter((r) => r.isValid);

    for (const r of candidates) {
      await adminVehicleService.createVehicle({
        slug: `${r.brand.toLowerCase()}-${r.model.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`,
        registrationNumber: r.registrationNumber,
        brand: r.brand,
        model: r.model,
        year: r.year || 2024,
        color: r.color || 'White',
        vin: r.vin || `VIN-${Date.now()}-${importedCount}`,
        engineNumber: r.engineNumber || 'ENG-TBD',
        category: r.category || 'sedan',
        dailyRate: r.dailyRate || 1800,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seats: 5,
        luggageCapacity: 3,
        doors: 4,
        airConditioning: true,
        features: ['Air Conditioning', 'Power Steering', 'ABS'],
        description: `Imported via spreadsheet migration on ${new Date().toLocaleDateString()}.`,
        photos: [
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        ],
        ownerId: 'own-01',
        ownerName: r.ownerName || 'Oceane Fleet Operations Ltd',
        purchaseDate: r.purchaseDate,
        purchaseValue: r.purchaseValue,
        currentValue: r.purchaseValue ? Math.round(r.purchaseValue * 0.9) : 900000,
        mileage: r.mileage || 10000,
        operationalStatus: 'available',
        published: true,
        featured: false,
        nextServiceMileage: (r.mileage || 10000) + 10000,
      });
      importedCount++;
    }

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Admin',
      action: 'Fleet Batch Import via Excel',
      targetType: 'Vehicle',
      targetId: 'import-batch',
      targetLabel: `${importedCount} Vehicles Imported`,
      details: `Imported ${importedCount} vehicles from spreadsheet migration wizard into active database.`,
    });

    return { importedCount };
  }
}

export const adminImportService = new AdminImportService();
