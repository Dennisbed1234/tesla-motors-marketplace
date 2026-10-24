/** Deterministic public reviews for Tesla Motors Marketplace (220 entries). */
export type Review = {
  id: string;
  name: string;
  gender: "m" | "f";
  role: string;
  city: string;
  region: string;
  country: string;
  rating: number;
  date: string;
  text: string;
  model: string;
  avatar: string;
};

const MALE = ["James","Michael","Robert","John","David","William","Richard","Joseph","Thomas","Charles","Daniel","Matthew","Anthony","Mark","Steven","Paul","Andrew","Joshua","Kevin","Brian","George","Timothy","Edward","Jason","Ryan","Jacob","Nicholas","Eric","Jonathan","Justin","Scott","Brandon","Benjamin","Samuel","Patrick","Alexander","Jack","Tyler","Aaron","Adam","Nathan","Henry","Kyle","Noah","Ethan","Christian","Sean","Austin","Dylan","Jordan","Gabriel","Logan","Juan","Vincent","Philip","Bradley","Raymond","Roger","Carl","Albert","Wayne","Ralph","Russell","Louis","Bobby","Johnny","Bruce","Alan","Eugene","Randy","Terry","Gerald","Harold","Jesse","Bryan","Billy","Walter","Keith","Douglas","Peter","Jeremy","Gary","Larry","Stephen","Jeffrey","Ronald","Frank","Gregory"];
const FEMALE = ["Mary","Patricia","Jennifer","Linda","Elizabeth","Barbara","Susan","Jessica","Sarah","Karen","Nancy","Lisa","Betty","Margaret","Sandra","Ashley","Kimberly","Emily","Donna","Michelle","Dorothy","Carol","Amanda","Melissa","Deborah","Stephanie","Rebecca","Sharon","Laura","Cynthia","Kathleen","Amy","Angela","Shirley","Anna","Brenda","Pamela","Emma","Nicole","Helen","Samantha","Katherine","Christine","Debra","Rachel","Catherine","Carolyn","Janet","Maria","Heather","Diane","Julie","Joyce","Victoria","Kelly","Christina","Joan","Evelyn","Judith","Olivia","Andrea","Lauren","Kathryn","Megan","Cheryl","Hannah","Jacqueline","Martha","Gloria","Teresa","Ann","Sara","Madison","Frances","Janice","Jean","Alice","Judy","Sophia","Grace","Denise","Amber","Marilyn","Danielle","Brittany","Diana","Abigail","Jane","Lori","Marie","Julia"];
const LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards","Collins","Reyes","Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey","Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson","Watson","Brooks","Chavez","Wood","James","Bennett","Gray","Mendoza","Ruiz","Hughes","Price","Alvarez","Castillo","Sanders","Patel","Myers","Long","Ross","Foster","Jimenez"];
const JOBS = ["Software Engineer","Teacher","Nurse","Accountant","Project Manager","Sales Director","Physician","Architect","Marketing Manager","Electrician","Real Estate Agent","Consultant","Product Designer","Attorney","Pharmacist","Dentist","Chef","Photographer","UX Designer","Data Analyst","Entrepreneur","HR Manager","Logistics Manager","Civil Engineer","Journalist","Financial Advisor","Pilot","Veterinarian"];
const MODELS = ["Model 3","Model Y","Model S","Model X","Cybertruck","Roadster Performance","Roadster Thrust","Roadster Rocket"];
const PLACES: [string, string, string][] = [
  ["New York","NY","United States"],["Los Angeles","CA","United States"],["Chicago","IL","United States"],["Houston","TX","United States"],["Phoenix","AZ","United States"],["Philadelphia","PA","United States"],["San Diego","CA","United States"],["Dallas","TX","United States"],["Austin","TX","United States"],["Denver","CO","United States"],["Seattle","WA","United States"],["Boston","MA","United States"],["Miami","FL","United States"],["Atlanta","GA","United States"],["Nashville","TN","United States"],["Portland","OR","United States"],["Charlotte","NC","United States"],["Detroit","MI","United States"],["Minneapolis","MN","United States"],["Tampa","FL","United States"],["Orlando","FL","United States"],["Las Vegas","NV","United States"],["New Orleans","LA","United States"],["Columbus","OH","United States"],["Raleigh","NC","United States"],
  ["Toronto","ON","Canada"],["Vancouver","BC","Canada"],["Calgary","AB","Canada"],["Ottawa","ON","Canada"],
  ["London","England","United Kingdom"],["Manchester","England","United Kingdom"],["Edinburgh","Scotland","United Kingdom"],
  ["Berlin","Germany","Germany"],["Munich","Germany","Germany"],["Amsterdam","Netherlands","Netherlands"],["Dublin","Ireland","Ireland"],["Paris","France","France"],["Madrid","Spain","Spain"],["Stockholm","Sweden","Sweden"],
  ["Sydney","Australia","Australia"],["Melbourne","Australia","Australia"],["Singapore","Singapore","Singapore"],["Dubai","UAE","United Arab Emirates"],["Tokyo","Japan","Japan"],["Auckland","New Zealand","New Zealand"],
];

