# IoT learning roadmap — from CS/AI student to "can defend this build"

You and Amru are AI-specialisation students. You have never taken an IoT or embedded course. That is
fine — but it changes what "learning IoT" means for this project.

**The target is not "become an embedded engineer".** The target is: by week 8 you can explain every
design decision in BagSense, run the experiment yourself, and answer an examiner's question without
guessing. That is roughly **38 hours of study**, not a semester.

Assumptions (correct me and I will re-pace):
- Framework: **ESP-IDF + FreeRTOS**. Arduino would be faster to start but you would not learn the sleep
  and interrupt model you need for the power objective, and the examiner will ask about it.
- Hours are per person, and the split is by discipline: Adam takes layers 0–2 (electronics, firmware,
  RFID), Amru takes 0, 3–4 (power, BLE/app). Both do layer 5.
- Everything here fits inside weeks 5–7 plus the semester break.

---

## The map

```
Lapis 0  Electronics survival kit         4 h    both      week 5
Lapis 1  ESP32-S3 + FreeRTOS             10 h    both      week 6
Lapis 2  UHF RFID                        12 h    Adam      week 7
Lapis 3  Power and measurement            6 h    Amru      week 7
Lapis 4  BLE + Flutter                    6 h    Amru      week 9
Lapis 5  Experiment methodology          ongoing  both     weeks 8-11
                                      ----
                                       38 h
```

Each layer below has three things: what to learn, **the proof you learned it** (a thing you can show,
not a feeling), and where it connects to the schedule you already have.

---

## Lapis 0 — Electronics survival kit (4 h, both, week 5)

You do not need circuit theory. You need to stop burning modules and to read a datasheet correctly.

- Voltage, current, power; why 5 V and 3.3 V coexist and where a level shifter is mandatory.
- Peak vs average current: a module that "draws 200 mA" may pull 900 mA for 40 ms and brown out the MCU.
- Decoupling: a 470–1000 µF capacitor across the reader's supply, and why.
- Battery arithmetic: mAh ÷ average mA = hours. Nothing else.
- How to read a pinout table and not confuse TX/RX.

**Proof:** a one-page calculation you write yourself — reader peak current, capacitor sizing, and the
average current implied by your intended duty cycle. Put it in `Week05/Output/`.
**Why it matters now:** this is the layer that prevents the classic failure of "the reader works alone
but reboots the ESP32 when it scans".

Read: Finkenzeller ch. 1 (skim), the YRM100 datasheet, and any ESP32-S3 pinout reference.

---

## Lapis 1 — ESP32-S3 and FreeRTOS (10 h, both, week 6)

Everything in your firmware is one of four things: a task, an interrupt, a sleep state, or a driver.

- Task, queue, semaphore, and why ISRs must be short (defer work to a task).
- `vTaskDelay` vs busy-wait; task priorities when one task talks to a slow peripheral.
- GPIO interrupt configuration and **debounce** — a mechanical zipper switch bounces.
- Deep sleep vs light sleep, wake sources, and what survives a reset (RTC memory).
- SPI (e-paper) and UART (reader) at the driver level, not the Arduino helper level.

**Proof:** two tasks, no blocking — task A blinks the LED and reads the Hall sensor, task B writes a
counter to the e-paper every 5 s. Run it for an hour; nothing starves.
**Gate link:** this is exactly the week-6 gate in your plan ("e-paper draws text, BLE link works").
**Read:** ESP-IDF Programming Guide → FreeRTOS (tasks, queues, ISR); *Mastering the FreeRTOS Real Time
Kernel* (free PDF) chapters 1–4; ESP32-S3 TRM chapter on low-power modes (in your folder).

---

## Lapis 2 — UHF RFID (12 h, Adam, week 7)

This is the layer that decides whether the project works, so it gets the most hours.

- The three tag memories (EPC, TID, user) and which one you actually read.
- The inventory round: Query → ACK → EPC, and what the Q parameter does.
- Why collisions happen and why frame-slotted Aloha is the answer (Klair 2010, cited in your references).
- Near field vs far field: coupling mechanism, why a loop behaves differently from a patch, why
  "read zone" is a volume rather than a distance (Nikitin 2007).
