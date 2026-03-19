// =============================================
// JS Legal Force — Kennisquiz Wet Mulder v2
// =============================================

const CONFIG = { slagingsdrempel: 0.70 };

let deelnemerNaam        = '';
let deelnemerAchternaam  = '';
let deelnemerOrganisatie = '';
let certificaatNummer    = '';
let huidigVraagIndex     = 0;
let score                = 0;
let beantwoord           = false;
let vraagResultaten      = [];
let toonJuridischNa      = false;

const schermen = {
  naam:      document.getElementById('scherm-naam'),
  start:     document.getElementById('scherm-start'),
  vraag:     document.getElementById('scherm-vraag'),
  juridisch: document.getElementById('scherm-juridisch'),
  einde:     document.getElementById('scherm-einde')
};

function toonScherm(naam) {
  Object.values(schermen).forEach(s => s.classList.remove('actief'));
  schermen[naam].classList.add('actief');
  window.scrollTo(0, 0);
}

// =====================
// NAAMSCHERM
// =====================
document.getElementById('btn-naar-start').addEventListener('click', () => {
  const voornaam    = document.getElementById('input-voornaam').value.trim();
  const achternaam  = document.getElementById('input-achternaam').value.trim();
  const organisatie = document.getElementById('input-organisatie').value.trim();
  const fout        = document.getElementById('naam-fout');

  if (!voornaam || !achternaam) {
    fout.classList.add('zichtbaar');
    return;
  }

  fout.classList.remove('zichtbaar');
  deelnemerNaam        = voornaam;
  deelnemerAchternaam  = achternaam;
  deelnemerOrganisatie = organisatie;
  certificaatNummer    = genereerNummer();

  document.getElementById('start-welkom').innerHTML =
    `Welkom, ${voornaam}!<br><span style="font-size:1.3rem;font-weight:600">Wet Mulder Kennisquiz</span>`;

  toonScherm('start');
});

// =====================
// START QUIZ
// =====================
document.getElementById('btn-start').addEventListener('click', () => {
  huidigVraagIndex = 0;
  score            = 0;
  vraagResultaten  = [];
  maakVraagNummers();
  toonVraag();
});

// =====================
// GENUMMERDE VOORTGANG
// =====================
function maakVraagNummers() {
  const container = document.getElementById('vraag-nummers');
  container.innerHTML = '';
  ALLE_VRAGEN.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'vraag-nummer-dot';
    dot.id = `dot-${i}`;
    dot.textContent = i + 1;
    container.appendChild(dot);
  });
}

function updateVraagNummers(huidig, resultaten) {
  ALLE_VRAGEN.forEach((_, i) => {
    const dot = document.getElementById(`dot-${i}`);
    dot.className = 'vraag-nummer-dot';
    if (i < huidig) {
      dot.classList.add(resultaten[i]?.juist ? 'klaar-goed' : 'klaar-fout');
    } else if (i === huidig) {
      dot.classList.add('actief');
    }
  });
}

// =====================
// VRAAG TONEN
// =====================
function toonVraag() {
  beantwoord   = false;
  toonJuridischNa = false;

  const vraag  = ALLE_VRAGEN[huidigVraagIndex];
  const totaal = ALLE_VRAGEN.length;
  const huidig = huidigVraagIndex + 1;
  const pct    = ((huidig - 1) / totaal) * 100;

  document.getElementById('voortgang-tekst').textContent    = `Vraag ${huidig} van ${totaal}`;
  document.getElementById('voortgang-balk').style.width     = pct + '%';
  document.getElementById('vraag-thema').textContent        = vraag.thema;
  document.getElementById('vraag-nummer-badge').textContent = `Vraag ${huidig} van ${totaal}`;
  document.getElementById('vraag-tekst').textContent        = vraag.vraag;

  updateVraagNummers(huidigVraagIndex, vraagResultaten);

  const feedback = document.getElementById('feedback-container');
  feedback.classList.remove('actief', 'juist', 'fout');
  document.getElementById('btn-volgende').classList.remove('actief');
  document.getElementById('btn-juridisch').style.display = 'none';
  document.getElementById('btn-volgende').textContent = huidigVraagIndex < ALLE_VRAGEN.length - 1
    ? 'Volgende vraag →' : 'Bekijk resultaat →';

  const container = document.getElementById('opties-container');
  container.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  vraag.opties.forEach((optie, i) => {
    const btn = document.createElement('button');
    btn.className = 'optie-knop';
    btn.innerHTML = `<span class="optie-letter">${letters[i]}</span><span class="optie-tekst">${optie}</span>`;
    btn.addEventListener('click', () => verwerkAntwoord(i, btn, vraag));
    container.appendChild(btn);
  });

  toonScherm('vraag');
}