const EN = [
  "Ordered my {model} through Tesla Motors Marketplace. The reservation held my slot and delivery tracking stayed clear from start to finish.",
  "Compared trims on the site first. Staff answered every question before the deposit. My {model} arrived on schedule.",
  "Used the 25 percent down payment option on a {model}. Wire instructions were exact and the order moved to paid after confirmation.",
  "Worldwide shipping sounded ambitious until tracking updated with my delivery address. {model} handover was smooth.",
  "Reserved a {model} during the Roadster release window.Slots moved fast. Glad I locked mine early.",
  "Payment choices mattered. Crypto and card both worked. Support confirmed receipt without chasing.",
  "Came from another broker with unclear inventory. Catalog status labels here matched what I received for my {model}.",
  "Account dashboard showed order status step by step. No guesswork after I ordered the {model}.",
  "Affiliate partner of Tesla Inc with independent checkout that was straightforward. Specs for the {model} matched the listing.",
  "Live chat replied within minutes about delivery to {city}. Completed the {model} order the same evening.",
  "Second EV purchase. Process here was cleaner than my first dealer experience. {model} paperwork was organized.",
  "Photos on the vehicle page matched the unit I received. That honesty is rare for online auto sales.",
  "Down payment at 25 percent helped cash flow. Balance settled before transit. {model} tracking stayed accurate.",
  "Almost skipped thinking it was catalog only. Support clarified availability and I secured a {model} the same week.",
  "Compare tool made the decision obvious for our commute. We went with {model} and have no regrets.",
  "Office contact details matched the emails I received. Felt legitimate before I paid for the {model}.",
  "Admin marked paid quickly after I reported the transfer. Tracking steps for the {model} appeared within a day.",
  "Roadster variants are listed with real pricing and production notes. Reserved {model} while inventory was open.",
  "Support walked me through state tax on the order total before checkout on the {model}.",
  "Used USDT for the deposit. Addresses and network notes were clear. No fee surprises on the {model} order.",
  "Interior and exterior colors on the listing were correct on arrival. Detail orientation on the {model} was excellent.",
  "I manage fleet decisions. Spec sheets and range notes saved a week of back and forth for the {model}.",
  "Family ordered a {model} after reading the shipping page. Updates never went quiet during transit.",
  "Clear refund policy and transparent deposit terms. Ordered {model} with confidence.",
  "From inquiry to delivery the communication stayed professional. {model} met every listed specification.",
];

const FR = [
  "Commande de {model} via Tesla Motors Marketplace. Suivi clair et livraison conforme a l'annonce.",
  "Depot de 25 pour cent accepte. L'equipe a confirme le paiement rapidement pour mon {model}.",
  "Service pro. Chat reactif avant la reservation du {model}. Je recommande.",
];
const ES = [
  "Reserve mi {model} en Tesla Motors Marketplace. El seguimiento del envio fue claro de principio a fin.",
  "Opcion de pago inicial del 25 por ciento. Proceso limpio para el {model}.",
  "Atencion rapida por chat. Compre el {model} con confianza.",
];
const DE = [
  "Bestellung des {model} uber Tesla Motors Marketplace. Tracking und Status waren nachvollziehbar.",
  "25 Prozent Anzahlung funktioniert reibungslos. {model} wie beschrieben geliefert.",
  "Freundlicher Support vor der Reservierung des {model}. Empfehlenswert.",
];

const SUFFIX = [
  "",
  " Would buy again.",
  " Clear communication throughout.",
  " Specs matched the listing.",
  " Support was patient with my questions.",
  " Tracking updates were timely.",
  " Deposit process was transparent.",
  " Highly recommend this marketplace.",
];

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function buildDate(i: number): string {
  if (i < 40) {
    const day = 20 - (i % 20);
    const month = i < 20 ? 10 : 9;
    return `2026-${pad(month)}-${pad(Math.max(1, day))}`;
  }
  if (i < 100) {
    const month = 8 - Math.floor((i - 40) / 10);
    const day = 1 + ((i * 3) % 27);
    return `2026-${pad(Math.max(1, month))}-${pad(day)}`;
  }
  if (i < 160) {
    const year = 2025 - Math.floor((i - 100) / 20);
    const month = 1 + ((i * 5) % 12);
    const day = 1 + ((i * 7) % 27);
    return `${year}-${pad(month)}-${pad(day)}`;
  }
  const year = 2024 - Math.floor((i - 160) / 15);
  const month = 1 + ((i * 3) % 12);
  const day = 1 + ((i * 11) % 27);
  return `${Math.max(2020, year)}-${pad(month)}-${pad(day)}`;
}

function buildReviews(): Review[] {
  const out: Review[] = [];
  const usedText = new Set<string>();
  for (let i = 0; i < 220; i++) {
    const gender: "m" | "f" = i % 2 === 0 ? "f" : "m";
    const first = gender === "f" ? FEMALE[i % FEMALE.length]! : MALE[i % MALE.length]!;
    const last = LAST[(i * 7) % LAST.length]!;
    const name = `${first} ${last}`;
    const [city, region, country] = PLACES[i % PLACES.length]!;
    const model = MODELS[i % MODELS.length]!;
    const role = JOBS[i % JOBS.length]!;
    const rating = i % 5 === 0 ? 4 : 5;
    let pool = EN;
    if (city === "Paris") pool = FR;
    else if (city === "Madrid") pool = ES;
    else if (city === "Berlin" || city === "Munich") pool = DE;
    let text = pool[i % pool.length]!
      .replace(/\{model\}/g, model)
      .replace(/\{city\}/g, city);
    if (pool === EN) text = `${text}${SUFFIX[i % SUFFIX.length]}`.trim();
    if (usedText.has(text)) text = `${text} (${city})`;
    usedText.add(text);
    const seed = `${i}-${name.replace(/\s/g, "").toLowerCase()}`;
    out.push({
      id: `r${i + 1}`,
      name,
      gender,
      role,
      city,
      region,
      country,
      rating,
      date: buildDate(i),
      text,
      model,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`,
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export const REVIEWS: Review[] = buildReviews();
export const REVIEW_COUNT = REVIEWS.length;
