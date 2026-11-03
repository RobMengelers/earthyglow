import type { Locale } from '../i18n/locales'

// Dutch and German catalog copy. English lives on the products, collections and
// seasons themselves; product names, collection titles and fragrance names are
// names and stay as they are in every language. Paragraphs are separated with
// ' \n\n ' just like the English descriptions.

type Translated = Exclude<Locale, 'en'>

export const productDescriptions: Record<Translated, Record<string, string>> = {
  nl: {
    'floral-box':
      'Breng een zachte bloemige touch in huis met onze Bluebell Floral Box. De doos bevat 9 handgemaakte bloemkaarsjes, subtiel geurend naar Bluebell. \n\n De geur is fris, bloemig en elegant, en opent met tonen van boshyacint en hyacint, gevolgd door een zacht bloemig hart van lavendel, galbanum, roos en jasmijn, en sluit af met een warme vleug musk. \n\n De kaarsjes zijn samen gemaakt van ongeveer 220 g 100% natuurlijke sojawas. Elke bloem wordt met de hand gegoten, waardoor elke doos uniek is. \n\n Belangrijk: haal de kaarsjes altijd uit de doos voordat je ze aansteekt. Brand de kaarsjes nooit terwijl ze nog in de cadeaudoos zitten. \n\n 9 kaarsjes | Ca. 220 g sojawas | Geur: Bluebell',
    'floral-basket':
      'Breng een zachte bloemige touch in huis met onze English Rose Floral Basket. Het mandje bevat 8 handgemaakte bloemkaarsjes, subtiel geurend naar English Rose. \n\n De geur is zacht, warm en elegant, en opent met zoete tonen van vanille en citrus, gevolgd door een groen, fruitig en licht kruidig hart, en sluit af met een warme basis van musk, houtige tonen en balsemachtige accenten. \n\n De kaarsjes zijn samen gemaakt van ongeveer 150 g 100% natuurlijke sojawas. Elke bloem wordt met de hand gegoten, waardoor elk mandje uniek is. \n\n Belangrijk: haal de kaarsjes altijd uit het mandje voordat je ze aansteekt. Brand de kaarsjes nooit terwijl ze nog in het mandje zitten. \n\n 8 kaarsjes | Ca. 150 g sojawas | Geur: English Rose',
    'festive-glow-box':
      'Haal de warmte van kerst in huis met onze Festive Glow Box. De doos bevat 9 handgemaakte bloemkaarsjes, geurend naar Mulled Wine. \n\n De geur is warm, vol en feestelijk, met het knusse karakter van gekruide wijn, zoet fruit en verwarmende kerstkruiden. Het geeft dat vertrouwde wintergevoel van een dampend glas glühwein op een koude decemberavond. \n\n De kaarsjes zijn samen gemaakt van ongeveer 170 g was en de doos is ongeveer 20 cm hoog. \n\n Belangrijk: haal de kaarsjes altijd uit de doos voordat je ze aansteekt. De decoratieve materialen in de doos zijn brandbaar en mogen nooit in aanraking komen met een open vlam. \n\n 9 kaarsjes | Ca. 170 g was | Ca. 20 cm hoog | Geur: Mulled Wine',
    'coconut-beach':
      'Haal een stukje zomer in huis met onze Coconut Island-kaarsen. Elke kaars wordt los met de hand gegoten in een van vier vormen geïnspireerd op de zee, en geurt naar Coconut Island. \n\n De geur is fris, romig en tropisch, en opent met sappige tonen van ananas en sinaasappel, gevolgd door een zacht hart van romige kokos, en sluit af met zachte amandel en perzik. \n\n Omdat elk ontwerp een andere maat heeft, bevatten de kaarsen ongeveer 75 g tot 250 g 100% natuurlijke sojawas. Het grootste ontwerp is ongeveer 7 cm hoog. \n\n Elke kaars wordt met de hand gegoten en afgewerkt, waardoor elk exemplaar uniek is. \n\n Ca. 75–250 g sojawas | Tot ca. 7 cm hoog | Geur: Coconut Island',
    'autumn-ember':
      'Haal de warmte van de herfst in huis met deze knusse seizoenskaars, afgewerkt met verfijnde, met de hand gegoten wasdetails die geïnspireerd zijn op het seizoen. \n\n De geur Vanilla & Cinders is warm, vol en troostend, en combineert rokerige vanille, zachte kruidnagel, cederhout, gloeiend amber en musk. Het geeft het knusse gevoel van een frisse herfstavond binnen. \n\n De kaars bevat ongeveer 500 g was en de pot is ongeveer 15 cm hoog. Elke kaars wordt met de hand afgewerkt, waardoor elk exemplaar uniek is. \n\n Ca. 500 g was | Ca. 15 cm hoog | Geur: Vanilla & Cinders',
    'pumpkin-spice':
      'Een sojawaskaars in een pot in de vorm van een pompoen, afgewerkt met herfstdetails en een warme Pumpkin Spice-geur. Een beetje seizoenskleur voor in huis.',
    'pumpkin-spice-latte':
      'Haal het knusse gevoel van je favoriete herfstdrankje in huis met onze Pumpkin Spice Latte-kaars. Afgewerkt met opgeklopte was en handgemaakte seizoensdetails, ziet deze kaars er bijna goed genoeg uit om op te drinken. \n\n De geur Pumpkin Spice is warm, zoet en troostend, met het vertrouwde knusse karakter van herfstkruiden en een zachte, romige zoetheid. \n\n De kaars bevat ongeveer 150 g sojawas en de pot is ongeveer 9 cm hoog. Elke kaars wordt met de hand gegoten en afgewerkt, waardoor elk exemplaar uniek is. \n\n Ca. 150 g sojawas | Ca. 9 cm hoog | Geur: Pumpkin Spice',
    'pumpkin-boo':
      'Breng een speelse herfsttouch in huis met onze Pumpkin Boo-kaars. Met een schattig ontwerp van een spookje en een pompoen zit dit kaarsje vol knusse seizoenscharme. \n\n De geur Pumpkin Spice is warm, zoet en troostend, met het vertrouwde knusse karakter van herfstkruiden en een zachte, romige zoetheid. \n\n De kaars bevat ongeveer 50 g sojawas en zit in een glazen potje van ongeveer 9 cm hoog. Elke kaars wordt met de hand gegoten en afgewerkt, waardoor elk exemplaar uniek is. \n\n Ca. 50 g sojawas | Ca. 9 cm hoog | Geur: Pumpkin Spice',
    'boo-boo':
      'Breng een knusse Halloween-touch in huis met onze Boo Boo-kaars. Met een speels spookjesontwerp combineert deze kaars seizoenscharme met een warme, troostende geur. \n\n De geur Vanilla & Cinders mengt rokerige vanille, zachte kruidnagel, cederhout, amber en musk tot een volle, knusse geur die perfect past bij frisse herfstavonden. \n\n De kaars bevat ongeveer 50 g sojawas en zit in een glazen potje van ongeveer 9 cm hoog. Elke kaars wordt met de hand gegoten en afgewerkt, waardoor elk exemplaar uniek is. \n\n Ca. 50 g sojawas | Ca. 9 cm hoog | Geur: Vanilla & Cinders',
    'scary-boo':
      'Breng een speels griezelige touch in huis met onze Scary Boo-kaars. Met een ontwerp geïnspireerd op een spookje is dit kaarsje perfect om je huis een knus Halloween-gevoel te geven. \n\n De geur Vanilla & Cinders mengt rokerige vanille, zachte kruidnagel, cederhout, amber en musk tot een warme, volle en licht mysterieuze geur voor frisse herfstavonden. \n\n De kaars bevat ongeveer 50 g sojawas en zit in een glazen potje van ongeveer 9 cm hoog. Elke kaars wordt met de hand gegoten en afgewerkt, waardoor elk exemplaar uniek is. \n\n Ca. 50 g sojawas | Ca. 9 cm hoog | Geur: Vanilla & Cinders',
    'hot-cocoa':
      'Breng wat extra gezelligheid in huis met onze Hot Cocoa-kaars. Met de geur Pain au Chocolat vult deze warme, verwennende geur je huis met het troostende aroma van rijke chocolade en vers gebakken croissant. \n\n Met de hand gemaakt met ongeveer 150 g was in een glazen pot van zo’n 9 cm hoog: de perfecte knusse kaars voor de koudere maanden. \n\n Ca. 150 g was | Ca. 9 cm hoog | Geur: Pain au Chocolat',
    gluhwein:
      'Haal het warme, feestelijke kerstgevoel in huis met onze Glühwein-kaars. Met de geur Mulled Wine combineert deze knusse geur warme kruiden met een vol, fruitig karakter, geïnspireerd op een klassieke beker glühwein. \n\n Met de hand gemaakt met ongeveer 150 g was in een glazen pot van zo’n 9 cm hoog: een perfecte kaars voor knusse winteravonden en de feestdagen. \n\n Ca. 150 g was | Ca. 9 cm hoog | Geur: Mulled Wine',
    'winter-wonderland-candle':
      'Haal het frisse gevoel van een winterbos in huis met onze Winter Wonderland-kaars. De geur opent met frisse tonen van dennennaalden, cipres, eucalyptus en pepermunt, gevolgd door een warm hart van zilverspar. Cederhout en harsige basistonen geven de geur een diepe, houtige en troostende afdronk. \n\n De kaars is met de hand gemaakt met ongeveer 245 g was en zit in een lage glazen pot van zo’n 7 cm hoog en ongeveer 12 cm in doorsnee. \n\n Ca. 245 g was | Ca. 7 cm hoog | Ca. 12 cm doorsnee | Geur: Nordic Cedar',
    column:
      'Strakke, geribbelde lijnen en een eenvoudige zuilvorm, met de hand gegoten van 100% sojawas. Geurloos, zodat je van het kaarslicht geniet zonder toegevoegde geur.',
    pillar:
      'Een geribbelde stompkaars voor op tafel of in een favoriet hoekje in huis. Ik giet hem met de hand van 100% sojawas en laat hem geurloos.',
    spiral:
      'Zachte draaiingen en ronde lijnen geven deze kaars haar vorm. Met de hand gegoten van 100% sojawas, zonder toegevoegde geur.',
    shell:
      'Een kleine herinnering aan de zee, met gebogen lijnen geïnspireerd op een schelp. Met de hand gegoten van 100% sojawas, zonder toegevoegde geur.',
    arch:
      'Een eenvoudige boogvorm die mooi staat op zichzelf of naast je favoriete spulletjes. Met de hand gemaakt van 100% sojawas, zonder toegevoegde geur.',
    bubble:
      'Ronde, speelse bubbels in een kaars die je in een favoriet hoekje kwijt kunt. Ik giet hem met de hand van 100% sojawas en laat hem geurloos.',
    'ghostlight-dinner-candle':
      'Geef je tafel een speels griezelige touch met onze Ghostlight Dinner Candle. Met haar elegante vorm en subtiele Halloween-karakter is ze perfect voor een warme seizoenssfeer. \n\n De kaars is volledig geurloos en gemaakt van 100% natuurlijke sojawas: een eenvoudige en natuurlijke keuze voor in huis. \n\n Elke Ghostlight Dinner Candle is ongeveer 20 cm hoog en wordt los met de hand gegoten, waardoor elk exemplaar uniek is. \n\n Ca. 20 cm hoog | Geurloos | 100% natuurlijke sojawas',
    'christmas-bubble-candle':
      'Geef je huis een feestelijke touch met onze handgemaakte Christmas Bubble Candle. Deze geurloze decoratieve kaars is gemaakt van 100% natuurlijke sojawas, een katoenen lont en micapoeder, en afgewerkt met mooie kerstdetails. \n\n Met haar speelse bubbelvorm en feestelijke kleuren is ze perfect als kleine kerstdecoratie of als cadeautje voor de feestdagen. \n\n Ca. 50 g was | Ca. 6 cm hoog | Geurloos | 100% natuurlijke sojawas',
    'christmas-tree-dinner-candle':
      'Geef je kersttafel een feestelijke touch met onze handgemaakte Christmas Tree Dinner Candle. Haar elegante vorm, geïnspireerd op een kerstboom, maakt haar perfect voor een gezellig kerstdiner, een feestelijk gedekte tafel of als seizoensdecoratie. \n\n De kaars is geurloos en gemaakt van 100% natuurlijke sojawas, micapoeder en een katoenen lont. Elke kaars is handgemaakt, waardoor elk exemplaar net een beetje uniek is. Kies een losse kaars in wit, roze of rood, of een bundel van drie met van elke kleur één, afgewerkt met gouden details. \n\n Ca. 20 cm hoog | Geurloos | 100% natuurlijke sojawas',
    'twisted-tree-candle':
      'Onze handgemaakte Twisted Tree Candle combineert een zachte, elegante vorm met een feestelijke en tijdloze uitstraling. Het vloeiende, gedraaide ontwerp geeft de kaars een prachtige sculpturale afwerking, terwijl de stijl eenvoudig en natuurlijk blijft. \n\n De kaars is geurloos en gemaakt van 100% natuurlijke sojawas, micapoeder en een katoenen lont. \n\n Ca. 70 g was | Ca. 12 cm hoog | Geurloos',
    'pumpkin-spice-wax-melts':
      'Kleine wax melts in de vorm van pompoentjes met een warme Pumpkin Spice-geur. Ik giet ze met de hand van sojawas en doe ongeveer 70 g in elk zakje. Gebruik ze in een geschikte waxbrander.',
    'sweet-christmas-wax-melts':
      'Vul je huis met de warme, troostende geur van onze Sweet Christmas Wax Melts. Met de geur Pain au Chocolat heeft deze knusse geur een rijk chocolade-aroma met het zoete karakter van vers gebak uit de bakkerij. \n\n Elk doosje van 7 x 7 cm bevat 8 handgemaakte wax melts in kerstvormen, samen ongeveer 45 g was. \n\n 8 wax melts | Ca. 45 g was | Doosje 7 x 7 cm | Geur: Pain au Chocolat',
    'white-christmas-wax-melts':
      'Vul je huis met de frisse, feestelijke geur van onze White Christmas Wax Melts. Deze kerstgeur opent met tonen van framboos, groen blad en sinaasappel, gevolgd door warme kruidnagel, den en kruidige tonen, met een zachte basis van karamel en houtige accenten. \n\n Elk doosje van 7 x 7 cm bevat 1 grote sneeuwvlok en 6 kleine kerstboompjes, samen ongeveer 35 g was. \n\n 7 wax melts | Ca. 35 g was | Doosje 7 x 7 cm | Geur: White Christmas',
  },
  de: {
    'floral-box':
      'Hol dir einen zarten floralen Akzent nach Hause mit unserer Bluebell Floral Box. Die Box enthält 9 handgemachte Blumenkerzen, dezent duftend nach Bluebell. \n\n Der Duft ist frisch, blumig und elegant: Er öffnet mit Noten von Hasenglöckchen und Hyazinthe, gefolgt von einem sanften blumigen Herz aus Lavendel, Galbanum, Rose und Jasmin, und klingt mit einem warmen Hauch Moschus aus. \n\n Die Kerzen bestehen zusammen aus etwa 220 g 100 % natürlichem Sojawachs. Jede Blume wird von Hand gegossen, deshalb ist jede Box ein Unikat. \n\n Wichtig: Nimm die Kerzen vor dem Anzünden immer aus der Box. Brenne die Kerzen niemals ab, solange sie noch in der Geschenkbox sind. \n\n 9 Kerzen | Ca. 220 g Sojawachs | Duft: Bluebell',
    'floral-basket':
      'Hol dir einen zarten floralen Akzent nach Hause mit unserem English Rose Floral Basket. Der Korb enthält 8 handgemachte Blumenkerzen, dezent duftend nach English Rose. \n\n Der Duft ist sanft, warm und elegant: Er öffnet mit süßen Noten von Vanille und Zitrus, gefolgt von einem grünen, fruchtigen und leicht würzigen Herz, und klingt mit einer warmen Basis aus Moschus, holzigen Noten und balsamischen Akzenten aus. \n\n Die Kerzen bestehen zusammen aus etwa 150 g 100 % natürlichem Sojawachs. Jede Blume wird von Hand gegossen, deshalb ist jeder Korb ein Unikat. \n\n Wichtig: Nimm die Kerzen vor dem Anzünden immer aus dem Korb. Brenne die Kerzen niemals ab, solange sie noch im Korb sind. \n\n 8 Kerzen | Ca. 150 g Sojawachs | Duft: English Rose',
    'festive-glow-box':
      'Hol dir die Wärme von Weihnachten nach Hause mit unserer Festive Glow Box. Die Box enthält 9 handgemachte Blumenkerzen mit dem Duft Mulled Wine. \n\n Der Duft ist warm, vollmundig und festlich, mit dem gemütlichen Charakter von Gewürzwein, süßen Früchten und wärmenden Weihnachtsgewürzen. Er weckt das vertraute Wintergefühl eines dampfenden Glases Glühwein an einem kalten Dezemberabend. \n\n Die Kerzen bestehen zusammen aus etwa 170 g Wachs, und die Box ist etwa 20 cm hoch. \n\n Wichtig: Nimm die Kerzen vor dem Anzünden immer aus der Box. Die Dekomaterialien in der Box sind brennbar und dürfen niemals mit einer offenen Flamme in Berührung kommen. \n\n 9 Kerzen | Ca. 170 g Wachs | Ca. 20 cm hoch | Duft: Mulled Wine',
    'coconut-beach':
      'Hol dir ein kleines Stück Sommer nach Hause mit unseren Coconut Island Kerzen. Jede Kerze wird einzeln von Hand in einer von vier vom Meer inspirierten Formen gegossen und duftet nach Coconut Island. \n\n Der Duft ist frisch, cremig und tropisch: Er öffnet mit saftigen Noten von Ananas und Orange, gefolgt von einem weichen Herz aus cremiger Kokosnuss, und klingt mit zarter Mandel und Pfirsich aus. \n\n Da jedes Design eine andere Größe hat, enthalten die Kerzen etwa 75 g bis 250 g 100 % natürliches Sojawachs. Das größte Design ist etwa 7 cm hoch. \n\n Jede Kerze wird von Hand gegossen und veredelt, deshalb ist jedes Stück ein Unikat. \n\n Ca. 75–250 g Sojawachs | Bis ca. 7 cm hoch | Duft: Coconut Island',
    'autumn-ember':
      'Hol dir die Wärme des Herbstes nach Hause mit dieser gemütlichen Saisonkerze, verziert mit feinen, von Hand gegossenen Wachsdetails, die von der Jahreszeit inspiriert sind. \n\n Der Duft Vanilla & Cinders ist warm, vollmundig und wohltuend und verbindet rauchige Vanille, sanfte Nelke, Zedernholz, glühenden Amber und Moschus. Er schafft das gemütliche Gefühl eines frischen Herbstabends drinnen. \n\n Die Kerze enthält etwa 500 g Wachs, und das Glas ist etwa 15 cm hoch. Jede Kerze wird von Hand veredelt, deshalb ist jedes Stück ein Unikat. \n\n Ca. 500 g Wachs | Ca. 15 cm hoch | Duft: Vanilla & Cinders',
    'pumpkin-spice':
      'Eine Sojawachskerze in einem Glas in Kürbisform, verziert mit herbstlichen Details und einem warmen Pumpkin Spice Duft. Ein bisschen Farbe der Saison für dein Zuhause.',
    'pumpkin-spice-latte':
      'Hol dir das gemütliche Gefühl deines liebsten Herbstgetränks nach Hause mit unserer Pumpkin Spice Latte Kerze. Verziert mit aufgeschlagenem Wachs und handgemachten saisonalen Details, sieht diese Kerze fast gut genug zum Trinken aus. \n\n Der Duft Pumpkin Spice ist warm, süß und wohltuend, mit dem vertrauten gemütlichen Charakter von Herbstgewürzen und einer sanften, cremigen Süße. \n\n Die Kerze enthält etwa 150 g Sojawachs, und das Glas ist etwa 9 cm hoch. Jede Kerze wird von Hand gegossen und veredelt, deshalb ist jedes Stück ein Unikat. \n\n Ca. 150 g Sojawachs | Ca. 9 cm hoch | Duft: Pumpkin Spice',
    'pumpkin-boo':
      'Hol dir einen verspielten Herbstakzent nach Hause mit unserer Pumpkin Boo Kerze. Mit ihrem niedlichen Design aus Gespenst und Kürbis steckt diese kleine Kerze voller gemütlichem saisonalem Charme. \n\n Der Duft Pumpkin Spice ist warm, süß und wohltuend, mit dem vertrauten gemütlichen Charakter von Herbstgewürzen und einer sanften, cremigen Süße. \n\n Die Kerze enthält etwa 50 g Sojawachs und kommt in einem etwa 9 cm hohen Glas. Jede Kerze wird von Hand gegossen und veredelt, deshalb ist jedes Stück ein Unikat. \n\n Ca. 50 g Sojawachs | Ca. 9 cm hoch | Duft: Pumpkin Spice',
    'boo-boo':
      'Hol dir einen gemütlichen kleinen Halloween-Akzent nach Hause mit unserer Boo Boo Kerze. Mit ihrem verspielten Gespenster-Design verbindet diese Kerze saisonalen Charme mit einem warmen, wohltuenden Duft. \n\n Der Duft Vanilla & Cinders vereint rauchige Vanille, sanfte Nelke, Zedernholz, Amber und Moschus zu einem vollen, gemütlichen Duft, der perfekt zu frischen Herbstabenden passt. \n\n Die Kerze enthält etwa 50 g Sojawachs und kommt in einem etwa 9 cm hohen Glas. Jede Kerze wird von Hand gegossen und veredelt, deshalb ist jedes Stück ein Unikat. \n\n Ca. 50 g Sojawachs | Ca. 9 cm hoch | Duft: Vanilla & Cinders',
    'scary-boo':
      'Hol dir einen verspielt-gruseligen Akzent nach Hause mit unserer Scary Boo Kerze. Mit ihrem von einem Gespenst inspirierten Design ist diese kleine Kerze perfekt, um deinem Zuhause ein gemütliches Halloween-Gefühl zu geben. \n\n Der Duft Vanilla & Cinders vereint rauchige Vanille, sanfte Nelke, Zedernholz, Amber und Moschus zu einem warmen, vollen und leicht geheimnisvollen Duft für frische Herbstabende. \n\n Die Kerze enthält etwa 50 g Sojawachs und kommt in einem etwa 9 cm hohen Glas. Jede Kerze wird von Hand gegossen und veredelt, deshalb ist jedes Stück ein Unikat. \n\n Ca. 50 g Sojawachs | Ca. 9 cm hoch | Duft: Vanilla & Cinders',
    'hot-cocoa':
      'Hol dir ein bisschen extra Gemütlichkeit nach Hause mit unserer Hot Cocoa Kerze. Mit dem Duft Pain au Chocolat erfüllt dieser warme, verwöhnende Duft deinen Raum mit dem wohligen Aroma von reicher Schokolade und frisch gebackenem Gebäck. \n\n Von Hand gemacht mit etwa 150 g Wachs in einem rund 9 cm hohen Glas – die perfekte gemütliche Kerze für die kälteren Monate. \n\n Ca. 150 g Wachs | Ca. 9 cm hoch | Duft: Pain au Chocolat',
    gluhwein:
      'Hol dir das warme, festliche Weihnachtsgefühl nach Hause mit unserer Glühwein Kerze. Mit dem Duft Mulled Wine verbindet dieser gemütliche Duft warme Gewürze mit einem vollen, fruchtigen Charakter, inspiriert von einer klassischen Tasse Glühwein. \n\n Von Hand gemacht mit etwa 150 g Wachs in einem rund 9 cm hohen Glas – eine perfekte Kerze für gemütliche Winterabende und die Feiertage. \n\n Ca. 150 g Wachs | Ca. 9 cm hoch | Duft: Mulled Wine',
    'winter-wonderland-candle':
      'Hol dir das frische Gefühl eines Winterwaldes nach Hause mit unserer Winter Wonderland Kerze. Der Duft öffnet mit frischen Noten von Kiefernnadeln, Zypresse, Eukalyptus und Pfefferminze, gefolgt von einem warmen Herz aus Tannenbalsam. Zedernholz und harzige Basisnoten geben dem Duft einen tiefen, holzigen und wohltuenden Ausklang. \n\n Die Kerze ist von Hand gemacht mit etwa 245 g Wachs und kommt in einem flachen Glas, rund 7 cm hoch und etwa 12 cm im Durchmesser. \n\n Ca. 245 g Wachs | Ca. 7 cm hoch | Ca. 12 cm Durchmesser | Duft: Nordic Cedar',
    column:
      'Gerade, gerippte Linien und eine schlichte Säulenform, von Hand gegossen aus 100 % Sojawachs. Duftfrei, damit du das Kerzenlicht ohne zusätzlichen Duft genießen kannst.',
    pillar:
      'Eine gerippte Stumpenkerze für den Tisch oder eine Lieblingsecke in deinem Zuhause. Ich gieße sie von Hand aus 100 % Sojawachs und lasse sie duftfrei.',
    spiral:
      'Sanfte Drehungen und runde Linien geben dieser Kerze ihre Form. Von Hand gegossen aus 100 % Sojawachs, ohne zugesetzten Duft.',
    shell:
      'Eine kleine Erinnerung an das Meer, mit geschwungenen Linien, inspiriert von einer Muschel. Von Hand gegossen aus 100 % Sojawachs, ohne zugesetzten Duft.',
    arch:
      'Eine schlichte Bogenform, die allein oder neben deinen Lieblingsstücken wunderschön aussieht. Von Hand gemacht aus 100 % Sojawachs, ohne zugesetzten Duft.',
    bubble:
      'Runde, verspielte Blasen in einer Kerze, die in jede Lieblingsecke passt. Ich gieße sie von Hand aus 100 % Sojawachs und lasse sie duftfrei.',
    'ghostlight-dinner-candle':
      'Gib deinem Tisch einen verspielt-gruseligen Akzent mit unserer Ghostlight Dinner Candle. Mit ihrer eleganten Form und ihrem dezenten Halloween-Charakter ist sie perfekt für eine warme saisonale Atmosphäre. \n\n Die Kerze ist völlig duftfrei und aus 100 % natürlichem Sojawachs gemacht – eine schlichte und natürliche Wahl für dein Zuhause. \n\n Jede Ghostlight Dinner Candle ist etwa 20 cm hoch und wird einzeln von Hand gegossen, deshalb ist jedes Stück ein Unikat. \n\n Ca. 20 cm hoch | Duftfrei | 100 % natürliches Sojawachs',
    'christmas-bubble-candle':
      'Gib deinem Zuhause einen festlichen Akzent mit unserer handgemachten Christmas Bubble Candle. Diese duftfreie Dekokerze besteht aus 100 % natürlichem Sojawachs, einem Baumwolldocht und Mica-Pulver und ist mit wunderschönen weihnachtlichen Details verziert. \n\n Mit ihrer verspielten Blasenform und den festlichen Farben ist sie perfekt als kleine Weihnachtsdeko oder als saisonales Geschenk. \n\n Ca. 50 g Wachs | Ca. 6 cm hoch | Duftfrei | 100 % natürliches Sojawachs',
    'christmas-tree-dinner-candle':
      'Gib deinem Weihnachtstisch einen festlichen Akzent mit unserer handgemachten Christmas Tree Dinner Candle. Ihre elegante, von einem Tannenbaum inspirierte Form macht sie perfekt für ein gemütliches Weihnachtsessen, eine festlich gedeckte Tafel oder als saisonale Deko. \n\n Die Kerze ist duftfrei und aus 100 % natürlichem Sojawachs, Mica-Pulver und einem Baumwolldocht gemacht. Jede Kerze ist handgemacht, deshalb ist jedes Stück ein bisschen einzigartig. Wähle eine einzelne Kerze in Weiß, Rosa oder Rot oder ein Set aus drei Kerzen in je einer Farbe, verziert mit goldenen Details. \n\n Ca. 20 cm hoch | Duftfrei | 100 % natürliches Sojawachs',
    'twisted-tree-candle':
      'Unsere handgemachte Twisted Tree Candle verbindet eine sanfte, elegante Form mit einem festlichen und zeitlosen Look. Das fließende, gedrehte Design gibt der Kerze ein wunderschönes skulpturales Finish, während der Stil schlicht und natürlich bleibt. \n\n Die Kerze ist duftfrei und aus 100 % natürlichem Sojawachs, Mica-Pulver und einem Baumwolldocht gemacht. \n\n Ca. 70 g Wachs | Ca. 12 cm hoch | Duftfrei',
    'pumpkin-spice-wax-melts':
      'Kleine Wax Melts in Kürbisform mit einem warmen Pumpkin Spice Duft. Ich gieße sie von Hand aus Sojawachs und fülle etwa 70 g in jede Tüte. Verwende sie in einer geeigneten Duftlampe.',
    'sweet-christmas-wax-melts':
      'Erfülle dein Zuhause mit dem warmen, wohltuenden Duft unserer Sweet Christmas Wax Melts. Mit dem Duft Pain au Chocolat hat dieser gemütliche Duft ein reiches Schokoladenaroma mit dem süßen Charakter von frisch gebackenem Gebäck aus der Bäckerei. \n\n Jede 7 x 7 cm große Box enthält 8 handgemachte Wax Melts in Weihnachtsformen, zusammen etwa 45 g Wachs. \n\n 8 Wax Melts | Ca. 45 g Wachs | Box 7 x 7 cm | Duft: Pain au Chocolat',
    'white-christmas-wax-melts':
      'Erfülle dein Zuhause mit dem frischen, festlichen Duft unserer White Christmas Wax Melts. Dieser Weihnachtsduft öffnet mit Noten von Himbeere, grünem Blatt und Orange, gefolgt von warmer Nelke, Kiefer und Kräuternoten, mit einer sanften Basis aus Karamell und holzigen Akzenten. \n\n Jede 7 x 7 cm große Box enthält 1 große Schneeflocke und 6 kleine Tannenbäumchen, zusammen etwa 35 g Wachs. \n\n 7 Wax Melts | Ca. 35 g Wachs | Box 7 x 7 cm | Duft: White Christmas',
  },
}

