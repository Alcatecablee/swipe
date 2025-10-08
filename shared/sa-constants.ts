// South African Constants - Sprint 9

export const SA_PROVINCES = [
  { value: "gauteng", label: "Gauteng" },
  { value: "western-cape", label: "Western Cape" },
  { value: "kwazulu-natal", label: "KwaZulu-Natal" },
  { value: "eastern-cape", label: "Eastern Cape" },
  { value: "mpumalanga", label: "Mpumalanga" },
  { value: "limpopo", label: "Limpopo" },
  { value: "north-west", label: "North West" },
  { value: "northern-cape", label: "Northern Cape" },
  { value: "free-state", label: "Free State" },
] as const;

export const SA_MAJOR_CITIES = [
  // Gauteng
  { value: "johannesburg", label: "Johannesburg", province: "gauteng" },
  { value: "pretoria", label: "Pretoria", province: "gauteng" },
  { value: "sandton", label: "Sandton", province: "gauteng" },
  { value: "centurion", label: "Centurion", province: "gauteng" },
  
  // Western Cape
  { value: "cape-town", label: "Cape Town", province: "western-cape" },
  { value: "stellenbosch", label: "Stellenbosch", province: "western-cape" },
  { value: "paarl", label: "Paarl", province: "western-cape" },
  
  // KwaZulu-Natal
  { value: "durban", label: "Durban", province: "kwazulu-natal" },
  { value: "pietermaritzburg", label: "Pietermaritzburg", province: "kwazulu-natal" },
  
  // Eastern Cape
  { value: "port-elizabeth", label: "Port Elizabeth (Gqeberha)", province: "eastern-cape" },
  { value: "east-london", label: "East London", province: "eastern-cape" },
  
  // Other provinces
  { value: "bloemfontein", label: "Bloemfontein", province: "free-state" },
  { value: "polokwane", label: "Polokwane", province: "limpopo" },
  { value: "nelspruit", label: "Nelspruit (Mbombela)", province: "mpumalanga" },
  { value: "kimberley", label: "Kimberley", province: "northern-cape" },
  { value: "rustenburg", label: "Rustenburg", province: "north-west" },
] as const;

// NQF (National Qualifications Framework) Levels
export const NQF_LEVELS = [
  { value: 1, label: "NQF 1 - ABET Level 4 / Grade 9", description: "General Education and Training Certificate" },
  { value: 2, label: "NQF 2 - Grade 10", description: "General Education and Training Certificate" },
  { value: 3, label: "NQF 3 - Grade 11", description: "General Education and Training Certificate" },
  { value: 4, label: "NQF 4 - Grade 12 / Matric", description: "National Senior Certificate" },
  { value: 5, label: "NQF 5 - Certificate", description: "Higher Certificate" },
  { value: 6, label: "NQF 6 - Diploma", description: "National Diploma / Advanced Certificate" },
  { value: 7, label: "NQF 7 - Bachelor's Degree", description: "Advanced Diploma / Bachelor's Degree / B-Tech" },
  { value: 8, label: "NQF 8 - Honours Degree", description: "Honours Degree / Postgraduate Diploma" },
  { value: 9, label: "NQF 9 - Master's Degree", description: "Master's Degree" },
  { value: 10, label: "NQF 10 - Doctoral Degree", description: "Doctoral Degree / PhD" },
] as const;

// South African Languages
export const SA_LANGUAGES = [
  { value: "english", label: "English" },
  { value: "afrikaans", label: "Afrikaans" },
  { value: "zulu", label: "IsiZulu" },
  { value: "xhosa", label: "IsiXhosa" },
  { value: "sepedi", label: "Sepedi" },
  { value: "setswana", label: "Setswana" },
  { value: "sesotho", label: "Sesotho" },
  { value: "tsonga", label: "Xitsonga" },
  { value: "swati", label: "SiSwati" },
  { value: "venda", label: "Tshivenda" },
  { value: "ndebele", label: "IsiNdebele" },
] as const;

// Work authorization types for South Africa
export const SA_WORK_AUTH = [
  { value: "citizen", label: "South African Citizen" },
  { value: "permanent-resident", label: "Permanent Resident" },
  { value: "work-permit", label: "Work Permit" },
  { value: "critical-skills", label: "Critical Skills Visa" },
  { value: "general-work", label: "General Work Visa" },
  { value: "corporate", label: "Corporate Visa" },
] as const;

// POPIA compliance notice
export const POPIA_NOTICE = `
By using SwipeJob, you consent to the processing of your personal information in accordance with the Protection of Personal Information Act (POPIA), 2013. We collect and process your data solely for job matching and application purposes. Your information is securely stored and will not be shared without your consent.
`;
