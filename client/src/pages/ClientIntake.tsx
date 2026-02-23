import { useState } from "react";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Cédula validation regex for Panama (format: 8-9-4)
const cedulaRegex = /^\d{1,4}-\d{1,4}-\d{1,4}$/;

const clientIntakeSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  cedula: z.string().regex(cedulaRegex, "Invalid Panamanian cédula format (e.g., 8-123-456)"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  
  // Address Information
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  zipCode: z.string().optional(),
  
  // Legal Matter Information
  matterType: z.string().min(1, "Matter type is required"),
  matterDescription: z.string().min(10, "Please provide a detailed description"),
  opposingParty: z.string().optional(),
  
  // Financial Information
  estimatedBudget: z.string().optional(),
  
  // Consent and Agreements
  privacyConsent: z.boolean().refine((val) => val === true, "You must consent to privacy policy"),
  retainerConsent: z.boolean().refine((val) => val === true, "You must agree to retainer terms"),
});

type ClientIntakeFormData = z.infer<typeof clientIntakeSchema>;

const matterTypes = [
  "Corporate Law",
  "Family Law",
  "Criminal Law",
  "Real Estate",
  "Intellectual Property",
  "Labor Law",
  "Contract Disputes",
  "Immigration",
  "Tax Law",
  "Other",
];

const panamaProvinces = [
  "Bocas del Toro",
  "Coclé",
  "Colón",
  "Darién",
  "Herrera",
  "Los Santos",
  "Panamá",
  "Panamá Oeste",
  "Veraguas",
];

