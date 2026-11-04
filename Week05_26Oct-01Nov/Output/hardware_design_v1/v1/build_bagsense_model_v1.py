# BagSense — parametric hardware model (Blender 5.2, headless)
# Jalankan:  blender --background --python build_bagsense_model_v1.py
#
# PENTING: semua dimensi di bawah ialah ANDAIAN beg pelajar biasa.
# Belum diukur pada beg sebenar. Tukar DIM dan semua render/model berubah.
# Sumber dimensi sebenar mesti datang dari ukuran Adam (gambar + pembaris).

import bpy
import os
import math
from mathutils import Vector

OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- dimensi (mm)
DIM = dict(
    bag_w=320, bag_d=160, bag_h=460,     # luar
    wall=10,                              # tebal fabrik
    pocket_w=260, pocket_d=35, pocket_h=200,
    bezel_w=110, bezel_h=70, bezel_d=12,
    panel_w=86, panel_h=48,
    loop_w=280, loop_d=130, loop_t=6, loop_z=150,
    rfid_w=62, rfid_d=38, rfid_h=14,
    esp_w=60, esp_d=28, esp_h=7,
    batt_w=90, batt_d=22, batt_h=120,
)

# ------------------------------------------------------------------- helpers
def purge():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, rgb, rough=0.6, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    return m


def box(name, size, loc, bevel=0.0, segs=3, material=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.object
    ob.name = name
    ob.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        b = ob.modifiers.new("bev", "BEVEL")
        b.width = bevel
        b.segments = segs
        b.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier=b.name)
    if material:
        ob.data.materials.append(material)
    return ob


