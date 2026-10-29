# References — IoT side of BagSense (annotated)

18 sources, all DOI-verified against Crossref on 29 Oct 2026. Abstracts were read for 16 of 18
(the two exceptions are flagged). Grouped by what they are *for*, not by year.

How to use: the "Use in" line says where the citation belongs. Anything marked **read first** is the
one to read before the supervisor meeting, not the one to skim last.

---

## A. RFID fundamentals — what the technology is and what limits it

### A1. Want (2006) — RFID in one sitting
Want, R. (2006). An introduction to RFID technology. *IEEE Pervasive Computing, 5*(1), 25–33.
https://doi.org/10.1109/MPRV.2006.2

Introduces RFID principles, the main technology families, applications and the deployment challenges
organisations face. Written for a general computing audience, not for RF engineers.
**Why it matters:** it is the one paper that gives you the vocabulary (passive/active, tag, reader,
frequency bands) in 9 pages, and it explicitly contrasts RFID with barcode on the line-of-sight point —
which is exactly BagSense's problem statement.
**Use in:** Chapter 2 opener; also the definitional sentence in Chapter 1.
**Read first.**

### A2. Nikitin & Rao (2006) — why read range is what it is
Nikitin, P. V., & Rao, K. V. S. (2006). Performance limitations of passive UHF RFID systems.
In *2006 IEEE Antennas and Propagation Society International Symposium* (pp. 1011–1014).
https://doi.org/10.1109/APS.2006.1710704

An overview of what limits range in passive UHF RFID: tag characteristics, the propagation
environment, and reader parameters.
**Why it matters:** this is the paper that stops you promising range you cannot deliver. When the
examiner asks "why can't it read through the bag wall", this is the citation.
**Use in:** Chapter 2 (limits of passive UHF); Chapter 3 (why the read zone must be designed, not assumed).

### A3. Nikitin, Rao & Lazar (2007) — near field, which is your regime
Nikitin, P. V., Rao, K. V. S., & Lazar, S. (2007). An overview of near field UHF RFID.
In *2007 IEEE International Conference on RFID* (pp. 167–174). https://doi.org/10.1109/RFID.2007.346165

Reviews near-field UHF RFID theory — magnetic vs electric coupling — with experimental measurements,
in the context of item-level tagging where LF/HF was traditionally used.
**Why it matters:** this is the single most important paper for your design. It is the published basis
for the claim that a near-field loop inside a cavity is a different regime from a radiating patch, and
it is why "near-field patch antenna" in your first draft was a contradiction.
**Use in:** Chapter 2 (RFID operating regimes); Chapter 3 (antenna choice justification).
**Read first.**

### A4. Nikitin & Rao (2008) — the full link budget
Nikitin, P. V., & Rao, K. V. S. (2008). Antennas and propagation in UHF RFID systems.
In *2008 IEEE International Conference on RFID* (pp. 277–288). https://doi.org/10.1109/RFID.2008.4519368

Reader-tag-reader link treated part by part: reader antenna, propagation channel, tag. Includes channel
equations and measured tag performance under different conditions, plus a literature review.
**Why it matters:** the equations behind your power budget, and the source for "tag orientation and
surrounding material change the answer" — the reason a 5-tag pilot in week 8 is mandatory.
**Use in:** Chapter 3 (measurement design); Chapter 4 (interpreting the results).

---

## B. Anti-collision and the cost of reading many tags

### B1. Klair, Chin & Raad (2010) — the map of the field
Klair, D. K., Chin, K.-W., & Raad, R. (2010). A survey and tutorial of RFID anti-collision protocols.
*IEEE Communications Surveys & Tutorials, 12*(3), 400–421. https://doi.org/10.1109/SURV.2010.031810.00037

Tutorial survey of tag anti-collision: the problem of simultaneous replies, the protocol families that
address it, and the trade-off between speed and energy as tag numbers grow.
**Why it matters:** your objective says "anti-collision interrogation of up to 15 tags in 1.5 s". This is
the paper that tells you which protocol family EPC Gen2 uses and why the Q parameter exists.
**Use in:** Chapter 2 (anti-collision), Chapter 3 (firmware configuration rationale).
**Read first (sections 2–4 only).**

