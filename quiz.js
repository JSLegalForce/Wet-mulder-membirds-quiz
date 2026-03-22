// =============================================
// JS Legal Force â Kennisquiz Wet Mulder v2
// =============================================
const CONFIG = { slagingsdrempel: 0.70 };
let deelnemerNaam = '';
let deelnemerAchternaam = '';
let deelnemerOrganisatie = '';
let certificaatNummer = '';
let huidigVraagIndex = 0;
let score = 0;
let beantwoord = false;
let vraagResultaten = [];
let toonJuridischNa = false;

const schermen = {
  naam: document.getElementById('scherm-naam'),
  start: document.getElementById('scherm-start'),
  vraag: document.getElementById('scherm-vraag'),
  juridisch: document.getElementById('scherm-juridisch'),
  einde: document.getElementById('scherm-einde')
};

function toonScherm(naam) {
  Object.values(schermen).forEach(s => s.classList.remove('actief'));
  schermen[naam].classList.add('actief');
  window.scrollTo(0, 0);
}

document.getElementById('btn-naar-start').addEventListener('click', () => {
  const voornaam = document.getElementById('input-voornaam').value.trim();
  const achternaam = document.getElementById('input-achternaam').value.trim();
  const organisatie = document.getElementById('input-organisatie').value.trim();
  const fout = document.getElementById('naam-fout');
  if (!voornaam || !achternaam) { fout.classList.add('zichtbaar'); return; }
  fout.classList.remove('zichtbaar');
  deelnemerNaam = voornaam;
  deelnemerAchternaam = achternaam;
  deelnemerOrganisatie = organisatie;
  certificaatNummer = genereerNummer();
  document.getElementById('start-welkom').innerHTML = `Welkom, ${voornaam}!<br><span style="font-size:1.3rem;font-weight:600">Wet Mulder Kennisquiz</span>`;
  toonScherm('start');
});

document.getElementById('btn-start').addEventListener('click', () => {
  huidigVraagIndex = 0; score = 0; vraagResultaten = [];
  maakVraagNummers(); toonVraag();
});

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
    if (i < huidig) { dot.classList.add(resultaten[i]?.juist ? 'klaar-goed' : 'klaar-fout'); }
    else if (i === huidig) { dot.classList.add('actief'); }
  });
}

