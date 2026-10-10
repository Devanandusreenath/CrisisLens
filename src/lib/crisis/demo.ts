import type { Investigation, InvestigationRequest } from "./types";

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

export const DEMO_PRESETS: { label: string; req: InvestigationRequest }[] = [
  {
    label: "Heavy rainfall / flooding",
    req: {
      location: "Aluva, Kerala",
      situation: "Heavy rain tonight, possible flooding near the river",
      destination: "Kakkanad, Kochi",
      needs: "Travelling with elderly parents",
    },
  },
  {
    label: "Major road disruption",
    req: { location: "Edappally, Kochi", situation: "Major traffic block on NH 66 after an accident", destination: "Fort Kochi" },
  },
  {
    label: "Local wildfire",
    req: { location: "Munnar, Kerala", situation: "Smoke and fire reported on nearby hills", needs: "Child with asthma" },
  },
  {
    label: "Severe storm",
    req: { location: "Thiruvananthapuram", situation: "Strong winds and thunderstorm warning", destination: "Airport" },
  },
  {
    label: "Public transport disruption",
    req: { location: "Kaloor, Kochi", situation: "Metro services suspended", destination: "Vyttila Hub" },
  },
];

export function buildDemoInvestigation(req: InvestigationRequest): Investigation {
  return {
    investigation_id: `demo-${Date.now().toString(36)}`,
    demo: true,
    request: req,
    location: { name: "Aluva", region: "Ernakulam district, Kerala" },
    situation: {
      crisis_type: "Heavy rainfall · Riverine flooding risk",
      summary:
        "Sustained heavy rain over the Periyar catchment. Low-lying stretches near the river and some underpasses are reported waterlogged. Dam release updates are pending confirmation.",
      status: "Developing",
    },
    risk: {
      level: "high",
      score: 72,
      drivers: ["Rainfall alert for district", "Waterlogging on low-lying roads", "Night-time travel", "Vulnerable travellers"],
    },
    primary_action: {
      headline: "Avoid the riverside road. Use the elevated NH 544 corridor and leave within the hour.",
      reason:
        "Multiple sources report waterlogging near the riverbank roads, while the highway corridor has no reported disruption in the last 90 minutes. Rain is expected to intensify overnight.",
    },
    action_plan: [
      { priority: "now", title: "Charge phones and carry medication", detail: "Pack your parents' medicines, IDs and a power bank before leaving.", why: "Power and network disruptions are commonly reported during heavy rain events.", evidence_ids: ["e4"] },
      { priority: "now", title: "Leave via NH 544, not the riverside road", detail: "Take the highway towards Kalamassery, then Seaport–Airport Road to Kakkanad.", why: "Two news reports and one local post describe waterlogging on riverside stretches; none mention the highway.", evidence_ids: ["e2", "e3", "e5"] },
      { priority: "next", title: "Note the nearest hospital on your route", detail: "Identify a hospital along the highway in case anyone feels unwell.", why: "Elderly travellers; reduces decision time in an emergency.", evidence_ids: ["e6"] },
      { priority: "avoid", title: "Do not drive through standing water", detail: "Even shallow moving water can stall a car or sweep it off the road.", why: "Standard safety guidance from disaster management authorities.", evidence_ids: ["e1"] },
      { priority: "avoid", title: "Don't rely on unverified dam-release messages", detail: "Wait for the official district or dam authority update.", why: "Social posts conflict with the absence of an official notice.", evidence_ids: ["e7", "e8"] },
    ],
    routes: [
      { name: "Route A", via: "NH 544 → Kalamassery → Seaport–Airport Rd", risk: "low", reason: "Elevated corridor, no disruption reported recently", evidence_count: 3, last_checked: ago(6), recommended: true },
      { name: "Route B", via: "Aluva–Perumbavoor Rd → Kakkanad", risk: "moderate", reason: "Slow traffic reported; one waterlogged junction", evidence_count: 2, last_checked: ago(14), recommended: false },
      { name: "Route C", via: "Riverside road → Eloor", risk: "high", reason: "Multiple reports of waterlogging near the riverbank", evidence_count: 4, last_checked: ago(9), recommended: false },
    ],
    nearby_services: [
      { name: "District Hospital, Aluva", type: "hospital", distance_km: 1.4, source: "Google Maps", maps_url: "https://www.google.com/maps/search/District+Hospital+Aluva", x: 38, y: 42 },
      { name: "Private multi-speciality hospital", type: "hospital", distance_km: 3.1, source: "Google Maps", maps_url: "https://www.google.com/maps/search/hospital+near+Aluva", x: 58, y: 58 },
      { name: "Relief camp (school building)", type: "shelter", distance_km: 2.2, availability: "Reported open by local news — confirm before going", source: "News report", maps_url: "https://www.google.com/maps/search/relief+camp+Aluva", x: 28, y: 64 },
      { name: "Aluva Police Station", type: "police", distance_km: 0.9, source: "Google Maps", maps_url: "https://www.google.com/maps/search/Aluva+Police+Station", x: 46, y: 34 },
      { name: "Fire & Rescue Station", type: "fire", distance_km: 1.8, source: "Google Maps", maps_url: "https://www.google.com/maps/search/Fire+Station+Aluva", x: 52, y: 28 },
      { name: "24h pharmacy", type: "pharmacy", distance_km: 0.6, source: "Google Maps", maps_url: "https://www.google.com/maps/search/24+hour+pharmacy+Aluva", x: 42, y: 48 },
    ],
    evidence: [
      { id: "e1", source: "State Disaster Management Authority", source_type: "official", timestamp: ago(45), claim: "Rainfall alert issued for Ernakulam district; residents advised to avoid low-lying areas.", confidence: 0.94, verified: true, link: "https://sdma.kerala.gov.in" },
      { id: "e2", source: "Regional news outlet", source_type: "news", timestamp: ago(22), claim: "Waterlogging reported on stretches of the riverside road near Aluva.", confidence: 0.82, verified: true },
      { id: "e3", source: "National news outlet", source_type: "news", timestamp: ago(31), claim: "Traffic slowed near riverbank roads in Aluva after hours of rain.", confidence: 0.78, verified: true },
      { id: "e4", source: "Electricity board advisory", source_type: "official", timestamp: ago(60), claim: "Temporary power interruptions possible in rain-affected sections.", confidence: 0.7, verified: true },
      { id: "e5", source: "Local community page", source_type: "local", timestamp: ago(12), claim: "NH 544 near Aluva moving normally; heavy rain but no flooding.", confidence: 0.6, verified: false },
      { id: "e6", source: "Google Maps", source_type: "search", timestamp: ago(5), claim: "Hospitals listed within 3 km of Aluva town centre.", confidence: 0.9, verified: true },
      { id: "e7", source: "Social media post", source_type: "other", timestamp: ago(18), claim: "Dam shutters to be opened tonight.", confidence: 0.35, verified: false },
      { id: "e8", source: "Web search", source_type: "search", timestamp: ago(40), claim: "No official dam release notice found in the last 24 hours.", confidence: 0.65, verified: false },
    ],
    conflicts: [
      {
        topic: "Dam release",
        claim_a: { source: "Social media post", text: "Dam shutters will be opened tonight.", timestamp: ago(18) },
        claim_b: { source: "Web search", text: "No official release notice in the last 24 hours.", timestamp: ago(40) },
        resolution: "Unverified. Treat as possible but wait for an official notice before acting on it.",
      },
    ],
    feed: [
      { timestamp: ago(5), source: "Google Maps", event: "6 emergency facilities indexed near Aluva", confidence: 0.9 },
      { timestamp: ago(12), source: "Local community page", event: "Highway reported moving normally", confidence: 0.6 },
      { timestamp: ago(18), source: "Social media", event: "Unconfirmed claim of dam release", confidence: 0.35 },
      { timestamp: ago(22), source: "Regional news", event: "Riverside road waterlogging", confidence: 0.82 },
      { timestamp: ago(45), source: "SDMA", event: "District rainfall alert issued", confidence: 0.94 },
    ],
    confidence: 0.78,
    last_verified: ago(2),
    sources: [
      { name: "State Disaster Management Authority", type: "official", url: "https://sdma.kerala.gov.in" },
      { name: "Electricity board advisory", type: "official" },
      { name: "Regional news outlet", type: "news" },
      { name: "National news outlet", type: "news" },
      { name: "Local community page", type: "local" },
      { name: "Google Maps", type: "search" },
      { name: "Web search", type: "search" },
      { name: "Social media post", type: "other" },
    ],
  };
}

export function demoFollowUp(question: string): { answer: string; evidence_ids: string[] } {
  const q = question.toLowerCase();
  if (q.includes("hospital"))
    return { answer: "The District Hospital in Aluva is about 1.4 km away and on the way to Route A. Availability is not confirmed — call ahead if possible.", evidence_ids: ["e6"] };
  if (q.includes("wait") || q.includes("later") || q.includes("tomorrow"))
    return { answer: "Rain is reported to be ongoing and the official alert is still active. If your current location is safe and elevated, waiting may be reasonable — but riverside routes are unlikely to improve tonight.", evidence_ids: ["e1", "e2"] };
  if (q.includes("dam"))
    return { answer: "There is no official dam release notice in the sources checked. A social media post claims otherwise, so this is marked as unverified.", evidence_ids: ["e7", "e8"] };
  return { answer: "Based on current evidence, Route A along NH 544 remains the lowest-risk option. Re-check before leaving; conditions can change quickly.", evidence_ids: ["e2", "e5"] };
}
