/**
 * Expanded Document Templates Library
 * 20+ templates for Panamanian legal documents
 */

export const documentTemplatesData = [
  // Labor & Employment
  {
    templateName: "Contrato de Trabajo",
    templateType: "labor_contract",
    description: "Contrato de trabajo según Ley 93 de Código de Trabajo de Panamá",
    category: "Laboral",
    templateContent: `CONTRATO DE TRABAJO

Entre {{employerName}}, cédula {{employerCedula}}, domiciliado en {{employerAddress}}, en lo sucesivo el EMPLEADOR, y {{employeeName}}, cédula {{employeeCedula}}, domiciliado en {{employeeAddress}}, en lo sucesivo el EMPLEADO.

ACUERDAN:

1. CARGO Y FUNCIONES
El EMPLEADO desempeñará el cargo de {{position}} con las siguientes funciones:
{{jobDescription}}

2. SALARIO
El EMPLEADOR pagará al EMPLEADO un salario mensual de B/. {{salary}} más {{benefits}}.

3. JORNADA DE TRABAJO
La jornada de trabajo será de {{workHours}} horas diarias, de {{startTime}} a {{endTime}}, con {{breakTime}} de descanso.

4. DURACIÓN
Este contrato tendrá una duración de {{duration}}, iniciando el {{startDate}}.

5. OBLIGACIONES DEL EMPLEADOR
- Pagar el salario en la forma y fecha acordada
- Proporcionar condiciones de trabajo seguras
- Cumplir con las obligaciones de seguro social

6. OBLIGACIONES DEL EMPLEADO
- Cumplir con sus funciones de manera diligente
- Respetar las normas de disciplina
- Guardar confidencialidad de información

7. TERMINACIÓN
El contrato puede ser terminado por:
- Mutuo acuerdo
- Causa justificada
- Vencimiento del plazo

Firmado en Panamá, a los {{date}} días del mes de {{month}} de {{year}}.

_____________________          _____________________
EMPLEADOR                       EMPLEADO`,
    requiredFields: JSON.stringify([
      "employerName",
      "employerCedula",
      "employerAddress",
      "employeeName",
      "employeeCedula",
      "employeeAddress",
      "position",
      "jobDescription",
      "salary",
      "workHours",
      "startTime",
      "endTime",
      "duration",
      "startDate",
      "date",
      "month",
      "year",
    ]),
    optionalFields: JSON.stringify(["benefits", "breakTime"]),
    language: "es",
  },

  {
    templateName: "Carta de Despido",
    templateType: "termination_letter",
    description: "Carta de terminación de contrato de trabajo",
    category: "Laboral",
    templateContent: `CARTA DE DESPIDO

{{employerCity}}, {{date}}

{{employeeName}}
{{employeeAddress}}

Estimado(a) {{employeeName}},

Por este medio le comunico que su contrato de trabajo como {{position}} en {{companyName}}, queda terminado a partir del {{terminationDate}}, por {{reason}}.

Según lo establecido en la Ley 93 de Código de Trabajo de Panamá, usted tiene derecho a:
- Liquidación de salarios pendientes
- Indemnización por despido injustificado (si aplica)
- Certificado de trabajo

Su liquidación será procesada dentro de {{paymentDays}} días hábiles.

Atentamente,

_____________________
{{employerName}}
{{employerPosition}}`,
    requiredFields: JSON.stringify([
      "employerCity",
      "date",
      "employeeName",
      "employeeAddress",
      "position",
      "companyName",
      "terminationDate",
      "reason",
      "employerName",
    ]),
    optionalFields: JSON.stringify(["paymentDays", "employerPosition"]),
    language: "es",
  },

  // Commercial & Contracts
  {
    templateName: "Contrato Comercial",
    templateType: "commercial_contract",
    description: "Contrato comercial general para transacciones",
    category: "Comercial",
    templateContent: `CONTRATO COMERCIAL

PARTES:
{{partyAName}}, cédula {{partyACedula}}, domiciliado en {{partyAAddress}} (VENDEDOR)
{{partyBName}}, cédula {{partyBCedula}}, domiciliado en {{partyBAddress}} (COMPRADOR)

OBJETO DEL CONTRATO:
{{productDescription}}

PRECIO Y CONDICIONES DE PAGO:
- Precio total: B/. {{totalPrice}}
- Forma de pago: {{paymentMethod}}
- Plazo de pago: {{paymentTerm}}

ENTREGA:
- Lugar de entrega: {{deliveryLocation}}
- Fecha de entrega: {{deliveryDate}}
- Responsable de transporte: {{transportResponsible}}

GARANTÍAS:
{{warranties}}

RESOLUCIÓN DE CONFLICTOS:
Las controversias serán resueltas según la ley panameña, en los tribunales de {{jurisdiction}}.

VIGENCIA:
Este contrato entra en vigor a partir de {{effectiveDate}} y vence el {{expirationDate}}.

Firmado en Panamá, {{date}}.

_____________________          _____________________
VENDEDOR                        COMPRADOR`,
    requiredFields: JSON.stringify([
      "partyAName",
      "partyACedula",
      "partyAAddress",
      "partyBName",
      "partyBCedula",
      "partyBAddress",
      "productDescription",
      "totalPrice",
      "paymentMethod",
      "paymentTerm",
      "deliveryLocation",
      "deliveryDate",
      "effectiveDate",
      "date",
    ]),
    optionalFields: JSON.stringify([
      "transportResponsible",
      "warranties",
      "jurisdiction",
      "expirationDate",
    ]),
    language: "es",
  },

  {
    templateName: "Acuerdo de Confidencialidad",
    templateType: "nda",
    description: "Acuerdo de no divulgación de información confidencial",
    category: "Comercial",
    templateContent: `ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN

ENTRE: {{disclosingParty}}, en lo sucesivo "DIVULGADOR"
Y: {{receivingParty}}, en lo sucesivo "RECEPTOR"

CONSIDERANDO:

Que el DIVULGADOR desea compartir información confidencial con el RECEPTOR, sujeto a los términos y condiciones de este Acuerdo.

SE ACUERDA:

1. INFORMACIÓN CONFIDENCIAL
Se considera información confidencial toda aquella relacionada con {{informationType}}, incluyendo pero no limitado a:
- Información técnica
- Datos comerciales
- Planes y estrategias
- Información financiera

2. OBLIGACIONES DEL RECEPTOR
El RECEPTOR se compromete a:
- Mantener la confidencialidad de la información
- No divulgar a terceros sin consentimiento escrito
- Usar la información solo para {{authorizedUse}}
- Proteger la información con medidas de seguridad razonables

3. EXCEPCIONES
No se considerará confidencial la información que:
- Sea de dominio público
- Sea recibida legítimamente de terceros
- Sea requerida por ley

4. DURACIÓN
Este acuerdo permanecerá vigente por {{duration}} años.

5. REMEDIOS
El incumplimiento de este acuerdo causará daño irreparable, justificando medidas cautelares.

Firmado en Panamá, {{date}}.

_____________________          _____________________
DIVULGADOR                      RECEPTOR`,
    requiredFields: JSON.stringify([
      "disclosingParty",
      "receivingParty",
      "informationType",
      "authorizedUse",
      "duration",
      "date",
    ]),
    optionalFields: JSON.stringify([]),
    language: "es",
  },

  // Legal Documents
  {
    templateName: "Poder Notarial",
    templateType: "notarial_power",
    description: "Poder notarial para representación legal",
    category: "Legal",
    templateContent: `PODER NOTARIAL

Yo, {{granterName}}, cédula {{granterCedula}}, domiciliado en {{granterAddress}}, por este medio otorgo PODER ESPECIAL a {{attorneyName}}, cédula {{attorneyCedula}}, domiciliado en {{attorneyAddress}}, para que en mi nombre y representación pueda:

{{powerScope}}

Este poder incluye la facultad de:
- Representarme ante autoridades
- Firmar documentos
- Realizar transacciones
- Delegar poderes

LIMITACIONES:
{{limitations}}

VIGENCIA:
Este poder entra en vigor a partir de {{effectiveDate}} y vence el {{expirationDate}}.

REVOCACIÓN:
Puedo revocar este poder en cualquier momento mediante notificación escrita.

Otorgado en Panamá, ante {{notaryName}}, Notario Público, el {{date}}.

_____________________
OTORGANTE

_____________________
APODERADO

_____________________
NOTARIO PÚBLICO`,
    requiredFields: JSON.stringify([
      "granterName",
      "granterCedula",
      "granterAddress",
      "attorneyName",
      "attorneyCedula",
      "attorneyAddress",
      "powerScope",
      "effectiveDate",
      "date",
      "notaryName",
    ]),
    optionalFields: JSON.stringify(["limitations", "expirationDate"]),
    language: "es",
  },

  {
    templateName: "Demanda Civil",
    templateType: "demand_letter",
    description: "Demanda para procedimiento civil",
    category: "Litigios",
    templateContent: `DEMANDA CIVIL

AL JUZGADO {{courtName}}

{{plaintiffName}}, cédula {{plaintiffCedula}}, domiciliado en {{plaintiffAddress}}, por este medio demanda a {{defendantName}}, cédula {{defendantCedula}}, domiciliado en {{defendantAddress}}, por {{claimType}}.

HECHOS:
{{facts}}

FUNDAMENTOS DE DERECHO:
{{legalBasis}}

PETITORIO:
Se solicita al Juzgado:
1. {{relief1}}
2. {{relief2}}
3. {{relief3}}

PRUEBAS:
{{evidence}}

MONTO DEMANDADO: B/. {{amount}}

Panamá, {{date}}.

_____________________
DEMANDANTE

_____________________
ABOGADO DEL DEMANDANTE`,
    requiredFields: JSON.stringify([
      "courtName",
      "plaintiffName",
      "plaintiffCedula",
      "plaintiffAddress",
      "defendantName",
      "defendantCedula",
      "defendantAddress",
      "claimType",
      "facts",
      "legalBasis",
      "relief1",
      "amount",
      "date",
    ]),
    optionalFields: JSON.stringify(["relief2", "relief3", "evidence"]),
    language: "es",
  },

  // Family Law
  {
    templateName: "Petición de Divorcio",
    templateType: "divorce_petition",
    description: "Petición de divorcio por mutuo consentimiento",
    category: "Familia",
    templateContent: `PETICIÓN DE DIVORCIO POR MUTUO CONSENTIMIENTO

AL JUZGADO {{courtName}}

{{spouse1Name}}, cédula {{spouse1Cedula}}, y {{spouse2Name}}, cédula {{spouse2Cedula}}, ambos mayores de edad, por este medio solicitan al Juzgado:

ANTECEDENTES:
- Matrimonio celebrado el {{marriageDate}} ante {{registryOffice}}
- Partida de matrimonio número {{marriageNumber}}
- Domicilio conyugal: {{maritalAddress}}

ACUERDO DE DIVORCIO:
Las partes acuerdan:

1. DISOLUCIÓN DEL VÍNCULO MATRIMONIAL
Se disuelve el matrimonio por mutuo consentimiento.

2. BIENES GANANCIALES
{{propertyDivision}}

3. PENSIÓN ALIMENTICIA
{{childSupport}}

4. CUSTODIA DE HIJOS
{{custody}}

5. RÉGIMEN DE VISITAS
{{visitationSchedule}}

PETITORIO:
Se solicita se declare disuelto el vínculo matrimonial entre las partes.

Panamá, {{date}}.

_____________________          _____________________
CÓNYUGE 1                       CÓNYUGE 2`,
    requiredFields: JSON.stringify([
      "courtName",
      "spouse1Name",
      "spouse1Cedula",
      "spouse2Name",
      "spouse2Cedula",
      "marriageDate",
      "registryOffice",
      "marriageNumber",
      "maritalAddress",
      "date",
    ]),
    optionalFields: JSON.stringify([
      "propertyDivision",
      "childSupport",
      "custody",
      "visitationSchedule",
    ]),
    language: "es",
  },

  // Corporate
  {
    templateName: "Acta Constitutiva de Sociedad",
    templateType: "corporate_bylaws",
    description: "Acta de constitución de sociedad mercantil",
    category: "Corporativo",
    templateContent: `ACTA CONSTITUTIVA DE SOCIEDAD

En Panamá, a los {{date}} días del mes de {{month}} de {{year}}, ante mí, {{notaryName}}, Notario Público, comparecen:

{{shareholders}}

ACUERDAN CONSTITUIR UNA SOCIEDAD MERCANTIL bajo las siguientes cláusulas:

PRIMERA: DENOMINACIÓN SOCIAL
La sociedad se denominará {{companyName}}, {{companyType}}.

SEGUNDA: OBJETO SOCIAL
La sociedad tendrá por objeto:
{{businessPurpose}}

TERCERA: DOMICILIO
El domicilio de la sociedad será {{companyAddress}}.

CUARTA: CAPITAL SOCIAL
El capital social es de B/. {{capitalAmount}}, dividido en {{sharesNumber}} acciones de B/. {{shareValue}} cada una.

QUINTA: ADMINISTRACIÓN
La administración de la sociedad estará a cargo de {{managementStructure}}.

SEXTA: JUNTA DIRECTIVA
{{boardStructure}}

SÉPTIMA: DISTRIBUCIÓN DE GANANCIAS
{{profitDistribution}}

Otorgado en Panamá ante {{notaryName}}, Notario Público.

_____________________
NOTARIO PÚBLICO`,
    requiredFields: JSON.stringify([
      "date",
      "month",
      "year",
      "notaryName",
      "shareholders",
      "companyName",
      "companyType",
      "businessPurpose",
      "companyAddress",
      "capitalAmount",
      "sharesNumber",
      "shareValue",
    ]),
    optionalFields: JSON.stringify([
      "managementStructure",
      "boardStructure",
      "profitDistribution",
    ]),
    language: "es",
  },

  // Real Estate
  {
    templateName: "Contrato de Compraventa de Inmueble",
    templateType: "purchase_agreement",
    description: "Contrato para compra y venta de propiedad inmueble",
    category: "Inmobiliario",
    templateContent: `CONTRATO DE COMPRAVENTA DE INMUEBLE

PARTES:
{{sellerName}}, cédula {{sellerCedula}} (VENDEDOR)
{{buyerName}}, cédula {{buyerCedula}} (COMPRADOR)

DESCRIPCIÓN DEL INMUEBLE:
- Ubicación: {{propertyAddress}}
- Lote: {{lotNumber}}
- Área: {{propertyArea}} metros cuadrados
- Folio: {{folioNumber}}
- Registro: {{registryNumber}}

PRECIO Y CONDICIONES:
- Precio de venta: B/. {{salePrice}}
- Forma de pago: {{paymentMethod}}
- Plazo de pago: {{paymentTerm}}

CONDICIONES:
1. El inmueble se vende libre de gravámenes
2. El VENDEDOR garantiza la propiedad
3. Los gastos de registro corren por cuenta del COMPRADOR
4. Se entregan todos los documentos de propiedad

PLAZO DE ENTREGA:
El inmueble será entregado el {{deliveryDate}} en condiciones de {{condition}}.

RESOLUCIÓN DE CONFLICTOS:
En caso de incumplimiento, se aplicarán las leyes panameñas.

Firmado en Panamá, {{date}}.

_____________________          _____________________
VENDEDOR                        COMPRADOR`,
    requiredFields: JSON.stringify([
      "sellerName",
      "sellerCedula",
      "buyerName",
      "buyerCedula",
      "propertyAddress",
      "lotNumber",
      "propertyArea",
      "folioNumber",
      "registryNumber",
      "salePrice",
      "paymentMethod",
      "paymentTerm",
      "deliveryDate",
      "date",
    ]),
    optionalFields: JSON.stringify(["condition"]),
    language: "es",
  },

  {
    templateName: "Contrato de Arrendamiento",
    templateType: "lease_agreement",
    description: "Contrato de alquiler de propiedad",
    category: "Inmobiliario",
    templateContent: `CONTRATO DE ARRENDAMIENTO

PARTES:
{{landlordName}}, cédula {{landlordCedula}} (ARRENDADOR)
{{tenantName}}, cédula {{tenantCedula}} (ARRENDATARIO)

PROPIEDAD ARRENDADA:
- Ubicación: {{propertyAddress}}
- Tipo: {{propertyType}}
- Área: {{propertyArea}} metros cuadrados

RENTA Y CONDICIONES:
- Renta mensual: B/. {{monthlyRent}}
- Depósito de garantía: B/. {{securityDeposit}}
- Fecha de pago: {{paymentDate}}
- Forma de pago: {{paymentMethod}}

DURACIÓN:
- Inicio: {{startDate}}
- Vencimiento: {{endDate}}
- Plazo: {{leaseTerm}}

OBLIGACIONES DEL ARRENDATARIO:
- Pagar la renta puntualmente
- Mantener la propiedad en buen estado
- No subarrendar sin autorización
- Pagar servicios (agua, luz, gas)

OBLIGACIONES DEL ARRENDADOR:
- Mantener la propiedad habitable
- Realizar reparaciones necesarias
- Respetar la privacidad del arrendatario

TERMINACIÓN:
- Preaviso: {{noticeRequired}} días
- Devolución de depósito: {{depositReturn}} días después de desocupar

Firmado en Panamá, {{date}}.

_____________________          _____________________
ARRENDADOR                      ARRENDATARIO`,
    requiredFields: JSON.stringify([
      "landlordName",
      "landlordCedula",
      "tenantName",
      "tenantCedula",
      "propertyAddress",
      "propertyType",
      "propertyArea",
      "monthlyRent",
      "securityDeposit",
      "paymentDate",
      "paymentMethod",
      "startDate",
      "endDate",
      "leaseTerm",
      "date",
    ]),
    optionalFields: JSON.stringify(["noticeRequired", "depositReturn"]),
    language: "es",
  },

  // Financial
  {
    templateName: "Pagaré",
    templateType: "promissory_note",
    description: "Pagaré para obligación de pago",
    category: "Financiero",
    templateContent: `PAGARÉ

Por este medio, yo {{debtorName}}, cédula {{debtorCedula}}, domiciliado en {{debtorAddress}}, reconozco deber y me obligo a pagar a {{creditorName}}, cédula {{creditorCedula}}, la cantidad de B/. {{amount}} ({{amountInWords}}).

CONDICIONES DE PAGO:
- Vencimiento: {{dueDate}}
- Lugar de pago: {{paymentLocation}}
- Forma de pago: {{paymentMethod}}

TASA DE INTERÉS:
{{interestRate}}% anual a partir del {{interestStartDate}}.

CONCEPTO:
{{concept}}

En caso de incumplimiento, el acreedor podrá ejercer todas las acciones legales que correspondan.

Firmado en Panamá, {{date}}.

_____________________
DEUDOR

_____________________
TESTIGO 1

_____________________
TESTIGO 2`,
    requiredFields: JSON.stringify([
      "debtorName",
      "debtorCedula",
      "debtorAddress",
      "creditorName",
      "creditorCedula",
      "amount",
      "amountInWords",
      "dueDate",
      "paymentLocation",
      "paymentMethod",
      "concept",
      "date",
    ]),
    optionalFields: JSON.stringify(["interestRate", "interestStartDate"]),
    language: "es",
  },

  {
    templateName: "Contrato de Préstamo",
    templateType: "loan_agreement",
    description: "Contrato de préstamo de dinero",
    category: "Financiero",
    templateContent: `CONTRATO DE PRÉSTAMO

PARTES:
{{lenderName}}, cédula {{lenderCedula}} (PRESTAMISTA)
{{borrowerName}}, cédula {{borrowerCedula}} (PRESTATARIO)

OBJETO:
El PRESTAMISTA otorga en préstamo al PRESTATARIO la cantidad de B/. {{loanAmount}} ({{amountInWords}}).

CONDICIONES:
- Fecha de desembolso: {{disbursementDate}}
- Plazo de reembolso: {{repaymentTerm}} meses
- Tasa de interés: {{interestRate}}% anual
- Cuota mensual: B/. {{monthlyPayment}}

FORMA DE PAGO:
Las cuotas se pagarán {{paymentFrequency}} a partir de {{firstPaymentDate}}, en {{paymentLocation}}.

GARANTÍA:
{{securityType}}

INCUMPLIMIENTO:
En caso de mora mayor a {{gracePeriod}} días, se aplicará una tasa de interés moratorio de {{lateInterestRate}}%.

PREPAGO:
El PRESTATARIO puede prepagar sin penalidad.

OBLIGACIONES:
- El PRESTATARIO mantendrá {{insurance}} seguro
- Notificará cambios de domicilio
- Cumplirá con las obligaciones tributarias

Firmado en Panamá, {{date}}.

_____________________          _____________________
PRESTAMISTA                     PRESTATARIO`,
    requiredFields: JSON.stringify([
      "lenderName",
      "lenderCedula",
      "borrowerName",
      "borrowerCedula",
      "loanAmount",
      "amountInWords",
      "disbursementDate",
      "repaymentTerm",
      "interestRate",
      "monthlyPayment",
      "paymentFrequency",
      "firstPaymentDate",
      "paymentLocation",
      "date",
    ]),
    optionalFields: JSON.stringify([
      "securityType",
      "gracePeriod",
      "lateInterestRate",
      "insurance",
    ]),
    language: "es",
  },
];

export default documentTemplatesData;
