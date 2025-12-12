import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileCheck, Download, Trash2, Upload, File, Image, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface Document {
  _id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadDate: string;
  url?: string;
}

interface ViewDocumentsDialogProps {
  teamId: string;
  isLeader?: boolean;
}

export default function ViewDocumentsDialog({ teamId, isLeader = false }: ViewDocumentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/teams/${teamId}/documents`);
      setDocuments(data);
    } catch (error: any) {
      toast({
        title: "Failed to load documents",
        description: error.response?.data?.message || "Could not load team documents.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDocuments();
    }
  }, [open, teamId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await api.get(`/teams/${teamId}/documents/${doc._id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading ${doc.originalName}`,
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.response?.data?.message || "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (!isLeader) {
      toast({
        title: "Permission Denied",
        description: "Only team leaders can delete documents.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.delete(`/teams/${teamId}/documents/${docId}`);
      setDocuments(documents.filter(doc => doc._id !== docId));
      toast({
        title: "Document Deleted",
        description: `${filename} has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isLeader) {
      toast({
        title: "Permission Denied",
        description: "Only team leaders can upload documents.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);

      const { data } = await api.post(`/teams/${teamId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDocuments([...documents, data]);
      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload document.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-auto py-4 justify-start">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mr-4">
            <FileCheck className="w-5 h-5 text-accent" />
          </div>
          <div className="text-left">
            <p className="font-medium">View Documents</p>
            <p className="text-xs text-muted-foreground">Manage uploaded files</p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Team Documents
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Upload Section - Only for leaders */}
          {isLeader && (
            <div className="border border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-2">Upload New Document</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload team documents like ID verification, certificates, etc.
              </p>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
                <Button disabled={uploading} variant="outline">
                  {uploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supported: PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB)
              </p>
            </div>
          )}

          {/* Documents List */}
          <div className="space-y-4">
            <h3 className="font-medium">Uploaded Documents ({documents.length})</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-muted-foreground mb-2">No Documents Found</h3>
                <p className="text-sm text-muted-foreground">
                  {isLeader ? "Upload your first document to get started." : "No documents have been uploaded yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc._id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50">
                    {getFileIcon(doc.mimetype)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.originalName}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {isLeader && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc._id, doc.originalName)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Document Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload team verification documents and certificates</li>
              <li>• Only team leaders can upload and delete documents</li>
              <li>• All team members can view and download documents</li>
              <li>• Keep document names descriptive and professional</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}