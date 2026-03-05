const fs = require('fs');
const path = require('path');

const featuresES = [
  { label: "Comunidad de Vibe Coders", free: "Forma parte de una comunidad de builders que construyen en público", pro: true },
  { label: "Perfil Público", free: "Tu espacio para mostrar quién eres y lo que estás construyendo", pro: true },
  { label: "Botón 'Book a Call' en tu perfil", free: false, pro: "Permite que clientes o socios agenden una llamada directamente desde tu perfil" },
  { label: "Chatea con otros Vibe Coders", free: "Conéctate directamente con otros builders desde la plataforma", pro: true },
  { label: "Publica tus Apps", free: "Muestra tus proyectos al mundo sin límites", pro: true },
  { label: "Publica tus Apps para Testing", free: "Consigue testers reales para tu app — solo si ya has contribuido como tester", pro: "Acceso completo sin requisitos" },
  { label: "Analytics de tus Apps", free: false, pro: "Entiende cómo crece tu app: visitantes, vistas, países y fuentes en un solo lugar" },
  { label: "Banners en vivo sin deploy", free: false, pro: "Comunica actualizaciones, ofertas o cambios a tus usuarios sin tocar el código" },
  { label: "Gestión de Feedback", free: "Recibe feedback de la comunidad", pro: "Página personalizada para recibir feedback con tu propio dominio" },
  { label: "Gestión de Roadmap", free: "Planifica tu producto de forma privada", pro: "Comparte tu roadmap públicamente con dominio personalizado" },
  { label: "Botón 'Open to Partnerships'", soon: true, free: false, pro: "Abre tus apps a inversionistas, Tech Partners o Growth Partners. Juntos escalan más rápido." },
  { label: "Multifounders", soon: true, free: false, pro: "Gestiona apps en equipo con otros cofundadores" },
  { label: "Waitlist", soon: true, free: false, pro: "Captura interesados antes de lanzar" },
  { label: "Marketplace de Apps", soon: true, free: "Compra apps de otros builders", pro: "Compra y vende tus apps" },
  { label: "Status Page", soon: true, free: false, pro: "Muestra el estado de tu app en tiempo real a tus usuarios" },
  { label: "Change Logs", soon: true, free: false, pro: "Documenta y comunica cada mejora de tu producto" }
];

const comparisonES = {
  title: "Prueba <1>Vibe Pro</1> para escalar.",
  subtitle: "Tu plan actual incluye todo lo necesario para validar. Pasa a Pro cuando estés listo para lanzar, crecer y vender como un experto.",
  currentPlan: "Plan actual",
  proSubtitle: "Para Builders y Equipos que escalan",
  yearUnit: "/año",
  cta: "Hacer Upgrade a Pro",
  priceNote: "*Precio sube a $24.00 el 1 de Marzo",
  guarantee: "Pago de un único precio promocional. Cancele en cualquier momento en un par de clics.",
  colBenefits: "Beneficios Premium",
  colFree: "Gratis",
  colPro: "Pro",
  soon: "(próximamente)",
  features: featuresES
};

