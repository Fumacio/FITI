/**
 * Glosario médico EN ⇄ ES integrado.
 *
 * Formato de cada línea:  SIGLA | inglés; variante | español; variante
 * - La sigla es opcional (deje la primera columna vacía).
 * - La primera forma de cada idioma es la preferida; las demás también se
 *   reconocen en la transcripción.
 * - `# Nombre` inicia una categoría.
 *
 * Son términos médicos de uso general. Las empresas pueden añadir los suyos en
 * `public/glossary.local.json` (excluido de git).
 */
export const BUILTIN_GLOSSARY = `
# Siglas
ADD | attention deficit disorder | trastorno por déficit de atención
ADHD | attention deficit hyperactivity disorder | trastorno por déficit de atención e hiperactividad; TDAH
AIDS | acquired immunodeficiency syndrome; acquired immune deficiency syndrome | síndrome de inmunodeficiencia adquirida; SIDA
BM | bowel movement | evacuación; defecación
BMI | body mass index | índice de masa corporal; IMC
BMP | basic metabolic panel | panel metabólico básico
BP | blood pressure | presión arterial; tensión arterial
CPR | cardiopulmonary resuscitation | reanimación cardiopulmonar; RCP
CBC | complete blood count | hemograma completo; conteo sanguíneo completo
COPD | chronic obstructive pulmonary disease | enfermedad pulmonar obstructiva crónica; EPOC
CT | CT scan; CAT scan | tomografía computarizada; tomografía
CVA | cerebrovascular accident | accidente cerebrovascular; derrame cerebral
D&C | dilation and curettage | dilatación y legrado
DNR | do not resuscitate | orden de no reanimar
DNA | deoxyribonucleic acid | ácido desoxirribonucleico; ADN
DM | diabetes mellitus | diabetes mellitus
DPT | diphtheria pertussis tetanus | difteria, tos ferina y tétanos
DTP | diphtheria tetanus pertussis | difteria, tétanos y tos ferina
DVT | deep vein thrombosis; deep venous thrombosis | trombosis venosa profunda
EEG | electroencephalogram | electroencefalograma
EKG | electrocardiogram | electrocardiograma
ECG | electrocardiogram | electrocardiograma
EMG | electromyogram | electromiografía
EMS | emergency medical services | servicios médicos de emergencia
ENT | ear nose and throat | otorrinolaringología; otorrino
ER | emergency room | sala de emergencias; urgencias
ED | emergency department | departamento de emergencias; urgencias
G-tube | gastric tube; feeding tube | sonda gástrica; sonda de alimentación
GERD | gastroesophageal reflux disease | enfermedad por reflujo gastroesofágico; reflujo
GI | gastrointestinal | gastrointestinal
HIV | human immunodeficiency virus | virus de inmunodeficiencia humana; VIH
HPV | human papillomavirus | virus del papiloma humano; VPH
HTN | hypertension | hipertensión
IBS | irritable bowel syndrome | síndrome del intestino irritable
IBD | inflammatory bowel disease | enfermedad inflamatoria intestinal
ICU | intensive care unit | unidad de cuidados intensivos; UCI; terapia intensiva
IUD | intrauterine device | dispositivo intrauterino; DIU
IV | intravenous | intravenoso; por la vena; suero
IM | intramuscular | intramuscular
L&D | labor and delivery | trabajo de parto y parto; sala de partos
MG | milligram; milligrams | miligramo; miligramos
ML | milliliter; milliliters | mililitro; mililitros
MRI | magnetic resonance imaging | resonancia magnética
MS | multiple sclerosis | esclerosis múltiple
NICU | neonatal intensive care unit | unidad de cuidados intensivos neonatales
NPO | nothing by mouth | nada por vía oral; en ayunas
OCD | obsessive compulsive disorder | trastorno obsesivo compulsivo
OR | operating room | quirófano; sala de operaciones
OT | occupational therapy | terapia ocupacional
OTC | over the counter | de venta libre; sin receta
PACU | post anesthesia care unit; recovery room | sala de recuperación postanestésica
PCP | primary care physician; primary care provider | médico de cabecera; médico de atención primaria
PMS | premenstrual syndrome | síndrome premenstrual
PT | physical therapy | fisioterapia; terapia física
PTSD | post-traumatic stress disorder | trastorno de estrés postraumático
SIDS | sudden infant death syndrome | síndrome de muerte súbita del lactante
STD | sexually transmitted disease | enfermedad de transmisión sexual; ETS
STI | sexually transmitted infection | infección de transmisión sexual; ITS
TB | tuberculosis | tuberculosis
T&A | tonsillectomy and adenoidectomy | amigdalectomía y adenoidectomía
UTI | urinary tract infection | infección de las vías urinarias; infección urinaria
URI | upper respiratory infection | infección de las vías respiratorias superiores
AMI | acute myocardial infarction | infarto agudo de miocardio
MI | myocardial infarction | infarto de miocardio; ataque al corazón
PE | pulmonary embolism | embolia pulmonar
TIA | transient ischemic attack | ataque isquémico transitorio; mini derrame
TSH | thyroid stimulating hormone | hormona estimulante de la tiroides
FSH | follicle stimulating hormone | hormona foliculoestimulante
HbA1c | hemoglobin A1c; A1C | hemoglobina A1c; hemoglobina glicosilada
HDL | HDL cholesterol; good cholesterol | colesterol HDL; colesterol bueno
LDL | LDL cholesterol; bad cholesterol | colesterol LDL; colesterol malo
ACL | anterior cruciate ligament | ligamento cruzado anterior
MCL | medial collateral ligament | ligamento colateral medial
ARDS | acute respiratory distress syndrome | síndrome de dificultad respiratoria aguda
ARF | acute renal failure; acute kidney failure | insuficiencia renal aguda
AKA | above the knee amputation | amputación por encima de la rodilla
BKA | below the knee amputation | amputación por debajo de la rodilla
CC | chief complaint | motivo de consulta
CPAP | CPAP machine; continuous positive airway pressure | máquina CPAP; presión positiva continua en las vías respiratorias
DJD | degenerative joint disease | enfermedad articular degenerativa
DOE | dyspnea on exertion | falta de aire al hacer esfuerzo
FX | fracture | fractura
HA | headache | dolor de cabeza; cefalea
HRT | hormone replacement therapy | terapia de reemplazo hormonal
ICD | implantable cardioverter defibrillator | desfibrilador automático implantable
LBP | low back pain | dolor lumbar; dolor de espalda baja
LLQ | left lower quadrant | cuadrante inferior izquierdo
LUQ | left upper quadrant | cuadrante superior izquierdo
RLQ | right lower quadrant | cuadrante inferior derecho
RUQ | right upper quadrant | cuadrante superior derecho
MRN | medical record number | número de expediente médico
MRSA | MRSA infection | estafilococo resistente a la meticilina; SARM
MVP | mitral valve prolapse | prolapso de la válvula mitral
NP | nurse practitioner | enfermero practicante; enfermera practicante
PA | physician assistant | asistente médico
HCP | health care provider | proveedor de atención médica
OB/GYN | obstetrician gynecologist; OBGYN | ginecoobstetra; ginecólogo obstetra
PCOS | polycystic ovary syndrome; polycystic ovarian syndrome | síndrome de ovario poliquístico
PFT | pulmonary function test | prueba de función pulmonar
PO | by mouth; orally | por vía oral; por la boca
PRN | as needed | según sea necesario; cuando lo necesite
BID | twice a day; twice daily | dos veces al día
TID | three times a day; three times daily | tres veces al día
QID | four times a day; four times daily | cuatro veces al día
QD | once a day; once daily; every day | una vez al día
QHS | at bedtime | al acostarse
SOB | shortness of breath | falta de aire
SQ | subcutaneous | subcutáneo; debajo de la piel
POA | power of attorney | poder notarial; apoderado
RA | rheumatoid arthritis | artritis reumatoide
TKR | total knee replacement | reemplazo total de rodilla
THR | total hip replacement | reemplazo total de cadera
TMJ | temporomandibular joint | articulación temporomandibular
VSS | vital signs stable | signos vitales estables
STREP | strep throat; streptococcus | faringitis estreptocócica; estreptococo

# Direcciones y prefijos
 | superior | superior
 | inferior | inferior
 | anterior | anterior
 | posterior | posterior
 | medial | medial
 | lateral | lateral
 | proximal | proximal
 | distal | distal

# Cardiovascular y sangre
 | cardiac arrest | paro cardíaco
 | arrhythmia | arritmia
 | cardiomyopathy | miocardiopatía; cardiomiopatía
 | blockage | obstrucción; bloqueo
 | congenital heart defect; congenital heart defects | defecto cardíaco congénito; cardiopatía congénita
 | hypotension; low blood pressure | hipotensión; presión baja
 | endocarditis | endocarditis
 | hypertension; high blood pressure | hipertensión; presión alta
 | heart attack | ataque al corazón; infarto
 | myocarditis | miocarditis
 | heart murmur | soplo cardíaco; soplo en el corazón
 | rheumatic fever | fiebre reumática
 | atrial fibrillation; afib | fibrilación auricular
 | atherosclerosis | aterosclerosis
 | congestive heart failure | insuficiencia cardíaca congestiva
 | heart failure | insuficiencia cardíaca
 | stenosis | estenosis
 | embolism | embolia
 | aortic aneurysm | aneurisma aórtico; aneurisma de la aorta
 | angina; angina pectoris | angina de pecho
 | anemia | anemia
 | lymphoma | linfoma
 | blood clot | coágulo de sangre; coágulo
 | expectoration | expectoración
 | cyanosis | cianosis
 | sepsis; blood poisoning | sepsis; septicemia
 | varicose veins | várices; venas varicosas
 | high cholesterol | colesterol alto
 | myocardial infarction | infarto de miocardio
 | pericarditis | pericarditis
 | dyslipidemia | dislipidemia
 | mitral regurgitation | insuficiencia mitral; regurgitación mitral
 | thalassemia | talasemia
 | leukemia | leucemia
 | edema; swelling | edema; hinchazón
 | sickle cell anemia; sickle cell disease | anemia de células falciformes; anemia drepanocítica
 | palpitations; palpitation | palpitaciones
 | echocardiogram | ecocardiograma
 | blood pressure cuff | brazalete para medir la presión; manguito
 | stethoscope | estetoscopio
 | angiography; angiogram | angiografía; angiograma
 | blood test; blood work; labs | análisis de sangre; examen de sangre; laboratorios
 | doppler; duplex ultrasound | ultrasonido doppler
 | blood sugar; blood glucose | azúcar en la sangre; glucosa
 | cardiologist | cardiólogo
 | phlebotomist | flebotomista
 | heart surgeon; cardiac surgeon | cirujano cardiovascular; cirujano del corazón
 | vascular surgeon | cirujano vascular
 | hematologist | hematólogo
 | catheter; catheterization | catéter; cateterismo
 | angioplasty | angioplastia
 | pacemaker | marcapasos
 | open heart surgery | cirugía a corazón abierto
 | prosthetic valve | válvula protésica
 | stent | stent; endoprótesis
 | blood thinner; blood thinners | anticoagulante; medicamento para diluir la sangre
 | anticoagulant | anticoagulante
 | stress test | prueba de esfuerzo
 | capillary | capilar
 | white blood cells | glóbulos blancos
 | red blood cells | glóbulos rojos
 | platelets | plaquetas
 | hemoglobin | hemoglobina
 | iron | hierro
 | pulse | pulso
 | blood circulation; blood flow | circulación sanguínea; flujo sanguíneo

# Respiratorio
 | flu; influenza | gripe; influenza
 | common cold | resfriado; catarro
 | emphysema | enfisema
 | sinusitis | sinusitis
 | sleep apnea | apnea del sueño
 | cystic fibrosis | fibrosis quística
 | respiratory infection | infección respiratoria
 | adenoids | adenoides
 | fever | fiebre; calentura
 | lung cancer | cáncer de pulmón
 | phlegm; mucus | flema; mucosidad
 | pneumonia | neumonía; pulmonía
 | shortness of breath; short of breath | falta de aire; dificultad para respirar
 | asthma | asma
 | bronchitis | bronquitis
 | sputum | esputo
 | wheezing | sibilancias; silbido en el pecho
 | rhinitis | rinitis
 | sneezing | estornudos
 | fistula | fístula
 | sore throat | dolor de garganta
 | strep throat | faringitis estreptocócica
 | congestion; stuffy nose | congestión; nariz tapada
 | spirometer | espirómetro
 | tracheotomy | traqueotomía
 | tracheostomy | traqueostomía
 | biopsy | biopsia
 | pulmonary function test | prueba de función pulmonar
 | thoracotomy | toracotomía
 | lobectomy | lobectomía
 | breathing tube | tubo respiratorio
 | pulmonologist | neumólogo
 | heimlich maneuver | maniobra de heimlich
 | cough suppressant; antitussive | antitusivo; jarabe para la tos
 | windpipe; trachea | tráquea
 | voice box; larynx | laringe
 | inhaler | inhalador
 | cough | tos

# Digestivo
 | diarrhea | diarrea
 | diverticulitis | diverticulitis
 | bloating; distention | hinchazón abdominal; distensión
 | gas; flatulence | gases; flatulencia
 | gallstones | cálculos biliares; piedras en la vesícula
 | heartburn | acidez; agruras
 | acid reflux | reflujo ácido
 | hemorrhoids | hemorroides; almorranas
 | hernia | hernia
 | hepatitis | hepatitis
 | hiccups; hiccup | hipo
 | cleft lip | labio leporino
 | cleft palate | paladar hendido
 | cirrhosis | cirrosis
 | constipation | estreñimiento
 | jaundice | ictericia
 | polyp | pólipo
 | nausea | náuseas
 | vomiting | vómito
 | ulcer; ulcers | úlcera; úlceras
 | h pylori; h. pylori | helicobacter pylori
 | dehydration | deshidratación
 | cholecystitis | colecistitis; inflamación de la vesícula
 | aches | dolores; molestias
 | tenderness | sensibilidad; dolor al tacto
 | colic | cólico
 | heaviness | pesadez
 | radiating | que se irradia; que se corre
 | burning | ardor; quemazón
 | throbbing | punzante; pulsátil
 | stabbing | agudo; como puñalada
 | tingling | hormigueo
 | dull pain; dull | dolor sordo
 | acute | agudo
 | chronic | crónico
 | cramping; cramps | cólicos; calambres
 | metabolism | metabolismo
 | fiber | fibra
 | leafy green vegetables | verduras de hoja verde
 | enzymes | enzimas
 | whole milk | leche entera
 | skim milk; skimmed milk | leche descremada
 | vitamins | vitaminas
 | triglycerides | triglicéridos
 | lactose intolerance | intolerancia a la lactosa
 | greasy food; fatty food | comida grasosa
 | starch | almidón
 | appendectomy | apendicectomía
 | cholecystectomy | colecistectomía; extirpación de la vesícula
 | colonoscopy | colonoscopia
 | colostomy | colostomía
 | upper endoscopy | endoscopia superior
 | sleeve gastrectomy | manga gástrica; gastrectomía en manga
 | antacids; antacid | antiácidos; antiácido
 | antiemetic | antiemético; medicamento para el vómito
 | laxative | laxante
 | stool softener | ablandador de heces
 | enema | enema; lavado intestinal
 | gastroenterologist | gastroenterólogo
 | bowel movement | evacuación; defecar
 | stool | heces; excremento
 | fatty liver | hígado graso

# Endocrino
 | obesity | obesidad
 | overweight | sobrepeso
 | osteoporosis | osteoporosis
 | tumor | tumor
 | malignant | maligno
 | benign | benigno
 | loss of appetite | pérdida del apetito; falta de apetito
 | blurry vision; blurred vision | visión borrosa
 | dizziness; dizzy | mareo; mareado
 | cushing's syndrome | síndrome de cushing
 | hypoglycemia; low blood sugar | hipoglucemia; azúcar baja
 | hyperglycemia; high blood sugar | hiperglucemia; azúcar alta
 | hyperthyroidism | hipertiroidismo
 | hypothyroidism | hipotiroidismo
 | type 1 diabetes | diabetes tipo 1
 | type 2 diabetes | diabetes tipo 2
 | diabetes | diabetes
 | coma | coma
 | tremors | temblores
 | peripheral neuropathy | neuropatía periférica
 | lethargy | letargo
 | infertility | infertilidad
 | endocrinologist | endocrinólogo
 | fasting | en ayunas; ayuno
 | postprandial; post prandial | posprandial; después de comer
 | saline | solución salina; suero
 | insulin pump | bomba de insulina
 | insulin | insulina
 | metformin | metformina
 | blood sugar log | registro de glucosa
 | testosterone | testosterona
 | estrogen | estrógeno
 | progesterone | progesterona
 | growth hormone | hormona del crecimiento

# Piel
 | birthmark | marca de nacimiento; lunar de nacimiento
 | photosensitive | fotosensible
 | psoriasis | psoriasis
 | rash | sarpullido; erupción; salpullido
 | ringworm | tiña
 | itching | comezón; picazón
 | sores | llagas
 | vitiligo | vitíligo
 | wart; warts | verruga; verrugas
 | acne | acné
 | alopecia; hair loss | alopecia; caída del cabello
 | bite | mordedura; picadura
 | sting | picadura
 | boil | forúnculo; nacido
 | burn | quemadura
 | blister | ampolla
 | eczema | eccema
 | hives; urticaria | ronchas; urticaria
 | ingrown toenail | uña encarnada; uña enterrada
 | mole; moles | lunar; lunares
 | callus | callo
 | atopic dermatitis | dermatitis atópica
 | abscess | absceso
 | scar | cicatriz
 | shingles; herpes zoster | herpes zóster; culebrilla
 | herpes simplex | herpes simple

# Sistema nervioso
 | brain | cerebro
 | nerve | nervio
 | spinal cord | médula espinal
 | cervical vertebrae | vértebras cervicales
 | thoracic vertebrae | vértebras torácicas
 | lumbar vertebrae | vértebras lumbares
 | dementia | demencia
 | delirium | delirio
 | encephalitis | encefalitis
 | epilepsy | epilepsia
 | meningitis | meningitis
 | cerebral palsy | parálisis cerebral
 | facial palsy; bell's palsy | parálisis facial
 | nerve block | bloqueo nervioso
 | concussion | conmoción cerebral
 | parkinson's disease | enfermedad de parkinson
 | headache | dolor de cabeza
 | loss of consciousness | pérdida del conocimiento
 | amnesia | amnesia
 | alzheimer's disease | enfermedad de alzheimer
 | sciatica | ciática
 | autism | autismo
 | seizures; seizure | convulsiones; convulsión
 | convulsions | convulsiones
 | short term memory loss | pérdida de memoria a corto plazo
 | stroke | derrame cerebral; accidente cerebrovascular
 | migraine | migraña; jaqueca
 | hemiplegia | hemiplejia
 | paraplegia | paraplejia
 | quadriplegia | cuadriplejia
 | confusion | confusión
 | cerebral hemorrhage | hemorragia cerebral
 | pinched nerve | nervio pinchado; nervio comprimido
 | vertigo | vértigo
 | anesthesia | anestesia
 | neurologist | neurólogo
 | lumbar puncture; spinal tap | punción lumbar
 | anti-epileptics; antiepileptic | antiepilépticos; anticonvulsivos

# Ojos y oídos
 | stye; sty | orzuelo
 | astigmatism | astigmatismo
 | cataract; cataracts | catarata; cataratas
 | glaucoma | glaucoma
 | retinal detachment | desprendimiento de retina
 | crossed eyes; strabismus | ojos bizcos; estrabismo
 | farsightedness | hipermetropía
 | nearsightedness | miopía
 | macular degeneration | degeneración macular
 | fundus exam; fundus examination | examen de fondo de ojo
 | contact lenses | lentes de contacto
 | ophthalmologist | oftalmólogo
 | optometrist | optometrista
 | cochlear implant | implante coclear
 | ear wax | cerilla; cerumen
 | ear lavage | lavado de oídos
 | ruptured eardrum | tímpano perforado
 | eardrum | tímpano
 | swimmer's ear | otitis del nadador
 | tinnitus; ringing in the ears | tinnitus; zumbido en los oídos
 | ear infection; otitis media | infección de oído; otitis media
 | otoscopy | otoscopia
 | deaf | sordo
 | mute | mudo
 | hearing aids; hearing aid | audífonos; audífono

# Salud mental
 | psychiatrist | psiquiatra
 | psychologist | psicólogo
 | manic episode; manic episodes | episodio maníaco; episodios maníacos
 | panic attack; panic attacks | ataque de pánico; ataques de pánico
 | phobia | fobia
 | postpartum depression | depresión posparto
 | schizophrenia | esquizofrenia
 | fatigue | fatiga; cansancio
 | distress | angustia
 | generalized anxiety disorder | trastorno de ansiedad generalizada
 | anxiety | ansiedad
 | depression | depresión
 | borderline personality disorder | trastorno límite de la personalidad
 | bipolar disorder | trastorno bipolar
 | antipsychotics; anti-psychotics | antipsicóticos
 | psychosis | psicosis
 | sedatives | sedantes
 | antidepressant; antidepressants | antidepresivo; antidepresivos
 | suicidal thoughts | pensamientos suicidas

# Reproductivo femenino y embarazo
 | placenta | placenta
 | umbilical cord | cordón umbilical
 | endometriosis | endometriosis
 | cervical cancer | cáncer de cuello uterino; cáncer cervical
 | gestational diabetes | diabetes gestacional
 | gonorrhea | gonorrea
 | syphilis | sífilis
 | chlamydia | clamidia
 | abortion | aborto inducido; interrupción del embarazo
 | miscarriage | aborto espontáneo; pérdida del embarazo
 | yeast infection | infección por hongos; candidiasis
 | discharge; vaginal discharge | flujo; flujo vaginal
 | ectopic pregnancy | embarazo ectópico
 | prolapse | prolapso
 | premature baby; preterm baby | bebé prematuro
 | menopause | menopausia
 | nipple discharge | secreción del pezón
 | lump | bulto; bolita
 | spotting | manchado; sangrado leve
 | gynecologist | ginecólogo
 | obstetrician | obstetra
 | labor and delivery | trabajo de parto y parto
 | midwife | partera; matrona
 | transvaginal ultrasound | ultrasonido transvaginal
 | mammogram | mamografía
 | pap smear | papanicolau; prueba de papanicolaou
 | hysteroscopy | histeroscopia
 | colposcopy | colposcopia
 | pregnancy test | prueba de embarazo
 | ovulation test | prueba de ovulación
 | sonogram; ultrasound | ultrasonido; ecografía
 | kegel exercises | ejercicios de kegel
 | episiotomy | episiotomía
 | hysterectomy | histerectomía
 | vaginal delivery | parto vaginal
 | c-section; cesarean section | cesárea
 | birth control pills | pastillas anticonceptivas
 | contraceptives; birth control | anticonceptivos
 | tubal ligation | ligadura de trompas
 | prenatal vitamins | vitaminas prenatales
 | douching | ducha vaginal
 | ivf; in vitro fertilization | fertilización in vitro
 | induction of labor; induce labor | inducción del parto; inducir el parto
 | epidural | epidural; anestesia epidural
 | forceps | fórceps
 | due date | fecha probable de parto
 | car seat | asiento de seguridad para bebé; silla para el carro
 | crib | cuna
 | birth certificate | acta de nacimiento; certificado de nacimiento
 | breastfeeding; lactation | lactancia materna; amamantar
 | colostrum | calostro
 | go into labor; in labor | entrar en trabajo de parto; estar de parto
 | contractions | contracciones
 | water broke | se le rompió la fuente; rompió fuente
 | tampons | tampones
 | pads | toallas sanitarias
 | baby formula; formula | fórmula para bebé; leche de fórmula
 | pregnant | embarazada

# Reproductivo masculino
 | prostatitis | prostatitis
 | impotence | impotencia
 | erectile dysfunction | disfunción eréctil
 | varicocele | varicocele
 | hydrocele | hidrocele
 | benign prostatic hyperplasia; enlarged prostate | hiperplasia prostática benigna; próstata agrandada
 | vasectomy | vasectomía
 | rectal exam | examen rectal; tacto rectal
 | condom | condón; preservativo
 | circumcision | circuncisión
 | foreskin | prepucio
 | scrotum | escroto
 | semen | semen
 | sperm | espermatozoides; esperma

# Urinario
 | incontinence | incontinencia
 | cystitis | cistitis
 | kidney failure; renal failure | insuficiencia renal
 | urgency | urgencia urinaria
 | dribbling | goteo
 | kidney stones; renal calculi | cálculos renales; piedras en los riñones
 | urinalysis; urine test | análisis de orina; examen de orina
 | urine culture | urocultivo; cultivo de orina
 | urinary catheter | sonda urinaria
 | cystoscopy | cistoscopia
 | urinate; void | orinar
 | dialysis | diálisis
 | nephrectomy | nefrectomía
 | kidney transplant | trasplante de riñón
 | kidney function test | prueba de función renal
 | diuretics; water pills | diuréticos; pastillas para el agua
 | urologist | urólogo
 | nephrologist | nefrólogo
 | uric acid | ácido úrico

# Músculo-esquelético
 | cartilage | cartílago
 | ligaments; ligament | ligamentos; ligamento
 | tendons; tendon | tendones; tendón
 | joints; joint | articulaciones; articulación; coyuntura
 | jaw | mandíbula; quijada
 | calf | pantorrilla
 | collarbone; clavicle | clavícula
 | ribs | costillas
 | kneecap; patella | rótula
 | thigh | muslo
 | rotator cuff | manguito rotador
 | forearm | antebrazo
 | sole of the foot | planta del pie
 | fibromyalgia | fibromialgia
 | gout | gota
 | herniated disc | hernia de disco; disco herniado
 | lupus | lupus
 | torn muscle; muscle tear | desgarro muscular
 | muscular dystrophy | distrofia muscular
 | atrophy | atrofia
 | rheumatoid arthritis | artritis reumatoide
 | arthritis | artritis
 | scoliosis | escoliosis
 | dislocated | dislocado; zafado
 | fracture | fractura
 | compound fracture | fractura expuesta
 | sprained ankle; ankle sprain | esguince de tobillo; tobillo torcido
 | sprain | esguince; torcedura
 | muscle cramps | calambres musculares
 | stiffness | rigidez
 | orthopedic surgeon | cirujano ortopédico; ortopedista
 | chiropractor | quiropráctico
 | physical therapist; physiotherapist | fisioterapeuta
 | rheumatologist | reumatólogo
 | amputation | amputación
 | hip replacement | reemplazo de cadera
 | knee replacement | reemplazo de rodilla
 | screws | tornillos
 | plates | placas
 | pet scan | tomografía por emisión de positrones; PET
 | bone density | densidad ósea
 | splint | férula
 | brace | aparato ortopédico; soporte
 | cast | yeso
 | steroid injection | inyección de esteroides
 | x-ray | radiografía; rayos x

# Linfático, inmunidad y vacunas
 | lymph nodes | ganglios linfáticos
 | tonsillitis | amigdalitis; anginas
 | tonsillectomy | amigdalectomía
 | radiation therapy | radioterapia
 | radiation oncologist | radiooncólogo
 | oncologist | oncólogo
 | chemotherapy | quimioterapia
 | immunization; vaccination | inmunización; vacunación
 | vaccine | vacuna
 | anaphylactic shock; anaphylaxis | choque anafiláctico; anafilaxia
 | allergic reaction | reacción alérgica
 | antibody; antibodies | anticuerpo; anticuerpos
 | bone marrow biopsy | biopsia de médula ósea
 | chickenpox; varicella | varicela
 | MMR | vacuna triple viral; sarampión, paperas y rubéola
 | polio | polio
 | whooping cough | tos ferina
 | flu shot | vacuna contra la gripe
 | meningococcal vaccine | vacuna antimeningocócica
 | pneumococcal vaccine | vacuna antineumocócica
 | booster shot; booster | refuerzo; dosis de refuerzo
 | tetanus | tétanos

# Personal de salud
 | attending physician; attending | médico tratante; médico de cabecera
 | resident | médico residente
 | chaperone | acompañante
 | chaplain | capellán
 | counselor | consejero
 | dietitian; nutritionist | dietista; nutricionista
 | pharmacist | farmacéutico
 | social worker | trabajador social
 | case manager | administrador de casos; gestor de casos
 | anesthesiologist | anestesiólogo
 | triage nurse | enfermera de triaje
 | nurse | enfermero; enfermera
 | pediatrician | pediatra

# Otros síntomas
 | weight gain | aumento de peso
 | weight loss | pérdida de peso
 | engorged | congestionado; hinchado
 | chills | escalofríos
 | claustrophobic | claustrofóbico
 | difficulty swallowing | dificultad para tragar
 | hoarse; hoarseness | ronco; ronquera
 | lightheaded | aturdido; mareado
 | hot flashes | bochornos; sofocos
 | groggy | atontado; adormilado
 | restless | inquieto
 | foul smell | mal olor
 | toothache | dolor de muela
 | flushed | ruborizado; enrojecido
 | drowsy | somnoliento; con sueño
 | faint; pass out; passed out | desmayarse; desmayo
 | teeth grinding | rechinar los dientes; bruxismo
 | snoring | ronquidos
 | gagging | arcadas; náuseas
 | chest pain | dolor de pecho
 | numbness | entumecimiento
 | bleeding | sangrado
 | shortness of breath on exertion | falta de aire al hacer esfuerzo

# Instrumentos y procedimientos
 | sling | cabestrillo
 | stitches; sutures | puntos; suturas
 | syringe | jeringa
 | walker | andadera; andador
 | wheelchair | silla de ruedas
 | cane | bastón
 | crutches | muletas
 | stretcher | camilla
 | hospital gown | bata de hospital
 | test strips; lancets | tiras reactivas; lancetas
 | glucometer | glucómetro
 | mesh | malla
 | iv fluids | sueros; líquidos intravenosos
 | port | puerto; catéter implantado
 | needle stick; prick | piquete; pinchazo
 | gauze | gasa
 | bandage; dressing | vendaje; venda; apósito
 | scalpel | bisturí

# Dental
 | gums; gum | encías; encía
 | gingivitis | gingivitis
 | dentures | dentadura postiza; placa dental
 | latex | látex
 | tooth extraction | extracción dental
 | fillings; filling | empastes; tapaduras; empaste
 | molars | muelas; molares
 | loose teeth | dientes flojos
 | baby teeth | dientes de leche

# Administrativo y otros
 | formulary | formulario de medicamentos
 | recreational drugs | drogas recreativas
 | groin | ingle
 | vital signs | signos vitales
 | referral | referencia; remisión; pase
 | refill | resurtido; reabastecimiento de receta
 | follow up; follow-up | seguimiento; cita de seguimiento
 | inpatient | paciente hospitalizado
 | outpatient | paciente ambulatorio
 | contagious | contagioso
 | physical exam; physical | examen físico
 | living will | testamento vital
 | admission | ingreso; admisión
 | discharged; hospital discharge | dado de alta; alta hospitalaria
 | advance directive | directiva anticipada; voluntades anticipadas
 | co-pay; copay | copago
 | self-pay | pago por cuenta propia
 | deductible | deducible
 | payment plan | plan de pagos
 | workers' comp; workers compensation | compensación laboral; seguro de accidentes de trabajo
 | social security number | número de seguro social
 | recovery room | sala de recuperación
 | prescription | receta
 | tablet; tablets; pills | tableta; tabletas; pastillas
 | suppository | supositorio
 | shot; injection | inyección
 | side effects | efectos secundarios
 | allergies; allergic | alergias; alérgico
 | insurance | seguro médico; aseguranza
 | appointment | cita
 | consent form | formulario de consentimiento
`;
