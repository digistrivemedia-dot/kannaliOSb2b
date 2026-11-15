/**
 * Test data for the app, created only through the API (CLAUDE.md §13). Run it after each
 * `npm run dev:memory` start in spareXBackend:
 *
 *   npm run dev-data                         garage jobs, bookings, orders and quotations
 *   npm run dev-data -- --backend-log <file> also signs in the owner, reading the 2-step code from the
 *                                            backend's log (or asks for it when run in a terminal)
 *   npm run dev-booking                      one new booking at HSR Layout, for the new-booking alert
 *
 * Sri Sai Two Wheeler Works has a manager only at HSR Layout and billing only at Whitefield, so the
 * steps billing does (bill, payment) and every Whitefield job need the owner, Mahesh, who has 2-step
 * sign-in on (BACKEND-NEEDS BN-03).
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { createInterface } from "node:readline/promises";

const BASE = process.env.DEV_API ?? "http://localhost:4000";
const PASSWORD = "Demo@1234";
const STAFF = {
  owner: "mahesh@srisaiworks.example.com",
  manager: "ravi@srisaiworks.example.com",
  billing: "shilpa@srisaiworks.example.com",
  technician: "imran@srisaiworks.example.com",
  hsrTechnician: "venkatesh@srisaiworks.example.com",
  admin: "kiran@kannaligarage.in",
  /** A dealer with credit on, for the money screens. */
  dealer: "ganesh@vinayakamotors.in",
};
const HSR = "br-hsr";
const WHITEFIELD = "br-whitefield";
/** A 1 × 1 PNG: the API stores photos sent inline, and this is the smallest one it accepts. */
const PHOTO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

type Json = Record<string, unknown>;
type Surface = "b2b" | "b2c" | "admin";

const args = process.argv.slice(2);
const say = (line: string) => process.stdout.write(`${line}\n`);

class ApiFailure extends Error {}