### B2. Shih, Sun, Yen & Huang (2006) — the taxonomy alternative
Shih, D.-H., Sun, P.-L., Yen, D. C., & Huang, S.-M. (2006). Taxonomy and survey of RFID anti-collision
protocols. *Computer Communications, 29*(11), 2150–2166. https://doi.org/10.1016/j.comcom.2005.12.011

A taxonomy that organises anti-collision protocols into families and compares them.
**Why it matters:** cheaper to cite for "there are several families" than to re-derive it. Note: no
abstract was retrievable from the indexing services — read the introduction yourself before citing a
specific claim.
**Use in:** Chapter 2, one sentence alongside B1.

### B3. Klair, Chin & Raad (2009) — what reading costs in energy
Klair, D. K., Chin, K.-W., & Raad, R. (2009). On the energy consumption of pure and slotted Aloha based
RFID anti-collision protocols. *Computer Communications, 32*(5), 961–973.
https://doi.org/10.1016/j.comcom.2008.12.019

Compares the energy cost of pure and slotted Aloha anti-collision schemes.
**Why it matters:** it connects two of your objectives that are usually discussed separately — inventory
speed (1.5 s) and battery endurance (5 days) are the same trade-off, because every extra slot costs
energy. No abstract retrievable; verify the specific numbers in the paper before quoting any.
**Use in:** Chapter 3 (why the scan is duty-cycled rather than continuous).

---

## C. Reading things in confined, cluttered, metal-adjacent spaces

### C1. Hellström & Wiberg (2010) — accuracy is an empirical question
Hellström, D., & Wiberg, M. (2010). Improving inventory accuracy using RFID technology: A case study.
*Assembly Automation, 30*(4), 345–351. https://doi.org/10.1108/01445151011075807

Case study of an RFID item-level implementation in a production plant, with a model for assessing the
technology's effect on inventory accuracy.
**Why it matters:** the reference for the position that accuracy depends on implementation detail
(placement, process, reader settings), not on the datasheet. It is your defence for reporting a measured
recall figure lower than 98% and still calling the project a success.
**Use in:** Chapter 2 (accuracy in practice); Chapter 4 (discussion of results).

### C2. Andrenko & Kai (2013) — near-field antenna for a shelf
Andrenko, A. S., & Kai, M. (2013). Novel design of UHF RFID near-field antenna for smart shelf
applications. In *2013 Asia-Pacific Microwave Conference Proceedings (APMC)* (pp. 242–244).
https://doi.org/10.1109/APMC.2013.6695107

Near-field reader antenna built from a microstrip feed line coupled to periodic planar metal strips,
customisable to the interrogation volume, evaluated for simultaneous detection of multiple items.
**Why it matters:** the closest published antenna topology to what you are building — a loop/strip
structure designed to fill a *volume*, not to radiate into a room. This is the shape of the argument in
your Chapter 3.
**Use in:** Chapter 2 (smart shelf as nearest neighbour); Chapter 3 (antenna topology).

### C3. Andrenko (2015) — the same idea, optimised
Andrenko, A. S. (2015). Optimized near-field antenna for UHF RFID smart shelf applications.
In *2015 IEEE International Symposium on Antennas and Propagation & USNC/URSI National Radio Science
Meeting* (pp. 1576–1577). https://doi.org/10.1109/APS.2015.7305177

Optimised version of the same coupling principle, with prototypes measured and evaluated inside a
working UHF RFID system for multi-item detection.
**Why it matters:** shows the method (prototype, measure, report) you are supposed to follow in week 8,
not just the result.
**Use in:** Chapter 3 (methodology precedent).

### C4. Byondi & Chung (2019) — what metal does, and how tags are fixed for it
Byondi, F. K., & Chung, Y. (2019). Longest-range UHF RFID sensor tag antenna for IoT applied for metal
and non-metal objects. *Sensors, 19*(24), 5460. https://doi.org/10.3390/s19245460

