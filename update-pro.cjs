const fs = require('fs');
const path = require('path');

const groupsES = [
  {
    title: "Para empezar",
    features: [
      { label: "Comunidad de Vibe Coders", free: true, pro: true },
      { label: "Perfil Público", free: true, pro: true },
      { label: "Chatea con otros Vibe Coders", free: true, pro: true },
      { label: "Publica tus Apps", free: true, pro: true },
      { label: "Publica tus Apps para Testing", free: "Solo si has contribuido como tester", pro: "Acceso completo sin requisitos" },
    ]
  },
  {
    title: "Para crecer",
    features: [
      { label: "Analytics de tus Apps", free: false, pro: "Visitantes, vistas, países y fuentes en un solo lugar" },
      { label: "Banners en tiempo real", free: false, pro: "Comunica cambios a tus usuarios sin tocar el código" },
      { label: "Gestión de Feedback", free: false, pro: "Página pública con tu propio dominio" },
      { label: "Gestión de Roadmap", free: "Solo privado", pro: "Público con dominio personalizado" },
      { label: "Botón 'Book a Call' en tu perfil", free: false, pro: "Clientes y socios agendan directo desde tu perfil" },
    ]
  },
  {
    title: "Próximamente",
    features: [
      { label: "Open to Partnerships", free: false, pro: "Conecta con inversionistas, Tech Partners y Growth Partners" },
      { label: "Multifounders", free: false, pro: "Gestiona apps en equipo con otros cofundadores" },
      { label: "Waitlist", free: false, pro: "Captura interesados antes de lanzar" },
      { label: "Marketplace de Apps", free: "Compra", pro: "Compra y vende tus apps" },
      { label: "Status Page", free: false, pro: "Muestra el estado de tu app en tiempo real" },
      { label: "Change Logs", free: false, pro: "Documenta cada mejora de tu producto" },
    ]
  }
];

const comparisonES = {
  title: "Prueba <span class=\"text-primary\">VibeCoders Pro</span> para escalar.",
  subtitle: "Tu proyecto merece más que existir — merece crecer. Pro te da todo lo que necesitas para lograrlo.",
  badgeText: "Precio Early Adopter — solo por tiempo limitado",
  cta: "Quiero escalar con Pro →",
  guarantee: "Sin compromisos. Sin complicaciones.",
  colBenefits: "Beneficios Premium",
  colFree: "Gratis",
  colPro: "Pro",
  priceFreeze: "Tu precio se congela de por vida al momento de suscribirte.",
  groups: groupsES
};

const groupsEN = [
  {
    title: "To start",
    features: [
      { label: "Vibe Coders Community", free: true, pro: true },
      { label: "Public Profile", free: true, pro: true },
      { label: "Chat with other Vibe Coders", free: true, pro: true },
      { label: "Publish your Apps", free: true, pro: true },
      { label: "Publish your Apps for Testing", free: "Only if you've contributed as a tester", pro: "Full access with no prerequisites" },
    ]
  },
  {
    title: "To grow",
    features: [
      { label: "App Analytics", free: false, pro: "Visitors, views, countries and sources in one place" },
      { label: "Live Banners", free: false, pro: "Communicate changes to your users without touching code" },
      { label: "Feedback Management", free: false, pro: "Public page with your own domain" },
      { label: "Roadmap Management", free: "Private only", pro: "Public with custom domain" },
      { label: "'Book a Call' Profile Button", free: false, pro: "Clients and partners book directly from your profile" },
    ]
  },
  {
    title: "Coming soon",
    features: [
      { label: "Open to Partnerships", free: false, pro: "Connect with investors, Tech Partners, and Growth Partners" },
      { label: "Multi-founders", free: false, pro: "Manage apps as a team with other co-founders" },
      { label: "Waitlist", free: false, pro: "Capture leads before launching" },
      { label: "Apps Marketplace", free: "Buy", pro: "Buy and sell your apps" },
      { label: "Status Page", free: false, pro: "Show real-time app status" },
      { label: "Change Logs", free: false, pro: "Document every improvement of your product" },
    ]
  }
];

const comparisonEN = {
  title: "Try <span class=\"text-primary\">VibeCoders Pro</span> to scale.",
  subtitle: "Your project deserves more than just existing — it deserves to grow. Pro gives you everything you need to achieve it.",
  badgeText: "Early Adopter Price — limited time only",
  cta: "I want to scale with Pro →",
  guarantee: "No commitments. No complications.",
  colBenefits: "Premium Benefits",
  colFree: "Free",
  colPro: "Pro",
  priceFreeze: "Your price is frozen for life when you subscribe.",
  groups: groupsEN
};

