/**
 * Halaman Layanan Surat Online
 */
function renderLayanan(container) {
  container.innerHTML = `
    <!-- Page Hero -->
    <section class="section" style="background:linear-gradient(135deg,var(--green-50),var(--slate-50));padding-bottom:var(--space-2xl)">
      <div class="container">
        <div class="section-header fade-in" style="margin-bottom:0">
          <h2>Layanan Surat Online</h2>
          <p>Urus surat keterangan desa dari mana saja, kapan saja dengan mudah dan cepat.</p>
          <span class="accent-line"></span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        
        <!-- Cara Pengajuan (Steps) -->
        <div class="steps fade-in" style="margin-bottom:var(--space-4xl)">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-title">Isi Formulir</div>
            <div class="step-desc">Lengkapi data diri dan pilih jenis surat yang dibutuhkan.</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-title">Tunggu Diproses</div>
            <div class="step-desc">Perangkat desa akan memverifikasi dan memproses surat Anda.</div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-title">Ambil di Kantor</div>
            <div class="step-desc">Setelah status selesai, ambil surat fisik di Kantor Desa.</div>
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:var(--space-2xl)">
          
          <!-- Form Pengajuan -->
          <div class="card fade-in" style="flex:1;min-width:320px;padding:var(--space-2xl)" id="form-surat-container">
            <h3 style="margin-bottom:var(--space-xl);font-size:1.3rem;display:flex;align-items:center;gap:12px">
              <i data-lucide="file-edit" style="color:var(--color-primary)"></i>
              Formulir Pengajuan Surat
            </h3>
            
            <form id="form-pengajuan-surat">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nama Lengkap <span class="required">*</span></label>
                  <input type="text" class="form-input" name="nama" required placeholder="Sesuai KTP">
                </div>
                <div class="form-group">
                  <label class="form-label">Nomor Induk Kependudukan (NIK) <span class="required">*</span></label>
                  <input type="text" class="form-input" name="nik" required pattern="[0-9]{16}" placeholder="16 digit angka NIK">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nomor Kartu Keluarga (KK) <span class="required">*</span></label>
                  <input type="text" class="form-input" name="no_kk" required pattern="[0-9]{16}" placeholder="16 digit angka KK">
                </div>
                <div class="form-group">
                  <label class="form-label">Nomor WhatsApp <span class="required">*</span></label>
                  <input type="tel" class="form-input" name="no_wa" required placeholder="Contoh: 08123456789">
                  <div class="form-hint">Digunakan untuk informasi status surat.</div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Jenis Surat <span class="required">*</span></label>
                <select class="form-select" name="jenis_surat" required>
                  <option value="" disabled selected>-- Pilih Jenis Surat --</option>
                  <option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
                  <option value="Surat Keterangan Usaha (SKU)">Surat Keterangan Usaha (SKU)</option>
                  <option value="Surat Pengantar KTP/KK">Surat Pengantar KTP/KK</option>
                  <option value="Surat Keterangan Tidak Mampu (SKTM)">Surat Keterangan Tidak Mampu (SKTM)</option>
                  <option value="Lainnya">Lainnya...</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Keperluan / Alasan <span class="required">*</span></label>
                <textarea class="form-textarea" name="keperluan" required placeholder="Jelaskan secara singkat keperluan Anda membuat surat ini..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Upload Dokumen Pendukung (Opsional)</label>
                <label class="form-file-upload">
                  <input type="file" name="dokumen" accept=".jpg,.jpeg,.png,.pdf">
                  <i data-lucide="upload-cloud" class="upload-icon" style="width:32px;height:32px"></i>
                  <span class="upload-text">Klik atau seret file ke sini</span>
                  <span class="upload-hint">Foto KTP / KK (Maks. 5MB, format JPG/PNG/PDF)</span>
                </label>
                <div id="file-name-display" style="margin-top:8px;font-size:.85rem;color:var(--color-primary);font-weight:600"></div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg w-full mt-lg" id="btn-submit-surat">
                <i data-lucide="send"></i> Kirim Pengajuan
              </button>
            </form>
          </div>

          <!-- Cek Status Box -->
          <div style="flex:0 0 340px;display:flex;flex-direction:column;gap:var(--space-lg)">
            <div class="card fade-in fade-in-delay-1" style="padding:var(--space-xl);background:var(--slate-50)">
              <h3 style="margin-bottom:var(--space-md);font-size:1.15rem;display:flex;align-items:center;gap:10px">
                <i data-lucide="search" style="color:var(--color-primary)"></i>
                Cek Status Surat
              </h3>
              <p style="font-size:.9rem;color:var(--color-text-sec);margin-bottom:var(--space-lg)">
                Masukkan nomor referensi yang Anda dapatkan saat mengajukan surat.
              </p>
              <form id="form-cek-status">
                <div class="form-group">
                  <input type="text" class="form-input" id="input-ref" required placeholder="Contoh: SKR-260717-1234">
                </div>
                <button type="submit" class="btn btn-outline-green w-full">Cek Status</button>
              </form>
              <div id="status-result-container" style="margin-top:var(--space-lg);display:none"></div>
            </div>
            
            <div class="card fade-in fade-in-delay-2" style="padding:var(--space-xl);background:var(--color-primary-bg);border-color:var(--green-100)">
              <h4 style="color:var(--color-primary);font-size:1rem;margin-bottom:var(--space-sm)">Butuh Bantuan?</h4>
              <p style="font-size:.85rem;color:var(--color-text-sec);margin-bottom:var(--space-md)">
                Jika mengalami kesulitan dalam pengisian formulir, silakan hubungi admin pelayanan desa.
              </p>
              <a href="#/kontak" class="btn btn-white btn-sm w-full">Hubungi Admin</a>
            </div>
          </div>

        </div>
      </div>
    </section>
  `;

  if (window.lucide) lucide.createIcons();

  // File upload UI logic
  const fileInput = container.querySelector('input[type="file"]');
  const fileDisplay = container.querySelector('#file-name-display');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        fileDisplay.textContent = `File terpilih: ${e.target.files[0].name}`;
      } else {
        fileDisplay.textContent = '';
      }
    });
  }

  // Handle Form Submit
  const formPengajuan = document.getElementById('form-pengajuan-surat');
  if (formPengajuan) {
    formPengajuan.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-surat');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="loader-spinner"></i> Mengirim...';
      if (window.lucide) lucide.createIcons();

      try {
        const formData = new FormData(formPengajuan);
        const data = await apiCall('/api/surat', {
          method: 'POST',
          body: formData
        });
        
        // Show success result
        document.getElementById('form-surat-container').innerHTML = `
          <div class="result-box fade-in visible">
            <div class="result-icon"><i data-lucide="check" style="width:36px;height:36px"></i></div>
            <h3>Pengajuan Berhasil Dikirim!</h3>
            <p>Silakan simpan Nomor Referensi di bawah ini untuk mengecek status surat Anda.</p>
            <div class="ref-number">${data.ref_number}</div>
            <p style="font-size:.85rem;margin-bottom:var(--space-xl)">
              Surat Anda akan segera diproses oleh perangkat desa pada jam kerja.
            </p>
            <button class="btn btn-outline" onclick="window.location.reload()" style="color:var(--color-text-sec);border-color:var(--color-border)">
              Ajukan Surat Lainnya
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        window.scrollTo({ top: document.getElementById('form-surat-container').offsetTop - 100, behavior: 'smooth' });

      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send"></i> Kirim Pengajuan';
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // Handle Cek Status
  const formCek = document.getElementById('form-cek-status');
  if (formCek) {
    formCek.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ref = document.getElementById('input-ref').value.trim();
      const resultContainer = document.getElementById('status-result-container');
      
      try {
        const data = await apiCall(`/api/surat/cek/${ref}`);
        const badgeClass = data.status === 'Selesai' ? 'badge-selesai' 
                         : data.status === 'Diproses' ? 'badge-diproses' : 'badge-diajukan';
        
        resultContainer.innerHTML = `
          <div class="status-result fade-in visible">
            <div class="status-row">
              <span class="status-label">No. Referensi</span>
              <span class="status-value" style="font-family:monospace;font-weight:700">${data.ref_number}</span>
            </div>
            <div class="status-row">
              <span class="status-label">Nama Lengkap</span>
              <span class="status-value">${escapeHtml(data.nama)}</span>
            </div>
            <div class="status-row">
              <span class="status-label">Jenis Surat</span>
              <span class="status-value">${escapeHtml(data.jenis_surat)}</span>
            </div>
            <div class="status-row">
              <span class="status-label">Status</span>
              <span class="status-value"><span class="badge ${badgeClass}">${data.status}</span></span>
            </div>
            ${data.status === 'Selesai' ? 
              `<div style="margin-top:var(--space-md);padding:var(--space-sm);background:var(--green-50);border-radius:var(--radius-sm);font-size:.82rem;color:var(--color-success);text-align:center">
                Surat siap diambil di Kantor Desa!
              </div>` : ''
            }
          </div>
        `;
        resultContainer.style.display = 'block';
      } catch (err) {
        resultContainer.innerHTML = `
          <div style="padding:var(--space-md);background:#FEE2E2;color:#991B1B;border-radius:var(--radius-md);font-size:.85rem;text-align:center">
            ${escapeHtml(err.message)}
          </div>
        `;
        resultContainer.style.display = 'block';
      }
    });
  }
}

// Tambahkan rute khusus untuk ke halaman cek status langsung
function renderCekStatus(container) {
  renderLayanan(container);
  // Auto focus ke form cek
  setTimeout(() => {
    const inputRef = document.getElementById('input-ref');
    if(inputRef) {
      inputRef.focus();
      inputRef.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }, 500);
}
