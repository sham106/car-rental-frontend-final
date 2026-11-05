export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createVehicleSlug(brand: string, model: string): string {
  return `${slugify(`${brand} ${model}`) || 'vehicle'}-${Date.now()}`;
}
