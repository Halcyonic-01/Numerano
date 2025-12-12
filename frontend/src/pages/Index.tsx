import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeatureCard } from "@/components/shared/FeatureCard";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { 
  Shield, 
  Zap, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Lock,
  FileCheck,
  Bot
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Verification",
    description: "Industry-standard security with multi-layer verification to protect your team's data."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Complete your team registration in under 5 minutes with our streamlined process."
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Easily manage team members, roles, and permissions all in one place."
  },
  {
    icon: Bot,
    title: "AI-Powered Support",
    description: "Get instant help from our intelligent chatbot assistant 24/7."
  },
];

const stats = [
  { value: "10K+", label: "Teams Registered" },
  { value: "99.9%", label: "Uptime" },
  { value: "50K+", label: "Active Members" },
  { value: "4.9/5", label: "User Rating" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-slow" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Now with AI-Powered Verification</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 opacity-0 animate-fade-in-up animation-delay-100">
              Register Your Team{" "}
              <span className="gradient-text">Seamlessly</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up animation-delay-200">
              Secure verification, smart automation, and beautiful experience. 
              The modern way to manage team registrations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 opacity-0 animate-fade-in-up animation-delay-300">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Register Team
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/login">
                  Login
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-0 animate-fade-in-up animation-delay-400">
              {stats.map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl p-6 hover-lift">
                  <p className="font-display text-3xl font-bold gradient-text mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="gradient-text">TeamHub</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for seamless team registration and verification
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Simple <span className="gradient-text">4-Step</span> Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your team registered in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: CheckCircle, title: "Verify", desc: "Complete human verification" },
              { icon: Users, title: "Details", desc: "Enter team information" },
              { icon: FileCheck, title: "Upload", desc: "Submit ID documents" },
              { icon: Lock, title: "Complete", desc: "Get your unique Team ID" },
            ].map((step, index) => (
              <div key={step.title} className="relative text-center opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
                )}
                <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow mb-4">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  Step {index + 1}: {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of teams who trust TeamHub for their registration needs.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/register">
                Register Your Team Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
}
