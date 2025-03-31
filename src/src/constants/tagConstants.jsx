export const ENUM_COSTCENTER = ["ti-ferry", "ti-logistics", "ti-pax", "ti-ctai", "ti-data", "ti-arch", "ti-it", "ti-inno", "ti-platform", "ti-competence", "ti-other", "finance", "ferry", "logistics"];
export const ENUM_COSTCENTER_OPTIONS = ENUM_COSTCENTER.map((item) => ({ value: item.toLowerCase(), label: item }));
    
export const ENUM_CRITICALITY = ["Low", "Medium", "High"];
export const ENUM_CRITICALITY_OPTIONS = ENUM_CRITICALITY.map((item) => ({ value: item.toLowerCase(), label: item }));
    
export const ENUM_AVAILABILITY = ["Low", "Medium", "High"];
export const ENUM_AVAILABILITY_OPTIONS = ENUM_AVAILABILITY.map((item) => ({ value: item.toLowerCase(), label: item }));

export const ENUM_CLASSIFICATION = ["Private", "Confidential", "Restricted"];
export const ENUM_CLASSIFICATION_OPTIONS = ENUM_CLASSIFICATION.map((item) => ({ value: item.toLowerCase(), label: item }));
