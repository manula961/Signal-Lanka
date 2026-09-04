const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const root=document.documentElement;

// Scroll progress and subtle pointer glow
addEventListener('scroll',()=>{const max=root.scrollHeight-innerHeight; $('.progress span').style.width=`${max?scrollY/max*100:0}%`;});
addEventListener('pointermove',e=>{const g=$('.cursor-glow'); if(g) g.style.transform=`translate(${e.clientX-210}px,${e.clientY-210}px)`;});

// Reveal on scroll
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

// Active timeline era
const eraObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const id=e.target.id; $$('.rail-node').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${id}`));}}),{rootMargin:'-35% 0px -50% 0px',threshold:0});
$$('.era').forEach(el=>eraObserver.observe(el));

// Mobile menu
const menuToggle=$('#menuToggle'), mobileMenu=$('#mobileMenu');
menuToggle.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuToggle.setAttribute('aria-expanded',open);mobileMenu.setAttribute('aria-hidden',!open)});
$$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}));

// Bilingual mode
let lang='en';
$('#langToggle').addEventListener('click',()=>{lang=lang==='en'?'si':'en'; $$('[data-en]').forEach(el=>{el.textContent=el.dataset[lang]}); const spans=$$('#langToggle span'); spans[0].classList.toggle('active',lang==='en'); spans[1].classList.toggle('active',lang==='si'); document.documentElement.lang=lang==='si'?'si':'en';});

// Morse and binary converter
const morse={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'};
function encode(){const text=$('#encodeInput').value.toUpperCase(); $('#morseOutput').textContent=text.split('').map(c=>c===' '?' / ':(morse[c]||'?')).join(' '); $('#binaryOutput').textContent=[...text].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ')}
$('#encodeInput').addEventListener('input',encode); encode();

// Quiz
$('#quizForm').addEventListener('submit',e=>{e.preventDefault();let score=0;$$('#quizForm fieldset').forEach(fs=>{$$('label',fs).forEach(l=>l.classList.remove('correct','wrong'));const chosen=$('input:checked',fs);if(!chosen)return;const good=chosen.value===fs.dataset.answer;if(good)score++;chosen.closest('label').classList.add(good?'correct':'wrong');if(!good){const right=$(`input[value="${fs.dataset.answer}"]`,fs);if(right)right.closest('label').classList.add('correct')}});$('#scoreValue').textContent=score;const msg=$('#quizMessage');msg.textContent=lang==='si'?`ඔබ ලබාගත්තේ ${score}/5 යි.`:`You scored ${score}/5. ${score===5?'Excellent — timeline mastered.':score>=3?'Good work — explore the eras once more to reach 5/5.':'Keep exploring the timeline and try again.'}`;msg.scrollIntoView({block:'nearest',behavior:'smooth'});});
