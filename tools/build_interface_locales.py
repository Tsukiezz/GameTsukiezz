"""Local, reviewed UI language packs; no runtime network translation."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
rows='''Smooth|Fluide|Fluido
Medium|Moyen|Medio
High|Élevé|Alto
King Kong Boxer|King Kong boxeur|King Kong boxeador
Guardian • Boxing|Gardien • Boxe|Guardián • Boxeo
Boxing|Boxe|Boxeo
Stamina|Endurance|Resistencia
Oxygen|Oxygène|Oxígeno
Library (B)|Bibliothèque (B)|Biblioteca (B)
On shore: safe|Sur la rive : en sécurité|En la orilla: a salvo
In water: monsters can detect you|Dans l’eau : les monstres peuvent vous détecter|En el agua: los monstruos pueden detectarte
Swim: WASD · Space ascend · Q / Ctrl dive · Shift swim faster|Nager : WASD · Espace monter · Q / Ctrl plonger · Maj accélérer|Nadar: WASD · Espacio subir · Q / Ctrl sumergirse · Mayús acelerar
Not enough stamina|Endurance insuffisante|Resistencia insuficiente
Mercury Lake monsters|Monstres du lac de mercure|Monstruos del lago de mercurio
Stone bridge: safe|Pont de pierre : en sécurité|Puente de piedra: a salvo
Off the bridge: monsters can detect you|Hors du pont : les monstres peuvent vous détecter|Fuera del puente: los monstruos pueden detectarte
Patrolling|En patrouille|Patrullando
Hunting|En chasse|Cazando
Preparing attack|Prépare une attaque|Preparando ataque
Recovering|Récupération|Recuperándose
Defeated|Vaincu|Derrotado
Loch Ness — Moon Devourer|Loch Ness — Dévoreur de lune|Loch Ness — Devorador de la luna
Space Crocodile — Void Maw|Crocodile spatial — Gueule du néant|Cocodrilo espacial — Fauces del vacío
MAP · 6720m|CARTE · 6720m|MAPA · 6720m
Mercury Lake — Silent Abyss|Lac de mercure — Abîme silencieux|Lago de mercurio — Abismo silencioso
Primordial Forest|Forêt primordiale|Bosque primordial
Forest Guardian|Gardien de la forêt|Guardián del bosque
Forest outskirts|Lisière de la forêt|Linde del bosque
Discovered Elder Tree|Arbre ancestral découvert|Árbol ancestral descubierto
Ancient Moon Tree|Arbre ancestral lunaire|Árbol lunar ancestral
Moon Birch Forest|Forêt des bouleaux lunaires|Bosque de abedules lunares
Shadow Pine Forest|Forêt des pins ombreux|Bosque de pinos sombríos
Fern and Mushroom Forest|Forêt des fougères et champignons|Bosque de helechos y hongos
Moon Willow Forest|Forêt des saules lunaires|Bosque de sauces lunares
Save changes|Enregistrer|Guardar cambios
Unsaved changes|Modifications non enregistrées|Cambios sin guardar
Saved and applied|Enregistré et appliqué|Guardado y aplicado
Press Save changes to apply on this device|Appuyez sur Enregistrer pour appliquer sur cet appareil|Pulsa Guardar cambios para aplicar en este dispositivo
Health|Santé|Salud
Armor|Armure|Armadura
Health and armor|Santé et armure|Salud y armadura
PLAY|JOUER|JUGAR
INVENTORY|INVENTAIRE|INVENTARIO
CHARACTERS|PERSONNAGES|PERSONAJES
SETTINGS|PARAMÈTRES|AJUSTES
Coming in a future update|Disponible dans une prochaine mise à jour|Disponible en una futura actualización
Language|Langue|Idioma
Automatically saved on this device|Enregistré automatiquement sur cet appareil|Guardado automáticamente en este dispositivo
GAME SETTINGS|PARAMÈTRES DU JEU|AJUSTES DEL JUEGO
Customize your sound and gameplay|Personnalisez le son et le jeu|Personaliza el sonido y el juego
Background music|Musique de fond|Música de fondo
The mystical moonlit sounds of Tsuventure|Les sons mystiques au clair de lune de Tsuventure|Los sonidos místicos de Tsuventure a la luz de la luna
Sound effects (SFX)|Effets sonores (SFX)|Efectos de sonido (SFX)
Sword swings, pickups and dialogue|Coups d’épée, objets et dialogues|Golpes de espada, objetos y diálogos
Fullscreen|Plein écran|Pantalla completa
Expand your view of the world|Élargissez votre vue du monde|Amplía tu vista del mundo
Toggle|Activer / Désactiver|Activar / Desactivar
Graphics & performance|Graphismes et performances|Gráficos y rendimiento
Balanced (default)|Équilibré (par défaut)|Equilibrado (predeterminado)
Choose Minimal for slower devices: fewer effects and adaptive resolution.|Choisissez Minimal pour les appareils lents : moins d’effets et résolution adaptative.|Elige Mínimo para equipos lentos: menos efectos y resolución adaptativa.
Minimal|Minimal|Mínimo
Low|Bas|Bajo
Balanced|Équilibré|Equilibrado
Ultra|Ultra|Ultra
Minimal (slower devices)|Minimal (appareils lents)|Mínimo (equipos lentos)
Low (slower devices)|Bas (appareils lents)|Bajo (equipos lentos)
MINIMAL|MINIMAL|MÍNIMO
LOW|BAS|BAJO
BALANCED|ÉQUILIBRÉ|EQUILIBRADO
Slower devices · adaptive resolution|Appareils lents · résolution adaptative|Equipos lentos · resolución adaptativa
Slower devices and integrated graphics|Appareils lents et graphiques intégrés|Equipos lentos y gráficos integrados
Balanced visuals and performance|Équilibre entre image et performances|Equilibrio entre imagen y rendimiento
Powerful devices, higher resolution|Appareils puissants, haute résolution|Equipos potentes, mayor resolución
Selected:|Sélection :|Selección:
Hamster Knight|Chevalier hamster|Caballero hámster
Rabbit Mage|Lapin mage|Conejo mago
(Melee)|(Corps à corps)|(Cuerpo a cuerpo)
Dragon Knight|Chevalier dragon|Caballero dragón
Dragon Knight • Sword & Shield|Chevalier dragon • Épée et bouclier|Caballero dragón • Espada y escudo
Press|Appuyez sur|Pulsa
to play in fullscreen|pour jouer en plein écran|para jugar en pantalla completa
CHOOSE YOUR CHARACTER|CHOISISSEZ VOTRE PERSONNAGE|ELIGE TU PERSONAJE
Each hero has a distinct fighting style, weapon and magic.|Chaque héros possède son style, ses armes et sa magie.|Cada héroe tiene su propio estilo, armas y magia.
Royal Knight • Sword & Shield|Chevalier royal • Épée et bouclier|Caballero real • Espada y escudo
Moon Mage • Staff & Spellbook|Mage lunaire • Bâton et grimoire|Mago lunar • Bastón y grimorio
Strength|Force|Fuerza
Defense|Défense|Defensa
Speed|Vitesse|Velocidad
Magic|Magie|Magia
Attack & Defense|Attaque et défense|Ataque y defensa
Selected|Sélectionné|Seleccionado
Choose Hero|Choisir un héros|Elegir héroe
Destinations|Destinations|Destinos
Choose a destination|Choisir une destination|Elegir un destino
Travel to an area you want to explore.|Rejoignez une région à explorer.|Viaja a la zona que quieras explorar.
Characters|Personnages|Personajes
Change character|Changer de personnage|Cambiar personaje
World|Monde|Mundo
Castle|Château|Castillo
Settings|Paramètres|Ajustes
Graphics settings|Paramètres graphiques|Ajustes gráficos
Controls|Commandes|Controles
Lobby|Accueil|Inicio
Return to lobby|Retour à l’accueil|Volver al inicio
Right-click once to look around. Esc releases the cursor; scroll to zoom.|Un clic droit pour regarder. Échap libère le curseur ; la molette règle la distance.|Haz clic derecho para mirar. Esc libera el cursor; la rueda ajusta la distancia.
Move|Déplacer|Mover
Jump|Sauter|Saltar
Interact|Interagir|Interactuar
Sit / stand|S’asseoir / se lever|Sentarse / levantarse
Right mouse|Clic droit|Clic derecho
Great Hall|Grande salle|Gran salón
Reception|Réception|Recepción
Throne|Trône|Trono
Attic|Grenier|Ático
Secret entrance|Entrée secrète|Entrada secreta
Arena|Arène|Arena
Altar|Autel|Altar
Ancient tree|Arbre ancestral|Árbol ancestral
Central Temple|Temple central|Templo central
Castle F1|Château N1|Castillo P1
Throne F2|Trône N2|Trono P2
Ballroom|Salle de bal|Salón de baile
Ancient Library|Bibliothèque ancienne|Biblioteca antigua
Dining Room|Salle à manger|Comedor
Banquet Hall|Salle de banquet|Salón de banquetes
Art Gallery|Galerie d’art|Galería de arte
Reading Room|Salle de lecture|Sala de lectura
Book Archive|Archives|Archivo de libros
Study|Cabinet d’étude|Estudio
Armory|Armurerie|Armería
Secret Basement|Sous-sol secret|Sótano secreto
Hidden Crypt|Crypte cachée|Cripta oculta
Space Station|Station spatiale|Estación espacial
Mercury Lake|Lac de mercure|Lago de mercurio
Cave|Grotte|Cueva
Evil God Cavern|Caverne du dieu maléfique|Caverna del dios maligno
Observatory|Observatoire|Observatorio
Sword attack|Attaque à l’épée|Ataque de espada
Staff attack|Attaque au bâton|Ataque de bastón
Sprint|Sprinter|Esprintar
CURRENT LOCATION|POSITION ACTUELLE|UBICACIÓN ACTUAL
MAP|CARTE|MAPA
Lobby menu|Menu d’accueil|Menú de inicio
Toggle audio|Activer / couper le son|Activar / silenciar sonido'''
rows+='''
A little gorilla with red boxing gloves and blue pauldrons. A melee guardian who takes 20% less monster damage.|Un petit gorille aux gants rouges et aux épaulières bleues. Un gardien qui subit 20 % de dégâts de monstres en moins.|Un pequeño gorila con guantes rojos y hombreras azules. Un guardián que recibe un 20 % menos de daño de monstruos.
Explore ancient ruins beneath a mysterious crescent moon. Choose your guardian, uncover forgotten secrets and rekindle the sacred flame.|Explorez des ruines sous un mystérieux croissant de lune. Choisissez votre gardien, découvrez les secrets oubliés et ravivez la flamme sacrée.|Explora ruinas bajo una misteriosa luna creciente. Elige a tu guardián, descubre secretos olvidados y reaviva la llama sagrada.
A little jade dragon with short wings and blue armor. A brave, friendly companion for your moonlit adventure.|Un petit dragon de jade aux ailes courtes et à l’armure bleue. Un compagnon courageux pour votre aventure au clair de lune.|Un pequeño dragón de jade con alas cortas y armadura azul. Un compañero valiente para tu aventura lunar.
A brave little knight with a steel helmet, silver shield and moonlit sword. Specializes in close combat.|Un petit chevalier courageux avec casque d’acier, bouclier d’argent et épée lunaire. Spécialiste du corps à corps.|Un pequeño caballero valiente con casco de acero, escudo de plata y espada lunar. Especialista en cuerpo a cuerpo.
A master of moonstone magic with a pointed hat and glowing violet staff. Casts spells from afar.|Un maître de la magie lunaire au chapeau pointu et au bâton violet lumineux. Lance des sorts à distance.|Un maestro de magia lunar con sombrero puntiagudo y bastón violeta luminoso. Lanza hechizos a distancia.'''
packs={'fr':{},'es':{}}
for row in rows.splitlines():
 en,fr,es=row.split('|');packs['fr'][en]=fr;packs['es'][en]=es
extras='''Vật phẩm hiếm|Rare items|Objets rares|Objetos raros
✦ Vật phẩm hiếm|✦ Rare item|✦ Objet rare|✦ Objeto raro
Bản đồ|Map|Carte|Mapa
Silicon|Silicon|Silicium|Silicio
Uranium|Uranium|Uranium|Uranio
Chọn ngoại hình bạn thích. Máu, giáp, tốc độ, tầm đánh và sát thương dùng chung; trang bị mới quyết định sức mạnh.|Choose your appearance. Health, armor, speed, range and damage are shared; equipment determines power.|Choisissez votre apparence. Santé, armure, vitesse, portée et dégâts sont communs ; l’équipement détermine la puissance.|Elige tu apariencia. Salud, armadura, velocidad, alcance y daño son comunes; el equipo determina el poder.
Balo|Backpack|Sac à dos|Mochila
Vật phẩm|Items|Objets|Objetos
Trang bị|Equipment|Équipement|Equipo
Thư viện|Library|Bibliothèque|Biblioteca
Độ no|Hunger|Faim|Hambre
SKIN|SKIN|APPARENCE|ASPECTO
BỘ SƯU TẬP SKIN|SKIN COLLECTION|COLLECTION D’APPARENCES|COLECCIÓN DE ASPECTOS
Chọn skin|Choose skin|Choisir une apparence|Elegir aspecto
Số lượng|Quantity|Quantité|Cantidad
Đang có|Available|Disponible|Disponible
Đang trang bị|Equipped|Équipé|Equipado
Đã sở hữu|Owned|Possédé|En posesión
Chưa chế tạo|Not crafted|Non fabriqué|Sin fabricar
Đã chế tạo|Crafted|Fabriqué|Fabricado
Trang bị|Equip|Équiper|Equipar
Tháo trang bị|Unequip|Retirer|Desequipar
Đóng|Close|Fermer|Cerrar
Tìm kiếm vật phẩm|Search items|Rechercher des objets|Buscar objetos
Không có vật phẩm phù hợp.|No matching items.|Aucun objet correspondant.|No hay objetos coincidentes.
Chi tiết vật phẩm|Item details|Détails de l’objet|Detalles del objeto
Danh sách vật phẩm|Item list|Liste d’objets|Lista de objetos
Xưởng Chế Tạo Hoàng Gia|Royal Fabrication Workshop|Atelier de fabrication royal|Taller de fabricación real
Chọn bản thiết kế để xem nguyên liệu và chế tạo.|Choose a blueprint to view materials and craft.|Choisissez un plan pour voir les matériaux et fabriquer.|Elige un plano para ver los materiales y fabricar.
Bản thiết kế|Blueprints|Plans de fabrication|Planos de fabricación
Chế tạo|Craft|Fabriquer|Fabricar
Vật liệu|Materials|Matériaux|Materiales
Thanh Kiếm Rừng Sâu|Deep Forest Sword|Épée de la forêt profonde|Espada del bosque profundo
Thanh Gươm Dung Nham|Lava Sword|Épée de lave|Espada de lava
Trái Tim Rừng Rậm|Forest Heart|Cœur de la forêt|Corazón del bosque
Thiên thạch Nakat|Nakat Meteorite|Météorite Nakat|Meteorito Nakat
Sắt|Iron|Fer|Hierro
Gỗ|Wood|Bois|Madera
Cao su|Rubber|Caoutchouc|Caucho
Giáp sắt|Iron Armor|Armure de fer|Armadura de hierro
Giáp cuồng nộ|Rage Armor|Armure de fureur|Armadura de furia
Đồ lặn|Diving Suit|Combinaison de plongée|Traje de buceo
Thuyền Thám Hiểm Sông|River Explorer Boat|Bateau d’exploration fluviale|Barco de exploración fluvial
Thuyền thu gọn, khám phá sông hồ và đầm lầy.|A portable boat for rivers, lakes and swamps.|Un bateau pliable pour les rivières, lacs et marais.|Un barco plegable para ríos, lagos y pantanos.
Sát thương bằng kiếm dung nham · Hút máu 10% sát thương thực tế.|Lava-sword damage · Heals 10% of actual damage dealt.|Dégâts d’une épée de lave · Soigne 10 % des dégâts réels infligés.|Daño de espada de lava · Cura el 10 % del daño real infligido.
Sát thương bằng kiếm dung nham. Hút máu bằng 10% sát thương thực tế gây lên quái; không hồi máu khi chém hụt.|Lava-sword damage. Heals 10% of actual monster damage; misses do not heal.|Dégâts d’une épée de lave. Soigne 10 % des dégâts réels aux monstres ; aucun soin en cas d’attaque manquée.|Daño de espada de lava. Cura el 10 % del daño real a monstruos; fallar no cura.
Đòn thứ hai liên tiếp trúng mục tiêu trong 1,5 giây tăng 10% sát thương. Không tốn thể lực.|The second consecutive hit within 1.5 seconds deals 10% more damage. No stamina cost.|Le deuxième coup consécutif en 1,5 seconde inflige 10 % de dégâts supplémentaires. Sans coût d’endurance.|El segundo golpe consecutivo en 1,5 segundos causa un 10 % más de daño. Sin coste de resistencia.
Trang bị để tăng giới hạn giáp lên 200.|Equip to increase maximum armor to 200.|Équipez pour porter l’armure maximale à 200.|Equipa para aumentar la armadura máxima a 200.
Lặn sông, hồ không mất oxy. Tìm cao su và silicon từ hòm Noel và bãi quái.|Dive in rivers and lakes without losing oxygen. Find rubber and silicon in Santa gifts and monster camps.|Plongez sans perdre d’oxygène. Trouvez caoutchouc et silicium dans les cadeaux et camps de monstres.|Bucea sin perder oxígeno. Encuentra caucho y silicio en regalos y campamentos de monstruos.
Vật phẩm duy nhất|Unique item|Objet unique|Objeto único
Thuốc tiên|Elixir|Élixir|Elixir
Thịt đùi|Meat|Viande|Carne
Xu vàng|Gold coin|Pièce d’or|Moneda de oro
Động cơ vĩnh cửu|Perpetual Engine|Moteur perpétuel|Motor perpetuo
Pha lê tuyết|Snow Crystal|Cristal de neige|Cristal de nieve
Nhận quà|Redeem|Échanger|Canjear
Nhập mã quà tặng|Enter gift code|Saisir le code cadeau|Introducir código de regalo
Mã không hợp lệ.|Invalid code.|Code invalide.|Código no válido.
Chế tạo thuyền|Craft boat|Fabriquer un bateau|Fabricar barco
Đã sở hữu thuyền|Boat owned|Bateau possédé|Barco en posesión
Mở bàn chế tạo công nghệ|Open fabrication workbench|Ouvrir l’atelier de fabrication|Abrir banco de fabricación
Đã chế tạo Thanh Kiếm Rừng Sâu · Hút máu 10%|Deep Forest Sword crafted · 10% lifesteal|Épée de la forêt fabriquée · 10 % de vol de vie|Espada del bosque fabricada · 10 % de robo de vida'''
extras+='''
Nhạc nền ở sảnh|Lobby music|Musique d’accueil|Música de inicio
Bật nhạc sảnh|Enable lobby music|Activer la musique d’accueil|Activar música de inicio
Âm lượng nhạc nền|Music volume|Volume de la musique|Volumen de música
Nhạc sẽ phát khi về sảnh|Music will play in the lobby|La musique reprend à l’accueil|La música sonará en el inicio
Nhạc nền đã tắt|Music disabled|Musique désactivée|Música desactivada
Nhấn nút hoặc chạm sảnh để phát nhạc.|Click or tap the lobby to play music.|Cliquez ou touchez l’accueil pour jouer la musique.|Haz clic o toca el inicio para reproducir música.
Nhấn/chạm để phát|Click/tap to play|Cliquer/toucher pour lire|Haz clic/toca para reproducir
Đang phát|Playing|Lecture en cours|Reproduciendo
Mượt: máy rất yếu · Trung Bình: cảnh quan · Cao: ánh sáng, bóng đổ và chi tiết.|Smooth: low-end devices · Medium: scenery · High: lighting, shadows and detail.|Fluide : appareils peu puissants · Moyen : paysages · Élevé : éclairage, ombres et détails.|Fluido: equipos modestos · Medio: paisajes · Alto: iluminación, sombras y detalles.
Góc nhìn|View|Vue|Vista
Bay|Fly|Voler|Volar
Phím tắt|Shortcuts|Raccourcis|Atajos
NHẬN VẬT PHẨM|ITEM RECEIVED|OBJET REÇU|OBJETO RECIBIDO
Băng gạc|Bandage|Bandage|Venda
Vàng thô|Raw gold|Or brut|Oro bruto
Tinh thể|Crystal|Cristal|Cristal
Thuyền thám hiểm|Explorer boat|Bateau d’exploration|Barco de exploración
Hợp kim|Alloy|Alliage|Aleación
Chocolate|Chocolate|Chocolat|Chocolate
Đông Trùng Hạ Thảo|Cordyceps|Cordyceps|Cordyceps
Dung Nham Thiên Hà|Galactic Lava|Lave galactique|Lava galáctica
Hỏa Thạch Vĩnh Cửu|Eternal Ember|Braise éternelle|Brasa eterna
Giáp Samurai|Samurai Armor|Armure de samouraï|Armadura samurái
Thanh Kiếm Sắt|Iron Sword|Épée de fer|Espada de hierro
Độ bền|Durability|Durabilité|Durabilidad
Giáp hỏng|Broken armor|Armure brisée|Armadura rota
Kiếm hỏng|Broken sword|Épée brisée|Espada rota
Đã hủy|Destroyed|Détruit|Destruido
Bàn Sửa Chữa|Repair Station|Atelier de réparation|Banco de reparación
Sửa chữa|Repair|Réparer|Reparar
Chưa sở hữu|Not owned|Non possédé|Sin adquirir
Độ bền đầy đủ|Full durability|Durabilité maximale|Durabilidad completa
Đã hỏng|Broken|Brisé|Roto
sắt|iron|fer|hierro
xu vàng|gold coins|pièces d’or|monedas de oro
Đồ đặc biệt có độ bền 3500. Đồ sắt bị hủy khi độ bền về 0.|Special gear has 3500 durability. Iron gear is destroyed at zero.|L’équipement spécial a 3500 points de durabilité. Le fer est détruit à zéro.|El equipo especial tiene 3500 de durabilidad. El hierro se destruye al llegar a cero.
500 giáp · Giảm 80% sát thương rơi. Độ bền 3500; có thể sửa tại trụ sở công nghệ.|500 armor · 80% less fall damage. 3500 durability; repair at technology headquarters.|500 d’armure · Réduit les dégâts de chute de 80 %. Durabilité 3500 ; réparable au centre technologique.|500 de armadura · Reduce el daño de caída un 80 %. Durabilidad 3500; reparable en la sede tecnológica.
Ăn để đầy độ no và giữ 100/100 trong 5 phút.|Eat to fill hunger and keep it at 100/100 for 5 minutes.|Mangez pour remplir la satiété et la maintenir à 100/100 pendant 5 minutes.|Come para llenar la saciedad y mantenerla en 100/100 durante 5 minutos.
80 sát thương cơ bản · Độ bền 1000 · Bị hủy khi hết độ bền.|80 base damage · 1000 durability · Destroyed when durability runs out.|80 dégâts de base · Durabilité 1000 · Détruit à zéro.|80 de daño base · Durabilidad 1000 · Se destruye al agotarse.
80 sát thương · Độ bền 1000.|80 damage · 1000 durability.|80 dégâts · Durabilité 1000.|80 de daño · Durabilidad 1000.
Sát thương cao · Đòn trúng thứ hai liên tiếp +10% · Độ bền 3500.|High damage · Second consecutive hit +10% · 3500 durability.|Dégâts élevés · Deuxième coup consécutif +10 % · Durabilité 3500.|Daño elevado · Segundo golpe consecutivo +10 % · Durabilidad 3500.
Kho báu thung lũng núi lửa. Dùng cùng 120 sắt để chế tạo kiếm dung nham.|Volcanic valley treasure. Craft the lava sword with 120 iron.|Trésor de la vallée volcanique. Fabriquez l’épée de lave avec 120 fers.|Tesoro del valle volcánico. Fabrica la espada de lava con 120 de hierro.
Kho báu trên đỉnh thác Nguyệt Tuyền. Dùng cùng 40 silicon và 20 sắt để chế tạo giáp Samurai.|Moonwell waterfall summit treasure. Craft samurai armor with 40 silicon and 20 iron.|Trésor au sommet de la cascade lunaire. Fabriquez l’armure avec 40 siliciums et 20 fers.|Tesoro en la cima de la cascada lunar. Fabrica la armadura con 40 de silicio y 20 de hierro.'''
vi={}
for row in extras.splitlines():
 v,en,fr,es=row.split('|');vi[v]=en;packs['fr'][en]=fr;packs['es'][en]=es
(ROOT/'demo/features/lobby/interface-locales.js').write_text('window.TSU_INTERFACE_LOCALES='+json.dumps({'extra':vi,**packs},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print('Wrote',len(packs['fr']),'French and Spanish interface phrases')