export default function ClientIntake() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cedulaValidationStatus, setCedulaValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientIntakeFormData>({
    resolver: zodResolver(clientIntakeSchema),
    mode: "onChange",
  });

  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Client intake form submitted successfully!");
      reset();
      setCurrentStep(1);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit intake form");
    },
  });

  const cedulaValue = watch("cedula");

  const validateCedula = async () => {
    if (!cedulaRegex.test(cedulaValue)) {
      setCedulaValidationStatus("invalid");
      return;
    }
    
    // Simulate API validation
    setCedulaValidationStatus("valid");
    toast.success("Cédula validated successfully");
  };

  const onSubmit = async (data: ClientIntakeFormData) => {
    const budgetInCents = data.estimatedBudget
      ? Math.round(parseFloat(data.estimatedBudget) * 100)
      : undefined;

    await createClientMutation.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      cedula: data.cedula,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
    });
  };

  const isStep1Complete = watch("firstName") && watch("lastName") && watch("cedula") && watch("email") && watch("phone");
  const isStep2Complete = watch("address") && watch("city") && watch("province");
  const isStep3Complete = watch("matterType") && watch("matterDescription");

  return (
    <LegalDashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Intake Form</h1>
          <p className="mt-1 text-muted-foreground">
            Complete this form to register as a new client. All information is confidential and protected under Ley 81 (2019).
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                  step < currentStep
                    ? "border-green-600 bg-green-600 text-white"
                    : step === currentStep
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-600 dark:border-gray-600 dark:bg-gray-900"
                }`}
              >
                {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 w-12 ${
                    step < currentStep ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={`step-${currentStep}`} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="step-1" disabled={currentStep < 1}>
                Personal
              </TabsTrigger>
              <TabsTrigger value="step-2" disabled={currentStep < 2}>
                Address
              </TabsTrigger>
              <TabsTrigger value="step-3" disabled={currentStep < 3}>
                Matter
              </TabsTrigger>
              <TabsTrigger value="step-4" disabled={currentStep < 4}>
                Consent
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Personal Information */}
            <TabsContent value="step-1">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Provide your basic personal details and Panamanian cédula.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        {...register("firstName")}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && (
                        <span className="text-sm text-red-600">{errors.firstName.message}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Pérez"
                        {...register("lastName")}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && (
                        <span className="text-sm text-red-600">{errors.lastName.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cedula">Panamanian Cédula *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cedula"
                        placeholder="8-123-456"
                        {...register("cedula")}
                        className={errors.cedula ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={validateCedula}
                        disabled={!cedulaValue}
                      >
                        Validate
                      </Button>
                    </div>
                    {cedulaValidationStatus === "valid" && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Cédula validated</span>
                      </div>
                    )}
                    {cedulaValidationStatus === "invalid" && (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Invalid cédula format</span>
                      </div>
                    )}
                    {errors.cedula && (
                      <span className="text-sm text-red-600">{errors.cedula.message}</span>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@example.com"
                        {...register("email")}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <span className="text-sm text-red-600">{errors.email.message}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+507 6123-4567"
                        {...register("phone")}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <span className="text-sm text-red-600">{errors.phone.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => isStep1Complete && setCurrentStep(2)}
                      disabled={!isStep1Complete}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Address Information */}
            <TabsContent value="step-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>
                    Provide your residential address in Panama.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="Calle 50, Edificio..."
                      {...register("address")}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && (
                      <span className="text-sm text-red-600">{errors.address.message}</span>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Panama City"
                        {...register("city")}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && (
                        <span className="text-sm text-red-600">{errors.city.message}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="province">Province *</Label>
                      <select
                        id="province"
                        {...register("province")}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          errors.province ? "border-red-500" : ""
                        }`}
                      >
                        <option value="">Select province</option>
                        {panamaProvinces.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                      {errors.province && (
                        <span className="text-sm text-red-600">{errors.province.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
                    <Input
                      id="zipCode"
                      placeholder="00000"
                      {...register("zipCode")}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => isStep2Complete && setCurrentStep(3)}
                      disabled={!isStep2Complete}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 3: Legal Matter Information */}
            <TabsContent value="step-3">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Legal Matter Information</CardTitle>
                  <CardDescription>
                    Describe the legal matter you need assistance with.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="matterType">Type of Legal Matter *</Label>
                    <select
                      id="matterType"
                      {...register("matterType")}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        errors.matterType ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select matter type</option>
                      {matterTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.matterType && (
                      <span className="text-sm text-red-600">{errors.matterType.message}</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="matterDescription">Description of Matter *</Label>
                    <textarea
                      id="matterDescription"
                      placeholder="Please provide a detailed description of your legal matter..."
                      {...register("matterDescription")}
                      className={`flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        errors.matterDescription ? "border-red-500" : ""
                      }`}
                    />
                    {errors.matterDescription && (
                      <span className="text-sm text-red-600">{errors.matterDescription.message}</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="opposingParty">Opposing Party (if applicable)</Label>
                    <Input
                      id="opposingParty"
                      placeholder="Name of opposing party..."
                      {...register("opposingParty")}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="estimatedBudget">Estimated Budget (B/.) (Optional)</Label>
                    <Input
                      id="estimatedBudget"
                      type="number"
                      step="0.01"
                      placeholder="5000.00"
                      {...register("estimatedBudget")}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => isStep3Complete && setCurrentStep(4)}
                      disabled={!isStep3Complete}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 4: Consent and Agreements */}
            <TabsContent value="step-4">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Consent and Agreements</CardTitle>
                  <CardDescription>
                    Please review and consent to the following terms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 rounded-lg border border-border/50 p-4">
                    <h3 className="font-semibold text-foreground">Privacy Policy (Ley 81, 2019)</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      I acknowledge that my personal information will be processed and stored in accordance with Panama's Law 81 of 2019 on Personal Data Protection. I understand that my information will be kept confidential and used solely for the purpose of providing legal services. I have the right to access, correct, or delete my personal information at any time.
                    </p>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="privacyConsent"
                        {...register("privacyConsent")}
                      />
                      <Label htmlFor="privacyConsent" className="cursor-pointer">
                        I consent to the privacy policy and data protection terms
                      </Label>
                    </div>
                    {errors.privacyConsent && (
                      <span className="text-sm text-red-600">{errors.privacyConsent.message}</span>
                    )}
                  </div>

                  <div className="space-y-4 rounded-lg border border-border/50 p-4">
                    <h3 className="font-semibold text-foreground">Retainer Agreement</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      I agree to retain the law firm to provide legal services. I understand that fees will be charged based on the agreed hourly rate or fixed fee. I will be provided with regular billing statements and invoices. I acknowledge that I have received information about the firm's fee structure and billing practices.
                    </p>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="retainerConsent"
                        {...register("retainerConsent")}
                      />
                      <Label htmlFor="retainerConsent" className="cursor-pointer">
                        I agree to the retainer agreement and fee terms
                      </Label>
                    </div>
                    {errors.retainerConsent && (
                      <span className="text-sm text-red-600">{errors.retainerConsent.message}</span>
                    )}
                  </div>

                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                    <div className="flex gap-3">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <p className="font-semibold mb-1">Confidentiality Notice</p>
                        <p>
                          All information provided in this intake form is confidential and protected by attorney-client privilege. This information will not be shared with third parties without your explicit consent, except as required by law.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || createClientMutation.isPending}
                    >
                      {isSubmitting || createClientMutation.isPending
                        ? "Submitting..."
                        : "Submit Intake Form"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </LegalDashboardLayout>
  );
}
