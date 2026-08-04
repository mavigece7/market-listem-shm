// Basit Google Drive senkronu — sadece kullanıcının kendi "Uygulama Verisi"
// (appDataFolder) alanına, sadece bu uygulamanın görebileceği gizli bir dosya
// olarak yedek JSON'unu yazar/okur. Başka hiçbir Drive dosyasına erişmez.
// Kimlik doğrulama tamamen tarayıcıda (Google Identity Services) yapılır,
// hiçbir sunucuya veri gitmez.
(function () {
  const DOSYA_ADI = "market-listem-yedek.json";
  const KAPSAM = "https://www.googleapis.com/auth/drive.appdata";
  const CLIENT_ID_ANAHTARI = "market-listem::google-client-id";

  let tokenClient = null;
  let sonToken = null;

  function gisHazirMi() {
    return typeof window.google !== "undefined" && window.google.accounts && window.google.accounts.oauth2;
  }

  function baglan(clientId) {
    return new Promise((resolve, reject) => {
      if (!gisHazirMi()) {
        reject(new Error("Google giriş betiği yüklenemedi (internet bağlantını kontrol et)."));
        return;
      }
      try {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: KAPSAM,
          callback: (yanit) => {
            if (yanit && yanit.access_token) {
              sonToken = yanit.access_token;
              localStorage.setItem(CLIENT_ID_ANAHTARI, clientId);
              resolve(sonToken);
            } else {
              reject(new Error("Google girişi tamamlanamadı."));
            }
          },
          error_callback: (hata) => {
            reject(new Error((hata && hata.type) || "Google girişi iptal edildi."));
          },
        });
        tokenClient.requestAccessToken({ prompt: "consent" });
      } catch (e) {
        reject(e);
      }
    });
  }

  async function dosyaBul(token) {
    const url =
      "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=" +
      encodeURIComponent(`name='${DOSYA_ADI}'`) +
      "&fields=files(id,modifiedTime)";
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Drive'a erişilemedi (${r.status})`);
    const veri = await r.json();
    return veri.files && veri.files.length > 0 ? veri.files[0] : null;
  }

  async function yukle(token, jsonMetni) {
    const mevcut = await dosyaBul(token);
    if (mevcut) {
      const r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${mevcut.id}?uploadType=media`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: jsonMetni,
      });
      if (!r.ok) throw new Error(`Yükleme başarısız (${r.status})`);
      return await r.json();
    }
    const sinir = "market_listem_sinir";
    const govde =
      `--${sinir}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify({ name: DOSYA_ADI, parents: ["appDataFolder"] }) +
      `\r\n--${sinir}\r\nContent-Type: application/json\r\n\r\n` +
      jsonMetni +
      `\r\n--${sinir}--`;
    const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${sinir}` },
      body: govde,
    });
    if (!r.ok) throw new Error(`Yükleme başarısız (${r.status})`);
    return await r.json();
  }

  async function indir(token) {
    const mevcut = await dosyaBul(token);
    if (!mevcut) return null;
    const r = await fetch(`https://www.googleapis.com/drive/v3/files/${mevcut.id}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`İndirme başarısız (${r.status})`);
    return { metin: await r.text(), modifiedTime: mevcut.modifiedTime };
  }

  window.DriveSync = {
    kayitliClientId: () => localStorage.getItem(CLIENT_ID_ANAHTARI) || "",
    baglan,
    yukle,
    indir,
    tokenVarMi: () => !!sonToken,
  };
})();
