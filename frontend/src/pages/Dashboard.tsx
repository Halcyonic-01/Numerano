import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import ChatWidget from "@/components/chat/ChatWidget";
import EditTeamDialog from "@/components/shared/EditTeamDialog";
import ViewDocumentsDialog from "@/components/shared/ViewDocumentsDialog";
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
  Loader2,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

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
  documents?: any[];
  createdAt: string;
}

const stats = [
  { icon: Users, label: "Team Members", value: "0", color: "from-blue-500 to-cyan-500" },
  { icon: FileCheck, label: "Documents", value: "1", color: "from-purple-500 to-pink-500" },
  { icon: Clock, label: "Days Active", value: "1", color: "from-orange-500 to-red-500" },
];

export default function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user info to determine if they're the leader
  const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLeader = team && team.members.length > 0 && team.members[0].email === currentUser.email;

  const handleTeamUpdate = (updatedTeam: TeamData) => {
    setTeam(updatedTeam);
    // Update stats with new data
    stats[0].value = updatedTeam.members.length.toString();
  };

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await api.get('/teams/me');
        setTeam(data);
        
        // Update stats based on real data
        if (data) {
          stats[0].value = data.members.length.toString();
          stats[1].value = (data.documents?.length || 0).toString(); // Update documents count
          
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

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
        
        {/* Background */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 pt-32 pb-16 relative">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome to <span className="gradient-text">Numerano</span>!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're all set! Now you can register your team for the hackathon and start your journey.
            </p>
          </div>

          {/* Action Cards */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Register Team Card */}
            <div className="glass-card rounded-3xl p-8 hover-lift group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-center text-foreground mb-4">
                Register Your Team
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                Create your team, add members, and upload your ID for verification. Get your unique Team ID instantly.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Human verification with reCAPTCHA</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Add team members and details</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Upload ID for verification</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Get unique Team ID</span>
                </div>
              </div>
              <Button variant="gradient" size="lg" className="w-full" asChild>
                <Link to="/register">
                  Register Team Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Explore Features Card */}
            <div className="glass-card rounded-3xl p-8 hover-lift group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <FileCheck className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-center text-foreground mb-4">
                Explore Dashboard
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                Take a tour of your dashboard features. You can always register your team later when you're ready.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>View platform features</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Chat with support</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Access quick actions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Register team anytime</span>
                </div>
              </div>
              <Button variant="outline" size="lg" className="w-full">
                <ExternalLink className="w-5 h-5 mr-2" />
                Continue Exploring
              </Button>
            </div>
          </div>

          {/* Help Section */}
          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-4">
              Need help getting started? Our support team is here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="ghost" className="inline-flex items-center">
                <Users className="w-4 h-4 mr-2" />
                View Team Guidelines
              </Button>
              <Button variant="ghost" className="inline-flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
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
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
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
                <EditTeamDialog 
                  team={team} 
                  onTeamUpdate={handleTeamUpdate} 
                  isLeader={isLeader} 
                />
              </div>

              <div className="space-y-4">
                {team.members.map((member, index) => (
                  <div
                    key={member.email}
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

            <ViewDocumentsDialog 
              teamId={team._id} 
              isLeader={isLeader} 
            />

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
