import { aboutImage } from '../../../data/products'
import { defineCopy, Link, useCopy } from '../../../i18n'
import { imageAttrs, SIZES } from '../../../lib/images'
import { Reveal } from '../../../components/ui/Reveal'

const teaserCopy = defineCopy({
  en: {
    imageAlt: 'EarthyGlow candles and natural materials',
    eyebrow: 'Our story',
    title: 'A little warmth, made by hand',
    p1: 'I’m Naomi, and I make EarthyGlow candles here in the Netherlands. My work in social care reminds me how much small moments of comfort matter, especially on cold, dark days. Making candles is my way of bringing a little warmth and light to winter evenings at home.',
    p2: 'This season, I’m drawn to frosty woodland walks, warm winter scents and the quiet glow of candlelight. I hope you find something for your cosiest corner, or a thoughtful gift for someone close to you.',
    list: ['100% soy wax', 'Poured by hand in small batches', 'Shapes and colours inspired by nature'],
    cta: 'Read the full story',
  },
  nl: {
    imageAlt: 'EarthyGlow-kaarsen en natuurlijke materialen',
    eyebrow: 'Ons verhaal',
    title: 'Een beetje warmte, met de hand gemaakt',
    p1: 'Ik ben Naomi en ik maak EarthyGlow-kaarsen hier in Nederland. Mijn werk in de zorg herinnert me eraan hoe belangrijk kleine momenten van comfort zijn, vooral op koude, donkere dagen. Kaarsen maken is mijn manier om een beetje warmte en licht te brengen in winteravonden thuis.',
    p2: 'Dit seizoen word ik geïnspireerd door ijzige boswandelingen, warme wintergeuren en de stille gloed van kaarslicht. Ik hoop dat je iets vindt voor je knusste hoekje, of een attent cadeau voor iemand die je dierbaar is.',
    list: ['100% sojawas', 'Met de hand gegoten in kleine batches', 'Vormen en kleuren geïnspireerd op de natuur'],
    cta: 'Lees het hele verhaal',
  },
  de: {
    imageAlt: 'EarthyGlow Kerzen und natürliche Materialien',
    eyebrow: 'Unsere Geschichte',
    title: 'Ein wenig Wärme, von Hand gemacht',
    p1: 'Ich bin Naomi und mache EarthyGlow Kerzen hier in den Niederlanden. Meine Arbeit im sozialen Bereich erinnert mich daran, wie wichtig kleine Momente der Geborgenheit sind, besonders an kalten, dunklen Tagen. Kerzen zu gießen ist meine Art, ein bisschen Wärme und Licht in Winterabende zu Hause zu bringen.',
    p2: 'In dieser Saison inspirieren mich frostige Waldspaziergänge, warme Winterdüfte und das stille Leuchten von Kerzenlicht. Ich hoffe, du findest etwas für deine gemütlichste Ecke oder ein liebevolles Geschenk für einen besonderen Menschen.',
    list: ['100 % Sojawachs', 'Von Hand in kleinen Chargen gegossen', 'Formen und Farben, inspiriert von der Natur'],
    cta: 'Die ganze Geschichte lesen',
  },
})

export function AboutTeaser() {
  const copy = useCopy(teaserCopy)
  return (
    <section className="about" id="about">
      <div className="container about-grid">
        <Reveal className="about-visual">
          <img
            {...imageAttrs(aboutImage, SIZES.feature)}
            alt={copy.imageAlt}
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={100} className="about-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.p1}</p>
          <p>{copy.p2}</p>
          <ul className="about-list">
            {copy.list.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <Link to="/about" className="btn btn-primary" prefetch="intent">
            {copy.cta}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
