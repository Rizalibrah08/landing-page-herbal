// Muncul saat digulir: hanya untuk bagian yang belum terlihat ketika halaman dibuka.
(() => {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || !("IntersectionObserver" in window)) return;

  const groups = [".band-head", ".service", ".step", ".faq details", ".contact > *"];
  const watcher = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        watcher.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" }
  );

  groups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      const order = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--order", Math.min(order, 4));
      el.classList.add("reveal");
      // Setelah selesai muncul, lepas kelasnya agar animasi sorot milik elemen berlaku lagi.
      const settle = (event) => {
        if (event.target !== el || !el.classList.contains("is-visible")) return;
        el.classList.remove("reveal", "is-visible");
        el.style.removeProperty("--order");
        el.removeEventListener("transitionend", settle);
      };
      el.addEventListener("transitionend", settle);
      watcher.observe(el);
    });
  });
})();

(() => {
  const form = document.querySelector("[data-brief]");
  if (!form) return;

  // "Pesan website ini": bawa jenis yang dipilih di contoh ke formulir.
  const carry = document.querySelector("[data-carry]");
  if (carry) {
    carry.addEventListener("click", () => {
      const picked = document.querySelector('input[name="demo-jenis"]:checked');
      if (!picked) return;
      const match = [...form.elements.jenis].find((radio) => radio.value === picked.value);
      if (match) match.checked = true;
    });
  }

  const fields = [form.elements.nama, form.elements.pesan];
  const status = form.querySelector("[data-status]");

  const setError = (field, message) => {
    const error = document.getElementById(`${field.id}-error`);
    error.textContent = message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  };

  const check = (field) => {
    const empty = field.value.trim() === "";
    setError(field, empty ? field.dataset.empty : "");
    return !empty;
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      if (field.hasAttribute("aria-invalid")) check(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";

    const invalid = fields.filter((field) => !check(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    const to = form.dataset.to;
    const jenis = form.elements.jenis.value;
    const nama = form.elements.nama.value.trim();
    const pesan = form.elements.pesan.value.trim();
    const subject = `Permintaan website: ${jenis}`;
    const body = `Halo Tech Zal,\n\nNama: ${nama}\nJenis website: ${jenis}\n\n${pesan}\n`;

    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = `Aplikasi email Anda sedang dibuka. Kalau tidak terbuka, kirim pesan Anda ke ${to}.`;
  });
})();
