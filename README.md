# Market Listem — PWA

Bu klasör, elindeki React bileşenini (`market-listem_04_08_2026.jsx`) telefona/ana ekrana
kurulabilen bağımsız bir PWA (Progressive Web App) haline getirir.

## İçerik
- `index.html` — uygulamayı açan ana sayfa (React, Tailwind ve Babel'i CDN'den yükler)
- `app.jsx` — orijinal uygulama kodu (import/export ifadeleri kaldırıldı, tarayıcıda çalışacak hale getirildi)
- `icons.jsx` — lucide-react yerine geçen, dış pakete ihtiyaç duymayan SVG ikon seti
- `storage-polyfill.js` — artifact ortamındaki `window.storage` API'sini `localStorage` üzerinde yeniden oluşturur (verilerin cihazda kalıcı saklanmasını sağlar)
- `manifest.json` — uygulama adı, ikonlar, tema rengi vb.
- `sw.js` — service worker (offline çalışma ve "ana ekrana ekle" desteği için)
- `icons/` — 192px, 512px ve maskable ikon

## Nasıl yayınlanır / kurulur?

PWA olarak "ana ekrana ekle" ve offline özelliklerinin çalışması için dosyaların
**bir web sunucusundan** (HTTPS veya localhost) servis edilmesi gerekir —
`index.html`'i doğrudan çift tıklayıp `file://` olarak açmak service worker'ı
ve bazı tarayıcı güvenlik kurallarını devre dışı bırakır.

En kolay ücretsiz yollardan biri:

1. Bu `pwa` klasörünü bir GitHub deposuna yükleyin, ardından
   **Settings → Pages** üzerinden GitHub Pages'i açın (klasörü kök olarak seçin).
2. Ya da [Netlify Drop](https://app.netlify.com/drop) sayfasına bu klasörü sürükleyip bırakın —
   saniyeler içinde bir HTTPS adresi verir.
3. Ya da kendi bilgisayarınızda test etmek için, bu klasörün içindeyken:
   ```
   npx serve .
   ```
   komutunu çalıştırıp açılan `http://localhost` adresine gidin.

Adresi telefonunuzda (Chrome/Safari) açtıktan sonra tarayıcı menüsünden
**"Ana ekrana ekle" / "Add to Home Screen"** seçeneğini kullanarak uygulamayı
normal bir uygulama gibi ana ekrana kurabilirsiniz.

## Veriler nerede saklanıyor?
Orijinal artifact sürümünde veriler Claude'un bulut depolamasında (`window.storage`)
tutuluyordu. Bu bağımsız PWA sürümünde ise aynı fonksiyonlar `localStorage` üzerine
yönlendirildi — yani veriler **sadece o cihazdaki o tarayıcıda/uygulamada** saklanır,
cihazlar arasında otomatik senkronize olmaz. "Yedekle / geri yükle" panelindeki
dışa/içe aktar metniyle verileri elle taşıyabilir, ya da aşağıdaki Google Drive
senkronunu kurabilirsiniz.

## Cihazlar arası senkron (Google Drive) — isteğe bağlı

Uygulama içindeki "Yedekle / geri yükle" panelinin altında bir **Google Drive
senkronu** bölümü var. Bunu kullanmak, verilerini sadece bu uygulamanın görebildiği
gizli bir Drive dosyasına ("Uygulama Verisi" alanı — normal Drive dosyalarınıza
erişemez) yükleyip başka bir cihazdan geri indirmenizi sağlar. Çalışması için
**kendi Google OAuth Client ID'nizi** oluşturup uygulamaya girmeniz gerekiyor
(ücretsizdir, tek seferlik ~5 dakikalık bir kurulum):

1. https://console.cloud.google.com adresine gidip yeni bir proje oluşturun.
2. **APIs & Services → Enabled APIs** kısmından **Google Drive API**'yi etkinleştirin.
3. **APIs & Services → OAuth consent screen**'i "External" olarak yapılandırın,
   uygulama adı vb. temel bilgileri girip kaydedin (yayına almanıza gerek yok,
   "Test users" olarak kendi Gmail adresinizi ekleyebilirsiniz).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   seçin, uygulama türü olarak **Web application**'ı seçin.
5. **Authorized JavaScript origins** kısmına, bu PWA'yı hangi adresten
   yayınladıysanız onu ekleyin (örn. `https://sizin-siteniz.netlify.app`).
   `http://localhost:3000` gibi test adreslerini de ekleyebilirsiniz.
6. Oluşan **Client ID**'yi kopyalayıp uygulamadaki ilgili kutuya yapıştırın ve
   "Google ile Bağlan"a dokunun.

Not: Uygulamanızı Google'a "doğrulatmadığınız" sürece girişte "Bu uygulama
doğrulanmadı" uyarısı görebilirsiniz — bu normaldir, sadece kendi hesabınızla
kullandığınız için "Advanced → Devam Et" diyerek geçebilirsiniz.
