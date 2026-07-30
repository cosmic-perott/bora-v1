# BoRa  #
<img width="326" height="114" alt="Screenshot 2026-05-22 at 11 25 54 PM" src="https://github.com/user-attachments/assets/f27c4414-db8f-456d-9322-dbbb07f98da5" />


![](https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=python&logoColor=white) ![](https://img.shields.io/badge/YOLOv8-002244?style=for-the-badge&logo=ultralytics&logoColor=white) ![](https://img.shields.io/badge/ROBOFLOW-6706FF?style=for-the-badge&logo=roboflow&logoColor=white) ![](https://img.shields.io/badge/RASPBERRY%20PI-A22846?style=for-the-badge&logo=raspberrypi&logoColor=white)

***all code, architecture, documentation, writing, ideas made by cosmic-perott, fay-dot1, jychoi27 for 8th Korea Code Fair.***
Here is the translation and refinement of your project documentation into professional, clear English.

Development Purpose
BoRa is a software solution designed to process real-time video feeds from a vehicle's built-in front-facing camera. It restores clear forward vision for drivers operating under severe visibility-reducing weather conditions, such as fog, smog, and haze. By correcting color distortion and low contrast caused by foggy environments, BoRa operates purely as a software solution utilizing existing vehicular camera hardware—requiring no additional equipment.

Background & Motivation
The project was inspired by a personal incident involving team member Jun-young Kim. While riding a skateboard on a heavily foggy day, he was hit by an oncoming vehicle. The driver’s visibility was severely impaired by the dense fog, making it impossible to detect him in time. This accident demonstrated firsthand that fog-induced visibility degradation is a life-or-death issue on the road.

Fog occurs when microscopic water droplets in the atmosphere scatter and absorb light, significantly degrading visual perception for both human eyes and cameras. During early mornings or seasonal temperature inversions, visibility often drops to less than a few dozen meters. Under these conditions, drivers must rely solely on headlights, drastically delaying their reaction time to pedestrians, two-wheeled vehicles, and stationary obstacles.

From a road safety perspective, fog poses a severe threat. According to statistics from the Korea Expressway Corporation, the fatality rate for traffic accidents on foggy days is more than three times higher than on clear days.

Given how weather conditions directly impair human judgment, real-time software-based defogging serves as a practical, accessible solution to provide drivers with clear, actionable vision when they need it most.

Competitive Analysis & Differentiation
Modern automotive safety technologies have evolved primarily along two tracks: LiDAR/Radar-based perception systems and Camera-based ADAS (Advanced Driver Assistance Systems).

1. LiDAR / Radar Systems vs. BoRa
LiDAR and Radar emit electromagnetic waves to map surroundings in 3D, enabling capabilities like pedestrian detection, Automatic Emergency Braking (AEB), and Adaptive Cruise Control (ACC). However, they rely on expensive hardware additions. As of 2024, a single LiDAR sensor costs between $500 and $700 (USD), posing a structural cost barrier for mass-market vehicles.

Global Automotive Safety Equipment Gap (2024 Context)
Total Global Passenger Cars in Operation: ~1.45 Billion (IEA / ACEA estimates)

ADAS Penetration in New Vehicle Sales (L1+): ~68.6% (ResearchAndMarkets)

New Vehicles Without ADAS: ~31.4% (~27 Million units/year)

Total In-Operation Vehicles with ADAS: Less than 10% (Canalys)

Total In-Operation Vehicles with LiDAR: Negligible (Tens of thousands globally)

Over 90% of active vehicles worldwide lack LiDAR or Radar sensors. While ADAS integration in new vehicles is growing rapidly, the global average vehicle age exceeds 12 years, meaning it will take decades for legacy fleets to acquire advanced hardware safety features. This massive "safety blind spot" represents BoRa's target market.

2. Proactive Vision Restoration vs. Reactive Warnings
The fundamental difference between existing systems and BoRa lies in their approach to safety:

Existing Systems (Reactive): Trigger warnings or initiate automatic braking only after an obstacle or threat is detected in the path of travel. They intervene late in the danger cycle.

BoRa (Proactive & Preventive): Restores visual clarity before a threat escalates, enabling drivers to perceive their surroundings independently.

By clarifying a foggy video feed, BoRa allows drivers to identify distant pedestrians, shoulder obstacles, or oncoming traffic earlier. This grants drivers the time needed to make proactive decisions—such as reducing speed or changing lanes safely.

Furthermore, driving in fog creates psychological stress due to environmental uncertainty. BoRa mitigates driver fatigue and anxiety by restoring visual context, fostering a calmer, more focused driving environment. Unlike abrupt warning alerts or sudden automatic braking, which can startle the driver, BoRa reduces cognitive load to enhance human decision-making.

Development Pipeline & Implementation
[ Camera Input (Every 0.3s) ]
            │
            ▼
[ Random Forest Classifier ] ──(No Fog Detected)──► [ Skip Processing ]
            │                                             │
      (Fog Detected)                                      │
            │                                             │
            ▼                                             ▼
[ Custom Enhancement Pipeline ]                     (Save Compute)
  ├── CLAHE (Color Correction)
  ├── DCP (Scattering Removal)
  └── Sobel Filter (Sharpening)
            │
            ▼
[ YOLOv8 Object Detection ]
  ├── Detect Vehicles
  └── Detect Tail Lights
            │
            ▼
[ Matrix Matching ] ──► (Associate Tail Lights to Vehicles)
            │
            ▼
[ ByteTrack & Signal Analysis ]
  ├── Track Vehicle Trajectories
  └── Analyze Tail Light Signals (Deceleration / Blinking)
            │
            ▼
[ Threat Assessment & Driver Warning ]
System Workflow
Frame Capture: The system captures video frames from the front camera at 0.3-second intervals.

Fog Detection Gate: A Random Forest Classifier evaluates whether fog is present. If no fog is detected, subsequent processing is bypassed to preserve computational resources and minimize latency.

Custom Image Enhancement Pipeline: When fog is present, the frame passes through a three-stage enhancement sequence:

CLAHE (Contrast Limited Adaptive Histogram Equalization) for color and contrast correction.

DCP (Dark Channel Prior) algorithm to remove light scattering effects.

Sobel Operator to sharpen edges and restore fine details.

Object Detection: The enhanced image is fed into a YOLOv8 model to detect front vehicles and their corresponding tail lights.

Entity Association: Using matrix calculations, detected tail lights are mapped to their parent vehicles to evaluate individual vehicle states.

Tracking & Behavior Prediction: ByteTrack tracks vehicle movement vectors over time, while tail-light signal processing evaluates potential hazards (e.g., sudden braking or cut-ins).

Hazard Alert: If a vehicle is categorized as an active threat, the system immediately alerts the driver. The cycle repeats until terminated by the user.

Development Timeline
March 30: Developed the initial prototype for the defogging algorithm.

April 5: Built a Random Forest Classifier to detect fog presence in input frames, reducing idle latency and unnecessary processing.

April 14: Designed and optimized the complete enhancement pipeline combining CLAHE, DCP, and Sobel Filtering.

April 17: System integration and pipeline benchmarking.

April 20: Built and trained a vehicle detection model using YOLOv8 (trained on 200 automotive images).

April 21: Built and trained a tail-light detection model using YOLOv8 (trained on 150 tail-light images).

May 2: Integrated ByteTrack to predict vehicle trajectories and developed a tail-light signal interpreter to evaluate vehicle behavior.

May 22: Implemented the real-time driver alert module for detected road hazards.

<img width="524" height="519" alt="Screenshot 2026-05-20 at 1 58 42 PM" src="https://github.com/user-attachments/assets/15d374f4-4d60-4308-a668-0a88b91f34fa" />
  
  
