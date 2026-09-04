export interface CarSpec {
  id: string
  constructorId: string
  teamName: string
  chassis: string
  season: string
  powerUnit: {
    supplier: string
    name: string
    configuration: string
    displacement: string
    maxRpm: string
    powerOutput: string
    mguConfig: string
  }
  transmission: string
  weight: string
  fuelCapacity: string
  brakes: string
  suspension: string
  drivers: { name: string; number: number; code: string }[]
  imagePng: string
  imageAvif: string
  description: string
  keyInnovations: string[]
}

export const F1_CARS: CarSpec[] = [
  {
    id: 'mclaren-mcl38',
    constructorId: 'mclaren',
    teamName: 'McLaren Formula 1 Team',
    chassis: 'MCL38',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Mercedes-AMG',
      name: 'Mercedes-AMG M15 E Performance',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,000+ bhp',
      mguConfig: 'MGU-K (120 kW) & MGU-H',
    },
    transmission: 'McLaren carbon-fibre composite 8-speed forward, 1 reverse semi-automatic sequential',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'Carbon Industrie discs and carbon-carbon pads, AP Racing calipers with rear brake-by-wire',
    suspension: 'Front pull-rod / Rear push-rod wishbone with inboard torsion springs and dampers',
    drivers: [
      { name: 'Lando Norris', number: 4, code: 'NOR' },
      { name: 'Oscar Piastri', number: 81, code: 'PIA' },
    ],
    imagePng: '/static/images/mclaren.png',
    imageAvif: '/static/images/mclaren.avif',
    description:
      'The championship-winning MCL38 engineered by McLaren Racing features extreme sidepod undercut packaging, asymmetric floor vortex generators, and supreme tire management across high-speed circuits.',
    keyInnovations: [
      'Innovative multi-stage floor edge winglet channel',
      'Compact sidepod air intake with wide undercut channel',
      'Advanced front brake duct cooling with internal aero vanes',
      'High-downforce beam wing and DRS flap efficiency',
    ],
  },
  {
    id: 'ferrari-sf24',
    constructorId: 'ferrari',
    teamName: 'Scuderia Ferrari',
    chassis: 'SF-24',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Ferrari',
      name: 'Ferrari 066/12',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,000+ bhp',
      mguConfig: 'MGU-K (120 kW) & MGU-H',
    },
    transmission: 'Ferrari carbon composite longitudinal gearbox, 8 speeds + reverse, quick-shift sequential',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'Brembo ventilated carbon-ceramic disc brakes with front/rear brake-by-wire electronic management',
    suspension: 'Front push-rod / Rear pull-rod wishbone configuration',
    drivers: [
      { name: 'Charles Leclerc', number: 16, code: 'LEC' },
      { name: 'Lewis Hamilton', number: 44, code: 'HAM' },
    ],
    imagePng: '/static/images/ferrari.png',
    imageAvif: '/static/images/ferrari.avif',
    description:
      'Scuderia Ferrari’s SF-24 marks a complete redesign over previous ground-effect concepts, incorporating an aggressive downwash sidepod profile, reworked front wing outwash, and predictable aerodynamic balance across all tire compounds.',
    keyInnovations: [
      'Overbite sidepod cooling inlet architecture',
      'Redesigned front-to-rear center of pressure stability',
      'Bespoke Ferrari 066/12 internal combustion chamber optimization',
      'Titanium/carbon hybrid transmission casing with extreme narrow packaging',
    ],
  },
  {
    id: 'redbull-rb20',
    constructorId: 'red_bull',
    teamName: 'Oracle Red Bull Racing',
    chassis: 'RB20',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Honda RBPT',
      name: 'Honda RBPTH002',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,020+ bhp',
      mguConfig: 'MGU-K (120 kW) & MGU-H',
    },
    transmission: 'Red Bull Racing 8-speed longitudinal gearbox with hydraulic sequential power-shift',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'Carbon-carbon discs with Brembo bespoke calipers and rear electronic brake-by-wire system',
    suspension: 'Front pull-rod / Rear push-rod with anti-dive and anti-squat geometric linkages',
    drivers: [
      { name: 'Max Verstappen', number: 1, code: 'VER' },
      { name: 'Liam Lawson', number: 30, code: 'LAW' },
    ],
    imagePng: '/static/images/red_bull.png',
    imageAvif: '/static/images/red_bull.avif',
    description:
      'Designed by Adrian Newey and Red Bull Technology, the RB20 stunned the paddock with its radical vertical sidepod inlets, shark-gill engine cover canons, and class-leading venturi tunnel underfloor ground effect.',
    keyInnovations: [
      'Vertical sidepod snorkel intakes with hidden horizontal slit ducts',
      'Deep shoulder canons flowing air along engine cover to rear beam wing',
      'Extreme anti-dive front suspension geometry stabilizing aerodynamic platform',
      'Ultra-efficient low-drag DRS wing profile',
    ],
  },
  {
    id: 'mercedes-w15',
    constructorId: 'mercedes',
    teamName: 'Mercedes-AMG PETRONAS F1 Team',
    chassis: 'F1 W15',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Mercedes-AMG',
      name: 'Mercedes-AMG M15 E Performance',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,000+ bhp',
      mguConfig: 'MGU-K (120 kW) & MGU-H',
    },
    transmission: 'Mercedes-Benz 8-speed forward, 1 reverse seamless carbon casing unit',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'Carbon fiber discs and pads with internal cooling ducts and bespoke Mercedes calipers',
    suspension: 'Front push-rod / Rear push-rod wishbones with inboard heave damper elements',
    drivers: [
      { name: 'George Russell', number: 63, code: 'RUS' },
      { name: 'Andrea Kimi Antonelli', number: 12, code: 'ANT' },
    ],
    imagePng: '/static/images/mercedes.png',
    imageAvif: '/static/images/mercedes.avif',
    description:
      'The Mercedes-AMG F1 W15 abandoned earlier cockpit-forward zero-pod philosophies for a refined push-rod rear suspension, wider aerodynamic operating window, and exceptional high-speed balance.',
    keyInnovations: [
      'Push-rod rear suspension configuration freeing up floor diffuser expansion',
      'Cockpit shifted 100mm rearwards for optimal driver feedback and weight balance',
      'Innovative triangular front wing vortex generator element',
      'Class-leading thermal efficiency from the Mercedes M15 power unit',
    ],
  },
  {
    id: 'astonmartin-amr24',
    constructorId: 'aston_martin',
    teamName: 'Aston Martin Aramco F1 Team',
    chassis: 'AMR24',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Mercedes-AMG',
      name: 'Mercedes-AMG M15 E Performance',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,000+ bhp',
      mguConfig: 'MGU-K (120 kW) & MGU-H',
    },
    transmission: 'Mercedes-AMG 8-speed semi-automatic sequential gearbox',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'Brembo calipers with carbon-carbon discs and brake-by-wire rear system',
    suspension: 'Front push-rod / Rear push-rod with wishbone and tie-rod assemblies',
    drivers: [
      { name: 'Fernando Alonso', number: 14, code: 'ALO' },
      { name: 'Lance Stroll', number: 18, code: 'STR' },
    ],
    imagePng: '/static/images/aston_martin.png',
    imageAvif: '/static/images/aston_martin.avif',
    description:
      'Dressed in iconic Aston Martin Racing Green, the AMR24 features deeply sculptured sidepod water-slide gullies channels and a re-engineered front wing assembly for responsive low-speed corner turn-in.',
    keyInnovations: [
      'Signature deep sidepod waterslide aerodynamic ramps',
      'Aggressive front wing mainplane sweep directing airflow outside front tires',
      'Revised carbon floor fences generating powerful sealing vortex along the edges',
      'Lightweight carbon crash structure and aerodynamic halo fairing',
    ],
  },
  {
    id: 'alpine-a524',
    constructorId: 'alpine',
    teamName: 'BWT Alpine F1 Team',
    chassis: 'A524',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Renault',
      name: 'Renault E-Tech RE24',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~980+ bhp',
      mguConfig: 'MGU-K (120 kW) & MGU-H',
    },
    transmission: 'Alpine 8-speed forward, 1 reverse semi-automatic transmission with magnesium maincase',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'Brembo carbon discs & pads with AP Racing brake actuation hydraulics',
    suspension: 'Front push-rod / Rear push-rod with carbon-composite wishbones',
    drivers: [
      { name: 'Pierre Gasly', number: 10, code: 'GAS' },
      { name: 'Jack Doohan', number: 7, code: 'DOO' },
    ],
    imagePng: '/static/images/alpine.png',
    imageAvif: '/static/images/alpine.avif',
    description:
      'The A524 represents a fundamental concept overhaul from Enstone and Viry-Châtillon, focusing on weight reduction, dynamic mechanical grip, and a broadened aerodynamic operating window.',
    keyInnovations: [
      'Redesigned carbon monocoque chassis structure saving critical structural weight',
      'Wider sidepod undercut channeling air to the diffuser top deck',
      'Revised inboard suspension kinematics reducing chassis pitch under braking',
      'Dual-livery high-visibility matte carbon and BWT pink/blue aero wrap',
    ],
  },
  {
    id: 'williams-fw46',
    constructorId: 'williams',
    teamName: 'Williams Racing',
    chassis: 'FW46',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Mercedes-AMG',
      name: 'Mercedes-AMG M15 E Performance',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,000+ bhp',
      mguConfig: 'MGU-K (120 kW) & MGU-H',
    },
    transmission: 'Mercedes-AMG 8-speed sequential semi-automatic transmission',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'AP Racing calipers with carbon composite discs and pads',
    suspension: 'Front push-rod / Rear push-rod with composite wishbone assemblies',
    drivers: [
      { name: 'Alexander Albon', number: 23, code: 'ALB' },
      { name: 'Carlos Sainz', number: 55, code: 'SAI' },
    ],
    imagePng: '/static/images/williams.png',
    imageAvif: '/static/images/williams.avif',
    description:
      'Under team principal James Vowles, the FW46 transformed Williams Racing from a straight-line speed specialist into an all-rounder chassis with improved downforce, chassis balance, and cornering versatility.',
    keyInnovations: [
      'Eliminated historic low-downforce trait in favor of multi-circuit downforce adaptability',
      'Integrated digital steering wheel display replacing old fixed dashboard screen',
      'Optimized cooling package allowing tighter rear engine cover tapering',
      'Advanced floor edge wing design providing robust ground effect suction',
    ],
  },
  {
    id: 'rb-vcarb01',
    constructorId: 'rb',
    teamName: 'Visa Cash App RB F1 Team',
    chassis: 'VCARB 01',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Honda RBPT',
      name: 'Honda RBPTH002',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,020+ bhp',
      mguConfig: 'MGU-K (120 kW) & MGU-H',
    },
    transmission: 'Red Bull Technology 8-speed longitudinal gearbox',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'Brembo calipers and carbon discs with fly-by-wire electronic rear control',
    suspension: 'Front pull-rod / Rear push-rod utilizing Red Bull Technology components',
    drivers: [
      { name: 'Yuki Tsunoda', number: 22, code: 'TSU' },
      { name: 'Isack Hadjar', number: 6, code: 'HAD' },
    ],
    imagePng: '/static/images/rb.png',
    imageAvif: '/static/images/rb.avif',
    description:
      'Sporting a metallic blue and white livery reminiscent of Toro Rosso heritage, the VCARB 01 leverages synergy with Red Bull Technology, featuring pull-rod front suspension and agile medium-speed cornering dynamics.',
    keyInnovations: [
      'Front pull-rod suspension synergy offering aerodynamic clean airflow to sidepods',
      'Compact radiator and intercooler configuration within sidepod bodywork',
      'Aggressive underfloor venturi tunnels maximizing high-speed ground effect',
      'Ultra-responsive low-mass front wing flap adjustments',
    ],
  },
  {
    id: 'haas-vf24',
    constructorId: 'haas',
    teamName: 'MoneyGram Haas F1 Team',
    chassis: 'VF-24',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Ferrari',
      name: 'Ferrari 066/12',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,000+ bhp',
      mguConfig: 'MGU-K (120 kW) & MGU-H',
    },
    transmission: 'Ferrari 8-speed longitudinal quick-shift transmission',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'Brembo carbon discs, pads and calipers with electronic brake-by-wire rear system',
    suspension: 'Front push-rod / Rear pull-rod with Ferrari technical synergy',
    drivers: [
      { name: 'Esteban Ocon', number: 31, code: 'OCO' },
      { name: 'Oliver Bearman', number: 87, code: 'BEA' },
    ],
    imagePng: '/static/images/haas.png',
    imageAvif: '/static/images/haas.avif',
    description:
      'Led by Ayao Komatsu, the Haas VF-24 resolved previous chronic tire degradation issues through a stable aerodynamic floor platform, revised rear suspension kinematics, and Ferrari power unit integration.',
    keyInnovations: [
      'Downwash sidepod concept eliminating turbulent boundary air separation',
      'Enhanced brake cooling duct airflow managing tire surface temperatures',
      'Upgraded rear floor diffuser expansion chamber increasing rear stability',
      'Lightweight carbon crash structure and efficient cockpit halo packaging',
    ],
  },
  {
    id: 'audi-c44',
    constructorId: 'audi',
    teamName: 'Audi F1 Team / Kick Sauber',
    chassis: 'C44 / Audi F1',
    season: '2024–2026',
    powerUnit: {
      supplier: 'Audi / Ferrari',
      name: 'Audi F1 Power Unit / Ferrari 066/12',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,000+ bhp',
      mguConfig: 'MGU-K & MGU-H High-Efficiency Hybrid',
    },
    transmission: 'Sauber/Audi carbon-titanium composite 8-speed semi-automatic sequential',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '110 kg max race fuel load',
    brakes: 'Brembo carbon-carbon brake discs and monolithic aluminum calipers',
    suspension: 'Front pull-rod / Rear push-rod suspension layout with inboard torsion bars',
    drivers: [
      { name: 'Nico Hülkenberg', number: 27, code: 'HUL' },
      { name: 'Gabriel Bortoleto', number: 5, code: 'BOR' },
    ],
    imagePng: '/static/images/audi.png',
    imageAvif: '/static/images/audi.avif',
    description:
      'Marking the official transition toward the full Audi factory works team in Hinwil and Neuburg, the C44 / Audi F1 car introduces pull-rod front suspension, bold aerodynamic sidepod tunnels, and factory engineering integration.',
    keyInnovations: [
      'Front pull-rod suspension improving airflow trajectory toward floor edges',
      'Aggressively sculpted sidepod undercuts directing air to rear diffuser',
      'Hinwil wind-tunnel refined front wing flap profile',
      'Factory Audi sport engineering integration and structural telemetry',
    ],
  },
  {
    id: 'cadillac-f1',
    constructorId: 'cadillac',
    teamName: 'Cadillac Formula 1 Team',
    chassis: 'Cadillac F1-01',
    season: '2026+',
    powerUnit: {
      supplier: 'Cadillac / GM Performance',
      name: 'GM / Ferrari Formula 1 Power Unit',
      configuration: '1.6L 90° V6 Turbocharged Hybrid',
      displacement: '1,600 cc',
      maxRpm: '15,000 RPM',
      powerOutput: '~1,000+ bhp',
      mguConfig: 'MGU-K (350 kW 2026 Spec) & High-Performance Battery',
    },
    transmission: 'Bespoke carbon-composite 8-speed seamless-shift transmission',
    weight: '798 kg (minimum FIA limit without fuel)',
    fuelCapacity: '100% sustainable FIA drop-in e-fuel',
    brakes: 'Brembo high-temperature carbon discs with fly-by-wire regenerative braking',
    suspension: 'Front push-rod / Rear push-rod with active geometric anti-roll damping',
    drivers: [
      { name: 'F1 Driver TBD', number: 99, code: 'CAD' },
      { name: 'F1 Driver TBD', number: 98, code: 'GM' },
    ],
    imagePng: '/static/images/cadillac.png',
    imageAvif: '/static/images/cadillac.avif',
    description:
      'The landmark American entry backed by General Motors and Cadillac Racing brings world-class automotive engineering, advanced CFD aero modeling, and championship heritage into the pinnacle of motorsport.',
    keyInnovations: [
      'Advanced CFD-developed aerodynamic chassis with optimized low-drag profile',
      'Next-generation sustainable synthetic fuel combustion management',
      'Modular lightweight monocoque engineered with GM proprietary carbon weaves',
      'Optimized regenerative braking energy recovery harvesting system',
    ],
  },
]
