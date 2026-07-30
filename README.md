# BoRa: Real-Time Software Defogging & Threat Detection System

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Object%20Detection-00FFFF.svg)](https://github.com/ultralytics/ultralytics)
[![OpenCV](https://img.shields.io/badge/OpenCV-Image%20Processing-green.svg)](https://opencv.org/)

> **BoRa** is a pure software solution designed to enhance driver visibility in severe weather conditions (fog, smog, haze) using existing vehicle camera hardware without requiring additional sensors.

---

## Project Overview

Driving in heavy fog severely limits visibility, significantly increasing accident risks. **BoRa** processes real-time video feeds from a vehicle's standard front-facing camera, applying image restoration techniques to eliminate fog-induced scattering, correct color distortion, and boost contrast. 

By restoring visual clarity before a threat escalates, BoRa empowers drivers to make proactive, informed driving decisions rather than relying solely on reactive alerts.

---

## Background & Motivation

The project was inspired by a personal incident involving team member **Jun-young Kim**, who was struck by a vehicle while riding a skateboard on a heavily foggy day. The driver’s visibility was severely restricted, preventing them from detecting him in time.

* **High Mortality Rates:** According to the Korea Expressway Corporation, traffic accident fatality rates on foggy days are **more than 3 times higher** than on clear days.
* **Accessibility Gap:** Advanced 3D perception hardware like LiDAR remains expensive ($500–$700 per unit in 2024), leaving over **90% of in-operation global vehicles** without advanced environmental sensing.
* **The Solution:** BoRa targets this safety blind spot by delivering software-level enhancement on legacy camera hardware.

---

## Key Differentiators

| Feature | Conventional Systems (LiDAR / Radar ADAS) | **BoRa (Software Solution)** |
| :--- | :--- | :--- |
| **Hardware Cost** | High ($500–$700+ per sensor) | **$0** (Uses built-in OEM camera) |
| **Approach** | **Reactive:** Triggers alerts or AEB after a threat is detected | **Proactive:** Restores driver vision before hazards escalate |
| **Target Vehicles** | High-end / Modern Vehicles | **All vehicles with a camera (~90%+ market fit)** |
| **Driver Experience** | Sudden braking/chimes (High stress) | Visual clarity & lower cognitive load |

---

## Architecture & System Pipeline

BoRa utilizes a dynamic execution pipeline to save computational overhead when weather conditions are normal.
