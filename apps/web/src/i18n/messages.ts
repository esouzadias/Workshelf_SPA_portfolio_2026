export type Locale = "en" | "pt";

export type Dict = {
  categories?: Record<string, string>;
  descriptions?: Record<string, string>;

  createAccount: string;
  login: string;
  logout: string;
  email: string;
  password: string;
  profile: string;

  highlights: string;
  topSkills: string;
  topTechnologies?: string;

  noSkills: string;
  skill?: string;
  skillsHint?: string;
  addSkill?: string;
  proficiency?: string;

  latestCertificates: string;
  noCertifications: string;
  addCertification: string;

  latestReviews: string;
  noReviews: string;

  professionalExperience: string;
  workStatus?: string;

  editProfile: string;

  language?: string;
  general?: string;
  identity?: string;

  pt?: string;
  en?: string;
  ptLang?: string;
  enLang?: string;

  name?: string;
  fullName?: string;
  birthDate?: string;
  age?: string;
  years?: string;

  gender?: string;
  male?: string;
  female?: string;
  other?: string;

  nationality?: string;

  currentRole?: string;
  consultancy?: string;
  yearsInCurrentRole?: string;

  employed: string;
  freelance: string;
  student: string;
  unemployed: string;

  company?: string;
  companyLogo?: string;
  client?: string;
  clientLogo?: string;
  upload?: string;

  education?: string;
  schoolLevel?: string;
  school?: string;
  schoolLogo?: string;
  degree?: string;

  doctorate?: string;
  masters?: string;
  college?: string;
  highSchool?: string;
  basic?: string;

  startDate?: string;
  endDate?: string;
  current?: string;

  maritalStatus?: string;
  employmentStatus?: string;

  techFocus?: string;
  clickToFocus?: string;
  currentTitle?: string;

  dependents?: string;

  close?: string;

  languages?: string;
  addLanguage?: string;
  native?: string;

  contacts?: string;
  addContact?: string;

  aboutMe?: string;

  hobbies?: string;
  hobby?: string;
  editHobby?: string;
  addHobby?: string;

  personal?: string;
  account?: string;
  work?: string;

  description?: string;
  icon?: string;
  pickIcon?: string;

  showMore?: string;
  showLess?: string;

  pickProfileTheme?: string;
  pickCurrentTheme?: string;
  diferentTheme?: string;
  themeChoices?: string;
  pickTheme?: string;
  updateTheme?: string;

  profileUpdated?: string;

  changeEmail?: string;
  emailChangeNote?: string;

  changePassword?: string;
  currentPassword?: string;
  currentPasswordRequired?: string;
  currentPasswordHelp?: string;

  passwordHint?: string;
  newPassword?: string;

  optional?: string;

  displayName: string;
  displayNameRequired?: string;

  themeToggle: string;
  preferedTheme: string;

  changePicture: string;
  profilePicture: string;

  changeAvatar?: string;
  pictureSelected?: string;

  welcome: string;
  notAuthenticated: string;

  system: string;
  light: string;
  dark: string;

  locale: string;

  edit: string;
  save: string;
  cancel: string;
  remove: string;
  saving: string;

  loginRequired: string;

  errors: Record<string, string>;
  infos: Record<string, string>;
  unknownError?: string;
};