async function api<T = Json>(
  surface: Surface,
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const response = await fetch(`${BASE}/v1/${surface}${path}`, {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : (undefined as T);
  if (!response.ok) {
    throw new ApiFailure(
      `${options.method ?? "POST"} /${surface}${path} → ${response.status} ${text}`,
    );
  }
  return data;
}

// ---------------------------------------------------------------- sign-in

async function signIn(email: string): Promise<string> {
  const result = await api<Json>("b2b", "/auth/sign-in", {
    body: { email, password: PASSWORD },
  }).catch(async (error: unknown) => {
    // A 2-step code was sent moments ago (an earlier run): wait as long as the backend asks, once.
    const wait = error instanceof Error ? /Wait (\d+) seconds/.exec(error.message)?.[1] : undefined;
    if (!wait) throw error;
    say(`Waiting ${wait} s for the next 2-step code…`);
    await new Promise((resolve) => setTimeout(resolve, (Number(wait) + 1) * 1000));
    return api<Json>("b2b", "/auth/sign-in", { body: { email, password: PASSWORD } });
  });
  if (result.status === "signed_in") return String(result.sessionToken);
  const code = await twoStepCode(email);
  if (!code) throw new ApiFailure(`${email} needs a 2-step code`);
  const verified = await api<Json>("b2b", "/auth/two-factor/verify", {
    body: { challengeId: result.challengeId, code },
  });
  return String(verified.sessionToken);
}

/** The owner's 2-step code: from the backend's log when given, or typed in at the terminal. */
async function twoStepCode(email: string): Promise<string | null> {
  const logIndex = args.indexOf("--backend-log");
  const logFile = logIndex >= 0 ? args[logIndex + 1] : undefined;
  if (logFile && existsSync(logFile)) {
    const startSize = statSync(logFile).size;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      // Bytes, not characters: the log has multi-byte text such as "₹".
      const added = readFileSync(logFile)
        .subarray(Math.max(0, startSize - 4000))
        .toString("utf8");
      const codes = [...added.matchAll(/(\d{6}) is your SpareX Business sign-in code/g)];
      const code = codes.at(-1)?.[1];
      if (code) return code;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  if (!process.stdin.isTTY) return null;
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const code = await prompt.question(
    `2-step code for ${email} (it prints in the backend terminal; Enter to skip): `,
  );
  prompt.close();
  return code.trim() || null;
}

async function adminToken(): Promise<string> {
  const result = await api<Json>("admin", "/auth/sign-in", {
    body: { email: STAFF.admin, password: PASSWORD },
  });
  return String(result.token);
}

// ---------------------------------------------------------------- people and vehicles

const FIRST = [
  "Arjun",
  "Lakshmi",
  "Naveen",
  "Priya",
  "Suresh",
  "Kavya",
  "Manjunath",
  "Divya",
  "Rahul",
  "Asha",
  "Kiran",
  "Sneha",
  "Prakash",
  "Meena",
];
const LAST = [
  "Rao",
  "Narayan",
  "Gowda",
  "Shetty",
  "Reddy",
  "Hegde",
  "Kumar",
  "Iyer",
  "Nair",
  "Bhat",
];
const VEHICLES: { type: "bike" | "scooter"; make: string; model: string }[] = [
  { type: "scooter", make: "Honda", model: "Activa 6G" },
  { type: "scooter", make: "TVS", model: "Jupiter" },
  { type: "bike", make: "Bajaj", model: "Pulsar 150" },
  { type: "bike", make: "Royal Enfield", model: "Classic 350" },
  { type: "bike", make: "Hero", model: "Splendor Plus" },
  { type: "bike", make: "Yamaha", model: "FZ-S" },
  { type: "scooter", make: "Suzuki", model: "Access 125" },
  { type: "bike", make: "TVS", model: "Apache RTR 160" },
  { type: "bike", make: "Honda", model: "Shine" },
  { type: "bike", make: "KTM", model: "Duke 200" },
  { type: "scooter", make: "Honda", model: "Dio" },
  { type: "bike", make: "Bajaj", model: "Platina" },
];

let counter = 0;
const pick = <T>(list: T[]) => list[counter++ % list.length] as T;
const digits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
const letters = (length: number) =>
  Array.from({ length }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");
const plate = () =>
  `KA ${String(1 + Math.floor(Math.random() * 60)).padStart(2, "0")} ${letters(2)} ${digits(4)}`;
const person = () => `${pick(FIRST)} ${LAST[Math.floor(Math.random() * LAST.length)]}`;
const mobile = () => `9${digits(9)}`;

// ---------------------------------------------------------------- garage jobs

const COMPLAINTS = [
  "Brakes squeak when stopping",
  "Engine takes long to start in the morning",
  "Pick-up is weak above 50 km/h",
  "Headlight flickers",
  "Chain is noisy",
  "General service due",
];

const INSPECTION = [
  { area: "Engine", name: "Engine oil level and colour", result: "replace" },
  { area: "Brakes", name: "Front brake", result: "attention", note: "Pads worn to 2 mm" },
  { area: "Brakes", name: "Rear brake", result: "ok" },
  { area: "Electricals", name: "Lights and indicators", result: "ok" },
  { area: "Electricals", name: "Battery and self start", result: "ok" },
  { area: "Tyres and wheels", name: "Front tyre tread and pressure", result: "ok" },
  {
    area: "Chain and transmission",
    name: "Chain slack and wear",
    result: "attention",
    note: "Needs adjusting",
  },
  { area: "Suspension and body", name: "Front forks", result: "ok" },
];

const LINES = [
  {
    id: "l1",
    kind: "service",
    description: "General service",
    quantity: 1,
    unitPriceInPaise: 75000,
    gstRatePercent: 18,
  },
  {
    id: "l2",
    kind: "part",
    description: "Engine oil 10W-30, 1 L",
    partNumber: "CAS10W301L",
    quantity: 1,
    unitPriceInPaise: 42000,
    gstRatePercent: 18,
  },
  {
    id: "l3",
    kind: "part",
    description: "Front brake pads",
    partNumber: "BRP-ACT6G-F",
    quantity: 1,
    unitPriceInPaise: 38000,
    gstRatePercent: 18,
  },
  {
    id: "l4",
    kind: "labour",
    description: "Chain clean and adjust",
    quantity: 1,
    unitPriceInPaise: 15000,
    gstRatePercent: 18,
  },
  {
    id: "l5",
    kind: "consumable",
    description: "Chain lube",
    quantity: 1,
    unitPriceInPaise: 9000,
    gstRatePercent: 18,
  },
];

/** Every status a walk-in can reach, in the order the steps happen. */
const STAGES = [
  "vehicle_received",
  "job_card_created",
  "inspection",
  "awaiting_approval",
  "approved",
  "assigned",
  "in_progress",
  "quality_check",
  "ready",
  "payment_pending",
  "paid",
  "completed",
] as const;
type Stage = (typeof STAGES)[number] | "closed" | "rework" | "extra_work";

type Desk = {
  branchId: string;
  manager: string;
  technician: string;
  technicianId: string;
  /** Bills and takes payment; null when nobody signed in can (no owner). */
  billing: string | null;
};

/** A walk-in moved to `target`; `vehicleId` brings in a vehicle already on file (a customer-app user's). */
async function walkIn(desk: Desk, target: Stage, vehicleId?: string): Promise<string> {
  const job = await api<Json>("b2b", "/garage/jobs", {
    token: desk.manager,
    body: {
      branchId: desk.branchId,
      ...(vehicleId
        ? { vehicleId }
        : {
            newVehicle: {
              plate: plate(),
              ...pick(VEHICLES),
              customer: { name: person(), phone: `+91${mobile()}` },
            },
          }),
      complaints: [pick(COMPLAINTS)],
    },
  });
  const id = String(job.id);
  const reach = (stage: (typeof STAGES)[number]) =>
    target === "closed"
      ? STAGES.indexOf(stage) <= STAGES.indexOf("awaiting_approval")
      : target === "extra_work"
        ? STAGES.indexOf(stage) <= STAGES.indexOf("in_progress")
        : target === "rework"
          ? STAGES.indexOf(stage) <= STAGES.indexOf("quality_check")
          : STAGES.indexOf(stage) <= STAGES.indexOf(target);
  const at = (path: string, token: string, body: unknown, method = "POST") =>
    api("b2b", `/garage/jobs/${id}${path}`, { token, body, method });

  if (reach("job_card_created")) {
    await at("/check-in", desk.manager, {
      odometerKm: 8000 + Math.floor(Math.random() * 30000),
      fuelLevel: pick(["quarter", "half", "three_quarters"]),
      damages: [{ id: "d1", area: "Left side panel", note: "Small scratch", photos: [PHOTO] }],
      complaints: [],
      photos: [PHOTO, PHOTO],
    });
  }
  if (reach("inspection")) {
    await at(
      "/inspection",
      desk.manager,
      {
        items: INSPECTION.map((item, index) => ({ id: `i${index + 1}`, photos: [], ...item })),
      },
      "PUT",
    );
  }
  if (reach("awaiting_approval")) await at("/estimate", desk.manager, { lines: LINES });
  if (target === "closed") {
    await at("/estimate/approval", desk.manager, {
      decisions: Object.fromEntries(LINES.map((line) => [line.id, "rejected"])),
      note: "By phone: will get it done later",
    });
    say(`  walk-in ${job.number}: closed (estimate rejected)`);
    return id;
  }
  if (reach("approved")) {
    await at("/estimate/approval", desk.manager, {
      decisions: Object.fromEntries(
        LINES.map((line) => [line.id, line.id === "l4" ? "rejected" : "approved"]),
      ),
      note: "By phone",
    });
  }
  if (reach("assigned"))
    await at("/technician", desk.manager, { technicianId: desk.technicianId }, "PUT");
  if (reach("in_progress")) {
    await at("/response", desk.technician, { accept: true });
    await at("/lines/l1", desk.technician, { isDone: true }, "PATCH");
    await at("/progress", desk.technician, {
      text: "Old oil drained, service started",
      photos: [PHOTO],
      isExtraWork: false,
    });
  }
  if (target === "extra_work") {
    await at("/progress", desk.technician, {
      text: "Rear tyre is worn out, needs replacing",
      photos: [PHOTO],
      isExtraWork: true,
    });
    await at("/estimate/revision", desk.manager, {
      lines: [
        {
          id: "x1",
          kind: "part",
          description: "Rear tyre 90/100-10",
          partNumber: "MRF-NYLO-90",
          quantity: 1,
          unitPriceInPaise: 165000,
          gstRatePercent: 28,
        },
      ],
    });
    say(`  walk-in ${job.number}: extra work found, waiting for the customer again`);
    return id;
  }
  if (reach("quality_check")) {
    for (const line of ["l2", "l3", "l5"])
      await at(`/lines/${line}`, desk.technician, { isDone: true }, "PATCH");
    await at("/finish", desk.technician, {});
  }
  if (target === "rework") {
    await at("/quality-check", desk.manager, {
      result: "rework",
      items: [
        { label: "Road test done", isOk: true },
        { label: "Brakes bite evenly", isOk: false },
      ],
      note: "Front brake still soft, bleed it again",
    });
    say(`  walk-in ${job.number}: sent back after QC (in progress)`);
    return id;
  }
  if (reach("ready")) {
    await at("/quality-check", desk.manager, {
      result: "pass",
      items: [
        "Road test done",
        "No oil or fuel leaks",
        "Brakes bite evenly",
        "Vehicle washed and cleaned",
      ].map((label) => ({ label, isOk: true })),
    });
  }
  if (reach("payment_pending")) {
    if (!desk.billing) {
      say(`  walk-in ${job.number}: ready (billing needs the owner, skipped)`);
      return id;
    }
    await at("/invoice", desk.billing, {});
  }
  if (reach("paid") && desk.billing)
    await at("/payment", desk.billing, { method: "online", reference: `UPI${digits(10)}` });
  if (reach("completed") && desk.billing) {
    await at("/handover", desk.manager, {
      odometerKm: 40000,
      checklist: [
        { label: "Old parts handed over", isDone: true },
        { label: "Bill explained", isDone: true },
      ],
      nextService: { odometerKm: 43000 },
      photos: [PHOTO],
    });
  }
  say(`  walk-in ${job.number}: ${target.replace(/_/g, " ")}`);
  return id;
}

// ---------------------------------------------------------------- bookings (customer app)

type Customer = {
  token: string;
  vehicleId: string;
  addressId: string;
  name: string;
  plate: string;
};

async function customer(): Promise<Customer> {
  const phone = mobile();
  const name = person();
  const otp = await api<Json>("b2c", "/auth/otp", { body: { mobile: phone } });
  const verified = await api<Json>("b2c", "/auth/otp/verify", {
    body: { mobile: phone, otp: otp.demoCode, name },
  });
  const token = String(verified.token);
  const registrationNumber = plate();
  const catalog = await api<{
    models: { id: string; name: string; type: string; variants: { id: string }[] }[];
  }>("b2c", "/vehicles/catalog");
  const model = catalog.models.find((entry) => entry.name === "Activa 6G") ?? catalog.models[0];
  if (!model) throw new ApiFailure("No vehicle models in the catalogue");
  const vehicle = await api<Json>("b2c", "/me/vehicles", {
    token,
    body: {
      type: model.type,
      modelId: model.id,
      variantId: model.variants[0]?.id,
      year: 2022,
      registrationNumber,
      odometerKm: 9000 + Math.floor(Math.random() * 20000),
    },
  });
  const address = await api<Json>("b2c", "/me/addresses", {
    token,
    body: {
      label: "Home",
      name,
      mobile: phone,
      pin: "560102",
      line1: `${10 + Math.floor(Math.random() * 400)}, 27th Main, Sector 1`,
      area: "HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      isDefault: true,
    },
  });
  return {
    token,
    vehicleId: String(vehicle.id),
    addressId: String(address.id),
    name,
    plate: registrationNumber,
  };
}

const todayInIndia = (days = 0) =>
  new Date(Date.now() + 5.5 * 3_600_000 + days * 86_400_000).toISOString().slice(0, 10);

async function book(options: { days: number; slot: string; pickup: boolean; branchId?: string }) {
  const person = await customer();
  const packages = await api<{ id: string }[]>(
    "b2c",
    `/service-packages?modelId=${encodeURIComponent("vm_honda-activa-6g")}`,
  );
  // A day that is full, closed or a holiday is refused: the booking moves to the next day.
  for (let days = options.days; days < options.days + 7; days++) {
    try {
      const request = await api<Json>("b2c", "/me/service-requests", {
        token: person.token,
        body: {
          vehicleId: person.vehicleId,
          packageId: packages[0]?.id ?? null,
          garage: { mode: "chosen", garageId: options.branchId ?? HSR },
          date: todayInIndia(days),
          slotId: options.slot,
          notes: "Please check the brakes too",
          pickupDrop: options.pickup
            ? { pickupAddressId: person.addressId, dropAddressId: person.addressId }
            : null,
        },
      });
      return { request, customer: person.name, date: todayInIndia(days) };
    } catch (error) {
      if (!(error instanceof ApiFailure && error.message.includes("NO_GARAGE_AVAILABLE")))
        throw error;
    }
  }
  throw new ApiFailure("HSR Layout can't take a booking in the next 7 days");
}

/** The booking this garage was just offered: the newest new one. */
async function newestNewBooking(manager: string): Promise<Json> {
  const page = await api<{ items: Json[] }>(
    "b2b",
    `/garage/bookings?status=new&branchId=${HSR}&sort=respondBy&order=desc&pageSize=1`,
    { token: manager },
  );
  const booking = page.items[0];
  if (!booking) throw new ApiFailure("The new booking didn't reach HSR Layout");
  return booking;
}

async function bookings(manager: string, driverId: string) {
  // Accepted with pick-up and drop, and a driver on the way.
  await book({ days: 0, slot: "15:00-18:00", pickup: true });
  const withPickup = await newestNewBooking(manager);
  const job = await api<Json>("b2b", `/garage/bookings/${withPickup.id}/accept`, {
    token: manager,
    body: {},
  });
  await api("b2b", `/garage/jobs/${job.id}/trips/pickup`, {
    token: manager,
    method: "PUT",
    body: { driverId },
  });
  say(`  booking ${withPickup.number}: accepted, pick-up driver on the way`);

  await book({ days: 0, slot: "12:00-15:00", pickup: false });
  const today = await newestNewBooking(manager);
  await api("b2b", `/garage/bookings/${today.id}/accept`, { token: manager, body: {} });
  say(`  booking ${today.number}: accepted for today`);

  await book({ days: 1, slot: "09:00-12:00", pickup: false });
  const tomorrow = await newestNewBooking(manager);
  await api("b2b", `/garage/bookings/${tomorrow.id}/accept`, { token: manager, body: {} });
  say(`  booking ${tomorrow.number}: accepted for tomorrow`);

  await book({ days: 2, slot: "09:00-12:00", pickup: false });
  const declined = await newestNewBooking(manager);
  await api("b2b", `/garage/bookings/${declined.id}/decline`, {
    token: manager,
    body: { reason: "Fully booked that day" },
  });
  say(`  booking ${declined.number}: declined`);
}

async function oneNewBooking() {
  const { customer: name, date } = await book({
    days: 0,
    slot: "15:00-18:00",
    pickup: Math.random() > 0.5,
  });
  say(`New booking from ${name} for ${date} sent to HSR Layout. It waits 2 minutes for an answer.`);
}

const REVIEWS = [
  { rating: 5, comment: "Quick service and they explained every line of the bill." },
  { rating: 4, comment: "Good work. Took a little longer than promised." },
  { rating: 5, comment: "" },
  { rating: 3, comment: "Brakes are fine now, but the bike came back dusty." },
];

/** Customer-app users bring their vehicles in, the jobs are completed, and they rate the visit. */
async function reviews(desk: Desk) {
  for (const review of REVIEWS) {
    const person = await customer();
    const known = await api<{ vehicle: { id: string } } | null>(
      "b2b",
      `/garage/vehicles/lookup?plate=${encodeURIComponent(person.plate)}`,
      { token: desk.manager },
    );
    if (!known) throw new ApiFailure(`Plate ${person.plate} isn't on file`);
    const jobId = await walkIn(desk, "completed", known.vehicle.id);
    await api("b2c", `/me/service-jobs/${jobId}/review`, { token: person.token, body: review });
    say(`  ${person.name} rated the visit ${review.rating} of 5`);
  }
}

// ---------------------------------------------------------------- buying

async function buying(buyer: string) {
  const products = await api<{
    items: { id: string; stockByBranch: { branchId: string; quantity: number }[] }[];
  }>("b2b", "/catalog/products?pageSize=50", { token: buyer });
  const inStock = products.items.filter((product) =>
    product.stockByBranch.some((stock) => stock.branchId === HSR && stock.quantity >= 25),
  );
  const [a, b, c] = inStock;
  if (!a || !b || !c) throw new ApiFailure("The catalogue has fewer than three products");
  const order = (items: { productId: string; quantity: number }[], poNumber: string) =>
    api<Json>("b2b", "/orders", {
      token: buyer,
      body: {
        branchId: HSR,
        poNumber,
        payment: { method: "bank_transfer", transferReference: `NEFT${digits(8)}` },
        items,
      },
    });
  const waiting = await order([{ productId: a.id, quantity: 2 }], `PO-${digits(4)}`);
  say(`  order ${waiting.number}: bank transfer waiting for Kannali`);
  const delivered = await order(
    [
      { productId: b.id, quantity: 4 },
      { productId: c.id, quantity: 1 },
    ],
    `PO-${digits(4)}`,
  );

  const quoted = await api<Json>("b2b", "/quotations", {
    token: buyer,
    body: {
      branchId: HSR,
      notes: "Monthly stock for the workshop",
      items: [
        { productId: a.id, quantity: 10 },
        { productId: c.id, quantity: 6 },
      ],
    },
  });
  const requested = await api<Json>("b2b", "/quotations", {
    token: buyer,
    body: {
      branchId: HSR,
      notes: "Need these by Friday",
      items: [{ productId: b.id, quantity: 20 }],
    },
  });
  say(`  quotation ${requested.number}: requested`);

  // Kannali's side, through the admin API: confirm the payment, deliver, and price a quotation.
  const admin = await adminToken();
  await api("admin", `/orders/${delivered.id}/payment`, {
    token: admin,
    body: { reference: `UTR${digits(10)}`, date: todayInIndia() },
  });
  for (const status of [
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
  ]) {
    await api("admin", `/orders/${delivered.id}/status`, {
      token: admin,
      body: {
        status,
        shipment:
          status === "shipped" ? { courier: "Delhivery", trackingNumber: digits(12) } : null,
      },
    }).catch(() => undefined);
  }
  say(`  order ${delivered.number}: paid and delivered (returns can be asked for)`);
  const detail = await api<{
    lines?: { id: string; productId: string; quantity: number }[];
    items?: { id: string; productId: string; quantity: number }[];
  }>("admin", `/quotations/${quoted.id}`, { token: admin });
  const lines = (detail.lines ?? detail.items ?? []).map((line) => ({
    id: line.id,
    productId: line.productId,
    quantity: line.quantity,
    discountPercent: 5,
  }));
  await api("admin", `/quotations/${quoted.id}/send`, {
    token: admin,
    body: { lines, extraDiscount: 0, validityDays: 7, note: "Prices held for a week" },
  });
  say(`  quotation ${quoted.number}: quoted, waiting for your answer`);
}

/** A dealer's order on credit, shipped so its GST invoice is raised and shows as a due to pay. */
async function creditDues() {
  const dealer = await signIn(STAFF.dealer);
  const branches = await api<{ id: string; isMain: boolean }[]>("b2b", "/company/branches", {
    token: dealer,
  });
  const branch = branches.find((candidate) => candidate.isMain) ?? branches[0];
  const products = await api<{ items: { id: string }[] }>("b2b", "/catalog/products?pageSize=5", {
    token: dealer,
  });
  const product = products.items[0];
  if (!branch || !product)
    throw new ApiFailure("The dealer has no branch or the catalogue is empty");
  const order = await api<Json>("b2b", "/orders", {
    token: dealer,
    body: {
      branchId: branch.id,
      payment: { method: "credit" },
      items: [{ productId: product.id, quantity: 2 }],
    },
  });
  const admin = await adminToken();
  for (const status of ["confirmed", "processing", "packed", "shipped"]) {
    await api("admin", `/orders/${order.id}/status`, {
      token: admin,
      body: {
        status,
        shipment:
          status === "shipped" ? { courier: "Delhivery", trackingNumber: digits(12) } : null,
      },
    });
  }
  say(`  order ${order.number}: on credit and shipped, its invoice is due`);
}

// ---------------------------------------------------------------- run

async function staffId(token: string): Promise<string> {
  const session = await api<{ user: { id: string } }>("b2b", "/auth/session", { token });
  return session.user.id;
}

async function step(name: string, run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    say(`  ${name} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  await api("b2b", "/settings/public").catch(() => {
    throw new ApiFailure(`The backend isn't running at ${BASE}. Start it with npm run dev:memory.`);
  });
  const manager = await signIn(STAFF.manager);
  if (args.includes("--booking")) return oneNewBooking();

  const hsrTechnician = await signIn(STAFF.hsrTechnician);
  const hsrTechnicianId = await staffId(hsrTechnician);
  const owner = await signIn(STAFF.owner).catch((error: unknown) => {
    say(`Owner sign-in: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  });
  say(
    owner
      ? "Signed in the owner too: billing steps and Whitefield jobs included."
      : "No owner sign-in: billing steps and Whitefield jobs skipped.",
  );

  say("Bookings at HSR Layout (from the customer app):");
  await step("bookings", () => bookings(manager, hsrTechnicianId));

  say("Walk-ins at HSR Layout:");
  const hsr: Desk = {
    branchId: HSR,
    manager,
    technician: hsrTechnician,
    technicianId: hsrTechnicianId,
    billing: owner,
  };
  const targets: Stage[] = [
    "vehicle_received",
    "job_card_created",
    "inspection",
    "awaiting_approval",
    "approved",
    "assigned",
    "in_progress",
    "extra_work",
    "rework",
    "quality_check",
    "ready",
    "payment_pending",
    "paid",
    "completed",
    "closed",
  ];
  for (const target of targets) await step(`walk-in (${target})`, () => walkIn(hsr, target));

  if (owner) {
    say("Walk-ins at Whitefield (owner as the desk, Imran as technician):");
    const technician = await signIn(STAFF.technician);
    const whitefield: Desk = {
      branchId: WHITEFIELD,
      manager: owner,
      technician,
      technicianId: await staffId(technician),
      billing: owner,
    };
    for (const target of [
      "assigned",
      "in_progress",
      "quality_check",
      "ready",
      "payment_pending",
    ] as Stage[]) {
      await step(`Whitefield walk-in (${target})`, () => walkIn(whitefield, target));
    }
  }

  if (owner) {
    say("Reviews from customer-app users (HSR Layout):");
    await step("reviews", () => reviews(hsr));
  }

  say("Buying (Venkatesh, spares):");
  await step("buying", () => buying(hsrTechnician));

  say("Credit (Ganesh, dealer):");
  await step("credit dues", creditDues);

  say("A new booking, unanswered (new for 2 minutes, then missed):");
  await step("new booking", oneNewBooking);
  say("Done.");
}

main().catch((error: unknown) => {
  say(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