// =====================
// ANTWOORD VERWERKEN
// =====================
function verwerkAntwoord(gekozenIndex, gekliktBtn, vraag) {
  if (beantwoord) return;
  beantwoord = true;

  const knoppen = document.querySelectorAll('.optie-knop');
  const juist   = vraag.juist === gekozenIndex;

  knoppen.forEach(k => k.disabled = true);
  knoppen[vraag.juist].classList.add('juist');
  if (!juist) { gekliktBtn.classList.add('fout'); } else { score++; }

  vraagResultaten.push({ thema: vraag.thema, juist });
  updateVraagNummers(huidigVraagIndex, vraagResultaten);

  const feedback = document.getElementById('feedback-container');
  feedback.classList.remove('juist', 'fout');
  feedback.classList.add(juist ? 'juist' : 'fout', 'actief');
  document.getElementById('feedback-icon').textContent    = juist ? '✓' : '✗';
  document.getElementById('feedback-tekst').textContent   = vraag.uitleg + ' ';
  document.getElementById('feedback-artikel').textContent = '— ' + vraag.artikel;

  // Juridisch advies knop tonen indien van toepassing
  if (vraag.juridischAdvies) {
    document.getElementById('btn-juridisch').style.display = 'flex';
    toonJuridischNa = true;
  }

  document.getElementById('btn-volgende').classList.add('actief');
  document.getElementById('voortgang-balk').style.width =
    ((huidigVraagIndex + 1) / ALLE_VRAGEN.length * 100) + '%';
}

// =====================
// JURIDISCH ADVIES
// =====================
document.getElementById('btn-juridisch').addEventListener('click', () => {
  toonScherm('juridisch');
});

document.getElementById('btn-verder-na-juridisch').addEventListener('click', () => {
  toonScherm('vraag');
});

// =====================
// VOLGENDE VRAAG
// =====================
document.getElementById('btn-volgende').addEventListener('click', () => {
  huidigVraagIndex++;
  if (huidigVraagIndex >= ALLE_VRAGEN.length) {
    toonEinde();
  } else {
    toonVraag();
  }
});

// =====================
// EINDSCHERM
// =====================
function toonEinde() {
  const totaal     = ALLE_VRAGEN.length;
  const percentage = score / totaal;
  const geslaagd   = percentage >= CONFIG.slagingsdrempel;

  document.getElementById('einde-naam-tekst').textContent =
    `${deelnemerNaam} ${deelnemerAchternaam}${deelnemerOrganisatie ? ' — ' + deelnemerOrganisatie : ''}`;
  document.getElementById('eind-score').textContent      = `${score} van de ${totaal} vragen goed`;
  document.getElementById('eind-percentage').textContent = Math.round(percentage * 100) + '%';

  const beoordeling = document.getElementById('eind-beoordeling');
  beoordeling.className   = 'beoordeling ' + (geslaagd ? 'geslaagd' : 'gezakt');
  beoordeling.textContent = geslaagd ? '✓ Geslaagd' : '✗ Niet geslaagd';

  document.getElementById('eind-beoordeling-tekst').textContent = geslaagd
    ? 'Gefeliciteerd! Je hebt de kennisquiz Wet Mulder met goed gevolg afgerond.'
    : `Je hebt minimaal ${Math.round(CONFIG.slagingsdrempel * 100)}% nodig om te slagen. Bestudeer de theorie en probeer het opnieuw.`;

  const overzicht = document.getElementById('vraag-overzicht');
  overzicht.innerHTML = '';
  vraagResultaten.forEach((res, i) => {
    const status = res.juist ? 'goed' : 'fout';
    const rij    = document.createElement('div');
    rij.className = `auditpunt-rij ${status}`;
    rij.innerHTML = `
      <span class="auditpunt-naam">Vraag ${i + 1} — ${res.thema}</span>
      <span class="auditpunt-icoon">${res.juist ? '✓' : '✗'}</span>
    `;
    overzicht.appendChild(rij);
  });

  toonScherm('einde');
}

