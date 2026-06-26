const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
}, { passive: true });

const reviews = [
  {
    quote: "Professional, fast, and affordable. Highly recommend 180 Junk Removal.",
    name: "- Verified customer"
  },
  {
    quote: "They showed up on time, handled the heavy lifting, and made the cleanout simple.",
    name: "- Residential customer"
  },
  {
    quote: "The dumpster rental was easy to schedule and the pickup was exactly when promised.",
    name: "- Contractor customer"
  }
];

let reviewIndex = 0;
const reviewCard = document.querySelector("[data-review-card]");
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

const renderReview = () => {
  if (!reviewCard) return;
  const review = reviews[reviewIndex];
  reviewCard.innerHTML = `
    <p class="stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
    <blockquote>${escapeHtml(review.quote)}</blockquote>
    <cite>${escapeHtml(review.name)}</cite>
  `;
};

document.querySelector("[data-review-prev]")?.addEventListener("click", () => {
  reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
  renderReview();
});

document.querySelector("[data-review-next]")?.addEventListener("click", () => {
  reviewIndex = (reviewIndex + 1) % reviews.length;
  renderReview();
});

setInterval(() => {
  reviewIndex = (reviewIndex + 1) % reviews.length;
  renderReview();
}, 6500);

const form = document.querySelector("[data-quote-form]");
const status = document.querySelector("[data-form-status]");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const service = String(data.get("service") || "").trim();
  const details = String(data.get("details") || "").trim();

  if (!name || !phone || !service) {
    if (status) status.textContent = "Please add your name, phone, and service type.";
    return;
  }

  const message = [
    "Quote request for 180 Junk Removal",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Service: ${service}`,
    `Details: ${details || "No details provided"}`
  ].join("\n");

  const smsUrl = `sms:+17066766170?&body=${encodeURIComponent(message)}`;
  if (status) {
    status.innerHTML = `Quote message ready. <a href="${smsUrl}">Text it to 180 Junk Removal</a> or call 706-676-6170.`;
  }
});