const groupsPT = [
  {
    title: "Para começar",
    features: [
      { label: "Comunidade Vibe Coders", free: true, pro: true },
      { label: "Perfil Público", free: true, pro: true },
      { label: "Converse com outros Vibe Coders", free: true, pro: true },
      { label: "Publique seus Apps", free: true, pro: true },
      { label: "Publique seus Apps para Testing", free: "Apenas se tiver contribuído como testador", pro: "Acesso total sem pré-requisitos" },
    ]
  },
  {
    title: "Para crescer",
    features: [
      { label: "Analytics dos seus Apps", free: false, pro: "Visitantes, visualizações, países e fontes em um só lugar" },
      { label: "Banners ao vivo", free: false, pro: "Comunique mudanças aos seus usuários sem mexer no código" },
      { label: "Gerenciamento de Feedback", free: false, pro: "Página pública com seu próprio domínio" },
      { label: "Gerenciamento de Roadmap", free: "Apenas privado", pro: "Público com domínio personalizado" },
      { label: "Botão 'Book a Call' no perfil", free: false, pro: "Clientes e parceiros agendam diretamente do seu perfil" },
    ]
  },
  {
    title: "Em breve",
    features: [
      { label: "Open to Partnerships", free: false, pro: "Conecte-se com investidores, Tech Partners e Growth Partners" },
      { label: "Multi-fundadores", free: false, pro: "Gerencie apps em equipe com outros cofundadores" },
      { label: "Waitlist", free: false, pro: "Capture leads antes de lançar" },
      { label: "Marketplace de Apps", free: "Compre", pro: "Compre e venda seus apps" },
      { label: "Status Page", free: false, pro: "Mostre o status do app em tempo real" },
      { label: "Change Logs", free: false, pro: "Documente cada melhoria do seu produto" },
    ]
  }
];

const comparisonPT = {
  title: "Experimente <span class=\"text-primary\">VibeCoders Pro</span> para escalar.",
  subtitle: "Seu projeto merece mais do que existir — merece crescer. Pro te dá tudo o que você precisa para conseguir isso.",
  badgeText: "Preço Early Adopter — apenas por tempo limitado",
  cta: "Quero escalar com Pro →",
  guarantee: "Sem compromissos. Sem complicações.",
  colBenefits: "Benefícios Premium",
  colFree: "Grátis",
  colPro: "Pro",
  priceFreeze: "Seu preço é congelado para toda a vida no momento da assinatura.",
  groups: groupsPT
};

const groupsFR = [
  {
    title: "Pour commencer",
    features: [
      { label: "Communauté Vibe Coders", free: true, pro: true },
      { label: "Profil Public", free: true, pro: true },
      { label: "Discutez avec d'autres Vibe Coders", free: true, pro: true },
      { label: "Publiez vos Apps", free: true, pro: true },
      { label: "Publiez vos Apps pour Testing", free: "Uniquement si vous avez contribué comme testeur", pro: "Accès complet sans pré-requis" },
    ]
  },
  {
    title: "Pour grandir",
    features: [
      { label: "Analytics de vos Apps", free: false, pro: "Visiteurs, vues, pays et sources au même endroit" },
      { label: "Bannières en direct", free: false, pro: "Communiquez les changements à vos utilisateurs sans toucher au code" },
      { label: "Gestion des Feedback", free: false, pro: "Page publique avec votre propre domaine" },
      { label: "Gestion de Roadmap", free: "Privé uniquement", pro: "Public avec domaine personnalisé" },
      { label: "Bouton 'Book a Call'", free: false, pro: "Clients et partenaires planifient directement depuis votre profil" },
    ]
  },
  {
    title: "Bientôt",
    features: [
      { label: "Open to Partnerships", free: false, pro: "Connectez-vous avec des investisseurs, Tech Partners et Growth Partners" },
      { label: "Multi-fondateurs", free: false, pro: "Gérez les apps en équipe avec d'autres cofondateurs" },
      { label: "Waitlist", free: false, pro: "Capturez des leads avant le lancement" },
      { label: "Marketplace d'Apps", free: "Achat", pro: "Achetez et vendez vos apps" },
      { label: "Status Page", free: false, pro: "Montrez le statut de l'app en temps réel" },
      { label: "Change Logs", free: false, pro: "Documentez chaque amélioration de votre produit" },
    ]
  }
];

const comparisonFR = {
  title: "Essayez <span class=\"text-primary\">VibeCoders Pro</span> pour scaler.",
  subtitle: "Votre projet mérite plus que d'exister — il mérite de grandir. Pro vous donne tout ce dont vous avez besoin pour y parvenir.",
  badgeText: "Prix Early Adopter — durée limitée",
  cta: "Je veux scaler avec Pro →",
  guarantee: "Sans engagement. Sans complications.",
  colBenefits: "Avantages Premium",
  colFree: "Gratuit",
  colPro: "Pro",
  priceFreeze: "Votre prix est bloqué à vie lors de votre abonnement.",
  groups: groupsFR
};

const map = {
  es: comparisonES,
  en: comparisonEN,
  pt: comparisonPT,
  fr: comparisonFR
};

Object.keys(map).forEach(lang => {
  const p = path.join(__dirname, 'src', 'i18n', lang, 'pro.json');
  const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
  d.comparison = map[lang];
  fs.writeFileSync(p, JSON.stringify(d, null, 2));
});

