// Bu uygulama aslen Claude Artifacts ortamındaki window.storage API'sini kullanıyordu.
// Bağımsız bir PWA olarak çalışabilmesi için burada aynı API'yi (get/set/delete/list),
// tarayıcının kendi localStorage'ı üzerine kurulu olarak yeniden oluşturuyoruz.
// Böylece uygulama kodunda hiçbir değişikliğe gerek kalmadan veriler cihazda saklanır.
(function () {
  const ONEK = "market-listem::";

  function anahtar(k) {
    return ONEK + k;
  }

  window.storage = {
    async get(k) {
      try {
        const ham = localStorage.getItem(anahtar(k));
        if (ham === null) return null;
        return { key: k, value: ham, shared: false };
      } catch (e) {
        return null;
      }
    },
    async set(k, deger) {
      try {
        localStorage.setItem(anahtar(k), deger);
        return { key: k, value: deger, shared: false };
      } catch (e) {
        return null;
      }
    },
    async delete(k) {
      try {
        const vardi = localStorage.getItem(anahtar(k)) !== null;
        localStorage.removeItem(anahtar(k));
        return { key: k, deleted: vardi, shared: false };
      } catch (e) {
        return null;
      }
    },
    async list(prefix) {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const tam = localStorage.key(i);
          if (tam && tam.startsWith(ONEK)) {
            const kisa = tam.slice(ONEK.length);
            if (!prefix || kisa.startsWith(prefix)) keys.push(kisa);
          }
        }
        return { keys, prefix, shared: false };
      } catch (e) {
        return null;
      }
    },
  };
})();