const featuresEN = [
  { label: "Vibe Coders Community", free: "Be part of a community of builders building in public", pro: true },
  { label: "Public Profile", free: "Your space to show who you are and what you're building", pro: true },
  { label: "'Book a Call' profile button", free: false, pro: "Let clients or partners book a call directly from your profile" },
  { label: "Chat with other Vibe Coders", free: "Connect directly with other builders from the platform", pro: true },
  { label: "Publish your Apps", free: "Showcase your projects to the world without limits", pro: true },
  { label: "Publish your Apps for Testing", free: "Get real testers for your app — only if you've contributed as a tester", pro: "Full access with no prerequisites" },
  { label: "App Analytics", free: false, pro: "Understand how your app grows: visitors, views, countries and sources in one place" },
  { label: "Live Banners without deploy", free: false, pro: "Communicate updates, offers, or changes to your users without touching code" },
  { label: "Feedback Management", free: "Receive community feedback", pro: "Customized page to receive feedback with your own domain" },
  { label: "Roadmap Management", free: "Plan your product privately", pro: "Share your roadmap publicly with a custom domain" },
  { label: "'Open to Partnerships' Button", soon: true, free: false, pro: "Open your apps to investors, Tech Partners, or Growth Partners. Scale faster together." },
  { label: "Multi-founders", soon: true, free: false, pro: "Manage apps as a team with other co-founders" },
  { label: "Waitlist", soon: true, free: false, pro: "Capture leads before launching" },
  { label: "Apps Marketplace", soon: true, free: "Buy apps from other builders", pro: "Buy and sell your apps" },
  { label: "Status Page", soon: true, free: false, pro: "Show the real-time status of your app to your users" },
  { label: "Change Logs", soon: true, free: false, pro: "Document and communicate every improvement of your product" }
];

const comparisonEN = {
  title: "Try <1>Vibe Pro</1> to scale.",
  subtitle: "Your current plan includes everything needed to validate. Upgrade to Pro when you're ready to launch, grow, and sell like an expert.",
  currentPlan: "Current plan",
  proSubtitle: "For scaling Builders and Teams",
  yearUnit: "/year",
  cta: "Upgrade to Pro",
  priceNote: "*Price increases to $24.00 on March 1st",
  guarantee: "One-time promotional price payment. Cancel anytime in a couple of clicks.",
  colBenefits: "Premium Benefits",
  colFree: "Free",
  colPro: "Pro",
  soon: "(coming soon)",
  features: featuresEN
};

const featuresPT = [
  { label: "Comunidade Vibe Coders", free: "Faça parte de uma comunidade de builders que constroem em público", pro: true },
  { label: "Perfil Público", free: "Seu espaço para mostrar quem você é e o que está construindo", pro: true },
  { label: "Botão 'Book a Call' no perfil", free: false, pro: "Permita que clientes ou parceiros agendem uma chamada diretamente do seu perfil" },
  { label: "Converse com outros Vibe Coders", free: "Conecte-se diretamente com outros builders na plataforma", pro: true },
  { label: "Publique seus Apps", free: "Mostre seus projetos ao mundo sem limites", pro: true },
  { label: "Publique seus Apps para Testing", free: "Consiga testadores reais para seu app — apenas se você já contribuiu como testador", pro: "Acesso total sem pré-requisitos" },
  { label: "Analytics dos seus Apps", free: false, pro: "Entenda como seu app cresce: visitantes, visualizações, países e fontes em um só lugar" },
  { label: "Banners ao vivo sem deploy", free: false, pro: "Comunique atualizações, ofertas ou mudanças aos seus usuários sem mexer no código" },
  { label: "Gerenciamento de Feedback", free: "Receba feedback da comunidade", pro: "Página personalizada para receber feedback com seu próprio domínio" },
  { label: "Gerenciamento de Roadmap", free: "Planeje seu produto de forma privada", pro: "Compartilhe seu roadmap publicamente com um domínio personalizado" },
  { label: "Botão 'Open to Partnerships'", soon: true, free: false, pro: "Abra seus apps para investidores, Tech Partners ou Growth Partners. Escale mais rápido juntos." },
  { label: "Multi-fundadores", soon: true, free: false, pro: "Gerencie apps em equipe com outros cofundadores" },
  { label: "Waitlist", soon: true, free: false, pro: "Capture leads antes de lançar" },
  { label: "Marketplace de Apps", soon: true, free: "Compre apps de outros builders", pro: "Compre e venda seus apps" },
  { label: "Status Page", soon: true, free: false, pro: "Mostre o status do seu app em tempo real para os usuários" },
  { label: "Change Logs", soon: true, free: false, pro: "Documente e comunique cada melhoria do seu produto" }
];