def boolean_diff(target, cutter):
    m = target.modifiers.new("bool", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = cutter
    m.solver = "EXACT"
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(cutter, do_unlink=True)


# --------------------------------------------------------------------- scene
purge()

M_FABRIC = mat("Fabric", (0.055, 0.062, 0.075), rough=0.85)
M_FABRIC_IN = mat("FabricInner", (0.17, 0.18, 0.20), rough=0.9)
M_ACCENT = mat("Accent", (0.85, 0.42, 0.08), rough=0.5)
M_PCB = mat("PCB", (0.05, 0.22, 0.12), rough=0.45)
M_CHIP = mat("Chip", (0.08, 0.08, 0.09), rough=0.35)
M_GLASS = mat("Epaper", (0.86, 0.87, 0.83), rough=0.25)
M_COPPER = mat("Copper", (0.72, 0.36, 0.14), rough=0.3, metal=1.0)
M_SILVER = mat("Battery", (0.55, 0.57, 0.60), rough=0.35, metal=0.7)
M_DARK = mat("Zipper", (0.03, 0.03, 0.035), rough=0.55)

W, Dp, H = DIM["bag_w"], DIM["bag_d"], DIM["bag_h"]

# ---- badan beg: luar, dijadikan berongga dengan boolean
shell = box("BagShell", (W, Dp, H), (0, 0, H / 2), bevel=26, segs=5, material=M_FABRIC)
cavity = box("cavity_cut", (W - 2 * DIM["wall"], Dp - 2 * DIM["wall"], H),
             (0, 0, H / 2 + 14), bevel=18, segs=5)
boolean_diff(shell, cavity)

# lapisan dalam (kepingan nipis dalam cavity, untuk render keratan)
inner = box("CavityLiner", (W - 2 * DIM["wall"] - 2, Dp - 2 * DIM["wall"] - 2, H - 30),
            (0, 0, H / 2 + 20), bevel=16, segs=5, material=M_FABRIC_IN)

# ---- zip atas
box("Zipper_Track", (W - 40, 22, 7), (0, 0, H + 2), bevel=3, material=M_DARK)
box("Zipper_Pull", (16, 8, 5), (30, 0, H + 7), bevel=2, material=M_ACCENT)

# ---- poket depan
box("FrontPocket", (DIM["pocket_w"], DIM["pocket_d"], DIM["pocket_h"]),
    (0, -Dp / 2 - DIM["pocket_d"] / 2 + 6, 205), bevel=18, segs=4, material=M_FABRIC)

# ---- bezel + panel E-paper pada muka depan
bezel_z = 385
box("DisplayBezel", (DIM["bezel_w"], DIM["bezel_d"], DIM["bezel_h"]),
    (0, -Dp / 2 - 2, bezel_z), bevel=8, segs=4, material=M_ACCENT)
box("DisplayPanel", (DIM["panel_w"], 3, DIM["panel_h"]),
    (0, -Dp / 2 - DIM["bezel_d"] / 2 - 1.5, bezel_z), bevel=2, material=M_GLASS)

# ---- antenna loop dalam cavity (segi empat tepat, satah mendatar)
lw, ld, lt, lz = DIM["loop_w"], DIM["loop_d"], DIM["loop_t"], DIM["loop_z"]
box("Loop_Front", (lw, lt, lt), (0, -ld / 2, lz), bevel=1, material=M_COPPER)
box("Loop_Back", (lw, lt, lt), (0, ld / 2, lz), bevel=1, material=M_COPPER)
box("Loop_Left", (lt, ld, lt), (-lw / 2, 0, lz), bevel=1, material=M_COPPER)
box("Loop_Right", (lt, ld, lt), (lw / 2, 0, lz), bevel=1, material=M_COPPER)

# ---- elektronik dalam cavity
box("RFID_YRM100", (DIM["rfid_w"], DIM["rfid_d"], DIM["rfid_h"]),
    (-70, 25, 62), bevel=2, material=M_PCB)
box("RFID_Shield", (40, 26, 4), (-70, 25, 71), bevel=1, material=M_CHIP)
box("ESP32S3", (DIM["esp_w"], DIM["esp_d"], DIM["esp_h"]),
    (55, 30, 62), bevel=1, material=M_PCB)
box("ESP32_Chip", (18, 18, 4), (55, 30, 67.5), bevel=1, material=M_CHIP)
box("Battery", (DIM["batt_w"], DIM["batt_d"], DIM["batt_h"]),
    (0, 50, 78), bevel=5, material=M_SILVER)

# ---- hall sensor dekat zip
box("Hall_L", (12, 7, 5), (-90, 2, H - 14), bevel=1, material=M_PCB)
box("Hall_R", (12, 7, 5), (90, 2, H - 14), bevel=1, material=M_PCB)

# ---- tali beg
box("Strap_L", (45, 12, 300), (-110, Dp / 2 + 4, 250), bevel=6, material=M_FABRIC)
box("Strap_R", (45, 12, 300), (110, Dp / 2 + 4, 250), bevel=6, material=M_FABRIC)

# ------------------------------------------------------------------ rendering
scene = bpy.context.scene
engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else engines[0]
scene.render.resolution_x = 1800
scene.render.resolution_y = 1400
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
try:
    scene.eevee.taa_render_samples = 48
except Exception:
    pass

world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.93, 0.94, 0.95, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0

def add_light(name, loc, energy, size):
    d = bpy.data.lights.new(name, type="AREA")
    d.energy = energy
    d.size = size
    ob = bpy.data.objects.new(name, d)
    ob.location = loc
    scene.collection.objects.link(ob)
    direction = Vector((0, 0, 230)) - Vector(loc)
    ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return ob

add_light("Key", (700, -650, 900), 8.0e7, 700)
add_light("Fill", (-800, -500, 400), 3.0e7, 800)
add_light("Rim", (0, 800, 700), 4.0e7, 600)

cam_data = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam_data.lens = 60

def render(view, loc, target=(0, 0, 230), lens=60):
    cam.location = loc
    cam_data.lens = lens
    direction = Vector(target) - Vector(loc)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(OUT, f"render_{view}_v1.png")
    bpy.ops.render.render(write_still=True)
    print("RENDER:", scene.render.filepath)

render("iso", (700, -680, 620))
render("front", (0, -950, 250), lens=70)
render("side", (900, -120, 260), lens=70)
render("interior", (120, -400, 820), target=(0, 20, 120), lens=45)

# ---- wireframe render (workbench)
scene.render.engine = "BLENDER_WORKBENCH"
sh = scene.display.shading
sh.type = "WIREFRAME"
sh.show_object_outline = False
try:
    sh.wireframe_color_type = "SINGLE"
    sh.single_color = (0.05, 0.05, 0.06)
except Exception as e:
    print("wireframe color:", e)
scene.render.resolution_x = 1800
scene.render.resolution_y = 1400
render("wireframe_iso", (700, -680, 620))

# ---- simpan + eksport
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "bagsense_model_v1.blend"))
try:
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "bagsense_model_v1.glb"),
                              export_format="GLB", use_selection=False)
except Exception as e:
    print("GLB export gagal:", e)
try:
    bpy.ops.wm.obj_export(filepath=os.path.join(OUT, "bagsense_model_v1.obj"))
except Exception as e:
    print("OBJ export gagal:", e)

print("SIAP")
