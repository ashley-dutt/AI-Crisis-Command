// Crisis database and Role action definitions for AI Crisis Command

const ROLES = [
  {
    id: 'safety_chief',
    name: 'Public Safety Chief',
    title: 'Director of Civil Protection & Evacuation',
    icon: '🛡️',
    description: 'Specializes in crowd containment, zone evacuations, and civilian safety.'
  },
  {
    id: 'infra_director',
    name: 'Infrastructure Lead',
    title: 'Chief of Power, Transit & Structural Systems',
    icon: '⚡',
    description: 'Manages high-voltage power grids, water barriers, and structural reinforcement.'
  },
  {
    id: 'medical_lead',
    name: 'Triage Medical Lead',
    title: 'Emergency Medical Services Commander',
    icon: '🏥',
    description: 'Mobilizes mobile field hospitals, antidotes, trauma stabilization, and quarantines.'
  },
  {
    id: 'cyber_officer',
    name: 'Cyber & Comms Officer',
    title: 'Network Security & Telemetry Specialist',
    icon: '💻',
    description: 'Counters cyber-warfare, maintains emergency satellite links, and overrides rogue signals.'
  },
  {
    id: 'logistics_coordinator',
    name: 'Logistics Coordinator',
    title: 'Supply Chain & Heavy Asset Manager',
    icon: '📦',
    description: 'Deploys automated supply drones, heavy machinery, and emergency resource convoys.'
  },
  {
    id: 'env_specialist',
    name: 'Hazmat & Environmental Lead',
    title: 'Chemical, Biological & Ecological Response',
    icon: '☣️',
    description: 'Neutralizes chemical plumes, monitors toxic thresholds, and deploys scrubbing scrubbers.'
  },
  {
    id: 'intel_analyst',
    name: 'Strategic Intel Analyst',
    title: 'Threat Vector & Predictive Modeling Specialist',
    icon: '📡',
    description: 'Pinpoints vulnerability vectors, enhances team coordination, and increases action effectiveness.'
  },
  {
    id: 'city_admin',
    name: 'City Administrator',
    title: 'Municipal Executive & Emergency Authority',
    icon: '🏛️',
    description: 'Authorizes emergency federal aid, issues curfew declarations, and unlocks reserve budgets.'
  }
];

