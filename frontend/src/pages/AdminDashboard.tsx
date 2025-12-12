import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Navbar } from "@/components/layout/Navbar";
import {
  Users,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  LogOut,
  Search,
  Filter,
  BarChart3,
  FileCheck,
  AlertCircle,
  Calendar,
  TrendingUp,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Team {
  _id: string;
  teamId: string;
  teamName: string;
  organization: string;
  status: 'pending' | 'approved' | 'rejected';
  isIdVerified: boolean;
  members: Array<{ name: string; email: string; }>;
  leader: { name: string; email: string; };
  createdAt: string;
  adminComments?: string;
  rejectionReason?: string;
  reviewedAt?: string;
}

interface DashboardStats {
  totalTeams: number;
  pendingTeams: number;
  approvedTeams: number;
  rejectedTeams: number;
  verifiedTeams: number;
  recentTeams: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionComments, setRejectionComments] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      // Set up axios defaults for admin requests
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const [statsResponse, teamsResponse] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/teams')
      ]);

      setStats(statsResponse.data);
      setTeams(teamsResponse.data.teams);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
        return;
      }
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTeam = async (teamId: string) => {
    setActionLoading(teamId);
    try {
      await api.put(`/admin/teams/${teamId}/approve`, {
        comments: approvalComments
      });

      setTeams(teams.map(team => 
        team._id === teamId 
          ? { ...team, status: 'approved' as const, adminComments: approvalComments }
          : team
      ));

      toast({
        title: "Team Approved",
        description: "Team has been approved successfully",
      });

      setShowTeamDetails(false);
      setApprovalComments('');
      fetchDashboardData(); // Refresh stats
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.response?.data?.message || "Failed to approve team",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectTeam = async (teamId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(teamId);
    try {
      await api.put(`/admin/teams/${teamId}/reject`, {
        reason: rejectionReason,
        comments: rejectionComments
      });

      setTeams(teams.map(team => 
        team._id === teamId 
          ? { 
              ...team, 
              status: 'rejected' as const, 
              rejectionReason,
              adminComments: rejectionComments 
            }
          : team
      ));

      toast({
        title: "Team Rejected",
        description: "Team has been rejected successfully",
      });

      setShowTeamDetails(false);
      setRejectionReason('');
      setRejectionComments('');
      fetchDashboardData(); // Refresh stats
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.response?.data?.message || "Failed to reject team",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    const matchesSearch = team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.teamId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Teams", value: stats?.totalTeams || 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { title: "Pending Review", value: stats?.pendingTeams || 0, icon: Clock, color: "from-yellow-500 to-orange-500" },
    { title: "Approved", value: stats?.approvedTeams || 0, icon: CheckCircle2, color: "from-green-500 to-emerald-500" },
    { title: "ID Verified", value: stats?.verifiedTeams || 0, icon: FileCheck, color: "from-purple-500 to-violet-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {adminInfo.name}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="glass-card rounded-2xl p-6 hover-lift"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center",
                  stat.color
                )}>
                  <stat.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All Teams' : status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Teams List */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Team Registrations
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredTeams.length} of {teams.length} teams
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Team</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Organization</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Leader</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground">Members</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team._id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-foreground">{team.teamName}</p>
                        <p className="text-xs text-muted-foreground">{team.teamId}</p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-foreground">{team.organization}</td>
                    <td className="py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{team.leader.name}</p>
                        <p className="text-xs text-muted-foreground">{team.leader.email}</p>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs">
                        <Users className="w-3 h-3" />
                        {team.members.length}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      {getStatusBadge(team.status)}
                    </td>
                    <td className="py-4 text-center text-sm text-muted-foreground">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowTeamDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Details Modal */}
        <Dialog open={showTeamDetails} onOpenChange={setShowTeamDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Team Review - {selectedTeam?.teamName}
              </DialogTitle>
            </DialogHeader>
            
            {selectedTeam && (
              <div className="space-y-6">
                {/* Team Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Team Name</label>
                      <p className="font-semibold text-foreground">{selectedTeam.teamName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Team ID</label>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{selectedTeam.teamId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Organization</label>
                      <p className="text-foreground">{selectedTeam.organization}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                      <p className="text-foreground">{new Date(selectedTeam.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedTeam.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID Verification</label>
                      <p className={cn("text-sm font-medium", selectedTeam.isIdVerified ? "text-green-600" : "text-yellow-600")}>
                        {selectedTeam.isIdVerified ? "✓ Verified" : "⏳ Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">Team Members</label>
                  <div className="space-y-2">
                    {selectedTeam.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        {index === 0 && (
                          <Badge className="bg-primary/10 text-primary">Leader</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions for Pending Teams */}
                {selectedTeam.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Approval Comments (Optional)
                      </label>
                      <Textarea
                        placeholder="Add any comments for the team..."
                        value={approvalComments}
                        onChange={(e) => setApprovalComments(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Rejection Details
                      </label>
                      <Input
                        placeholder="Reason for rejection (required if rejecting)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mb-2"
                      />
                      <Textarea
                        placeholder="Additional comments (optional)"
                        value={rejectionComments}
                        onChange={(e) => setRejectionComments(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowTeamDetails(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectTeam(selectedTeam._id)}
                        disabled={actionLoading === selectedTeam._id}
                        className="flex-1"
                      >
                        {actionLoading === selectedTeam._id ? "Rejecting..." : "Reject Team"}
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => handleApproveTeam(selectedTeam._id)}
                        disabled={actionLoading === selectedTeam._id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === selectedTeam._id ? "Approving..." : "Approve Team"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show existing admin comments for reviewed teams */}
                {(selectedTeam.status === 'approved' || selectedTeam.status === 'rejected') && selectedTeam.adminComments && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Admin Comments
                    </label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-foreground">{selectedTeam.adminComments}</p>
                      {selectedTeam.reviewedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed on {new Date(selectedTeam.reviewedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}