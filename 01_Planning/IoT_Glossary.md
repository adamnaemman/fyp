# IoT glossary — the 32 terms you must be able to explain

Not for memorising definitions. For the moment an examiner says "explain what near-field means" and you
have eight seconds to answer. Each entry is one line plus, where it matters, why BagSense cares.

---

## RFID basics

**RFID** — identifying an object by radio, using a tag that carries an identity. No line of sight needed;
that is the whole reason it beats a barcode inside a closed bag.

**Passive tag** — no battery. It powers itself from the reader's field and replies by reflecting
(backscattering) that field. BagSense's whole cost argument rests on this.

**Active tag** — has its own battery and transmits. Longer range, but that is an AirTag with a battery
inside, which is exactly what this project avoids.

**UHF** — ultra-high frequency, roughly 860–960 MHz depending on region. Long range, cheap tags, sensitive
to metal and liquid. Malaysia: 919–923 MHz.

**HF / LF** — lower bands (13.56 MHz, 125 kHz). Short range, work near metal and water, used for access
cards and animal tags.

**Reader (interrogator)** — the powered device that generates the field and asks tags to identify. In
BagSense, the YRM100 module plus the ESP32 sending it commands.

**Antenna** — the structure that couples the reader to the field. In BagSense it is a loop inside the
cavity, not a plate radiating outward.

**EPC** — electronic product code: the identifier stored in a tag. This is the number your firmware
compares against the checklist.

**TID** — a factory-programmed identifier in the tag. Uniquely identifies the tag itself, not the item;
read-only.

**User memory** — optional writable memory in a tag. Not used in BagSense.

**Read range** — the maximum distance at which a tag can be read, for a given tag, power and orientation.
Not a single number: it changes with everything around the tag.

**RSSI** — received signal strength indicator. Useful for comparing reads ("this one was weaker"), not
for measuring distance. Never write "RSSI shows it is 30 cm away" in a report.

## The physics that keeps biting

**Near field** — the region close to the antenna where coupling is magnetic/inductive rather than a
radiated wave. Read zone is a *volume* bounded by the antenna's shape. BagSense's regime.

**Far field** — the radiating regime, where power falls with distance squared and the antenna has a beam.
A patch antenna is designed for this, which is why "near-field patch" was a contradiction in the first
draft.

**Loop antenna** — a conductor forming a closed path; produces a strong, contained magnetic field near
it. The antenna type compatible with "read only what is inside the bag".

**Patch antenna** — a flat resonant radiator with gain; radiates outward. Good for a warehouse door,
wrong for the inside of a backpack.

**Gain** — how much an antenna concentrates energy in one direction. Higher gain is not automatically
better inside a cavity.

**ERP / EIRP** — regulatory measures of radiated power. Malaysia allows RFID interrogators below 2 W ERP
under Class Assignment; the module must be configured accordingly.

**Polarization** — the orientation of the field relative to the tag antenna. A tag rotated 90° can become
invisible. This is why tag placement inside a bag matters more than reader power.

**Detuning / material loading** — nearby metal or liquid shifts the tag antenna's resonance, cutting its
range. The physical reason a charger behind a metal zip pocket can read as "missing".

**Backscatter** — how a passive tag replies: it switches its own reflection on and off, imprinting data.
It is why a passive tag needs so little power and why its signal is so weak.

## Reading many tags at once

**Anti-collision** — the set of rules that lets a reader identify many tags that would otherwise answer
at the same time.

**Inventory round** — one complete pass where the reader asks all tags to identify. This is the "scan",
and its duration is your 1.5 s target.

**Collision** — two or more tags replying simultaneously; the reader hears noise and identifies neither.

**Frame-slotted Aloha** — the family of protocols EPC Gen2 uses: tags pick a random slot in a frame and
answer in their slot, so replies rarely overlap.

**Q parameter** — the number that sets how many slots the frame has. Too low with many tags: many
collisions. Too high with few tags: wasted time.

**Singulation** — narrowing the population down to one identified tag at a time.

## Hardware and firmware

**MCU / microcontroller** — the small computer running your firmware. Here, the ESP32-S3.

**RTOS / FreeRTOS** — a scheduler that runs several tasks "simultaneously" on one core by switching
between them. Lets reader, display and BLE logic coexist without one blocking the others.

**Task** — an independent flow of work with its own stack. The unit you assign ownership to.

**ISR (interrupt service routine)** — code that runs immediately when hardware signals an event. Must be
short: in BagSense it wakes the system, then hands off to a task.

**Debounce** — ignoring the electrical chatter of a mechanical switch for a few milliseconds. Without it,
one zip close looks like twelve events.

**Deep sleep** — the MCU turns off most of itself and waits for an event, drawing microamps. The
mechanism behind the battery claim.

**Duty cycle** — the fraction of time a component is active. Your endurance number is a duty-cycle
calculation, not a soak test.

**UART** — a simple two-wire serial link. How the ESP32 talks to the reader module.

**SPI** — a faster four-wire bus. How the ESP32 drives the e-paper panel.

**GATT** — the BLE structure of services and characteristics. The status is one characteristic that the
phone subscribes to.

**Notify** — a GATT mechanism where the bag pushes a value to the phone without being asked. The reason
the app does not need to poll.

---

## Three sentences to have ready

If you memorise nothing else, memorise these three — they cover the questions that separate "he built
something" from "he understands what he built":

1. **"Passive UHF tags have no battery; they reflect the reader's field, so read reliability depends on
   field strength, tag orientation and nearby material — not on the reader's nominal range."**

2. **"We operate in the near field with a loop antenna inside the cavity, which keeps the read zone
   inside the bag instead of radiating into the room; the shielding liner on the outer shell finishes
   the containment."**

3. **"Battery endurance is computed from measured current in each state and the number of zip events per
   day, not from a multi-day endurance test we could not run in a semester."**