export const DICTS: Record<Locale, Dict> = {
  en: {
    // Auth
    createAccount: "Create account",
    login: "Login",
    logout: "Logout",
    email: "Email",
    password: "Password",

    // App
    profile: "Profile",
    welcome: "Welcome",
    notAuthenticated: "You are currently not authenticated. Please log in or create an account",
    loginRequired: "You need to be logged in to access this page.",
    unknownError: "An unknown error occurred",

    // UI
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    remove: "Remove",
    saving: "Saving...",
    close: "Close",
    showMore: "Show more",
    showLess: "Show less",

    // Dashboard
    highlights: "Highlights",
    topTechnologies: "Top Technologies",
    topSkills: "Top Skills",
    noSkills: "No skills added",
    skillsHint: "Keep it concise. Highlight what you use most.",
    addSkill: "Add Skill",
    proficiency: "Proficiency",

    latestCertificates: "Latest Certifications",
    noCertifications: "No certifications added",
    addCertification: "Add certificate",

    latestReviews: "Latest Review",
    noReviews: "No reviews added",

    professionalExperience: "Professional Experience",
    workStatus: "Work Status",
    currentTitle: "Current Title",

    editProfile: "Edit profile",

    // Tabs / Sections
    language: "Language",
    general: "General",
    identity: "Identity",
    personal: "Personal",
    account: "Account",
    work: "Work",

    // Locale picker
    pt: "PT-Portuguese",
    en: "ENG-English",
    ptLang: "Portuguese",
    enLang: "English",
    locale: "Language",

    // Identity
    name: "Name",
    fullName: "Full name",
    birthDate: "Birth date",
    age: "Age",
    years: "years",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    nationality: "Nationality",
    dependents: "Dependents",
    maritalStatus: "Marital status",

    // Work
    currentRole: "Current role",
    consultancy: "Consultancy",
    yearsInCurrentRole: "Years in current company / client",
    employmentStatus: "Employment status",
    employed: "Employed",
    freelance: "Freelance",
    student: "Student",
    unemployed: "Unemployed",
    company: "Company",
    companyLogo: "Company Logo",
    client: "Client",
    clientLogo: "Client logo",
    upload: "Upload",

    // Education
    education: "Education",
    schoolLevel: "Education",
    school: "School",
    schoolLogo: "School Logo",
    degree: "Degree",
    doctorate: "Doctorate",
    masters: "Masters",
    college: "College",
    highSchool: "HighSchool",
    basic: "Basic",
    startDate: "Start Date",
    endDate: "End Date",
    current: "Current",

    // Experience helpers
    techFocus: "Tech Focus",
    clickToFocus: "Click a tech to filter tasks and highlight matches",

    // Profile sections
    languages: "Languages",
    addLanguage: "Add language",
    native: "Native",

    contacts: "Contacts",
    addContact: "Add contact",

    aboutMe: "About me",

    hobbies: "Hobbies",
    hobby: "Hobby",
    editHobby: "Edit hobby",
    addHobby: "Add hobby",

    description: "Description",
    icon: "Icon",
    pickIcon: "Pick an Icon",

    // Theme
    pickProfileTheme: "Pick profile theme",
    pickCurrentTheme: "Pick current theme",
    diferentTheme: "Your profile has a different theme than the current one. Which do you prefer to use?",
    themeChoices: "Do you prefer light, dark or system theme?",
    pickTheme: "Pick theme",
    updateTheme: "Update theme",
    profileUpdated: "Profile updated",

    // Account
    changeEmail: "Change email",
    emailChangeNote: "A confirmation email will be sent to the new address.",
    changePassword: "Change password",
    currentPassword: "Current password",
    currentPasswordRequired: "Current password is required",
    currentPasswordHelp: "Required to change email or password",
    passwordHint: "At least 8 characters",
    newPassword: "New password",
    optional: "optional",

    displayName: "Display name",
    displayNameRequired: "Display name is required",

    themeToggle: "Toggle theme",
    preferedTheme: "Preferred theme",

    changePicture: "Change picture",
    changeAvatar: "Choose an avatar",
    profilePicture: "Profile picture",
    pictureSelected: "Picture selected",

    system: "System",
    light: "Light",
    dark: "Dark",

    // Structured maps
    errors: {
      "err.missing_fields": "Missing required fields",
      "err.email_in_use": "Email already in use",
      "err.invalid_credentials": "Invalid credentials",
      "err.wrong_password": "Current password is incorrect",
      "err.password_too_short": "Password too short (min 8)",
      "err.user_not_found": "User not found",
      "err.session_expired": "Session expired",
    },
    infos: {
      emailChangeNote: "Email editing will require your current password",
    },
    categories: {
      overview: "Overview",
      experience: "Experience",
      skills: "Skills",
      certifications: "Certifications",
      reviews: "Reviews",
      relatedCertifications: "Related certificates",
      skill: "Skill",
    },
    descriptions: {
      dProfile: "A brief info about me and my work",
      dHighlights: "CV & Focus areas",
      dSkills: "My top skills and details",
      dSkill: "Details about a specific skill",
      dCertifications: "My latest certifications",
      dRelatedCertifications: "Certifications related to this skill",
      dExperience: "My detailed professional experience",
      dLatestReviews: "Latest comments and reviews",
    },
  },

  pt: {
    // Auth
    createAccount: "Criar conta",
    login: "Login",
    logout: "Terminar sessão",
    email: "Email",
    password: "Password",

    // App
    profile: "Perfil",
    welcome: "Bem-vindo",
    notAuthenticated: "De momento, você não está autenticado. Por favor, inicie sessão ou crie uma conta",
    loginRequired: "Precisas de estar logado para aceder a esta página.",
    unknownError: "Ocorreu um erro desconhecido",

    // UI
    edit: "Editar",
    save: "Guardar",
    cancel: "Cancelar",
    remove: "Remover",
    saving: "A guardar...",
    close: "Fechar",
    showMore: "Mostrar mais",
    showLess: "Mostrar menos",

    // Dashboard
    highlights: "Destaques",
    topTechnologies: "Principais tecnologias",
    topSkills: "Principais habilidades",
    noSkills: "Sem habilidades adicionadas",
    skillsHint: "Seja conciso. Destaque o que mais utiliza.",
    addSkill: "Adicionar competência",
    proficiency: "Proficiência",

    latestCertificates: "Últimas certificações",
    noCertifications: "Sem certificações adicionadas",
    addCertification: "Adicionar certificado",

    latestReviews: "Última revisão",
    noReviews: "Sem avaliações adicionadas",

    professionalExperience: "Experiência profissional",
    workStatus: "Situação profissional",
    currentTitle: "Título Atual",

    editProfile: "Editar perfil",

    // Tabs / Sections
    language: "Idioma",
    general: "Geral",
    identity: "Identidade",
    personal: "Pessoal",
    account: "Conta",
    work: "Trabalho",

    // Locale picker
    pt: "PT-Português",
    en: "ENG-Englês",
    ptLang: "Português",
    enLang: "Inglês",
    locale: "Idioma",

    // Identity
    name: "Nome",
    fullName: "Nome Completo",
    birthDate: "Data de Nascimento",
    age: "Idade",
    years: "anos",
    gender: "Género",
    male: "Masculino",
    female: "Femenino",
    other: "Outro",
    nationality: "Nacionalidade",
    dependents: "Dependentes",
    maritalStatus: "Estado Civil",

    // Work
    currentRole: "Cargo Atual",
    consultancy: "Consultoria",
    yearsInCurrentRole: "Anos na atual empresa / cliente",
    employmentStatus: "Estado Profissional",
    employed: "Empregado",
    freelance: "Freelancer",
    student: "Estudante",
    unemployed: "Desempregado",
    company: "Empresa",
    companyLogo: "Logo da empresa",
    client: "Cliente",
    clientLogo: "Logo do cliente",
    upload: "Carregar",

    // Education
    education: "Educação",
    schoolLevel: "Escolaridade",
    school: "Escola",
    schoolLogo: "Logo da Escola",
    degree: "Grau",
    doctorate: "Doutorado",
    masters: "Mestrado",
    college: "Licenciatura",
    highSchool: "Liceu / 12º Ano",
    basic: "Básico / Ciclo",
    startDate: "Data de Inicio",
    endDate: "Data de Término",
    current: "Corrente",

    // Experience helpers
    techFocus: "Foco tecnológico",
    clickToFocus: "Clique numa tecnologia para filtrar tarefas e destacar correspondências",

    // Profile sections
    languages: "Línguas",
    addLanguage: "Adicionar língua",
    native: "Nativo",

    contacts: "Contactos",
    addContact: "Adicionar contacto",

    aboutMe: "Sobre mim",

    hobbies: "Passa tempos",
    hobby: "Passa tempo",
    editHobby: "Editar passa tempo",
    addHobby: "Adicionar passa tempo",

    description: "Descrição",
    icon: "Icone",
    pickIcon: "Escolha um Icone",

    // Theme
    pickProfileTheme: "Escolher tema do perfil",
    pickCurrentTheme: "Escolher tema atual",
    diferentTheme: "O seu perfil tem um tema diferente do atual. O que prefere usar?",
    themeChoices: "Prefere tema claro, escuro ou do sistema?",
    pickTheme: "Escolher tema",
    updateTheme: "Atualizar tema",
    profileUpdated: "Perfil atualizado",

    // Account
    changeEmail: "Alterar email",
    emailChangeNote: "Será enviado um email de confirmação para o novo endereço.",
    changePassword: "Alterar password",
    currentPassword: "Password atual",
    currentPasswordRequired: "A password atual é obrigatória",
    currentPasswordHelp: "Obrigatório para alterar email ou password",
    passwordHint: "Mínimo 8 caracteres",
    newPassword: "Nova password",
    optional: "opcional",

    displayName: "Nome de exibição",
    displayNameRequired: "O nome de exibição é obrigatório",

    themeToggle: "Alternar tema",
    preferedTheme: "Tema preferido",

    changePicture: "Alterar foto",
    changeAvatar: "Escolher avatar",
    profilePicture: "Foto de perfil",
    pictureSelected: "Foto selecionada",

    system: "Sistema",
    light: "Claro",
    dark: "Escuro",

    // Structured maps
    errors: {
      "err.missing_fields": "Campos obrigatórios",
      "err.email_in_use": "Email já em uso",
      "err.invalid_credentials": "Credenciais inválidas",
      "err.wrong_password": "Password atual incorreta",
      "err.password_too_short": "Password muito curta (mín. 8)",
      "err.user_not_found": "Utilizador não encontrado",
      "err.session_expired": "Sessão expirada",
    },
    infos: {
      emailChangeNote: "A edição de email exigirá a sua senha atual",
    },
    categories: {
      overview: "Visão geral",
      experience: "Experiência Profissional",
      skills: "Competências",
      skill: "Competência",
      certifications: "Certificados",
      relatedCertifications: "Certificados Relacionados",
      reviews: "Avaliações",
    },
    descriptions: {
      dProfile: "Resumo sobre mim e o meu trabalho",
      dHighlights: "CV e Áreas de foco",
      dSkills: "As minhas principais habilidades e competências",
      dCertifications: "As minhas certificações mais recentes",
      dExperience: "A minha experiência profissional detalhada",
      dLatestReviews: "Comentários e avaliações mais recentes",
    },
  },
};