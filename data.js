/**
 * Europe Daily Phrases — language data
 *
 * Every speakable item keeps an audioUrl field. Add a local/remote audio URL
 * to prefer recorded audio; leave it empty to use the Web Speech API.
 */

const CATEGORY_LABELS = Object.freeze({
  all: "全部",
  greetings: "招呼",
  polite: "禮貌",
  travel: "旅行",
  restaurant: "餐廳",
  transport: "交通",
  accommodation: "住宿",
});

const alphabetItem = (letter, name, pronunciation, speakText = name, note = "") => ({
  letter,
  name,
  pronunciation,
  speakText,
  note,
  audioUrl: "",
});

const phraseItem = (id, category, meaning, original, pronunciation, context) => ({
  id,
  category,
  meaning,
  original,
  pronunciation,
  context,
  speakText: original,
  audioUrl: "",
});

const numberItem = (value, word, pronunciation) => ({
  value,
  word,
  pronunciation,
  speakText: word,
  audioUrl: "",
});

function buildSwedishNumbers() {
  const units = {
    1: ["ett", "欸特"],
    2: ["två", "托沃"],
    3: ["tre", "特雷"],
    4: ["fyra", "菲拉"],
    5: ["fem", "費姆"],
    6: ["sex", "塞克斯"],
    7: ["sju", "許"],
    8: ["åtta", "歐塔"],
    9: ["nio", "尼歐"],
  };
  const teens = {
    10: ["tio", "提歐"],
    11: ["elva", "艾爾瓦"],
    12: ["tolv", "托爾夫"],
    13: ["tretton", "特雷通"],
    14: ["fjorton", "菲尤通"],
    15: ["femton", "費姆通"],
    16: ["sexton", "塞克斯通"],
    17: ["sjutton", "許通"],
    18: ["arton", "阿通"],
    19: ["nitton", "尼通"],
  };
  const tens = {
    20: ["tjugo", "許果"],
    30: ["trettio", "特雷提歐"],
    40: ["fyrtio", "菲提歐"],
    50: ["femtio", "費姆提歐"],
    60: ["sextio", "塞克斯提歐"],
    70: ["sjuttio", "許提歐"],
    80: ["åttio", "歐提歐"],
    90: ["nittio", "尼提歐"],
  };

  return Array.from({ length: 100 }, (_, index) => {
    const value = index + 1;
    if (units[value]) return numberItem(value, ...units[value]);
    if (teens[value]) return numberItem(value, ...teens[value]);
    if (tens[value]) return numberItem(value, ...tens[value]);
    if (value === 100) return numberItem(100, "hundra", "亨德拉");
    const ten = Math.floor(value / 10) * 10;
    const unit = value % 10;
    return numberItem(value, `${tens[ten][0]}${units[unit][0]}`, `${tens[ten][1]}・${units[unit][1]}`);
  });
}

function buildGermanNumbers() {
  const units = {
    1: ["eins", "艾因斯"],
    2: ["zwei", "茲外"],
    3: ["drei", "德萊"],
    4: ["vier", "菲爾"],
    5: ["fünf", "芬夫"],
    6: ["sechs", "澤克斯"],
    7: ["sieben", "西本"],
    8: ["acht", "阿赫特"],
    9: ["neun", "諾因"],
  };
  const teens = {
    10: ["zehn", "澤恩"],
    11: ["elf", "艾爾夫"],
    12: ["zwölf", "茲沃爾夫"],
    13: ["dreizehn", "德萊澤恩"],
    14: ["vierzehn", "菲爾澤恩"],
    15: ["fünfzehn", "芬夫澤恩"],
    16: ["sechzehn", "澤希澤恩"],
    17: ["siebzehn", "西普澤恩"],
    18: ["achtzehn", "阿赫特澤恩"],
    19: ["neunzehn", "諾因澤恩"],
  };
  const tens = {
    20: ["zwanzig", "茲凡茲希"],
    30: ["dreißig", "德萊希"],
    40: ["vierzig", "菲爾茲希"],
    50: ["fünfzig", "芬夫茲希"],
    60: ["sechzig", "澤希茲希"],
    70: ["siebzig", "西普茲希"],
    80: ["achtzig", "阿赫特茲希"],
    90: ["neunzig", "諾因茲希"],
  };

  return Array.from({ length: 100 }, (_, index) => {
    const value = index + 1;
    if (units[value]) return numberItem(value, ...units[value]);
    if (teens[value]) return numberItem(value, ...teens[value]);
    if (tens[value]) return numberItem(value, ...tens[value]);
    if (value === 100) return numberItem(100, "einhundert", "艾因・洪德特");
    const ten = Math.floor(value / 10) * 10;
    const unit = value % 10;
    const unitWord = unit === 1 ? "ein" : units[unit][0];
    const unitPronunciation = unit === 1 ? "艾因" : units[unit][1];
    return numberItem(
      value,
      `${unitWord}und${tens[ten][0]}`,
      `${unitPronunciation}・翁德・${tens[ten][1]}`,
    );
  });
}

