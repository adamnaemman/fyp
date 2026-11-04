# BagSense — parametric hardware model v2 (Blender 5.2, headless)
# Jalankan:  blender --background --python build_bagsense_model_v2.py
#
# v2 membaiki v1: shell berongga tanpa liner pepejal, cahaya skala mm, kamera ortho,
# view transform Standard (v1 terlalu putih).
#
# PENTING: semua dimensi dalam DIM ialah ANDAIAN beg pelajar biasa.
# Belum diukur pada beg sebenar. Tukar DIM -> semua render/model berubah.
# Sumber dimensi sebenar mesti datang dari ukuran Adam (gambar + pembaris).

import bpy
import os
from mathutils import Vector

OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT, exist_ok=True)
VER = "v2"

# ---------------------------------------------------------------- dimensi (mm)
DIM = dict(
    bag_w=320, bag_d=160, bag_h=460,     # luar
    wall=10,                              # tebal fabrik
    pocket_w=260, pocket_d=35, pocket_h=200,
    bezel_w=110, bezel_h=70, bezel_d=12,
    panel_w=86, panel_h=48,
    loop_w=270, loop_d=120, loop_t=6, loop_z=150,
    rfid_w=62, rfid_d=38, rfid_h=14,
    esp_w=60, esp_d=28, esp_h=7,
    batt_w=90, batt_d=22, batt_h=120,
)

# ------------------------------------------------------------------- helpers
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
bpy.ops.wm.read_factory_settings(use_empty=True)

M_FABRIC = mat("Fabric", (0.035, 0.042, 0.055), rough=0.85)
M_ACCENT = mat("Accent", (0.80, 0.35, 0.05), rough=0.45)
M_PCB = mat("PCB", (0.02, 0.16, 0.08), rough=0.4)
M_CHIP = mat("Chip", (0.05, 0.05, 0.06), rough=0.3)
M_GLASS = mat("Epaper", (0.90, 0.91, 0.86), rough=0.2)
M_COPPER = mat("Copper", (0.70, 0.32, 0.10), rough=0.25, metal=1.0)
M_SILVER = mat("Battery", (0.45, 0.47, 0.50), rough=0.3, metal=0.8)
M_DARK = mat("Zipper", (0.02, 0.02, 0.025), rough=0.5)

W, Dp, H = DIM["bag_w"], DIM["bag_d"], DIM["bag_h"]

# ---- badan beg: luar, dijadikan berongga (bukaan atas kekal terbuka)
shell = box("BagShell", (W, Dp, H), (0, 0, H / 2), bevel=26, segs=5, material=M_FABRIC)
cavity = box("cavity_cut", (W - 2 * DIM["wall"], Dp - 2 * DIM["wall"], H),
             (0, 0, H / 2 + 12), bevel=16, segs=5)
boolean_diff(shell, cavity)

# ---- zip atas
box("Zipper_Track", (W - 40, 22, 7), (0, 0, H + 1), bevel=3, material=M_DARK)
box("Zipper_Pull", (16, 8, 5), (30, 0, H + 6), bevel=2, material=M_ACCENT)

# ---- poket depan
box("FrontPocket", (DIM["pocket_w"], DIM["pocket_d"], DIM["pocket_h"]),
    (0, -Dp / 2 - DIM["pocket_d"] / 2 + 8, 200), bevel=18, segs=4, material=M_FABRIC)

# ---- bezel + panel E-paper pada muka depan
bezel_z = 385
box("DisplayBezel", (DIM["bezel_w"], DIM["bezel_d"], DIM["bezel_h"]),
    (0, -Dp / 2 - 3, bezel_z), bevel=8, segs=4, material=M_ACCENT)
box("DisplayPanel", (DIM["panel_w"], 4, DIM["panel_h"]),
    (0, -Dp / 2 - DIM["bezel_d"] / 2 - 2, bezel_z), bevel=2, material=M_GLASS)

