#!/usr/bin/env python3
"""Sinh file draw.io Robustness 2.2.4 — đúng icon UML (Actor, Boundary, Control, Entity)."""

from xml.sax.saxutils import escape

# (số, tiêu đề, actor, boundary×3, control, entity)
DIAGRAMS = [
    ("2.2.4.1", "Quản lý bệnh nhân", "Quản trị viên / Lễ tân", ("quan-ly-benh-nhan", "form-tao-moi", "form-cap-nhat"), "BenhNhanService", "BenhNhan"),
    ("2.2.4.2", "Quản lý lịch hẹn", "Quản trị viên / Lễ tân / Bệnh nhân", ("quan-ly-lich-hen", "form-dat-lich", "form-cap-nhat-lich"), "LichHenService", "LichHen"),
    ("2.2.4.3", "Quản lý hóa đơn & thanh toán", "Thu ngân / Lễ tân", ("quan-ly-hoa-don", "form-lap-hoa-don", "form-thanh-toan"), "HoaDonService", "HoaDon"),
    ("2.2.4.4", "Cấu hình nhắc lịch khám", "Quản trị viên / Lễ tân", ("cau-hinh-nhac-lich", "tab-cau-hinh-tu-dong", "form-luu-cau-hinh"), "NhacLichHenService", "CauHinhNhacLich"),
    ("2.2.4.5", "Nhắc lịch thủ công (gửi email)", "Quản trị viên / Lễ tân / Thu ngân", ("tab-nhac-thu-cong", "form-gui-email", "form-gui-hang-loat"), "NhacLichHenService", "LichHen"),
    ("2.2.4.6", "Quản lý bác sĩ", "Quản trị viên", ("quan-ly-bac-si", "form-tao-moi", "form-cap-nhat"), "BacSiService", "BacSi"),
    ("2.2.4.7", "Quản lý dịch vụ", "Quản trị viên", ("quan-ly-dich-vu", "form-tao-moi", "form-cap-nhat"), "DichVuService", "DichVu"),
    ("2.2.4.8", "Quản lý loại dịch vụ", "Quản trị viên", ("quan-ly-loai-dich-vu", "form-tao-moi", "form-cap-nhat"), "LoaiDichVuService", "LoaiDichVu"),
    ("2.2.4.9", "Quản lý chuyên khoa", "Quản trị viên", ("quan-ly-chuyen-khoa", "form-tao-moi", "form-cap-nhat"), "ChuyenKhoaService", "ChuyenKhoa"),
    ("2.2.4.10", "Quản lý tài khoản người dùng", "Quản trị viên", ("quan-ly-nguoi-dung", "form-tao-moi", "form-cap-nhat"), "NguoiDungService", "NguoiDung"),
    ("2.2.4.11", "Quản lý thuốc & đơn thuốc", "Quản trị viên / Bác sĩ", ("quan-ly-thuoc", "form-tao-moi", "form-cap-nhat"), "ThuocService", "Thuoc"),
    ("2.2.4.12", "Quản lý phiếu chi", "Quản trị viên / Thu ngân", ("quan-ly-phieu-chi", "form-tao-moi", "form-cap-nhat"), "PhieuChiService", "PhieuChi"),
    ("2.2.4.13", "Lịch làm việc bác sĩ", "Quản trị viên / Bác sĩ", ("lich-lam-viec-bac-si", "form-ca-co-dinh", "form-ngoai-le"), "LichLamViecBacSiService", "LichLamViecBacSi"),
    ("2.2.4.14", "Tro chuyện nội bộ", "Nhân viên nội bộ", ("tro-chuyen", "form-gui-tin", "form-dinh-kem-tep"), "TinNhanChatService", "TinNhanChat"),
]

ARROW = "startArrow=classic;endArrow=classic;html=1;strokeColor=#000000;strokeWidth=1;"


def boundary(cx: int, cy: int, label: str, pid: str) -> str:
    e = escape(label)
    return f"""
        <mxCell id="{pid}b" value="{e}" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="{cx}" y="{cy}" width="130" height="56" as="geometry" />
        </mxCell>
        <mxCell id="{pid}bl" value="" style="shape=line;direction=north;strokeColor=#000000;html=1;" vertex="1" parent="1">
          <mxGeometry x="{cx - 18}" y="{cy}" width="10" height="56" as="geometry" />
        </mxCell>"""


