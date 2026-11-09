import type { Locale } from '../i18n/locales'

// Search-result text: the page title and the meta description. The text shown
// on the pages themselves lives in products.ts and catalog-i18n.ts.

type SeoCopy = { title: string; description: string }

export const productSeo: Record<Locale, Record<string, SeoCopy>> = {
  nl: {
    'floral-box': {
      title: 'The Floral Box bloemkaarsjes',
      description: 'Geschenkdoos met 9 handgemaakte bloemkaarsjes van sojawas met een frisse, bloemige Bluebell-geur. Een mooi cadeau, met de hand gegoten in Nederland.',
    },
    'floral-basket': {
      title: 'The Floral Basket bloemkaarsjes',
      description: 'Mandje met 8 handgemaakte bloemkaarsjes van sojawas met een zachte, warme English Rose-geur. Een lief cadeau, met de hand gegoten in Nederland.',
    },
    'festive-glow-box': {
      title: 'The Festive Glow Box kerstkaarsjes',
      description: 'Feestelijke doos met 9 handgemaakte bloemkaarsjes met de geur Mulled Wine: warme glühweinkruiden en zoet fruit. Een knus cadeau voor de kerst.',
    },
    'coconut-beach': {
      title: 'Coconut Beach zomerse geurkaars',
      description: 'Handgegoten geurkaarsen in vier vormen geïnspireerd op de zee, met de frisse, tropische geur Coconut Island van ananas, kokos en perzik.',
    },
    'autumn-ember': {
      title: 'Autumn Ember herfstkaars',
      description: 'Knusse herfstkaars van ongeveer 500 g met handgemaakte wasdetails en de warme geur Vanilla & Cinders: rokerige vanille, kruidnagel en cederhout.',
    },
    'pumpkin-spice': {
      title: 'Pumpkin Spice pompoenkaars',
      description: 'Sojawaskaars in een pot in de vorm van een pompoen, afgewerkt met herfstdetails en een warme Pumpkin Spice-geur. Handgemaakt in Nederland.',
    },
    'pumpkin-spice-latte': {
      title: 'Pumpkin Spice Latte geurkaars',
      description: 'Herfstkaars van sojawas met opgeklopte was en handgemaakte details. De warme, romige Pumpkin Spice-geur doet denken aan je favoriete herfstdrankje.',
    },
    'pumpkin-boo': {
      title: 'Pumpkin Boo Halloween kaars',
      description: 'Schattig Halloween-kaarsje met een spookje en een pompoen, handgemaakt van sojawas met een warme, zoete Pumpkin Spice-geur. Ongeveer 50 g.',
    },
    'boo-boo': {
      title: 'Boo Boo spookjeskaars Halloween',
      description: 'Speels spookjeskaarsje van sojawas in een glazen potje, met de warme geur Vanilla & Cinders van vanille, kruidnagel en cederhout. Handgemaakt.',
    },
    'scary-boo': {
      title: 'Scary Boo Halloween kaars',
      description: 'Speels griezelig spookjeskaarsje van sojawas voor een knus Halloween-gevoel, met de volle geur Vanilla & Cinders. Met de hand gegoten, ongeveer 50 g.',
    },
    'hot-cocoa': {
      title: 'Hot Cocoa chocolade geurkaars',
      description: 'Knusse geurkaars in een glazen pot met de geur Pain au Chocolat: rijke chocolade en vers gebakken croissant. Handgemaakt, ongeveer 150 g was.',
    },
    'gluhwein': {
      title: 'Glühwein kerstkaars',
      description: 'Feestelijke kerstkaars met de geur Mulled Wine: warme kruiden en een vol, fruitig karakter, net als een beker glühwein. Handgemaakt, ongeveer 150 g.',
    },
    'winter-wonderland-candle': {
      title: 'Winter Wonderland dennenkaars',
      description: 'Handgemaakte winterkaars met de frisse geur van een bos: dennennaalden, eucalyptus, zilverspar en cederhout. In een lage glazen pot, ongeveer 245 g.',
    },
    'column': {
      title: 'Column sojakaars, geurloos',
      description: 'Geurloze zuilkaars met strakke, geribbelde lijnen, met de hand gegoten van 100% sojawas. Voor wie wil genieten van kaarslicht zonder toegevoegde geur.',
    },
    'pillar': {
      title: 'Pillar stompkaars, geurloos',
      description: 'Geribbelde stompkaars voor op tafel of in je favoriete hoekje, met de hand gegoten van 100% sojawas. Geurloos en in een eenvoudige vorm.',
    },
    'spiral': {
      title: 'Spiral gedraaide kaars, geurloos',
      description: 'Gedraaide kaars met zachte rondingen, met de hand gegoten van 100% sojawas. Geurloos en sculpturaal, een mooi sfeerstuk voor in huis.',
    },
    'shell': {
      title: 'Shell schelpkaars, geurloos',
      description: 'Kaars met gebogen lijnen geïnspireerd op een schelp, met de hand gegoten van 100% sojawas. Geurloos, een kleine herinnering aan de zee voor in huis.',
    },
    'arch': {
      title: 'Arch boogkaars, geurloos',
      description: 'Kaars in een eenvoudige boogvorm, mooi op zichzelf of naast je favoriete spulletjes. Met de hand gemaakt van 100% sojawas en zonder toegevoegde geur.',
    },
    'bubble': {
      title: 'Bubble sojakaars, geurloos',
      description: 'Speelse bubbelkaars met ronde vormen, met de hand gegoten van 100% sojawas. Geurloos en klein genoeg voor elk favoriet hoekje in huis.',
    },
    'ghostlight-dinner-candle': {
      title: 'Ghostlight dinerkaars Halloween',
      description: 'Elegante, speels griezelige dinerkaars voor je Halloween-tafel. Geurloos, met de hand gegoten van 100% natuurlijke sojawas en ongeveer 20 cm hoog.',
    },
    'christmas-bubble-candle': {
      title: 'Christmas Bubble kerstkaars',
      description: 'Handgemaakte bubbelkaars in feestelijke kleuren, geurloos en van 100% natuurlijke sojawas. Een kleine kerstdecoratie of een lief cadeautje.',
    },
    'christmas-tree-dinner-candle': {
      title: 'Christmas Tree dinerkaars',
      description: 'Handgemaakte dinerkaars in de vorm van een kerstboom, perfect voor je kersttafel of als seizoensdecoratie. Geurloos en van 100% natuurlijke sojawas.',
    },
    'twisted-tree-candle': {
      title: 'Twisted Tree kerstkaars',
      description: 'Handgemaakte kaars met een vloeiende, gedraaide vorm en een feestelijke uitstraling. Geurloos, van 100% natuurlijke sojawas en ongeveer 12 cm hoog.',
    },
    'pumpkin-spice-wax-melts': {
      title: 'Pumpkin Spice wax melts',
      description: 'Kleine wax melts in de vorm van pompoentjes met een warme Pumpkin Spice-geur. Met de hand gegoten van sojawas, ongeveer 70 g per zakje.',
    },
    'sweet-christmas-wax-melts': {
      title: 'Sweet Christmas wax melts',
      description: 'Doosje met 8 handgemaakte wax melts in kerstvormen met de geur Pain au Chocolat: rijke chocolade en zoet gebak. Ongeveer 45 g was, voor je waxbrander.',
    },
    'white-christmas-wax-melts': {
      title: 'White Christmas wax melts',
      description: 'Doosje met 7 handgemaakte wax melts, een grote sneeuwvlok en 6 boompjes, met de frisse kerstgeur van framboos, sinaasappel, kruidnagel en den.',
    },
  },
  en: {
    'floral-box': {
      title: 'The Floral Box Flower Candles',
      description: 'Gift box with 9 handmade soy wax flower candles in a fresh, floral Bluebell scent. A lovely gift, poured by hand in the Netherlands.',
    },
    'floral-basket': {
      title: 'The Floral Basket Flower Candles',
      description: 'Basket with 8 handmade soy wax flower candles in a soft, warm English Rose scent. A sweet gift, poured by hand in the Netherlands.',
    },
    'festive-glow-box': {
      title: 'The Festive Glow Box Christmas Candles',
      description: 'Festive box with 9 handmade flower candles in the Mulled Wine scent: warm mulled spices and sweet fruit. A cosy Christmas gift.',
    },
    'coconut-beach': {
      title: 'Coconut Beach Summer Scented Candle',
      description: 'Hand-poured scented candles in four shapes inspired by the sea, with the fresh, tropical Coconut Island scent of pineapple, coconut and peach.',
    },
    'autumn-ember': {
      title: 'Autumn Ember Scented Candle',
      description: 'Cosy autumn candle of about 500 g with handmade wax details and the warm Vanilla & Cinders scent: smoky vanilla, clove and cedarwood.',
    },
    'pumpkin-spice': {
      title: 'Pumpkin Spice Pumpkin-Shaped Candle',
      description: 'Soy wax candle in a pumpkin-shaped jar, finished with autumn details and a warm Pumpkin Spice scent. Handmade in the Netherlands.',
    },
    'pumpkin-spice-latte': {
      title: 'Pumpkin Spice Latte Scented Candle',
      description: 'Autumn soy wax candle topped with whipped wax and handmade details. The warm, creamy Pumpkin Spice scent recalls your favourite autumn drink.',
    },
    'pumpkin-boo': {
      title: 'Pumpkin Boo Halloween Candle',
      description: 'Cute Halloween candle with a little ghost and a pumpkin, handmade from soy wax in a warm, sweet Pumpkin Spice scent. About 50 g.',
    },
    'boo-boo': {
      title: 'Boo Boo Ghost Halloween Candle',
      description: 'Playful ghost candle of soy wax in a glass jar, with the warm Vanilla & Cinders scent of vanilla, clove and cedarwood. Handmade.',
    },
    'scary-boo': {
      title: 'Scary Boo Halloween Candle',
      description: 'Playfully spooky ghost candle of soy wax for a cosy Halloween feel, with the rich Vanilla & Cinders scent. Poured by hand, about 50 g.',
    },
    'hot-cocoa': {
      title: 'Hot Cocoa Chocolate Scented Candle',
      description: 'Cosy scented candle in a glass jar with the Pain au Chocolat scent: rich chocolate and freshly baked croissant. Handmade, about 150 g of wax.',
    },
    'gluhwein': {
      title: 'Glühwein Christmas Candle',
      description: 'Festive Christmas candle in the Mulled Wine scent: warm spices and a rich, fruity character, just like a mug of glühwein. Handmade, about 150 g.',
    },
    'winter-wonderland-candle': {
      title: 'Winter Wonderland Pine Candle',
      description: 'Handmade winter candle with the fresh scent of a forest: pine needles, eucalyptus, silver fir and cedarwood. In a low glass jar, about 245 g.',
    },
    'column': {
      title: 'Column Soy Candle, Unscented',
      description: 'Unscented column candle with clean, ribbed lines, poured by hand from 100% soy wax. For enjoying candlelight without any added fragrance.',
    },
    'pillar': {
      title: 'Pillar Candle, Unscented',
      description: 'Ribbed pillar candle for the table or your favourite corner, poured by hand from 100% soy wax. Unscented and simple in shape.',
    },
    'spiral': {
      title: 'Spiral Twisted Candle, Unscented',
      description: 'Twisted candle with soft curves, poured by hand from 100% soy wax. Unscented and sculptural, a lovely decorative piece for your home.',
    },
    'shell': {
      title: 'Shell-Shaped Candle, Unscented',
      description: 'Candle with curved lines inspired by a seashell, poured by hand from 100% soy wax. Unscented, a small reminder of the sea for your home.',
    },
    'arch': {
      title: 'Arch Candle, Unscented',
      description: 'Candle in a simple arch shape, lovely alone or beside your favourite things. Handmade from 100% soy wax with no added fragrance.',
    },
    'bubble': {
      title: 'Bubble Soy Candle, Unscented',
      description: 'Playful bubble candle with round shapes, poured by hand from 100% soy wax. Unscented and small enough for any favourite corner of your home.',
    },
    'ghostlight-dinner-candle': {
      title: 'Ghostlight Halloween Dinner Candle',
      description: 'Elegant, playfully spooky dinner candle for your Halloween table. Unscented, poured by hand from 100% natural soy wax, about 20 cm tall.',
    },
    'christmas-bubble-candle': {
      title: 'Christmas Bubble Candle',
      description: 'Handmade bubble candle in festive colours, unscented and made of 100% natural soy wax. A small Christmas decoration or a sweet little gift.',
    },
    'christmas-tree-dinner-candle': {
      title: 'Christmas Tree Dinner Candle',
      description: 'Handmade dinner candle shaped like a Christmas tree, perfect for your festive table or as seasonal decor. Unscented, 100% natural soy wax.',
    },
    'twisted-tree-candle': {
      title: 'Twisted Tree Christmas Candle',
      description: 'Handmade candle with a flowing, twisted shape and a festive look. Unscented, made of 100% natural soy wax and about 12 cm tall.',
    },
    'pumpkin-spice-wax-melts': {
      title: 'Pumpkin Spice Wax Melts',
      description: 'Small pumpkin-shaped wax melts with a warm Pumpkin Spice scent. Poured by hand from soy wax, about 70 g per bag, for your wax warmer.',
    },
    'sweet-christmas-wax-melts': {
      title: 'Sweet Christmas Wax Melts',
      description: 'Box of 8 handmade wax melts in Christmas shapes with the Pain au Chocolat scent: rich chocolate and sweet pastry. About 45 g, for your warmer.',
    },
    'white-christmas-wax-melts': {
      title: 'White Christmas Wax Melts',
      description: 'Box of 7 handmade wax melts, one large snowflake and 6 little trees, in a fresh Christmas scent of raspberry, orange, clove and pine.',
    },
  },
  de: {
    'floral-box': {
      title: 'The Floral Box Blumenkerzen',
      description: 'Geschenkbox mit 9 handgemachten Blumenkerzen aus Sojawachs mit frischem, blumigem Bluebell-Duft. Ein schönes Geschenk, von Hand gegossen.',
    },
    'floral-basket': {
      title: 'The Floral Basket Blumenkerzen',
      description: 'Körbchen mit 8 handgemachten Blumenkerzen aus Sojawachs mit sanftem, warmem English-Rose-Duft. Ein liebes Geschenk, von Hand gegossen.',
    },
    'festive-glow-box': {
      title: 'The Festive Glow Box Weihnachtskerzen',
      description: 'Festliche Box mit 9 handgemachten Blumenkerzen mit dem Duft Mulled Wine: warme Glühweingewürze und süße Früchte. Ein Geschenk zu Weihnachten.',
    },
    'coconut-beach': {
      title: 'Coconut Beach Sommer-Duftkerze',
      description: 'Handgegossene Duftkerzen in vier Formen, inspiriert vom Meer, mit dem frischen, tropischen Duft Coconut Island nach Ananas, Kokos und Pfirsich.',
    },
    'autumn-ember': {
      title: 'Autumn Ember Herbstkerze',
      description: 'Gemütliche Herbstkerze mit etwa 500 g, handgemachten Wachsdetails und dem warmen Duft Vanilla & Cinders: rauchige Vanille, Nelke und Zedernholz.',
    },
    'pumpkin-spice': {
      title: 'Pumpkin Spice Kürbiskerze',
      description: 'Sojawachskerze im kürbisförmigen Glas, verziert mit Herbstdetails und einem warmen Pumpkin-Spice-Duft. Handgemacht in den Niederlanden.',
    },
    'pumpkin-spice-latte': {
      title: 'Pumpkin Spice Latte Duftkerze',
      description: 'Herbstkerze aus Sojawachs mit aufgeschlagenem Wachs und handgemachten Details. Der warme, cremige Duft erinnert an dein liebstes Herbstgetränk.',
    },
    'pumpkin-boo': {
      title: 'Pumpkin Boo Halloween-Kerze',
      description: 'Süße Halloween-Kerze mit Gespenst und Kürbis, handgemacht aus Sojawachs mit warmem, süßem Pumpkin-Spice-Duft. Etwa 50 g Wachs im Glas.',
    },
    'boo-boo': {
      title: 'Boo Boo Gespenst-Kerze Halloween',
      description: 'Verspielte Gespensterkerze aus Sojawachs im Glas, mit dem warmen Duft Vanilla & Cinders nach Vanille, Nelke und Zedernholz. Handgemacht.',
    },
    'scary-boo': {
      title: 'Scary Boo Halloween-Kerze',
      description: 'Verspielt gruselige Gespensterkerze aus Sojawachs für gemütliche Halloween-Stimmung, mit dem vollen Duft Vanilla & Cinders. Etwa 50 g.',
    },
    'hot-cocoa': {
      title: 'Hot Cocoa Schokoladen-Duftkerze',
      description: 'Gemütliche Duftkerze im Glas mit dem Duft Pain au Chocolat: reiche Schokolade und frisch gebackenes Croissant. Handgemacht, etwa 150 g Wachs.',
    },
    'gluhwein': {
      title: 'Glühwein Weihnachtskerze',
      description: 'Festliche Weihnachtskerze mit dem Duft Mulled Wine: warme Gewürze und eine volle, fruchtige Note wie eine Tasse Glühwein. Etwa 150 g Wachs.',
    },
    'winter-wonderland-candle': {
      title: 'Winter Wonderland Tannenduft-Kerze',
      description: 'Handgemachte Winterkerze mit dem frischen Duft des Waldes: Kiefernnadeln, Eukalyptus, Silbertanne und Zedernholz. Im flachen Glas, etwa 245 g.',
    },
    'column': {
      title: 'Column Sojakerze, duftfrei',
      description: 'Duftfreie Säulenkerze mit klaren, gerippten Linien, von Hand aus 100 % Sojawachs gegossen. Für Kerzenlicht ohne zugesetzten Duft.',
    },
    'pillar': {
      title: 'Pillar Stumpenkerze, duftfrei',
      description: 'Gerippte Stumpenkerze für den Tisch oder deine Lieblingsecke, von Hand aus 100 % Sojawachs gegossen. Duftfrei und schlicht in der Form.',
    },
    'spiral': {
      title: 'Spiral gedrehte Kerze, duftfrei',
      description: 'Gedrehte Kerze mit sanften Rundungen, von Hand aus 100 % Sojawachs gegossen. Duftfrei und skulptural, ein schönes Stück für dein Zuhause.',
    },
    'shell': {
      title: 'Shell Muschelkerze, duftfrei',
      description: 'Kerze mit geschwungenen Linien, inspiriert von einer Muschel, von Hand aus 100 % Sojawachs gegossen. Duftfrei, eine Erinnerung ans Meer.',
    },
    'arch': {
      title: 'Arch Bogenkerze, duftfrei',
      description: 'Kerze in schlichter Bogenform, schön allein oder neben deinen Lieblingsstücken. Von Hand aus 100 % Sojawachs, ohne zugesetzten Duft.',
    },
    'bubble': {
      title: 'Bubble Sojakerze, duftfrei',
      description: 'Verspielte Bubble-Kerze mit runden Formen, von Hand aus 100 % Sojawachs gegossen. Duftfrei und klein genug für jede Lieblingsecke.',
    },
    'ghostlight-dinner-candle': {
      title: 'Ghostlight Halloween-Tafelkerze',
      description: 'Elegante, verspielt gruselige Tafelkerze für deinen Halloween-Tisch. Duftfrei, von Hand aus 100 % natürlichem Sojawachs, etwa 20 cm hoch.',
    },
    'christmas-bubble-candle': {
      title: 'Christmas Bubble Weihnachtskerze',
      description: 'Handgemachte Bubble-Kerze in festlichen Farben, duftfrei und aus 100 % natürlichem Sojawachs. Kleine Weihnachtsdeko oder ein süßes Geschenk.',
    },
    'christmas-tree-dinner-candle': {
      title: 'Christmas Tree Tafelkerze',
      description: 'Handgemachte Tafelkerze in Form eines Weihnachtsbaums, perfekt für die festliche Tafel oder als Deko. Duftfrei, aus 100 % natürlichem Sojawachs.',
    },
    'twisted-tree-candle': {
      title: 'Twisted Tree Weihnachtskerze',
      description: 'Handgemachte Kerze mit fließender, gedrehter Form und festlicher Ausstrahlung. Duftfrei, aus 100 % natürlichem Sojawachs, etwa 12 cm hoch.',
    },
    'pumpkin-spice-wax-melts': {
      title: 'Pumpkin Spice Duftwachs Wax Melts',
      description: 'Kleine Wax Melts in Kürbisform mit warmem Pumpkin-Spice-Duft. Von Hand aus Sojawachs gegossen, etwa 70 g pro Beutel, für deine Duftlampe.',
    },
    'sweet-christmas-wax-melts': {
      title: 'Sweet Christmas Duftwachs Wax Melts',
      description: 'Schachtel mit 8 handgemachten Wax Melts in Weihnachtsformen mit dem Duft Pain au Chocolat: Schokolade und süßes Gebäck. Etwa 45 g Wachs.',
    },
    'white-christmas-wax-melts': {
      title: 'White Christmas Duftwachs Wax Melts',
      description: 'Schachtel mit 7 handgemachten Wax Melts, einer großen Schneeflocke und 6 Bäumchen, mit frischem Weihnachtsduft nach Himbeere, Orange und Tanne.',
    },
  },
}

