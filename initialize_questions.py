#!/usr/bin/env python3
"""
Initialize Question Data for Data Annotation Website

This script creates sample question data files for the Material Science
and Chemistry domains. Run this script to set up the initial data for
the Python backend.
"""

import os
import json

# Create data directory
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# Sample Chemistry questions
chemistry_questions = {
    "questions": [
        {
            "id": "chem-q1",
            "text": "Explain the concept of electronegativity and its importance in chemical bonding.",
            "answers": [
                {
                    "id": "chem-q1-a1",
                    "text": "Electronegativity is a measure of an atom's ability to attract shared electrons in a chemical bond. Higher electronegativity values indicate a stronger attraction for electrons. The difference in electronegativity between atoms determines the type of bond formed: covalent (small difference), polar covalent (moderate difference), or ionic (large difference). This concept is crucial for predicting molecular properties, reactivity, and behavior in various chemical environments."
                },
                {
                    "id": "chem-q1-a2",
                    "text": "Electronegativity refers to how strongly atoms pull electrons toward themselves in a bond. Elements like fluorine and oxygen have high electronegativity, while metals like sodium have low values. When atoms with different electronegativities bond, electrons aren't shared equally, creating polar molecules with partial charges. This affects everything from solubility to reaction mechanisms."
                },
                {
                    "id": "chem-q1-a3",
                    "text": "Electronegativity is the tendency of an atom to attract electrons in a chemical bond. It increases across periods and decreases down groups in the periodic table. The concept helps explain why some compounds dissolve in water, why certain reactions occur, and how molecules interact with each other. Without understanding electronegativity, it would be impossible to predict the properties of most compounds."
                }
            ]
        },
        {
            "id": "chem-q2",
            "text": "Describe the properties of noble gases and explain their low reactivity.",
            "answers": [
                {
                    "id": "chem-q2-a1",
                    "text": "Noble gases (Group 18 elements) are characterized by their complete valence electron shells, which grants them exceptional stability. This electronic configuration makes them extremely unreactive as they have little tendency to gain, lose, or share electrons. They exist as monatomic gases with low melting and boiling points, and have applications in lighting, cryogenics, and as inert atmospheres for chemical reactions."
                },
                {
                    "id": "chem-q2-a2",
                    "text": "Noble gases exhibit low reactivity due to their full valence shells. Elements like helium, neon, and argon have achieved the stable octet configuration (or duet for helium), giving them little incentive to form bonds. Their inertness makes them useful for applications requiring non-reactive environments, though compounds of heavier noble gases (Kr, Xe) can be formed under extreme conditions with highly electronegative elements like fluorine."
                },
                {
                    "id": "chem-q2-a3",
                    "text": "The low reactivity of noble gases stems from their electronic configuration, which consists of a completely filled outer shell of electrons. This arrangement is energetically favorable and stable, meaning these elements have little driving force to participate in chemical reactions. Their stability follows the octet rule, where atoms tend to gain, lose, or share electrons to achieve eight electrons in their valence shell (two for helium)."
                }
            ]
        },
        {
            "id": "chem-q3",
            "text": "Compare and contrast ionic, covalent, and metallic bonding.",
            "answers": [
                {
                    "id": "chem-q3-a1",
                    "text": "Ionic bonding involves electron transfer between atoms with large electronegativity differences, creating oppositely charged ions held together by electrostatic forces. Covalent bonding involves electron sharing between atoms with similar electronegativities, forming discrete molecules with directional bonds. Metallic bonding occurs between metal atoms, where valence electrons are delocalized in a 'sea' that moves freely among positive metal ion cores. These different bonding types explain why ionic compounds are typically brittle with high melting points, covalent compounds form discrete molecules with lower melting points, and metals are malleable and good conductors."
                },
                {
                    "id": "chem-q3-a2",
                    "text": "The three primary chemical bonds differ in electron behavior. In ionic bonds, electrons are transferred from a metal to a nonmetal, creating charged ions attracted by electrostatic forces; these compounds are typically crystalline solids that conduct electricity when molten or dissolved. Covalent bonds share electrons between atoms of similar electronegativity, forming molecules with specific shapes; these compounds often have lower melting points and don't typically conduct electricity. Metallic bonds feature a lattice of positive ions surrounded by delocalized electrons, explaining properties like electrical conductivity, malleability, and ductility unique to metals."
                },
                {
                    "id": "chem-q3-a3",
                    "text": "Chemical bonding varies based on how electrons interact between atoms. Ionic bonding results from electron transfer, creating oppositely charged ions arranged in crystal lattices. Ionic compounds are hard but brittle and conduct electricity when molten or in solution. Covalent bonding involves electron sharing, forming discrete molecules with specific geometries and typically lower melting points. Metallic bonding consists of metal cations in a 'sea' of delocalized electrons, explaining properties like malleability, ductility, and high electrical conductivity. Each bonding type represents a different way atoms achieve stability through electron configuration."
                }
            ]
        }
    ]
}

