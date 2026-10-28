// Bronx civic data — Your Voice in the Bronx

export type Official = {
  name: string;
  title: string;
  party?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  address?: string;
  helps?: string;
};

export type CommunityBoard = {
  id: string;
  address: string;
  schedule: string;
  time: string;
  publicSession: string;
  phone: string;
  email: string;
  website: string;
};

export type Precinct = {
  name: string;
  address: string;
  phone: string;
  serves: string;
  nextMeeting: string;
};

export const BOROUGH_WIDE: Official[] = [
  { name: "Vanessa Gibson", title: "Bronx Borough President", party: "D", phone: "718-590-3500", email: "webmail@bronxbp.nyc.gov", website: "https://bronxboropres.nyc.gov", instagram: "bronxbp", twitter: "bronxbp", helps: "Borough-wide services, community board appointments, funding for local organizations, and advocacy on Bronx-wide issues." },
  { name: "Darcel D. Clark", title: "Bronx District Attorney", party: "D", phone: "718-590-2000", email: "bxdauvisa@bronxda.nyc.gov", website: "https://bronxda.nyc.gov", instagram: "bronxdaclark", twitter: "bronxdaclark", helps: "Crime victims assistance, witness support, youth diversion programs, and reporting community safety concerns." },
  { name: "Zohran Mamdani", title: "Mayor of New York City", party: "D, WF", phone: "311", website: "https://www.nyc.gov/mayor", instagram: "NYCMayor", twitter: "NYCMayor", helps: "City-wide policy concerns including public safety, housing, education, and sanitation." },
  { name: "Kathy Hochul", title: "Governor of New York State", party: "D", phone: "518-474-8390", website: "https://www.governor.ny.gov", helps: "State-wide issues including MTA, state funding, legislation, and executive orders affecting the Bronx." },
  { name: "Jumaane Williams", title: "NYC Public Advocate", phone: "212-669-7200", email: "reception@advocate.nyc.gov", website: "https://pubadvocate.nyc.gov", helps: "City agency complaints, tenant issues, police misconduct, and access to city services." },
  { name: "Mark Levine", title: "NYC Comptroller", party: "D", phone: "212-669-3916", email: "action@comptroller.nyc.gov", website: "https://comptroller.nyc.gov", twitter: "nyccomptroller", helps: "Audits of city agencies, retirement benefits, fraud reporting, and complaints about city contracts." },
];

// City Council districts (new spec)
export const COUNCIL: Record<string, Official & { district: number; zips: string[] }> = {
  CD8: { district: 8, zips: ["10451","10452","10453","10454","10455","10456","10457","10458","10459","10460"], name: "Diana Ayala", title: "NYC City Council, District 8", party: "D", phone: "212-788-7354", email: "dayala@council.nyc.gov", website: "https://council.nyc.gov/district-8", helps: "Housing, public safety, sanitation, youth programs, and city services in the South Bronx." },
  CD11: { district: 11, zips: ["10461","10462","10464","10465","10466","10467","10469","10470","10475"], name: "Eric Dinowitz", title: "NYC City Council, District 11", party: "D", phone: "212-788-7385", email: "edinowitz@council.nyc.gov", website: "https://council.nyc.gov/district-11", helps: "Senior services, education funding, and public safety in the East Bronx." },
  CD13: { district: 13, zips: ["10463","10471"], name: "Kristy Marmorato", title: "NYC City Council, District 13", party: "R", phone: "212-788-7365", email: "kmarmorato@council.nyc.gov", website: "https://council.nyc.gov/district-13", helps: "Quality of life, sanitation, public safety, and small business support." },
  CD14: { district: 14, zips: ["10452","10453","10457","10458"], name: "Pierina Sanchez", title: "NYC City Council, District 14", party: "D", phone: "212-788-7364", email: "psanchez@council.nyc.gov", website: "https://council.nyc.gov/district-14", helps: "Housing rights, tenant organizing, and preventing displacement." },
  CD15: { district: 15, zips: ["10456","10459","10460"], name: "Oswald Feliz", title: "NYC City Council, District 15", party: "D", phone: "212-788-7363", email: "ofeliz@council.nyc.gov", website: "https://council.nyc.gov/district-15", helps: "Housing preservation, small business support, and parks funding." },
  CD16: { district: 16, zips: ["10457","10458","10467","10468"], name: "Amanda Farías", title: "NYC City Council, District 16", party: "D", phone: "212-788-7362", email: "afarias@council.nyc.gov", website: "https://council.nyc.gov/district-16", helps: "Economic development, parks, cultural affairs, and small business support." },
};

