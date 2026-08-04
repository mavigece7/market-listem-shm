const { useState, useMemo, useEffect, useRef } = React;
const { ShoppingBasket, Plus, Minus, Trash2, Carrot, Pencil, X, Check, User, ArrowDownAZ, ChevronUp, ChevronDown, Search, History, TrendingUp, TrendingDown, Save, ChevronRight, Camera, AlertTriangle, Layers } = LucideReact;
const MinusFlat = LucideReact.Minus;

const YONTEM_SECENEKLERI = [
  { yontem: "gunluk_toplam", ad: "Gün İçi Toplama Dayalı", aciklama: "Aynı gündeki alışverişler toplanır, o günün toplamı eşiği kaç kez geçtiyse o kadar kez ödül verir" },
  { yontem: "her_cekim", ad: "Her Çekime Dayalı", aciklama: "Her alışveriş kendi başına ayrı değerlendirilir, eşiği geçen her alışveriş ayrı ödül verir" },
  { yontem: "gunde_ilk", ad: "Günde Bir Kez (İlk Alışverişte)", aciklama: "Sadece günün ilk alışverişi eşiği geçiyorsa, günde tek seferlik sabit ödül verir" },
];

const VARSAYILAN_KURAL_TIPLERI = [
  { id: "gunluk_toplam", ad: "Gün İçinde Toplam", yontem: "gunluk_toplam" },
  { id: "her_cekim", ad: "Her Çekimde", yontem: "her_cekim" },
  { id: "gunde_ilk", ad: "Günde Bir (İlk Alışveriş)", yontem: "gunde_ilk" },
];

