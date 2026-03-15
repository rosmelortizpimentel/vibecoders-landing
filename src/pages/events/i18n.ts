export type FairLang = 'en' | 'es' | 'fr' | 'pt';

const fairTranslations: Record<FairLang, Record<string, string>> = {
  en: {
    'hud.steps': 'steps',
    'hud.stands': 'stands',
    'hud.online': 'online',
    'hud.move_desktop': 'WASD to move / Walk to a stand to enter / Mouse to orbit',
    'hud.move_mobile': 'Joystick to move / Walk to a stand to enter',
    'speaker.back': 'Back to map',
    'speaker.register': 'Register on Luma',
    'speaker.view_events': 'View Events on Luma',
    'speaker.talk_soon': 'Talk coming soon',
    'speaker.visited_title': 'Already Visited',
    'speaker.visited_desc': 'This stand has been explored',
    'speaker.date_tba': 'Date TBA',
    'speaker.min': 'min',
  },
  es: {
    'hud.steps': 'pasos',
    'hud.stands': 'stands',
    'hud.online': 'en linea',
    'hud.move_desktop': 'WASD para mover / Camina a un stand para entrar / Mouse para orbitar',
    'hud.move_mobile': 'Joystick para mover / Camina a un stand para entrar',
    'speaker.back': 'Volver al mapa',
    'speaker.register': 'Registrarse en Luma',
    'speaker.view_events': 'Ver Eventos en Luma',
    'speaker.talk_soon': 'Charla proximamente',
    'speaker.visited_title': 'Ya Visitado',
    'speaker.visited_desc': 'Este stand ya fue explorado',
    'speaker.date_tba': 'Fecha por definir',
    'speaker.min': 'min',
  },
  fr: {
    'hud.steps': 'pas',
    'hud.stands': 'stands',
    'hud.online': 'en ligne',
    'hud.move_desktop': 'WASD pour se deplacer / Marchez vers un stand / Souris pour orbiter',
    'hud.move_mobile': 'Joystick pour se deplacer / Marchez vers un stand',
    'speaker.back': 'Retour a la carte',
    'speaker.register': "S'inscrire sur Luma",
    'speaker.view_events': 'Voir les evenements sur Luma',
    'speaker.talk_soon': 'Conference bientot',
    'speaker.visited_title': 'Deja visite',
    'speaker.visited_desc': 'Ce stand a ete explore',
    'speaker.date_tba': 'Date a confirmer',
    'speaker.min': 'min',
  },
  pt: {
    'hud.steps': 'passos',
    'hud.stands': 'stands',
    'hud.online': 'online',
    'hud.move_desktop': 'WASD para mover / Caminhe ate um stand / Mouse para orbitar',
    'hud.move_mobile': 'Joystick para mover / Caminhe ate um stand',
    'speaker.back': 'Voltar ao mapa',
    'speaker.register': 'Registrar no Luma',
    'speaker.view_events': 'Ver Eventos no Luma',
    'speaker.talk_soon': 'Palestra em breve',
    'speaker.visited_title': 'Ja Visitado',
    'speaker.visited_desc': 'Este stand ja foi explorado',
    'speaker.date_tba': 'Data a definir',
    'speaker.min': 'min',
  },
};

function detectLang(): FairLang {
  const nav = (navigator.language || (navigator as any).userLanguage || 'en').toLowerCase();
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('pt')) return 'pt';
  return 'en';
}

const currentLang: FairLang = detectLang();

export function fairT(key: string): string {
  return fairTranslations[currentLang]?.[key] ?? fairTranslations.en[key] ?? key;
}

export function getFairLang(): FairLang {
  return currentLang;
}