export const collectionSeo: Record<Locale, Record<string, SeoCopy>> = {
  nl: {
    'little-glow': {
      title: 'Bloemkaarsjes en geurende theelichtjes',
      description: 'Handgegoten bloemkaarsjes van sojawas in doosjes en mandjes, met een subtiele geur. Een mooi cadeau of een klein boeket voor jezelf.',
    },
    'scented-glow': {
      title: 'Geurkaarsen van sojawas, handgemaakt',
      description: 'Handgemaakte geurkaarsen, van Coconut Island tot Pumpkin Spice en Mulled Wine. Vind een warme geur voor jouw favoriete tijd van het jaar.',
    },
    'natural-glow': {
      title: 'Geurloze sojakaarsen in sculpturale vormen',
      description: 'Geurloze kaarsen van 100% sojawas in eenvoudige, sculpturale vormen. Met de hand gegoten, voor kaarslicht zonder toegevoegde geur.',
    },
    'wax-melts': {
      title: 'Wax melts van sojawas, handgemaakt',
      description: 'Handgegoten wax melts van sojawas in kleine seizoensvormen, voor je waxbrander. Ze vullen je huis met een warme, troostende geur.',
    },
  },
  en: {
    'little-glow': {
      title: 'Flower Candles & Scented Tealights',
      description: 'Hand-poured soy wax flower candles in boxes and baskets, with a subtle scent. A lovely gift or a little bouquet for yourself.',
    },
    'scented-glow': {
      title: 'Handmade Soy Scented Candles',
      description: 'Handmade scented candles, from Coconut Island to Pumpkin Spice and Mulled Wine. Find a warm scent for your favourite time of year.',
    },
    'natural-glow': {
      title: 'Unscented Soy Candles in Sculptural Shapes',
      description: 'Unscented candles of 100% soy wax in simple, sculptural shapes. Poured by hand, for candlelight without any added fragrance.',
    },
    'wax-melts': {
      title: 'Handmade Soy Wax Melts',
      description: 'Hand-poured soy wax melts in small seasonal shapes for your wax warmer. They fill your home with a warm, comforting fragrance.',
    },
  },
  de: {
    'little-glow': {
      title: 'Blumenkerzen und duftende Teelichter',
      description: 'Handgegossene Blumenkerzen aus Sojawachs in Boxen und Körbchen, mit dezentem Duft. Ein schönes Geschenk oder ein kleiner Strauß für dich.',
    },
    'scented-glow': {
      title: 'Handgemachte Duftkerzen aus Sojawachs',
      description: 'Handgemachte Duftkerzen, von Coconut Island bis Pumpkin Spice und Mulled Wine. Finde einen warmen Duft für deine liebste Jahreszeit.',
    },
    'natural-glow': {
      title: 'Duftfreie Sojakerzen in skulpturalen Formen',
      description: 'Duftfreie Kerzen aus 100 % Sojawachs in schlichten, skulpturalen Formen. Von Hand gegossen, für Kerzenlicht ohne zugesetzten Duft.',
    },
    'wax-melts': {
      title: 'Handgemachte Wax Melts aus Sojawachs',
      description: 'Handgegossene Wax Melts aus Sojawachs in kleinen saisonalen Formen für deine Duftlampe. Sie füllen dein Zuhause mit warmem, wohligem Duft.',
    },
  },
}

/** The title as it appears in search results and on the browser tab. */
export function seoTitle(title: string): string {
  return `${title} · EarthyGlow`
}
