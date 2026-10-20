export interface GarageAddressFields {
  address_street: string | null;
  address_postal_code: string | null;
  address_city: string | null;
  address: string | null;
}

/**
 * Adresse structurée si disponible, sinon repli sur l'ancien champ texte
 * libre "address" (garages créés avant l'ajout des champs structurés).
 */
export function formatGarageAddress(garage: GarageAddressFields): string | null {
  const hasStructured = garage.address_street || garage.address_postal_code || garage.address_city;
  if (!hasStructured) return garage.address;

  const line2 = [garage.address_postal_code, garage.address_city].filter(Boolean).join(" ");
  return [garage.address_street, line2].filter(Boolean).join(", ");
}
