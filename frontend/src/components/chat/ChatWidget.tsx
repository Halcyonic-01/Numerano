import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import ChatWidget from "@/components/chat/ChatWidget";
import {
  Users,
  FileCheck,
  Clock,
  CheckCircle2,
  Edit3,
  Copy,
  ExternalLink,
  Bell,
  Settings,
  LogOut,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// Define the interface based on your Backend Schema
interface TeamMember {
  name: string;
  email: string;
  _id?: string;
}

interface TeamData {
  _id: string;
  teamId: string;
  teamName: string;
  organization: string;
  status: string;
  isIdVerified: boolean;
  members: TeamMember[];
  createdAt: string;
}

const stats = [
  { icon: Users, label: "Team Members", value: "0", color: "from-blue-500 to-cyan-500" },
  { icon: FileCheck, label: "Documents", value: "1", color: "from-purple-500 to-pink-500" },
  { icon: Clock, label: "Days Active", value: "1", color: "from-orange-500 to-red-500" },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await api.get('/teams/me');
        setTeam(data);
        
        // Update stats based on real data
        if (data) {
            stats[0].value = data.members.length.toString();
            
            // Calculate days active
            const created = new Date(data.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - created.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            stats[2].value = diffDays.toString();
        }
      } catch (error) {
        console.log("User has no team or fetch failed");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const copyTeamId = () => {
    if (team?.teamId) {
        navigator.clipboard.writeText(team.teamId);
        toast({
          title: "Copied!",
          description: "Team ID copied to clipboard.",
        });
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-background flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
      );
  }

  // If no team is found, show empty state
  if (!team) {
      return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-6 pt-32 text-center">
                <div className="glass-card rounded-3xl p-12 max-w-2xl mx-auto">
                    <h1 className="font-display text-3xl font-bold mb-4">No Team Registered Yet</h1>
                    <p className="text-muted-foreground mb-8">Get started by registering your team for the hackathon.</p>
                    <Button variant="gradient" size="lg" asChild>
                        <Link to="/register">Register New Team</Link>
                    </Button>
                </div>
            </div>
            <ChatWidget />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 pt-32 pb-16 relative">
        {/* Welcome Banner */}
        <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Welcome back,</span>
                  {team.isIdVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      Pending Verification
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {team.teamName}
                </h1>
                <p className="text-muted-foreground">{team.organization}</p>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-6 hover-lift group"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-110",
                  stat.color
                )}>
                  <stat.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Team ID Card */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 h-full">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Team ID
              </h2>
              <div className="bg-muted rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="font-mono text-lg font-bold gradient-text">
                    {team.teamId}
                  </code>
                  <Button variant="ghost" size="icon" onClick={copyTeamId}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this ID for verification and support inquiries
              </p>
            </div>
          </div>

          {/* Team Members */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Team Members
                </h2>
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Team
                </Button>
              </div>

              <div className="space-y-4">
                {team.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    {/* Assuming first member is leader for display logic if role isn't stored explicitly */}
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      index === 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {index === 0 ? "Leader" : "Member"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <Link to="/register">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Register New Team</p>
                  <p className="text-xs text-muted-foreground">Start fresh registration</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-4 justify-start">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mr-4">
                <FileCheck className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium">View Documents</p>
                <p className="text-xs text-muted-foreground">Manage uploaded files</p>
              </div>
            </Button>

            <Button variant="outline" className="h-auto py-4 justify-start">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mr-4">
                <ExternalLink className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Get Support</p>
                <p className="text-xs text-muted-foreground">Contact our team</p>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}