A cavity-type passive tag antenna evaluated on both metal and non-metal objects, benchmarked against
existing long-range tags, with measured and modelled read ranges.
**Why it matters:** supports the honest limitation in storyboard frame F18 — a tag against metal needs a
different antenna, and no amount of reader power fixes it. Open access, so you can read it free.
**Use in:** Chapter 2 (material effects); Chapter 5 (limitations).

---

## D. Wearable and flexible contexts — the bag is a fabric cavity

### D1. Luo, Gil & Fernández-García (2020) — systematic review
Luo, C., Gil, I., & Fernández-García, R. (2020). Wearable textile UHF-RFID sensors: A systematic review.
*Materials, 13*(15), 3292. https://doi.org/10.3390/ma13153292

Reviews textile UHF-RFID sensors: materials, fabrication, washability, comfort, and the gap between
textile sensing research and practical integration.
**Why it matters:** the state of the art for RFID in fabric. Your bag is a fabric container carried
against a body — this is where the "what happens to the field near a person" question lives. Open access.
**Use in:** Chapter 2 (wearable context); Chapter 5 (future work: textile antenna in the liner).

### D2. Daiki, Perret & Tedjini (2014) — antenna in clothing
Daiki, M., Perret, E., & Tedjini, S. (2014). Design of near field UHF RFID reader antenna integrated
into clothing. In *2014 IEEE RFID Technology and Applications Conference (RFID-TA)* (pp. 261–265).
https://doi.org/10.1109/RFID-TA.2014.6934240

A segmented circular loop antenna in bracelet form, integrated into clothing, for identifying small
passive UHF tags in the near field.
**Why it matters:** the closest thing in the literature to "an antenna that lives inside a wearable item
and reads tags nearby" — exactly the BagSense geometry, one scale down.
**Use in:** Chapter 2; Chapter 3 (antenna placement argument).

---

## E. Energy — how the 5-day claim is made defensible

### E1. Sample et al. (2008) — WISP
Sample, A. P., Yeager, D. J., Powledge, P. S., Mamishev, A. V., & Smith, J. R. (2008). Design of an
RFID-based battery-free programmable sensing platform. *IEEE Transactions on Instrumentation and
Measurement, 57*(11), 2608–2615. https://doi.org/10.1109/TIM.2008.925019

WISP: a programmable, battery-free sensing platform running a 16-bit ultra-low-power MCU entirely from
harvested RF energy, with integrated temperature, light and orientation sensing.
**Why it matters:** the reference point for "what batteryless RFID computing costs and buys". It is also
the answer to the obvious examiner question: why not go batteryless like WISP? — because a UHF reader
draws far more than a harvesting tag can supply.
**Use in:** Chapter 2 (energy); Chapter 5 (design alternative considered and rejected).

### E2. Sabovic et al. (2022) — scheduling under scarce energy
Sabovic, A., Sultania, A. K., Delgado, C., De Roeck, L., & Famaey, J. (2022). An energy-aware task
scheduler for energy-harvesting batteryless IoT devices. *IEEE Internet of Things Journal, 9*(22),
23097–23114. https://doi.org/10.1109/JIOT.2022.3185321

Task scheduling under intermittent harvested energy, using voltage thresholds per task to avoid power
failures and keep forward progress.
**Why it matters:** it is the published justification for your event-driven architecture — work is
scheduled around available energy rather than run continuously. It also gives you the vocabulary
("energy-neutral operation", "power failure", "forward progress") for the battery discussion.
**Use in:** Chapter 2; Chapter 3 (firmware architecture rationale).

---

## F. Edge computing and TinyML — where your AI background actually fits

### F1. Shi et al. (2016) — the canonical edge computing paper
Shi, W., Cao, J., Zhang, Q., Li, Y., & Xu, L. (2016). Edge computing: Vision and challenges.
*IEEE Internet of Things Journal, 3*(5), 637–646. https://doi.org/10.1109/JIOT.2016.2579198