export const collectionCopy: Record<Translated, Record<string, { eyebrow: string; blurb: string }>> = {
  nl: {
    'little-glow': {
      eyebrow: 'Geurende theelichtjes',
      blurb: 'Met de hand gegoten bloemkaarsjes, geschikt in doosjes en mandjes. Een boeket met net iets anders.',
    },
    'scented-glow': {
      eyebrow: 'Geurkaarsen',
      blurb: 'Van Coconut Island tot Pumpkin Spice: vind een geur voor jouw favoriete tijd van het jaar.',
    },
    'natural-glow': {
      eyebrow: 'Geurloos',
      blurb: 'Geurloze sojawaskaarsen in eenvoudige, sculpturale vormen. Kies er een voor jouw favoriete plekje in huis.',
    },
    'wax-melts': {
      eyebrow: 'Geurende sojawax melts',
      blurb: 'Kleine seizoensvormpjes voor je waxbrander, met de hand gegoten van sojawas en gemaakt om je huis te vullen met een warme, troostende geur.',
    },
  },
  de: {
    'little-glow': {
      eyebrow: 'Duftende Teelichter',
      blurb: 'Von Hand gegossene Blumenkerzen, arrangiert in Boxen und Körben. Ein Blumenstrauß mit dem gewissen Etwas.',
    },
    'scented-glow': {
      eyebrow: 'Duftkerzen',
      blurb: 'Von Coconut Island bis Pumpkin Spice: Finde einen Duft für deine liebste Jahreszeit.',
    },
    'natural-glow': {
      eyebrow: 'Duftfrei',
      blurb: 'Duftfreie Sojawachskerzen in schlichten, skulpturalen Formen. Such dir eine für deinen Lieblingsplatz zu Hause aus.',
    },
    'wax-melts': {
      eyebrow: 'Duftende Soja-Wax-Melts',
      blurb: 'Kleine saisonale Formen für deine Duftlampe, von Hand aus Sojawachs gegossen, damit sich der Raum mit einem warmen, wohltuenden Duft füllt.',
    },
  },
}