export const ASSEMBLY: Record<string, Official & { district: number; zips: string[] }> = {
  AD71: { district: 71, zips: ["10451","10452","10453","10454","10455","10456"], name: "Al Taylor", title: "NY State Assembly, District 71", party: "D", phone: "518-455-5162", email: "taylora@nyassembly.gov", website: "https://assembly.state.ny.us/mem/Al-Taylor", helps: "State laws, education funding, housing laws, and state budget priorities." },
  AD72: { district: 72, zips: ["10457","10458","10460"], name: "Manny De Los Santos", title: "NY State Assembly, District 72", party: "D", phone: "518-455-5401", email: "delossantosm@nyassembly.gov", website: "https://assembly.state.ny.us/mem/Manny-De-Los-Santos", helps: "Tenant rights, immigrant services, and state-level constituent help." },
  AD73: { district: 73, zips: ["10459","10460"], name: "Eddie Gibbs", title: "NY State Assembly, District 73", party: "D", phone: "518-455-5637", email: "gibbee@nyassembly.gov", website: "https://assembly.state.ny.us/mem/Eddie-Gibbs", helps: "Public safety, housing, and state services in East Harlem and the South Bronx." },
  AD75: { district: 75, zips: ["10461","10462","10464","10465"], name: "George Alvarez", title: "NY State Assembly, District 75", party: "D", phone: "518-455-5709", email: "alvarezg@nyassembly.gov", website: "https://assembly.state.ny.us/mem/George-Alvarez", helps: "State legislation, MTA issues, and constituent services in the East Bronx." },
  AD77: { district: 77, zips: ["10463","10471"], name: "Landon Dais", title: "NY State Assembly, District 77", party: "D", phone: "518-455-5805", email: "daisl@nyassembly.gov", website: "https://assembly.state.ny.us/mem/Landon-Dais", helps: "Education funding, housing, and state-level services." },
  AD78: { district: 78, zips: ["10466","10467","10469","10470","10475"], name: "Chantel Jackson", title: "NY State Assembly, District 78", party: "D", phone: "518-455-5255", email: "jacksonc@nyassembly.gov", website: "https://assembly.state.ny.us/mem/Chantel-Jackson", helps: "Health policy, housing, and constituent services in the North Bronx." },
};

export const SENATE: Record<string, Official & { district: number; zips: string[] }> = {
  SD31: { district: 31, zips: ["10451","10452","10453","10454","10455","10456","10457","10458","10459","10460"], name: "Robert Jackson", title: "NY State Senate, District 31", party: "D", phone: "518-455-5435", email: "jackson@nysenate.gov", website: "https://nysenate.gov/senators/robert-jackson", helps: "State law, education funding, and budget priorities." },
  SD32: { district: 32, zips: ["10461","10462","10463","10464","10465","10466","10467","10469","10471","10475"], name: "Luis Sepúlveda", title: "NY State Senate, District 32", party: "D", phone: "518-455-3285", email: "sepulveda@nysenate.gov", website: "https://nysenate.gov/senators/luis-sepulveda", helps: "Criminal justice reform, housing, and state services." },
  SD33: { district: 33, zips: ["10452","10453","10457","10458","10467","10468"], name: "Gustavo Rivera", title: "NY State Senate, District 33", party: "D", phone: "518-455-3395", email: "rivera@nysenate.gov", website: "https://nysenate.gov/senators/gustavo-rivera", helps: "Healthcare access, tenant protections, and state budget." },
};

export const HOUSE: Record<string, Official & { district: number; zips: string[] }> = {
  H14: { district: 14, zips: ["10451","10452","10453","10454","10455","10456","10457","10458","10459","10460"], name: "Alexandria Ocasio-Cortez", title: "U.S. House, NY-14", party: "D", phone: "718-662-5970", website: "https://ocasio-cortez.house.gov", helps: "Federal issues, immigration, healthcare, and constituent casework." },
  H15: { district: 15, zips: ["10461","10462","10463","10464","10465","10466","10467","10469","10471","10475"], name: "Ritchie Torres", title: "U.S. House, NY-15", party: "D", phone: "718-319-8370", website: "https://torres.house.gov", helps: "Federal housing policy, anti-poverty programs, and constituent casework." },
};