function toonVraag() {
  beantwoord = false; toonJuridischNa = false;
  const vraag = ALLE_VRAGEN[huidigVraagIndex];
  const totaal = ALLE_VRAGEN.length;
  const huidig = huidigVraagIndex + 1;
  const pct = ((huidig - 1) / totaal) * 100;
  document.getElementById('voortgang-tekst').textContent = `Vraag ${huidig} van ${totaal}`;
  document.getElementById('voortgang-balk').style.width = pct + '%';
  document.getElementById('vraag-thema').textContent = vraag.thema;
  document.getElementById('vraag-nummer-badge').textContent = `Vraag ${huidig} van ${totaal}`;
  document.getElementById('vraag-tekst').textContent = vraag.vraag;
  updateVraagNummers(huidigVraagIndex, vraagResultaten);
  const feedback = document.getElementById('feedback-container');
  feedback.classList.remove('actief', 'juist', 'fout');
  document.getElementById('btn-volgende').classList.remove('actief');
  document.getElementById('btn-juridisch').style.display = 'none';
  document.getElementById('btn-volgende').textContent = huidigVraagIndex < ALLE_VRAGEN.length - 1 ? 'Volgende vraag â' : 'Bekijk resultaat â';
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

function verwerkAntwoord(gekozenIndex, gekliktBtn, vraag) {
  if (beantwoord) return;
  beantwoord = true;
  const knoppen = document.querySelectorAll('.optie-knop');
  const juist = vraag.juist === gekozenIndex;
  knoppen.forEach(k => k.disabled = true);
  knoppen[vraag.juist].classList.add('juist');
  if (!juist) { gekliktBtn.classList.add('fout'); } else { score++; }
  vraagResultaten.push({ thema: vraag.thema, juist });
  updateVraagNummers(huidigVraagIndex, vraagResultaten);
  const feedback = document.getElementById('feedback-container');
  feedback.classList.remove('juist', 'fout');
  feedback.classList.add(juist ? 'juist' : 'fout', 'actief');
  document.getElementById('feedback-icon').textContent = juist ? 'â' : 'â';
  document.getElementById('feedback-tekst').textContent = vraag.uitleg + ' ';
  document.getElementById('feedback-artikel').textContent = 'â ' + vraag.artikel;
  if (vraag.juridischAdvies) { document.getElementById('btn-juridisch').style.display = 'flex'; toonJuridischNa = true; }
  document.getElementById('btn-volgende').classList.add('actief');
  document.getElementById('voortgang-balk').style.width = ((huidigVraagIndex + 1) / ALLE_VRAGEN.length * 100) + '%';
}

document.getElementById('btn-juridisch').addEventListener('click', () => { toonScherm('juridisch'); });
document.getElementById('btn-verder-na-juridisch').addEventListener('click', () => { toonScherm('vraag'); });
document.getElementById('btn-volgende').addEventListener('click', () => {
  huidigVraagIndex++;
  if (huidigVraagIndex >= ALLE_VRAGEN.length) { toonEinde(); } else { toonVraag(); }
});

function toonEinde() {
  const totaal = ALLE_VRAGEN.length;
  const percentage = score / totaal;
  const geslaagd = percentage >= CONFIG.slagingsdrempel;
  document.getElementById('einde-naam-tekst').textContent = `${deelnemerNaam} ${deelnemerAchternaam}${deelnemerOrganisatie ? ' â ' + deelnemerOrganisatie : ''}`;
  document.getElementById('eind-score').textContent = `${score} van de ${totaal} vragen goed`;
  document.getElementById('eind-percentage').textContent = Math.round(percentage * 100) + '%';
  const beoordeling = document.getElementById('eind-beoordeling');
  beoordeling.className = 'beoordeling ' + (geslaagd ? 'geslaagd' : 'gezakt');
  beoordeling.textContent = geslaagd ? 'â Geslaagd' : 'â Niet geslaagd';
  document.getElementById('eind-beoordeling-tekst').textContent = geslaagd
    ? 'Gefeliciteerd! Je hebt de kennisquiz Wet Mulder met goed gevolg afgerond.'
    : `Je hebt minimaal ${Math.round(CONFIG.slagingsdrempel * 100)}% nodig om te slagen. Bestudeer de theorie en probeer het opnieuw.`;
  const btnCert = document.getElementById('btn-certificaat');
  btnCert.textContent = geslaagd ? 'â Download bewijs van deelname (PDF)' : 'â Download resultatenoverzicht (PDF)';
  const overzicht = document.getElementById('vraag-overzicht');
  overzicht.innerHTML = '';
  vraagResultaten.forEach((res, i) => {
    const status = res.juist ? 'goed' : 'fout';
    const rij = document.createElement('div');
    rij.className = `auditpunt-rij ${status}`;
    rij.innerHTML = `<span class="auditpunt-naam">Vraag ${i + 1} â ${res.thema}</span><span class="auditpunt-icoon">${res.juist ? 'â' : 'â'}</span>`;
    overzicht.appendChild(rij);
  });
  toonScherm('einde');
}

document.getElementById('btn-certificaat').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210;
  const totaal = ALLE_VRAGEN.length;
  const pct = Math.round((score / totaal) * 100);
  const geslaagd = (score / totaal) >= CONFIG.slagingsdrempel;
  const nu = new Date();
  const datum = nu.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  // Achtergrond wit
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // Donkerblauwe header
  doc.setFillColor(26, 42, 94);
  doc.rect(0, 0, W, 28, 'F');

  // Gekleurde zijbalk links
  if (geslaagd) { doc.setFillColor(26, 122, 74); } else { doc.setFillColor(181, 42, 42); }
  doc.rect(0, 0, 8, H, 'F');

  // Donkerblauwe footer
  doc.setFillColor(26, 42, 94);
  doc.rect(0, H - 20, W, 20, 'F');

  // Header tekst - "Kennisquiz Wet Mulder" met hoofdletters W en M
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('JS Legal Force', W / 2, 17, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(138, 154, 181);
  doc.text("Kennisquiz Wet Mulder â voor BOA's", W / 2, 23, { align: 'center' });

  // Buitenkader
  doc.setDrawColor(200, 210, 230);
  doc.setLineWidth(0.5);
  doc.rect(14, 34, W - 22, H - 58, 'S');
  doc.setLineWidth(0.2);
  doc.rect(16, 36, W - 26, H - 62, 'S');

  // Status badge - gecentreerd met correcte symbolen
  const badgeTekst = geslaagd ? 'KENNISQUIZ BEHAALD' : 'KENNISQUIZ NIET BEHAALD';
  const badgeSymbool = geslaagd ? 'â' : 'â';
  const badgeVolTekst = badgeSymbool + '   ' + badgeTekst;
  const badgeBreedte = geslaagd ? 70 : 90;
  const badgeX = (W - badgeBreedte) / 2;

  if (geslaagd) {
    doc.setFillColor(230, 244, 237);
    doc.setDrawColor(26, 122, 74);
  } else {
    doc.setFillColor(250, 234, 234);
    doc.setDrawColor(181, 42, 42);
  }
  doc.setLineWidth(0.8);
  doc.roundedRect(badgeX, 39, badgeBreedte, 11, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(geslaagd ? 26 : 181, geslaagd ? 122 : 42, geslaagd ? 74 : 42);
  doc.text(badgeTekst, W / 2, 46, { align: 'center' });

  // Hoofdtitel
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(26, 42, 94);
  doc.text(geslaagd ? 'BEWIJS VAN DEELNAME' : 'RESULTATENOBERZICHT', W / 2, 64, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(74, 85, 120);
  doc.text("Kennisquiz Wet Mulder voor BOAâs", W / 2, 72, { align: 'center' });

  // Scheidingslijn
  doc.setDrawColor(200, 210, 230);
  doc.setLineWidth(0.6);
  doc.line(60, 77, W - 60, 77);

  // Introductietekst
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(74, 85, 120);
  doc.text(geslaagd ? 'Dit bewijs van deelname wordt verleend aan' : 'Dit resultatenoberzicht is opgesteld voor', W / 2, 87, { align: 'center' });

  // Naam deelnemer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(26, 42, 94);
  const volledigeNaam = deelnemerNaam.charAt(0).toUpperCase() + deelnemerNaam.slice(1) + ' ' + deelnemerAchternaam.charAt(0).toUpperCase() + deelnemerAchternaam.slice(1);
  doc.text(volledigeNaam, W / 2, 99, { align: 'center' });

  if (deelnemerOrganisatie) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(74, 85, 120);
    doc.text(deelnemerOrganisatie, W / 2, 107, { align: 'center' });
  }

  // Scheidingslijn
  doc.setDrawColor(200, 210, 230);
  doc.setLineWidth(0.5);
  doc.line(60, 113, W - 60, 113);

  // Beschrijvende tekst
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(26, 42, 94);
  if (geslaagd) {
    doc.text('Heeft de kennisquiz Wet Mulder van JS Legal Force met goed gevolg afgerond', W / 2, 123, { align: 'center' });
    doc.text('en beschikt over voldoende basiskennis van de Wet administratiefrechtelijke handhaving verkeersvoorschriften.', W / 2, 130, { align: 'center' });
  } else {
    doc.text('Heeft deelgenomen aan de kennisquiz Wet Mulder van JS Legal Force.', W / 2, 123, { align: 'center' });
    doc.text('De vereiste slagingsdrempel is bij deze deelname niet behaald.', W / 2, 130, { align: 'center' });
  }

  // Score blok
  const blokBreedte = 120;
  const blokX = (W - blokBreedte) / 2;
  if (geslaagd) {
    doc.setFillColor(230, 244, 237);
    doc.setDrawColor(26, 122, 74);
  } else {
    doc.setFillColor(250, 234, 234);
    doc.setDrawColor(181, 42, 42);
  }
  doc.setLineWidth(0.8);
  doc.roundedRect(blokX, 137, blokBreedte, 19, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(geslaagd ? 26 : 181, geslaagd ? 122 : 42, geslaagd ? 74 : 42);
  doc.text(`Score: ${score} van de ${totaal} vragen correct â ${pct}%`, W / 2, 144.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Slagingsdrempel: ${Math.round(CONFIG.slagingsdrempel * 100)}% â ${geslaagd ? 'Behaald' : 'Niet behaald'}`, W / 2, 151, { align: 'center' });

  // Datum en documentnummer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(74, 85, 120);
  doc.text(`Datum: ${datum}`, W / 2, 162, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(138, 154, 181);
  doc.text(`Documentnummer: ${certificaatNummer}`, W / 2, 167, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.text('Dit is een educatieve kennisquiz, geen officieel gecertificeerd examen.', W / 2, 172, { align: 'center' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(138, 154, 181);
  doc.text("Â© JS Legal Force â Kennisquiz Wet Mulder voor BOA's", W / 2, H - 10, { align: 'center' });

  const prefix = geslaagd ? 'Bewijs_Deelname' : 'Resultaten';
  doc.save(`${prefix}_WetMulder_${deelnemerNaam}_${deelnemerAchternaam}_${nu.getFullYear()}.pdf`);
});

document.getElementById('btn-herstart').addEventListener('click', () => { toonScherm('start'); });

function genereerNummer() {
  const nu = new Date();
  const jaar = nu.getFullYear();
  const maand = String(nu.getMonth() + 1).padStart(2, '0');
  const dag = String(nu.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `JSLF-WM-${jaar}${maand}${dag}-${rand}`;
}