function buildItalianNumbers() {
  const units = {
    1: ["uno", "烏諾"],
    2: ["due", "杜欸"],
    3: ["tre", "特雷"],
    4: ["quattro", "夸特羅"],
    5: ["cinque", "欽奎"],
    6: ["sei", "賽"],
    7: ["sette", "塞特"],
    8: ["otto", "奧托"],
    9: ["nove", "諾維"],
  };
  const teens = {
    10: ["dieci", "迪耶奇"],
    11: ["undici", "溫迪奇"],
    12: ["dodici", "多迪奇"],
    13: ["tredici", "特雷迪奇"],
    14: ["quattordici", "夸托爾迪奇"],
    15: ["quindici", "昆迪奇"],
    16: ["sedici", "塞迪奇"],
    17: ["diciassette", "迪恰塞特"],
    18: ["diciotto", "迪裘托"],
    19: ["diciannove", "迪恰諾維"],
  };
  const tens = {
    20: ["venti", "文提"],
    30: ["trenta", "特倫塔"],
    40: ["quaranta", "夸蘭塔"],
    50: ["cinquanta", "欽款塔"],
    60: ["sessanta", "塞桑塔"],
    70: ["settanta", "塞坦塔"],
    80: ["ottanta", "奧坦塔"],
    90: ["novanta", "諾萬塔"],
  };

  return Array.from({ length: 100 }, (_, index) => {
    const value = index + 1;
    if (units[value]) return numberItem(value, ...units[value]);
    if (teens[value]) return numberItem(value, ...teens[value]);
    if (tens[value]) return numberItem(value, ...tens[value]);
    if (value === 100) return numberItem(100, "cento", "千托");
    const ten = Math.floor(value / 10) * 10;
    const unit = value % 10;
    const elide = unit === 1 || unit === 8;
    const tenStem = elide ? tens[ten][0].slice(0, -1) : tens[ten][0];
    const unitWord = unit === 3 ? "tré" : units[unit][0];
    return numberItem(value, `${tenStem}${unitWord}`, `${tens[ten][1]}・${units[unit][1]}`);
  });
}

