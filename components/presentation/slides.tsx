import {
  BookOpen,
  Code2,
  Database,
  Globe,
  Layout,
  Lock,
  MessageSquare,
  Monitor,
  Rocket,
  Server,
  Shield,
  ShoppingBag,
  Target,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";

function SlideWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-6 py-10">
      <div className="w-full max-w-7xl">{children}</div>
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-10 ${className}`}>
      {children}
    </div>
  );
}

function InnerCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-muted rounded-xl p-6 ${className}`}>{children}</div>
  );
}

export function TitleSlide() {
  return (
    <SlideWrapper>
      <Card className="text-center py-28">
        <div className="flex items-center justify-center gap-3 mb-8">
          <ShoppingBag className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-7xl font-bold text-foreground mb-6">
          GBC Marketplace
        </h1>
        <p className="text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          A secure, campus-focused marketplace for George Brown College students
          to buy and sell items within their community.
        </p>
        <InnerCard className="inline-block">
          <p className="text-muted-foreground text-lg">
            COMP 3078 — Capstone Presentation
          </p>
        </InnerCard>
      </Card>
    </SlideWrapper>
  );
}

export function TeamSlide() {
  const members = [
    { name: "Arash Shalchian", role: "Software Developer" },
    { name: "Radin Madadnezhad Aligorkeh", role: "Software Developer" },
    { name: "Diana Mohammadi", role: "Software Developer" },
  ];

  return (
    <SlideWrapper>
      <Card>
        <h2 className="text-5xl font-bold text-foreground mb-3 text-center">
          Meet the Team
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-10">
          The developers behind GBC Marketplace
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {members.map((member) => (
            <InnerCard key={member.name} className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground">{member.name}</p>
              <p className="text-base text-muted-foreground">{member.role}</p>
            </InnerCard>
          ))}
        </div>
      </Card>
    </SlideWrapper>
  );
}

export function ProjectOverviewSlide() {
  return (
    <SlideWrapper>
      <Card>
        <h2 className="text-5xl font-bold text-foreground mb-10 text-center">
          Project Overview
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <InnerCard>
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">The Problem</h3>
            </div>
            <p className="text-base text-muted-foreground">
              Students lack a dedicated, trusted platform to buy and sell items
              within their campus community. General marketplaces are cluttered
              and not tailored to student needs.
            </p>
          </InnerCard>
          <InnerCard>
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Our Solution</h3>
            </div>
            <p className="text-base text-muted-foreground">
              A campus-specific marketplace with verified student accounts,
              real-time messaging, content moderation, and an admin dashboard —
              all built for safe, local transactions.
            </p>
          </InnerCard>
          <InnerCard>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Target Users</h3>
            </div>
            <p className="text-base text-muted-foreground">
              George Brown College students who want to buy or sell textbooks,
              electronics, furniture, and other items to fellow students on
              campus.
            </p>
          </InnerCard>
        </div>
      </Card>
    </SlideWrapper>
  );
}

export function DemoFeaturesSlide() {
  const categories = [
    {
      title: "Marketplace",
      icon: ShoppingBag,
      features: [
        "Browse & search listings",
        "Category & price filters",
        "Sort by newest/price",
        "Create, edit, delete listings",
        "Image uploads",
        "Save/bookmark listings",
      ],
    },
    {
      title: "Messaging",
      icon: MessageSquare,
      features: [
        "Real-time conversations",
        "Per-listing chat threads",
        "Conversation list",
        "Unread indicators",
      ],
    },
    {
      title: "Admin Panel",
      icon: Shield,
      features: [
        "Dashboard with stats",
        "User management & bans",
        "Listing moderation",
        "Report resolution",
        "Site settings",
      ],
    },
    {
      title: "Security",
      icon: Lock,
      features: [
        "Clerk authentication",
        "Role-based access control",
        "Content moderation flags",
        "Rate limiting",
        "Input sanitization",
      ],
    },
  ];

  return (
    <SlideWrapper>
      <Card>
        <h2 className="text-5xl font-bold text-foreground mb-10 text-center">
          Features
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <InnerCard key={cat.title}>
              <div className="flex items-center gap-3 mb-4">
                <cat.icon className="w-7 h-7 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{cat.title}</h3>
              </div>
              <ul className="space-y-2">
                {cat.features.map((f) => (
                  <li
                    key={f}
                    className="text-base text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </InnerCard>
          ))}
        </div>
      </Card>
    </SlideWrapper>
  );
}