export const COMMUNITY_BOARDS: Record<string, CommunityBoard> = {
  CB1: { id: "CB1", address: "142 East 160th St, Bronx, NY 10451", schedule: "4th Monday of each month", time: "6:00 PM", publicSession: "Yes", phone: "718-585-7117", email: "cb1@bronxcb1.nyc.gov", website: "https://bronxcb1.nyc.gov" },
  CB2: { id: "CB2", address: "1716 Southern Blvd, Bronx, NY 10460", schedule: "4th Wednesday of each month", time: "6:00 PM", publicSession: "Yes", phone: "718-542-0233", email: "cb2@bronxcb2.nyc.gov", website: "https://bronxcb2.nyc.gov" },
  CB3: { id: "CB3", address: "1425 Boston Rd, Bronx, NY 10456", schedule: "3rd Tuesday of each month", time: "6:00 PM", publicSession: "Yes", phone: "718-589-6250", email: "cb3@bronxcb3.nyc.gov", website: "https://bronxcb3.nyc.gov" },
  CB4: { id: "CB4", address: "1650 Selwyn Ave, Bronx, NY 10457", schedule: "4th Tuesday (except Jul/Aug)", time: "6:00 PM", publicSession: "Yes — register in advance", phone: "718-299-0800", email: "cb4@bronxcb4.nyc.gov", website: "https://bronxcb4.nyc.gov" },
  CB5: { id: "CB5", address: "780 E 233rd St, Bronx, NY 10466", schedule: "4th Wednesday (Sep–Jun)", time: "TBD", publicSession: "Yes", phone: "718-519-3070", email: "cb5@bronxcb5.nyc.gov", website: "https://bronxcb5.nyc.gov" },
  CB6: { id: "CB6", address: "West Farms Library, 2085 Honeywell Ave, Bronx, NY 10460", schedule: "Wed, May 27, 2026", time: "6:30 PM", publicSession: "Yes", phone: "718-579-6990", email: "cb6@bronxcb6.nyc.gov", website: "https://bronxcb6.nyc.gov" },
  CB7: { id: "CB7", address: "229A E 204th St, Bronx, NY 10458", schedule: "4th Tuesday of each month", time: "6:30 PM", publicSession: "Yes", phone: "718-933-5650", email: "cb7@bronxcb7.nyc.gov", website: "https://bronxcb7.nyc.gov" },
  CB8: { id: "CB8", address: "5676 Riverdale Ave, Bronx, NY 10471", schedule: "Next meeting TBD (check website)", time: "TBD", publicSession: "Yes", phone: "718-884-3959", email: "cb8@bronxcb8.nyc.gov", website: "https://bronxcb8.nyc.gov" },
  CB9: { id: "CB9", address: "1967 Turnbull Ave, Bronx, NY 10473", schedule: "3rd Tuesday of each month", time: "6:00 PM", publicSession: "Yes", phone: "718-823-3034", email: "cb9@bronxcb9.nyc.gov", website: "https://bronxcb9.nyc.gov" },
  CB10: { id: "CB10", address: "3165 E Tremont Ave, Bronx, NY 10461", schedule: "3rd Wednesday of each month", time: "7:00 PM", publicSession: "Yes", phone: "718-892-1161", email: "cb10@bronxcb10.nyc.gov", website: "https://bronxcb10.nyc.gov" },
  CB11: { id: "CB11", address: "1608 Bronxdale Ave, Bronx, NY 10462", schedule: "4th Thursday of each month", time: "6:00 PM", publicSession: "Yes", phone: "718-892-6270", email: "cb11@bronxcb11.nyc.gov", website: "https://bronxcb11.nyc.gov" },
  CB12: { id: "CB12", address: "3940 Hillman Ave, Bronx, NY 10463", schedule: "4th Tuesday of each month", time: "7:00 PM", publicSession: "Yes", phone: "718-549-5300", email: "cb12@bronxcb12.nyc.gov", website: "https://bronxcb12.nyc.gov" },
};

export const PRECINCTS: Record<string, Precinct> = {
  P41: { name: "41st Precinct", address: "1035 Longwood Ave, Bronx, NY 10459", phone: "718-542-7964", serves: "Longwood, Hunts Point", nextMeeting: "Call for date" },
  P43: { name: "43rd Precinct", address: "900 Fteley Ave, Bronx, NY 10473", phone: "718-542-5625", serves: "Soundview, Castle Hill", nextMeeting: "Call for date" },
  P44: { name: "44th Precinct", address: "2 E 169th St, Bronx, NY 10452", phone: "718-590-5611", serves: "Highbridge, Concourse", nextMeeting: "Call for date" },
  P46: { name: "46th Precinct", address: "2120 Ryer Ave, Bronx, NY 10457", phone: "718-933-6602", serves: "Fordham, University Heights", nextMeeting: "Call for date" },
  P48: { name: "48th Precinct", address: "450 Cross Bronx Expressway, Bronx, NY 10457", phone: "718-299-7800", serves: "Belmont, Bathgate, Tremont", nextMeeting: "Call for date" },
  P49: { name: "49th Precinct", address: "2121 Glebe Ave, Bronx, NY 10462", phone: "718-918-2000", serves: "Pelham Bay, Morris Park, Co-op City", nextMeeting: "Call for date" },
  P50: { name: "50th Precinct", address: "3450 Kingsbridge Ave, Bronx, NY 10463", phone: "718-543-5700", serves: "Riverdale, Kingsbridge, Spuyten Duyvil", nextMeeting: "Call for date" },
  P52: { name: "52nd Precinct", address: "2875 Briggs Ave, Bronx, NY 10458", phone: "718-220-5211", serves: "Norwood, Bedford Park, Kingsbridge Heights", nextMeeting: "Call for date" },
};

