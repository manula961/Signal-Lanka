(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  let lang = localStorage.getItem('signal-lang') || 'en';
  let morse = '';
  let countdownId = null;
  let transitionId = null;
  let sec = 60;
  let score = 0;
  let questionIndex = 0;
  let challengeActive = false;
  let answerLocked = false;
  let lastFocused = null;

  const si = {
    skip: 'ප්‍රධාන අන්තර්ගතයට යන්න',
    museum: 'සන්නිවේදන කෞතුකාගාරය',
    play: 'අත්දැකීම්', ancient: 'පුරාණ', middle: 'මධ්‍ය', modern: 'නූතන',
    tag: 'අන්තර්ක්‍රියාකාරී ඩිජිටල් කෞතුකාගාරය · ශ්‍රී ලංකාව',
    hero: 'පණිවිඩ කාලය හරහා ගමන් කළ හැටි.',
    lead: 'සංඥා වාර්තා, ජනමාධ්‍ය සහ බුද්ධිමත් ජාල බවට පත්වූ සන්නිවේදන යුග තුනක් හරහා ගමන් කරන්න.',
    timeBtn: 'කාල යන්ත්‍රයට ඇතුළු වන්න', challengeBtn: 'තත්පර 60 අභියෝගය අරඹන්න',
    heroAncientCaption: 'පුරාණ දෘශ්‍ය වාර්තාව · තන්තිරිමලේ', heroModernCaption: 'නූතන සන්නිවේදන භූදර්ශනය · කොළඹ',
    attractions: 'ප්‍රදර්ශන අත්දැකීම්', transmit: 'ඉතිහාසය කියවන්න පමණක් නොව. එය සම්ප්‍රේෂණය කරන්න.',
    tm: 'සන්නිවේදන කාල යන්ත්‍රය', tmDesc: 'එකම පණිවිඩය පුරාණ, මධ්‍ය සහ නූතන සන්නිවේදන පද්ධති හරහා යවන්න.', launch: 'අරඹන්න →',
    challenge: 'තත්පර 60 සන්නිවේදන අභියෝගය', challengeDesc: 'කාලය අවසන් වීමට පෙර යුග තුනේ ප්‍රශ්නවලට පිළිතුරු දෙන්න.', start: 'අරඹන්න →',
    ancientTag: '01 · පුරාණ සන්නිවේදනය', ancientEra: 'පුරාණ යුගය', memory: 'සංඥා මතකය බවට පත්වේ.',
    ancientP1: 'විද්‍යුත් මාධ්‍යයට පෙර සන්නිවේදනය මිනිස් ඉන්ද්‍රියයන් සහ භෞතික ද්‍රව්‍ය මත රඳා පැවතිණි. හඬ, ඉඟි සහ දෘශ්‍ය සංඥා හදිසි අර්ථ ගෙන ගිය අතර ලකුණු, ශිලා ලේඛන සහ අත්පිටපත් මඟින් මුල් කථිකයා නොමැති පසුවත් තොරතුරු පවත්වා ගැනීමට හැකි විය.',
    ancientP2: 'ශිලා සහ ගුහා රූප දිගු කාලයක් පවතින දෘශ්‍ය සලකුණු ලෙස අදහස් සුරැකීමේ ශක්තිය පෙන්වයි. පසුව ලිවීම සූදානම් කළ මතුපිටවලට ගෙන ගොස් දැනුම සුරැකීමට, සංවිධානය කිරීමට සහ පරම්පරාවෙන් පරම්පරාවට ගෙන යාමට පහසු කළේය.',
    smoke: 'දුම් සංඥාව යවන්න',
    ancientPhoto1Title: 'තන්තිරිමලේ ගුහා සිතුවම', ancientPhoto1Desc: 'ශ්‍රී ලංකාවේ තන්තිරිමලේ ප්‍රදේශයෙන් ඉතිරිව ඇති දෘශ්‍ය සලකුණකි. හඬක් හෝ ඉඟියක් මෙන් ක්ෂණිකව නැති නොවී, අර්ථයක් මතුපිටක සුරැකිය හැකි බව එය පෙන්වයි.',
    ancientPhoto2Title: 'දෘශ්‍ය ලකුණු මාලාවක්', ancientPhoto2Desc: 'රූප සහ ලකුණු කිහිපයක් එකට දැකිය හැකි අතර ඒවා දෘශ්‍ය ප්‍රකාශනයේ සාක්ෂි ලෙස සැලකිය හැක. ගල මත ලකුණක් නිර්මාණය කළ මොහොතෙන් බොහෝ කලකට පසුවත් පෙනී සිටිය හැක.',
    rockToManuscript: 'ගලෙන් අත්පිටපතට', portableTitle: 'ලිවීම දැනුම රැගෙන යා හැකි දෙයක් කරයි.',
    portableDesc: 'තල්පත් අත්පිටපත් ස්වභාවික ද්‍රව්‍යයක් සංවිධානාත්මක ලිවීමේ මාධ්‍යයක් බවට පත් කළේය. සූදානම් කළ පත් මත අකුරු කැටයම් කර, අනුපිළිවෙලට තබා බැඳිය හැකි විය. ශ්‍රී ලාංකික උදාහරණ ආගමික, සාහිත්‍ය, වෛද්‍ය සහ වෙනත් දැනුම සුරැකී ඇති ආකාරය පෙන්වයි.',
    material: 'ද්‍රව්‍යය', palmLeaf: 'තල්පත', method: 'ක්‍රමය', incised: 'කැටයම් ලිවීම', form: 'ආකෘතිය', folios: 'බැඳුණු පත්',
    palmTitle: 'තල්පත් අත්පිටපත් · මඩකලපුව කෞතුකාගාරය', palmDesc: 'මෙම ඡායාරූපය ශ්‍රී ලංකාවේ මඩකලපුවේ තල්පත් අත්පිටපත් ලේඛනගත කරයි. දිගු හා පටු ආකෘතිය මෙම මාධ්‍යයේ විශේෂ ලක්ෂණයකි.',
    olaTitle: '19වන සියවසේ වෛද්‍ය ඔලා අත්පිටපත', olaDesc: 'වෛද්‍ය විෂයයන් පිළිබඳ ශ්‍රී ලාංකික අත්පිටපතක්. විශේෂඥ දැනුම සූදානම් කළ පත් මත ගබඩා කළ ආකාරය එය පෙන්වයි.',
    middleTag: '02 · ජන සන්නිවේදනය', middleEra: 'මධ්‍ය යුගය', mass: 'පණිවිඩ ජනමාධ්‍ය බවට පත්වේ.',
    middleP1: 'මුද්‍රණය සන්නිවේදනයේ පරිමාණය වෙනස් කළේය. එක් අත්පිටපතක් බැගින් නිපදවීම වෙනුවට යාන්ත්‍රික පද්ධති එකම පිටුව පාඨකයන් බොහෝ දෙනෙකු සඳහා නැවත නැවත නිපදවිය හැකි විය. පුවත්පත්, නිල ප්‍රකාශන, පොත් සහ අධ්‍යාපනික ද්‍රව්‍ය පුළුල් ලෙස සංසරණය විය.',
    middleP2: 'විද්‍යුත් සන්නිවේදනය දුර සහ ප්‍රමාදය අතර සම්බන්ධතාවය වෙනස් කළේය. ටෙලිග්‍රාෆ් පද්ධති පෙළ විද්‍යුත් සංඥා ලෙස කේතනය කළ අතර දුරකථන හඬ පරිපථ හරහා ගෙන ගියේය. ගුවන්විදුලිය එක් සජීවී සම්ප්‍රේෂණයකට විශාල ප්‍රේක්ෂක පිරිසක් ළඟා වීමට ඉඩ ලබා දුන්නේය.',
    clear: 'මකන්න', pressTitle: 'Ceylon Government Press · 1952', pressDesc: 'කොළඹ සැලසුම් ප්‍රදර්ශනයේ පෙන්වන ලයිනෝටයිප් යන්ත්‍ර විශාල පරිමාණ අක්ෂර සැකසීම සහ මුද්‍රණය සඳහා යාන්ත්‍රික පදනම පෙන්වයි. යාන්ත්‍රික නිෂ්පාදනය එකම පණිවිඩය නැවත නැවත නිපදවිය හැකි ක්‍රියාවලියක් කළේය.',
    radioTitle: 'Radio Ceylon ඇතුළත', radioDesc: 'නිවේදකයා, පිටපත සහ මයික්‍රොෆෝනය සහිත ස්ටුඩියෝ දර්ශනයක් ගුවන්විදුලි නිෂ්පාදනය සංවිධානාත්මක ක්‍රියාවලියක් බව පෙන්වයි. එක් කාමරයක හඬ විශාල ශ්‍රාවක පිරිසකට ගෙන යා හැකි විය.',
    scaleTag: 'පරිමාණ විප්ලවය', scaleTitle: 'එක පණිවිඩයක්. ග්‍රාහකයන් දහස් ගණනක්.', scaleDesc: 'මුද්‍රණය සහ ගුවන්විදුලිය එකම ගැටලුවේ වෙනස් කොටස් විසඳීය. මුද්‍රණය දිගුකාලීන භෞතික පිටපත් බොහෝ ගණනක් නිර්මාණය කළ අතර ගුවන්විදුලිය එක් සජීවී සංඥාවක් බෙදා ගත්තේය. ඒවා එක්ව පුද්ගලයන් පමණක් නොව විශාල ජන සමූහයන් වෙත ළඟා විය හැකි පද්ධති බිහි කළේය.',
    print: 'මුද්‍රණය', repeatCopies: 'නැවත නිපදවිය හැකි පිටපත්', telegraph: 'ටෙලිග්‍රාෆ්', codedText: 'කේතනය කළ විද්‍යුත් පෙළ', radio: 'ගුවන්විදුලිය', oneMany: 'එකෙන් බොහෝ දෙනාට හඬ',
    typePage: 'අක්ෂර → පිටුව', typePageDesc: 'අක්ෂර සැකසීම පෙළ නැවත නිපදවිය හැකි ආකෘතියකට සකස් කරයි. තීන්ත සහ යාන්ත්‍රික පීඩනය එය කඩදාසියට මාරු කරයි.',
    textSignal: 'පෙළ → සංඥාව', textSignalDesc: 'ටෙලිග්‍රාෆ් අක්ෂර කේතනය කළ ස්පන්දන ලෙස නිරූපණය කරයි. එවිට භෞතික ලේඛනය පැමිණෙන තුරු බලා නොසිට තොරතුරු විද්‍යුත් ලෙස ගමන් කළ හැක.',
    voiceBroadcast: 'හඬ → විකාශනය', voiceBroadcastDesc: 'ගුවන්විදුලිය වැඩසටහන් හඬ සම්ප්‍රේෂණය කළ විද්‍යුත්චුම්බක සංඥාවක් බවට පත් කරයි. ග්‍රාහකයන් බොහෝ දෙනෙකුට එයට සම්බන්ධ විය හැක.',
    modernTag: '03 · ජාලගත සන්නිවේදනය', modernEra: 'නූතන යුගය', networked: 'සියල්ල ජාලගත වේ.',
    modernP1: 'නූතන සන්නිවේදනය පෙළ, හඬ, රූප සහ වීඩියෝ ඩිජිටල් දත්ත බවට පත් කරයි. ජංගම සහ අන්තර්ජාල ජාල එම දත්ත පුද්ගලයන්, උපාංග සහ සේවා අතර ඉතා වේගයෙන් ගෙන යන අතර ක්ලවුඩ් පද්ධති තොරතුරු උපාංග කිහිපයකින් ලබා ගත හැකි ලෙස තබා ගනී.',
    modernP2: 'ප්‍රධාන වෙනස සංකලනයයි. පෙර වෙන්වූ මාධ්‍ය අවශ්‍ය කළ මෙවලම් දැන් පොදු ඩිජිටල් යටිතල පහසුකම් හරහා ක්‍රියා කරයි. AI මඟින් තොරතුරු නිර්මාණය කිරීම, පරිවර්තනය, සාරාංශ කිරීම, සෙවීම සහ නැවත සංවිධානය කිරීම සඳහා අමතර ස්තරයක් එක් කරයි.',
    packet: 'දත්ත පැකට්ටුව යවන්න', lotusTitle: 'කොළඹ වෙනස් වන සන්නිවේදන භූදර්ශනය', lotusDesc: 'Lotus Tower නූතන කොළඹේ දැක්වෙන ප්‍රබල සලකුණකි. මෙම ප්‍රදර්ශනයේදී එය විශාල පරිමාණ විද්‍යුත් සහ ඩිජිටල් සන්නිවේදන යටිතල පහසුකම්වලට මාරුවීම නිරූපණය කරයි.',
    towerTitle: 'රැහැන් රහිත යටිතල පහසුකම් · පේදුරුතුඩුව', towerDesc: 'සන්නිවේදන කුළුණු රැහැන් රහිත සම්බන්ධතාවයේ භෞතික ස්තරයකි. ඒවා රේඩියෝ උපකරණ සහ ජාල පද්ධති මිනිසුන් භාවිත කරන උපාංග සමඟ සම්බන්ධ කරයි.',
    networkTag: 'ජාල ස්තරය', dataTitle: 'පණිවිඩය දත්ත බවට පත්වේ.', dataDesc: 'ඩිජිටල් පණිවිඩයක් මුල් පිටපත වෙනස් නොකර පිටපත් කළ හැක, ජාල කිහිපයක් හරහා යොමු කළ හැක, ස්ථාන කිහිපයක ගබඩා කළ හැක සහ පෙළ, ශබ්ද, රූප හෝ වීඩියෝ ලෙස ඉදිරිපත් කළ හැක. එකම යටිතල පහසුකම පුද්ගලික සංවාද, විශාල ප්‍රකාශන සහ බොහෝ දෙනාගෙන් බොහෝ දෙනාට සන්නිවේදනය සඳහා භාවිත කළ හැක.',
    speed: 'වේගය', instant: 'ඉතා ආසන්න ක්ෂණික', reach: 'පරාසය', global: 'ගෝලීය', media: 'මාධ්‍ය', converged: 'එකමුතු',
    device: 'උපාංගය', deviceDesc: 'දුරකථනය කැමරාව, මයික්‍රොෆෝනය, සංස්කාරකය, ගබඩාව, ග්‍රාහකය සහ සම්ප්‍රේෂකය එකම අතුරුමුහුණතක එක් කරයි.',
    network: 'ජාලය', networkDesc: 'තොරතුරු ඩිජිටල් දත්ත ලෙස බෙදී රැහැන් සහ රැහැන් රහිත යටිතල පහසුකම් හරහා ගමනාන්තයට යොමු කරයි.',
    cloudAi: 'ක්ලවුඩ් + AI', cloudAiDesc: 'සම්බන්ධිත සේවා තොරතුරු සමමුහුර්ත කරයි. බුද්ධිමත් මෘදුකාංගයට සෙවීම, පරිවර්තනය, වෙනස් කිරීම සහ අන්තර්ගතය නිර්මාණය කිරීම කළ හැක.',
    experience: 'ප්‍රදර්ශන අත්දැකීම', messageLabel: 'සම්ප්‍රේෂණය කිරීමට පණිවිඩය', messagePlaceholder: 'ප්‍රදර්ශනයේදී මාව හමුවන්න', sendTime: 'කාලය හරහා යවන්න →',
    morseNote: 'මධ්‍ය යුගයේ Morse අත්දැකීම Latin A–Z සඳහා සහාය දක්වයි. වෙනත් අක්ෂර අතුරුදහන් නොවී Unicode කේත ලෙස පෙන්වයි.', truncated: 'ප්‍රදර්ශනය සඳහා ප්‍රතිදානය කෙටි කර ඇත.',
    seconds: 'තත්පර', points: 'ලකුණු', begin: 'අභියෝගය අරඹන්න'
  };

  const en = {};
  $$('[data-i]').forEach((el) => { en[el.dataset.i] ??= el.textContent; });

  function setLang(nextLang) {
    lang = nextLang === 'si' ? 'si' : 'en';
    localStorage.setItem('signal-lang', lang);
    document.documentElement.lang = lang;
    $$('[data-i]').forEach((el) => {
      const key = el.dataset.i;
      el.textContent = lang === 'si' ? (si[key] || en[key] || el.textContent) : (en[key] || el.textContent);
    });
    $$('[data-placeholder-i]').forEach((el) => {
      const key = el.dataset.placeholderI;
      el.placeholder = lang === 'si' ? (si[key] || '') : (en[key] || 'Meet me at the exhibition');
    });
    $('#lang').textContent = lang === 'si' ? 'English' : 'සිංහල';
    $('#lang').setAttribute('aria-label', lang === 'si' ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න');
    if ($('#quiz')?.children.length && challengeActive) renderQuestion();
  }

  $('#lang').addEventListener('click', () => setLang(lang === 'en' ? 'si' : 'en'));

  function focusableElements(modal) {
    return $$('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])', modal).filter((el) => !el.hidden);
  }

  function openModal(id, trigger) {
    const modal = $('#' + id);
    if (!modal) return;
    lastFocused = trigger || document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const first = focusableElements(modal)[0] || $('.panel', modal);
    requestAnimationFrame(() => first?.focus());
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (!$$('.modal.open').length) document.body.classList.remove('modal-open');
    if (modal.id === 'challenge') stopChallenge();
    lastFocused?.focus?.();
  }

  $$('[data-open]').forEach((button) => button.addEventListener('click', () => openModal(button.dataset.open, button)));
  $$('.close').forEach((button) => button.addEventListener('click', () => closeModal(button.closest('.modal'))));
  $$('.modal').forEach((modal) => modal.addEventListener('mousedown', (event) => {
    if (event.target === modal) closeModal(modal);
  }));

  function toast(text) {
    const el = $('#toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => el.classList.remove('show'), 1600);
  }

  $$('[data-lab]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.lab;
    if (action === 'smoke') {
      const out = $('#smokeOut');
      out.textContent = '●   ◌    ◌      ◌';
      setTimeout(() => { out.textContent = '◌ ◌ ◌'; }, 1200);
      toast(lang === 'si' ? 'දුම් සංඥාව යවන ලදී' : 'Smoke signal sent');
    }
    if (action === 'morse' || action === 'dash') {
      morse += action === 'morse' ? '.' : '-';
      $('#morseOut').textContent = morse;
    }
    if (action === 'clear') {
      morse = '';
      $('#morseOut').textContent = lang === 'si' ? 'සූදානම්' : 'READY';
    }
    if (action === 'packet') {
      const out = $('#packetOut');
      out.textContent = '● → ● → ● → ●';
      setTimeout(() => { out.textContent = '● · · · ●'; }, 1200);
      toast(lang === 'si' ? 'දත්ත පැකට්ටුව යවන ලදී' : 'Data packet sent');
    }
  }));

  const morseMap = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
    J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
    S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.'
  };

  function toMorse(text) {
    return [...text.toUpperCase()].map((char) => {
      if (char === ' ') return '/';
      if (morseMap[char]) return morseMap[char];
      const codePoint = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
      return `[U+${codePoint}]`;
    }).join(' ');
  }

  function transmit() {
    const input = $('#message');
    const text = input.value.trim() || input.placeholder || 'Meet me at the exhibition';
    $('#aOut').textContent = text.split(/\s+/).map((word, index) => ['◉', '△', '✦', '≈', '◇'][(word.length + index) % 5] + '·'.repeat(word.length % 4 + 1)).join('  ');
    $('#mOut').textContent = toMorse(text);
    const bytes = [...new TextEncoder().encode(text)];
    const maxBytes = 28;
    $('#dOut').textContent = bytes.slice(0, maxBytes).map((value) => value.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    $('#dTrunc').hidden = bytes.length <= maxBytes;
    toast(lang === 'si' ? 'පණිවිඩය යුග තුනම හරහා ගමන් කළා' : 'Message travelled through all three eras');
  }

  $('#transmit').addEventListener('click', transmit);
  $('#message').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      transmit();
    }
  });

  const questions = [
    ['Which method creates a durable written record?', ['Smoke signal', 'Ola-leaf manuscript', 'Gesture'], 1],
    ['What does ... --- ... mean?', ['SOS', 'NEWS', 'CALL'], 0],
    ['Social platforms are mainly which pattern?', ['One-to-one', 'Many-to-many', 'No transmission'], 1]
  ];
  const siQuestions = [
    ['කල්පවත්නා ලිඛිත වාර්තාවක් නිර්මාණය කරන්නේ කුමන ක්‍රමයද?', ['දුම් සංඥාව', 'ඔලා අත්පිටපත', 'අත් ඉඟිය'], 1],
    ['... --- ... යන්නෙන් අදහස් කරන්නේ?', ['SOS', 'NEWS', 'CALL'], 0],
    ['සමාජ වේදිකා ප්‍රධාන වශයෙන් කුමන සන්නිවේදන රටාවක්ද?', ['එකෙන් එකට', 'බොහෝ දෙනාගෙන් බොහෝ දෙනාට', 'සම්ප්‍රේෂණයක් නැත'], 1]
  ];

  function stopChallenge() {
    challengeActive = false;
    answerLocked = false;
    clearInterval(countdownId);
    clearTimeout(transitionId);
    countdownId = null;
    transitionId = null;
  }

  function rankFor(value) {
    if (value >= 780) return lang === 'si' ? 'සංඥා විශාරද' : 'SIGNAL MASTER';
    if (value >= 600) return lang === 'si' ? 'කාල නාවිකයා' : 'TIME NAVIGATOR';
    if (value >= 350) return lang === 'si' ? 'ජාල ගවේෂකයා' : 'NETWORK EXPLORER';
    return lang === 'si' ? 'කුතුහලයෙන් පිරි සංචාරකයා' : 'CURIOUS TRAVELLER';
  }

  function finishChallenge() {
    if (!challengeActive && $('#quiz').dataset.finished === 'true') return;
    stopChallenge();
    $('#quiz').dataset.finished = 'true';
    const rank = rankFor(score);
    $('#quiz').innerHTML = '';
    const title = document.createElement('h2');
    title.textContent = lang === 'si' ? 'සම්ප්‍රේෂණය සම්පූර්ණයි!' : 'Transmission complete!';
    const summary = document.createElement('p');
    summary.textContent = `${score} ${lang === 'si' ? 'ලකුණු' : 'points'} · ${rank}`;
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = lang === 'si' ? 'ප්‍රතිඵලය පිටපත් කරන්න' : 'Copy result';
    copy.addEventListener('click', async () => {
      const text = `Signal Lanka — ${score} points · ${rank}`;
      try {
        await navigator.clipboard.writeText(text);
        toast(lang === 'si' ? 'ප්‍රතිඵලය පිටපත් කළා' : 'Result copied');
      } catch {
        toast(lang === 'si' ? 'පිටපත් කළ නොහැක' : 'Could not copy result');
      }
    });
    $('#quiz').append(title, summary, copy);
    $('#begin').textContent = lang === 'si' ? 'නැවත අභියෝගය කරන්න' : 'Play again';
    $('#begin').hidden = false;
  }

  function renderQuestion() {
    if (!challengeActive) return;
    if (questionIndex >= 3) return finishChallenge();
    answerLocked = false;
    $('#quiz').dataset.finished = 'false';
    const source = lang === 'si' ? siQuestions : questions;
    const current = source[questionIndex];
    const quiz = $('#quiz');
    quiz.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = `${questionIndex + 1}/3 · ${current[0]}`;
    quiz.appendChild(heading);
    current[1].forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option';
      button.dataset.answer = String(index);
      button.textContent = option;
      button.addEventListener('click', () => chooseAnswer(button, index, current[2]));
      quiz.appendChild(button);
    });
  }

  function chooseAnswer(button, selected, correct) {
    if (!challengeActive || answerLocked) return;
    answerLocked = true;
    const options = $$('.option', $('#quiz'));
    options.forEach((option) => { option.disabled = true; });
    if (selected === correct) {
      score += 200 + Math.max(sec, 0);
      button.classList.add('correct');
    } else {
      button.classList.add('wrong');
      options[correct]?.classList.add('reveal');
    }
    $('#points').textContent = score;
    transitionId = setTimeout(() => {
      if (!challengeActive) return;
      questionIndex += 1;
      renderQuestion();
    }, 500);
  }

  function beginChallenge() {
    stopChallenge();
    sec = 60;
    score = 0;
    questionIndex = 0;
    challengeActive = true;
    answerLocked = false;
    $('#timer').textContent = sec;
    $('#points').textContent = score;
    $('#begin').hidden = true;
    renderQuestion();
    countdownId = setInterval(() => {
      if (!challengeActive) return;
      sec = Math.max(0, sec - 1);
      $('#timer').textContent = sec;
      if (sec === 0) finishChallenge();
    }, 1000);
  }

  $('#begin').addEventListener('click', beginChallenge);

  function handleImageError(img) {
    const parent = img.parentElement;
    if (!parent || parent.querySelector('.image-placeholder')) return;
    img.hidden = true;
    parent.classList.add('loading-error');
    const fallback = document.createElement('div');
    fallback.className = 'image-placeholder';
    fallback.textContent = img.dataset.fallback || (lang === 'si' ? 'රූපය ලබාගත නොහැක' : 'Image unavailable');
    parent.prepend(fallback);
  }

  $$('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => handleImageError(img), { once: true });
    if (img.complete && img.naturalWidth === 0) handleImageError(img);
  });

  const legacyHashes = { '#early': '#ancient', '#written': '#ancient', '#print': '#middle', '#electric': '#middle', '#digital': '#modern' };
  if (legacyHashes[location.hash]) {
    history.replaceState(null, '', legacyHashes[location.hash]);
  }

  document.addEventListener('keydown', (event) => {
    const openModalEl = $('.modal.open');
    if (event.key === 'Escape' && openModalEl) {
      event.preventDefault();
      closeModal(openModalEl);
      return;
    }

    if (openModalEl && event.key === 'Tab') {
      const focusable = focusableElements(openModalEl);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (openModalEl || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) return;
    const targets = { '1': '#ancient', '2': '#middle', '3': '#modern' };
    if (targets[event.key]) {
      event.preventDefault();
      const target = $(targets[event.key]);
      target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      target?.focus({ preventScroll: true });
    }
  });

  setLang(lang);
})();
