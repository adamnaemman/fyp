# BagSense — parametric hardware model v4 (Blender 5.2, headless)
# Jalankan:  blender --background --python build_bagsense_model_v4.py
#
# Sejarah pembaikan:
#   v1 fabrik hitam + cahaya terlalu kuat -> imej putih melecur, liner pepejal tutup cavity
#   v2 boolean pada shell merosakkan geometri (silhouette jadi kon)
#   v3 panel shell betul, tetapi cavity gelap (tiada cahaya masuk) + perspektif melampau
#   v4 kamera ORTHO untuk semua pandangan teknikal, fabrik kelabu-biru yang boleh baca bentuk,
#      lampu atas menembak masuk cavity, satu pandangan top-down untuk susun atur dalaman
#
# PENTING: semua dimensi dalam DIM ialah ANDAIAN beg pelajar biasa.
# Belum diukur pada beg sebenar. Tukar DIM -> semua render/model berubah.

import bpy
import os
from mathutils import Vector

OUT = os.path.dirname(os.path.abspath(__file__))
VER = "v4"

DIM = dict(
    bag_w=320, bag_d=160, bag_h=460,
    wall=10,
    pocket_w=260, pocket_d=35, pocket_h=200,
    bezel_w=110, bezel_h=70, bezel_d=12,
    panel_w=86, panel_h=48,
    loop_w=270, loop_d=120, loop_t=6, loop_z=150,
    rfid_w=62, rfid_d=38, rfid_h=14,
    esp_w=60, esp_d=28, esp_h=7,
    batt_w=90, batt_d=22, batt_h=120,
)
W, Dp, H, T = DIM["bag_w"], DIM["bag_d"], DIM["bag_h"], DIM["wall"]


def mat(name, rgb, rough=0.6, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m


def box(name, size, loc, bevel=0.0, segs=3, material=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.object
    ob.name = name
    ob.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        m = ob.modifiers.new("bev", "BEVEL")
        m.width = bevel
        m.segments = segs
        m.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier=m.name)
    if material:
        ob.data.materials.append(material)
    return ob


bpy.ops.wm.read_factory_settings(use_empty=True)

M_FABRIC = mat("Fabric", (0.30, 0.33, 0.38), rough=0.8)
M_FABRIC2 = mat("FabricFlap", (0.21, 0.24, 0.28), rough=0.85)
M_ACCENT = mat("Accent", (0.85, 0.40, 0.08), rough=0.4)
M_PCB = mat("PCB", (0.06, 0.30, 0.16), rough=0.35)
M_CHIP = mat("Chip", (0.10, 0.10, 0.11), rough=0.3)
M_GLASS = mat("Epaper", (0.93, 0.94, 0.90), rough=0.15)
M_COPPER = mat("Copper", (0.78, 0.40, 0.14), rough=0.2, metal=1.0)
M_SILVER = mat("Battery", (0.62, 0.64, 0.67), rough=0.25, metal=0.85)
M_FLOOR = mat("Floor", (0.80, 0.82, 0.84), rough=0.95)

# ---- shell daripada panel
box("Panel_Floor", (W, Dp, T), (0, 0, T / 2), bevel=3, material=M_FABRIC)
box("Panel_Front", (W, T, H), (0, -Dp / 2 + T / 2, H / 2), bevel=5, segs=3, material=M_FABRIC)
box("Panel_Back", (W, T, H), (0, Dp / 2 - T / 2, H / 2), bevel=5, segs=3, material=M_FABRIC)
box("Panel_Left", (T, Dp - 2 * T, H), (-W / 2 + T / 2, 0, H / 2), bevel=5, segs=3, material=M_FABRIC)
box("Panel_Right", (T, Dp - 2 * T, H), (W / 2 - T / 2, 0, H / 2), bevel=5, segs=3, material=M_FABRIC)

# ---- bibir zip
box("ZipRim_Left", (26, Dp - 2 * T, 8), (-W / 2 + 20, 0, H + 2), bevel=3, material=M_FABRIC2)
box("ZipRim_Right", (26, Dp - 2 * T, 8), (W / 2 - 20, 0, H + 2), bevel=3, material=M_FABRIC2)
box("Zip_Pull", (14, 22, 5), (-W / 2 + 20, -Dp / 4, H + 8), bevel=2, material=M_ACCENT)

# ---- poket depan
box("FrontPocket", (DIM["pocket_w"], DIM["pocket_d"], DIM["pocket_h"]),
    (0, -Dp / 2 - DIM["pocket_d"] / 2 + 10, 200), bevel=10, segs=3, material=M_FABRIC2)

# ---- bezel + panel E-paper
bz = 385
box("DisplayBezel", (DIM["bezel_w"], DIM["bezel_d"], DIM["bezel_h"]),
    (0, -Dp / 2 - 4, bz), bevel=6, segs=3, material=M_ACCENT)
box("DisplayPanel", (DIM["panel_w"], 4, DIM["panel_h"]),
    (0, -Dp / 2 - DIM["bezel_d"] / 2 - 3, bz), bevel=2, material=M_GLASS)

# ---- antenna loop dalam cavity
lw, ld, lt, lz = DIM["loop_w"], DIM["loop_d"], DIM["loop_t"], DIM["loop_z"]
box("Loop_Front", (lw, lt, lt), (0, -ld / 2, lz), bevel=1, material=M_COPPER)
box("Loop_Back", (lw, lt, lt), (0, ld / 2, lz), bevel=1, material=M_COPPER)
box("Loop_Left", (lt, ld, lt), (-lw / 2, 0, lz), bevel=1, material=M_COPPER)
box("Loop_Right", (lt, ld, lt), (lw / 2, 0, lz), bevel=1, material=M_COPPER)

# ---- elektronik
box("RFID_YRM100", (DIM["rfid_w"], DIM["rfid_d"], DIM["rfid_h"]), (-72, 20, 70),
    bevel=2, material=M_PCB)
box("RFID_Shield", (40, 26, 4), (-72, 20, 79), bevel=1, material=M_CHIP)
box("ESP32S3", (DIM["esp_w"], DIM["esp_d"], DIM["esp_h"]), (58, 26, 70),
    bevel=1, material=M_PCB)
box("ESP32_Chip", (18, 18, 4), (58, 26, 75.5), bevel=1, material=M_CHIP)
box("Battery", (DIM["batt_w"], DIM["batt_d"], DIM["batt_h"]), (0, 44, 88),
    bevel=5, material=M_SILVER)

# ---- hall sensor
box("Hall_L", (12, 7, 5), (-90, 0, H - 14), bevel=1, material=M_PCB)
box("Hall_R", (12, 7, 5), (90, 0, H - 14), bevel=1, material=M_PCB)

# ---- tali beg
box("Strap_L", (45, 12, 300), (-110, Dp / 2 + 6, 250), bevel=6, material=M_FABRIC2)
box("Strap_R", (45, 12, 300), (110, Dp / 2 + 6, 250), bevel=6, material=M_FABRIC2)

# ---- lantai
box("Floor", (4000, 4000, 10), (0, 0, -5.5), material=M_FLOOR)

# ---------------------------------------------------------------- rendering
scene = bpy.context.scene
engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else engines[0]
scene.render.resolution_x = 1800
scene.render.resolution_y = 1400
scene.render.film_transparent = False
scene.view_settings.view_transform = "Standard"
try:
    scene.eevee.taa_render_samples = 64
except Exception:
    pass

world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.88, 0.90, 0.92, 1)
bg.inputs[1].default_value = 1.0