Defines edge computing, gives case studies from cloud offloading to smart home, and lists the open
challenges: latency, battery, bandwidth, privacy.
**Why it matters:** the citation that makes "Edge-IoT" in your title mean something specific rather than
a buzzword. It is also the paper that legitimises "the bag decides locally, no cloud dependency".
**Use in:** Chapter 1 (title justification); Chapter 2 (edge paradigm).

### F2. Sanchez-Iborra & Skarmeta (2020) — TinyML, the bridge to your specialisation
Sanchez-Iborra, R., & Skarmeta, A. F. (2020). TinyML-enabled frugal smart objects: Challenges and
opportunities. *IEEE Circuits and Systems Magazine, 20*(3), 4–18. https://doi.org/10.1109/MCAS.2020.3005467

A review of the TinyML ecosystem: running ML on microcontroller-class hardware, the constraints, and the
services it enables without cloud support.
**Why it matters:** this is the honest, defensible place for your AI background. Not "the bag uses AI"
in FYP1 — but "the platform is capable of on-device inference, and FYP2 can add a small model on the
event log". Citing it now sets up that sentence without adding scope.
**Use in:** Chapter 2 (edge intelligence); Chapter 5 (future work).

---

## G. The nearest existing system

### G1. Jain et al. (2023) — smart luggage, but locates the bag, not its contents
Jain, S., Aithal, S., Allamsetty, V., Sarvikasree, K. S., Gobi, N., & Rathi, R. (2023). Smart luggage
tracking using IoT and GPS technology. *International Journal of Advanced Research in Computer and
Communication Engineering, 12*(4). https://doi.org/10.17148/IJARCCE.2023.12403

A microcontroller + GPS + GSM luggage system that reports the bag's location in real time through an
IoT platform.
**Why it matters:** it is the system BagSense is most likely to be compared to, and the comparison is
favourable: it answers "where is my bag", not "what is in my bag". Use it to sharpen the gap statement
rather than to attack it — it is a different problem.
**Use in:** Chapter 2 (related systems), directly before the gap paragraph.

---

## What I did not find (and why that is good news)

Searches across Crossref for instrumented backpacks, smart bags with content sensing, and
container-level RFID inventory of personal items returned **no peer-reviewed system that does what
BagSense proposes**. The nearest neighbours are all in this list: smart shelves (C2, C3), wearable
near-field antennas (D2), and bag *locators* (G1).

Two consequences for your Chapter 2:

1. Your gap paragraph is defensible: the literature covers shelves, cabinets, clothing and gates —
   not a personal bag carried against a body.
2. Do not overclaim in the other direction either. The individual components are all well studied;
   what is new is the combination and the constraint set (small cavity, fabric, battery, glanceable
   display). Say exactly that.

---

## Not citations — learning material

Do not cite these in the report; read them.

- Finkenzeller, K. *RFID Handbook* (3rd ed., Wiley, 2010) — the reference text for RFID physics.
  Chapters 3–4 for near/far field, chapter 6 for anti-collision.
- Dobkin, D. M. *The RF in RFID* (2nd ed., Newnes, 2012) — the practical explanation of link budgets.
- GS1, *EPC Radio-Frequency Identity Protocols Generation-2 UHF RFID* — the standard itself, for the
  inventory round and the Q parameter.
- Espressif, *ESP-IDF Programming Guide* — FreeRTOS, sleep modes, SPI/UART drivers.
- Espressif, *ESP32-S3 Technical Reference Manual* — already in your folder.
- MCMC, *SRSP 530* — the 919–923 MHz band, Class Assignment conditions, 2 W ERP limit.
- Vendor documentation for the YRM100 / MagicRF module — the UART command set is not in any paper.

---

## Verification note for the report

All 18 DOIs resolve through Crossref, and the metadata quoted above (authors, year, venue, volume,
issue, pages) was read from the Crossref record, not from memory. If you change a citation, re-verify
the DOI — a broken DOI in the reference list is the fastest way to lose marks for carelessness.
