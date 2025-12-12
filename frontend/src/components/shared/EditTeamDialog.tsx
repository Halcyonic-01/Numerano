import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit3, UserPlus, UserMinus, Mail, User } from "lucide-react";
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
  createdAt: string;
}

interface EditTeamDialogProps {
  team: TeamData;
  onTeamUpdate: (updatedTeam: TeamData) => void;
  isLeader?: boolean;
}

export default function EditTeamDialog({ team, onTeamUpdate, isLeader = true }: EditTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState(team.teamName);
  const [organization, setOrganization] = useState(team.organization);
  const [members, setMembers] = useState<TeamMember[]>(team.members);
  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter both name and email for the new member.",
        variant: "destructive",
      });
      return;
    }

    if (members.length >= 4) {
      toast({
        title: "Team Size Limit",
        description: "Maximum team size is 4 members including the leader.",
        variant: "destructive",
      });
      return;
    }

    if (members.some(member => member.email === newMember.email)) {
      toast({
        title: "Duplicate Email",
        description: "A member with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    setMembers([...members, { ...newMember }]);
    setNewMember({ name: "", email: "" });
  };

  const removeMember = (index: number) => {
    if (index === 0) {
      toast({
        title: "Cannot Remove Leader",
        description: "The team leader cannot be removed.",
        variant: "destructive",
      });
      return;
    }
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!teamName.trim() || !organization.trim()) {
      toast({
        title: "Invalid Input",
        description: "Team name and organization are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.put(`/teams/${team._id}`, {
        teamName,
        organization,
        members,
      });

      onTeamUpdate(data);
      setOpen(false);
      toast({
        title: "Team Updated",
        description: "Your team information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update team.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLeader) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Team
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Edit Team Information
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Team Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Enter organization name"
              />
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-4">
            <h3 className="font-medium">Team Members</h3>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Leader
                      </span>
                    )}
                    {index !== 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Member */}
          <div className="space-y-4">
            <h3 className="font-medium">Add New Member</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Member name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Member email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={addMember} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}