// =====================
// BEWIJS VAN DEELNAME
// =====================
document.getElementById('btn-certificaat').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(26, 42, 94);
  doc.rect(0, 0, W, 28, 'F');
  doc.setFillColor(26, 42, 94);
  doc.rect(0, H - 20, W, 20, 'F');
  doc.setDrawColor(138, 154, 181);
  doc.setLineWidth(1.5);
  doc.line(0, 28, W, 28);
  doc.line(0, H - 20, W, H - 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('JS Legal Force', W / 2, 17, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(138, 154, 181);
  doc.text("KENNISQUIZ WET MULDER — VOOR BOA'S", W / 2, 23, { align: 'center' });

  doc.setDrawColor(138, 154, 181);
  doc.setLineWidth(0.5);
  doc.rect(10, 34, W - 20, H - 58, 'S');
  doc.setLineWidth(0.3);
  doc.rect(12, 36, W - 24, H - 62, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(26, 42, 94);
  doc.text('BEWIJS VAN DEELNAME', W / 2, 58, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(74, 85, 120);
  doc.text('Kennisquiz Wet Mulder', W / 2, 68, { align: 'center' });

  doc.setDrawColor(138, 154, 181);
  doc.setLineWidth(0.8);
  doc.line(60, 73, W - 60, 73);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(74, 85, 120);
  doc.text('Dit bewijs van deelname wordt verleend aan', W / 2, 84, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(26, 42, 94);
  doc.text(`${deelnemerNaam} ${deelnemerAchternaam}`, W / 2, 97, { align: 'center' });

  if (deelnemerOrganisatie) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(74, 85, 120);
    doc.text(deelnemerOrganisatie, W / 2, 105, { align: 'center' });
  }

  doc.setDrawColor(138, 154, 181);
  doc.setLineWidth(0.5);
  doc.line(60, 110, W - 60, 110);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(26, 42, 94);
  doc.text(
    'Heeft deelgenomen aan de kennisquiz Wet Mulder van JS Legal Force en deze met goed gevolg afgerond.',
    W / 2, 120, { align: 'center', maxWidth: W - 80 }
  );

  const totaal = ALLE_VRAGEN.length;
  const pct    = Math.round((score / totaal) * 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(26, 122, 74);
  doc.text(`Score: ${score} van de ${totaal} vragen goed — ${pct}%`, W / 2, 133, { align: 'center' });

  const nu    = new Date();
  const datum = nu.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(74, 85, 120);
  doc.text(`Datum: ${datum}`, W / 2, 143, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(138, 154, 181);
  doc.text(`Bewijsnummer: ${certificaatNummer}`, W / 2, 151, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.text('Dit is een educatieve kennisquiz, geen officieel gecertificeerd examen.', W / 2, 158, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text("© JS Legal Force — Kennisquiz Wet Mulder voor BOA's", W / 2, H - 10, { align: 'center' });

  doc.save(`Bewijs_Deelname_WetMulder_${deelnemerNaam}_${deelnemerAchternaam}_${nu.getFullYear()}.pdf`);
});

// =====================
// HERSTART
// =====================
document.getElementById('btn-herstart').addEventListener('click', () => {
  toonScherm('start');
});

function genereerNummer() {
  const nu    = new Date();
  const jaar  = nu.getFullYear();
  const maand = String(nu.getMonth() + 1).padStart(2, '0');
  const dag   = String(nu.getDate()).padStart(2, '0');
  const rand  = Math.floor(Math.random() * 90000) + 10000;
  return `JSLF-WM-${jaar}${maand}${dag}-${rand}`;
}