# Sample Material Science questions
material_science_questions = {
    "questions": [
        {
            "id": "mat-q1",
            "text": "Describe the relationship between crystal structure and mechanical properties in metals.",
            "answers": [
                {
                    "id": "mat-q1-a1",
                    "text": "Crystal structure directly influences mechanical properties through atomic packing and slip systems. FCC metals (like aluminum) have high ductility due to numerous slip systems, while HCP metals (like titanium) are stronger but less ductile with fewer slip systems. BCC metals (like iron) offer a balance. Grain size also matters—smaller grains increase strength through the Hall-Petch relationship. Dislocations, point defects, and grain boundaries all contribute to determining a metal's strength, hardness, and ductility."
                },
                {
                    "id": "mat-q1-a2",
                    "text": "The mechanical properties of metals are fundamentally determined by their crystal structure. Different arrangements (BCC, FCC, HCP) create varying degrees of atomic packing and available slip planes, which dictate how easily dislocations move when stress is applied. These factors determine whether a metal will be brittle or ductile, and how much force it can withstand before deforming or fracturing."
                },
                {
                    "id": "mat-q1-a3",
                    "text": "Crystal structures in metals establish how atoms are arranged and bonded, directly affecting mechanical behavior. The number and orientation of slip systems, which are determined by crystal structure, control deformation mechanisms. Additionally, grain boundaries serve as obstacles to dislocation movement, increasing strength but potentially reducing ductility. These structural features explain why some metals can be easily shaped while others resist deformation."
                }
            ]
        },
        {
            "id": "mat-q2",
            "text": "Explain the principles of composite materials and their advantages over traditional materials.",
            "answers": [
                {
                    "id": "mat-q2-a1",
                    "text": "Composite materials combine two or more materials with different properties to create a system with characteristics superior to its individual components. They typically consist of a matrix (continuous phase) and reinforcement (dispersed phase). This combination allows for exceptional strength-to-weight ratios, customizable properties, and improved performance. Unlike traditional materials, composites can be designed for specific applications by varying composition, orientation, and fabrication methods."
                },
                {
                    "id": "mat-q2-a2",
                    "text": "Composites exploit the principle that properties of the whole exceed those of individual components. By combining materials strategically, engineers can achieve superior strength, stiffness, weight reduction, and durability. For example, carbon fiber reinforced polymers offer exceptional strength while being significantly lighter than steel. Additionally, composites can be tailored for specific directional properties (anisotropy) and often show better fatigue and corrosion resistance."
                },
                {
                    "id": "mat-q2-a3",
                    "text": "Composite materials represent a design philosophy where multiple materials work together to overcome the limitations of conventional monolithic materials. The matrix provides shape and protects the reinforcement, while the reinforcement bears load. This synergistic relationship creates materials with exceptional strength-to-weight ratios, fatigue resistance, and design flexibility. Unlike metals or ceramics, composites can be engineered with anisotropic properties to meet specific loading conditions, making them ideal for aerospace, automotive, and sporting applications."
                }
            ]
        },
        {
            "id": "mat-q3",
            "text": "Discuss the importance of phase diagrams in materials processing and design.",
            "answers": [
                {
                    "id": "mat-q3-a1",
                    "text": "Phase diagrams are graphical representations of the thermodynamic relationships between temperature, pressure, and composition that govern material systems. They serve as roadmaps for materials processing by revealing stable phase regions, transformation temperatures, and solubility limits. Engineers use phase diagrams to design heat treatments, predict microstructures, control solidification processes, and develop alloy compositions. Without these diagrams, materials processing would be largely trial-and-error instead of the precise science it is today."
                },
                {
                    "id": "mat-q3-a2",
                    "text": "Phase diagrams are essential tools in materials science that map the conditions under which different phases exist in equilibrium. By understanding these diagrams, engineers can manipulate microstructures through processes like heat treatment, predict how materials will behave during manufacturing, and design new alloys with specific properties. Phase diagrams also help troubleshoot processing issues by identifying potential phase transformations that might occur during fabrication."
                },
                {
                    "id": "mat-q3-a3",
                    "text": "In materials processing and design, phase diagrams provide critical information about how temperature and composition affect material structure. They illustrate equilibrium relationships between phases, showing engineers where phase transformations will occur and what microstructures will develop. This knowledge enables the design of precise thermal processing routes, development of new alloy systems, and prediction of material behavior under various conditions. Master alloys, precipitation hardening, eutectic structures, and controlled solidification all rely on the fundamental insights provided by phase diagrams."
                }
            ]
        }
    ]
}

# Write to JSON files
with open(os.path.join(DATA_DIR, 'chemistry-questions.json'), 'w') as f:
    json.dump(chemistry_questions, f, indent=2)

with open(os.path.join(DATA_DIR, 'material-science-questions.json'), 'w') as f:
    json.dump(material_science_questions, f, indent=2)

print("Question data files have been created in the 'data' directory.")