const CRISES = [
  {
    id: 'crisis_1',
    round: 1,
    title: 'Operation Black Sky: Grid Surge & Blackout',
    subtitle: 'High-voltage transformer detonation cascades through metropolitan power nodes.',
    severity: 'ELEVATED (Tier 2)',
    timerSeconds: 40,
    baseThreat: {
      integrity: -15,
      safety: -10,
      infrastructure: -25,
      resources: -10
    },
    threatDescription: 'Hospital backup generators are failing, traffic networks are paralyzed, and darkness breeds civil panic.',
    novaAdvisory: 'NOVA Analysis: Grid cascade will collapse municipal communications within 40 seconds. Prioritize substation isolation and emergency power rerouting to medical districts.',
    actions: {
      safety_chief: [
        {
          id: 'sc_traffic_patrol',
          label: 'Deploy Traffic Crisis Units',
          desc: 'Guide panicked motorists and escort emergency vehicles through dark intersections.',
          effects: { safety: +12, integrity: +5, resources: -5 }
        },
        {
          id: 'sc_curfew',
          label: 'Declare Emergency Sector Curfew',
          desc: 'Contain looting and civil distress in unpowered commercial districts.',
          effects: { integrity: +15, safety: +5, resources: -8 }
        }
      ],
      infra_director: [
        {
          id: 'id_isolate_substations',
          label: 'Isolate Blown Substation 4',
          desc: 'Reroute auxiliary transmission lines through the southern industrial loop.',
          effects: { infrastructure: +25, resources: -10 }
        },
        {
          id: 'id_grid_stabilize',
          label: 'Engage Hydro-Reserve Turbines',
          desc: 'Inject emergency voltage to prevent total regional black-start scenario.',
          effects: { infrastructure: +18, integrity: +8, resources: -6 }
        }
      ],
      medical_lead: [
        {
          id: 'ml_hospital_generators',
          label: 'Deliver Fuel to Trauma Centers',
          desc: 'Ensure intensive care units and ventilators remain powered through backup diesel.',
          effects: { safety: +20, resources: -8 }
        },
        {
          id: 'ml_mobile_triage',
          label: 'Dispatch Mobile First-Aid Vans',
          desc: 'Treat citizens injured during the blackout stampedes.',
          effects: { safety: +14, integrity: +6, resources: -5 }
        }
      ],
      cyber_officer: [
        {
          id: 'co_reroute_telecom',
          label: 'Activate Mesh Satellite Telecom',
          desc: 'Bypass disabled cell towers to reconnect emergency dispatchers.',
          effects: { infrastructure: +15, integrity: +10, resources: -5 }
        },
        {
          id: 'co_diagnose_surge',
          label: 'Audit Supervisory Control (SCADA)',
          desc: 'Confirm if surge was accidental or targeted, locking down control panels.',
          effects: { infrastructure: +12, integrity: +8, resources: -4 }
        }
      ],
      logistics_coordinator: [
        {
          id: 'lc_battery_convoys',
          label: 'Dispatch Mobile Battery Trailers',
          desc: 'Supply emergency power banks to critical water pumping and comms nodes.',
          effects: { infrastructure: +15, resources: -12 }
        },
        {
          id: 'lc_distribute_generators',
          label: 'Distribute Emergency Generators',
          desc: 'Deploy municipal backup power units to community shelters.',
          effects: { safety: +12, integrity: +8, resources: -8 }
        }
      ],
      env_specialist: [
        {
          id: 'es_water_treatment_lock',
          label: 'Lock Sewage Bypass Valves',
          desc: 'Prevent untreated effluent overflows caused by loss of pump stations.',
          effects: { safety: +10, infrastructure: +10, resources: -5 }
        },
        {
          id: 'es_cooler_recirculation',
          label: 'Purge Substation Coolant Tanks',
          desc: 'Prevent flammable dielectric mineral oil spills into the storm drains.',
          effects: { infrastructure: +14, safety: +6, resources: -6 }
        }
      ],
      intel_analyst: [
        {
          id: 'ia_overload_model',
          label: 'Compute Transformer Heatmap',
          desc: 'Identify remaining weak links before additional transformers blow.',
          effects: { infrastructure: +15, integrity: +10, resources: -3 }
        },
        {
          id: 'ia_prioritize_dispatch',
          label: 'Coordinate Multi-Sector Response',
          desc: 'Optimize response routes for all active team emergency units.',
          effects: { safety: +12, integrity: +8, resources: -3 }
        }
      ],
      city_admin: [
        {
          id: 'ca_federal_grid_aid',
          label: 'Authorize Interstate Power Draw',
          desc: 'Petition neighboring energy grid operators for emergency power tap.',
          effects: { infrastructure: +18, resources: -15 }
        },
        {
          id: 'ca_emergency_broadcast',
          label: 'Executive Calm Broadcast',
          desc: 'Address the city via emergency radio to prevent mass panic.',
          effects: { integrity: +20, safety: +6, resources: -4 }
        }
      ]
    }
  },
  {
    id: 'crisis_2',
    round: 2,
    title: 'Operation Toxic Surge: Chemical Plume Drift',
    subtitle: 'Sabotage at North River Chemical Complex releases hazardous chlorine & phosgene vapor toward downtown.',
    severity: 'CRITICAL (Tier 3)',
    timerSeconds: 40,
    baseThreat: {
      integrity: -15,
      safety: -30,
      infrastructure: -10,
      resources: -15
    },
    threatDescription: 'Vapor cloud is drifting with prevailing winds at 18 km/h. Estimated 120,000 residents in direct fallout trajectory.',
    novaAdvisory: 'NOVA Alert: Atmospheric inversion is keeping toxic cloud close to ground level. Simultaneous evacuation corridor establishment and chemical neutralization are required.',
    actions: {
      safety_chief: [
        {
          id: 'sc_evac_zone_a',
          label: 'Order Downwind Sector Evacuation',
          desc: 'Order mass evacuation of residential zones 3 and 4 along Highway 9.',
          effects: { safety: +24, integrity: +5, resources: -10 }
        },
        {
          id: 'sc_shelter_in_place',
          label: 'Issue High-Rise Shelter-In-Place',
          desc: 'Direct upper-floor occupants to seal vents, windows, and HVAC units.',
          effects: { safety: +16, integrity: +12, resources: -4 }
        }
      ],
      infra_director: [
        {
          id: 'id_hvac_remote_shutdown',
          label: 'Remotely Trip Metro Ventilation',
          desc: 'Prevent toxic air from being sucked into subway stations and transit tunnels.',
          effects: { infrastructure: +12, safety: +16, resources: -6 }
        },
        {
          id: 'id_containment_berm',
          label: 'Activate Industrial Flood Walls',
          desc: 'Contain liquid runoff from entering the city freshwater reservoir.',
          effects: { infrastructure: +15, safety: +10, resources: -8 }
        }
      ],
      medical_lead: [
        {
          id: 'ml_antidote_dispatch',
          label: 'Distribute Atropine & Oxygen Kits',
          desc: 'Reroute stockpiled respiratory relief injectors to field aid stations.',
          effects: { safety: +26, resources: -14 }
        },
        {
          id: 'ml_decon_tents',
          label: 'Erect Mass Decontamination Tents',
          desc: 'Clean affected civilians and emergency responders before hospital admission.',
          effects: { safety: +18, integrity: +8, resources: -8 }
        }
      ],
      cyber_officer: [
        {
          id: 'co_cell_broadcast',
          label: 'Emergency Alert Geo-Fence',
          desc: 'Push urgent siren alerts to all mobile phones in the danger perimeter.',
          effects: { safety: +18, integrity: +10, resources: -4 }
        },
        {
          id: 'co_override_plant_valves',
          label: 'Remote SCADA Valve Lockdown',
          desc: 'Hack through saboteurs locked terminal to remotely seal the remaining chemical tanks.',
          effects: { safety: +15, infrastructure: +12, resources: -6 }
        }
      ],
      logistics_coordinator: [
        {
          id: 'lc_mask_airdrop',
          label: 'Drone Airdrop of P100 Respirators',
          desc: 'Deliver tens of thousands of gas masks into trapped evacuation choke-points.',
          effects: { safety: +20, resources: -12 }
        },
        {
          id: 'lc_bus_fleet',
          label: 'Mobilize Municipal Bus Fleet',
          desc: 'Transport mobility-impaired residents out of the toxic wind plume.',
          effects: { safety: +18, integrity: +6, resources: -8 }
        }
      ],
      env_specialist: [
        {
          id: 'es_chemical_fogging',
          label: 'Deploy Ammonia Scrubbing Spray',
          desc: 'Fire aerial neutralizing aerosol clouds to precipitate the toxic gas out of the atmosphere.',
          effects: { safety: +28, resources: -15 }
        },
        {
          id: 'es_sensor_perimeter',
          label: 'Establish Real-Time Gas Monitored Zone',
          desc: 'Map shifting gas boundaries to prevent evacuations into dangerous eddies.',
          effects: { safety: +14, integrity: +10, resources: -5 }
        }
      ],
      intel_analyst: [
        {
          id: 'ia_plume_trajectory',
          label: 'Wind Vector Dispersion Model',
          desc: 'Calculate exact time-to-impact for each neighborhood with weather radar.',
          effects: { safety: +18, integrity: +8, resources: -3 }
        },
        {
          id: 'ia_saboteur_profile',
          label: 'Trace Remote Sabotage Point',
          desc: 'Identify if secondary explosions are rigged at neighboring chemical refineries.',
          effects: { integrity: +14, infrastructure: +10, resources: -4 }
        }
      ],
      city_admin: [
        {
          id: 'ca_hazmat_fund',
          label: 'Release Catastrophe Reserve Fund',
          desc: 'Guarantee instantaneous compensation and unlimited supply authorization.',
          effects: { resources: +25, integrity: +10, safety: +5 }
        },
        {
          id: 'ca_national_guard_call',
          label: 'Mobilize National Guard CBRN Units',
          desc: 'Request state hazmat specialists and armored containment vehicles.',
          effects: { safety: +20, integrity: +12, resources: -15 }
        }
      ]
    }
  },
  {
    id: 'crisis_3',
    round: 3,
    title: 'Operation Deep Breach: Transit Inundation & Sinkholes',
    subtitle: 'Flash storm surge combined with sea-wall crack inundates underground transit tunnels.',
    severity: 'SEVERE (Tier 3)',
    timerSeconds: 40,
    baseThreat: {
      integrity: -20,
      safety: -20,
      infrastructure: -30,
      resources: -10
    },
    threatDescription: 'Metro lines 1 and 3 are filling rapidly with saltwater. High-rise skyscraper foundations above the line show vibration warning.',
    novaAdvisory: 'NOVA Sensor Feed: 80,000 gallons per minute entering tunnel network. Critical risk of subterranean collapse beneath downtown core. Structural bulkheads must be sealed immediately.',
    actions: {
      safety_chief: [
        {
          id: 'sc_subway_evac',
          label: 'Subway Station Evacuation Sweep',
          desc: 'Rapidly guide stranded subway commuters up through emergency shafts.',
          effects: { safety: +22, integrity: +8, resources: -8 }
        },
        {
          id: 'sc_cordon_sinkholes',
          label: 'Cordon Street-Level Cave-In Zones',
          desc: 'Barricade collapsing asphalt and reroute above-ground traffic.',
          effects: { safety: +14, integrity: +10, resources: -5 }
        }
      ],
      infra_director: [
        {
          id: 'id_seal_bulkhead',
          label: 'Slam Flood Bulkhead Doors',
          desc: 'Sacrifice lower maintenance shafts to protect main transit arteries and building pilings.',
          effects: { infrastructure: +28, resources: -10 }
        },
        {
          id: 'id_high_capacity_pumps',
          label: 'Power On Industrial Turbopumps',
          desc: 'Pump out millions of gallons into diversionary retention basins.',
          effects: { infrastructure: +20, safety: +8, resources: -12 }
        }
      ],
      medical_lead: [
        {
          id: 'ml_hypothermia_units',
          label: 'Deploy Water Rescue & Hypothermia Kits',
          desc: 'Stabilize submerged commuters suffering from hypothermia and trauma.',
          effects: { safety: +20, integrity: +5, resources: -8 }
        },
        {
          id: 'ml_diver_medics',
          label: 'Deploy SCUBA Search & Rescue',
          desc: 'Extract civilians trapped inside submerged train cabins.',
          effects: { safety: +22, resources: -10 }
        }
      ],
      cyber_officer: [
        {
          id: 'co_traction_power_cut',
          label: 'Emergency 750V Third-Rail Cutoff',
          desc: 'De-energize railway third-rails across flooded zones to prevent mass electrocution.',
          effects: { safety: +18, infrastructure: +12, resources: -4 }
        },
        {
          id: 'co_drain_telemetry',
          label: 'Optimize Storm Gate Automation',
          desc: 'Synchronize stormwater gates with real-time hydraulic pressure data.',
          effects: { infrastructure: +16, resources: -5 }
        }
      ],
      logistics_coordinator: [
        {
          id: 'lc_sandbag_brigade',
          label: 'Mobilize Automated Sandbag Delivery',
          desc: 'Form continuous barrier around subway portal entrances and utility vaults.',
          effects: { infrastructure: +18, safety: +8, resources: -10 }
        },
        {
          id: 'lc_heavy_cranes',
          label: 'Contract Heavy Shoring Cranes',
          desc: 'Stabilize foundation of tilting 40-story office tower above tunnel breach.',
          effects: { infrastructure: +20, integrity: +10, resources: -14 }
        }
      ],
      env_specialist: [
        {
          id: 'es_retention_divert',
          label: 'Divert Water to Urban Wetlands',
          desc: 'Open floodway channels into designated ecological marshlands.',
          effects: { infrastructure: +16, safety: +10, resources: -6 }
        },
        {
          id: 'es_prevent_soil_liquefaction',
          label: 'Inject Polyurethane Grout',
          desc: 'Stabilize water-saturated silt around railway tunnels.',
          effects: { infrastructure: +22, resources: -12 }
        }
      ],
      intel_analyst: [
        {
          id: 'ia_seismic_scan',
          label: 'Subterranean Ground-Penetrating Radar',
          desc: 'Detect hidden voids before roads collapse under emergency responders.',
          effects: { safety: +16, infrastructure: +12, resources: -4 }
        },
        {
          id: 'ia_water_flow_opt',
          label: 'Hydraulic Influx Simulation',
          desc: 'Guide pump operations to highest-stress drainage junctions.',
          effects: { infrastructure: +18, resources: -3 }
        }
      ],
      city_admin: [
        {
          id: 'ca_corps_of_engineers',
          label: 'Deploy Army Corps of Engineers',
          desc: 'Bring in military combat engineering pontoons and mega-pumps.',
          effects: { infrastructure: +24, safety: +8, resources: -16 }
        },
        {
          id: 'ca_requisition_private_docks',
          label: 'Requisition Private Marine Barges',
          desc: 'Form seawall breakwater using loaded cargo barges.',
          effects: { infrastructure: +18, integrity: +10, resources: -12 }
        }
      ]
    }
  },
  {
    id: 'crisis_4',
    round: 4,
    title: 'Operation Rogue Protocol: Coordinated Cyber-Physical Strike',
    subtitle: 'Hostile malware infiltrates municipal smart-city core, weaponizing physical automation systems.',
    severity: 'CATASTROPHIC (Tier 4 - Final Crisis)',
    timerSeconds: 45,
    baseThreat: {
      integrity: -30,
      safety: -25,
      infrastructure: -25,
      resources: -15
    },
    threatDescription: 'Traffic signals set to green in all directions, automated reservoir gates opening, emergency 911 lines flooded with bot calls.',
    novaAdvisory: 'NOVA Emergency Alert: Intrusive threat actor attempting to seize root access of city life-support telemetry! Total team coordination mandatory: isolate networks while preventing municipal collapse!',
    actions: {
      safety_chief: [
        {
          id: 'sc_manual_intersections',
          label: 'Switch Key Corridors to Manual Control',
          desc: 'Position physical officers with flare guns and whistles at main transit choke points.',
          effects: { safety: +20, integrity: +12, resources: -8 }
        },
        {
          id: 'sc_defend_data_center',
          label: 'Physical Guard on Server Facilities',
          desc: 'Prevent physical saboteurs from cutting municipal fiber optic trunks.',
          effects: { integrity: +22, infrastructure: +10, resources: -6 }
        }
      ],
      infra_director: [
        {
          id: 'id_airgap_grid',
          label: 'Hard-Switch Airgap on Municipal Grid',
          desc: 'Physically sever network links to utility transformers, switching to local analog controls.',
          effects: { infrastructure: +26, integrity: +10, resources: -10 }
        },
        {
          id: 'id_manual_dam_gates',
          label: 'Deploy Manual Crews to Reservoir Gates',
          desc: 'Hand-crank water gates shut before artificial deluge floods lower wards.',
          effects: { safety: +16, infrastructure: +16, resources: -8 }
        }
      ],
      medical_lead: [
        {
          id: 'ml_hospital_airgap',
          label: 'Quarantine Hospital Information Systems',
          desc: 'Isolate life-support equipment from city intranet to block ransomware locking.',
          effects: { safety: +24, integrity: +12, resources: -8 }
        },
        {
          id: 'ml_emergency_blood_convoy',
          label: 'Armed Blood & Plasma Transports',
          desc: 'Deliver blood supplies through jammed city without digital routing.',
          effects: { safety: +18, resources: -10 }
        }
      ],
      cyber_officer: [
        {
          id: 'co_counter_intrusion',
          label: 'Deploy NOVA Zero-Day Countermeasure',
          desc: 'Inoculate city nodes with adaptive honeypot script to trap adversary exploit.',
          effects: { infrastructure: +25, integrity: +20, resources: -12 }
        },
        {
          id: 'co_restore_911',
          label: 'Purge 911 DDoS Traffic',
          desc: 'Filter automated bot calls using heuristic packet filtering to clear civilian emergency calls.',
          effects: { safety: +20, integrity: +14, resources: -6 }
        }
      ],
      logistics_coordinator: [
        {
          id: 'lc_analog_couriers',
          label: 'Establish Motorcycle Courier Relay',
          desc: 'Deploy high-speed physical couriers with hand-signed emergency orders.',
          effects: { integrity: +18, safety: +10, resources: -6 }
        },
        {
          id: 'lc_fuel_reserves',
          label: 'Open Strategic Municipal Fuel Reserves',
          desc: 'Supply emergency fleets blocked by hacked electronic gas pumps.',
          effects: { resources: +22, infrastructure: +12 }
        }
      ],
      env_specialist: [
        {
          id: 'es_fail_safe_industrial',
          label: 'Trip Mechanical Plant Failsafes',
          desc: 'Physically trigger burst disks and pressure relief valves before hacked boilers explode.',
          effects: { safety: +20, infrastructure: +15, resources: -8 }
        },
        {
          id: 'es_water_purity_safeguard',
          label: 'Lock Fluoride & Chlorine Injectors',
          desc: 'Prevent compromised digital dosing units from over-chlorinating city drinking water.',
          effects: { safety: +24, resources: -6 }
        }
      ],
      intel_analyst: [
        {
          id: 'ia_trace_malware_c2',
          label: 'Triangulate Adversary Command Server',
          desc: 'Provide exact server IP coordinates to Cyber team and federal authorities.',
          effects: { integrity: +20, infrastructure: +14, resources: -4 }
        },
        {
          id: 'ia_vulnerability_patch',
          label: 'Map Vulnerable Municipal Endpoints',
          desc: 'Predict adversary next target to pre-emptively shut down compromised ports.',
          effects: { infrastructure: +18, safety: +10, resources: -4 }
        }
      ],
      city_admin: [
        {
          id: 'ca_martial_law',
          label: 'Declare Total Municipal Emergency',
          desc: 'Assume direct authority over private telecommunications and broadcast channels.',
          effects: { integrity: +24, resources: +15, safety: -5 }
        },
        {
          id: 'ca_full_federal_intervene',
          label: 'Invoke Presidential Cyber Disaster Decree',
          desc: 'Request instantaneous deployment of USCYBERCOM & federal incident teams.',
          effects: { infrastructure: +22, safety: +15, resources: -15 }
        }
      ]
    }
  }
];

// General fallback actions available to ANY player regardless of role (or if players need backup choices)
const GENERAL_ACTIONS = [
  {
    id: 'gen_emergency_broadcast',
    label: 'Issue Citizen Caution Advisory',
    desc: 'Broadcast emergency guidelines across public frequency bands.',
    effects: { safety: +6, integrity: +5, resources: -2 }
  },
  {
    id: 'gen_resource_reallocate',
    label: 'Reallocate Tactical Fuel & Supplies',
    desc: 'Draw down emergency stockpiles to reinforce ongoing response operations.',
    effects: { resources: +12, integrity: -2 }
  },
  {
    id: 'gen_field_reinforce',
    label: 'Coordinate Auxiliary Volunteers',
    desc: 'Mobilize citizen volunteer corps for shelter support and rubble clearance.',
    effects: { safety: +8, integrity: +4, resources: -4 }
  }
];

module.exports = {
  ROLES,
  CRISES,
  GENERAL_ACTIONS
};