const comparisonPT = {
  title: "Experimente <1>Vibe Pro</1> para escalar.",
  subtitle: "Seu plano atual inclui tudo o que é necessário para validar. Mude para o Pro quando estiver pronto para lançar, crescer e vender como um especialista.",
  currentPlan: "Plano atual",
  proSubtitle: "Para Builders e Equipes escalando",
  yearUnit: "/ano",
  cta: "Mudar para Pro",
  priceNote: "*O preço sobe para $24.00 em 1º de Março",
  guarantee: "Pagamento único de preço promocional. Cancele a qualquer momento com poucos cliques.",
  colBenefits: "Benefícios Premium",
  colFree: "Grátis",
  colPro: "Pro",
  soon: "(em breve)",
  features: featuresPT
};

const featuresFR = [
  { label: "Communauté Vibe Coders", free: "Faites partie d'une communauté de builders qui construisent en public", pro: true },
  { label: "Profil Public", free: "Votre espace pour montrer qui vous êtes et ce que vous construisez", pro: true },
  { label: "Bouton 'Book a Call' sur le profil", free: false, pro: "Permettez à des clients ou partenaires de programmer un appel directement depuis votre profil" },
  { label: "Discutez avec d'autres Vibe Coders", free: "Connectez-vous directement avec d'autres builders depuis la plateforme", pro: true },
  { label: "Publiez vos Apps", free: "Montrez vos projets au monde sans limites", pro: true },
  { label: "Publiez vos Apps pour Testing", free: "Obtenez de vrais testeurs pour votre app — uniquement si vous avez contribué en tant que testeur", pro: "Accès complet sans pré-requis" },
  { label: "Analytics de vos Apps", free: false, pro: "Comprenez comment votre app grandit : visiteurs, vues, pays et sources au même endroit" },
  { label: "Bannières en direct sans deploy", free: false, pro: "Communiquez des mises à jour, offres ou changements à vos utilisateurs sans toucher au code" },
  { label: "Gestion des Feedback", free: "Recevez les retours de la communauté", pro: "Page personnalisée pour recevoir des retours avec votre propre domaine" },
  { label: "Gestion de Roadmap", free: "Planifiez votre produit en privé", pro: "Partagez votre roadmap publiquement avec un domaine personnalisé" },
  { label: "Bouton 'Open to Partnerships'", soon: true, free: false, pro: "Ouvrez vos apps aux investisseurs, Tech Partners ou Growth Partners. Passez à l'échelle plus vite ensemble." },
  { label: "Multi-fondateurs", soon: true, free: false, pro: "Gérez les apps en équipe avec d'autres cofondateurs" },
  { label: "Waitlist", soon: true, free: false, pro: "Capturez des contacts avant le lancement" },
  { label: "Marketplace d'Apps", soon: true, free: "Achetez des apps d'autres builders", pro: "Achetez et vendez vos apps" },
  { label: "Status Page", soon: true, free: false, pro: "Montrez le statut en temps réel de votre app à vos utilisateurs" },
  { label: "Change Logs", soon: true, free: false, pro: "Documentez et communiquez chaque amélioration de votre produit" }
];

const comparisonFR = {
  title: "Essayez <1>Vibe Pro</1> pour scaler.",
  subtitle: "Votre forfait actuel inclut tout le nécessaire pour valider. Passez à Pro lorsque vous êtes prêt à lancer, grandir et vendre comme un expert.",
  currentPlan: "Forfait actuel",
  proSubtitle: "Pour les Builders et Équipes qui scalent",
  yearUnit: "/an",
  cta: "Passer Pro",
  priceNote: "*Le prix passe à $24.00 le 1er Mars",
  guarantee: "Paiement unique au prix promotionnel. Annulez à tout moment en quelques clics.",
  colBenefits: "Avantages Premium",
  colFree: "Gratuit",
  colPro: "Pro",
  soon: "(bientôt)",
  features: featuresFR
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