def control(cx: int, cy: int, label: str, pid: str) -> str:
    e = escape(label)
    ax = cx + 45
    return f"""
        <mxCell id="{pid}c" value="{e}" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="{cx}" y="{cy}" width="140" height="56" as="geometry" />
        </mxCell>
        <mxCell id="{pid}ca" style="endArrow=classic;html=1;curved=1;strokeColor=#000000;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="{ax}" y="{cy - 2}" as="sourcePoint" />
            <mxPoint x="{ax + 40}" y="{cy - 2}" as="targetPoint" />
            <Array as="points"><mxPoint x="{ax + 20}" y="{cy - 14}" /></Array>
          </mxGeometry>
        </mxCell>"""


def entity(cx: int, cy: int, label: str, pid: str) -> str:
    e = escape(label)
    return f"""
        <mxCell id="{pid}e" value="{e}" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="{cx}" y="{cy}" width="120" height="56" as="geometry" />
        </mxCell>
        <mxCell id="{pid}eu" value="" style="shape=line;strokeColor=#000000;html=1;" vertex="1" parent="1">
          <mxGeometry x="{cx}" y="{cy + 56}" width="120" height="8" as="geometry" />
        </mxCell>"""


def edge(eid: str, src: str, tgt: str) -> str:
    return f'<mxCell id="{eid}" style="{ARROW}" edge="1" parent="1" source="{src}" target="{tgt}"><mxGeometry relative="1" as="geometry" /></mxCell>'


def diagram_page(did: str, num: str, title: str, actor: str, boundaries: tuple, ctrl: str, ent: str, hinh: int) -> str:
    b_main, b_create, b_update = boundaries
    cap = f"Hình 2.{hinh}: Sơ đồ Robustness Usecase '{title}'"
    header = f"{num}. {title}"
    actor_e = escape(actor + "\n(from Usecase Diagram)")

    # Layout giống mẫu luận văn
    b_x, c_x, e_x = 240, 520, 780
    b_y = [100, 220, 340]
    c_y = 220
    e_y = 220

    cells = [
        f'<mxCell id="title" value="{escape(header)}" style="text;html=1;strokeColor=none;fillColor=none;align=left;fontSize=13;fontColor=#CC0000;fontStyle=1" vertex="1" parent="1"><mxGeometry x="40" y="20" width="600" height="30" as="geometry" /></mxCell>',
        f'<mxCell id="actor" value="{actor_e}" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fillColor=#ffffff;strokeColor=#000000;fontSize=10;" vertex="1" parent="1"><mxGeometry x="50" y="210" width="30" height="60" as="geometry" /></mxCell>',
        boundary(b_x, b_y[0], b_main, "b0"),
        boundary(b_x, b_y[1], b_create, "b1"),
        boundary(b_x, b_y[2], b_update, "b2"),
        control(c_x, c_y, ctrl, "ctl"),
        entity(e_x, e_y, ent, "ent"),
        edge("e_a_b0", "actor", "b0b"),
        edge("e_a_b1", "actor", "b1b"),
        edge("e_a_b2", "actor", "b2b"),
        edge("e_b0_c", "b0b", "ctlc"),
        edge("e_b1_c", "b1b", "ctlc"),
        edge("e_b2_c", "b2b", "ctlc"),
        edge("e_c_e", "ctlc", "ente"),
        f'<mxCell id="caption" value="{escape(cap)}" style="text;html=1;strokeColor=none;fillColor=none;align=center;fontSize=12;fontColor=#CC0000;fontStyle=1" vertex="1" parent="1"><mxGeometry x="40" y="440" width="900" height="30" as="geometry" /></mxCell>',
    ]

    body = "\n".join(cells)
    return f"""  <diagram id="{did}" name="{num} {title}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
{body}
      </root>
    </mxGraphModel>
  </diagram>"""


def main():
    pages = []
    hinh_start = 30
    for i, (num, title, actor, boundaries, ctrl, ent) in enumerate(DIAGRAMS):
        did = f"rb224_{i+1}"
        pages.append(diagram_page(did, num, title, actor, boundaries, ctrl, ent, hinh_start + i))

    content = "\n".join(pages)
    xml = f"""<mxfile host="app.diagrams.net" agent="clinic-datn" version="22.1.0" pages="{len(DIAGRAMS)}">
{content}
</mxfile>
"""
    out = "documents/Robustness_2_2_4_Medlatec.drawio"
    with open(out, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"Wrote {out} ({len(DIAGRAMS)} pages)")


if __name__ == "__main__":
    main()