- RSSI: what it is good for (relative change) and what it is not (absolute distance).
- Tag orientation and material loading: metal and liquid detune a tag.

**Proof:** one tag read 100 times in open air with the success rate and per-read time logged to CSV;
then the same test with the tag inside the bag cavity. Two rows of numbers is enough.
**Gate link:** week-7 gate (≥95% single-tag read) and the week-8 pilot both depend on this layer.
**Read:** References_IoT.md cluster A and B; GS1 Gen2 spec sections on inventory; YRM100 command set.

---

## Lapis 3 — Power and measurement (6 h, Amru, week 7)

The 5-day claim is arithmetic, not endurance testing.

- Measure current in each state: deep sleep (µA), idle with radio on (mA), scanning (hundreds of mA).
- Duty cycle: events per day × seconds per scan = active seconds per day.
- Average current → hours → days. State the method in the report so the number is auditable.
- Li-Po safety: protection circuit, why you never test a bare cell, boost converter losses.

**Proof:** a table of three currents and one computed "days" figure with the formula shown.
**Gate link:** week-11 measurement ("every number traceable to a CSV or meter reading").
**Read:** Sabovic 2022 (how others frame energy constraints), ESP32-S3 sleep current figures from the
datasheet, TP4056 datasheet.

---

## Lapis 4 — BLE and Flutter (6 h, Amru, week 9)

You have written code before; this is a protocol and an API, not a new discipline.

- BLE roles (peripheral/central), advertising, connection interval.
- GATT: service, characteristic, read/write/notify — and why notify is the right choice for status.
- One characteristic carrying a small JSON or a packed struct.
- Flutter: `flutter_blue_plus` — scan, connect, subscribe, render.

**Proof:** the app receives a live status update from the bag within 2 s of a scan, without polling.
**Gate link:** week-9 integration gate.
**Read:** ESP-IDF GATT server example; flutter_blue_plus README.

---

## Lapis 5 — Experiment methodology (ongoing, both, weeks 8–11)

The part that actually loses marks when it is missing, because it is not technical — it is discipline.

- Define the independent variable (tag count, position, material, reader power) and hold the rest fixed.
- n = 20 trials per condition minimum; report median and max, not "usually works".
- Log to CSV at the moment of measurement, not from memory afterwards.
- Report failures with the same prominence as successes; the examiner can tell the difference.

**Proof:** the week-8 pilot CSV, with a header row, a condition column and a timestamp.
**Read:** the methods section of Hellström 2010 and Andrenko 2015 — not for content, for *how they write
up a measurement*.

---

## What NOT to learn (protect the calendar)

Deliberately excluded, because each one is a rabbit hole that does not change your deliverable:

- Antenna design theory (S-parameters, Smith charts, impedance matching). You buy an antenna; you test
  placement. Nikitin 2007 is enough to *understand* it.
- PCB design and fabrication. You use dev boards and jumper wires.
- Cloud platforms, MQTT, AWS IoT. BagSense is deliberately local-first.
- Machine learning on-device. TinyML (Sanchez-Iborra 2020) is cited for context; you are not training a
  model in FYP1.
- RTOS internals (scheduler source, tickless details). Use it, do not reimplement it.

---

## Three checkpoints (you should be able to answer these without notes)

**By end of week 6:**
1. Why does the reader need a separate 5 V rail and a big capacitor, and what happens without it?
2. What is the difference between an ISR and a task, and why is the zipper handler one and not the other?

**By end of week 8:**
3. Why is the antenna a loop and not a patch, and what does that change about where the read zone ends?
4. Why can a tag behind metal read as "missing" even when the item is present, and why is that not a bug?
5. If recall comes out at 88% instead of 98%, what do you say in the report?

If you can answer 1–5 out loud, in your own words, you are ready for the questions week 13 will ask.
If you cannot, the gap is specific and you know which layer to revisit — which is the entire point of
writing this down.