export function TechStackSlide() {
  const layers = [
    {
      title: "Frontend",
      icon: Monitor,
      items: ["Next.js 16", "React 19", "Tailwind CSS 4",],
    },
    {
      title: "Backend",
      icon: Server,
      items: [
        "Convex (real-time DB)",
        "Server functions",
        "File storage API",
        "Cron jobs",
      ],
    },
    {
      title: "Authentication",
      icon: Lock,
      items: ["Clerk", "OAuth providers", "Session management", "Role sync"],
    },
    {
      title: "Infrastructure",
      icon: Globe,
      items: [
        "Vercel deployment",
        "Convex cloud",
        ,
        ,
      ],
    },
  ];

  return (
    <SlideWrapper>
      <Card>
        <h2 className="text-5xl font-bold text-foreground mb-10 text-center">
          Tech Stack
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {layers.map((layer) => (
            <InnerCard key={layer.title}>
              <div className="flex items-center gap-3 mb-4">
                <layer.icon className="w-7 h-7 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{layer.title}</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {layer.items.map((item) => (
                  <span
                    key={item}
                    className="text-base bg-background border border-border rounded-lg px-4 py-2 text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </InnerCard>
          ))}
        </div>
      </Card>
    </SlideWrapper>
  );
}

export function ArchitectureSlide() {
  const stats = [
    { label: "Database Tables", value: "10", icon: Database },
    { label: "App Routes", value: "15", icon: Layout },
    { label: "Backend Modules", value: "12", icon: Code2 },
    { label: "Security Layers", value: "5", icon: Shield },
  ];

  const tables = [
    "users",
    "listings",
    "conversations",
    "messages",
    "reports",
    "moderationLogs",
    "settings",
    "savedListings",
    "rateLimits",
  ];

  const securityFeatures = [
    "Clerk auth + role-based access",
    "Server-side input validation",
    "Content moderation pipeline",
    "Rate limiting per user/action",
    "Admin audit logging",
  ];

  return (
    <SlideWrapper>
      <Card>
        <h2 className="text-5xl font-bold text-foreground mb-10 text-center">
          Architecture
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <InnerCard key={stat.label} className="text-center py-6">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </InnerCard>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <InnerCard>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Database Schema</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {tables.map((t) => (
                <span
                  key={t}
                  className="text-sm font-mono bg-background border border-border rounded-lg px-3 py-1.5 text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </InnerCard>
          <InnerCard>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Security Features
              </h3>
            </div>
            <ul className="space-y-2">
              {securityFeatures.map((f) => (
                <li
                  key={f}
                  className="text-base text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-primary mt-1">•</span>
                  {f}
                </li>
              ))}
            </ul>
          </InnerCard>
        </div>
      </Card>
    </SlideWrapper>
  );
}

export function ConclusionSlide() {
  const milestones = [
    { text: "Push notifications for messages", icon: Rocket },
    { text: "Payment integration", icon: CheckCircle },
    { text: "Campus-verified email signup", icon: BookOpen },
    { text: "Mobile app (React Native)", icon: Calendar },
  ];

  const risks = [
    { text: "Scaling beyond single campus", icon: AlertTriangle },
    { text: "Fraud & scam prevention", icon: Shield },
    { text: "User adoption & retention", icon: Users },
    { text: "Content moderation at scale", icon: Target },
  ];

  return (
    <SlideWrapper>
      <Card>
        <h2 className="text-5xl font-bold text-foreground mb-10 text-center">
          Next Steps & Risks
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <InnerCard>
            <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
              <Rocket className="w-7 h-7 text-primary" />
              Next Steps
            </h3>
            <div className="space-y-4">
              {milestones.map((m) => (
                <div key={m.text} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <m.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-base text-muted-foreground">{m.text}</p>
                </div>
              ))}
            </div>
          </InnerCard>
          <InnerCard>
            <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-primary" />
              Risks & Challenges
            </h3>
            <div className="space-y-4">
              {risks.map((r) => (
                <div key={r.text} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <r.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-base text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </InnerCard>
        </div>
        <div className="text-center mt-10">
          <InnerCard className="inline-block">
            <p className="text-xl text-muted-foreground font-medium">
              Thank you! Questions?
            </p>
          </InnerCard>
        </div>
      </Card>
    </SlideWrapper>
  );
}