// ZIP -> { primary CB, partial CBs, precinct ids }
export const ZIP_MAP: Record<string, { cb: string[]; cbPartial?: string[]; precincts: string[] }> = {
  "10451": { cb: ["CB1"], precincts: ["P44"] },
  "10452": { cb: ["CB1"], precincts: ["P44"] },
  "10453": { cb: ["CB1"], precincts: ["P44"] },
  "10454": { cb: ["CB1"], precincts: ["P44"] },
  "10455": { cb: ["CB1"], precincts: ["P44"] },
  "10456": { cb: ["CB3"], cbPartial: ["CB1"], precincts: ["P44"] },
  "10457": { cb: ["CB4"], cbPartial: ["CB6"], precincts: ["P46","P48"] },
  "10458": { cb: ["CB7"], precincts: ["P52"] },
  "10459": { cb: ["CB2"], cbPartial: ["CB3"], precincts: ["P41"] },
  "10460": { cb: ["CB2","CB3","CB6"], precincts: ["P46"] },
  "10461": { cb: ["CB10"], precincts: ["P49"] },
  "10462": { cb: ["CB10"], precincts: ["P49"] },
  "10463": { cb: ["CB8"], precincts: ["P50"] },
  "10464": { cb: ["CB10"], precincts: ["P49"] },
  "10465": { cb: ["CB10"], precincts: ["P49"] },
  "10466": { cb: ["CB11"], cbPartial: ["CB12"], precincts: ["P49"] },
  "10467": { cb: ["CB7"], cbPartial: ["CB11"], precincts: ["P52"] },
  "10468": { cb: ["CB7"], precincts: ["P52"] },
  "10469": { cb: ["CB11"], cbPartial: ["CB12"], precincts: ["P49"] },
  "10470": { cb: ["CB11"], cbPartial: ["CB12"], precincts: ["P49"] },
  "10471": { cb: ["CB8"], precincts: ["P50"] },
  "10472": { cb: ["CB9"], precincts: ["P43"] },
  "10473": { cb: ["CB9"], precincts: ["P43"] },
  "10474": { cb: ["CB2"], precincts: ["P41"] },
  "10475": { cb: ["CB11"], cbPartial: ["CB12"], precincts: ["P49"] },
};

export function officialsForZip(zip: string) {
  return {
    council: Object.values(COUNCIL).filter((o) => o.zips.includes(zip)),
    assembly: Object.values(ASSEMBLY).filter((o) => o.zips.includes(zip)),
    senate: Object.values(SENATE).filter((o) => o.zips.includes(zip)),
    house: Object.values(HOUSE).filter((o) => o.zips.includes(zip)),
  };
}

export const REPORT_ISSUES = [
  { icon: "🛠️", label: "Pothole, streetlight, sanitation", to: "311", phone: "311", url: "https://portal.311.nyc.gov" },
  { icon: "🏠", label: "Housing violation", to: "HPD (via 311)", phone: "311", url: "https://www.nyc.gov/hpd" },
  { icon: "🔊", label: "Noise complaint", to: "311 or local precinct", phone: "311", url: "https://portal.311.nyc.gov" },
  { icon: "🚨", label: "Safety concern (non-emergency)", to: "Local precinct", phone: "311", url: "https://www.nyc.gov/nypd" },
  { icon: "🚓", label: "Police misconduct", to: "Civilian Complaint Review Board", phone: "800-341-2272", url: "https://www.nyc.gov/ccrb" },
  { icon: "⚖️", label: "Crime victim assistance", to: "Bronx DA's Office", phone: "718-590-2000", url: "https://bronxda.nyc.gov" },
];

export const VOTER_LINKS = [
  { icon: "🗳️", label: "Register to Vote", url: "https://voterreg.dmv.ny.gov/motor-voter/" },
  { icon: "📝", label: "Check Registration Status", url: "https://voterlookup.elections.ny.gov/" },
  { icon: "📍", label: "Find Your Polling Place", url: "https://findmypollsite.vote.nyc/" },
  { icon: "📅", label: "Upcoming Elections", url: "https://www.elections.ny.gov/votingelectiondates.html" },
];

// .ics helpers live in ./ics (shared with event listings and resource detail
// pages); re-exported here so existing civic imports keep working.
export { buildIcs, downloadIcs } from "./ics";
