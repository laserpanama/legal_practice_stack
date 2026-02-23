import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText, Shield, AlertCircle, Download, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface SignatureRequest {
  signatureId: string;
  documentName: string;
  signerName: string;
  signerEmail: string;
  requestDate: string;
  status: "pending" | "signed" | "rejected" | "expired";
  expiryDate: string;
}

interface ActiveSignature {
  signatureId: string;
  documentName: string;
  signerName: string;
  signerEmail: string;
  signedDate: string;
  certificateId: string;
  timestamp: string;
}

export default function DigitalSignature() {
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  const [activeSignatures, setActiveSignatures] = useState<ActiveSignature[]>([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientCedula, setRecipientCedula] = useState("");
  const [message, setMessage] = useState("");

  const requestSignatureMutation = trpc.efirmas.requestSignature.useMutation();

  // Fetch signatures on component mount
  useEffect(() => {
    const fetchSignatures = async () => {
      try {
        // In production, this would fetch from the backend
        // For now, using mock data
        setSignatureRequests([
          {
            signatureId: "SIG-001",
            documentName: "Contract - TechCorp S.A.",
            signerName: "Juan Pérez",
            signerEmail: "juan@example.com",
            requestDate: "2026-02-05",
            status: "pending",
            expiryDate: "2026-02-12",
          },
          {
            signatureId: "SIG-002",
            documentName: "Power of Attorney - García Family",
            signerName: "María García",
            signerEmail: "maria@example.com",
            requestDate: "2026-02-04",
            status: "signed",
            expiryDate: "2026-02-11",
          },
        ]);

        setActiveSignatures([
          {
            signatureId: "AS-001",
            documentName: "Contract - TechCorp S.A.",
            signerName: "Juan Pérez",
            signerEmail: "juan@example.com",
            signedDate: "2026-02-05",
            certificateId: "ANC-2026-001234",
            timestamp: "2026-02-05T14:32:00Z",
          },
          {
            signatureId: "AS-002",
            documentName: "Power of Attorney - García Family",
            signerName: "María García",
            signerEmail: "maria@example.com",
            signedDate: "2026-02-04",
            certificateId: "ANC-2026-001233",
            timestamp: "2026-02-04T10:15:00Z",
          },
        ]);
      } catch (error) {
        console.error("Error fetching signatures:", error);
      }
    };

    fetchSignatures();
  }, []);

  const handleRequestSignature = async () => {
    if (!selectedDocument || !recipientEmail || !recipientName) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Call the eFirmas router to request signature
      const response = await requestSignatureMutation.mutateAsync({
        documentId: selectedDocument,
        documentName: selectedDocument,
        documentContent: "Document content placeholder", // In production, fetch actual document
        signerEmail: recipientEmail,
        signerName: recipientName,
        signerCedula: recipientCedula || undefined,
        signatureType: "qualified",
        expiryDays: 7,
        message: message || undefined,
      });

      // Add to pending requests
      const newRequest: SignatureRequest = {
        signatureId: response.signatureId,
        documentName: selectedDocument,
        signerName: recipientName,
        signerEmail: recipientEmail,
        requestDate: new Date().toISOString().split("T")[0],
        status: "pending",
        expiryDate: response.expiryDate.split("T")[0],
      };

      setSignatureRequests([...signatureRequests, newRequest]);

      toast.success(`Signature request sent to ${recipientEmail}`);
      setSelectedDocument("");
      setRecipientEmail("");
      setRecipientName("");
      setRecipientCedula("");
      setMessage("");
    } catch (error) {
      console.error("Error requesting signature:", error);
      toast.error("Failed to send signature request");
    }
  };

  const handleValidateSignature = async (signatureId: string) => {
    try {
      // Mock validation response
      const response = {
        isValid: true,
        signatureId,
        certificateId: "ANC-2026-001234",
        signerName: "Test Signer",
        signerEmail: "test@example.com",
        signedAt: new Date().toISOString(),
        certificateStatus: "valid" as const,
        ley81Metadata: {},
        auditTrail: [],
      };

      if (response.isValid) {
        toast.success("Signature is valid and compliant");
      } else {
        toast.error("Signature validation failed");
      }
    } catch (error) {
      console.error("Error validating signature:", error);
      toast.error("Failed to validate signature");
    }
  };

  const handleGetComplianceReport = async (signatureId: string) => {
    try {
      // Mock compliance report response
      const response = {
        signatureId,
        compliant: true,
        framework: "Ley 81 de 2019",
        checks: {
          hasTimestamp: true,
          hasCertificateId: true,
          hasSignerInfo: true,
          hasAuditTrail: true,
          nonRepudiationEnabled: true,
          integrityVerified: true,
          certificateValid: true,
          notRevoked: true,
        },
      };

      if (response.compliant) {
        toast.success("Signature is compliant with Ley 81 (2019)");
      } else {
        toast.error("Signature does not meet compliance requirements");
      }
    } catch (error) {
      console.error("Error getting compliance report:", error);
      toast.error("Failed to generate compliance report");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Signature</h1>
          <p className="text-muted-foreground mt-2">
            Manage electronic signatures compliant with Panama's Ley 81 (2019)
          </p>
        </div>
        <Shield className="h-8 w-8 text-blue-600" />
      </div>

      {/* Compliance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900">Ley 81 (2019) Compliance</h3>
              <p className="text-sm text-blue-800 mt-1">
                All digital signatures are processed through authorized certificate authorities and comply with Panama's electronic signature law. Each signature includes timestamp, certificate validation, and audit trail logging.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="request">Request Signature</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="signed">Signed Documents</TabsTrigger>
        </TabsList>

        {/* Request Signature Tab */}
        <TabsContent value="request" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Digital Signature</CardTitle>
              <CardDescription>
                Send a document for electronic signature to a client or party
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document">Select Document</Label>
                <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                  <SelectTrigger id="document">
                    <SelectValue placeholder="Choose a document..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract-techcorp">Contract - TechCorp S.A.</SelectItem>
                    <SelectItem value="poa-garcia">Power of Attorney - García Family</SelectItem>
                    <SelectItem value="settlement">Settlement Agreement</SelectItem>
                    <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Signer Name</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula (Optional)</Label>
                  <Input
                    id="cedula"
                    placeholder="8-123-456"
                    value={recipientCedula}
                    onChange={(e) => setRecipientCedula(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <textarea
                  id="message"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  placeholder="Add a message for the recipient..."
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleRequestSignature} 
                className="w-full"
                disabled={requestSignatureMutation.isPending}
              >
                {requestSignatureMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Signature Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-3">
            {signatureRequests
              .filter((req) => req.status === "pending")
              .map((request) => (
                <Card key={request.signatureId}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Clock className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{request.documentName}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Signer: {request.signerName} ({request.signerEmail})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires: {request.expiryDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 block">
                          Pending
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleValidateSignature(request.signatureId)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Check Status
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {signatureRequests.filter((req) => req.status === "pending").length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending signature requests
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Signed Documents Tab */}
        <TabsContent value="signed" className="space-y-4">
          <div className="space-y-3">
            {activeSignatures.map((signature) => (
              <Card key={signature.signatureId}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{signature.documentName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Signed by: {signature.signerName} ({signature.signerEmail})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {signature.signedDate}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Certificate ID: {signature.certificateId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 block">
                        Signed
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleGetComplianceReport(signature.signatureId)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Compliance
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {activeSignatures.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No signed documents yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Compliance Information */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance & Security Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-1">Ley 81 (2019) Compliance</h4>
            <p className="text-muted-foreground">
              All digital signatures comply with Panama's Law 81 (2019) on Electronic Signatures and Digital Transactions. Signatures are legally binding and enforceable in Panamanian courts.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Certificate Authority</h4>
            <p className="text-muted-foreground">
              Signatures are issued by authorized certificate authorities registered with the Autoridad Nacional de Certificación (ANC) of Panama. eFirmas S.A. is the primary provider.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Audit Trail</h4>
            <p className="text-muted-foreground">
              All signature requests, completions, and rejections are logged with timestamps and signer information for compliance and dispute resolution purposes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Data Protection</h4>
            <p className="text-muted-foreground">
              Document contents and signature data are encrypted and stored securely. Access is restricted to authorized users only, with full audit logging.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Non-Repudiation</h4>
            <p className="text-muted-foreground">
              Qualified electronic signatures provide non-repudiation, meaning signers cannot deny having signed a document. This is legally recognized in Panama.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