function MarketListem() {
  const [ad, setAd] = useState("");
  const [marketAdi, setMarketAdi] = useState("");
  const [birim, setBirim] = useState("gram");
  const [fiyat, setFiyat] = useState("");
  const [miktar, setMiktar] = useState("");
  const [girisModu, setGirisModu] = useState("toplam"); // "toplam" | "birimFiyati" (gram: kg fiyatı, adet: adet fiyatı)
  const [kgFiyati, setKgFiyati] = useState("");
  const [kacTane, setKacTane] = useState(1);
  const [urunler, setUrunler] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [yuklendi, setYuklendi] = useState(false);
  const [urunGecmisi, setUrunGecmisi] = useState([]);
  const [oneriGoster, setOneriGoster] = useState(false);
  const [arama, setArama] = useState("");
  const sonSenkronUrunler = useRef("[]");
  const sonSenkronUrunGecmisi = useRef("[]");
  const [tanilama, setTanilama] = useState("Başlatılıyor...");
  const [tanilamaAcik, setTanilamaAcik] = useState(false);
  const [yedekAcik, setYedekAcik] = useState(false);
  const [iceAktarMetni, setIceAktarMetni] = useState("");
  const [yedekMesaj, setYedekMesaj] = useState("");
  const [driveClientId, setDriveClientId] = useState(() =>
    typeof window !== "undefined" && window.DriveSync ? window.DriveSync.kayitliClientId() : ""
  );
  const [driveToken, setDriveToken] = useState(null);
  const [driveDurum, setDriveDurum] = useState("");
  const [driveIslemde, setDriveIslemde] = useState(false);
  const [baskaListesiAcik, setBaskaListesiAcik] = useState(false);
  const [gecmisAlisverisler, setGecmisAlisverisler] = useState([]);
  const sonSenkronGecmisAlisverisler = useRef("[]");
  const [mod, setMod] = useState("liste");
  const [kaydetPaneliAcik, setKaydetPaneliAcik] = useState(false);
  const [alisverisAdi, setAlisverisAdi] = useState("");
  const [aktifKategori, setAktifKategori] = useState("Market");
  const [acikAlisveris, setAcikAlisveris] = useState(null);
  const [acikKarsilastirma, setAcikKarsilastirma] = useState(null);
  const [arsivSiralamaTuru, setArsivSiralamaTuru] = useState("tarih"); // "tarih" | "az"
  const [icerikSiralamaAZ, setIcerikSiralamaAZ] = useState({});
  const ilkKaydetAtla1 = useRef(true);
  const ilkKaydetAtla2 = useRef(true);
  const ilkKaydetAtla3 = useRef(true);
  const ilkKaydetAtla4 = useRef(true);
  const ilkKaydetAtla5 = useRef(true);
  const [arsivIsimDuzenle, setArsivIsimDuzenle] = useState(null);
  const [arsivDraft, setArsivDraft] = useState(null);
  const [taramaAcik, setTaramaAcik] = useState(false);
  const [taramaHata, setTaramaHata] = useState("");
  const [taramaSonuclari, setTaramaSonuclari] = useState([]);
  const [kartKampanyalari, setKartKampanyalari] = useState([]);
  const sonSenkronKampanyalar = useRef("[]");
  const [kkBanka, setKkBanka] = useState("");
  const [kkKanal, setKkKanal] = useState("NFC");
  const [kkKategori, setKkKategori] = useState("Tümü");
  const [kkEsik, setKkEsik] = useState("");
  const [kkPuan, setKkPuan] = useState("");
  const [kkTavan, setKkTavan] = useState("");
  const [kkDuzenleId, setKkDuzenleId] = useState(null);
  const [kkHesapTutari, setKkHesapTutari] = useState("");
  const [kkKural, setKkKural] = useState("her_cekim"); // "gunluk_toplam" | "her_cekim" | "gunde_ilk"
  const [kuralTipleri, setKuralTipleri] = useState(VARSAYILAN_KURAL_TIPLERI);
  const sonSenkronKuralTipleri = useRef(JSON.stringify(VARSAYILAN_KURAL_TIPLERI));
  const [ktAcik, setKtAcik] = useState(false);
  const [ktAd, setKtAd] = useState("");
  const [ktYontem, setKtYontem] = useState("her_cekim");
  const [ktDuzenleId, setKtDuzenleId] = useState(null);

  // Kayıtlı listeyi aç (geçici bir hata olursa birkaç kez tekrar dener)
  useEffect(() => {
    const gecikme = (ms) => new Promise((r) => setTimeout(r, ms));
    const zaman = () => new Date().toLocaleTimeString("tr-TR");

    const oku = async (anahtar, deneme = 0) => {
      try {
        const sonuc = await window.storage.get(anahtar, false);
        return { ok: true, sonuc };
      } catch (e) {
        if (deneme < 2) {
          await gecikme(350);
          return oku(anahtar, deneme + 1);
        }
        return { ok: false, hata: (e && (e.message || String(e))) || "bilinmeyen hata" };
      }
    };

    (async () => {
      setTanilama(`[${zaman()}] window.storage var mı: ${typeof window !== "undefined" && !!window.storage}`);

      const r1 = await oku("market-urunler");
      let urunMesaj;
      if (!r1.ok) {
        urunMesaj = `okuma hatası: ${r1.hata}`;
      } else if (!r1.sonuc) {
        urunMesaj = "kayıt yok (null döndü)";
      } else if (!r1.sonuc.value) {
        urunMesaj = "kayıt var ama value boş";
      } else {
        try {
          const parsed = JSON.parse(r1.sonuc.value);
          setUrunler(parsed);
          sonSenkronUrunler.current = r1.sonuc.value;
          urunMesaj = `${parsed.length} ürün yüklendi`;
        } catch (e) {
          urunMesaj = `JSON parse hatası: ${e.message}`;
        }
      }

      const r2 = await oku("market-urun-gecmisi");
      if (r2.ok && r2.sonuc && r2.sonuc.value) {
        try {
          setUrunGecmisi(JSON.parse(r2.sonuc.value));
        } catch (e) {
          // önemli değil
        }
      }

      const r3 = await oku("market-gecmis-alisverisler");
      let gecmisMesaj;
      if (!r3.ok) {
        gecmisMesaj = `okuma hatası: ${r3.hata}`;
      } else if (!r3.sonuc || !r3.sonuc.value) {
        gecmisMesaj = "kayıt yok (bu artifact örneğinde henüz alışveriş kaydedilmemiş)";
      } else {
        try {
          const parsed = JSON.parse(r3.sonuc.value);
          setGecmisAlisverisler(parsed);
          gecmisMesaj = `${parsed.length} alışveriş yüklendi`;
        } catch (e) {
          gecmisMesaj = `JSON parse hatası: ${e.message}`;
        }
      }

      const r4 = await oku("market-kart-kampanyalari");
      if (r4.ok && r4.sonuc && r4.sonuc.value) {
        try {
          setKartKampanyalari(JSON.parse(r4.sonuc.value));
        } catch (e) {
          // önemli değil
        }
      }

      const r5 = await oku("market-kural-tipleri");
      if (r5.ok && r5.sonuc && r5.sonuc.value) {
        try {
          const yuklenen = JSON.parse(r5.sonuc.value);
          if (Array.isArray(yuklenen) && yuklenen.length > 0) setKuralTipleri(yuklenen);
        } catch (e) {
          // önemli değil
        }
      }

      setTanilama((prev) => `${prev}\n[${zaman()}] urunler: ${urunMesaj}\n[${zaman()}] geçmiş alışverişler: ${gecmisMesaj}`);
      setYuklendi(true);
    })();
  }, []);

  // Sunucu tarafında ara sıra geçici hata olabiliyor ("Internal server error").
  // Bu yüzden kaydetme işlemini birkaç kez tekrar deniyoruz, hemen pes etmiyoruz.
  const guvenliKaydet = async (anahtar, deger, deneme = 0) => {
    try {
      return await window.storage.set(anahtar, deger, false);
    } catch (e) {
      if (deneme < 3) {
        await new Promise((r) => setTimeout(r, 500 * (deneme + 1)));
        return guvenliKaydet(anahtar, deger, deneme + 1);
      }
      throw e;
    }
  };

  // Her değişiklikte otomatik kaydet
  // NOT: yüklemeden hemen sonra tetiklenen ilk çalıştırmayı bilerek atlıyoruz.
  // Aksi halde, açılışta okuma bir anlığına gecikir/başarısız olursa, henüz boş
  // olan state sunucudaki gerçek listenin üzerine yazılıp veri kaybına yol açabilir.
  useEffect(() => {
    if (!yuklendi) return;
    if (ilkKaydetAtla1.current) {
      ilkKaydetAtla1.current = false;
      return;
    }
    (async () => {
      const zaman = new Date().toLocaleTimeString("tr-TR");
      try {
        const sonuc = await guvenliKaydet("market-urunler", JSON.stringify(urunler));
        setTanilama((p) => `${p}\n[${zaman}] kaydedildi: ${urunler.length} ürün, sonuç: ${sonuc ? "başarılı" : "null döndü"}`);
      } catch (e) {
        setTanilama((p) => `${p}\n[${zaman}] KAYDETME HATASI (3 denemeden sonra): ${(e && (e.message || String(e))) || "bilinmeyen"}`);
      }
    })();
  }, [urunler, yuklendi]);

  useEffect(() => {
    if (!yuklendi) return;
    if (ilkKaydetAtla2.current) {
      ilkKaydetAtla2.current = false;
      return;
    }
    (async () => {
      try {
        await guvenliKaydet("market-urun-gecmisi", JSON.stringify(urunGecmisi));
      } catch (e) {
        // kayıt başarısız olursa sessizce geç
      }
    })();
  }, [urunGecmisi, yuklendi]);

  useEffect(() => {
    if (!yuklendi) return;
    if (ilkKaydetAtla3.current) {
      ilkKaydetAtla3.current = false;
      return;
    }
    (async () => {
      const zaman = new Date().toLocaleTimeString("tr-TR");
      try {
        const sonuc = await guvenliKaydet("market-gecmis-alisverisler", JSON.stringify(gecmisAlisverisler));
        setTanilama((p) => `${p}\n[${zaman}] geçmiş kaydedildi: ${gecmisAlisverisler.length} alışveriş, sonuç: ${sonuc ? "başarılı" : "null döndü"}`);
      } catch (e) {
        setTanilama((p) => `${p}\n[${zaman}] GEÇMİŞ KAYDETME HATASI (3 denemeden sonra): ${(e && (e.message || String(e))) || "bilinmeyen"}`);
      }
    })();
  }, [gecmisAlisverisler, yuklendi]);

  useEffect(() => {
    if (!yuklendi) return;
    if (ilkKaydetAtla4.current) {
      ilkKaydetAtla4.current = false;
      return;
    }
    (async () => {
      try {
        await guvenliKaydet("market-kart-kampanyalari", JSON.stringify(kartKampanyalari));
      } catch (e) {
        // kayıt başarısız olursa sessizce geç
      }
    })();
  }, [kartKampanyalari, yuklendi]);

  useEffect(() => {
    if (!yuklendi) return;
    if (ilkKaydetAtla5.current) {
      ilkKaydetAtla5.current = false;
      return;
    }
    (async () => {
      try {
        await guvenliKaydet("market-kural-tipleri", JSON.stringify(kuralTipleri));
      } catch (e) {
        // kayıt başarısız olursa sessizce geç
      }
    })();
  }, [kuralTipleri, yuklendi]);

  const miktarNum = parseFloat(miktar.replace(",", "."));
  const kgFiyatiNum = parseFloat((kgFiyati || "").replace(",", "."));
  const girilenFiyatNum = parseFloat(fiyat.replace(",", "."));
  const kgModuAktif = birim === "gram" && girisModu === "birimFiyati";
  const adetToplamModuAktif = birim === "adet" && girisModu === "toplam";
  const fiyatNum = kgModuAktif
    ? (kgFiyatiNum > 0 && miktarNum > 0 ? (kgFiyatiNum * miktarNum) / 1000 : NaN)
    : adetToplamModuAktif
    ? (girilenFiyatNum > 0 && kacTane > 0 ? girilenFiyatNum / kacTane : NaN)
    : girilenFiyatNum;
  const gecerli = fiyatNum > 0 && miktarNum > 0 && kacTane > 0;

  const birimFiyati = fiyatNum > 0 && miktarNum > 0
    ? birim === "gram"
      ? (fiyatNum / miktarNum) * 1000
      : fiyatNum / miktarNum
    : null;

  const satirToplami = gecerli ? fiyatNum * kacTane : null;

  const toplam = useMemo(
    () => urunler.reduce((acc, u) => acc + u.satirToplami, 0),
    [urunler]
  );
  const toplamAdet = useMemo(
    () => urunler.reduce((acc, u) => acc + u.kacTane, 0),
    [urunler]
  );
  const toplamBaskasi = useMemo(
    () => urunler.reduce((acc, u) => acc + u.fiyat * (u.baskasiAdet || 0), 0),
    [urunler]
  );
  const baskasiBirimSayisi = useMemo(
    () => urunler.reduce((acc, u) => acc + (u.baskasiAdet || 0), 0),
    [urunler]
  );

  const kkFormTemizle = () => {
    setKkBanka("");
    setKkKanal("NFC");
    setKkKategori("Tümü");
    setKkEsik("");
    setKkPuan("");
    setKkTavan("");
    setKkDuzenleId(null);
    setKkKural("her_cekim");
  };

  const kkKaydet = () => {
    const esikNum = parseFloat(kkEsik.replace(",", "."));
    const puanNum = parseFloat(kkPuan.replace(",", "."));
    const tavanNum = parseFloat((kkTavan || "").replace(",", ".")) || Infinity;
    if (!kkBanka.trim() || !(esikNum > 0) || !(puanNum > 0)) return;
    const kayit = { id: kkDuzenleId || Date.now(), banka: kkBanka.trim(), kanal: kkKanal, kategori: kkKategori || "Tümü", esik: esikNum, puan: puanNum, tavan: tavanNum === Infinity ? null : tavanNum, kural: kkKural };
    if (kkDuzenleId) {
      setKartKampanyalari((prev) => prev.map((k) => (k.id === kkDuzenleId ? kayit : k)));
    } else {
      setKartKampanyalari((prev) => [kayit, ...prev]);
    }
    kkFormTemizle();
  };

  const kkDuzenle = (k) => {
    setKkDuzenleId(k.id);
    setKkBanka(k.banka);
    setKkKanal(k.kanal);
    setKkKategori(k.kategori || "Tümü");
    setKkEsik(String(k.esik).replace(".", ","));
    setKkPuan(String(k.puan).replace(".", ","));
    setKkTavan(k.tavan ? String(k.tavan).replace(".", ",") : "");
    setKkKural(k.kural || "her_cekim");
  };

  const kkSil = (id) => {
    setKartKampanyalari((prev) => prev.filter((k) => k.id !== id));
    if (kkDuzenleId === id) kkFormTemizle();
  };

  const kuralTipiBul = (id) => kuralTipleri.find((kt) => kt.id === id) || { id, ad: "Bilinmeyen tip", yontem: "her_cekim" };

  const ktFormTemizle = () => {
    setKtAd("");
    setKtYontem("her_cekim");
    setKtDuzenleId(null);
  };

  const ktKaydet = () => {
    if (!ktAd.trim()) return;
    const kayit = { id: ktDuzenleId || `ozel_${Date.now()}`, ad: ktAd.trim(), yontem: ktYontem };
    if (ktDuzenleId) {
      setKuralTipleri((prev) => prev.map((kt) => (kt.id === ktDuzenleId ? kayit : kt)));
    } else {
      setKuralTipleri((prev) => [...prev, kayit]);
    }
    ktFormTemizle();
  };

  const ktDuzenle = (kt) => {
    setKtDuzenleId(kt.id);
    setKtAd(kt.ad);
    setKtYontem(kt.yontem);
  };

  const ktSil = (id) => {
    if (kuralTipleri.length <= 1) return;
    if (kartKampanyalari.some((k) => k.kural === id)) {
      if (!confirm("Bu koşul tipini kullanan kampanyalar var. Yine de silmek istiyor musun? (o kampanyalar 'Her Çekimde' yöntemine döner)")) return;
    }
    setKuralTipleri((prev) => prev.filter((kt) => kt.id !== id));
    if (ktDuzenleId === id) ktFormTemizle();
  };

  // Bu ayki gerçek alışverişler: kaydedilmiş geçmiş + (varsa) şu an açık olan liste "bugün" kabul edilir.
  const ayIslemleri = useMemo(() => {
    const simdi = new Date();
    const ayBasi = new Date(simdi.getFullYear(), simdi.getMonth(), 1);
    const islemler = [];
    gecmisAlisverisler.forEach((a) => {
      const t = new Date(a.tarih);
      if (t >= ayBasi) {
        islemler.push({ tarih: t, tutar: a.urunler.reduce((s, u) => s + u.satirToplami, 0), kategori: a.kategori || "Market" });
      }
    });
    if (urunler.length > 0) {
      islemler.push({ tarih: simdi, tutar: toplam, kategori: aktifKategori || "Market" });
    }
    return islemler.sort((a, b) => a.tarih - b.tarih);
  }, [gecmisAlisverisler, urunler, toplam, aktifKategori]);

  const hesaplaKampanyaPuani = (k, islemlerHam) => {
    const kKategori = k.kategori || "Tümü";
    const islemler = kKategori === "Tümü" ? islemlerHam : islemlerHam.filter((isl) => isl.kategori === kKategori);
    if (islemler.length === 0) return { kazanilan: 0, tavanaTakildi: false, detay: "bu ay bu kategoride alışveriş yok" };
    const yontem = kuralTipiBul(k.kural).yontem;
    let hamPuan = 0;
    if (yontem === "her_cekim") {
      islemler.forEach((isl) => {
        hamPuan += Math.floor(isl.tutar / k.esik) * k.puan;
      });
    } else {
      // günlere grupla
      const gunler = {};
      islemler.forEach((isl) => {
        const key = isl.tarih.toISOString().slice(0, 10);
        if (!gunler[key]) gunler[key] = [];
        gunler[key].push(isl);
      });
      if (yontem === "gunluk_toplam") {
        Object.values(gunler).forEach((gunIslemleri) => {
          const gunToplami = gunIslemleri.reduce((s, i) => s + i.tutar, 0);
          hamPuan += Math.floor(gunToplami / k.esik) * k.puan;
        });
      } else if (yontem === "gunde_ilk") {
        Object.values(gunler).forEach((gunIslemleri) => {
          const ilk = gunIslemleri.slice().sort((a, b) => a.tarih - b.tarih)[0];
          if (ilk.tutar >= k.esik) hamPuan += k.puan;
        });
      }
    }
    const kazanilan = k.tavan ? Math.min(hamPuan, k.tavan) : hamPuan;
    const tavanaTakildi = !!(k.tavan && hamPuan > k.tavan);
    return { kazanilan, tavanaTakildi };
  };

  const kkSonuclar = useMemo(() => {
    return kartKampanyalari
      .map((k) => ({ ...k, ...hesaplaKampanyaPuani(k, ayIslemleri) }))
      .sort((a, b) => b.kazanilan - a.kazanilan);
  }, [kartKampanyalari, ayIslemleri, kuralTipleri]);

  // Tek işlem simülatörü: "şu an X TL harcasam" hızlı deneme (mevcut kurallardan bağımsız, tek çekim varsayımıyla)
  const kkHesaplamaTutari = useMemo(() => {
    const manuel = parseFloat((kkHesapTutari || "").replace(",", "."));
    if (manuel > 0) return manuel;
    return toplam;
  }, [kkHesapTutari, toplam]);

  const kkSimulasyon = useMemo(() => {
    return kartKampanyalari
      .map((k) => {
        const yontem = kuralTipiBul(k.kural).yontem;
        let kazanilan;
        if (yontem === "gunde_ilk") {
          kazanilan = kkHesaplamaTutari >= k.esik ? k.puan : 0;
        } else {
          kazanilan = Math.floor(kkHesaplamaTutari / k.esik) * k.puan;
        }
        if (k.tavan) kazanilan = Math.min(kazanilan, k.tavan);
        return { ...k, kazanilan };
      })
      .sort((a, b) => b.kazanilan - a.kazanilan);
  }, [kartKampanyalari, kkHesaplamaTutari, kuralTipleri]);

  // Şu anki liste + tüm kaydedilmiş geçmiş alışverişlerdeki ürünleri tarayıp,
  // her ürün adı için en son (en güncel) fiyat/miktar/birim bilgisini tutar.
  const tumUrunKayitlari = useMemo(() => {
    const kayitlar = {};
    const listeler = [
      ...gecmisAlisverisler.map((a) => ({ tarih: a.tarih, urunler: a.urunler })),
      { tarih: new Date().toISOString(), urunler },
    ];
    listeler.forEach((liste) => {
      liste.urunler.forEach((u) => {
        if (!u.ad || u.ad === "Ürün") return;
        const key = u.ad.trim().toLocaleLowerCase("tr");
        const mevcut = kayitlar[key];
        if (!mevcut || new Date(liste.tarih) >= new Date(mevcut.tarih)) {
          kayitlar[key] = { ad: u.ad, birim: u.birim, fiyat: u.fiyat, miktar: u.miktar, birimFiyati: u.birimFiyati, marketAdi: u.marketAdi || "", tarih: liste.tarih };
        }
      });
    });
    return kayitlar;
  }, [urunler, gecmisAlisverisler]);

  const tumMarketAdlari = useMemo(() => {
    const set = new Set();
    urunler.forEach((u) => { if (u.marketAdi) set.add(u.marketAdi); });
    gecmisAlisverisler.forEach((a) => a.urunler.forEach((u) => { if (u.marketAdi) set.add(u.marketAdi); }));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [urunler, gecmisAlisverisler]);

  const tumKategoriler = useMemo(() => {
    const set = new Set(["Market", "Restoran", "Akaryakıt"]);
    gecmisAlisverisler.forEach((a) => { if (a.kategori) set.add(a.kategori); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [gecmisAlisverisler]);

  const oneriler = useMemo(() => {
    const q = ad.trim().toLocaleLowerCase("tr");
    if (!q) return [];
    const isimSeti = new Map();
    Object.values(tumUrunKayitlari).forEach((k) => isimSeti.set(k.ad.toLocaleLowerCase("tr"), k.ad));
    urunGecmisi.forEach((n) => { if (!isimSeti.has(n.toLocaleLowerCase("tr"))) isimSeti.set(n.toLocaleLowerCase("tr"), n); });
    return Array.from(isimSeti.values())
      .filter((n) => n.toLocaleLowerCase("tr").includes(q) && n.toLocaleLowerCase("tr") !== q)
      .slice(0, 6);
  }, [ad, tumUrunKayitlari, urunGecmisi]);

  const oneriSec = (isim) => {
    setAd(isim);
    const kayit = tumUrunKayitlari[isim.trim().toLocaleLowerCase("tr")];
    if (kayit) {
      setBirim(kayit.birim);
      setFiyat(String(kayit.fiyat).replace(".", ","));
      setMiktar(String(kayit.miktar).replace(".", ","));
      setGirisModu("toplam");
      setKgFiyati("");
    }
    setOneriGoster(false);
  };

  const gosterilecekUrunler = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr");
    if (!q) return urunler;
    return urunler.filter((u) => u.ad.toLocaleLowerCase("tr").includes(q));
  }, [urunler, arama]);

  const baskasiArttir = (id) =>
    setUrunler((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, baskasiAdet: ((u.baskasiAdet || 0) + 1) % (u.kacTane + 1) } : u
      )
    );

  const kimIcinGuncelle = (id, deger) =>
    setUrunler((prev) => prev.map((u) => (u.id === id ? { ...u, kimIcin: deger } : u)));

  const bugununAdi = () => new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  const alisverisiKaydet = () => {
    if (urunler.length === 0) return;
    const isim = alisverisAdi.trim() || bugununAdi();
    const yeni = { id: Date.now(), isim, tarih: new Date().toISOString(), urunler, kategori: aktifKategori || "Market" };
    setGecmisAlisverisler((prev) => [yeni, ...prev]);
    setUrunler([]);
    setAlisverisAdi("");
    setAktifKategori("Market");
    setKaydetPaneliAcik(false);
  };

  const alisverisiSil = (id) => setGecmisAlisverisler((prev) => prev.filter((a) => a.id !== id));

  const arsivIsimGuncelle = (arsivId, yeniIsim) => {
    const isim = yeniIsim.trim();
    if (!isim) return;
    setGecmisAlisverisler((prev) => prev.map((a) => (a.id === arsivId ? { ...a, isim } : a)));
  };

  const arsivKategoriGuncelle = (arsivId, yeniKategori) => {
    setGecmisAlisverisler((prev) => prev.map((a) => (a.id === arsivId ? { ...a, kategori: yeniKategori } : a)));
  };

  const arsivUrunSil = (arsivId, urunId) => {
    setGecmisAlisverisler((prev) =>
      prev.map((a) => (a.id === arsivId ? { ...a, urunler: a.urunler.filter((u) => u.id !== urunId) } : a))
    );
  };

  const arsivDuzenlemeyeBasla = (arsivId, u) => {
    setArsivDraft({
      arsivId,
      urunId: u.id,
      ad: u.ad === "Ürün" ? "" : u.ad,
      birim: u.birim,
      fiyat: String(u.fiyat).replace(".", ","),
      miktar: String(u.miktar).replace(".", ","),
      kacTane: u.kacTane,
      baskasiAdet: u.baskasiAdet || 0,
      kimIcin: u.kimIcin || "",
    });
  };

  const kayittanDuzenlemeyeGit = (kay) => {
    const trip = gecmisAlisverisler.find((a) => a.id === kay.arsivId);
    const urun = trip && trip.urunler.find((u) => u.id === kay.urunId);
    if (!trip || !urun) return;
    setAcikKarsilastirma(null);
    setAcikAlisveris(trip.id);
    arsivDuzenlemeyeBasla(trip.id, urun);
    setTimeout(() => {
      document.getElementById(`arsiv-kayit-${trip.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const arsivYeniUrunBaslat = (arsivId) => {
    setArsivDraft({
      arsivId,
      urunId: null,
      ad: "",
      birim: "gram",
      fiyat: "",
      miktar: "",
      kacTane: 1,
      baskasiAdet: 0,
      kimIcin: "",
    });
  };

  const arsivDraftIptal = () => setArsivDraft(null);

  const arsivDraftKaydet = () => {
    if (!arsivDraft) return;
    const fiyatNum = parseFloat(String(arsivDraft.fiyat).replace(",", "."));
    const miktarNum = parseFloat(String(arsivDraft.miktar).replace(",", "."));
    const kacTaneNum = Number(arsivDraft.kacTane) || 1;
    const baskasiAdetNum = Math.min(Number(arsivDraft.baskasiAdet) || 0, kacTaneNum);
    if (!(fiyatNum > 0) || !(miktarNum > 0)) return;
    const isim = arsivDraft.ad.trim() || "Ürün";
    const yeniMi = arsivDraft.urunId === null || arsivDraft.urunId === undefined;
    setGecmisAlisverisler((prev) =>
      prev.map((a) => {
        if (a.id !== arsivDraft.arsivId) return a;
        if (yeniMi) {
          const yeniUrun = {
            id: Date.now(),
            ad: isim,
            birim: arsivDraft.birim,
            fiyat: fiyatNum,
            miktar: miktarNum,
            kacTane: kacTaneNum,
            birimFiyati: hesaplaBirimFiyati(fiyatNum, miktarNum, arsivDraft.birim),
            satirToplami: fiyatNum * kacTaneNum,
            baskasiAdet: baskasiAdetNum,
            kimIcin: baskasiAdetNum > 0 ? arsivDraft.kimIcin.trim() : "",
            marketAdi: "",
          };
          return { ...a, urunler: [...a.urunler, yeniUrun] };
        }
        return {
          ...a,
          urunler: a.urunler.map((u) =>
            u.id === arsivDraft.urunId
              ? {
                  ...u,
                  ad: isim,
                  birim: arsivDraft.birim,
                  fiyat: fiyatNum,
                  miktar: miktarNum,
                  kacTane: kacTaneNum,
                  birimFiyati: hesaplaBirimFiyati(fiyatNum, miktarNum, arsivDraft.birim),
                  satirToplami: fiyatNum * kacTaneNum,
                  baskasiAdet: baskasiAdetNum,
                  kimIcin: baskasiAdetNum > 0 ? arsivDraft.kimIcin.trim() : "",
                }
              : u
          ),
        };
      })
    );
    if (isim !== "Ürün") gecmiseEkle(isim);
    setArsivDraft(null);
  };

  const TR_AYLAR = {
    "ocak": 0, "şubat": 1, "subat": 1, "mart": 2, "nisan": 3, "mayıs": 4, "mayis": 4,
    "haziran": 5, "temmuz": 6, "ağustos": 7, "agustos": 7, "eylül": 8, "eylul": 8,
    "ekim": 9, "kasım": 10, "kasim": 10, "aralık": 11, "aralik": 11,
  };

  const isimdenTarihCikar = (isim) => {
    if (!isim) return null;
    const m = isim.match(/(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{4})/i);
    if (!m) return null;
    const gun = parseInt(m[1], 10);
    const ay = TR_AYLAR[m[2].toLocaleLowerCase("tr")];
    const yil = parseInt(m[3], 10);
    if (ay === undefined || !gun || !yil) return null;
    return new Date(yil, ay, gun);
  };

  const gecmisAlisverislerSirali = useMemo(() => {
    if (arsivSiralamaTuru === "az") {
      return [...gecmisAlisverisler].sort((a, b) => a.isim.localeCompare(b.isim, "tr"));
    }
    return [...gecmisAlisverisler].sort((a, b) => {
      const da = isimdenTarihCikar(a.isim) || new Date(a.tarih);
      const db = isimdenTarihCikar(b.isim) || new Date(b.tarih);
      return db - da;
    });
  }, [gecmisAlisverisler, arsivSiralamaTuru]);

  const fiyatKarsilastirma = useMemo(() => {
    const gruplar = {};
    // tarihe göre eski -> yeni sırala ki karşılaştırma yönü doğru olsun
    const siraliAlisverisler = [...gecmisAlisverisler].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
    siraliAlisverisler.forEach((a) => {
      a.urunler.forEach((u) => {
        if (!u.birimFiyati) return;
        const key = u.ad.trim().toLocaleLowerCase("tr");
        if (!gruplar[key]) gruplar[key] = [];
        gruplar[key].push({ ad: u.ad, tarih: a.tarih, alisverisIsim: a.isim, marketAdi: u.marketAdi || "", birimFiyati: u.birimFiyati, birim: u.birim, arsivId: a.id, urunId: u.id });
      });
    });
    const sonuc = [];
    Object.values(gruplar).forEach((kayitlar) => {
      if (kayitlar.length < 2) return;
      const onceki = kayitlar[kayitlar.length - 2];
      const sonraki = kayitlar[kayitlar.length - 1];
      if (onceki.birim !== sonraki.birim) return;
      const fark = sonraki.birimFiyati - onceki.birimFiyati;
      const yuzde = onceki.birimFiyati > 0 ? (fark / onceki.birimFiyati) * 100 : 0;
      sonuc.push({ ad: sonraki.ad, birim: sonraki.birim, onceki, sonraki, fark, yuzde, tumKayitlar: kayitlar });
    });
    sonuc.sort((a, b) => Math.abs(b.yuzde) - Math.abs(a.yuzde));
    return sonuc;
  }, [gecmisAlisverisler]);

  const baskaGruplari = useMemo(() => {
    const map = {};
    urunler.forEach((u) => {
      if ((u.baskasiAdet || 0) > 0) {
        const key = (u.kimIcin || "").trim() || "İsim belirtilmedi";
        if (!map[key]) map[key] = [];
        map[key].push(u);
      }
    });
    return map;
  }, [urunler]);

  const siralaAZ = () =>
    setUrunler((prev) => [...prev].sort((a, b) => a.ad.localeCompare(b.ad, "tr")));

  const yukariTasi = (index) => {
    if (index === 0) return;
    setUrunler((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const asagiTasi = (index) => {
    setUrunler((prev) => {
      if (index === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const formuTemizle = () => {
    setAd("");
    setMarketAdi("");
    setFiyat("");
    setMiktar("");
    setKacTane(1);
    setBirim("gram");
    setEditingId(null);
    setGirisModu("toplam");
    setKgFiyati("");
  };

  const gecmiseEkle = (isim) => {
    if (!isim || isim === "Ürün") return;
    setUrunGecmisi((prev) => {
      if (prev.some((n) => n.toLocaleLowerCase("tr") === isim.toLocaleLowerCase("tr"))) return prev;
      return [isim, ...prev].slice(0, 200);
    });
  };

  const hesaplaBirimFiyati = (f, m, b) =>
    f > 0 && m > 0 ? (b === "gram" ? (f / m) * 1000 : f / m) : null;

  const [fisMetni, setFisMetni] = useState("");

  const fisMetniAyristir = () => {
    setTaramaHata("");
    setTaramaSonuclari([]);
    try {
      const temiz = fisMetni.trim().replace(/```json|```/g, "").replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'").trim();
      const dizi = JSON.parse(temiz);
      if (!Array.isArray(dizi) || dizi.length === 0) throw new Error("Liste boş veya format hatalı");
      setTaramaSonuclari(
        dizi.map((u, i) => ({
          gid: i,
          ad: u.ad || "Ürün",
          birim: u.birim === "adet" ? "adet" : "gram",
          fiyat: Number(u.fiyat) || 0,
          miktar: Number(u.miktar) || 1,
          kacTane: Number(u.kacTane) || 1,
          dahil: true,
        }))
      );
    } catch (err) {
      setTaramaHata("Bu metin okunamadı: " + (err && err.message ? err.message : "bilinmeyen hata") + ". Claude'un verdiği JSON'u eksiksiz yapıştırdığından emin ol.");
    }
  };

  const taramaAlanGuncelle = (gid, alan, deger) =>
    setTaramaSonuclari((prev) => prev.map((s) => (s.gid === gid ? { ...s, [alan]: deger } : s)));

  const taramaDahilToggle = (gid) =>
    setTaramaSonuclari((prev) => prev.map((s) => (s.gid === gid ? { ...s, dahil: !s.dahil } : s)));

  const taramaKapat = () => {
    setTaramaAcik(false);
    setTaramaSonuclari([]);
    setTaramaHata("");
    setFisMetni("");
  };

  const taramaListeyeEkle = () => {
    const eklenecekler = taramaSonuclari.filter((s) => s.dahil && s.ad.trim() && s.fiyat > 0 && s.miktar > 0);
    if (eklenecekler.length === 0) return;
    const yeniler = eklenecekler.map((s, i) => ({
      id: Date.now() + i,
      ad: s.ad.trim(),
      birim: s.birim,
      fiyat: s.fiyat,
      miktar: s.miktar,
      kacTane: s.kacTane || 1,
      birimFiyati: hesaplaBirimFiyati(s.fiyat, s.miktar, s.birim),
      satirToplami: s.fiyat * (s.kacTane || 1),
      baskasiAdet: 0,
      kimIcin: "",
      marketAdi: "",
    }));
    setUrunler((prev) => [...yeniler, ...prev]);
    eklenecekler.forEach((s) => gecmiseEkle(s.ad.trim()));
    taramaKapat();
  };

  const kaydet = () => {
    if (!gecerli) return;
    const isim = ad.trim() || "Ürün";
    gecmiseEkle(isim);
    if (editingId) {
      setUrunler((prev) =>
        prev.map((u) =>
          u.id === editingId
            ? {
                ...u,
                ad: isim,
                birim,
                fiyat: fiyatNum,
                miktar: miktarNum,
                kacTane,
                birimFiyati,
                satirToplami,
                baskasiAdet: Math.min(u.baskasiAdet || 0, kacTane),
                marketAdi: marketAdi.trim(),
              }
            : u
        )
      );
    } else {
      setUrunler((prev) => [
        { id: Date.now(), ad: isim, birim, fiyat: fiyatNum, miktar: miktarNum, kacTane, birimFiyati, satirToplami, baskasiAdet: 0, kimIcin: "", marketAdi: marketAdi.trim() },
        ...prev,
      ]);
    }
    formuTemizle();
  };

  const duzenle = (u) => {
    setEditingId(u.id);
    setAd(u.ad === "Ürün" ? "" : u.ad);
    setMarketAdi(u.marketAdi || "");
    setBirim(u.birim);
    setFiyat(String(u.fiyat).replace(".", ","));
    setMiktar(String(u.miktar).replace(".", ","));
    setKacTane(u.kacTane);
    setGirisModu("toplam");
    setKgFiyati("");
  };

  const sil = (id) => {
    setUrunler((prev) => prev.filter((u) => u.id !== id));
    if (editingId === id) formuTemizle();
  };
  const paraFmt = (n) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const miktarFmt = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });

  const yedekJson = JSON.stringify({ urunler, urunGecmisi, gecmisAlisverisler, kartKampanyalari, kuralTipleri });

  const yedekTextareaRef = useRef(null);

  const yedekKopyala = async () => {
    // Panoya yazma bazı ortamlarda engellenebiliyor — bu yüzden her durumda
    // metni de otomatik seçip, kullanıcının elle kopyalayabilmesini sağlıyoruz.
    if (yedekTextareaRef.current) {
      yedekTextareaRef.current.focus();
      yedekTextareaRef.current.select();
    }
    try {
      await navigator.clipboard.writeText(yedekJson);
      setYedekMesaj("✓ Panoya kopyalandı. Notlar uygulamasına yapıştırıp saklayabilirsin.");
    } catch (e) {
      setYedekMesaj("Otomatik kopyalanamadı — metin senin için seçildi, şimdi parmağını basılı tutup 'Kopyala'ya dokun.");
    }
    setTimeout(() => setYedekMesaj(""), 6000);
  };

  const yedekIceAktar = () => {
    try {
      const temiz = iceAktarMetni.trim().replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
      const obj = JSON.parse(temiz);
      if (!Array.isArray(obj.urunler)) throw new Error("'urunler' listesi bulunamadı — bu doğru bir yedek metni değil");
      const gelenGecmis = Array.isArray(obj.gecmisAlisverisler) ? obj.gecmisAlisverisler : Array.isArray(obj.arsiv) ? obj.arsiv : null;
      setUrunler(obj.urunler);
      if (Array.isArray(obj.urunGecmisi)) setUrunGecmisi(obj.urunGecmisi);
      if (gelenGecmis) setGecmisAlisverisler(gelenGecmis);
      if (Array.isArray(obj.kartKampanyalari)) setKartKampanyalari(obj.kartKampanyalari);
      if (Array.isArray(obj.kuralTipleri) && obj.kuralTipleri.length > 0) setKuralTipleri(obj.kuralTipleri);
      setIceAktarMetni("");
      setYedekMesaj(`✓ ${obj.urunler.length} ürün, ${(gelenGecmis || []).length} alışveriş geri yüklendi.`);
    } catch (e) {
      setYedekMesaj(`Okunamadı: ${e.message}`);
    }
  };

  const driveyeBaglan = async () => {
    if (!driveClientId.trim()) {
      setDriveDurum("Önce bir Client ID gir.");
      return;
    }
    setDriveIslemde(true);
    setDriveDurum("Google'a yönlendiriliyor...");
    try {
      const token = await window.DriveSync.baglan(driveClientId.trim());
      setDriveToken(token);
      setDriveDurum("✓ Bağlandı. Şimdi yükle/indir yapabilirsin.");
    } catch (e) {
      setDriveDurum(`Bağlanamadı: ${e.message}`);
    } finally {
      setDriveIslemde(false);
    }
  };

  const buluteYukle = async () => {
    if (!driveToken) {
      setDriveDurum("Önce Google ile bağlan.");
      return;
    }
    setDriveIslemde(true);
    setDriveDurum("Buluta yükleniyor...");
    try {
      await window.DriveSync.yukle(driveToken, yedekJson);
      setDriveDurum(`✓ Buluta yüklendi (${new Date().toLocaleTimeString("tr-TR")})`);
    } catch (e) {
      setDriveDurum(`Yükleme hatası: ${e.message}`);
    } finally {
      setDriveIslemde(false);
    }
  };

  const buluttanIndir = async () => {
    if (!driveToken) {
      setDriveDurum("Önce Google ile bağlan.");
      return;
    }
    setDriveIslemde(true);
    setDriveDurum("Buluttan indiriliyor...");
    try {
      const sonuc = await window.DriveSync.indir(driveToken);
      if (!sonuc) {
        setDriveDurum("Buluta henüz yedek yüklenmemiş — önce 'Buluta Yükle' ile başlat.");
        return;
      }
      const obj = JSON.parse(sonuc.metin);
      if (!Array.isArray(obj.urunler)) throw new Error("Bulut yedeği okunamadı.");
      setUrunler(obj.urunler);
      if (Array.isArray(obj.urunGecmisi)) setUrunGecmisi(obj.urunGecmisi);
      if (Array.isArray(obj.gecmisAlisverisler)) setGecmisAlisverisler(obj.gecmisAlisverisler);
      if (Array.isArray(obj.kartKampanyalari)) setKartKampanyalari(obj.kartKampanyalari);
      if (Array.isArray(obj.kuralTipleri) && obj.kuralTipleri.length > 0) setKuralTipleri(obj.kuralTipleri);
      setDriveDurum(`✓ Buluttan geri yüklendi (${new Date(sonuc.modifiedTime).toLocaleString("tr-TR")})`);
    } catch (e) {
      setDriveDurum(`İndirme hatası: ${e.message}`);
    } finally {
      setDriveIslemde(false);
    }
  };

  const INK = "#16241C";
  const GREEN = "#1F7A5C";
  const CORAL = "#FF6B4A";
  const PURPLE = "#7C5CFC";
  const MUTED = "#7C8A82";
  const BG = "#F2F4F1";

  // Veri tam yüklenmeden hiçbir şey eklenemesin — aksi halde hızlıca eklenen
  // bir ürün, az sonra tamamlanan yükleme tarafından ezilebilir.
  if (!yuklendi) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: GREEN }}>
          <ShoppingBasket size={19} color="#fff" strokeWidth={2} />
        </div>
        <p className="text-[12.5px]" style={{ color: MUTED }}>Listen yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-sm relative pb-36">
        {/* Header */}
        <div className="px-5 pt-7 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: GREEN }}>
              <ShoppingBasket size={19} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[17px] leading-tight" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: INK }}>
                Market Listem
              </h1>
              <p className="text-[11px]" style={{ color: MUTED }}>
                {new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long" })}
              </p>
            </div>
          </div>
          {urunler.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: "#fff", color: GREEN, fontWeight: 700, border: `1px solid ${GREEN}22` }}>
                {toplamAdet} ürün
              </div>
              <button
                onClick={siralaAZ}
                className="flex items-center gap-1 text-[10.5px] px-2 py-1"
                style={{ color: GREEN, fontWeight: 600 }}
              >
                <ArrowDownAZ size={12} /> A-Z
              </button>
              <button
                onClick={() => { if (confirm("Tüm liste silinsin mi?")) setUrunler([]); }}
                className="text-[10.5px] px-2 py-1"
                style={{ color: MUTED, fontWeight: 600 }}
              >
                Temizle
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mx-4 mt-1">
          <button
            onClick={() => setYedekAcik((v) => !v)}
            className="text-[9.5px] underline"
            style={{ color: GREEN }}
          >
            {yedekAcik ? "yedekleme panelini gizle" : "yedekle / geri yükle"}
          </button>
          <button
            onClick={() => setTanilamaAcik((v) => !v)}
            className="text-[9.5px] underline"
            style={{ color: MUTED }}
          >
            {tanilamaAcik ? "teşhis bilgisini gizle" : "teşhis bilgisini göster"}
          </button>
        </div>

        {yedekAcik && (
          <div className="mx-4 mt-1.5 rounded-xl p-3 space-y-2.5" style={{ background: "#fff", border: `1px solid ${GREEN}33` }}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px]" style={{ color: INK, fontWeight: 700 }}>Yedek al</span>
                <button onClick={yedekKopyala} className="text-[10px] px-2 py-1 rounded-full" style={{ background: GREEN, color: "#fff", fontWeight: 700 }}>
                  Kopyala
                </button>
              </div>
              <textarea
                ref={yedekTextareaRef}
                readOnly
                value={yedekJson}
                onFocus={(e) => e.target.select()}
                className="w-full text-[9px] p-2 rounded-lg outline-none"
                style={{ background: BG, color: MUTED, fontFamily: "'IBM Plex Mono', monospace", height: 60, resize: "none" }}
              />
              <p className="text-[9px] mt-1" style={{ color: MUTED }}>Bu metni kopyalayıp Notlar'a yapıştırırsan, depolama sorunu düzelene kadar listeni kaybetmezsin.</p>
            </div>
            <div>
              <span className="text-[10.5px]" style={{ color: INK, fontWeight: 700 }}>Yedekten geri yükle</span>
              <textarea
                value={iceAktarMetni}
                onChange={(e) => setIceAktarMetni(e.target.value)}
                placeholder="Daha önce kopyaladığın yedek metnini buraya yapıştır"
                className="w-full text-[9px] p-2 rounded-lg outline-none mt-1"
                style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace", height: 50, resize: "none" }}
              />
              <button
                onClick={yedekIceAktar}
                disabled={!iceAktarMetni.trim()}
                className="w-full mt-1.5 py-1.5 rounded-lg text-[10px]"
                style={{ background: iceAktarMetni.trim() ? CORAL : "#D8DCD8", color: "#fff", fontWeight: 700 }}
              >
                İçe Aktar
              </button>
            </div>
            {yedekMesaj && <p className="text-[9.5px]" style={{ color: GREEN, fontWeight: 600 }}>{yedekMesaj}</p>}

            <div className="pt-2.5" style={{ borderTop: `1px dashed ${GREEN}30` }}>
              <span className="text-[10.5px]" style={{ color: INK, fontWeight: 700 }}>Bulut senkronu (Google Drive)</span>
              <p className="text-[9px] mt-0.5 mb-1.5" style={{ color: MUTED }}>
                Verilerini, sadece bu uygulamanın görebildiği gizli bir Drive dosyasına yükleyip başka bir cihazdan indirebilirsin. Kullanmak için kendi Google Client ID'ni gir (README'de nasıl alınacağı anlatılıyor).
              </p>
              <input
                value={driveClientId}
                onChange={(e) => setDriveClientId(e.target.value)}
                placeholder="Google OAuth Client ID"
                className="w-full text-[9.5px] py-1.5 px-2 rounded-lg outline-none mb-1.5"
                style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
              />
              <div className="flex gap-1.5">
                <button
                  onClick={driveyeBaglan}
                  disabled={driveIslemde || !driveClientId.trim()}
                  className="flex-1 py-1.5 rounded-lg text-[10px]"
                  style={{ background: driveClientId.trim() ? PURPLE : "#D8DCD8", color: "#fff", fontWeight: 700 }}
                >
                  {driveToken ? "Yeniden Bağlan" : "Google ile Bağlan"}
                </button>
                <button
                  onClick={buluteYukle}
                  disabled={driveIslemde || !driveToken}
                  className="flex-1 py-1.5 rounded-lg text-[10px]"
                  style={{ background: driveToken ? GREEN : "#D8DCD8", color: "#fff", fontWeight: 700 }}
                >
                  Buluta Yükle
                </button>
                <button
                  onClick={buluttanIndir}
                  disabled={driveIslemde || !driveToken}
                  className="flex-1 py-1.5 rounded-lg text-[10px]"
                  style={{ background: driveToken ? CORAL : "#D8DCD8", color: "#fff", fontWeight: 700 }}
                >
                  Buluttan İndir
                </button>
              </div>
              {driveDurum && <p className="text-[9.5px] mt-1.5" style={{ color: GREEN, fontWeight: 600 }}>{driveDurum}</p>}
            </div>
          </div>
        )}
        {tanilamaAcik && (
          <div className="mx-4 mt-1 rounded-xl p-2.5" style={{ background: "#fff", border: "1px solid #EEF0EC" }}>
            <pre className="text-[9px] whitespace-pre-wrap" style={{ color: INK, fontFamily: "'IBM Plex Mono', monospace" }}>{tanilama}</pre>
          </div>
        )}

        {/* Sekmeler */}
        <div className="mx-4 mb-3 flex gap-1.5 p-1 rounded-xl" style={{ background: "#E8EAE5" }}>
          <button
            onClick={() => setMod("liste")}
            className="flex-1 py-1.5 rounded-lg text-[12px] transition-colors"
            style={{ background: mod === "liste" ? "#fff" : "transparent", color: mod === "liste" ? INK : MUTED, fontWeight: 700 }}
          >
            Liste
          </button>
          <button
            onClick={() => setMod("gecmis")}
            className="flex-1 py-1.5 rounded-lg text-[12px] flex items-center justify-center gap-1 transition-colors"
            style={{ background: mod === "gecmis" ? "#fff" : "transparent", color: mod === "gecmis" ? INK : MUTED, fontWeight: 700 }}
          >
            <History size={12} /> Geçmiş {gecmisAlisverisler.length > 0 && `(${gecmisAlisverisler.length})`}
          </button>
          <button
            onClick={() => setMod("puan")}
            className="flex-1 py-1.5 rounded-lg text-[12px] flex items-center justify-center gap-1 transition-colors"
            style={{ background: mod === "puan" ? "#fff" : "transparent", color: mod === "puan" ? INK : MUTED, fontWeight: 700 }}
          >
            💳 Puan
          </button>
        </div>

        {mod === "liste" && <>
        {/* Fiş tarama (sohbet üzerinden) */}
        <button
          onClick={() => setTaramaAcik((v) => !v)}
          className="mx-4 mb-3 w-[calc(100%-2rem)] flex items-center justify-center gap-2 py-3 rounded-2xl"
          style={{ background: PURPLE, color: "#fff", fontWeight: 700, fontSize: 13 }}
        >
          <Camera size={16} />
          Fiş Fotoğrafından Ekle
        </button>

        {taramaAcik && (
          <div className="mx-4 mb-3 rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.12)" }}>
            {taramaSonuclari.length === 0 && (
              <div>
                <div className="rounded-xl p-3 mb-3" style={{ background: `${PURPLE}0C` }}>
                  <p className="text-[11.5px] leading-relaxed" style={{ color: INK }}>
                    <b>Nasıl çalışır:</b> Bu artifact kamerayı doğrudan açamıyor. Onun yerine:
                  </p>
                  <ol className="text-[11.5px] mt-1.5 space-y-1 pl-4" style={{ color: INK, listStyle: "decimal" }}>
                    <li>Fişin fotoğrafını <b>bu sohbete</b> (Claude'a mesaj olarak) gönder</li>
                    <li>Şunu yaz: <i>"bu fişteki ürünleri JSON olarak çıkar"</i></li>
                    <li>Claude'un verdiği JSON metnini kopyala, aşağıya yapıştır</li>
                  </ol>
                </div>
                <textarea
                  value={fisMetni}
                  onChange={(e) => setFisMetni(e.target.value)}
                  placeholder='[{"ad":"Tavuk göğsü","fiyat":161.4,"birim":"gram","miktar":850,"kacTane":1}, ...]'
                  className="w-full text-[10.5px] p-2.5 rounded-xl outline-none"
                  style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace", height: 90, resize: "none" }}
                />
                {taramaHata && (
                  <div className="flex items-start gap-2 mt-2">
                    <AlertTriangle size={14} color={CORAL} className="shrink-0 mt-0.5" />
                    <span className="text-[11px]" style={{ color: CORAL }}>{taramaHata}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={taramaKapat} className="flex-1 py-2.5 rounded-xl text-[12px]" style={{ background: BG, color: INK, fontWeight: 700 }}>Kapat</button>
                  <button
                    onClick={fisMetniAyristir}
                    disabled={!fisMetni.trim()}
                    className="flex-1 py-2.5 rounded-xl text-[12px]"
                    style={{ background: fisMetni.trim() ? PURPLE : "#D8DCD8", color: "#fff", fontWeight: 700 }}
                  >
                    Ayrıştır
                  </button>
                </div>
              </div>
            )}
            {taramaSonuclari.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12.5px]" style={{ fontWeight: 800, color: INK }}>Fişten {taramaSonuclari.length} ürün okundu</span>
                  <span className="text-[10px]" style={{ color: MUTED }}>kontrol et, gerekirse düzelt</span>
                </div>
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {taramaSonuclari.map((s) => (
                    <div key={s.gid} className="rounded-xl p-2.5" style={{ background: s.dahil ? `${PURPLE}0A` : BG }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <input type="checkbox" checked={s.dahil} onChange={() => taramaDahilToggle(s.gid)} style={{ accentColor: PURPLE }} />
                        <input
                          value={s.ad}
                          onChange={(e) => taramaAlanGuncelle(s.gid, "ad", e.target.value)}
                          className="flex-1 text-[12.5px] bg-transparent outline-none"
                          style={{ fontWeight: 700, color: INK }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 pl-6">
                        <select
                          value={s.birim}
                          onChange={(e) => taramaAlanGuncelle(s.gid, "birim", e.target.value)}
                          className="text-[10px] rounded-lg px-1.5 py-1 outline-none"
                          style={{ background: "#fff", color: INK }}
                        >
                          <option value="gram">gram</option>
                          <option value="adet">adet</option>
                        </select>
                        <input
                          value={s.fiyat}
                          onChange={(e) => taramaAlanGuncelle(s.gid, "fiyat", parseFloat(e.target.value.replace(",", ".")) || 0)}
                          placeholder="fiyat"
                          className="w-16 text-[11px] rounded-lg px-1.5 py-1 outline-none"
                          style={{ background: "#fff", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                        />
                        <input
                          value={s.miktar}
                          onChange={(e) => taramaAlanGuncelle(s.gid, "miktar", parseFloat(e.target.value.replace(",", ".")) || 0)}
                          placeholder={s.birim === "gram" ? "gram" : "miktar"}
                          className="w-16 text-[11px] rounded-lg px-1.5 py-1 outline-none"
                          style={{ background: "#fff", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                        />
                        <span className="text-[10px]" style={{ color: MUTED }}>× {s.kacTane}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={taramaKapat} className="flex-1 py-2.5 rounded-xl text-[12px]" style={{ background: BG, color: INK, fontWeight: 700 }}>İptal</button>
                  <button onClick={taramaListeyeEkle} className="flex-1 py-2.5 rounded-xl text-[12px]" style={{ background: PURPLE, color: "#fff", fontWeight: 700 }}>
                    {taramaSonuclari.filter((s) => s.dahil).length} ürünü listeye ekle
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input card */}
        <div className="mx-4 rounded-3xl p-4" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.12)" }}>
          {editingId && (
            <div className="flex items-center justify-between mb-2.5 rounded-xl px-3 py-1.5" style={{ background: `${CORAL}15` }}>
              <span className="text-[11.5px]" style={{ color: CORAL, fontWeight: 700 }}>Kayıt düzenleniyor</span>
              <button onClick={formuTemizle} className="flex items-center gap-1 text-[11px]" style={{ color: CORAL, fontWeight: 700 }}>
                <X size={12} /> Vazgeç
              </button>
            </div>
          )}
          <div className="relative mb-2.5">
            <input
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              onFocus={() => setOneriGoster(true)}
              onBlur={() => setTimeout(() => setOneriGoster(false), 150)}
              placeholder="Ürün adı (opsiyonel)"
              className="w-full text-[14px] py-2 px-3 rounded-xl outline-none"
              style={{ background: BG, color: INK }}
            />
            {oneriGoster && oneriler.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-10" style={{ background: "#fff", boxShadow: "0 8px 20px -6px rgba(22,36,28,0.25)" }}>
                {oneriler.map((n) => {
                  const kayit = tumUrunKayitlari[n.trim().toLocaleLowerCase("tr")];
                  return (
                    <button
                      key={n}
                      onMouseDown={() => oneriSec(n)}
                      className="w-full flex items-center justify-between text-left px-3 py-2 text-[13px]"
                      style={{ color: INK, borderBottom: "1px solid #EEF0EC" }}
                    >
                      <span>{n}</span>
                      {kayit && (
                        <span className="text-[10px] shrink-0 ml-2" style={{ color: MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>
                          ₺{paraFmt(kayit.fiyat)} / {kayit.birim === "gram" ? `${miktarFmt(kayit.miktar)}g` : `${miktarFmt(kayit.miktar)} adet`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <input
            value={marketAdi}
            onChange={(e) => setMarketAdi(e.target.value)}
            list="market-datalist"
            placeholder="Market/mağaza adı (opsiyonel — örn. Gimat Gross)"
            className="w-full text-[12.5px] py-1.5 px-3 rounded-xl outline-none mb-2.5"
            style={{ background: BG, color: MUTED }}
          />
          <datalist id="market-datalist">
            {tumMarketAdlari.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>

          <div className="flex gap-2 mb-3">
            {[
              { key: "gram", label: "Gram ile", sub: "tavuk, meyve..." },
              { key: "adet", label: "Adet ile", sub: "koli, paket..." },
            ].map((b) => (
              <button
                key={b.key}
                onClick={() => { setBirim(b.key); setGirisModu("toplam"); setKgFiyati(""); setFiyat(""); }}
                className="flex-1 rounded-xl py-2 transition-all"
                style={{
                  background: birim === b.key ? GREEN : BG,
                  color: birim === b.key ? "#fff" : INK,
                }}
              >
                <div className="text-[12.5px]" style={{ fontWeight: 700 }}>{b.label}</div>
                <div className="text-[10px]" style={{ color: birim === b.key ? "#ffffffb0" : MUTED }}>{b.sub}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            {[
              { key: "toplam", label: "Toplam fiyatı biliyorum" },
              { key: "birimFiyati", label: birim === "gram" ? "Kg fiyatını biliyorum" : "Adet fiyatını biliyorum" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => { setGirisModu(m.key); setFiyat(""); setKgFiyati(""); }}
                className="flex-1 rounded-lg py-1.5 text-[10.5px]"
                style={{
                  background: girisModu === m.key ? `${GREEN}18` : BG,
                  color: girisModu === m.key ? GREEN : MUTED,
                  fontWeight: 700,
                  border: girisModu === m.key ? `1px solid ${GREEN}55` : "1px solid transparent",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              {kgModuAktif ? (
                <>
                  <label className="text-[10px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>KİLOGRAM FİYATI (₺/kg)</label>
                  <input
                    value={kgFiyati}
                    onChange={(e) => setKgFiyati(e.target.value)}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="w-full text-[15px] py-2 px-3 rounded-xl outline-none mt-0.5"
                    style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                </>
              ) : adetToplamModuAktif ? (
                <>
                  <label className="text-[10px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>TOPLAM FİYAT (₺)</label>
                  <input
                    value={fiyat}
                    onChange={(e) => setFiyat(e.target.value)}
                    inputMode="decimal"
                    placeholder="hepsi için ödediğin toplam"
                    className="w-full text-[15px] py-2 px-3 rounded-xl outline-none mt-0.5"
                    style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                </>
              ) : (
                <>
                  <label className="text-[10px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>
                    {birim === "adet" ? "ADET FİYATI (₺)" : "FİYAT (₺)"}
                  </label>
                  <input
                    value={fiyat}
                    onChange={(e) => setFiyat(e.target.value)}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="w-full text-[15px] py-2 px-3 rounded-xl outline-none mt-0.5"
                    style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                </>
              )}
            </div>
            <div className="flex-1">
              <label className="text-[10px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>
                {birim === "gram" ? "GRAMAJ (g)" : "KOLİDEKİ ADET"}
              </label>
              <input
                value={miktar}
                onChange={(e) => setMiktar(e.target.value)}
                inputMode="decimal"
                placeholder={birim === "gram" ? "0" : "6, 24..."}
                className="w-full text-[15px] py-2 px-3 rounded-xl outline-none mt-0.5"
                style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
              />
            </div>
          </div>

          {kgModuAktif && (
            <div className="flex items-center justify-between rounded-xl px-3 py-2 mb-3" style={{ background: `${GREEN}0F` }}>
              <span className="text-[11px]" style={{ color: GREEN, fontWeight: 600 }}>Hesaplanan toplam fiyat</span>
              <span className="text-[13.5px]" style={{ fontWeight: 700, color: fiyatNum > 0 ? GREEN : MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>
                {fiyatNum > 0 ? `₺${paraFmt(fiyatNum)}` : "—"}
              </span>
            </div>
          )}

          {adetToplamModuAktif && (
            <div className="flex items-center justify-between rounded-xl px-3 py-2 mb-3" style={{ background: `${GREEN}0F` }}>
              <span className="text-[11px]" style={{ color: GREEN, fontWeight: 600 }}>Hesaplanan adet fiyatı</span>
              <span className="text-[13.5px]" style={{ fontWeight: 700, color: fiyatNum > 0 ? GREEN : MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>
                {fiyatNum > 0 ? `₺${paraFmt(fiyatNum)} / adet` : "—"}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl px-3 py-2 mb-3" style={{ background: BG }}>
            <span className="text-[11.5px]" style={{ color: MUTED, fontWeight: 600 }}>Kaç tane aldın?</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setKacTane((n) => Math.max(1, n - 1))} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#fff", color: INK }}>
                <Minus size={12} />
              </button>
              <span className="text-[14px] w-4 text-center" style={{ fontWeight: 700, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}>{kacTane}</span>
              <button onClick={() => setKacTane((n) => n + 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: GREEN, color: "#fff" }}>
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background: `${GREEN}0F` }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px]" style={{ color: GREEN, fontWeight: 600 }}>
                {birim === "gram" ? "Kilogram fiyatı" : "Birim (tane) fiyatı"}
              </span>
              <span className="text-[13.5px]" style={{ fontWeight: 700, color: birimFiyati ? GREEN : MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>
                {birimFiyati ? `₺${paraFmt(birimFiyati)} / ${birim === "gram" ? "kg" : "adet"}` : "—"}
              </span>
            </div>
            {kacTane > 1 && satirToplami && (
              <div className="flex items-center justify-between mt-1 pt-1" style={{ borderTop: `1px dashed ${GREEN}33` }}>
                <span className="text-[11px]" style={{ color: GREEN, fontWeight: 600 }}>{kacTane} tane toplamı</span>
                <span className="text-[13.5px]" style={{ fontWeight: 700, color: GREEN, fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(satirToplami)}</span>
              </div>
            )}
          </div>

          <button
            onClick={kaydet}
            disabled={!gecerli}
            className="w-full py-3 rounded-xl text-[13.5px] transition-opacity flex items-center justify-center gap-1.5"
            style={{ background: gecerli ? (editingId ? CORAL : INK) : "#D8DCD8", color: "#fff", fontWeight: 700, opacity: gecerli ? 1 : 0.6 }}
          >
            {editingId ? <><Check size={15} /> Değişikliği kaydet</> : <><Plus size={15} /> Listeye ekle</>}
          </button>
        </div>

        {/* Search */}
        {urunler.length > 0 && (
          <div className="mx-4 mt-4 relative">
            <Search size={14} color={MUTED} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Listede ara..."
              className="w-full text-[13px] py-2.5 pl-9 pr-8 rounded-xl outline-none"
              style={{ background: "#fff", color: INK, boxShadow: "0 4px 14px -6px rgba(22,36,28,0.10)" }}
            />
            {arama && (
              <button onClick={() => setArama("")} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Aramayı temizle">
                <X size={14} color={MUTED} />
              </button>
            )}
          </div>
        )}

        {toplamBaskasi > 0 && (
          <button
            onClick={() => setBaskaListesiAcik((v) => !v)}
            className="mx-4 mt-2.5 w-[calc(100%-2rem)] flex items-center justify-between rounded-xl px-3.5 py-2.5"
            style={{ background: `${PURPLE}12`, border: `1px solid ${PURPLE}30` }}
          >
            <div className="flex items-center gap-1.5">
              <User size={13} color={PURPLE} />
              <span className="text-[11.5px]" style={{ color: PURPLE, fontWeight: 700 }}>
                Başkaları için ({baskasiBirimSayisi} adet · ₺{paraFmt(toplamBaskasi)})
              </span>
            </div>
            <span className="text-[10px]" style={{ color: PURPLE }}>{baskaListesiAcik ? "gizle" : "göster"}</span>
          </button>
        )}

        {baskaListesiAcik && (
          <div className="mx-4 mt-2 rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.10)" }}>
            {Object.entries(baskaGruplari).map(([kisi, urunlerListesi], gi) => {
              const grupToplami = urunlerListesi.reduce((acc, u) => acc + u.fiyat * u.baskasiAdet, 0);
              return (
                <div key={kisi} style={{ borderTop: gi > 0 ? "1px solid #EEF0EC" : "none" }}>
                  <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                    <span className="text-[11.5px]" style={{ color: PURPLE, fontWeight: 800 }}>{kisi}</span>
                    <span className="text-[11.5px]" style={{ color: PURPLE, fontWeight: 800, fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(grupToplami)}</span>
                  </div>
                  {urunlerListesi.map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-4 py-1.5">
                      <span className="text-[11.5px]" style={{ color: INK }}>
                        {u.ad} {u.kacTane > 1 ? `(${u.baskasiAdet}/${u.kacTane})` : ""}
                      </span>
                      <span className="text-[11px]" style={{ color: MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(u.fiyat * u.baskasiAdet)}</span>
                    </div>
                  ))}
                  <div className="pb-2" />
                </div>
              );
            })}
          </div>
        )}

        {/* List */}
        {gosterilecekUrunler.length > 0 ? (
          <div className="mx-4 mt-3 rounded-3xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.10)" }}>
            {gosterilecekUrunler.map((u) => {
              const i = urunler.findIndex((x) => x.id === u.id);
              return (
              <div
                key={u.id}
                className="flex items-start gap-3 px-4 py-3 group"
                style={{
                  borderBottom: u.id !== gosterilecekUrunler[gosterilecekUrunler.length - 1].id ? "1px solid #EEF0EC" : "none",
                  background: editingId === u.id ? `${CORAL}0C` : u.baskasiAdet > 0 ? `${PURPLE}12` : "transparent",
                }}
              >
                <button onClick={() => baskasiArttir(u.id)} className="shrink-0 mt-0.5" aria-label="Başkası için ayır">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: u.baskasiAdet > 0 ? PURPLE : BG }}
                  >
                    {u.baskasiAdet > 0 ? (
                      u.kacTane > 1 ? (
                        <span className="text-[8px]" style={{ color: "#fff", fontWeight: 800 }}>{u.baskasiAdet}/{u.kacTane}</span>
                      ) : (
                        <User size={12} color="#fff" />
                      )
                    ) : (
                      <User size={12} color={MUTED} />
                    )}
                  </div>
                </button>
                <div className="flex-1 min-w-0 pt-0.5" onClick={() => duzenle(u)}>
                  <div className="text-[12px] leading-snug flex flex-wrap items-center gap-1" style={{ fontWeight: 700, color: u.baskasiAdet > 0 ? PURPLE : INK, wordBreak: "break-word" }}>
                    <span>{u.ad}</span>
                    {u.kacTane > 1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${CORAL}18`, color: CORAL, fontWeight: 700 }}>×{u.kacTane}</span>
                    )}
                    {u.baskasiAdet > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${PURPLE}18`, color: PURPLE, fontWeight: 700 }}>
                        {u.kacTane > 1 ? `${u.baskasiAdet}/${u.kacTane}` : ""}{u.kimIcin ? ` ${u.kimIcin} için` : " başkası için"}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: MUTED }}>
                    {u.birim === "gram"
                      ? `${miktarFmt(u.miktar)} g · ₺${paraFmt(u.birimFiyati)}/kg`
                      : `${miktarFmt(u.miktar)} adet/koli · ₺${paraFmt(u.birimFiyati)}/adet`}
                    {u.marketAdi && ` · ${u.marketAdi}`}
                  </div>
                  {u.baskasiAdet > 0 && (
                    <input
                      value={u.kimIcin || ""}
                      onChange={(e) => kimIcinGuncelle(u.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="kimin için? (isim yaz)"
                      className="text-[10px] mt-1 px-2 py-1 rounded-lg outline-none w-full"
                      style={{ background: `${PURPLE}0F`, color: PURPLE }}
                    />
                  )}
                </div>
                <span className="text-[13px] shrink-0 mt-0.5" style={{ fontWeight: 700, color: u.baskasiAdet > 0 ? PURPLE : INK, fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(u.satirToplami)}</span>
                <div className="flex flex-col shrink-0">
                  <button onClick={() => yukariTasi(i)} disabled={i === 0} className="opacity-40 hover:opacity-100 transition-opacity disabled:opacity-10" aria-label="Yukarı taşı">
                    <ChevronUp size={13} color={INK} />
                  </button>
                  <button onClick={() => asagiTasi(i)} disabled={i === urunler.length - 1} className="opacity-40 hover:opacity-100 transition-opacity disabled:opacity-10" aria-label="Aşağı taşı">
                    <ChevronDown size={13} color={INK} />
                  </button>
                </div>
                <div className="flex flex-col shrink-0 gap-1.5 mt-0.5">
                  <button onClick={() => duzenle(u)} className="opacity-40 hover:opacity-100 transition-opacity" aria-label="Düzenle">
                    <Pencil size={12} color={GREEN} />
                  </button>
                  <button onClick={() => sil(u.id)} className="opacity-40 hover:opacity-100 transition-opacity" aria-label="Sil">
                    <Trash2 size={13} color={INK} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        ) : urunler.length > 0 ? (
          <div className="mx-4 mt-6 flex flex-col items-center py-8 text-center">
            <Search size={26} color={MUTED} strokeWidth={1.5} />
            <p className="text-[12.5px] mt-2" style={{ color: MUTED }}>"{arama}" ile eşleşen ürün yok.</p>
          </div>
        ) : (
          <div className="mx-4 mt-6 flex flex-col items-center py-8 text-center">
            <Carrot size={26} color={MUTED} strokeWidth={1.5} />
            <p className="text-[12.5px] mt-2" style={{ color: MUTED }}>Henüz ürün eklemedin.<br/>İlk ürününü yukarıdan ekle.</p>
          </div>
        )}

        {urunler.length > 0 && (
          <div className="mx-4 mt-3">
            {!kaydetPaneliAcik ? (
              <button
                onClick={() => { setAlisverisAdi(bugununAdi()); setKaydetPaneliAcik(true); }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px]"
                style={{ background: "#fff", color: GREEN, fontWeight: 700, border: `1px solid ${GREEN}33` }}
              >
                <Save size={13} /> Alışverişi Bitir ve Kaydet
              </button>
            ) : (
              <div className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${GREEN}33` }}>
                <span className="text-[10.5px]" style={{ color: MUTED, fontWeight: 600 }}>Bu alışverişe bir isim ver</span>
                <input
                  value={alisverisAdi}
                  onChange={(e) => setAlisverisAdi(e.target.value)}
                  placeholder={bugununAdi()}
                  className="w-full text-[13px] py-2 px-3 rounded-lg outline-none mt-1"
                  style={{ background: BG, color: INK }}
                />
                <span className="text-[10.5px] mt-2 block" style={{ color: MUTED, fontWeight: 600 }}>Kategori</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tumKategoriler.map((k) => (
                    <button
                      key={k}
                      onClick={() => setAktifKategori(k)}
                      className="px-2.5 py-1 rounded-full text-[10.5px]"
                      style={{
                        background: aktifKategori === k ? GREEN : BG,
                        color: aktifKategori === k ? "#fff" : INK,
                        fontWeight: 700,
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <input
                  value={aktifKategori}
                  onChange={(e) => setAktifKategori(e.target.value)}
                  placeholder="ya da yeni bir kategori yaz"
                  className="w-full text-[11.5px] py-1.5 px-3 rounded-lg outline-none mt-1.5"
                  style={{ background: BG, color: INK }}
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setKaydetPaneliAcik(false)} className="flex-1 py-2 rounded-lg text-[11.5px]" style={{ background: BG, color: MUTED, fontWeight: 700 }}>
                    Vazgeç
                  </button>
                  <button onClick={alisverisiKaydet} className="flex-1 py-2 rounded-lg text-[11.5px]" style={{ background: GREEN, color: "#fff", fontWeight: 700 }}>
                    Kaydet ve Yeni Listeye Başla
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </>}

        {mod === "gecmis" && (
          <div className="mx-4">
            {fiyatKarsilastirma.length > 0 && (
              <div className="mb-4">
                <h2 className="text-[12.5px] mb-2 px-0.5" style={{ fontWeight: 800, color: INK }}>Fiyat Karşılaştırması</h2>
                <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.10)" }}>
                  {fiyatKarsilastirma.map((k, idx) => {
                    const arttiMi = k.fark > 0.005;
                    const azaldiMi = k.fark < -0.005;
                    const renk = arttiMi ? "#D14D3C" : azaldiMi ? GREEN : MUTED;
                    const acik = acikKarsilastirma === k.ad;
                    return (
                      <div key={k.ad + idx} style={{ borderBottom: idx !== fiyatKarsilastirma.length - 1 ? "1px solid #EEF0EC" : "none" }}>
                        <button
                          onClick={() => setAcikKarsilastirma(acik ? null : k.ad)}
                          className="w-full flex items-center justify-between px-4 py-2.5"
                        >
                          <div className="min-w-0 flex-1 text-left">
                            <div className="text-[12px] truncate" style={{ fontWeight: 700, color: INK }}>{k.ad}</div>
                            <div className="text-[10px]" style={{ color: MUTED }}>
                              ₺{paraFmt(k.onceki.birimFiyati)}{k.onceki.marketAdi ? ` (${k.onceki.marketAdi})` : ""} → ₺{paraFmt(k.sonraki.birimFiyati)}{k.sonraki.marketAdi ? ` (${k.sonraki.marketAdi})` : ""} <span>/{k.birim === "gram" ? "kg" : "adet"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center gap-1" style={{ color: renk }}>
                              {arttiMi ? <TrendingUp size={13} /> : azaldiMi ? <TrendingDown size={13} /> : <MinusFlat size={13} />}
                              <span className="text-[12px]" style={{ fontWeight: 800, fontFamily: "'IBM Plex Mono', monospace" }}>
                                {arttiMi ? "+" : ""}{paraFmt(k.yuzde)}%
                              </span>
                            </div>
                            <ChevronRight size={13} color={MUTED} style={{ transform: acik ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
                          </div>
                        </button>
                        {acik && (
                          <div className="px-4 pb-3">
                            <div className="text-[9px] mb-1.5" style={{ color: MUTED, fontWeight: 700 }}>TÜM GEÇMİŞ ({k.tumKayitlar.length} kayıt) — düzenlemek için birine dokun</div>
                            <div className="rounded-lg overflow-hidden" style={{ background: BG }}>
                              {k.tumKayitlar.map((kay, i) => (
                                <button
                                  key={i}
                                  onClick={() => kayittanDuzenlemeyeGit(kay)}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-left"
                                  style={{ borderBottom: i !== k.tumKayitlar.length - 1 ? "1px solid #E4E7E1" : "none", background: "none", border: "none", cursor: "pointer" }}
                                >
                                  <div className="min-w-0">
                                    <div className="text-[10.5px]" style={{ color: INK, fontWeight: 600 }}>
                                      {new Date(kay.tarih).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
                                    </div>
                                    <div className="text-[9px] truncate" style={{ color: MUTED }}>
                                      {kay.alisverisIsim}{kay.marketAdi ? ` · ${kay.marketAdi}` : ""}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[11px]" style={{ fontWeight: 700, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}>
                                      ₺{paraFmt(kay.birimFiyati)}/{kay.birim === "gram" ? "kg" : "adet"}
                                    </span>
                                    <Pencil size={11} color={GREEN} />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2 px-0.5">
              <h2 className="text-[12.5px]" style={{ fontWeight: 800, color: INK }}>Kayıtlı Alışverişler</h2>
              {gecmisAlisverisler.length > 1 && (
                <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${GREEN}33` }}>
                  <button
                    onClick={() => setArsivSiralamaTuru("tarih")}
                    className="px-2 py-1 text-[9.5px]"
                    style={{ background: arsivSiralamaTuru === "tarih" ? GREEN : "#fff", color: arsivSiralamaTuru === "tarih" ? "#fff" : GREEN, fontWeight: 700 }}
                  >
                    Tarihe Göre
                  </button>
                  <button
                    onClick={() => setArsivSiralamaTuru("az")}
                    className="px-2 py-1 text-[9.5px]"
                    style={{ background: arsivSiralamaTuru === "az" ? GREEN : "#fff", color: arsivSiralamaTuru === "az" ? "#fff" : GREEN, fontWeight: 700 }}
                  >
                    A-Z
                  </button>
                </div>
              )}
            </div>
            {gecmisAlisverisler.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <History size={26} color={MUTED} strokeWidth={1.5} />
                <p className="text-[12.5px] mt-2" style={{ color: MUTED }}>Henüz kaydedilmiş alışveriş yok.<br/>Liste sekmesinde "Alışverişi Bitir ve Kaydet" ile başla.</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.10)" }}>
                {gecmisAlisverislerSirali.map((a, idx) => {
                  const acik = acikAlisveris === a.id;
                  const trToplam = a.urunler.reduce((acc, u) => acc + u.satirToplami, 0);
                  return (
                    <div key={a.id} id={`arsiv-kayit-${a.id}`} style={{ borderBottom: idx !== gecmisAlisverislerSirali.length - 1 ? "1px solid #EEF0EC" : "none" }}>
                      <div className="w-full flex items-center justify-between px-4 py-3">
                        <button onClick={() => setAcikAlisveris(acik ? null : a.id)} className="text-left min-w-0 flex-1">
                          {arsivIsimDuzenle === a.id ? (
                            <input
                              autoFocus
                              defaultValue={a.isim}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => { arsivIsimGuncelle(a.id, e.target.value); setArsivIsimDuzenle(null); }}
                              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                              className="text-[12.5px] w-full outline-none rounded-lg px-2 py-1"
                              style={{ fontWeight: 700, color: INK, background: BG }}
                            />
                          ) : (
                            <div className="text-[12.5px] truncate" style={{ fontWeight: 700, color: INK }}>{a.isim}</div>
                          )}
                          <div className="text-[10px]" style={{ color: MUTED }}>
                            {a.urunler.length} kalem
                            {a.kategori && ` · ${a.kategori}`}
                          </div>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          {acik && arsivIsimDuzenle !== a.id && (
                            <button onClick={(e) => { e.stopPropagation(); setArsivIsimDuzenle(a.id); }} aria-label="İsmi düzenle">
                              <Pencil size={12} color={GREEN} />
                            </button>
                          )}
                          <span className="text-[13px]" style={{ fontWeight: 800, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(trToplam)}</span>
                          <button onClick={() => setAcikAlisveris(acik ? null : a.id)} aria-label="Aç/Kapat">
                            <ChevronRight size={14} color={MUTED} style={{ transform: acik ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
                          </button>
                        </div>
                      </div>
                      {acik && (
                        <div className="px-4 pb-3">
                          <div className="flex items-center gap-1.5 flex-wrap pb-2 mb-1" style={{ borderBottom: "1px solid #F3F4F1" }}>
                            <span className="text-[9px]" style={{ color: MUTED, fontWeight: 600 }}>KATEGORİ:</span>
                            {["Tümü", ...tumKategoriler].filter((k) => k !== "Tümü").map((k) => (
                              <button
                                key={k}
                                onClick={() => arsivKategoriGuncelle(a.id, k)}
                                className="px-2 py-0.5 rounded-full text-[9.5px]"
                                style={{ background: (a.kategori || "Market") === k ? GREEN : BG, color: (a.kategori || "Market") === k ? "#fff" : INK, fontWeight: 700 }}
                              >
                                {k}
                              </button>
                            ))}
                          </div>
                          {(() => {
                            const buAlisverisBaska = {};
                            a.urunler.forEach((u) => {
                              if ((u.baskasiAdet || 0) > 0) {
                                const kisi = (u.kimIcin || "").trim() || "İsim belirtilmedi";
                                if (!buAlisverisBaska[kisi]) buAlisverisBaska[kisi] = 0;
                                buAlisverisBaska[kisi] += u.fiyat * u.baskasiAdet;
                              }
                            });
                            const girdiler = Object.entries(buAlisverisBaska);
                            if (girdiler.length === 0) return null;
                            return (
                              <div className="rounded-lg p-2 mb-2" style={{ background: `${PURPLE}0A` }}>
                                <div className="text-[9px] mb-1" style={{ color: PURPLE, fontWeight: 700 }}>BU ALIŞVERİŞTE BAŞKASI İÇİN</div>
                                {girdiler.map(([kisi, tutar]) => (
                                  <div key={kisi} className="flex items-center justify-between">
                                    <span className="text-[10.5px]" style={{ color: INK }}>{kisi}</span>
                                    <span className="text-[10.5px]" style={{ color: PURPLE, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(tutar)}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px]" style={{ color: MUTED, fontWeight: 600 }}>ÜRÜNLER</span>
                            <button
                              onClick={() => setIcerikSiralamaAZ((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px]"
                              style={{ background: icerikSiralamaAZ[a.id] ? GREEN : BG, color: icerikSiralamaAZ[a.id] ? "#fff" : GREEN, fontWeight: 700 }}
                            >
                              <ArrowDownAZ size={10} /> A-Z
                            </button>
                          </div>
                          {(icerikSiralamaAZ[a.id] ? [...a.urunler].sort((x, y) => x.ad.localeCompare(y.ad, "tr")) : a.urunler).map((u) => {
                            const dzn = arsivDraft && arsivDraft.arsivId === a.id && arsivDraft.urunId === u.id;
                            return (
                              <div key={u.id} className="py-1.5" style={{ borderTop: "1px solid #F3F4F1" }}>
                                {dzn ? (
                                  <div className="rounded-xl p-2.5 my-1" style={{ background: `${CORAL}0C` }}>
                                    <input
                                      value={arsivDraft.ad}
                                      onChange={(e) => setArsivDraft((p) => ({ ...p, ad: e.target.value }))}
                                      placeholder="Ürün adı"
                                      className="w-full text-[12px] mb-1.5 px-2 py-1.5 rounded-lg outline-none"
                                      style={{ background: "#fff", color: INK, fontWeight: 700 }}
                                    />
                                    <div className="flex items-center gap-1.5">
                                      <select
                                        value={arsivDraft.birim}
                                        onChange={(e) => setArsivDraft((p) => ({ ...p, birim: e.target.value }))}
                                        className="text-[10px] rounded-lg px-1.5 py-1.5 outline-none"
                                        style={{ background: "#fff", color: INK }}
                                      >
                                        <option value="gram">gram</option>
                                        <option value="adet">adet</option>
                                      </select>
                                      <input
                                        value={arsivDraft.fiyat}
                                        onChange={(e) => setArsivDraft((p) => ({ ...p, fiyat: e.target.value }))}
                                        placeholder="fiyat"
                                        inputMode="decimal"
                                        className="w-16 text-[11px] rounded-lg px-1.5 py-1.5 outline-none"
                                        style={{ background: "#fff", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                      />
                                      <input
                                        value={arsivDraft.miktar}
                                        onChange={(e) => setArsivDraft((p) => ({ ...p, miktar: e.target.value }))}
                                        placeholder={arsivDraft.birim === "gram" ? "gram" : "miktar"}
                                        inputMode="decimal"
                                        className="w-16 text-[11px] rounded-lg px-1.5 py-1.5 outline-none"
                                        style={{ background: "#fff", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                      />
                                      <input
                                        value={arsivDraft.kacTane}
                                        onChange={(e) => setArsivDraft((p) => ({ ...p, kacTane: e.target.value.replace(/[^0-9]/g, "") || 1 }))}
                                        placeholder="kaç tane"
                                        inputMode="numeric"
                                        className="w-12 text-[11px] rounded-lg px-1.5 py-1.5 outline-none"
                                        style={{ background: "#fff", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                      />
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                      <span className="text-[10px] shrink-0" style={{ color: MUTED }}>Başkası için:</span>
                                      <button
                                        onClick={() => setArsivDraft((p) => ({ ...p, baskasiAdet: Math.max(0, (Number(p.baskasiAdet) || 0) - 1) }))}
                                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: "#fff", color: INK }}
                                      >
                                        <Minus size={10} />
                                      </button>
                                      <span className="text-[11px] w-4 text-center shrink-0" style={{ fontWeight: 700, color: PURPLE, fontFamily: "'IBM Plex Mono', monospace" }}>
                                        {arsivDraft.baskasiAdet || 0}
                                      </span>
                                      <button
                                        onClick={() => setArsivDraft((p) => ({ ...p, baskasiAdet: Math.min(Number(p.kacTane) || 1, (Number(p.baskasiAdet) || 0) + 1) }))}
                                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: PURPLE, color: "#fff" }}
                                      >
                                        <Plus size={10} />
                                      </button>
                                      {arsivDraft.baskasiAdet > 0 && (
                                        <input
                                          value={arsivDraft.kimIcin}
                                          onChange={(e) => setArsivDraft((p) => ({ ...p, kimIcin: e.target.value }))}
                                          placeholder="kimin için?"
                                          className="flex-1 min-w-0 text-[10.5px] rounded-lg px-2 py-1 outline-none"
                                          style={{ background: "#fff", color: PURPLE }}
                                        />
                                      )}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <button onClick={arsivDraftIptal} className="flex-1 py-1.5 rounded-lg text-[11px]" style={{ background: "#fff", color: MUTED, fontWeight: 700 }}>Vazgeç</button>
                                      <button onClick={arsivDraftKaydet} className="flex-1 py-1.5 rounded-lg text-[11px]" style={{ background: CORAL, color: "#fff", fontWeight: 700 }}>Kaydet</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 pr-2">
                                      <div className="text-[11px] truncate flex items-center gap-1" style={{ color: u.baskasiAdet > 0 ? PURPLE : INK, fontWeight: 600 }}>
                                        {u.ad}
                                        {u.baskasiAdet > 0 && (
                                          <span className="text-[8.5px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${PURPLE}18`, color: PURPLE, fontWeight: 700 }}>
                                            {u.kimIcin ? `${u.kimIcin} için` : "başkası için"}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[9.5px]" style={{ color: MUTED }}>
                                        {u.birim === "gram"
                                          ? `${miktarFmt(u.miktar)} g · ₺${paraFmt(u.birimFiyati)}/kg`
                                          : `${miktarFmt(u.miktar)} adet/koli · ₺${paraFmt(u.birimFiyati)}/adet`}
                                        {u.marketAdi ? ` · ${u.marketAdi}` : ""}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                      <span className="text-[10.5px]" style={{ color: MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(u.satirToplami)}</span>
                                      <button onClick={() => arsivDuzenlemeyeBasla(a.id, u)} aria-label="Düzenle"><Pencil size={11} color={GREEN} /></button>
                                      <button onClick={() => arsivUrunSil(a.id, u.id)} aria-label="Sil"><Trash2 size={12} color={MUTED} /></button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {arsivDraft && arsivDraft.arsivId === a.id && arsivDraft.urunId === null ? (
                            <div className="rounded-xl p-2.5 my-1" style={{ background: `${GREEN}0C` }}>
                              <input
                                autoFocus
                                value={arsivDraft.ad}
                                onChange={(e) => setArsivDraft((p) => ({ ...p, ad: e.target.value }))}
                                placeholder="Ürün adı"
                                className="w-full text-[12px] mb-1.5 px-2 py-1.5 rounded-lg outline-none"
                                style={{ background: "#fff", color: INK, fontWeight: 700 }}
                              />
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={arsivDraft.birim}
                                  onChange={(e) => setArsivDraft((p) => ({ ...p, birim: e.target.value }))}
                                  className="text-[10px] rounded-lg px-1.5 py-1.5 outline-none"
                                  style={{ background: "#fff", color: INK }}
                                >
                                  <option value="gram">gram</option>
                                  <option value="adet">adet</option>
                                </select>
                                <input
                                  value={arsivDraft.fiyat}
                                  onChange={(e) => setArsivDraft((p) => ({ ...p, fiyat: e.target.value }))}
                                  placeholder="fiyat"
                                  inputMode="decimal"
                                  className="w-16 text-[11px] rounded-lg px-1.5 py-1.5 outline-none"
                                  style={{ background: "#fff", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                />
                                <input
                                  value={arsivDraft.miktar}
                                  onChange={(e) => setArsivDraft((p) => ({ ...p, miktar: e.target.value }))}
                                  placeholder={arsivDraft.birim === "gram" ? "gram" : "miktar"}
                                  inputMode="decimal"
                                  className="w-16 text-[11px] rounded-lg px-1.5 py-1.5 outline-none"
                                  style={{ background: "#fff", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                />
                                <input
                                  value={arsivDraft.kacTane}
                                  onChange={(e) => setArsivDraft((p) => ({ ...p, kacTane: e.target.value.replace(/[^0-9]/g, "") || 1 }))}
                                  placeholder="kaç tane"
                                  inputMode="numeric"
                                  className="w-12 text-[11px] rounded-lg px-1.5 py-1.5 outline-none"
                                  style={{ background: "#fff", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                />
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] shrink-0" style={{ color: MUTED }}>Başkası için:</span>
                                <button
                                  onClick={() => setArsivDraft((p) => ({ ...p, baskasiAdet: Math.max(0, (Number(p.baskasiAdet) || 0) - 1) }))}
                                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                  style={{ background: "#fff", color: INK }}
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-[11px] w-4 text-center shrink-0" style={{ fontWeight: 700, color: PURPLE, fontFamily: "'IBM Plex Mono', monospace" }}>
                                  {arsivDraft.baskasiAdet || 0}
                                </span>
                                <button
                                  onClick={() => setArsivDraft((p) => ({ ...p, baskasiAdet: Math.min(Number(p.kacTane) || 1, (Number(p.baskasiAdet) || 0) + 1) }))}
                                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                  style={{ background: PURPLE, color: "#fff" }}
                                >
                                  <Plus size={10} />
                                </button>
                                {arsivDraft.baskasiAdet > 0 && (
                                  <input
                                    value={arsivDraft.kimIcin}
                                    onChange={(e) => setArsivDraft((p) => ({ ...p, kimIcin: e.target.value }))}
                                    placeholder="kimin için?"
                                    className="flex-1 min-w-0 text-[10.5px] rounded-lg px-2 py-1 outline-none"
                                    style={{ background: "#fff", color: PURPLE }}
                                  />
                                )}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button onClick={arsivDraftIptal} className="flex-1 py-1.5 rounded-lg text-[11px]" style={{ background: "#fff", color: MUTED, fontWeight: 700 }}>Vazgeç</button>
                                <button onClick={arsivDraftKaydet} className="flex-1 py-1.5 rounded-lg text-[11px]" style={{ background: GREEN, color: "#fff", fontWeight: 700 }}>Listeye Ekle</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => arsivYeniUrunBaslat(a.id)}
                              className="w-full flex items-center justify-center gap-1 py-2 mt-1.5 rounded-lg text-[11px]"
                              style={{ background: `${GREEN}0F`, color: GREEN, fontWeight: 700 }}
                            >
                              <Plus size={12} /> Bu Alışverişe Ürün Ekle
                            </button>
                          )}

                          <button onClick={() => alisverisiSil(a.id)} className="text-[10px] mt-2" style={{ color: "#D14D3C", fontWeight: 600 }}>
                            Bu kaydı tamamen sil
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {mod === "puan" && (
          <div className="mx-4">
            {/* Bu ayki gerçek alışverişlere göre sonuç */}
            {kkSonuclar.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <h2 className="text-[12.5px]" style={{ fontWeight: 800, color: INK }}>Bu Ay Kazanacağın Puan</h2>
                  <span className="text-[9.5px]" style={{ color: MUTED }}>{ayIslemleri.length} alışveriş</span>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.10)" }}>
                  {kkSonuclar.map((k, idx) => (
                    <div key={k.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: idx !== kkSonuclar.length - 1 ? "1px solid #EEF0EC" : "none", background: idx === 0 && k.kazanilan > 0 ? `${GREEN}0A` : "transparent" }}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[12.5px] truncate" style={{ fontWeight: 700, color: INK }}>{k.banka}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${PURPLE}18`, color: PURPLE, fontWeight: 700 }}>{k.kanal}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${GREEN}18`, color: GREEN, fontWeight: 700 }}>{k.kategori || "Tümü"}</span>
                          {idx === 0 && k.kazanilan > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${GREEN}18`, color: GREEN, fontWeight: 700 }}>en iyi</span>
                          )}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: MUTED }}>
                          {kuralTipiBul(k.kural).ad} · Her ₺{paraFmt(k.esik)}'ye ₺{paraFmt(k.puan)} {k.tavan ? `· tavan ₺${paraFmt(k.tavan)}` : ""}
                          {k.tavanaTakildi && " · tavana takıldı"}
                        </div>
                      </div>
                      <span className="text-[15px] shrink-0" style={{ fontWeight: 800, color: k.kazanilan > 0 ? GREEN : MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(k.kazanilan)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9.5px] mt-1.5 px-1" style={{ color: MUTED }}>
                  Bu ay kaydettiğin alışverişler + şu an açık olan liste kullanılıyor. Her kampanyanın kuralına göre (gün içi toplam / her çekim / günde ilk) ayrı ayrı hesaplanıyor.
                </p>
              </div>
            )}

            {/* Tek işlem simülatörü */}
            <details className="mb-4">
              <summary className="text-[11px] px-0.5" style={{ color: GREEN, fontWeight: 700, cursor: "pointer" }}>Tek işlem dene (hızlı simülasyon)</summary>
              <div className="rounded-2xl p-4 mt-2" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.12)" }}>
                <label className="text-[10px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>DENENECEK TUTAR (₺)</label>
                <input
                  value={kkHesapTutari}
                  onChange={(e) => setKkHesapTutari(e.target.value)}
                  placeholder={`Boş bırakırsan şu anki liste toplamı: ₺${paraFmt(toplam)}`}
                  inputMode="decimal"
                  className="w-full text-[15px] py-2 px-3 rounded-xl outline-none mt-1"
                  style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                />
                {kkSimulasyon.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {kkSimulasyon.map((k) => (
                      <div key={k.id} className="flex items-center justify-between">
                        <span className="text-[11px]" style={{ color: INK }}>{k.banka} <span style={{ color: MUTED }}>({k.kanal})</span></span>
                        <span className="text-[12px]" style={{ fontWeight: 700, color: k.kazanilan > 0 ? GREEN : MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(k.kazanilan)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[9px] mt-2" style={{ color: MUTED }}>Bu, tek bir alışverişte bu tutarı harcarsan ne kazanacağını gösterir — "günde ilk" kuralında tutar eşiği geçiyorsa tek seferlik puanı, diğerlerinde eşik başına puanı gösterir.</p>
              </div>
            </details>

            {/* Kampanya ekleme formu */}
            <h2 className="text-[12.5px] mb-2 px-0.5" style={{ fontWeight: 800, color: INK }}>
              {kkDuzenleId ? "Kampanyayı Düzenle" : "Yeni Kampanya Ekle"}
            </h2>
            <div className="rounded-2xl p-4 mb-4" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.12)" }}>
              <input
                value={kkBanka}
                onChange={(e) => setKkBanka(e.target.value)}
                placeholder="Banka adı (örn. Vakıfbank)"
                className="w-full text-[13px] py-2 px-3 rounded-xl outline-none mb-2"
                style={{ background: BG, color: INK }}
              />
              <div className="flex gap-1.5 mb-2">
                {["Fiziki", "QR", "NFC"].map((k) => (
                  <button
                    key={k}
                    onClick={() => setKkKanal(k)}
                    className="flex-1 py-1.5 rounded-lg text-[11px]"
                    style={{ background: kkKanal === k ? PURPLE : BG, color: kkKanal === k ? "#fff" : INK, fontWeight: 700 }}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <label className="text-[9px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>KATEGORİ (hangi tür alışverişte geçerli)</label>
              <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                {["Tümü", ...tumKategoriler].map((k) => (
                  <button
                    key={k}
                    onClick={() => setKkKategori(k)}
                    className="px-2.5 py-1 rounded-full text-[10.5px]"
                    style={{ background: kkKategori === k ? PURPLE : BG, color: kkKategori === k ? "#fff" : INK, fontWeight: 700 }}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <input
                value={kkKategori}
                onChange={(e) => setKkKategori(e.target.value)}
                placeholder="ya da yeni bir kategori yaz"
                className="w-full text-[11px] py-1.5 px-3 rounded-lg outline-none mb-2"
                style={{ background: BG, color: INK }}
              />
              <div className="flex items-center justify-between pl-1 mb-1">
                <label className="text-[9px]" style={{ color: MUTED, fontWeight: 600 }}>KOŞUL TİPİ</label>
                <button onClick={() => setKtAcik((v) => !v)} className="flex items-center gap-1 text-[9.5px]" style={{ color: GREEN, fontWeight: 700 }}>
                  <Layers size={10} /> {ktAcik ? "gizle" : "yönet"}
                </button>
              </div>
              <div className="space-y-1.5 mb-2">
                {kuralTipleri.map((kt) => {
                  const y = YONTEM_SECENEKLERI.find((y) => y.yontem === kt.yontem) || YONTEM_SECENEKLERI[1];
                  return (
                    <button
                      key={kt.id}
                      onClick={() => setKkKural(kt.id)}
                      className="w-full text-left rounded-lg px-2.5 py-1.5"
                      style={{ background: kkKural === kt.id ? `${PURPLE}12` : BG, border: kkKural === kt.id ? `1px solid ${PURPLE}55` : "1px solid transparent" }}
                    >
                      <div className="text-[11px]" style={{ fontWeight: 700, color: kkKural === kt.id ? PURPLE : INK }}>{kt.ad}</div>
                      <div className="text-[9.5px]" style={{ color: MUTED }}>{y.aciklama}</div>
                    </button>
                  );
                })}
              </div>

              {ktAcik && (
                <div className="rounded-xl p-3 mb-2" style={{ background: `${GREEN}0A`, border: `1px solid ${GREEN}30` }}>
                  <div className="text-[10.5px] mb-2" style={{ fontWeight: 700, color: INK }}>
                    {ktDuzenleId ? "Koşul Tipini Düzenle" : "Yeni Koşul Tipi Ekle"}
                  </div>
                  <input
                    value={ktAd}
                    onChange={(e) => setKtAd(e.target.value)}
                    placeholder="Ad (örn. Haftalık Toplam)"
                    className="w-full text-[12px] py-1.5 px-2.5 rounded-lg outline-none mb-1.5"
                    style={{ background: "#fff", color: INK }}
                  />
                  <label className="text-[9px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>HANGİ HESAPLAMA YÖNTEMİYLE ÇALIŞSIN?</label>
                  <div className="space-y-1 mt-1 mb-2">
                    {YONTEM_SECENEKLERI.map((y) => (
                      <button
                        key={y.yontem}
                        onClick={() => setKtYontem(y.yontem)}
                        className="w-full text-left rounded-lg px-2 py-1"
                        style={{ background: ktYontem === y.yontem ? "#fff" : "transparent", border: `1px solid ${ktYontem === y.yontem ? GREEN : "transparent"}` }}
                      >
                        <div className="text-[10.5px]" style={{ fontWeight: 700, color: ktYontem === y.yontem ? GREEN : INK }}>{y.ad}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {ktDuzenleId && (
                      <button onClick={ktFormTemizle} className="flex-1 py-1.5 rounded-lg text-[10.5px]" style={{ background: "#fff", color: MUTED, fontWeight: 700 }}>Vazgeç</button>
                    )}
                    <button onClick={ktKaydet} disabled={!ktAd.trim()} className="flex-1 py-1.5 rounded-lg text-[10.5px]" style={{ background: ktAd.trim() ? GREEN : "#D8DCD8", color: "#fff", fontWeight: 700 }}>
                      {ktDuzenleId ? "Kaydet" : "+ Ekle"}
                    </button>
                  </div>

                  {kuralTipleri.length > 0 && (
                    <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px dashed ${GREEN}30` }}>
                      {kuralTipleri.map((kt) => (
                        <div key={kt.id} className="flex items-center justify-between py-1">
                          <span className="text-[10.5px]" style={{ color: INK }}>{kt.ad}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => ktDuzenle(kt)} aria-label="Düzenle"><Pencil size={11} color={GREEN} /></button>
                            <button onClick={() => ktSil(kt.id)} aria-label="Sil"><Trash2 size={12} color={MUTED} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>EŞİK (₺)</label>
                  <input
                    value={kkEsik}
                    onChange={(e) => setKkEsik(e.target.value)}
                    placeholder="750"
                    inputMode="decimal"
                    className="w-full text-[12px] py-1.5 px-2 rounded-lg outline-none mt-0.5"
                    style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                </div>
                <div>
                  <label className="text-[9px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>PUAN (₺)</label>
                  <input
                    value={kkPuan}
                    onChange={(e) => setKkPuan(e.target.value)}
                    placeholder="25"
                    inputMode="decimal"
                    className="w-full text-[12px] py-1.5 px-2 rounded-lg outline-none mt-0.5"
                    style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                </div>
                <div>
                  <label className="text-[9px] pl-1" style={{ color: MUTED, fontWeight: 600 }}>TAVAN (₺)</label>
                  <input
                    value={kkTavan}
                    onChange={(e) => setKkTavan(e.target.value)}
                    placeholder="250"
                    inputMode="decimal"
                    className="w-full text-[12px] py-1.5 px-2 rounded-lg outline-none mt-0.5"
                    style={{ background: BG, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {kkDuzenleId && (
                  <button onClick={kkFormTemizle} className="flex-1 py-2.5 rounded-xl text-[12px]" style={{ background: BG, color: MUTED, fontWeight: 700 }}>Vazgeç</button>
                )}
                <button
                  onClick={kkKaydet}
                  disabled={!kkBanka.trim() || !kkEsik || !kkPuan}
                  className="flex-1 py-2.5 rounded-xl text-[12px]"
                  style={{ background: kkBanka.trim() && kkEsik && kkPuan ? PURPLE : "#D8DCD8", color: "#fff", fontWeight: 700 }}
                >
                  {kkDuzenleId ? "Kaydet" : "+ Kampanya Ekle"}
                </button>
              </div>
            </div>

            {/* Kayıtlı kampanyalar */}
            {kartKampanyalari.length > 0 ? (
              <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "#fff", boxShadow: "0 8px 24px -8px rgba(22,36,28,0.10)" }}>
                {kartKampanyalari.map((k, idx) => (
                  <div key={k.id} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: idx !== kartKampanyalari.length - 1 ? "1px solid #EEF0EC" : "none" }}>
                    <div className="min-w-0">
                      <div className="text-[12px] truncate flex items-center gap-1.5" style={{ fontWeight: 700, color: INK }}>
                        {k.banka}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${PURPLE}18`, color: PURPLE, fontWeight: 700 }}>{k.kanal}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${GREEN}18`, color: GREEN, fontWeight: 700 }}>{k.kategori || "Tümü"}</span>
                      </div>
                      <div className="text-[10px]" style={{ color: MUTED }}>
                        ₺{paraFmt(k.esik)} → ₺{paraFmt(k.puan)} {k.tavan ? `(tavan ₺${paraFmt(k.tavan)})` : "(tavansız)"} · {kuralTipiBul(k.kural).ad}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => kkDuzenle(k)} aria-label="Düzenle"><Pencil size={13} color={GREEN} /></button>
                      <button onClick={() => kkSil(k.id)} aria-label="Sil"><Trash2 size={14} color={INK} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 mb-4" style={{ color: MUTED }}>
                <p className="text-[12px]">Henüz kampanya eklemedin.<br />Ay başında bankaların o ayki kampanyalarını buraya gir.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky total bar */}
      {mod === "liste" && urunler.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-sm px-5 py-4" style={{ background: INK }}>
            {toplamBaskasi > 0 && (
              <div className="flex items-center justify-between mb-2 pb-2" style={{ borderBottom: "1px solid #ffffff1F" }}>
                <div className="flex items-center gap-1.5">
                  <User size={12} color={PURPLE} />
                  <span className="text-[11px]" style={{ color: "#ffffffb0", fontWeight: 600 }}>
                    Başkası için ({baskasiBirimSayisi} adet)
                  </span>
                </div>
                <span className="text-[13px]" style={{ fontWeight: 700, color: PURPLE, fontFamily: "'IBM Plex Mono', monospace" }}>
                  ₺{paraFmt(toplamBaskasi)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-wide" style={{ color: "#ffffff80", fontWeight: 600 }}>TOPLAM · {urunler.length} kalem</div>
                <div className="text-[24px] leading-tight" style={{ fontWeight: 800, color: "#fff", fontFamily: "'IBM Plex Mono', monospace" }}>₺{paraFmt(toplam)}</div>
                {toplamBaskasi > 0 && (
                  <div className="text-[10px] mt-0.5" style={{ color: "#ffffff70" }}>
                    Kendim: ₺{paraFmt(toplam - toplamBaskasi)}
                  </div>
                )}
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: CORAL }}>
                <ShoppingBasket size={16} color="#fff" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const kokEleman = document.getElementById("kok");
const kok = ReactDOM.createRoot(kokEleman);
kok.render(<MarketListem />);