def add_light(name, loc, energy, size, target=(0, 0, 200)):
    d = bpy.data.lights.new(name, type="AREA")
    d.energy = energy
    d.size = size
    ob = bpy.data.objects.new(name, d)
    ob.location = loc
    scene.collection.objects.link(ob)
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return ob


add_light("Key", (700, -700, 950), 2500, 500)
add_light("Fill", (-850, -500, 400), 900, 600)
add_light("Rim", (200, 850, 700), 1200, 500)
add_light("TopCavity", (0, 10, 1500), 4000, 300, target=(0, 10, 0))

cam_data = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam


def shoot(view, loc, target=(0, 0, 230), lens=55, ortho=None, res=(1800, 1400)):
    scene.render.resolution_x, scene.render.resolution_y = res
    cam.location = loc
    cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    if ortho:
        cam_data.type = "ORTHO"
        cam_data.ortho_scale = ortho
    else:
        cam_data.type = "PERSP"
        cam_data.lens = lens
    scene.render.filepath = os.path.join(OUT, f"render_{view}_{VER}.png")
    bpy.ops.render.render(write_still=True)
    print("RENDER:", scene.render.filepath)


shoot("iso", (900, -900, 900), ortho=760)
shoot("front", (0, -1400, 230), target=(0, 0, 230), ortho=620)
shoot("side", (1400, 0, 230), target=(0, 0, 230), ortho=620)
shoot("top", (0, 10, 1600), target=(0, 10, 0), ortho=620)
shoot("interior", (430, -520, 830), target=(0, 10, 110), lens=50)

# ---- wireframe (workbench)
scene.render.engine = "BLENDER_WORKBENCH"
sh = scene.display.shading
sh.type = "WIREFRAME"
sh.show_object_outline = False
try:
    sh.wireframe_color_type = "SINGLE"
    sh.single_color = (0.07, 0.07, 0.08)
    sh.background_type = "VIEWPORT"
    sh.background_color = (1.0, 1.0, 1.0)
except Exception as e:
    print("wireframe setting:", e)
shoot("wireframe_iso", (900, -900, 900), ortho=760)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, f"bagsense_model_{VER}.blend"))
try:
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, f"bagsense_model_{VER}.glb"),
                              export_format="GLB", use_selection=False)
except Exception as e:
    print("GLB export gagal:", e)
try:
    bpy.ops.wm.obj_export(filepath=os.path.join(OUT, f"bagsense_model_{VER}.obj"))
except Exception as e:
    print("OBJ export gagal:", e)

print("SIAP")
