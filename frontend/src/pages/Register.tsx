import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { FileUpload } from "@/components/shared/FileUpload";
import ChatWidget from "@/components/chat/ChatWidget";
import api from "@/lib/api";
import { 
  ShieldCheck, 
  Users, 
  FileImage, 
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// 1. IMPORT RECAPTCHA
import ReCAPTCHA from "react-google-recaptcha";

const steps = [
  { title: "Verify", description: "Human verification" },
  { title: "Details", description: "Team information" },
  { title: "Upload", description: "ID documents" },
  { title: "Complete", description: "Review & submit" },
];

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  // 2. CHANGE STATE TO HOLD TOKEN INSTEAD OF BOOLEAN
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const [teamName, setTeamName] = useState("");
  const [organization, setOrganization] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, name: "", email: "" },
  ]);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      { id: Date.now(), name: "", email: "" },
    ]);
  };

  const removeTeamMember = (id: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
    }
  };

  const updateTeamMember = (id: number, field: "name" | "email", value: string) => {
    setTeamMembers(
      teamMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // 3. HANDLE CAPTCHA CHANGE
  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleNext = () => {
    // 4. CHECK IF TOKEN EXISTS INSTEAD OF BOOLEAN
    if (currentStep === 1 && !captchaToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the reCAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2) {
      if (!teamName.trim() || !organization.trim()) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
      const hasEmptyMember = teamMembers.some((m) => !m.name.trim() || !m.email.trim());
      if (hasEmptyMember) {
        toast({
          title: "Missing Information",
          description: "Please fill in all team member details.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 3 && !idFile) {
      toast({
        title: "Upload Required",
        description: "Please upload an ID document.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('teamName', teamName);
      formData.append('organization', organization);
      formData.append('members', JSON.stringify(teamMembers));
      
      // 5. SEND THE REAL TOKEN
      if (captchaToken) {
        formData.append('captchaToken', captchaToken);
      }

      if (idFile) {
        formData.append('idCard', idFile);
      }

      const { data } = await api.post('/teams/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setTeamId(data.teamId);
      
      toast({
        title: "Success!",
        description: "Team registered successfully.",
      });

    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Failed to register team",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTeamId = () => {
    if (teamId) {
      navigator.clipboard.writeText(teamId);
      toast({
        title: "Copied!",
        description: "Team ID copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 pt-32 pb-16 relative">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              Register Your <span className="gradient-text">Team</span>
            </h1>
            <p className="text-muted-foreground">
              Complete the steps below to register your team
            </p>
          </div>

          <div className="mb-12">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          <div className="glass-card rounded-3xl p-8 animate-scale-in">
            {/* Step 1: Verification */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Human Verification
                  </h2>
                  <p className="text-muted-foreground">
                    Please verify that you're not a robot
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    {/* 6. RENDER THE GOOGLE RECAPTCHA WIDGET */}
                    <ReCAPTCHA
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={onCaptchaChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Team Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Team Details
                  </h2>
                  <p className="text-muted-foreground">
                    Enter your team information
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Team Name *
                    </label>
                    <Input
                      placeholder="Enter team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Institute / Organization *
                    </label>
                    <Input
                      placeholder="Enter organization name"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-foreground">
                        Team Members *
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTeamMember}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Member
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {teamMembers.map((member, index) => (
                        <div
                          key={member.id}
                          className="flex gap-3 items-start animate-fade-in"
                        >
                          <div className="flex-1 grid md:grid-cols-2 gap-3">
                            <Input
                              placeholder="Member name"
                              value={member.name}
                              onChange={(e) =>
                                updateTeamMember(member.id, "name", e.target.value)
                              }
                            />
                            <Input
                              type="email"
                              placeholder="Member email"
                              value={member.email}
                              onChange={(e) =>
                                updateTeamMember(member.id, "email", e.target.value)
                              }
                            />
                          </div>
                          {teamMembers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTeamMember(member.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: ID Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                    <FileImage className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    ID Card Upload
                  </h2>
                  <p className="text-muted-foreground">
                    Upload a valid ID document for verification
                  </p>
                </div>

                <FileUpload
                  onFileSelect={setIdFile}
                  accept="image/*,.pdf"
                  maxSize={5}
                />

                <p className="text-xs text-muted-foreground text-center">
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && !teamId && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Review & Submit
                  </h2>
                  <p className="text-muted-foreground">
                    Verify your information before submitting
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="glass-card rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Team Name</p>
                    <p className="font-medium text-foreground">{teamName}</p>
                  </div>

                  <div className="glass-card rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Organization</p>
                    <p className="font-medium text-foreground">{organization}</p>
                  </div>

                  <div className="glass-card rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-2">Team Members</p>
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">{member.name}</span>
                          <span className="text-muted-foreground">{member.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">ID Document</p>
                    <p className="font-medium text-foreground">{idFile?.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Screen */}
            {teamId && (
              <div className="text-center py-8 animate-scale-in">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  Registration Successful!
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Welcome to TeamHub!
                </h2>
                <p className="text-muted-foreground mb-8">
                  Your team has been registered successfully
                </p>

                <div className="glass-card rounded-2xl p-6 max-w-sm mx-auto mb-8">
                  <p className="text-sm text-muted-foreground mb-2">Your Unique Team ID</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-mono font-bold gradient-text">
                      {teamId}
                    </code>
                    <Button variant="ghost" size="icon" onClick={copyTeamId}>
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <Button variant="gradient" size="lg" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Navigation Buttons */}
            {!teamId && (
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep < 4 ? (
                  <Button variant="gradient" onClick={handleNext}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}