# ---- antenna loop dalam cavity (segi empat tepat, satah mendatar)
lw, ld, lt, lz = DIM["loop_w"], DIM["loop_d"], DIM["loop_t"], DIM["loop_z"]
box("Loop_Front", (lw, lt, lt), (0, -ld / 2, lz), bevel=1, material=M_COPPER)
box("Loop_Back", (lw, lt, lt), (0, ld / 2, lz), bevel=1, material=M_COPPER)
box("Loop_Left", (lt, ld, lt), (-lw / 2, 0, lz), bevel=1, material=M_COPPER)
box("Loop_Right", (lt, ld, lt), (lw / 2, 0, lz), bevel=1, material=M_COPPER)

# ---- elektronik dalam cavity
box("RFID_YRM100", (DIM["rfid_w"], DIM["rfid_d"], DIM["rfid_h"]),
    (-72, 22, 70), bevel=2, material=M_PCB)
box("RFID_Shield", (40, 26, 4), (-72, 22, 79), bevel=1, material=M_CHIP)
box("ESP32S3", (DIM["esp_w"], DIM["esp_d"], DIM["esp_h"]),
    (58, 28, 70), bevel=1, material=M_PCB)
box("ESP32_Chip", (18, 18, 4), (58, 28, 75.5), bevel=1, material=M_CHIP)
box("Battery", (DIM["batt_w"], DIM["batt_d"], DIM["batt_h"]),
    (0, 46, 88), bevel=5, material=M_SILVER)

# ---- hall sensor dekat zip
box("Hall_L", (12, 7, 5), (-90, 2, H - 16), bevel=1, material=M_PCB)
box("Hall_R", (12, 7, 5), (90, 2, H - 16), bevel=1, material=M_PCB)

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
scene.view_settings.view_transform = "Standard"
try:
    scene.eevee.taa_render_samples = 64
except Exception:
    pass

world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.86, 0.88, 0.90, 1)
bg.inputs[1].default_value = 0.55

def add_light(name, loc, energy, size):
    d = bpy.data.lights.new(name, type="AREA")
    d.energy = energy
    d.size = size
    ob = bpy.data.objects.new(name, d)
    ob.location = loc
    scene.collection.objects.link(ob)
    direction = Vector((0, 0, 220)) - Vector(loc)
    ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return ob

add_light("Key", (600, -550, 800), 220, 400)
add_light("Fill", (-700, -450, 350), 90, 500)
add_light("Rim", (0, 700, 650), 140, 400)

cam_data = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

def shoot(view, loc, target=(0, 0, 230), lens=60, ortho=None):
    cam.location = loc
    direction = Vector(target) - Vector(loc)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    if ortho:
        cam_data.type = "ORTHO"
        cam_data.ortho_scale = ortho
    else:
        cam_data.type = "PERSP"
        cam_data.lens = lens
    scene.render.filepath = os.path.join(OUT, f"render_{view}_{VER}.png")
    bpy.ops.render.render(write_still=True)
    print("RENDER:", scene.render.filepath)

# 460 mm tinggi + margin; ortho_scale = lebar bingkai (aspect 1.286 -> tinggi = w/1.286)
shoot("iso", (760, -720, 700), target=(0, 0, 220), lens=55)
shoot("front", (0, -1200, 230), target=(0, 0, 230), ortho=700)
shoot("side", (1200, -60, 230), target=(0, 0, 230), ortho=700)
shoot("interior", (330, -420, 950), target=(0, 15, 130), lens=40)

# ---- wireframe render (workbench)
scene.render.engine = "BLENDER_WORKBENCH"
sh = scene.display.shading
sh.type = "WIREFRAME"
sh.show_object_outline = False
sh.show_specular_highlight = False
try:
    sh.wireframe_color_type = "SINGLE"
    sh.single_color = (0.08, 0.08, 0.09)
    sh.background_type = "VIEWPORT"
    sh.background_color = (1.0, 1.0, 1.0)
except Exception as e:
    print("wireframe setting:", e)
shoot("wireframe_iso", (760, -720, 700), target=(0, 0, 220), lens=55)

# ---- simpan + eksport
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