export const seasonCopy: Record<Translated, Record<string, { label: string; description: string }>> = {
  nl: {
    summer: { label: 'Zomer', description: 'Vormen van de zee en bloemen voor een beetje zomer in huis.' },
    spring: { label: 'Lente', description: 'Met de hand gegoten bloemkaarsjes voor een frisse start en attente cadeaus.' },
    autumn: { label: 'Herfst', description: 'Pumpkin spice, rokerige vanille en een paar kleine spookjes voor het seizoen.' },
    winter: { label: 'Winter', description: 'Knusse kaarsen om de donkerste dagen van het jaar op te vrolijken.' },
    halloween: { label: 'Halloween', description: 'Maak kennis met de kleine spookjes die ik heb gemaakt voor jouw Halloween-tafel en -huis.' },
    christmas: { label: 'Kerst', description: 'Knusse feestelijke kaarsen – binnenkort verkrijgbaar.' },
  },
  de: {
    summer: { label: 'Sommer', description: 'Formen vom Meer und Blumen für ein bisschen Sommer zu Hause.' },
    spring: { label: 'Frühling', description: 'Von Hand gegossene Blumenkerzen für einen frischen Start und liebevolle Geschenke.' },
    autumn: { label: 'Herbst', description: 'Pumpkin Spice, rauchige Vanille und ein paar kleine Gespenster für die Saison.' },
    winter: { label: 'Winter', description: 'Gemütliche Kerzen, die die dunkelsten Tage des Jahres erhellen.' },
    halloween: { label: 'Halloween', description: 'Lerne die kleinen Gespenster kennen, die ich für deinen Halloween-Tisch und dein Zuhause gemacht habe.' },
    christmas: { label: 'Weihnachten', description: 'Gemütliche festliche Kerzen – bald erhältlich.' },
  },
}

/** A product's description in the given language, falling back to English. */
export function localizedDescription(product: { id: string; description: string }, locale: Locale): string {
  return locale === 'en' ? product.description : productDescriptions[locale][product.id] ?? product.description
}

export function localizedCollection<C extends { id: string; eyebrow: string; blurb: string }>(
  collection: C,
  locale: Locale,
): C {
  if (locale === 'en') return collection
  const copy = collectionCopy[locale][collection.id]
  return copy ? { ...collection, ...copy } : collection
}

export function localizedSeason<S extends { id: string; label: string; description: string }>(
  season: S,
  locale: Locale,
): S {
  if (locale === 'en') return season
  const copy = seasonCopy[locale][season.id]
  return copy ? { ...season, ...copy } : season
}
