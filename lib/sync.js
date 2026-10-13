const SOURCE_URL = process.env.SOURCE_URL || "https://test.ooobs.ru/api/orders";

// Приводит телефон к +7XXXXXXXXXX. Возвращает null, если номер невалидный.
function normalizePhone(raw) {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  let digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) digits = "7" + digits; // номер без кода страны
  if (digits.length !== 11) return null;
  if (digits[0] === "8") digits = "7" + digits.slice(1);
  if (digits[0] !== "7") return null;
  return "+" + digits;
}

function toAmount(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toTime(v) {
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : -Infinity;
}

// Чистая функция: одни и те же заявки -> один и тот же результат.
function syncOrders(orders) {
  const list = Array.isArray(orders) ? orders : [];
  const byPhone = new Map();
  let invalid = 0;
  let valid = 0;

  for (const order of list) {
    const phone = normalizePhone(order && order.phone);
    if (!phone) {
      invalid++;
      continue;
    }
    valid++;
    const candidate = { order, phone, amount: toAmount(order.amount), time: toTime(order.created_at) };
    const current = byPhone.get(phone);
    if (
      !current ||
      candidate.amount > current.amount ||
      (candidate.amount === current.amount && candidate.time > current.time)
    ) {
      byPhone.set(phone, candidate);
    }
  }

  const clients = [...byPhone.values()]
    .sort((a, b) => (a.phone < b.phone ? -1 : a.phone > b.phone ? 1 : 0))
    .map(({ order, phone, amount }) => ({
      name: typeof order.name === "string" ? order.name : "",
      phone,
      email: typeof order.email === "string" ? order.email : "",
      amount,
    }));

  return {
    clients,
    stats: {
      received: list.length,
      unique: clients.length,
      duplicates_merged: valid - clients.length,
      invalid_dropped: invalid,
    },
  };
}

async function fetchOrders() {
  const res = await fetch(SOURCE_URL, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Источник ответил ${res.status}`);
  return res.json();
}

async function runSync() {
  return syncOrders(await fetchOrders());
}

module.exports = { normalizePhone, syncOrders, runSync };
