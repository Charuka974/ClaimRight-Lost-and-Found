const API_BASE_FOUNDITEM = 'http://localhost:8080/claimright/found-item';
const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item';
const API_BASE_CHAT = "http://localhost:8080/claimright/messages";
const API_BASE_CLAIMS = 'http://localhost:8080/claimright/claims';

const API_LANDING_LOSTITEMS = 'http://localhost:8080/claimright-landing-page/lost';
const API_LANDING_FOUNDITEMS = 'http://localhost:8080/claimright-landing-page/found';
const API_LANDING_CATEGORIES = 'http://localhost:8080/claimright-landing-page/category';

let allItemsData = [];

document.addEventListener("DOMContentLoaded", async() => {
  // ================== Fade-in animations ==================
  const fadeEls = document.querySelectorAll(".fade-in");
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  }, { threshold: 0.2 });
  fadeEls.forEach(el => fadeObserver.observe(el));

  // ================== SweetAlert welcome popup ==================
  if (!sessionStorage.getItem("aboutVisited")) {
    Swal.fire({
      title: "Welcome to ClaimRight!",
      text: "Discover how we help reunite people with their belongings.",
      icon: "info",
      confirmButtonText: "Got it",
      confirmButtonColor: "#4e73df"
    });
    sessionStorage.setItem("aboutVisited", "true");
  }

  // ================== Stats section ==================
  if (!allItemsData.length) {
      allItemsData = await loadAllItemsLanding();
  }


  const stats = computeAnalyticsFromItems(allItemsData);
  setStatValues(stats);
  animateCounters();
  drawCharts(stats);

  // ----- Analytics functions -----
  function computeAnalyticsFromItems(items) {
    // Claimed items
    const claimedItems = items.filter(i => i.isClaimed);
    const itemsReunited = claimedItems.length;

    // Unique users
    const userSet = new Set();
    items.forEach(i => {
      if (i.type === "found" && i.finderName) userSet.add(i.finderName);
      if (i.type === "lost" && i.ownerName) userSet.add(i.ownerName);
    });
    const happyUsers = userSet.size;

    // Unique cities
    const citySet = new Set();
    items.forEach(i => {
      if (i.type === "found" && i.locationFound) citySet.add(i.locationFound);
      if (i.type === "lost" && i.locationLost) citySet.add(i.locationLost);
    });
    const citiesServed = citySet.size;

    // Success rate
    const successRate = items.length ? Math.round((itemsReunited / items.length) * 100) : 0;

    // Growth per year
    const growthMap = {};
    items.forEach(i => {
      const dateStr = i.date || (i.type === "found" ? i.dateFound : i.dateLost);
      if (!dateStr) return;
      const year = new Date(dateStr).getFullYear();
      growthMap[year] = (growthMap[year] || 0) + 1;
    });

    const growthYears = Object.keys(growthMap).sort();
    const growthValues = growthYears.map(y => growthMap[y]);

    return {
      itemsReunited,
      happyUsers,
      citiesServed,
      successRate,
      unresolved: 100 - successRate,
      growth: { labels: growthYears, values: growthValues }
    };
  }

  // ----- Update DOM stat elements , animate them -----
  function setStatValues(stats) {
    const statEls = Array.from(document.querySelectorAll(".stat-number"));
    const keys = ["itemsReunited", "happyUsers", "citiesServed", "successRate"];
    statEls.forEach((el, idx) => {
      const key = keys[idx];
      const val = stats[key] ?? 0;
      el.setAttribute("data-count", val);
      el.textContent = key === "successRate" ? "0%" : "0";
    });
  }

  function animateCounters() {
    const counters = document.querySelectorAll(".stat-number");
    const speed = 200;
    counters.forEach(counter => {
      const target = Number(counter.getAttribute("data-count") || 0);
      const isPercent = counter.textContent.includes("%");
      const update = () => {
        const current = Number(String(counter.innerText).replace(/[^0-9.-]/g, "")) || 0;
        const increment = Math.ceil(Math.max(1, (target - current) / (speed / 10)));
        if (current < target) {
          counter.innerText = isPercent ? `${Math.min(current+increment,target)}%` : `${Math.min(current+increment,target)}`;
          setTimeout(update, 20);
        } else {
          counter.innerText = isPercent ? `${target}%` : target;
        }
      };
      update();
    });
  }

  function drawCharts(stats) {
    const barCtx = document.getElementById("barChart");
    const pieCtx = document.getElementById("pieChart");
    const lineCtx = document.getElementById("lineChart");

    const barData = [stats.itemsReunited, stats.happyUsers, stats.citiesServed, stats.successRate];
    const pieData = [stats.successRate, stats.unresolved];
    const growthLabels = stats.growth.labels;
    const growthValues = stats.growth.values;

    // Bar Chart
    if (barCtx) new Chart(barCtx.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Items Reunited","Happy Users","Cities Served","Success Rate"],
        datasets: [{
          data: barData,
          backgroundColor: ["#4e73df","#1cc88a","#36b9cc","#f6c23e"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // allows chart to fill container
        plugins: { legend: { display: false } }
      }
    });

    // Pie Chart
    if (pieCtx) new Chart(pieCtx.getContext("2d"), {
      type: "pie",
      data: { labels: ["Success (%)","Unresolved (%)"], datasets: [{ data: pieData, backgroundColor: ["#1cc88a","#e74a3b"] }] },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Line Chart
    if (lineCtx) new Chart(lineCtx.getContext("2d"), {
      type: "line",
      data: { labels: growthLabels, datasets: [{ label: "Items Growth", data: growthValues, borderColor: "#4e73df", fill: false, tension: 0.3 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });

  }

  async function loadAllItemsLanding() {
  try {
    const [foundRes, lostRes] = await Promise.all([
      fetch(API_LANDING_FOUNDITEMS),
      fetch(API_LANDING_LOSTITEMS)
    ]);

    if (!foundRes.ok || !lostRes.ok) throw new Error("Failed to load items");

    const [foundItems, lostItems] = await Promise.all([foundRes.json(), lostRes.json()]);

    const items = [
      ...foundItems.map(item => ({ ...item, type: "found", date: item.dateFound })),
      ...lostItems.map(item => ({ ...item, type: "lost", date: item.dateLost }))
    ];

    // Sort newest to oldest
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    return items; // return the data instead of setting global
  } catch (error) {
    console.error("Error loading items for landing page:", error);
    return [];
  }
}

  
});