const LANGUAGE_DATA = {
  swedish: {
    label: "瑞典語",
    nativeName: "Svenska",
    flag: "🇸🇪",
    speechLang: "sv-SE",
    accent: "swedish",
    alphabetNote: "瑞典語共有 29 個字母；Å、Ä、Ö 是獨立字母，排在 Z 之後。",
    alphabet: [
      alphabetItem("A", "a", "啊"),
      alphabetItem("B", "be", "貝"),
      alphabetItem("C", "se", "塞"),
      alphabetItem("D", "de", "得"),
      alphabetItem("E", "e", "欸"),
      alphabetItem("F", "eff", "艾夫"),
      alphabetItem("G", "ge", "耶／給"),
      alphabetItem("H", "hå", "霍"),
      alphabetItem("I", "i", "伊"),
      alphabetItem("J", "ji", "依"),
      alphabetItem("K", "kå", "科"),
      alphabetItem("L", "ell", "艾爾"),
      alphabetItem("M", "em", "艾姆"),
      alphabetItem("N", "en", "恩"),
      alphabetItem("O", "o", "烏／歐"),
      alphabetItem("P", "pe", "佩"),
      alphabetItem("Q", "ku", "庫"),
      alphabetItem("R", "ärr", "艾爾（顫音）"),
      alphabetItem("S", "ess", "艾斯"),
      alphabetItem("T", "te", "特"),
      alphabetItem("U", "u", "於"),
      alphabetItem("V", "ve", "維"),
      alphabetItem("W", "dubbel-ve", "杜貝爾維"),
      alphabetItem("X", "eks", "艾克斯"),
      alphabetItem("Y", "y", "圓唇「於」"),
      alphabetItem("Z", "säta", "塞塔"),
      alphabetItem("Å", "å", "喔"),
      alphabetItem("Ä", "ä", "欸"),
      alphabetItem("Ö", "ö", "圓唇「呃」"),
    ],
    phrases: [
      phraseItem("hello", "greetings", "你好", "Hej!", "嗨／嘿", "最通用的日常招呼。"),
      phraseItem("good-morning", "greetings", "早安", "God morgon!", "咕・摩榮", "早晨向人打招呼。"),
      phraseItem("good-afternoon", "greetings", "午安／下午好", "God eftermiddag!", "咕・艾夫特米達格", "午後較正式的招呼。"),
      phraseItem("good-evening", "greetings", "晚上好", "God kväll!", "咕・克維爾", "傍晚或夜間見面時。"),
      phraseItem("good-night", "greetings", "晚安", "God natt!", "咕・納特", "睡前或夜晚道別。"),
      phraseItem("goodbye", "greetings", "再見", "Hej då!", "嗨・多", "常用、自然的道別。"),
      phraseItem("see-you", "greetings", "回頭見", "Vi ses!", "維・塞斯", "和熟人輕鬆道別。"),
      phraseItem("nice-to-meet", "greetings", "很高興認識你", "Trevligt att träffas.", "特雷夫里特・阿特・特雷法斯", "第一次見面時。"),
      phraseItem("please", "polite", "請", "Snälla.", "斯內拉", "請求時使用；點餐常直接搭配 tack。"),
      phraseItem("thanks", "polite", "謝謝", "Tack!", "塔克", "最常用的謝謝。"),
      phraseItem("many-thanks", "polite", "非常謝謝", "Tack så mycket!", "塔克・索・米克特", "加強謝意。"),
      phraseItem("you-are-welcome", "polite", "不客氣", "Varsågod!", "瓦修咕", "回應謝謝，或遞東西給人時。"),
      phraseItem("sorry", "polite", "對不起", "Förlåt.", "佛洛特", "道歉時使用。"),
      phraseItem("excuse-me", "polite", "不好意思／打擾一下", "Ursäkta.", "烏謝克塔", "引起注意、借過或詢問前。"),
      phraseItem("no-problem", "polite", "沒關係", "Ingen fara.", "英恩・法拉", "表示不用擔心。"),
      phraseItem("speak-english", "travel", "請問你會說英文嗎？", "Talar du engelska?", "塔拉・杜・英耶爾斯卡", "需要改用英文溝通時。"),
      phraseItem("dont-speak-language", "travel", "我不會說瑞典語", "Jag talar inte svenska.", "亞・塔拉・英特・斯文斯卡", "先說明自己的語言能力。"),
      phraseItem("help-me", "travel", "可以請你幫我嗎？", "Kan du hjälpa mig?", "康・杜・耶爾帕・梅", "需要一般協助時。"),
      phraseItem("how-much", "travel", "這個多少錢？", "Hur mycket kostar det här?", "許爾・米克特・庫斯塔・德・海爾", "購物詢價時。"),
      phraseItem("want-this", "travel", "我要這個", "Jag tar den här.", "亞・塔・登・海爾", "購物時指著想要的物品。"),
      phraseItem("order", "restaurant", "我想點餐", "Jag skulle vilja beställa.", "亞・斯庫勒・維利亞・貝斯特拉", "準備點餐時。"),
      phraseItem("menu", "restaurant", "請給我菜單", "Kan jag få menyn, tack?", "康・亞・佛・梅紐恩・塔克", "向服務人員要菜單。"),
      phraseItem("bill", "restaurant", "我要結帳", "Notan, tack.", "努坦・塔克", "用餐後請服務人員結帳。"),
      phraseItem("toilet", "travel", "洗手間在哪裡？", "Var ligger toaletten?", "瓦・利格・圖阿雷滕", "尋找洗手間。"),
      phraseItem("station", "transport", "車站在哪裡？", "Var ligger stationen?", "瓦・利格・斯塔胡嫩", "詢問火車站或車站位置。"),
      phraseItem("lost", "travel", "我迷路了", "Jag har gått vilse.", "亞・哈・果特・維爾瑟", "迷路並需要協助時。"),
      phraseItem("slower", "travel", "請慢一點說", "Kan du prata lite långsammare?", "康・杜・普拉塔・利特・隆薩瑪雷", "對方說得太快時。"),
      phraseItem("repeat", "travel", "可以再說一次嗎？", "Kan du säga det igen?", "康・杜・塞亞・德・伊耶恩", "沒有聽清楚時。"),
      phraseItem("reservation", "accommodation", "我有預約", "Jag har en bokning.", "亞・哈・恩・布克寧", "飯店或餐廳報到時。"),
      phraseItem("go-here", "transport", "我想去這裡", "Jag vill åka hit.", "亞・維爾・歐卡・希特", "指著地圖告訴司機。"),
      phraseItem("call-taxi", "transport", "請幫我叫計程車", "Kan du ringa en taxi åt mig?", "康・杜・林亞・恩・塔克西・歐特・梅", "請櫃檯或店員叫車。"),
      phraseItem("ticket", "transport", "請給我一張到市中心的票", "En biljett till centrum, tack.", "恩・比耶特・提爾・森特魯姆・塔克", "在售票處買票。"),
      phraseItem("platform", "transport", "請問是第幾月台？", "Vilken perrong?", "維爾肯・佩榮", "確認列車月台。"),
      phraseItem("check-in", "accommodation", "我想辦理入住", "Jag skulle vilja checka in.", "亞・斯庫勒・維利亞・謝卡・英", "抵達飯店櫃檯時。"),
      phraseItem("wifi", "accommodation", "這裡有 Wi-Fi 嗎？", "Finns det wifi här?", "芬斯・德・外法以・海爾", "詢問網路服務。"),
      phraseItem("allergy", "restaurant", "我對堅果過敏", "Jag är allergisk mot nötter.", "亞・艾・阿萊爾吉斯克・莫特・內特爾", "用餐前說明過敏。"),
    ],
    numbers: buildSwedishNumbers(),
  },

  german: {
    label: "德語",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    speechLang: "de-DE",
    accent: "german",
    alphabetNote: "德語使用 26 個基本字母，另有 Ä、Ö、Ü 與 ß（Eszett）。",
    alphabet: [
      alphabetItem("A", "a", "啊"),
      alphabetItem("B", "be", "貝"),
      alphabetItem("C", "tse", "采", "C"),
      alphabetItem("D", "de", "得"),
      alphabetItem("E", "e", "欸"),
      alphabetItem("F", "eff", "艾夫"),
      alphabetItem("G", "ge", "給"),
      alphabetItem("H", "ha", "哈"),
      alphabetItem("I", "i", "伊"),
      alphabetItem("J", "jot", "優特"),
      alphabetItem("K", "ka", "卡"),
      alphabetItem("L", "ell", "艾爾"),
      alphabetItem("M", "em", "艾姆"),
      alphabetItem("N", "en", "恩"),
      alphabetItem("O", "o", "歐"),
      alphabetItem("P", "pe", "佩"),
      alphabetItem("Q", "ku", "庫"),
      alphabetItem("R", "err", "艾爾（小舌音）"),
      alphabetItem("S", "ess", "艾斯"),
      alphabetItem("T", "te", "特"),
      alphabetItem("U", "u", "烏"),
      alphabetItem("V", "fau", "法奧"),
      alphabetItem("W", "we", "維"),
      alphabetItem("X", "iks", "伊克斯"),
      alphabetItem("Y", "Ypsilon", "于普西隆"),
      alphabetItem("Z", "zett", "采特"),
      alphabetItem("Ä", "Ä", "短「欸」"),
      alphabetItem("Ö", "Ö", "圓唇「呃」"),
      alphabetItem("Ü", "Ü", "圓唇「伊」"),
      alphabetItem("ß", "Eszett", "艾斯采特"),
    ],
    phrases: [
      phraseItem("hello", "greetings", "你好", "Hallo!", "哈囉", "最通用的日常招呼。"),
      phraseItem("good-morning", "greetings", "早安", "Guten Morgen!", "古騰・摩根", "早晨向人打招呼。"),
      phraseItem("good-afternoon", "greetings", "午安／下午好", "Guten Tag!", "古騰・塔克", "白天通用且禮貌的招呼。"),
      phraseItem("good-evening", "greetings", "晚上好", "Guten Abend!", "古騰・阿本特", "傍晚或夜間見面時。"),
      phraseItem("good-night", "greetings", "晚安", "Gute Nacht!", "古特・納赫特", "睡前或夜晚道別。"),
      phraseItem("goodbye", "greetings", "再見", "Auf Wiedersehen!", "奧夫・維德澤恩", "較正式的道別。"),
      phraseItem("see-you", "greetings", "回頭見", "Bis später!", "比斯・施佩特", "和熟人輕鬆道別。"),
      phraseItem("nice-to-meet", "greetings", "很高興認識你", "Freut mich, Sie kennenzulernen.", "弗洛伊特・米希・西・肯嫩楚勒嫩", "第一次見面時的禮貌說法。"),
      phraseItem("please", "polite", "請", "Bitte.", "比特", "請求、回應謝謝都可使用。"),
      phraseItem("thanks", "polite", "謝謝", "Danke!", "當克", "最常用的謝謝。"),
      phraseItem("many-thanks", "polite", "非常謝謝", "Vielen Dank!", "菲倫・當克", "加強謝意。"),
      phraseItem("you-are-welcome", "polite", "不客氣", "Gern geschehen!", "給恩・格謝恩", "回應別人的謝謝。"),
      phraseItem("sorry", "polite", "對不起", "Es tut mir leid.", "艾斯・圖特・米爾・萊特", "較完整、真誠的道歉。"),
      phraseItem("excuse-me", "polite", "不好意思／打擾一下", "Entschuldigung.", "恩特舒爾迪貢", "引起注意、借過或道歉。"),
      phraseItem("no-problem", "polite", "沒關係", "Kein Problem.", "凱因・普羅布雷姆", "表示不用在意。"),
      phraseItem("speak-english", "travel", "請問你會說英文嗎？", "Sprechen Sie Englisch?", "施普雷亨・西・英格利施", "禮貌詢問能否改用英文。"),
      phraseItem("dont-speak-language", "travel", "我不會說德語", "Ich spreche kein Deutsch.", "伊希・施普雷赫・凱因・多伊奇", "先說明自己的語言能力。"),
      phraseItem("help-me", "travel", "可以請你幫我嗎？", "Können Sie mir helfen?", "克嫩・西・米爾・黑爾芬", "需要一般協助時。"),
      phraseItem("how-much", "travel", "這個多少錢？", "Wie viel kostet das?", "維・菲爾・科斯特・達斯", "購物詢價時。"),
      phraseItem("want-this", "travel", "我要這個", "Ich nehme das.", "伊希・內默・達斯", "購物時指著想要的物品。"),
      phraseItem("order", "restaurant", "我想點餐", "Ich möchte bestellen.", "伊希・默希特・貝施特倫", "準備點餐時。"),
      phraseItem("menu", "restaurant", "請給我菜單", "Die Speisekarte, bitte.", "迪・施拜澤卡特・比特", "向服務人員要菜單。"),
      phraseItem("bill", "restaurant", "我要結帳", "Zahlen, bitte.", "察倫・比特", "用餐後請服務人員結帳。"),
      phraseItem("toilet", "travel", "洗手間在哪裡？", "Wo ist die Toilette?", "沃・伊斯特・迪・托阿雷特", "尋找洗手間。"),
      phraseItem("station", "transport", "車站在哪裡？", "Wo ist der Bahnhof?", "沃・伊斯特・德爾・班霍夫", "詢問火車站位置。"),
      phraseItem("lost", "travel", "我迷路了", "Ich habe mich verirrt.", "伊希・哈伯・米希・菲爾特", "迷路並需要協助時。"),
      phraseItem("slower", "travel", "請慢一點說", "Bitte sprechen Sie langsamer.", "比特・施普雷亨・西・朗薩默", "對方說得太快時。"),
      phraseItem("repeat", "travel", "可以再說一次嗎？", "Können Sie das bitte wiederholen?", "克嫩・西・達斯・比特・維德霍倫", "沒有聽清楚時。"),
      phraseItem("reservation", "accommodation", "我有預約", "Ich habe eine Reservierung.", "伊希・哈伯・艾訥・雷澤菲隆", "飯店或餐廳報到時。"),
      phraseItem("go-here", "transport", "我想去這裡", "Ich möchte hierhin.", "伊希・默希特・希爾欣", "指著地圖告訴司機。"),
      phraseItem("call-taxi", "transport", "請幫我叫計程車", "Können Sie mir ein Taxi rufen?", "克嫩・西・米爾・艾因・塔克西・魯芬", "請櫃檯或店員叫車。"),
      phraseItem("ticket", "transport", "請給我一張到市中心的票", "Eine Fahrkarte ins Zentrum, bitte.", "艾訥・法卡特・因斯・岑特魯姆・比特", "在售票處買票。"),
      phraseItem("platform", "transport", "請問是第幾月台？", "Welches Gleis, bitte?", "維爾赫斯・格萊斯・比特", "確認列車月台。"),
      phraseItem("check-in", "accommodation", "我想辦理入住", "Ich möchte einchecken.", "伊希・默希特・艾因切肯", "抵達飯店櫃檯時。"),
      phraseItem("wifi", "accommodation", "這裡有 Wi-Fi 嗎？", "Gibt es hier WLAN?", "吉普特・艾斯・希爾・威蘭", "詢問網路服務。"),
      phraseItem("allergy", "restaurant", "我對堅果過敏", "Ich bin allergisch gegen Nüsse.", "伊希・賓・阿萊爾吉施・給根・紐瑟", "用餐前說明過敏。"),
    ],
    numbers: buildGermanNumbers(),
  },

  italian: {
    label: "義大利語",
    nativeName: "Italiano",
    flag: "🇮🇹",
    speechLang: "it-IT",
    accent: "italian",
    alphabetNote: "義大利語主要使用 21 個字母。J、K、W、X、Y 多見於外來語、名字或品牌。",
    alphabet: [
      alphabetItem("A", "a", "啊"),
      alphabetItem("B", "bi", "比"),
      alphabetItem("C", "ci", "奇"),
      alphabetItem("D", "di", "迪"),
      alphabetItem("E", "e", "欸"),
      alphabetItem("F", "effe", "艾費"),
      alphabetItem("G", "gi", "吉"),
      alphabetItem("H", "acca", "阿卡"),
      alphabetItem("I", "i", "伊"),
      alphabetItem("L", "elle", "艾雷"),
      alphabetItem("M", "emme", "艾梅"),
      alphabetItem("N", "enne", "艾內"),
      alphabetItem("O", "o", "喔"),
      alphabetItem("P", "pi", "皮"),
      alphabetItem("Q", "cu", "庫"),
      alphabetItem("R", "erre", "艾雷（顫音）"),
      alphabetItem("S", "esse", "艾塞"),
      alphabetItem("T", "ti", "提"),
      alphabetItem("U", "u", "烏"),
      alphabetItem("V", "vi / vu", "維／烏", "vi"),
      alphabetItem("Z", "zeta", "澤塔"),
      alphabetItem("J", "i lunga", "伊・倫加", "i lunga", "外來字母"),
      alphabetItem("K", "cappa", "卡帕", "cappa", "外來字母"),
      alphabetItem("W", "doppia vu", "多皮亞・烏", "doppia vu", "外來字母"),
      alphabetItem("X", "ics", "伊克斯", "ics", "外來字母"),
      alphabetItem("Y", "ipsilon", "伊普西隆", "ipsilon", "外來字母"),
    ],
    phrases: [
      phraseItem("hello", "greetings", "你好", "Ciao!", "喬", "熟人間最常用的招呼。"),
      phraseItem("good-morning", "greetings", "早安", "Buongiorno!", "波恩・喬爾諾", "早晨到白天的禮貌招呼。"),
      phraseItem("good-afternoon", "greetings", "午安／下午好", "Buon pomeriggio!", "波恩・波梅里喬", "午後較正式的招呼。"),
      phraseItem("good-evening", "greetings", "晚上好", "Buonasera!", "波納・塞拉", "傍晚或夜間見面時。"),
      phraseItem("good-night", "greetings", "晚安", "Buonanotte!", "波納・諾特", "睡前或夜晚道別。"),
      phraseItem("goodbye", "greetings", "再見", "Arrivederci!", "阿里維德爾奇", "禮貌且通用的道別。"),
      phraseItem("see-you", "greetings", "回頭見", "A dopo!", "阿・多波", "和熟人輕鬆道別。"),
      phraseItem("nice-to-meet", "greetings", "很高興認識你", "Piacere di conoscerla.", "皮亞切雷・迪・科諾謝拉", "第一次見面的禮貌說法。"),
      phraseItem("please", "polite", "請", "Per favore.", "佩爾・法沃雷", "提出請求時使用。"),
      phraseItem("thanks", "polite", "謝謝", "Grazie!", "格拉茲耶", "最常用的謝謝。"),
      phraseItem("many-thanks", "polite", "非常謝謝", "Grazie mille!", "格拉茲耶・米雷", "加強謝意。"),
      phraseItem("you-are-welcome", "polite", "不客氣", "Prego!", "普雷果", "回應謝謝，也可表示請進。"),
      phraseItem("sorry", "polite", "對不起", "Mi dispiace.", "米・迪斯皮亞切", "較完整、真誠的道歉。"),
      phraseItem("excuse-me", "polite", "不好意思／打擾一下", "Scusi.", "斯庫西", "禮貌引起陌生人注意。"),
      phraseItem("no-problem", "polite", "沒關係", "Non fa niente.", "農・法・尼恩特", "表示不用在意。"),
      phraseItem("speak-english", "travel", "請問你會說英文嗎？", "Parla inglese?", "帕爾拉・英格雷澤", "禮貌詢問能否改用英文。"),
      phraseItem("dont-speak-language", "travel", "我不會說義大利語", "Non parlo italiano.", "農・帕爾洛・伊塔利亞諾", "先說明自己的語言能力。"),
      phraseItem("help-me", "travel", "可以請你幫我嗎？", "Mi può aiutare?", "米・普沃・阿尤塔雷", "需要一般協助時。"),
      phraseItem("how-much", "travel", "這個多少錢？", "Quanto costa questo?", "款托・科斯塔・奎斯托", "購物詢價時。"),
      phraseItem("want-this", "travel", "我要這個", "Prendo questo.", "普倫多・奎斯托", "購物時指著想要的物品。"),
      phraseItem("order", "restaurant", "我想點餐", "Vorrei ordinare.", "沃雷・奧爾迪納雷", "準備點餐時。"),
      phraseItem("menu", "restaurant", "請給我菜單", "Il menù, per favore.", "伊爾・梅努・佩爾・法沃雷", "向服務人員要菜單。"),
      phraseItem("bill", "restaurant", "我要結帳", "Il conto, per favore.", "伊爾・孔托・佩爾・法沃雷", "用餐後請服務人員結帳。"),
      phraseItem("toilet", "travel", "洗手間在哪裡？", "Dov'è il bagno?", "多韋・伊爾・巴紐", "尋找洗手間。"),
      phraseItem("station", "transport", "車站在哪裡？", "Dov'è la stazione?", "多韋・拉・斯塔齊奧內", "詢問火車站位置。"),
      phraseItem("lost", "travel", "我迷路了", "Mi sono perso.", "米・索諾・佩爾索", "迷路時使用；女性可說 persa。"),
      phraseItem("slower", "travel", "請慢一點說", "Può parlare più lentamente?", "普沃・帕爾拉雷・皮烏・倫塔門特", "對方說得太快時。"),
      phraseItem("repeat", "travel", "可以再說一次嗎？", "Può ripetere, per favore?", "普沃・里佩特雷・佩爾・法沃雷", "沒有聽清楚時。"),
      phraseItem("reservation", "accommodation", "我有預約", "Ho una prenotazione.", "奧・烏納・普雷諾塔齊奧內", "飯店或餐廳報到時。"),
      phraseItem("go-here", "transport", "我想去這裡", "Vorrei andare qui.", "沃雷・安達雷・奎", "指著地圖告訴司機。"),
      phraseItem("call-taxi", "transport", "請幫我叫計程車", "Può chiamarmi un taxi?", "普沃・基亞馬爾米・溫・塔克西", "請櫃檯或店員叫車。"),
      phraseItem("ticket", "transport", "請給我一張到市中心的票", "Un biglietto per il centro, per favore.", "溫・比列托・佩爾・伊爾・千特羅・佩爾・法沃雷", "在售票處買票。"),
      phraseItem("platform", "transport", "請問是第幾月台？", "Quale binario, per favore?", "夸雷・比納里奧・佩爾・法沃雷", "確認列車月台。"),
      phraseItem("check-in", "accommodation", "我想辦理入住", "Vorrei fare il check-in.", "沃雷・法雷・伊爾・切克因", "抵達飯店櫃檯時。"),
      phraseItem("wifi", "accommodation", "這裡有 Wi-Fi 嗎？", "C'è il Wi-Fi?", "切・伊爾・外法以", "詢問網路服務。"),
      phraseItem("allergy", "restaurant", "我對堅果過敏", "Sono allergico alla frutta a guscio.", "索諾・阿萊爾吉科・阿拉・弗魯塔・阿・古修", "用餐前說明過敏；女性可說 allergica。"),
    ],
    numbers: buildItalianNumbers(),
  },
};
